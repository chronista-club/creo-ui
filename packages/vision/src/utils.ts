/**
 * Vision utility — 純粋関数群 (DOM / inference 依存なし、 unit test 可能)。
 */

import type { Point3D } from './types'

/** 2 点間の Euclidean distance (3D) */
export function distance3D(a: Point3D, b: Point3D): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/** 2 点間の 2D distance (z 無視) */
export function distance2D(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Pinch active 判定 — thumb tip と index tip の距離が threshold 未満なら active。
 * threshold は normalized viewport 座標 (0-1) なので、 0.04 ≒ 画面幅の 4%。
 */
export function isPinchActive(
  thumbTip: Point3D,
  indexTip: Point3D,
  threshold = 0.04,
): boolean {
  return distance3D(thumbTip, indexTip) < threshold
}

/** Pinch 中心 (thumb と index の中点) */
export function pinchCenter(thumbTip: Point3D, indexTip: Point3D): Point3D {
  return {
    x: (thumbTip.x + indexTip.x) / 2,
    y: (thumbTip.y + indexTip.y) / 2,
    z: (thumbTip.z + indexTip.z) / 2,
  }
}

/** Angle を [-180, 180] に正規化 */
export function normalizeAngle(deg: number): number {
  let n = deg % 360
  if (n > 180) n -= 360
  if (n < -180) n += 360
  return n
}

/**
 * Number を [min, max] にクランプ。
 * confidence 値 ([0, 1]) や angle 制限で使用。
 */
export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}

/** Normalized [0, 1] 座標を viewport pixel に変換 */
export function toViewportPixel(
  normalized: number,
  viewportSize: number,
): number {
  return clamp(normalized, 0, 1) * viewportSize
}
