/**
 * bun test packages/editor-host/src/auto-discover.test.ts
 */
import { describe, expect, test } from 'bun:test'
import { __test__ } from './auto-discover'

const { inferType, cssVarToId, heuristicRange } = __test__

describe('cssVarToId', () => {
  test('strips -- and converts hyphen to dot', () => {
    expect(cssVarToId('--color-brand-primary')).toBe('color.brand.primary')
    expect(cssVarToId('--spacing-m')).toBe('spacing.m')
  })
})

describe('inferType', () => {
  test('hex color', () => {
    const r = inferType('--color-a', '#73e7aa')
    expect(r.kind).toBe('color')
  })
  test('oklch color', () => {
    const r = inferType('--color-b', 'oklch(0.75 0.12 160)')
    expect(r.kind).toBe('color')
  })
  test('rgb color', () => {
    const r = inferType('--color-c', 'rgb(255, 0, 0)')
    expect(r.kind).toBe('color')
  })
  test('number with px', () => {
    const r = inferType('--spacing-m', '16px')
    expect(r.kind).toBe('number')
    expect(r.numericValue).toBe(16)
    expect(r.unit).toBe('px')
  })
  test('number without unit', () => {
    const r = inferType('--n', '1.5')
    expect(r.kind).toBe('number')
    expect(r.numericValue).toBe(1.5)
    expect(r.unit).toBe('')
  })
  test('unknown fallback', () => {
    const r = inferType('--family', "'Creo Sans', sans-serif")
    expect(r.kind).toBe('unknown')
  })
})

describe('heuristicRange', () => {
  test('sub-1 value → fine granularity', () => {
    const r = heuristicRange(0.5)
    expect(r.min).toBe(0)
    expect(r.max).toBe(2)
    expect(r.step).toBe(0.05)
  })
  test('small integer', () => {
    const r = heuristicRange(4)
    expect(r.min).toBe(0)
    expect(r.max).toBeGreaterThanOrEqual(8)
  })
  test('medium', () => {
    const r = heuristicRange(50)
    expect(r.step).toBe(1)
  })
  test('large', () => {
    const r = heuristicRange(500)
    expect(r.step).toBe(10)
  })
})
