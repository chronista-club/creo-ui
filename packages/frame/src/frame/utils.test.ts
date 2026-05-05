/**
 * Frame utility 関数の sanity check (bun test)。
 *
 * 純粋関数のみ test。 Provider / Slot は SolidJS reactivity が絡むので component
 * test は別 setup (happy-dom) で実装する余地。
 */

import { describe, expect, it } from 'bun:test'
import {
  DEFAULT_PLACEMENT,
  buildTransformString,
  formatLength,
  formatPerspective,
  mergePlacement,
} from './utils'

describe('formatLength', () => {
  it('number → px', () => {
    expect(formatLength(8)).toBe('8px')
    expect(formatLength(0)).toBe('0px')
    expect(formatLength(-16)).toBe('-16px')
  })

  it('string passthrough', () => {
    expect(formatLength('50%')).toBe('50%')
    expect(formatLength('var(--x)')).toBe('var(--x)')
    expect(formatLength('10vw')).toBe('10vw')
  })

  it('undefined → "0"', () => {
    expect(formatLength(undefined)).toBe('0')
  })
})

describe('buildTransformString', () => {
  it('default placement is identity-like', () => {
    const s = buildTransformString(DEFAULT_PLACEMENT)
    expect(s).toBe('translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)')
  })

  it('builds full transform with rotations + scale', () => {
    const s = buildTransformString({
      x: 100,
      y: -20,
      z: 8,
      rotateX: 5,
      rotateY: -10,
      scale: 1.2,
    })
    expect(s).toBe(
      'translate3d(100px, -20px, 8px) rotateX(5deg) rotateY(-10deg) rotateZ(0deg) scale(1.2)',
    )
  })

  it('mixes string lengths', () => {
    const s = buildTransformString({ x: '50%', y: 'var(--hero-y)', z: 16 })
    expect(s).toBe(
      'translate3d(50%, var(--hero-y), 16px) rotateX(0deg) rotateY(0deg) rotateZ(0deg) scale(1)',
    )
  })
})

describe('mergePlacement', () => {
  it('returns base when override is undefined', () => {
    const base = { x: 10, y: 20 }
    expect(mergePlacement(base, undefined)).toBe(base)
  })

  it('shallow override', () => {
    const base = { x: 10, y: 20, z: 30 }
    const merged = mergePlacement(base, { y: 99 })
    expect(merged).toEqual({ x: 10, y: 99, z: 30 })
  })

  it('does not mutate inputs', () => {
    const base = Object.freeze({ x: 1, y: 2 })
    const override = Object.freeze({ y: 99 })
    const merged = mergePlacement(base, override)
    expect(merged).not.toBe(base)
    expect(merged).not.toBe(override)
    expect(base.y).toBe(2) // unchanged
  })
})

describe('formatPerspective', () => {
  it('number → px', () => {
    expect(formatPerspective(1400)).toBe('1400px')
  })

  it('string passthrough', () => {
    expect(formatPerspective('var(--frame-perspective-shallow)')).toBe(
      'var(--frame-perspective-shallow)',
    )
  })

  it('undefined → token CSS variable fallback', () => {
    const s = formatPerspective(undefined)
    expect(s).toContain('--frame-perspective-default')
  })
})
