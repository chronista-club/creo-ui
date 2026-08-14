/**
 * @chronista-club/creo-ui-editor-host — 脱出ハッチ: class の任意 property override
 *
 * ノブ (宣言済み tweak var) に無い property が「気になった」とき、ツールから
 * 溢れて CSS ファイルへ戻らずに済むための第 2 の編集経路。
 *
 * - **読み**: 選択中 component の base rule (`.creo-<id>` 単独 selector) の
 *   CSS 宣言を CSSOM から列挙する (variant rule は対象外 — 上書き先と対応する
 *   宣言だけを見せる)
 * - **書き**: 注入 stylesheet の `.creo-<id> { prop: value }` — class 単位 =
 *   全 instance に効く。「選択の実体は class」の原則にそのまま乗る
 * - **トレードオフ**: ノブは `calc(var(--_x__y, …) * var(--density-…))` の式構造を
 *   保ったまま値だけ差し替えるが、ハッチは **式ごと上書き** する (density / scale
 *   連動はその property では切れる)。だから「まずノブ、無ければハッチ」
 * - 注入 rule は base rule と同 specificity (0,1,0) で後勝ち。variant rule
 *   (`[data-variant]` 等、0,2,0) が同じ property を張る場合はそちらが勝つ —
 *   これは base rule を直接編集したのと同じ、正直な cascade
 * - persistence は無し (梯子ノブと同じ調整セッション用)。export は
 *   `cssFor()` が返す rule block を copy して component CSS への変更提案にする
 */
import { createSignal } from 'solid-js'
import type { Accessor } from 'solid-js'
import { componentSelector } from './component-id'

export interface ClassDeclaration {
  /** 'font-weight' など。custom property (--*) は含まない */
  readonly property: string
  /** authored 値 ('var(--spacing-s)' / 'calc(…)' もそのまま) */
  readonly value: string
}

/**
 * `rule.style.cssText` を宣言の配列に割る (pure)。
 * `;` は括弧・引用符の外だけで区切り、`:` は最初の depth 0 のものを境界にする
 * (`url(data:…)` や `content: "›"` を壊さない)。custom property は除外する —
 * `--_x__y` は knob / token の管轄で、ハッチの対象は標準 property のみ。
 */
export function parseDeclarations(cssText: string): ClassDeclaration[] {
  const out: ClassDeclaration[] = []
  let depth = 0
  let quote: string | null = null
  let start = 0

  const push = (chunk: string): void => {
    const s = chunk.trim()
    if (!s) return
    let colon = -1
    let d = 0
    for (let i = 0; i < s.length; i++) {
      const ch = s[i]
      if (ch === '(') d++
      else if (ch === ')') d--
      else if (ch === ':' && d === 0) {
        colon = i
        break
      }
    }
    if (colon <= 0) return
    const property = s.slice(0, colon).trim()
    const value = s.slice(colon + 1).trim()
    if (!property || !value) return
    if (property.startsWith('--')) return
    out.push({ property, value })
  }

  for (let i = 0; i < cssText.length; i++) {
    const ch = cssText[i]
    if (quote) {
      if (ch === quote && cssText[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'") quote = ch
    else if (ch === '(') depth++
    else if (ch === ')') depth--
    else if (ch === ';' && depth === 0) {
      push(cssText.slice(start, i))
      start = i + 1
    }
  }
  push(cssText.slice(start))
  return out
}

/**
 * override map から注入 stylesheet の中身を組み立てる (pure)。
 * component ごとに 1 rule、挿入順を保つ。
 */
export function renderOverridesCss(
  overrides: Readonly<Record<string, Readonly<Record<string, string>>>>,
): string {
  const blocks: string[] = []
  for (const [componentId, props] of Object.entries(overrides)) {
    const entries = Object.entries(props)
    if (entries.length === 0) continue
    const body = entries.map(([p, v]) => `  ${p}: ${v};`).join('\n')
    blocks.push(`${componentSelector(componentId)} {\n${body}\n}`)
  }
  return blocks.join('\n\n')
}

/**
 * component の **base rule** (`.creo-<id>` が単独 subject の rule) の宣言を
 * CSSOM から集める。複数 rule に散っていれば cascade 順に merge (後勝ち)。
 */
export function readClassDeclarations(componentId: string): ClassDeclaration[] {
  if (typeof document === 'undefined') return []
  const selector = componentSelector(componentId)
  const merged = new Map<string, string>()

  const visit = (rules: CSSRuleList): void => {
    for (const rule of Array.from(rules)) {
      const nested = (rule as { cssRules?: CSSRuleList }).cssRules
      if (nested && nested.length > 0) visit(nested)
      const selectorText = (rule as CSSStyleRule).selectorText
      if (!selectorText) continue
      // comma 区切りの各 part が `.creo-<id>` 単独ならその rule は base rule。
      // `.creo-btn[data-variant]` / `.creo-btn:hover` 等の variant / state は
      // 上書き先 (base 相当) と対応しないので見せない
      const isBase = selectorText.split(',').some((p) => p.trim() === selector)
      if (!isBase) continue
      const style = (rule as CSSStyleRule).style
      if (!style) continue
      for (const d of parseDeclarations(style.cssText)) merged.set(d.property, d.value)
    }
  }

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules)
    } catch {
      // cross-origin stylesheet は読めない
    }
  }
  return [...merged.entries()].map(([property, value]) => ({ property, value }))
}

export interface ClassOverrides {
  /** componentId → { property: value } (reactive) */
  readonly overrides: Accessor<Record<string, Record<string, string>>>
  set(componentId: string, property: string, value: string): void
  remove(componentId: string, property: string): void
  /** その component の override を CSS rule block として返す (copy / export 用) */
  cssFor(componentId: string): string
  /** 注入 stylesheet を除去して全 override を破棄 (provider の cleanup 用) */
  dispose(): void
}

/** 注入 stylesheet 込みの override 管理を作る。provider が 1 個生成して context で配る */
export function createClassOverrides(): ClassOverrides {
  const [overrides, setOverrides] = createSignal<Record<string, Record<string, string>>>({})
  let sheet: HTMLStyleElement | null = null

  const applyToSheet = (next: Record<string, Record<string, string>>): void => {
    if (typeof document === 'undefined') return
    if (!sheet) {
      sheet = document.createElement('style')
      sheet.setAttribute('data-editor-overrides', '')
      document.head.appendChild(sheet)
    }
    sheet.textContent = renderOverridesCss(next)
  }

  return {
    overrides,
    set(componentId, property, value) {
      const next = { ...overrides() }
      next[componentId] = { ...next[componentId], [property]: value }
      setOverrides(next)
      applyToSheet(next)
    },
    remove(componentId, property) {
      const next = { ...overrides() }
      if (!next[componentId]) return
      const { [property]: _removed, ...rest } = next[componentId]
      next[componentId] = rest
      setOverrides(next)
      applyToSheet(next)
    },
    cssFor(componentId) {
      const props = overrides()[componentId]
      if (!props || Object.keys(props).length === 0) return ''
      return renderOverridesCss({ [componentId]: props })
    },
    dispose() {
      sheet?.remove()
      sheet = null
      setOverrides({})
    },
  }
}
