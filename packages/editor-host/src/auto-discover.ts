/**
 * @chronista-club/creoui-editor-host — DOM auto-discover (F2)
 *
 * 現 page の :root CSS 変数を scan、値から type を infer して Target + Control
 * の組合せで自動 bind する。明示 declare 無しに live editing を始められる。
 *
 * 使用例:
 *   creoEditor.autoDiscover()                              // default prefixes
 *   creoEditor.autoDiscover({ prefixes: ['--color-'] })    // 色だけ
 *
 * default prefixes (creoui 0.1.0 の tokens.css を想定):
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

export const __test__ = { scanCssVars, inferType, cssVarToId, heuristicRange }
