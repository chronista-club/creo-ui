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
import { componentSelector, knobLabel, parseTweakVarName } from './component-id'
import { color, number } from './control'
import { cssVarNumberTarget, cssVarTarget } from './target'
import type { EditorHost, EditorScope, EditorSemantic } from './types'

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

function heuristicRange(value: number, unit = 'px'): { min: number; max: number; step: number } {
  // 値 20 なら 0-40、値 1.5 なら 0-3 ... みたいな簡単 heuristic。
  // rem / em は 1 の重みが px の 16 倍なので step も細かく — 0.5rem 刻みだと
  // 8px 飛びで slider にならない (owner 指摘 2026-08-14: btn pad-x 1.5rem)
  const relative = unit === 'rem' || unit === 'em'
  const abs = Math.abs(value)
  if (abs < 1) return { min: 0, max: 2, step: 0.05 }
  if (abs < 10) return { min: 0, max: value * 2 + 5, step: relative ? 0.1 : 0.5 }
  if (abs < 100) return { min: 0, max: value * 2 + 20, step: 1 }
  return { min: 0, max: value * 2 + 100, step: 10 }
}

export interface DiscoveredPlacement {
  label: string
  group?: string
  semantic: EditorSemantic
  order: number
  scope: EditorScope
  /** slider として意味を成さない sentinel 値 (px で 512 超) を除外する */
  skipSentinel?: boolean
}

/**
 * `DiscoveredVar` 1 個を、型に応じた Target × Control で bind する。
 *
 * F2 (token) / F2b (eager tweak) / F2c (選択駆動) の **共通経路**。値からの型推論と
 * Control の対応をここ 1 箇所に閉じ込めるので、どの経路から生えたノブも同じ挙動になる。
 */
export function bindDiscoveredVar(
  host: EditorHost,
  owner: Owner | null,
  d: DiscoveredVar,
  placement: DiscoveredPlacement,
): Binder | undefined {
  const run = <R>(fn: () => R): R | undefined =>
    owner ? (runWithOwner(owner, fn) as R | undefined) : fn()
  const { label, group, semantic, order, scope } = placement

  if (d.kind === 'color') {
    return run(() =>
      bind<string>({
        host,
        target: cssVarTarget(d.id, d.cssVar, d.value),
        control: color({ variant: 'picker' }),
        placement: { label, group, semantic, order, role: 'dev', scope },
      }),
    )
  }

  if (d.kind === 'number' && d.numericValue !== undefined) {
    const unit = d.unit || 'px'
    // radius.full (9999px) 等の sentinel は捨てずに操作可能な range へ丸める
    const { min, max, step, initial } = placement.skipSentinel
      ? sliderSpecFor(d.numericValue, unit)
      : { ...heuristicRange(d.numericValue, unit), initial: d.numericValue }
    return run(() =>
      bind<number>({
        host,
        target: cssVarNumberTarget(d.id, d.cssVar, initial, unit),
        control: number({ min, max, step, unit, variant: 'slider' }),
        placement: { label, group, semantic, order, role: 'dev', scope },
      }),
    )
  }

  // unknown kind は skip (readonly-text で expose もオプションだが混雑するので割愛)
  return undefined
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

  discovered.forEach((d, index) => {
    if (skipExisting && host.getField(d.id)) return
    const b = bindDiscoveredVar(host, owner, d, {
      label: d.id,
      semantic,
      order: orderStart + index,
      scope: 'token',
    })
    if (b) binders.push(b)
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

/**
 * fallback を computed 値まで解決 ('var(--spacing-s)' → '8px')。解決不能なら ''
 *
 * `scope` は **どの要素の computed style に対して解決するか**。既定は `:root` だが、
 * component 内でしか宣言されていない var — 例えば `--_btn-pad-y` の fallback である
 * `var(--_btn-size-pad-y)` は `.creo-btn` 側の宣言 — は `:root` では解決できない。
 * F2c は選択された要素を渡すので、そこで初めて正しい初期値が得られる。
 */
function resolveFallback(fallback: string, depth = 0, scope?: Element): string {
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
  const el = scope ?? document.documentElement
  const computed = getComputedStyle(el).getPropertyValue(name).trim()
  if (computed) return computed
  return inner ? resolveFallback(inner, depth + 1, scope) : ''
}

/** '--_badge-pad-x' → 'badge.pad.x' */
export function tweakVarToId(cssVar: string, prefix = TWEAK_PREFIX): string {
  return cssVar.slice(prefix.length).replace(/-/g, '.')
}

/**
 * '--_badge__pad-x' → { group: 'badge', label: 'Pad X' }
 *
 * 命名規約 `--_<component>__<knob>` を split するだけ (`component-id.ts`)。
 * 規約に合わない名前 (consumer 側の独自 var 等) は var 名全体を label にして
 * group 無しで置く — 捨てるより見えたほうがよい。
 */
export function tweakPlacement(
  cssVar: string,
  prefix = TWEAK_PREFIX,
): { group: string; label: string } {
  const parsed = parseTweakVarName(cssVar, prefix)
  if (!parsed) return { group: 'tweak', label: cssVar.slice(prefix.length) }
  return { group: parsed.component, label: knobLabel(parsed.knob) }
}

/** slider ノブとして意味を成す px の上限。radius.full = 9999px のような
    「実質 infinity」の sentinel は素の値のままではスライダーにならない */
const TWEAK_SLIDER_MAX_PX = 512

/**
 * sentinel を丸めた後の上限。CSS は border-radius を「短辺の半分」に clamp するので、
 * pill 用途の component (button ~40px / badge ~20px / avatar ≤64px / progress ≤12px)
 * では 128px と 9999px の見た目は同一 — 初期値をここへ丸めても表示は変わらず、
 * かつ 0 まで下げて角を落とせる。
 */
const TWEAK_SENTINEL_CLAMP_PX = 128

/** sentinel 値 (px で TWEAK_SLIDER_MAX_PX 超) かどうか */
function isSliderFriendly(numericValue: number, unit: string): boolean {
  if (unit === 'px' && Math.abs(numericValue) > TWEAK_SLIDER_MAX_PX) return false
  return true
}

/**
 * slider の range と初期値を決める。
 *
 * sentinel (radius.full = 9999px 等) は **捨てずに丸める**。以前は除外していたが、
 * それだと「button の丸み」という最も触りたいノブが panel から消えてしまう。
 */
export function sliderSpecFor(
  numericValue: number,
  unit: string,
): { min: number; max: number; step: number; initial: number } {
  if (!isSliderFriendly(numericValue, unit)) {
    return { min: 0, max: TWEAK_SENTINEL_CLAMP_PX, step: 1, initial: TWEAK_SENTINEL_CLAMP_PX }
  }
  return { ...heuristicRange(numericValue, unit), initial: numericValue }
}

/**
 * cssVar → fallback を集める。selectorText は **見ない** — どの component の
 * ノブかは var 名の規約 (`--_<component>__<knob>`) で決まるため
 * (`component-id.ts` 参照)。
 */
function collectTweakRefs(rules: CSSRuleList, prefix: string, seen: Map<string, string>): void {
  for (const rule of Array.from(rules)) {
    // media / supports / layer / CSS nesting は再帰
    const nested = (rule as { cssRules?: CSSRuleList }).cssRules
    if (nested && nested.length > 0) collectTweakRefs(nested, prefix, seen)
    const cssText = rule.cssText
    if (!cssText || !cssText.includes(`var(${prefix}`)) continue
    for (const ref of parseTweakVarRefs(cssText, prefix)) {
      // 最初に見つかった fallback を SSOT とみなす (使用箇所 = 宣言)
      if (!seen.has(ref.cssVar)) seen.set(ref.cssVar, ref.fallback)
    }
  }
}

/** 未解決の tweak var 参照 (fallback は生の CSS 文字列のまま) */
export interface RawTweakVar {
  cssVar: string
  /** 使用箇所に書かれた fallback 式 ('var(--spacing-s)' / '2px' / 'var(--_btn__size-pad-y)') */
  fallback: string
}

/**
 * document.styleSheets から tweak var 参照を列挙する (**解決も型推論もしない**)。
 *
 * fallback の解決先は「どの要素で見るか」に依存する (`--_btn-size-pad-y` は
 * `.creo-btn` 上でしか読めない) ので、解決は呼び出し側の責務にしてある。
 * F2c は選択要素、F2b は `:root` を scope にする。
 */
export function scanRawTweakVars(prefix = TWEAK_PREFIX): RawTweakVar[] {
  if (typeof document === 'undefined' || typeof getComputedStyle === 'undefined') return []
  const seen = new Map<string, string>()
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue // cross-origin stylesheet は読めない
    }
    collectTweakRefs(rules, prefix, seen)
  }
  return [...seen].map(([cssVar, fallback]) => ({ cssVar, fallback }))
}

/**
 * raw 参照 1 個を `scope` の computed style で解決し、型を推論する。
 * fallback が解決できなければ null (ノブにできない)。
 */
export function resolveTweakVar(
  raw: RawTweakVar,
  id: string,
  scope?: Element,
  prefix = TWEAK_PREFIX,
): DiscoveredVar | null {
  const resolved = resolveFallback(raw.fallback, 0, scope)
  if (!resolved) return null
  return { ...inferType(raw.cssVar, resolved), id: id || tweakVarToId(raw.cssVar, prefix) }
}

/** document.styleSheets から tweak var を列挙 (`:root` で fallback 解決 + type 推論込み) */
export function scanTweakVars(prefix = TWEAK_PREFIX): DiscoveredVar[] {
  const discovered: DiscoveredVar[] = []
  for (const raw of scanRawTweakVars(prefix)) {
    const info = resolveTweakVar(raw, tweakVarToId(raw.cssVar, prefix), undefined, prefix)
    if (info) discovered.push(info)
  }
  return discovered
}

/**
 * その component が現 DOM に居るか。命名規約のおかげで `.creo-<component>` を
 * 引くだけで済む (selector 群を舐める必要が無い)。規約外の var は fail-open。
 */
function isComponentPresent(cssVar: string, prefix: string): boolean {
  if (typeof document === 'undefined') return true
  const parsed = parseTweakVarName(cssVar, prefix)
  if (!parsed) return true
  try {
    return document.querySelector(componentSelector(parsed.component)) !== null
  } catch {
    return true
  }
}

/**
 * CSSOM の tweak var (`--_<component>__<knob>`) を scan して自動 bind する (F2b、eager)。
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
    (d) => !requirePresence || isComponentPresent(d.cssVar, prefix),
  )
  const binders: Binder[] = []

  discovered.forEach((d, index) => {
    if (skipExisting && host.getField(d.id)) return
    const { group, label } = tweakPlacement(d.cssVar, prefix)
    const b = bindDiscoveredVar(host, owner, d, {
      label,
      group,
      semantic,
      order: orderStart + index,
      scope: 'component',
      skipSentinel: true,
    })
    if (b) binders.push(b)
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
  isSliderFriendly,
}
