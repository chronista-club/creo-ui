/**
 * @chronista-club/creo-ui-editor-host — DOM auto-discover (F2)
 *
 * 現 page の :root CSS 変数を scan、値から type を infer して Target + Control
 * の組合せで自動 bind する。明示 declare 無しに live editing を始められる。
 *
 * 使用例:
 *   creoEditor.autoDiscover()                              // default prefixes
 *   creoEditor.autoDiscover({ prefixes: ['--color-'] })    // 色だけ
 *
 * default prefixes (creo-ui 0.1.0 の tokens.css を想定):
 *   --color-, --spacing-, --radius-, --typography-size-
 */
import { type Owner, runWithOwner } from 'solid-js'
import { type Binder, bind } from './binder'
import { color, number } from './control'
import { cssVarNumberTarget, cssVarTarget } from './target'
import type { EditorHost, EditorSemantic } from './types'

const DEFAULT_PREFIXES = [
  '--color-',
  '--spacing-',
  '--margin-',
  '--radius-',
  '--typography-size-',
  '--typography-display-',
] as const

const COLOR_PATTERN = /^(#[0-9a-fA-F]{3,8}|rgb|hsl|oklch|oklab|color\()/
const NUMBER_WITH_UNIT_PATTERN = /^(-?\d+(?:\.\d+)?)(px|em|rem|%|s|ms)?$/

export interface AutoDiscoverOptions {
  /** どの CSS var prefix を拾うか (default: 4 種) */
  prefixes?: readonly string[]
  /** 配置 (default: 'tool') */
  semantic?: EditorSemantic
  /** 既に register 済みの id は skip (default: true) */
  skipExisting?: boolean
  /** field.order の start (default: 1000、既存 0-99 と衝突しない) */
  placementOrderStart?: number
}

export interface DiscoveredVar {
  cssVar: string // '--color-brand-primary'
  id: string // 'color.brand.primary'
  value: string // computed style の raw 値
  kind: 'color' | 'number' | 'unknown'
  numericValue?: number
  unit?: string
  /** tweak var (F2b) の使用 rule の selector 群 — DOM presence 判定に使う */
  selectors?: string[]
}

/** :root の computed style から prefix match の CSS var を列挙 */
export function scanCssVars(prefixes: readonly string[] = DEFAULT_PREFIXES): DiscoveredVar[] {
  if (typeof document === 'undefined' || typeof getComputedStyle === 'undefined') {
    return []
  }
  const style = getComputedStyle(document.documentElement)
  const discovered: DiscoveredVar[] = []
  const seen = new Set<string>()

  for (let i = 0; i < style.length; i++) {
    const cssVar = style.item(i)
    if (!cssVar.startsWith('--')) continue
    if (!prefixes.some((p) => cssVar.startsWith(p))) continue
    if (seen.has(cssVar)) continue
    seen.add(cssVar)

    const raw = style.getPropertyValue(cssVar).trim()
    if (!raw) continue

    const info = inferType(cssVar, raw)
    discovered.push(info)
  }

  return discovered
}

function inferType(cssVar: string, raw: string): DiscoveredVar {
  const id = cssVarToId(cssVar)
  if (COLOR_PATTERN.test(raw)) {
    return { cssVar, id, value: raw, kind: 'color' }
  }
  const numMatch = raw.match(NUMBER_WITH_UNIT_PATTERN)
  if (numMatch) {
    return {
      cssVar,
      id,
      value: raw,
      kind: 'number',
      numericValue: Number.parseFloat(numMatch[1]),
      unit: numMatch[2] ?? '',
    }
  }
  return { cssVar, id, value: raw, kind: 'unknown' }
}

/** '--color-brand-primary' → 'color.brand.primary' */
function cssVarToId(cssVar: string): string {
  return cssVar.replace(/^--/, '').replace(/-/g, '.')
}

function heuristicRange(value: number): { min: number; max: number; step: number } {
  // 値 20 なら 0-40、値 1.5 なら 0-3 ... みたいな簡単 heuristic
  const abs = Math.abs(value)
  if (abs < 1) return { min: 0, max: 2, step: 0.05 }
  if (abs < 10) return { min: 0, max: value * 2 + 5, step: 0.5 }
  if (abs < 100) return { min: 0, max: value * 2 + 20, step: 1 }
  return { min: 0, max: value * 2 + 100, step: 10 }
}

/**
 * 現 DOM の CSS 変数を scan、適切な Target + Control で bind する。
 * 成功した binder の配列を返す。
 *
 * owner: provider の getOwner() を渡すと console / effect 経由で呼ばれる時の
 * SolidJS context が維持される (重要: 呼び出し元の runWithOwner でも同等)。
 */
export function autoDiscover(
  host: EditorHost,
  owner: Owner | null,
  opts: AutoDiscoverOptions = {},
): Binder[] {
  const prefixes = opts.prefixes ?? DEFAULT_PREFIXES
  const semantic = opts.semantic ?? 'tool'
  const skipExisting = opts.skipExisting ?? true
  const orderStart = opts.placementOrderStart ?? 1000

  const discovered = scanCssVars(prefixes)
  const binders: Binder[] = []

  const run = <R>(fn: () => R): R | undefined =>
    owner ? (runWithOwner(owner, fn) as R | undefined) : fn()

  discovered.forEach((d, index) => {
    if (skipExisting && host.getField(d.id)) return

    const label = d.id
    const order = orderStart + index

    if (d.kind === 'color') {
      const b = run(() =>
        bind<string>({
          host,
          target: cssVarTarget(d.id, d.cssVar, d.value),
          control: color({ variant: 'picker' }),
          placement: { label, semantic, order, role: 'dev' },
        }),
      )
      if (b) binders.push(b)
      return
    }

    if (d.kind === 'number' && d.numericValue !== undefined) {
      const range = heuristicRange(d.numericValue)
      const b = run(() =>
        bind<number>({
          host,
          target: cssVarNumberTarget(d.id, d.cssVar, d.numericValue as number, d.unit || 'px'),
          control: number({ ...range, unit: d.unit || 'px', variant: 'slider' }),
          placement: { label, semantic, order, role: 'dev' },
        }),
      )
      if (b) binders.push(b)
      return
    }

    // unknown kind は skip (readonly-text で expose もオプションだが混雑するので割愛)
  })

  return binders
}

// ---------- F2b: private tweak var auto-discover (--_component-knob) ----------
//
// component CSS の private tweak var 規約 (creo-ui 側はこの規約 1 個のみ):
//
//   .creo-badge {
//     padding: var(--_badge-pad-y, 2px) var(--_badge-pad-x, var(--spacing-s));
//   }
//
// `--_<component>-<knob>` + fallback (= SSOT 値) で書かれた **使用箇所** を
// CSSOM (document.styleSheets) から発見し、fallback を解決した値を初期値として
// 自動 bind する。manifest / per-page bind は不要。書き込み先は :root なので
// 「その component 全 instance」に効く (= component-type scope)。

const TWEAK_PREFIX = '--_'

export interface TweakVarRef {
  cssVar: string // '--_badge-pad-x'
  fallback: string // 'var(--spacing-s)' / '2px'
}

export interface TweakDiscoverOptions {
  /** tweak var の prefix (default: '--_') */
  prefix?: string
  /** 配置 (default: 'tool') */
  semantic?: EditorSemantic
  /** 既に register 済みの id は skip (default: true) */
  skipExisting?: boolean
  /** field.order の start (default: 500、token autoDiscover の 1000 より前) */
  placementOrderStart?: number
  /**
   * 使用 rule の selector が現 DOM に居る component のノブだけ bind する
   * (default: true)。stylesheet は bundle 全体なので、これが無いと画面に
   * 存在しない component のノブまで panel に並ぶ。
   */
  requirePresence?: boolean
}

/** cssText 中の `var(--_x, fallback)` を括弧バランスで抽出 (pure、nested var 対応) */
export function parseTweakVarRefs(cssText: string, prefix = TWEAK_PREFIX): TweakVarRef[] {
  const refs: TweakVarRef[] = []
  let from = 0
  while (true) {
    const start = cssText.indexOf('var(', from)
    if (start === -1) break
    let depth = 1
    let comma = -1
    let j = start + 4
    while (j < cssText.length && depth > 0) {
      const ch = cssText[j]
      if (ch === '(') depth++
      else if (ch === ')') depth--
      else if (ch === ',' && depth === 1 && comma === -1) comma = j
      j++
    }
    const end = j - 1 // 対応する ')'
    const name = cssText.slice(start + 4, comma === -1 ? end : comma).trim()
    const fallback = comma === -1 ? '' : cssText.slice(comma + 1, end).trim()
    if (name.startsWith(prefix) && fallback) refs.push({ cssVar: name, fallback })
    from = start + 4 // fallback 内の nested var() も走査する
  }
  return refs
}

/** fallback を computed 値まで解決 ('var(--spacing-s)' → '8px')。解決不能なら '' */
function resolveFallback(fallback: string, depth = 0): string {
  const fb = fallback.trim()
  if (!fb.startsWith('var(')) return fb
  if (depth > 4 || typeof getComputedStyle === 'undefined') return ''
  // var(--name[, inner]) を分解
  let parenDepth = 1
  let comma = -1
  let j = 4
  while (j < fb.length && parenDepth > 0) {
    const ch = fb[j]
    if (ch === '(') parenDepth++
    else if (ch === ')') parenDepth--
    else if (ch === ',' && parenDepth === 1 && comma === -1) comma = j
    j++
  }
  const end = j - 1
  const name = fb.slice(4, comma === -1 ? end : comma).trim()
  const inner = comma === -1 ? '' : fb.slice(comma + 1, end).trim()
  const computed = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (computed) return computed
  return inner ? resolveFallback(inner, depth + 1) : ''
}

/** '--_badge-pad-x' → 'badge.pad.x' */
function tweakVarToId(cssVar: string, prefix = TWEAK_PREFIX): string {
  return cssVar.slice(prefix.length).replace(/-/g, '.')
}

/** '--_badge-pad-x' → { group: 'badge', label: 'Pad X' } */
function tweakPlacement(cssVar: string, prefix = TWEAK_PREFIX): { group: string; label: string } {
  const segments = cssVar.slice(prefix.length).split('-')
  const group = segments[0] ?? 'tweak'
  const rest = segments.slice(1)
  const label = (rest.length > 0 ? rest : segments)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  return { group, label }
}

interface TweakSeenEntry {
  fallback: string
  selectors: Set<string>
}

function collectTweakRefs(
  rules: CSSRuleList,
  prefix: string,
  seen: Map<string, TweakSeenEntry>,
): void {
  for (const rule of Array.from(rules)) {
    // media / supports / layer / CSS nesting は再帰
    const nested = (rule as { cssRules?: CSSRuleList }).cssRules
    if (nested && nested.length > 0) collectTweakRefs(nested, prefix, seen)
    const cssText = rule.cssText
    if (!cssText || !cssText.includes(`var(${prefix}`)) continue
    const selector = (rule as { selectorText?: string }).selectorText
    for (const ref of parseTweakVarRefs(cssText, prefix)) {
      const entry = seen.get(ref.cssVar)
      if (entry) {
        if (selector) entry.selectors.add(selector)
      } else {
        // 最初に見つかった fallback を SSOT とみなす (使用箇所 = 宣言)
        seen.set(ref.cssVar, {
          fallback: ref.fallback,
          selectors: new Set(selector ? [selector] : []),
        })
      }
    }
  }
}

/** document.styleSheets から tweak var を列挙 (fallback 解決 + type 推論込み) */
export function scanTweakVars(prefix = TWEAK_PREFIX): DiscoveredVar[] {
  if (typeof document === 'undefined' || typeof getComputedStyle === 'undefined') return []
  const seen = new Map<string, TweakSeenEntry>()
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue // cross-origin stylesheet は読めない
    }
    collectTweakRefs(rules, prefix, seen)
  }
  const discovered: DiscoveredVar[] = []
  for (const [cssVar, entry] of seen) {
    const resolved = resolveFallback(entry.fallback)
    if (!resolved) continue
    const info = inferType(cssVar, resolved)
    discovered.push({
      ...info,
      id: tweakVarToId(cssVar, prefix),
      selectors: Array.from(entry.selectors),
    })
  }
  return discovered
}

/** selector のどれかが現 DOM に存在するか (不正 selector は fail-open) */
function anySelectorPresent(selectors: readonly string[]): boolean {
  if (typeof document === 'undefined') return true
  for (const sel of selectors) {
    try {
      if (document.querySelector(sel)) return true
    } catch {
      return true
    }
  }
  return false
}

/**
 * CSSOM の tweak var (`--_component-knob`) を scan して自動 bind する。
 * group = component 名で panel に固まって表示される。
 */
export function autoDiscoverTweaks(
  host: EditorHost,
  owner: Owner | null,
  opts: TweakDiscoverOptions = {},
): Binder[] {
  const prefix = opts.prefix ?? TWEAK_PREFIX
  const semantic = opts.semantic ?? 'tool'
  const skipExisting = opts.skipExisting ?? true
  const orderStart = opts.placementOrderStart ?? 500
  const requirePresence = opts.requirePresence ?? true

  // presence filter: 画面に居ない component のノブは panel に出さない
  const discovered = scanTweakVars(prefix).filter(
    (d) =>
      !requirePresence ||
      !d.selectors ||
      d.selectors.length === 0 ||
      anySelectorPresent(d.selectors),
  )
  const binders: Binder[] = []

  const run = <R>(fn: () => R): R | undefined =>
    owner ? (runWithOwner(owner, fn) as R | undefined) : fn()

  discovered.forEach((d, index) => {
    if (skipExisting && host.getField(d.id)) return

    const { group, label } = tweakPlacement(d.cssVar, prefix)
    const order = orderStart + index

    if (d.kind === 'color') {
      const b = run(() =>
        bind<string>({
          host,
          target: cssVarTarget(d.id, d.cssVar, d.value),
          control: color({ variant: 'picker' }),
          placement: { label, group, semantic, order, role: 'dev' },
        }),
      )
      if (b) binders.push(b)
      return
    }

    if (d.kind === 'number' && d.numericValue !== undefined) {
      const range = heuristicRange(d.numericValue)
      const b = run(() =>
        bind<number>({
          host,
          target: cssVarNumberTarget(d.id, d.cssVar, d.numericValue as number, d.unit || 'px'),
          control: number({ ...range, unit: d.unit || 'px', variant: 'slider' }),
          placement: { label, group, semantic, order, role: 'dev' },
        }),
      )
      if (b) binders.push(b)
    }
  })

  return binders
}

export const __test__ = {
  scanCssVars,
  inferType,
  cssVarToId,
  heuristicRange,
  parseTweakVarRefs,
  resolveFallback,
  tweakVarToId,
  tweakPlacement,
}
