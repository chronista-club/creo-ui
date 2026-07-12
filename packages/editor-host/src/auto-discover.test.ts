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

// ---------- F2b: private tweak var ----------

const { parseTweakVarRefs, resolveFallback, tweakVarToId, tweakPlacement } = __test__

describe('parseTweakVarRefs', () => {
  test('literal fallback', () => {
    const refs = parseTweakVarRefs('.creo-badge { padding: var(--_badge-pad-y, 2px); }')
    expect(refs).toEqual([{ cssVar: '--_badge-pad-y', fallback: '2px' }])
  })
  test('var() fallback (nested parens)', () => {
    const refs = parseTweakVarRefs('padding: var(--_badge-pad-x, var(--spacing-s));')
    expect(refs).toEqual([{ cssVar: '--_badge-pad-x', fallback: 'var(--spacing-s)' }])
  })
  test('multiple refs in one declaration', () => {
    const refs = parseTweakVarRefs(
      'padding: var(--_badge-pad-y, 2px) var(--_badge-pad-x, var(--spacing-s));',
    )
    expect(refs.map((r) => r.cssVar)).toEqual(['--_badge-pad-y', '--_badge-pad-x'])
  })
  test('non-tweak var は無視', () => {
    const refs = parseTweakVarRefs('color: var(--color-text-primary);')
    expect(refs).toEqual([])
  })
  test('fallback 無しの tweak var は無視 (SSOT が読めない)', () => {
    const refs = parseTweakVarRefs('padding: var(--_badge-pad-x);')
    expect(refs).toEqual([])
  })
  test('fallback 内の nested var() も走査される', () => {
    const refs = parseTweakVarRefs('margin: var(--outer, var(--_badge-gap, 4px));')
    expect(refs).toEqual([{ cssVar: '--_badge-gap', fallback: '4px' }])
  })
  test('color-mix 等の関数値 fallback も括弧バランスで拾える', () => {
    const refs = parseTweakVarRefs(
      'background: var(--_badge-bg, color-mix(in oklch, red 20%, transparent));',
    )
    expect(refs).toEqual([
      { cssVar: '--_badge-bg', fallback: 'color-mix(in oklch, red 20%, transparent)' },
    ])
  })
})

describe('resolveFallback', () => {
  test('literal はそのまま返る', () => {
    expect(resolveFallback('2px')).toBe('2px')
    expect(resolveFallback('  8px ')).toBe('8px')
  })
  test('DOM 無し環境では var() は解決不能 → 空文字', () => {
    // bun test には getComputedStyle が無い
    expect(resolveFallback('var(--spacing-s)')).toBe('')
  })
})

describe('tweakVarToId / tweakPlacement', () => {
  test('id: --_ を strip して dot 区切り', () => {
    expect(tweakVarToId('--_badge-pad-x')).toBe('badge.pad.x')
    expect(tweakVarToId('--_button-radius')).toBe('button.radius')
  })
  test('placement: 先頭 segment が group、残りが label', () => {
    expect(tweakPlacement('--_badge-pad-x')).toEqual({ group: 'badge', label: 'Pad X' })
    expect(tweakPlacement('--_button-radius')).toEqual({ group: 'button', label: 'Radius' })
  })
  test('placement: segment 1 個だけなら group 名がそのまま label', () => {
    expect(tweakPlacement('--_gap')).toEqual({ group: 'gap', label: 'Gap' })
  })
})

describe('isSliderFriendly', () => {
  const { isSliderFriendly } = __test__
  test('通常の px 値は slider 化 OK', () => {
    expect(isSliderFriendly(8, 'px')).toBe(true)
    expect(isSliderFriendly(512, 'px')).toBe(true)
  })
  test('radius.full 等の sentinel (512px 超) は除外', () => {
    expect(isSliderFriendly(513, 'px')).toBe(false)
    expect(isSliderFriendly(9999, 'px')).toBe(false)
  })
  test('px 以外の unit は制限しない', () => {
    expect(isSliderFriendly(9999, 'ms')).toBe(true)
    expect(isSliderFriendly(2, 'rem')).toBe(true)
  })
})
