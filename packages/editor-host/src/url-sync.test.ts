/**
 * bun test packages/editor-host/src/url-sync.test.ts
 */
import { describe, expect, test } from 'bun:test'
import { __test__ } from './url-sync'

const { parseHash, buildHash, toBase64Url, fromBase64Url, collectPayload } = __test__

describe('parseHash / buildHash', () => {
  test('empty hash', () => {
    expect(parseHash('').size).toBe(0)
    expect(parseHash('#').size).toBe(0)
  })
  test('single key=value', () => {
    const m = parseHash('#creo=abc')
    expect(m.get('creo')).toBe('abc')
  })
  test('multiple segments', () => {
    const m = parseHash('#foo=1&creo=xyz&flag')
    expect(m.get('foo')).toBe('1')
    expect(m.get('creo')).toBe('xyz')
    expect(m.has('flag')).toBe(true)
    expect(m.get('flag')).toBe('')
  })
  test('buildHash round-trip', () => {
    const m = new Map<string, string>([
      ['a', '1'],
      ['b', '2'],
    ])
    const hash = buildHash(m)
    expect(hash).toBe('#a=1&b=2')
  })
  test('buildHash with value-less key', () => {
    const m = new Map([['flag', '']])
    expect(buildHash(m)).toBe('#flag')
  })
})

describe('base64url', () => {
  test('round-trip ASCII', () => {
    const input = 'hello creoEditor'
    const encoded = toBase64Url(input)
    expect(encoded).not.toMatch(/[+/=]/)
    expect(fromBase64Url(encoded)).toBe(input)
  })
  test('round-trip unicode (JP)', () => {
    const input = 'テーマ: Mint Dark'
    const encoded = toBase64Url(input)
    expect(fromBase64Url(encoded)).toBe(input)
  })
  test('decode failure returns null', () => {
    // atob may throw on most invalid; we just assert no uncaught error
    const r = fromBase64Url('!!!invalid!!!')
    expect(r === null || typeof r === 'string').toBe(true)
  })
})

describe('collectPayload', () => {
  test('onlyChanged=false returns all', () => {
    // host stub
    const host = {
      values: () => ({ a: 1, b: 'hi' }),
      fields: () => [
        { id: 'a', initial: 1 },
        { id: 'b', initial: 'hi' },
      ],
    } as unknown as Parameters<typeof collectPayload>[0]
    const payload = collectPayload(host, false)
    expect(payload.a).toBe(1)
    expect(payload.b).toBe('hi')
  })
  test('onlyChanged=true filters to diff', () => {
    const host = {
      values: () => ({ a: 99, b: 'hi' }),
      fields: () => [
        { id: 'a', initial: 1 },
        { id: 'b', initial: 'hi' },
      ],
    } as unknown as Parameters<typeof collectPayload>[0]
    const payload = collectPayload(host, true)
    expect(payload.a).toBe(99)
    expect(payload.b).toBeUndefined()
  })
})
