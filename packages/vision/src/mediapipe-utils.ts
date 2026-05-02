/**
 * MediaPipe-specific pure utilities — Math 寄りで testable な helper を分離。
 *
 * mediapipe.ts は dynamic import + DOM access が絡んで unit test 困難なので、
 * 数学的な部分はここに切り出して bun test で検証する。
 */

import type { Point3D } from './types'

/**
 * 3D vector を unit length に正規化。
 * 入力が zero vector の時は zero vector を返す (NaN 回避)。
 */
export function normalizeVector(v: Point3D): Point3D {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
  if (len === 0) return { x: 0, y: 0, z: 0 }
  return { x: v.x / len, y: v.y / len, z: v.z / len }
}

/**
 * 4x4 transformation matrix (column-major Float32Array、 length 16) を
 * Tait-Bryan Euler angles (pitch / yaw / roll、 deg) に変換。
 *
 * MediaPipe Face Landmarker は `outputFacialTransformationMatrixes: true` で
 * column-major 4x4 を返す ([0,0,0,1] 同次変換)。
 *
 * 慣例:
 *   - pitch = X 軸回転 (頷き、 + が下向き)
 *   - yaw   = Y 軸回転 (首振り、 + が右向き)
 *   - roll  = Z 軸回転 (傾き、 + が右肩下がり)
 *
 * ZYX 順 (yaw → pitch → roll) を仮定。 device で angle が反転して見える場合は
 * 単独 axis の符号を反転。
 */
export function matrixToEuler(matrix: ArrayLike<number>): {
  pitch: number
  yaw: number
  roll: number
} {
  // Column-major 4x4: matrix[col * 4 + row]
  const r13 = matrix[8] ?? 0 // M[0][2]
  const r21 = matrix[1] ?? 0 // M[1][0]
  const r22 = matrix[5] ?? 1 // M[1][1]
  const r23 = matrix[9] ?? 0 // M[1][2]
  const r33 = matrix[10] ?? 1 // M[2][2]

  const RAD_TO_DEG = 180 / Math.PI
  return {
    pitch: Math.asin(clampToRange(-r23, -1, 1)) * RAD_TO_DEG,
    yaw: Math.atan2(r13, r33) * RAD_TO_DEG,
    roll: Math.atan2(r21, r22) * RAD_TO_DEG,
  }
}

/** asin の domain 安全用 (浮動小数点誤差対策) */
function clampToRange(v: number, min: number, max: number): number {
  if (v < min) return min
  if (v > max) return max
  return v
}
