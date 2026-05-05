/**
 * Spring physics の sanity check (bun test)。
 *
 * 物理的に正しい挙動か (始点 0、 終点 1、 振動回数妥当) を確認。
 */

import { describe, expect, it } from 'bun:test'
import { springEasing } from './spring'

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
  return match[1]!.split(',').map((s) => Number.parseFloat(s.trim()))
}
