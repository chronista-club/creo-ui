/**
 * bun test packages/editor-host/src/oklch.test.ts
 */
import { describe, expect, test } from 'bun:test'
import { OKLCH_C_MAX, formatOklch, oklchTrackGradient, parseOklch } from './oklch'

describe('parseOklch', () => {
  test('基本形 oklch(l c h)', () => {
    expect(parseOklch('oklch(0.75 0.12 160)')).toEqual({ l: 0.75, c: 0.12, h: 160, a: 1 })
  })
  test('alpha 付き oklch(l c h / a)', () => {
    expect(parseOklch('oklch(0.75 0.12 160 / 0.5)')).toEqual({ l: 0.75, c: 0.12, h: 160, a: 0.5 })
  })
  test('L / A の % 表記', () => {
    expect(parseOklch('oklch(75% 0.12 160 / 50%)')).toEqual({ l: 0.75, c: 0.12, h: 160, a: 0.5 })
  })
  test('hue の deg suffix と大文字・余白', () => {
    expect(parseOklch('  OKLCH( 0.6  0.2  230deg )  ')).toEqual({ l: 0.6, c: 0.2, h: 230, a: 1 })
  })
  test('oklch でない値は null (fallback 判定)', () => {
    expect(parseOklch('#73e7aa')).toBeNull()
    expect(parseOklch('rgb(255, 0, 0)')).toBeNull()
    expect(parseOklch('color-mix(in oklch, red 20%, transparent)')).toBeNull()
    expect(parseOklch('var(--color-brand-primary)')).toBeNull()
  })
})

describe('formatOklch', () => {
  test('alpha = 1 は省略', () => {
    expect(formatOklch({ l: 0.75, c: 0.12, h: 160, a: 1 })).toBe('oklch(0.75 0.12 160)')
  })
  test('alpha < 1 は / a 付き', () => {
    expect(formatOklch({ l: 0.75, c: 0.12, h: 160, a: 0.5 })).toBe('oklch(0.75 0.12 160 / 0.5)')
  })
  test('丸め: l/c 4 桁・h 1 桁、末尾ゼロ落とし', () => {
    expect(formatOklch({ l: 0.123456, c: 0.20001, h: 159.96, a: 1 })).toBe('oklch(0.1235 0.2 160)')
  })
  test('clamp: l/a は 0..1、c は 0 以上、h は 0..360 に正規化', () => {
    expect(formatOklch({ l: 1.5, c: -0.1, h: 400, a: 2 })).toBe('oklch(1 0 40)')
    expect(formatOklch({ l: -0.5, c: 0.1, h: -90, a: 0.5 })).toBe('oklch(0 0.1 270 / 0.5)')
  })
  test('parse → format の round-trip が安定', () => {
    const raw = 'oklch(0.75 0.12 160)'
    const parsed = parseOklch(raw)
    expect(parsed).not.toBeNull()
    expect(formatOklch(parsed as NonNullable<typeof parsed>)).toBe(raw)
  })
})

describe('oklchTrackGradient', () => {
  const base = { l: 0.75, c: 0.12, h: 160, a: 1 }
  test('L track は 0→1 を振る', () => {
    const g = oklchTrackGradient('l', base)
    expect(g).toStartWith('linear-gradient(to right, oklch(0 0.12 160) 0%')
    expect(g).toContain('oklch(1 0.12 160) 100%')
  })
  test('C track は 0→C_MAX を振る', () => {
    const g = oklchTrackGradient('c', base)
    expect(g).toContain(`oklch(0.75 ${OKLCH_C_MAX} 160) 100%`)
  })
  test('H track は他 channel 固定で hue 一周 (12 stop)', () => {
    const g = oklchTrackGradient('h', base)
    expect(g).toContain('oklch(0.75 0.12 0) 0%')
    expect(g).toContain('oklch(0.75 0.12 180) 50%')
    // 360 は正規化で 0 になる
    expect(g).toContain('oklch(0.75 0.12 0) 100%')
  })
  test('A track は alpha を 0→1 で振る', () => {
    const g = oklchTrackGradient('a', base)
    expect(g).toContain('oklch(0.75 0.12 160 / 0) 0%')
    expect(g).toContain('oklch(0.75 0.12 160) 100%')
  })
})
