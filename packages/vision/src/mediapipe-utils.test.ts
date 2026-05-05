/**
 * MediaPipe utils sanity check (bun test)。
 */

import { describe, expect, it } from 'bun:test'
import { matrixToEuler, normalizeVector } from './mediapipe-utils'

describe('normalizeVector', () => {
  it('normalizes (3, 4, 0) to unit length', () => {
    const v = normalizeVector({ x: 3, y: 4, z: 0 })
    expect(v.x).toBeCloseTo(0.6)
    expect(v.y).toBeCloseTo(0.8)
    expect(v.z).toBe(0)
  })

  it('returns zero vector for zero input', () => {
    expect(normalizeVector({ x: 0, y: 0, z: 0 })).toEqual({ x: 0, y: 0, z: 0 })
  })

  it('keeps unit vectors unchanged', () => {
    const v = normalizeVector({ x: 1, y: 0, z: 0 })
    expect(v.x).toBeCloseTo(1)
    expect(v.y).toBeCloseTo(0)
    expect(v.z).toBeCloseTo(0)
  })

  it('handles 3D unit vector', () => {
    // (1, 1, 1) → 1/sqrt(3) each
    const v = normalizeVector({ x: 1, y: 1, z: 1 })
    const expected = 1 / Math.sqrt(3)
    expect(v.x).toBeCloseTo(expected)
    expect(v.y).toBeCloseTo(expected)
    expect(v.z).toBeCloseTo(expected)
  })
})

describe('matrixToEuler', () => {
  it('identity matrix → zero rotation', () => {
    // Column-major identity 4x4
    const id = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
    const { pitch, yaw, roll } = matrixToEuler(id)
    expect(pitch).toBeCloseTo(0)
    expect(yaw).toBeCloseTo(0)
    expect(roll).toBeCloseTo(0)
  })

  it('90° yaw rotation (around Y axis) → yaw≈90', () => {
    // Y rotation by 90° in column-major:
    //   col0 = [0, 0, -1, 0]^T  (M[0][0]=0, M[1][0]=0, M[2][0]=-1)
    //   col1 = [0, 1,  0, 0]^T  (M[0][1]=0, M[1][1]=1, M[2][1]=0)
    //   col2 = [1, 0,  0, 0]^T  (M[0][2]=1, M[1][2]=0, M[2][2]=0)
    //   col3 = [0, 0,  0, 1]^T
    const m = new Float32Array([0, 0, -1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1])
    const { pitch, yaw, roll } = matrixToEuler(m)
    expect(pitch).toBeCloseTo(0)
    expect(yaw).toBeCloseTo(90)
    expect(roll).toBeCloseTo(0)
  })

  it('handles short array (< 16) gracefully', () => {
    // 引数不足でも NaN にせず default 0 を使う
    const partial: number[] = [1, 0, 0]
    const { pitch, yaw, roll } = matrixToEuler(partial)
    expect(pitch).toBeCloseTo(0)
    expect(yaw).toBeCloseTo(0)
    expect(roll).toBeCloseTo(0)
  })
})
