/**
 * Spring physics の sanity check (bun test)。
 *
 * 物理的に正しい挙動か (始点 0、 終点 1、 振動回数妥当) を確認。
 */

import { describe, expect, it } from 'bun:test'
import { type SpringPreset, springCurve, springEasing, springPreset } from './spring'

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

describe('springCurve — t 外部化 (LE-P3)', () => {
  it('position(0) = 0、 position(settleTime) ≈ 1', () => {
    const curve = springCurve('stiff')
    expect(curve.position(0)).toBeCloseTo(0, 6)
    expect(curve.position(curve.settleTime)).toBeCloseTo(1, 2)
    expect(curve.settleTime).toBeGreaterThan(0)
  })

  it('springEasing と同じ物理 — sample 一致 (重複実装ではなく同一の position 関数)', () => {
    // springEasing は precision 0.01 で打ち切った curve を samples=60 で等間隔 sample し、
    // 打ち切り時点の残りを i / 60 に比例して足している (0.3.1〜)
    const curve = springCurve({ ...springPreset('gentle'), precision: 0.01 })
    const residual = 1 - curve.position(curve.settleTime)
    const points = parseLinearEasing(springEasing('gentle'))
    for (const [i, expected] of [
      [0, points[0]],
      [30, points[30]],
      [59, points[59]],
    ] as [number, number][]) {
      expect(curve.position((i / 60) * curve.settleTime) + residual * (i / 60)).toBeCloseTo(
        expected,
        3,
      )
    }
  })

  it('underdamped preset は overshoot する (layout 側 clamp の理由を固定)', () => {
    const curve = springCurve('wobbly')
    let max = 0
    for (let t = 0; t <= curve.settleTime; t += curve.settleTime / 100) {
      max = Math.max(max, curve.position(t))
    }
    expect(max).toBeGreaterThan(1)
  })
})

describe('springEasing — 見える動きを duration 全体に配る (anycreative.tech の dogfood、改善 5)', () => {
  // 'slow' を 60 sample (61 点) で。index 15 = duration の 25%、index 30 = 50%
  it('目に見えない尾 (差 1% 未満) は引き伸ばさない — slow でも 25% の時点ではまだ半分に届かない', () => {
    const points = parseLinearEasing(springEasing('slow'))
    expect(points[15]!).toBeLessThan(0.5)
    expect(points[30]!).toBeGreaterThan(0.6)
    expect(points[30]!).toBeLessThan(0.95)
  })

  it('打ち切った時点の残り (1% 未満) を全体に配るので、最後に段差が出ない', () => {
    const points = parseLinearEasing(springEasing('slow'))
    const lastStep = points[points.length - 1]! - points[points.length - 2]!
    expect(points[points.length - 1]).toBe(1)
    expect(Math.abs(lastStep)).toBeLessThan(0.01)
  })

  it('precision を明示すれば従来どおり (0.001 まで引き伸ばす)', () => {
    const points = parseLinearEasing(springEasing({ ...springPreset('slow'), precision: 0.001 }))
    expect(points[15]!).toBeGreaterThan(0.6)
  })

  it('springCurve の settleTime は変えない (layout の scrub が使う)', () => {
    const curve = springCurve('slow')
    expect(Math.abs(curve.position(curve.settleTime) - 1)).toBeLessThan(0.001)
  })
})
