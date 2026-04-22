/**
 * bun test packages/editor-host/src/host.test.ts
 *
 * Core state のユニットテスト。DOM / localStorage が無い bun 環境でも通せるよう、
 * cssVar / localStorage persistence は条件付きスキップ (host.ts 側で guard)。
 */
import { describe, expect, test } from 'bun:test'
import { createEditorHost } from './host'
import type { EditorField } from './types'

function numberField(overrides: Partial<EditorField<number>> = {}): EditorField<number> {
  return {
    id: 'token.foo',
    label: 'Foo',
    type: 'number',
    semantic: 'tool',
    initial: 10,
    ...overrides,
  }
}

/** bun test 環境 (Node) には DOMRect が無いので plain object を cast */
function makeRect(x = 0, y = 0, w = 0, h = 0): DOMRect {
  return {
    x,
    y,
    width: w,
    height: h,
    top: y,
    right: x + w,
    bottom: y + h,
    left: x,
    toJSON: () => ({}),
  } as DOMRect
}

// ---------- Mode ----------

describe('mode', () => {
  test('default is off', () => {
    const host = createEditorHost()
    expect(host.mode()).toBe('off')
  })

  test('initialMode override', () => {
    const host = createEditorHost({ initialMode: 'on' })
    expect(host.mode()).toBe('on')
  })

  test('enable / disable / toggle', () => {
    const host = createEditorHost()
    host.enable()
    expect(host.mode()).toBe('on')
    host.disable()
    expect(host.mode()).toBe('off')
    host.toggle()
    expect(host.mode()).toBe('on')
    host.toggle()
    expect(host.mode()).toBe('off')
  })

  test('disable clears selection and hover', () => {
    const host = createEditorHost({ initialMode: 'on' })
    host.select({ targetId: 't1', fieldIds: ['f'], rect: makeRect(0, 0, 10, 10) })
    host.setHover({ targetId: 't2', fieldIds: ['g'], rect: makeRect(0, 0, 10, 10) })
    expect(host.selection()).not.toBeNull()
    host.disable()
    expect(host.selection()).toBeNull()
    expect(host.hover()).toBeNull()
  })
})

// ---------- Registration ----------

describe('register / getField / fields', () => {
  test('register adds fields and sets initial values', () => {
    const host = createEditorHost()
    host.register([numberField({ id: 'a', initial: 1 }), numberField({ id: 'b', initial: 2 })])
    expect(host.fields().map((f) => f.id)).toEqual(['a', 'b'])
    expect(host.getValue<number>('a')).toBe(1)
    expect(host.getValue<number>('b')).toBe(2)
  })

  test('re-registering same id does not duplicate', () => {
    const host = createEditorHost()
    host.register([numberField({ id: 'a', initial: 1 })])
    host.register([numberField({ id: 'a', initial: 999 })])
    expect(host.fields().filter((f) => f.id === 'a')).toHaveLength(1)
    // value は既に入っていたので上書きしない
    expect(host.getValue<number>('a')).toBe(1)
  })

  test('getField returns undefined for unknown id', () => {
    const host = createEditorHost()
    expect(host.getField('no-such')).toBeUndefined()
  })

  test('unregister removes field but preserves value', () => {
    const host = createEditorHost()
    const unregister = host.register([numberField({ id: 'a', initial: 5 })])
    unregister()
    expect(host.fields()).toHaveLength(0)
    // 値は retain (再 mount 用)
    expect(host.getValue<number>('a')).toBe(5)
  })
})

// ---------- Values ----------

describe('setValue / getValue / subscribe', () => {
  test('setValue updates and getValue returns', () => {
    const host = createEditorHost()
    host.register([numberField({ id: 'a', initial: 1 })])
    host.setValue<number>('a', 42)
    expect(host.getValue<number>('a')).toBe(42)
  })

  test('setValue ignored for unknown field', () => {
    const host = createEditorHost()
    host.setValue('ghost', 999)
    expect(host.getValue('ghost')).toBeUndefined()
  })

  test('subscribe receives updates, unsubscribe stops', () => {
    const host = createEditorHost()
    host.register([numberField({ id: 'a', initial: 1 })])
    const events: number[] = []
    const unsub = host.subscribe<number>('a', (v) => events.push(v))
    host.setValue('a', 2)
    host.setValue('a', 3)
    unsub()
    host.setValue('a', 4)
    expect(events).toEqual([2, 3])
  })

  test('apply callback called on setValue and on initial register', () => {
    const host = createEditorHost()
    const applied: number[] = []
    host.register([
      numberField({
        id: 'a',
        initial: 7,
        apply: (v) => applied.push(v as number),
      }),
    ])
    expect(applied).toEqual([7])
    host.setValue('a', 11)
    expect(applied).toEqual([7, 11])
  })
})

// ---------- Selection ----------

describe('selection', () => {
  test('select / clearSelection', () => {
    const host = createEditorHost()
    const info = { targetId: 'card-1', fieldIds: ['a'], rect: makeRect(0, 0, 10, 10) }
    host.select(info)
    expect(host.selection()?.targetId).toBe('card-1')
    host.clearSelection()
    expect(host.selection()).toBeNull()
  })

  test('hover independent of selection', () => {
    const host = createEditorHost()
    host.setHover({ targetId: 'h', fieldIds: [], rect: makeRect() })
    expect(host.hover()?.targetId).toBe('h')
    expect(host.selection()).toBeNull()
  })
})

// ---------- MCP ----------

describe('mcp', () => {
  test('listFields returns all when no filter', () => {
    const host = createEditorHost()
    host.register([
      numberField({ id: 'a', semantic: 'tool', role: 'dev' }),
      numberField({ id: 'b', semantic: 'global', role: 'user' }),
    ])
    expect(
      host.mcp
        .listFields()
        .map((f) => f.id)
        .sort(),
    ).toEqual(['a', 'b'])
  })

  test('listFields filters by semantic', () => {
    const host = createEditorHost()
    host.register([
      numberField({ id: 'a', semantic: 'tool' }),
      numberField({ id: 'b', semantic: 'global' }),
    ])
    expect(host.mcp.listFields({ semantic: 'global' }).map((f) => f.id)).toEqual(['b'])
  })

  test('listFields filters by role', () => {
    const host = createEditorHost()
    host.register([numberField({ id: 'a', role: 'dev' }), numberField({ id: 'b', role: 'agent' })])
    expect(host.mcp.listFields({ role: 'agent' }).map((f) => f.id)).toEqual(['b'])
  })

  test('mcp.setValue / getValue delegate to host', () => {
    const host = createEditorHost()
    host.register([numberField({ id: 'a', initial: 1 })])
    host.mcp.setValue('a', 99)
    expect(host.mcp.getValue<number>('a')).toBe(99)
  })

  test('mcp.mode / enable / disable', () => {
    const host = createEditorHost()
    expect(host.mcp.mode()).toBe('off')
    host.mcp.enable()
    expect(host.mcp.mode()).toBe('on')
    host.mcp.disable()
    expect(host.mcp.mode()).toBe('off')
  })
})
