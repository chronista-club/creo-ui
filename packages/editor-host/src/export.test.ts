/**
 * bun test packages/editor-host/src/export.test.ts
 */
import { describe, expect, test } from 'bun:test'
import { __test__, exportSnapshot } from './export'
import { createEditorHost } from './host'
import type { EditorField } from './types'

function makeHost(fields: EditorField[]): ReturnType<typeof createEditorHost> {
  const host = createEditorHost()
  host.register(fields)
  return host
}

describe('yamlKey', () => {
  test('simple identifier is unquoted', () => {
    expect(__test__.yamlKey('foo')).toBe('foo')
    expect(__test__.yamlKey('tokens.spacing.md')).toBe('tokens.spacing.md')
  })
  test('special chars are quoted', () => {
    expect(__test__.yamlKey('has space')).toMatch(/^".*"$/)
    expect(__test__.yamlKey('a:b')).toMatch(/^".*"$/)
  })
})

describe('yamlScalar', () => {
  test('primitives', () => {
    expect(__test__.yamlScalar(42)).toBe('42')
    expect(__test__.yamlScalar(true)).toBe('true')
    expect(__test__.yamlScalar(null)).toBe('null')
  })
  test('clean string unquoted', () => {
    expect(__test__.yamlScalar('hello')).toBe('hello')
  })
  test('string with special chars quoted', () => {
    expect(__test__.yamlScalar('with: colon')).toMatch(/^".*"$/)
    expect(__test__.yamlScalar('true')).toMatch(/^".*"$/) // reserved-like
  })
})

describe('valueEquals', () => {
  test('primitives', () => {
    expect(__test__.valueEquals(1, 1)).toBe(true)
    expect(__test__.valueEquals(1, 2)).toBe(false)
    expect(__test__.valueEquals('a', 'a')).toBe(true)
  })
  test('NaN equals NaN via Object.is', () => {
    expect(__test__.valueEquals(Number.NaN, Number.NaN)).toBe(true)
  })
  test('objects via JSON', () => {
    expect(__test__.valueEquals({ a: 1 }, { a: 1 })).toBe(true)
    expect(__test__.valueEquals({ a: 1 }, { a: 2 })).toBe(false)
  })
})

describe('cssRule', () => {
  test('number with unit', () => {
    const f: EditorField = {
      id: 'x',
      label: 'X',
      type: 'number',
      semantic: 'tool',
      initial: 16,
      cssVar: '--x',
      constraints: { unit: 'px' },
    }
    expect(__test__.cssRule(f, 16)).toBe('--x: 16px;')
  })
  test('no cssVar returns null', () => {
    const f: EditorField = { id: 'x', label: 'X', type: 'string', semantic: 'tool', initial: '' }
    expect(__test__.cssRule(f, 'foo')).toBeNull()
  })
  test('boolean emits 1/0', () => {
    const f: EditorField = {
      id: 'x',
      label: 'X',
      type: 'boolean',
      semantic: 'tool',
      initial: false,
      cssVar: '--x',
    }
    expect(__test__.cssRule(f, true)).toBe('--x: 1;')
    expect(__test__.cssRule(f, false)).toBe('--x: 0;')
  })
})

describe('exportSnapshot integration', () => {
  const fields: EditorField[] = [
    { id: 'a', label: 'A', type: 'number', semantic: 'tool', initial: 16, cssVar: '--a' },
    { id: 'b', label: 'B', type: 'string', semantic: 'tool', initial: 'hi' },
  ]

  test('json format', () => {
    const host = makeHost(fields)
    host.setValue('a', 20)
    const out = exportSnapshot(host, { format: 'json' })
    const parsed = JSON.parse(out)
    expect(parsed.a).toBe(20)
    expect(parsed.b).toBe('hi')
  })

  test('yaml format flat', () => {
    const host = makeHost(fields)
    host.setValue('a', 20)
    const out = exportSnapshot(host, { format: 'yaml' })
    expect(out).toContain('a: 20')
    expect(out).toContain('b: hi')
  })

  test('css format emits only cssVar-bound', () => {
    const host = makeHost(fields)
    host.setValue('a', 20)
    const out = exportSnapshot(host, { format: 'css' })
    expect(out).toContain('--a: 20')
    expect(out).toContain('/* b:')
  })

  test('css-patch only changed', () => {
    const host = makeHost(fields)
    host.setValue('a', 20) // changed
    const out = exportSnapshot(host, { format: 'css-patch' })
    expect(out).toContain('--a: 20')
    expect(out).not.toContain('/* b')
  })

  test('css-patch with no changes', () => {
    const host = makeHost(fields)
    const out = exportSnapshot(host, { format: 'css-patch' })
    expect(out).toBe('/* no changes */')
  })

  test('onlyChanged filter', () => {
    const host = makeHost(fields)
    host.setValue('a', 20)
    const out = exportSnapshot(host, { format: 'json', onlyChanged: true })
    const parsed = JSON.parse(out)
    expect(parsed.a).toBe(20)
    expect(parsed.b).toBeUndefined()
  })
})
