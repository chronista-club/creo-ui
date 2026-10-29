/**
 * bun test packages/editor-host/src/link.test.ts
 *
 * Editor Link (D-16) — host を外の相手 (VP hub 等) と JSON で繋ぐ。transport は
 * 差し替え可能なので、ここでは fake transport で wire の往復だけを検証する。
 * WebSocket 本体は触らない (ws-link.test.ts は backoff の純計算のみ)。
 */
import { describe, expect, test } from 'bun:test'
import { createEditorHost } from './host'
import {
  DEFAULT_LINK_URL,
  installLink,
  LINK_VERSION,
  type LinkInbound,
  type LinkOutbound,
  type LinkTransport,
  parseInbound,
  toLinkField,
  toLinkSelection,
} from './link'
import type { EditorField, SelectionInfo } from './types'

function numberField(overrides: Partial<EditorField<number>> = {}): EditorField<number> {
  return {
    id: 'token.foo',
    label: 'Foo',
    type: 'number',
    semantic: 'tool',
    initial: 10,
    constraints: { min: 0, max: 100, step: 1, unit: 'px' },
    ...overrides,
  }
}

function makeRect(): DOMRect {
  return {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    top: 0,
    right: 10,
    bottom: 10,
    left: 0,
    toJSON: () => ({}),
  } as DOMRect
}

/** 送信を配列に貯め、open / message を手で起こせる fake transport */
function fakeTransport(opts: { open?: boolean } = {}) {
  const sent: LinkOutbound[] = []
  const openHandlers = new Set<() => void>()
  const messageHandlers = new Set<(text: string) => void>()
  let open = opts.open ?? false
  let closed = false
  const transport: LinkTransport = {
    send: (text) => {
      sent.push(JSON.parse(text) as LinkOutbound)
    },
    onOpen: (cb) => {
      openHandlers.add(cb)
      return () => openHandlers.delete(cb)
    },
    onMessage: (cb) => {
      messageHandlers.add(cb)
      return () => messageHandlers.delete(cb)
    },
    isOpen: () => open,
    close: () => {
      closed = true
    },
  }
  return {
    transport,
    sent,
    get closed() {
      return closed
    },
    simulateOpen() {
      open = true
      for (const cb of openHandlers) cb()
    },
    receive(msg: LinkInbound | Record<string, unknown>) {
      for (const cb of messageHandlers) cb(JSON.stringify(msg))
    },
  }
}

const kinds = (sent: LinkOutbound[]): string[] => sent.map((m) => m.t)

// ---------- Pure mapping ----------

describe('toLinkField', () => {
  test('keeps the declarative part and drops functions', () => {
    const field = numberField({
      id: 'a',
      scope: 'component',
      group: 'card',
      order: 3,
      role: 'user',
      persistence: 'localStorage',
      cssVar: '--_card__pad',
      apply: () => {},
    })
    const link = toLinkField(field)
    expect(link).toEqual({
      id: 'a',
      label: 'Foo',
      type: 'number',
      semantic: 'tool',
      scope: 'component',
      group: 'card',
      order: 3,
      role: 'user',
      persistence: 'localStorage',
      constraints: { min: 0, max: 100, step: 1, unit: 'px' },
      initial: 10,
      cssVar: '--_card__pad',
    })
    expect('apply' in link).toBe(false)
    // wire に乗る形そのものが JSON round-trip で不変
    expect(JSON.parse(JSON.stringify(link))).toEqual(link)
  })

  test('omits absent optionals instead of emitting undefined keys', () => {
    const link = toLinkField(numberField({ id: 'b', constraints: undefined }))
    expect(Object.keys(link).sort()).toEqual(['id', 'initial', 'label', 'semantic', 'type'])
  })
})

describe('toLinkSelection', () => {
  test('drops element / rect and keeps ids', () => {
    const info: SelectionInfo = {
      targetId: 'card-1',
      fieldIds: ['a', 'b'],
      componentId: 'card',
      rect: makeRect(),
    }
    expect(toLinkSelection(info)).toEqual({
      targetId: 'card-1',
      fieldIds: ['a', 'b'],
      componentId: 'card',
    })
    expect(toLinkSelection(null)).toBeNull()
  })
})

describe('parseInbound', () => {
  test('accepts the three inbound messages', () => {
    expect(parseInbound('{"t":"set","id":"a","value":5}')).toEqual({ t: 'set', id: 'a', value: 5 })
    expect(parseInbound('{"t":"mode","mode":"on"}')).toEqual({ t: 'mode', mode: 'on' })
    expect(parseInbound('{"t":"get"}')).toEqual({ t: 'get' })
  })

  test('rejects garbage, unknown kinds and malformed payloads', () => {
    expect(parseInbound('not json')).toBeNull()
    expect(parseInbound('42')).toBeNull()
    expect(parseInbound('{"t":"select","targetId":"x"}')).toBeNull()
    expect(parseInbound('{"t":"set","id":7}')).toBeNull()
    expect(parseInbound('{"t":"mode","mode":"maybe"}')).toBeNull()
  })
})

// ---------- installLink: outbound ----------

describe('installLink / outbound', () => {
  test('sends hello and a full snapshot when the transport opens', () => {
    const host = createEditorHost({ initialMode: 'on' })
    host.register([numberField({ id: 'a', initial: 1 })])
    host.select({ targetId: 'card-1', fieldIds: ['a'], rect: makeRect() })
    const fake = fakeTransport()
    installLink(host, { transport: fake.transport, app: 'creo-ui', surface: 's1' })

    expect(fake.sent).toHaveLength(0)
    fake.simulateOpen()

    expect(kinds(fake.sent)).toEqual(['hello', 'mode', 'fields', 'selection', 'values'])
    expect(fake.sent[0]).toEqual({ t: 'hello', v: LINK_VERSION, app: 'creo-ui', surface: 's1' })
    expect(fake.sent[1]).toEqual({ t: 'mode', mode: 'on' })
    expect(fake.sent[2]).toEqual({
      t: 'fields',
      fields: [toLinkField(host.getField('a') as EditorField)],
    })
    expect(fake.sent[3]).toEqual({
      t: 'selection',
      selection: { targetId: 'card-1', fieldIds: ['a'] },
    })
    expect(fake.sent[4]).toEqual({ t: 'values', values: { a: 1 } })
  })

  test('sends the snapshot immediately when the transport is already open', () => {
    const host = createEditorHost()
    const fake = fakeTransport({ open: true })
    installLink(host, { transport: fake.transport, app: 'x' })
    expect(kinds(fake.sent)).toEqual(['hello', 'mode', 'fields', 'selection', 'values'])
  })

  test('mirrors local changes: set / mode / fields / selection', () => {
    const host = createEditorHost()
    const fake = fakeTransport({ open: true })
    installLink(host, { transport: fake.transport, app: 'x' })
    fake.sent.length = 0

    const unregister = host.register([numberField({ id: 'a', initial: 1 })])
    host.setValue('a', 2)
    host.enable()
    host.select({ targetId: 'card-1', fieldIds: ['a'], rect: makeRect() })
    host.disable() // selection も消える
    unregister()

    expect(fake.sent).toEqual([
      { t: 'fields', fields: [toLinkField(numberField({ id: 'a', initial: 1 }))] },
      { t: 'set', id: 'a', value: 2 },
      { t: 'mode', mode: 'on' },
      { t: 'selection', selection: { targetId: 'card-1', fieldIds: ['a'] } },
      { t: 'mode', mode: 'off' },
      { t: 'selection', selection: null },
      { t: 'fields', fields: [] },
    ])
  })

  test('uninstall stops mirroring and closes the transport', () => {
    const host = createEditorHost()
    const fake = fakeTransport({ open: true })
    const uninstall = installLink(host, { transport: fake.transport, app: 'x' })
    host.register([numberField({ id: 'a', initial: 1 })])
    fake.sent.length = 0

    uninstall()
    host.setValue('a', 5)
    host.enable()
    expect(fake.sent).toHaveLength(0)
    expect(fake.closed).toBe(true)
  })
})

// ---------- installLink: inbound ----------

describe('installLink / inbound', () => {
  test('set applies to a known field without echoing it back', () => {
    const host = createEditorHost()
    host.register([numberField({ id: 'a', initial: 1 })])
    const fake = fakeTransport({ open: true })
    installLink(host, { transport: fake.transport, app: 'x' })
    const seen: number[] = []
    host.subscribe<number>('a', (v) => seen.push(v))
    fake.sent.length = 0

    fake.receive({ t: 'set', id: 'a', value: 42 })

    expect(host.getValue<number>('a')).toBe(42)
    // Content 側の購読者 (bind の signal mirror 等) には届く
    expect(seen).toEqual([42])
    // 送り主へは返さない (echo loop 回避)
    expect(fake.sent).toHaveLength(0)
  })

  test('set for an unknown field is ignored', () => {
    const host = createEditorHost()
    const fake = fakeTransport({ open: true })
    installLink(host, { transport: fake.transport, app: 'x' })
    fake.receive({ t: 'set', id: 'ghost', value: 1 })
    expect(host.getValue('ghost')).toBeUndefined()
  })

  test('remote mode off still reports the selection it cleared (review #178-1)', () => {
    const host = createEditorHost({ initialMode: 'on' })
    host.select({ targetId: 'card-1', fieldIds: ['a'], rect: makeRect() })
    const fake = fakeTransport({ open: true })
    installLink(host, { transport: fake.transport, app: 'x' })
    fake.sent.length = 0

    fake.receive({ t: 'mode', mode: 'off' })

    expect(host.selection()).toBeNull()
    // mode そのものは echo しないが、相手が知らない副作用 (selection の clear) は流す
    expect(fake.sent).toEqual([{ t: 'selection', selection: null }])
  })

  test('mode switches the host without echo', () => {
    const host = createEditorHost()
    const fake = fakeTransport({ open: true })
    installLink(host, { transport: fake.transport, app: 'x' })
    fake.sent.length = 0

    fake.receive({ t: 'mode', mode: 'on' })
    expect(host.mode()).toBe('on')
    fake.receive({ t: 'mode', mode: 'off' })
    expect(host.mode()).toBe('off')
    expect(fake.sent).toHaveLength(0)
  })

  test('get replies with the snapshot (without hello)', () => {
    const host = createEditorHost()
    host.register([numberField({ id: 'a', initial: 1 })])
    const fake = fakeTransport({ open: true })
    installLink(host, { transport: fake.transport, app: 'x' })
    fake.sent.length = 0

    fake.receive({ t: 'get' })
    expect(kinds(fake.sent)).toEqual(['mode', 'fields', 'selection', 'values'])
  })

  test('garbage on the wire is ignored', () => {
    const host = createEditorHost()
    const fake = fakeTransport({ open: true })
    installLink(host, { transport: fake.transport, app: 'x' })
    fake.sent.length = 0
    fake.receive({ t: 'select', targetId: 'x' })
    fake.receive({ t: 'set', id: 42, value: 1 })
    expect(fake.sent).toHaveLength(0)
    expect(host.mode()).toBe('off')
  })
})

describe('defaults', () => {
  test('the URL is fixed so surfaces need no configuration', () => {
    expect(DEFAULT_LINK_URL).toBe('ws://127.0.0.1:32000/link')
  })
})
