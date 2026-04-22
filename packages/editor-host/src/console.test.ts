/**
 * bun test packages/editor-host/src/console.test.ts
 *
 * Console API の shape と "host に forward される" 挙動を確認。SolidJS owner
 * が null でも sugar (cssVar 系) が動くことをテスト (browser と Node で同じ
 * 実行パス)。
 */
import { describe, expect, test } from 'bun:test'
import { buildConsoleApi } from './console'
import { createEditorHost } from './host'

function makeApi() {
  const host = createEditorHost()
  const api = buildConsoleApi({
    host,
    owner: null,
    exportSnapshot: () => 'MOCK_EXPORT',
    shareUrl: () => 'MOCK_URL',
    autoDiscover: () => [],
  })
  return { host, api }
}

describe('buildConsoleApi — shape', () => {
  test('contains version, factories, sugar', () => {
    const { api } = makeApi()
    expect(api.version).toBeString()
    expect(typeof api.bind).toBe('function')
    expect(typeof api.slider).toBe('function')
    expect(typeof api.picker).toBe('function')
    expect(typeof api.flip).toBe('function')
    expect(typeof api.chooser).toBe('function')
    expect(api.t.cssVar).toBeDefined()
    expect(api.c.number).toBeDefined()
    expect(api.mode.enable).toBeDefined()
  })
})

describe('buildConsoleApi — mode', () => {
  test('enable / disable / toggle / is mirror host', () => {
    const { host, api } = makeApi()
    expect(api.mode.is()).toBe('off')
    api.mode.enable()
    expect(host.mode()).toBe('on')
    api.mode.disable()
    expect(host.mode()).toBe('off')
    api.mode.toggle()
    expect(host.mode()).toBe('on')
  })
})

describe('buildConsoleApi — inspection', () => {
  test('fields / values / getValue / setValue delegate to host', () => {
    const { host, api } = makeApi()
    host.register([{ id: 'foo', label: 'Foo', type: 'number', semantic: 'tool', initial: 10 }])
    expect(api.values().foo).toBe(10)
    api.setValue('foo', 42)
    expect(api.getValue<number>('foo')).toBe(42)
    expect(api.fields().map((f) => f.id)).toContain('foo')
  })
})

describe('buildConsoleApi — snapshot / restore', () => {
  test('snapshot captures current, restore applies back', () => {
    const { host, api } = makeApi()
    host.register([
      { id: 'a', label: 'A', type: 'number', semantic: 'tool', initial: 1 },
      { id: 'b', label: 'B', type: 'number', semantic: 'tool', initial: 2 },
    ])
    const snap = api.snapshot()
    api.setValue('a', 100)
    api.setValue('b', 200)
    expect(host.getValue<number>('a')).toBe(100)
    api.restore(snap)
    expect(host.getValue<number>('a')).toBe(1)
    expect(host.getValue<number>('b')).toBe(2)
  })
})

describe('buildConsoleApi — share / export delegate', () => {
  test('share returns injected mock', () => {
    const { api } = makeApi()
    expect(api.share()).toBe('MOCK_URL')
  })
  test('export returns injected mock', () => {
    const { api } = makeApi()
    expect(api.export()).toBe('MOCK_EXPORT')
  })
})
