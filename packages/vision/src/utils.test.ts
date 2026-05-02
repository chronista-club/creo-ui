/**
 * Vision utils の sanity check (bun test)。
 */

import { describe, expect, it } from 'bun:test'
import {
  clamp,
  distance2D,
  distance3D,
  isPinchActive,
  normalizeAngle,
  pinchCenter,
  toViewportPixel,
} from './utils'

describe('distance3D', () => {
  it('Pythagoras', () => {
    expect(distance3D({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBeCloseTo(5)
    expect(distance3D({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 })).toBeCloseTo(Math.sqrt(3))
  })

  it('zero distance for same point', () => {
    const p = { x: 0.5, y: 0.5, z: 0.5 }
    expect(distance3D(p, p)).toBe(0)
  })
})

describe('distance2D', () => {
  it('ignores z', () => {
    expect(distance2D({ x: 0, y: 0 }, { x: 3, y: 4 })).toBeCloseTo(5)
  })
})

describe('isPinchActive', () => {
  it('detects close fingers (< default 0.04)', () => {
    const thumb = { x: 0.5, y: 0.5, z: 0 }
    const index = { x: 0.51, y: 0.51, z: 0 }
    expect(isPinchActive(thumb, index)).toBe(true)
  })

  it('rejects far fingers (>= default 0.04)', () => {
    const thumb = { x: 0.5, y: 0.5, z: 0 }
    const index = { x: 0.6, y: 0.6, z: 0 }
    expect(isPinchActive(thumb, index)).toBe(false)
  })

  it('respects custom threshold', () => {
    const thumb = { x: 0.5, y: 0.5, z: 0 }
    const index = { x: 0.55, y: 0.5, z: 0 }
    expect(isPinchActive(thumb, index, 0.06)).toBe(true)
    expect(isPinchActive(thumb, index, 0.04)).toBe(false)
  })
})

describe('pinchCenter', () => {
  it('returns midpoint of two points', () => {
    const center = pinchCenter({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 })
    expect(center).toEqual({ x: 0.5, y: 0.5, z: 0.5 })
  })
})

describe('normalizeAngle', () => {
  it('-180 to 180 range', () => {
    expect(normalizeAngle(0)).toBe(0)
    expect(normalizeAngle(180)).toBe(180)
    expect(normalizeAngle(-180)).toBe(-180)
    expect(normalizeAngle(270)).toBe(-90)
    expect(normalizeAngle(-270)).toBe(90)
    expect(normalizeAngle(540)).toBe(180)
  })
})

describe('clamp', () => {
  it('clamps to bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })
})

describe('toViewportPixel', () => {
  it('converts normalized to pixel', () => {
    expect(toViewportPixel(0.5, 800)).toBe(400)
    expect(toViewportPixel(0, 1000)).toBe(0)
    expect(toViewportPixel(1, 1000)).toBe(1000)
  })

  it('clamps out-of-range normalized', () => {
    expect(toViewportPixel(-0.5, 1000)).toBe(0)
    expect(toViewportPixel(1.5, 1000)).toBe(1000)
  })
})
