import { describe, expect, it } from 'bun:test'
import { OneEuroFilter, Point3DSmoother, applyGain } from './smoothing'

describe('OneEuroFilter', () => {
  it('returns the first value verbatim (priming)', () => {
    const f = new OneEuroFilter()
    expect(f.filter(0.5, 0)).toBe(0.5)
  })

  it('smooths small high-frequency jitter toward the mean', () => {
    const f = new OneEuroFilter(1.0, 0.0)
    f.filter(0.5, 0)
    // ±0.05 jitter at 30 Hz around 0.5
    let last = 0.5
    for (let i = 1; i <= 30; i++) {
      const noisy = 0.5 + (i % 2 === 0 ? 0.05 : -0.05)
      last = f.filter(noisy, i * (1000 / 30))
    }
    // Output should be close to mean (0.5), not bouncing ±0.05
    expect(Math.abs(last - 0.5)).toBeLessThan(0.04)
  })

  it('tracks fast monotonic moves with bounded lag', () => {
    const f = new OneEuroFilter(1.0, 0.05) // beta>0 — adaptive
    f.filter(0, 0)
    let last = 0
    for (let i = 1; i <= 30; i++) {
      // Linear ramp 0 → 1 over 1 second
      last = f.filter(i / 30, i * (1000 / 30))
    }
    // After 1 second of monotonic motion, output should be near target
    expect(last).toBeGreaterThan(0.85)
    expect(last).toBeLessThan(1.0)
  })

  it('reset() clears state', () => {
    const f = new OneEuroFilter()
    f.filter(0.5, 0)
    f.filter(0.3, 100)
    f.reset()
    expect(f.filter(0.9, 200)).toBe(0.9) // first call after reset returns verbatim
  })

  it('guards against zero/negative dt', () => {
    const f = new OneEuroFilter()
    f.filter(0.5, 100)
    // Same timestamp → return previous, no NaN
    const out = f.filter(0.7, 100)
    expect(Number.isFinite(out)).toBe(true)
    expect(out).toBe(0.5)
  })
})

describe('Point3DSmoother', () => {
  it('smooths each axis independently', () => {
    const s = new Point3DSmoother()
    const out = s.filter({ x: 0.5, y: 0.4, z: 0.0 }, 0)
    expect(out).toEqual({ x: 0.5, y: 0.4, z: 0.0 })
  })

  it('reset() clears all axes', () => {
    const s = new Point3DSmoother()
    s.filter({ x: 0.5, y: 0.5, z: 0.5 }, 0)
    s.filter({ x: 0.4, y: 0.4, z: 0.4 }, 100)
    s.reset()
    const out = s.filter({ x: 0.9, y: 0.8, z: 0.7 }, 200)
    expect(out).toEqual({ x: 0.9, y: 0.8, z: 0.7 })
  })
})

describe('applyGain', () => {
  it('returns value unchanged when gain=1', () => {
    expect(applyGain(0.7, 1.0)).toBeCloseTo(0.7)
    expect(applyGain(0.2, 1.0)).toBeCloseTo(0.2)
  })

  it('compresses around center 0.5 when gain<1', () => {
    expect(applyGain(0.5, 0.5)).toBeCloseTo(0.5) // center stays
    expect(applyGain(1.0, 0.5)).toBeCloseTo(0.75) // 1.0 → 0.5 + 0.5*0.5 = 0.75
    expect(applyGain(0.0, 0.5)).toBeCloseTo(0.25) // 0.0 → 0.5 - 0.5*0.5 = 0.25
  })

  it('expands around center when gain>1', () => {
    expect(applyGain(0.6, 2.0)).toBeCloseTo(0.7) // 0.6 → 0.5 + 0.1*2 = 0.7
    expect(applyGain(0.4, 2.0)).toBeCloseTo(0.3)
  })

  it('respects custom center', () => {
    expect(applyGain(0.0, 0.5, 0.0)).toBeCloseTo(0.0) // value at custom center stays
    expect(applyGain(0.4, 0.5, 0.0)).toBeCloseTo(0.2)
  })
})
