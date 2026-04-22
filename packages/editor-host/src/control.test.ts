/**
 * bun test packages/editor-host/src/control.test.ts
 *
 * Control factory の単体テスト。shape と default 値を確認。
 */
import { describe, expect, test } from 'bun:test'
import { boolean, color, number, readonlyText, select, string } from './control'

describe('control factories', () => {
  test('number() default', () => {
    const c = number()
    expect(c.kind).toBe('number')
    expect(c.min).toBeUndefined()
  })

  test('number() with constraints', () => {
    const c = number({ min: 0, max: 48, step: 1, unit: 'px', variant: 'slider' })
    expect(c).toEqual({
      kind: 'number',
      min: 0,
      max: 48,
      step: 1,
      unit: 'px',
      variant: 'slider',
    })
  })

  test('color() default + oklch variant', () => {
    expect(color()).toEqual({ kind: 'color' })
    expect(color({ variant: 'oklch-sliders' })).toEqual({
      kind: 'color',
      variant: 'oklch-sliders',
    })
  })

  test('boolean()', () => {
    expect(boolean()).toEqual({ kind: 'boolean' })
    expect(boolean({ variant: 'switch' })).toEqual({ kind: 'boolean', variant: 'switch' })
  })

  test('select()', () => {
    const c = select(['a', 'b', 'c'])
    expect(c.kind).toBe('select')
    expect(c.options).toEqual(['a', 'b', 'c'])
    expect(c.variant).toBeUndefined()

    const c2 = select(['x', 'y'], 'segmented')
    expect(c2.variant).toBe('segmented')
  })

  test('string()', () => {
    expect(string()).toEqual({ kind: 'string' })
    expect(string('textarea')).toEqual({ kind: 'string', variant: 'textarea' })
  })

  test('readonlyText()', () => {
    expect(readonlyText()).toEqual({ kind: 'readonly-text' })
  })
})
