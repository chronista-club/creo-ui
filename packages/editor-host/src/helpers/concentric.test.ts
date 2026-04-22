/**
 * bun test packages/editor-host/src/helpers/concentric.test.ts
 */
import { describe, expect, test } from 'bun:test'
import { concentric, concentricTokens } from './concentric'

describe('concentric', () => {
  test('wraps parent and padding in calc() with minus', () => {
    expect(concentric('var(--radius-md)', 'var(--spacing-md)')).toBe(
      'calc(var(--radius-md) - var(--spacing-md))',
    )
  })
  test('works with rem literals', () => {
    expect(concentric('1.5rem', '0.5rem')).toBe('calc(1.5rem - 0.5rem)')
  })
  test('works with px literals', () => {
    expect(concentric('22px', '8px')).toBe('calc(22px - 8px)')
  })
  test('allows nested calc()', () => {
    expect(concentric('calc(var(--radius-lg) * 2)', '16px')).toBe(
      'calc(calc(var(--radius-lg) * 2) - 16px)',
    )
  })
})

describe('concentricTokens', () => {
  test('uses default prefixes (radius + spacing)', () => {
    expect(concentricTokens('lg', 'sm')).toBe('calc(var(--radius-lg) - var(--spacing-sm))')
  })
  test('accepts custom prefixes', () => {
    expect(
      concentricTokens('md', 'sibling', {
        radiusPrefix: '--radius-',
        paddingPrefix: '--layout-gap-',
      }),
    ).toBe('calc(var(--radius-md) - var(--layout-gap-sibling))')
  })
})
