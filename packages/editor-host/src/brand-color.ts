/**
 * @chronista-club/creo-ui-editor-host — global color knob (hue / chroma per var 族)
 *
 * theme の OKLCH var 族 (brand 系 8 var / surface 系 8 var) を一括で回す global
 * ノブ (決まった値を theme preset へ焼くための道具。値の永続は field 側の
 * persistence: 'localStorage' に乗る — 本 module は storage を知らない)。
 *
 * - **hue**: 絶対値スライダー → 「基準 var の h との差分」を族の全 var に適用。
 *   contrast theme のように複数 hue を持つ family でも相対関係が保たれる
 * - **chroma**: 倍率 (×)。l (明度) は敢えて触らない — light/dark のコントラスト
 *   設計を壊さないため
 * - 書き込みは documentElement の inline style (theme rule より強い)。ノブが中立
 *   (差分 0 かつ倍率 1) に戻ったら removeProperty して theme 切替への追従を返す
 */

export interface OklchColor {
  readonly l: number
  readonly c: number
  readonly h: number
  /** 省略 = 不透明 */
  readonly alpha?: number
}

/** token emit が使う brand 系 var (tokens/color/themes/*.json の brand.*) */
export const BRAND_COLOR_VARS = [
  '--color-brand-primary',
  '--color-brand-primary-hover',
  '--color-brand-primary-active',
  '--color-brand-primary-subtle',
  '--color-brand-secondary',
  '--color-brand-secondary-hover',
  '--color-brand-secondary-active',
  '--color-brand-secondary-subtle',
] as const

/** surface 系 var (背景 / 面 / 罫線 / scrim)。scrim は alpha 付き — parse が対応 */
export const SURFACE_COLOR_VARS = [
  '--color-surface-bg-base',
  '--color-surface-bg-subtle',
  '--color-surface-bg-emphasis',
  '--color-surface-surface',
  '--color-surface-border',
  '--color-surface-border-subtle',
  '--color-surface-scrim',
  '--color-surface-scrim-modal',
] as const

const OKLCH_RE = /^oklch\(\s*(-?[\d.]+%?)\s+(-?[\d.]+)\s+(-?[\d.]+)(?:\s*\/\s*(-?[\d.]+%?))?\s*\)$/

const num = (raw: string): number =>
  raw.endsWith('%') ? Number.parseFloat(raw) / 100 : Number.parseFloat(raw)

/** `oklch(l c h [/ a])` literal を parse する。他形式 (hex / color-mix 等) は null */
export function parseOklch(value: string): OklchColor | null {
  const m = OKLCH_RE.exec(value.trim())
  if (!m) return null
  const color: OklchColor = { l: num(m[1]), c: num(m[2]), h: Number.parseFloat(m[3]) }
  if (m[4] !== undefined) return { ...color, alpha: num(m[4]) }
  return color
}

const round = (x: number): number => Number(x.toFixed(4))

export function formatOklch(color: OklchColor): string {
  const base = `${round(color.l)} ${round(color.c)} ${round(color.h)}`
  return color.alpha === undefined ? `oklch(${base})` : `oklch(${base} / ${round(color.alpha)})`
}

/** hue を差分で回し (0-360 に wrap)、chroma に倍率を掛ける (負にはしない) */
export function adjustOklch(color: OklchColor, hueShift: number, chromaScale: number): OklchColor {
  const h = (((color.h + hueShift) % 360) + 360) % 360
  const c = Math.max(0, color.c * chromaScale)
  return { ...color, h, c }
}

export interface OklchColorControl {
  /** slider の initial に使う、基準 var の現 theme hue */
  readonly baseHue: number
  setHue(absoluteHue: number): void
  setChromaScale(scale: number): void
}

/** mint (default theme) の brand hue — SSR / 値が読めない環境の fallback */
const FALLBACK_HUE = 160

/**
 * OKLCH var 族 1 組のノブ制御を作る。
 * @param vars 回す var 名の族 (BRAND_COLOR_VARS / SURFACE_COLOR_VARS)
 * @param baseVar hue スライダーの基準にする var (族の代表)
 */
export function createOklchColorControl(
  vars: readonly string[],
  baseVar: string,
): OklchColorControl {
  let baseHue = FALLBACK_HUE
  if (typeof document !== 'undefined') {
    const raw = getComputedStyle(document.documentElement).getPropertyValue(baseVar)
    const parsed = parseOklch(raw)
    if (parsed) baseHue = parsed.h
  }

  // 基準色はノブが初めて中立を離れた瞬間に capture (中立のうちは :root を触らない)。
  // 以降は capture 済みの値から毎回計算する — 上書き済み inline 値を再読みすると
  // 差分が二重に掛かるため
  let bases: ReadonlyMap<string, OklchColor> | null = null
  let hueShift = 0
  let chromaScale = 1

  const capture = (): ReadonlyMap<string, OklchColor> => {
    const map = new Map<string, OklchColor>()
    const style = getComputedStyle(document.documentElement)
    for (const name of vars) {
      const parsed = parseOklch(style.getPropertyValue(name))
      if (parsed) map.set(name, parsed)
    }
    return map
  }

  const writeAll = (): void => {
    if (typeof document === 'undefined') return
    const rootStyle = document.documentElement.style
    if (hueShift === 0 && chromaScale === 1) {
      for (const name of vars) rootStyle.removeProperty(name)
      return
    }
    // stylesheet 未 load 等で空振りした capture は cache しない (次回また試す) —
    // localStorage 復元は register 直後 = load 競合しうるタイミングで走るため
    if (!bases || bases.size === 0) bases = capture()
    for (const [name, color] of bases) {
      rootStyle.setProperty(name, formatOklch(adjustOklch(color, hueShift, chromaScale)))
    }
  }

  return {
    baseHue,
    setHue(absoluteHue) {
      hueShift = absoluteHue - baseHue
      writeAll()
    },
    setChromaScale(scale) {
      chromaScale = scale
      writeAll()
    },
  }
}
