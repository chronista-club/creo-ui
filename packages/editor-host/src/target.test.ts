/**
 * bun test packages/editor-host/src/target.test.ts
 *
 * Target factories の単体テスト。DOM / localStorage 依存のものは Node 環境
 * で動かす時 guard が効いて no-op なので、純粋ロジックのみテスト。
 */
import { describe, expect, test } from 'bun:test'
import { ephemeralTarget, localStorageTarget, signalTarget } from './target'

describe('ephemeralTarget', () => {
  test('initial value', () => {
    const t = ephemeralTarget('foo', 42)
    expect(t.id).toBe('foo')
    expect(t.initial).toBe(42)
    expect(t.get()).toBe(42)
  })

  test('set updates value', () => {
    const t = ephemeralTarget('foo', 1)
    t.set(99)
    expect(t.get()).toBe(99)
  })

  test('subscribe called on change', () => {
    const t = ephemeralTarget('foo', 0)
    const events: number[] = []
    const unsub = t.subscribe?.((v) => events.push(v))
    t.set(1)
    t.set(2)
    unsub?.()
    t.set(3)
    expect(events).toEqual([1, 2])
  })

  test('setting same value does not trigger', () => {
    const t = ephemeralTarget('foo', 5)
    const events: number[] = []
    t.subscribe?.((v) => events.push(v))
    t.set(5)
    t.set(5)
    expect(events).toEqual([])
  })
})

describe('signalTarget', () => {
  test('reads through accessor', () => {
    let storage = 10
    const get = () => storage
    const set = (v: number): void => {
      storage = v
    }
    const t = signalTarget('foo', get, set)
    expect(t.initial).toBe(10)
    expect(t.get()).toBe(10)
    t.set(42)
    expect(t.get()).toBe(42)
  })
})

describe('localStorageTarget', () => {
  test('falls back to initial when localStorage is absent', () => {
    // Node 環境に localStorage がある場合もあるが、SSR fallback パスを確認
    const t = localStorageTarget('test.ls', 'hello')
    expect(t.id).toBe('test.ls')
    expect(t.initial).toBe('hello')
    // get()/set() が throw しないことを確認
    expect(() => t.set('world')).not.toThrow()
    expect(() => t.get()).not.toThrow()
  })
})
