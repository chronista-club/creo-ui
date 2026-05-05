/**
 * Motion token bridge — creo-ui-web の motion CSS variable と runtime API を繋ぐ。
 *
 * 2 つの取得経路:
 *   - 静的: `ease('spring')` / `duration('normal')` — hardcode 値、 SSR / test 等で安全
 *   - CSS 由来: `easeFromCss('spring')` / `durationFromCss('normal')` — runtime
 *     に CSS variable を読む (theme 切替 / consumer override に追従)
 */

export type EasingName = 'linear' | 'in' | 'out' | 'in-out' | 'spring'
export type DurationName = 'instant' | 'fast' | 'normal' | 'slow' | 'lazy'

const EASING_VALUES: Record<EasingName, string> = {
  linear: 'linear',
  in: 'cubic-bezier(0.4, 0, 1, 1)',
  out: 'cubic-bezier(0, 0, 0.2, 1)',
  'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
}

const DURATION_VALUES: Record<DurationName, number> = {
  instant: 80,
  fast: 160,
  normal: 220,
  slow: 320,
  lazy: 480,
}

/** Easing name → cubic-bezier (静的、 hardcode 値)。 SSR / test で確実 */
export function ease(name: EasingName): string {
  return EASING_VALUES[name]
}

/** Duration name → ms (静的、 hardcode 値)。 SSR / test で確実 */
export function duration(name: DurationName): number {
  return DURATION_VALUES[name]
}

/**
 * Easing を CSS variable から runtime 取得。 consumer が `--motion-easing-*` を
 * override していれば追従。 Browser (document) が無い環境では fallback で hardcode。
 */
export function easeFromCss(name: EasingName): string {
  if (typeof document === 'undefined') return EASING_VALUES[name]
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(`--motion-easing-${name}`)
    .trim()
  return v || EASING_VALUES[name]
}

/**
 * Duration を CSS variable から runtime 取得 (ms 数値)。 consumer が `--motion-duration-*`
 * を override していれば追従。 Browser (document) が無い環境では fallback。
 *
 * CSS variable は文字列なので 'ms' 単位を strip して number に変換。
 */
export function durationFromCss(name: DurationName): number {
  if (typeof document === 'undefined') return DURATION_VALUES[name]
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(`--motion-duration-${name}`)
    .trim()
  if (!raw) return DURATION_VALUES[name]
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : DURATION_VALUES[name]
}
