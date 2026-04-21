/**
 * bun test transforms/color-utils.test.js
 */
import { describe, expect, test } from 'bun:test'
import {
  contrastRatio,
  hexToRgb01,
  hexToRgb255,
  linearToSrgb,
  mixOklch,
  oklabToLinearSrgb,
  oklchStringContrastRatio,
  oklchStringToHex,
  oklchToHex,
  oklchToOklab,
  parseOklch,
  relativeLuminance,
  wcagLevel,
} from './color-utils.js'

// ---------- parseOklch ----------

describe('parseOklch', () => {
  test('valid without alpha', () => {
    expect(parseOklch('oklch(0.85 0.14 160)')).toEqual({
      l: 0.85,
      c: 0.14,
      h: 160,
    })
  })

  test('valid with alpha', () => {
    expect(parseOklch('oklch(0.85 0.14 160 / 0.5)')).toEqual({
      l: 0.85,
      c: 0.14,
      h: 160,
      a: 0.5,
    })
  })

  test('handles whitespace', () => {
    expect(parseOklch('  oklch( 0.75  0.12  160 )  ')).toEqual({
      l: 0.75,
      c: 0.12,
      h: 160,
    })
  })

  test('zero hue is valid', () => {
    expect(parseOklch('oklch(1 0 0)')).toEqual({ l: 1, c: 0, h: 0 })
  })

  test('invalid string returns null', () => {
    expect(parseOklch('rgb(1, 2, 3)')).toBeNull()
    expect(parseOklch('#ff0000')).toBeNull()
    expect(parseOklch('not a color')).toBeNull()
    expect(parseOklch(null)).toBeNull()
    expect(parseOklch(42)).toBeNull()
  })
})

// ---------- oklchToOklab ----------

describe('oklchToOklab', () => {
  test('h=0 → a axis only', () => {
    const lab = oklchToOklab({ l: 0.5, c: 0.2, h: 0 })
    expect(lab.L).toBe(0.5)
    expect(lab.a_).toBeCloseTo(0.2, 10)
    expect(lab.b_).toBeCloseTo(0, 10)
  })

  test('h=90 → b axis only', () => {
    const lab = oklchToOklab({ l: 0.5, c: 0.2, h: 90 })
    expect(lab.a_).toBeCloseTo(0, 10)
    expect(lab.b_).toBeCloseTo(0.2, 10)
  })

  test('c=0 → achromatic (a_=b_=0)', () => {
    const lab = oklchToOklab({ l: 0.5, c: 0, h: 200 })
    expect(lab.a_).toBeCloseTo(0, 10)
    expect(lab.b_).toBeCloseTo(0, 10)
  })
})

// ---------- linearToSrgb ----------

describe('linearToSrgb', () => {
  test('0 → 0', () => {
    expect(linearToSrgb(0)).toBe(0)
  })

  test('1 → 1', () => {
    expect(linearToSrgb(1)).toBeCloseTo(1, 5)
  })

  test('below 0 clamps to 0', () => {
    expect(linearToSrgb(-0.5)).toBe(0)
  })

  test('above 1 clamps to 1', () => {
    expect(linearToSrgb(2)).toBeCloseTo(1, 5)
  })

  test('small linear uses linear-regime (12.92*x)', () => {
    // 0.003 は threshold (0.0031308) 未満なので 12.92*x
    expect(linearToSrgb(0.003)).toBeCloseTo(12.92 * 0.003, 5)
  })
})

// ---------- oklabToLinearSrgb ----------

describe('oklabToLinearSrgb', () => {
  test('L=0 → near-black', () => {
    const [r, g, b] = oklabToLinearSrgb({ L: 0, a_: 0, b_: 0 })
    expect(r).toBeCloseTo(0, 5)
    expect(g).toBeCloseTo(0, 5)
    expect(b).toBeCloseTo(0, 5)
  })

  test('L=1,a=0,b=0 → white (linear RGB = 1)', () => {
    const [r, g, b] = oklabToLinearSrgb({ L: 1, a_: 0, b_: 0 })
    expect(r).toBeCloseTo(1, 3)
    expect(g).toBeCloseTo(1, 3)
    expect(b).toBeCloseTo(1, 3)
  })
})

// ---------- oklchToHex ----------

describe('oklchToHex', () => {
  test('mint green oklch(0.85 0.14 160) ≈ #73e7aa', () => {
    // creo-memories preset の lightPalette.brand.primary.base のコメント通り
    const hex = oklchToHex({ l: 0.85, c: 0.14, h: 160 })
    const [r, g, b] = hexToRgb255(hex)
    // round-trip なので若干誤差、±5 で許容
    expect(Math.abs(r - 115)).toBeLessThanOrEqual(5)
    expect(Math.abs(g - 231)).toBeLessThanOrEqual(5)
    expect(Math.abs(b - 170)).toBeLessThanOrEqual(5)
  })

  test('returns valid 6-char hex for normal range', () => {
    const hex = oklchToHex({ l: 0.5, c: 0.1, h: 200 })
    expect(hex).toMatch(/^#[0-9a-f]{6}$/)
  })

  test('with alpha emits 8-char hex', () => {
    const hex = oklchToHex({ l: 0.5, c: 0.1, h: 200, a: 0.5 })
    expect(hex).toMatch(/^#[0-9a-f]{8}$/)
  })

  test('alpha=1 omitted from hex', () => {
    const hex = oklchToHex({ l: 0.5, c: 0.1, h: 200, a: 1 })
    expect(hex).toMatch(/^#[0-9a-f]{6}$/)
  })

  test('out-of-gamut high chroma clamps to valid hex', () => {
    const hex = oklchToHex({ l: 0.5, c: 0.5, h: 30 }) // very saturated
    expect(hex).toMatch(/^#[0-9a-f]{6}$/)
  })

  test('oklch(1 0 0) ≈ white', () => {
    const [r, g, b] = hexToRgb255(oklchToHex({ l: 1, c: 0, h: 0 }))
    expect(r).toBeGreaterThanOrEqual(250)
    expect(g).toBeGreaterThanOrEqual(250)
    expect(b).toBeGreaterThanOrEqual(250)
  })

  test('oklch(0 0 0) ≈ black', () => {
    const [r, g, b] = hexToRgb255(oklchToHex({ l: 0, c: 0, h: 0 }))
    expect(r).toBeLessThanOrEqual(5)
    expect(g).toBeLessThanOrEqual(5)
    expect(b).toBeLessThanOrEqual(5)
  })
})

// ---------- oklchStringToHex ----------

describe('oklchStringToHex', () => {
  test('converts OKLCH string', () => {
    expect(oklchStringToHex('oklch(0.85 0.14 160)')).toMatch(/^#[0-9a-f]{6}$/)
  })

  test('throws on invalid string', () => {
    expect(() => oklchStringToHex('not-oklch')).toThrow(/Invalid OKLCH string/)
  })

  test('with alpha preserves 8-char output', () => {
    expect(oklchStringToHex('oklch(0.5 0.1 160 / 0.5)')).toMatch(/^#[0-9a-f]{8}$/)
  })
})

// ---------- hex helpers ----------

describe('hexToRgb255', () => {
  test('6-char hex', () => {
    expect(hexToRgb255('#73e7aa')).toEqual([115, 231, 170])
  })

  test('3-char shorthand', () => {
    expect(hexToRgb255('#fff')).toEqual([255, 255, 255])
    expect(hexToRgb255('#000')).toEqual([0, 0, 0])
  })

  test('without # prefix', () => {
    expect(hexToRgb255('73e7aa')).toEqual([115, 231, 170])
  })

  test('8-char hex alpha ignored', () => {
    expect(hexToRgb255('#73e7aa80')).toEqual([115, 231, 170])
  })
})

describe('hexToRgb01', () => {
  test('white', () => {
    expect(hexToRgb01('#ffffff')).toEqual([1, 1, 1])
  })

  test('black', () => {
    expect(hexToRgb01('#000000')).toEqual([0, 0, 0])
  })

  test('mid gray', () => {
    const [r, g, b] = hexToRgb01('#808080')
    expect(r).toBeCloseTo(128 / 255, 5)
    expect(g).toBeCloseTo(128 / 255, 5)
    expect(b).toBeCloseTo(128 / 255, 5)
  })
})

// ---------- WCAG ----------

describe('relativeLuminance', () => {
  test('black = 0', () => {
    expect(relativeLuminance([0, 0, 0])).toBe(0)
  })

  test('white = 1', () => {
    expect(relativeLuminance([255, 255, 255])).toBeCloseTo(1, 3)
  })

  test('pure red lower than pure green', () => {
    const redLum = relativeLuminance([255, 0, 0])
    const greenLum = relativeLuminance([0, 255, 0])
    expect(greenLum).toBeGreaterThan(redLum)
  })
})

describe('contrastRatio', () => {
  test('black vs white = 21', () => {
    expect(contrastRatio([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 1)
  })

  test('symmetric', () => {
    const a = [20, 40, 60]
    const b = [200, 150, 100]
    expect(contrastRatio(a, b)).toBeCloseTo(contrastRatio(b, a), 5)
  })

  test('identical colors = 1', () => {
    expect(contrastRatio([128, 128, 128], [128, 128, 128])).toBeCloseTo(1, 5)
  })
})

describe('wcagLevel', () => {
  test('ratio 21 = AAA', () => {
    expect(wcagLevel(21)).toBe('AAA')
  })

  test('ratio 7 = AAA (boundary)', () => {
    expect(wcagLevel(7)).toBe('AAA')
  })

  test('ratio 6.9 = AA', () => {
    expect(wcagLevel(6.9)).toBe('AA')
  })

  test('ratio 4.5 = AA (boundary)', () => {
    expect(wcagLevel(4.5)).toBe('AA')
  })

  test('ratio 3 = AAlarge (boundary)', () => {
    expect(wcagLevel(3)).toBe('AAlarge')
  })

  test('ratio 2 = fail', () => {
    expect(wcagLevel(2)).toBe('fail')
  })
})

describe('oklchStringContrastRatio', () => {
  test('Mint Dark fg/bg has acceptable contrast', () => {
    // mint-dark の text.primary vs bg.base
    const ratio = oklchStringContrastRatio(
      'oklch(0.95 0.01 260)', // text.primary
      'oklch(0.15 0.02 260)', // bg.base
    )
    // AA 基準 4.5 以上を期待 (deep ink × near-white)
    expect(ratio).toBeGreaterThan(4.5)
  })
})

// ---------- mixOklch ----------

describe('mixOklch', () => {
  test('t=0 returns a', () => {
    const a = { l: 0.5, c: 0.1, h: 100 }
    const b = { l: 0.8, c: 0.2, h: 200 }
    const mix = mixOklch(a, b, 0)
    expect(mix.l).toBeCloseTo(0.5, 5)
    expect(mix.c).toBeCloseTo(0.1, 5)
    expect(mix.h).toBeCloseTo(100, 5)
  })

  test('t=1 returns b', () => {
    const a = { l: 0.5, c: 0.1, h: 100 }
    const b = { l: 0.8, c: 0.2, h: 200 }
    const mix = mixOklch(a, b, 1)
    expect(mix.l).toBeCloseTo(0.8, 5)
    expect(mix.c).toBeCloseTo(0.2, 5)
    expect(mix.h).toBeCloseTo(200, 5)
  })

  test('t=0.5 midpoint', () => {
    const a = { l: 0.4, c: 0.1, h: 100 }
    const b = { l: 0.8, c: 0.3, h: 200 }
    const mix = mixOklch(a, b, 0.5)
    expect(mix.l).toBeCloseTo(0.6, 5)
    expect(mix.c).toBeCloseTo(0.2, 5)
    expect(mix.h).toBeCloseTo(150, 5)
  })

  test('hue wraps shortest path (350 → 10 via 0)', () => {
    const a = { l: 0.5, c: 0.1, h: 350 }
    const b = { l: 0.5, c: 0.1, h: 10 }
    const mix = mixOklch(a, b, 0.5)
    // shortest path は 350 → 360 → 0 → 10、midpoint = 0
    expect(mix.h).toBeCloseTo(0, 5)
  })

  test('t clamped to [0, 1]', () => {
    const a = { l: 0, c: 0, h: 0 }
    const b = { l: 1, c: 0, h: 0 }
    expect(mixOklch(a, b, -5).l).toBe(0)
    expect(mixOklch(a, b, 5).l).toBe(1)
  })
})
