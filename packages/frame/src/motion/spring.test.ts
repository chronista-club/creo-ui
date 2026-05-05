/**
 * Spring physics の sanity check (bun test)。
 *
 * 物理的に正しい挙動か (始点 0、 終点 1、 振動回数妥当) を確認。
 */

import { describe, expect, it } from 'bun:test'
import { type SpringPreset, springEasing, springPreset } from './spring'

describe('springEasing', () => {
  it('returns a linear() easing string', () => {
    const easing = springEasing()
    expect(easing).toMatch(/^linear\(/)
    expect(easing).toMatch(/\)$/)
  })

  it('contains start (0) and end (1) keyframes', () => {
    const easing = springEasing({ samples: 30 })
    const points = parseLinearEasing(easing)
    // 始点は 0 (position at t=0)、 終点は 1 (clamped)
    expect(points[0]).toBeCloseTo(0, 3)
    expect(points[points.length - 1]).toBe(1)
  })

  it('produces samples + 1 keyframes', () => {
    const easing = springEasing({ samples: 10 })
    const points = parseLinearEasing(easing)
    expect(points.length).toBe(11)
  })

  it('underdamped (ζ < 1) overshoots beyond 1', () => {
    // bouncy spring: stiffness 200, damping 8 → ζ ≈ 0.28 (underdamped)
    const easing = springEasing({ stiffness: 200, damping: 8, samples: 100 })
    const points = parseLinearEasing(easing)
    const max = Math.max(...points.slice(0, -1)) // 最終 clamp 除外
    expect(max).toBeGreaterThan(1) // overshoot あり
  })

  it('critically/overdamped (ζ ≥ 1) does not overshoot', () => {
    // overdamped: stiffness 100, damping 30 → ζ ≈ 1.5 (overdamped)
    const easing = springEasing({ stiffness: 100, damping: 30, samples: 100 })
    const points = parseLinearEasing(easing)
    const max = Math.max(...points)
    expect(max).toBeLessThanOrEqual(1.001) // overshoot なし (浮動小数誤差許容)
  })

  it('respects custom samples count', () => {
    const easing50 = springEasing({ samples: 50 })
    const easing100 = springEasing({ samples: 100 })
    expect(parseLinearEasing(easing50).length).toBe(51)
    expect(parseLinearEasing(easing100).length).toBe(101)
  })
})

function parseLinearEasing(easing: string): number[] {
  const match = easing.match(/^linear\((.*)\)$/)
  if (!match) throw new Error(`not a linear() easing: ${easing}`)
  return match[1]?.split(',').map((s) => Number.parseFloat(s.trim())) ?? []
}

describe('springPreset', () => {
  const expected: Record<SpringPreset, { stiffness: number; damping: number; mass: number }> = {
    gentle: { stiffness: 120, damping: 14, mass: 1 },
    wobbly: { stiffness: 180, damping: 12, mass: 1 },
    stiff: { stiffness: 280, damping: 24, mass: 1 },
    slow: { stiffness: 80, damping: 16, mass: 1 },
    tight: { stiffness: 300, damping: 30, mass: 1 },
  }

  for (const name of Object.keys(expected) as SpringPreset[]) {
    it(`returns expected params for "${name}"`, () => {
      const params = springPreset(name)
      expect(params.stiffness).toBe(expected[name].stiffness)
      expect(params.damping).toBe(expected[name].damping)
      expect(params.mass).toBe(expected[name].mass)
    })
  }
})

describe('springEasing — preset overload', () => {
  for (const name of ['gentle', 'wobbly', 'stiff', 'slow', 'tight'] as SpringPreset[]) {
    it(`returns a linear() easing for "${name}"`, () => {
      const easing = springEasing(name)
      expect(easing).toMatch(/^linear\(/)
      expect(easing).toMatch(/\)$/)
      const points = parseLinearEasing(easing)
      expect(points[0]).toBeCloseTo(0, 3)
      expect(points[points.length - 1]).toBe(1)
    })
  }

  it('"gentle" produces overshoot (underdamped)', () => {
    // gentle: ζ = 14 / (2 * sqrt(120 * 1)) ≈ 0.64 → underdamped、 overshoot あり
    const points = parseLinearEasing(springEasing('gentle'))
    const max = Math.max(...points.slice(0, -1))
    expect(max).toBeGreaterThan(1)
  })

  it('"tight" produces minimal overshoot (high damping)', () => {
    // tight: ζ = 30 / (2 * sqrt(300 * 1)) ≈ 0.866 → underdamped だが overshoot 小
    const points = parseLinearEasing(springEasing('tight'))
    const max = Math.max(...points)
    expect(max).toBeLessThan(1.05)
  })

  it('preset overload matches manual SpringOptions', () => {
    const fromPreset = springEasing('stiff')
    const fromOptions = springEasing(springPreset('stiff'))
    expect(fromPreset).toBe(fromOptions)
  })
})
