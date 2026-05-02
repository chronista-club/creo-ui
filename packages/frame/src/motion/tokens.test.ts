/**
 * Motion token bridge の sanity check (bun test)。
 *
 * Static lookup の正しさ + CSS fallback 動作を確認。
 */

import { describe, expect, it } from 'bun:test'
import {
  duration,
  durationFromCss,
  ease,
  easeFromCss,
} from './tokens'

describe('ease (static)', () => {
  it('returns spring cubic-bezier', () => {
    expect(ease('spring')).toBe('cubic-bezier(0.2, 0.8, 0.2, 1)')
  })

  it('returns linear keyword', () => {
    expect(ease('linear')).toBe('linear')
  })

  it('returns Material 3 default for "out"', () => {
    expect(ease('out')).toBe('cubic-bezier(0, 0, 0.2, 1)')
  })
})

describe('duration (static)', () => {
  it('returns 5-step values', () => {
    expect(duration('instant')).toBe(80)
    expect(duration('fast')).toBe(160)
    expect(duration('normal')).toBe(220)
    expect(duration('slow')).toBe(320)
    expect(duration('lazy')).toBe(480)
  })

  it('normal is 5-step rule center', () => {
    expect(duration('normal')).toBe(220)
  })
})

describe('easeFromCss / durationFromCss (no document)', () => {
  // bun test は jsdom / happy-dom 無しで走るので document undefined → fallback path
  it('falls back to static when document missing', () => {
    expect(easeFromCss('spring')).toBe('cubic-bezier(0.2, 0.8, 0.2, 1)')
    expect(durationFromCss('normal')).toBe(220)
  })
})
