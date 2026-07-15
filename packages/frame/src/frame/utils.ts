/**
 * Frame system — pure utility functions。
 *
 * Provider / Slot から呼ばれる純粋関数群。 DOM access なし、 unit test で検証可能。
 */

import type { Gaze, SlotPlacement } from './types'

/** デフォルト placement (未配置 slot 用) */
export const DEFAULT_PLACEMENT: Readonly<SlotPlacement> = Object.freeze({
  x: 0,
  y: 0,
  z: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  scale: 1,
  opacity: 1,
})

/**
 * `number | string | undefined` を CSS length string に正規化。
 * - number → `{n}px`
 * - string → そのまま (`50%` `var(--x)` 等)
 * - undefined → `0`
 */
export function formatLength(value: number | string | undefined): string {
  if (value === undefined) return '0'
  if (typeof value === 'number') return `${value}px`
  return value
}

/**
 * Placement を CSS `transform` 文字列に build。
 *
 * 順序: translate3d → rotateX → rotateY → rotateZ → scale。 transform-origin は
 * default (50% 50% 0) を想定、 必要なら caller 側で別指定。
 */
export function buildTransformString(p: SlotPlacement): string {
  const x = formatLength(p.x)
  const y = formatLength(p.y)
  const z = formatLength(p.z)
  const rx = p.rotateX ?? 0
  const ry = p.rotateY ?? 0
  const rz = p.rotateZ ?? 0
  const sc = p.scale ?? 1
  return (
    `translate3d(${x}, ${y}, ${z})` +
    ` rotateX(${rx}deg)` +
    ` rotateY(${ry}deg)` +
    ` rotateZ(${rz}deg)` +
    ` scale(${sc})`
  )
}

/**
 * Default placement と override を merge (override 優先)。 deep merge ではなく
 * shallow override (placement は flat 構造なので shallow で十分)。
 */
export function mergePlacement(
  base: SlotPlacement,
  override: SlotPlacement | undefined,
): SlotPlacement {
  if (!override) return base
  return { ...base, ...override }
}

/**
 * Perspective を CSS length string に正規化。
 * - number → `{n}px`
 * - string → そのまま
 * - undefined → `var(--frame-perspective-default)` (token fallback)
 */
export function formatPerspective(value: number | string | undefined): string {
  if (value === undefined) return 'var(--frame-perspective-default, 1400px)'
  if (typeof value === 'number') return `${value}px`
  return value
}

/** Default gaze (視点は画面中央) — CSS perspective-origin の初期値と一致 */
export const DEFAULT_GAZE: Readonly<Gaze> = Object.freeze({ x: '50%', y: '50%' })

/**
 * Gaze の 1 軸 (x or y) を CSS <position> component に正規化。
 * - number → `{n}px`
 * - string → そのまま (`50%` `var(--x)` 等)
 * - undefined → fallback (default '50%')
 */
function formatGazeAxis(value: number | string | undefined, fallback: string): string {
  if (value === undefined) return fallback
  if (typeof value === 'number') return `${value}px`
  return value
}

/**
 * Gaze を CSS `perspective-origin` 文字列 (`{x} {y}`) に build。
 * gaze 自体が undefined、または軸が欠けていれば中央 (50%) に fallback。
 */
export function formatGaze(gaze: Gaze | undefined): string {
  const x = formatGazeAxis(gaze?.x, '50%')
  const y = formatGazeAxis(gaze?.y, '50%')
  return `${x} ${y}`
}
