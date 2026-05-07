/**
 * bun test packages/editor-host/src/helpers/concentric.test.ts
 */
import { describe, expect, test } from 'bun:test'
import { concentric, concentricTokens } from './concentric'

describe('concentric', () => {
  test('wraps parent and padding in calc() with minus', () => {
    expect(concentric('var(--radius-m)', 'var(--spacing-m)')).toBe(
      'calc(var(--radius-m) - var(--spacing-m))',
    )
  })
  test('works with rem literals', () => {
    expect(concentric('1.5rem', '0.5rem')).toBe('calc(1.5rem - 0.5rem)')
  })
  test('works with px literals', () => {
    expect(concentric('22px', '8px')).toBe('calc(22px - 8px)')
  })
  test('allows nested calc()', () => {
    expect(concentric('calc(var(--radius-l) * 2)', '16px')).toBe(
      'calc(calc(var(--radius-l) * 2) - 16px)',
    )
  })
})

describe('concentricTokens', () => {
  test('uses default prefixes (radius + spacing)', () => {
    expect(concentricTokens('l', 's')).toBe('calc(var(--radius-l) - var(--spacing-s))')
  })
  test('accepts custom prefixes', () => {
    expect(
      concentricTokens('m', 'sibling', {
        radiusPrefix: '--radius-',
        paddingPrefix: '--layout-gap-',
      }),
    ).toBe('calc(var(--radius-m) - var(--layout-gap-sibling))')
  })
})
