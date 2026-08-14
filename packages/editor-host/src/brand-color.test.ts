/**
 * bun test packages/editor-host/src/brand-color.test.ts
 *
 * global color knob の pure 部分 (OKLCH parse / format / 調整)。
 * computed style の capture と inline 書き込みは browser 前提なので対象外。
 */
import { describe, expect, test } from 'bun:test'
import { adjustOklch, formatOklch, parseOklch } from './brand-color'

describe('parseOklch', () => {
  test('emit 形式の literal を parse する', () => {
    expect(parseOklch('oklch(0.75 0.12 160)')).toEqual({ l: 0.75, c: 0.12, h: 160 })
  })

  test('alpha 付き / % 表記も読む', () => {
    expect(parseOklch('oklch(52% 0.18 270 / 0.5)')).toEqual({
      l: 0.52,
      c: 0.18,
      h: 270,
      alpha: 0.5,
    })
  })

  test('前後の空白は無視する (computed style の返し値)', () => {
    expect(parseOklch('  oklch(0.7 0.12 300)  ')).toEqual({ l: 0.7, c: 0.12, h: 300 })
  })

  test('OKLCH literal 以外は null (hex / var / 空)', () => {
    expect(parseOklch('#22c55e')).toBeNull()
    expect(parseOklch('var(--color-brand-primary)')).toBeNull()
    expect(parseOklch('')).toBeNull()
  })
})

describe('adjustOklch + formatOklch', () => {
  test('hue の差分適用は 0-360 に wrap する', () => {
    expect(adjustOklch({ l: 0.75, c: 0.12, h: 160 }, 250, 1).h).toBe(50)
    expect(adjustOklch({ l: 0.75, c: 0.12, h: 160 }, -200, 1).h).toBe(320)
  })

  test('chroma は倍率、負にはならない', () => {
    expect(adjustOklch({ l: 0.75, c: 0.12, h: 160 }, 0, 1.5).c).toBeCloseTo(0.18)
    expect(adjustOklch({ l: 0.75, c: 0.12, h: 160 }, 0, -1).c).toBe(0)
  })

  test('l と alpha は保存する', () => {
    const out = adjustOklch({ l: 0.52, c: 0.18, h: 270, alpha: 0.5 }, 30, 0.5)
    expect(out.l).toBe(0.52)
    expect(out.alpha).toBe(0.5)
  })

  test('format は emit と同じ literal に戻る', () => {
    expect(formatOklch({ l: 0.75, c: 0.12, h: 160 })).toBe('oklch(0.75 0.12 160)')
    expect(formatOklch({ l: 0.5, c: 0.1, h: 200, alpha: 0.5 })).toBe('oklch(0.5 0.1 200 / 0.5)')
  })
})
