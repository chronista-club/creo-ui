/**
 * @chronista-club/creo-ui-editor-host — OKLCH utilities (Phase M6)
 *
 * creo-ui の color token は OKLCH literal (`oklch(l c h [/ a])`) で保持される。
 * ここはその parse / format と、L/C/H/A slider の track gradient 生成 (CSS の
 * `oklch()` をそのまま stop に使うので色空間変換の数学は不要 — browser が解釈)。
 *
 * scope 外 (v1): hex / rgb → OKLCH の変換。oklch 文字列でない color 値は
 * 既存の `<input type="color">` editor に fallback する。
 */

export interface Oklch {
  /** Lightness 0..1 */
  l: number
  /** Chroma 0.. (実用上 0.4 まで) */
  c: number
  /** Hue 0..360 (deg) */
  h: number
  /** Alpha 0..1 */
  a: number
}

/** slider / gradient で使う chroma の実用上限 (P3 でもほぼこの範囲) */
export const OKLCH_C_MAX = 0.4

const OKLCH_RE = /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*([\d.]+%?)\s*)?\)$/i

/**
 * `oklch(0.75 0.12 160)` / `oklch(75% 0.12 160deg / 0.5)` を parse。
 * oklch 形式でなければ null (呼び出し側が fallback を判断する)。
 */
export function parseOklch(value: string): Oklch | null {
  const m = value.trim().match(OKLCH_RE)
  if (!m) return null
  const percent = (raw: string): number =>
    raw.endsWith('%') ? Number.parseFloat(raw) / 100 : Number.parseFloat(raw)
  const l = percent(m[1])
  const c = Number.parseFloat(m[2])
  const h = Number.parseFloat(m[3])
  const a = m[4] === undefined ? 1 : percent(m[4])
  if (![l, c, h, a].every(Number.isFinite)) return null
  return { l, c, h, a }
}

/** 小数を桁数で丸めて末尾ゼロを落とす */
function round(value: number, digits: number): number {
  return Number(value.toFixed(digits))
}

/** Oklch → `oklch(l c h)` / alpha < 1 なら `oklch(l c h / a)` */
export function formatOklch(o: Oklch): string {
  const l = round(clamp(o.l, 0, 1), 4)
  const c = round(Math.max(0, o.c), 4)
  const h = round(((o.h % 360) + 360) % 360, 1)
  const a = round(clamp(o.a, 0, 1), 3)
  return a < 1 ? `oklch(${l} ${c} ${h} / ${a})` : `oklch(${l} ${c} ${h})`
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v))
}

export type OklchChannel = 'l' | 'c' | 'h' | 'a'

/**
 * channel slider の track 用 linear-gradient を生成。他 channel は現在値で固定、
 * 対象 channel だけ min→max に振った stop 列。stop は `oklch()` literal なので
 * browser が OKLCH 空間の色をそのまま描く。
 */
export function oklchTrackGradient(channel: OklchChannel, current: Oklch): string {
  const steps = channel === 'h' ? 12 : 6
  const stops: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const v: Oklch = { ...current, a: channel === 'a' ? t : 1 }
    if (channel === 'l') v.l = t
    else if (channel === 'c') v.c = t * OKLCH_C_MAX
    else if (channel === 'h') v.h = t * 360
    stops.push(`${formatOklch(v)} ${round(t * 100, 1)}%`)
  }
  return `linear-gradient(to right, ${stops.join(', ')})`
}
