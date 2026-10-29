/**
 * @chronista-club/creo-ui-editor-host — Editor Link (D-16)
 *
 * host の fields / selection / values / mode を、外の相手 (VP daemon の hub 等) と
 * JSON で往復する。creo-ui が出すのは Editor protocol そのもので、相手がそれを
 * 何に写すか (机の MIDI 機材 / AI / 別アプリ) はここでは知らない。
 *
 * transport は差し替え可能 (default は `ws-link` の固定 URL)。cross-tab (F5) と
 * 同じ「install して返り値で外す」形で、相手が居なければ何も起きない (D-6)。
 *
 * wire の SSOT: docs/design/editor-link.md
 */
import type {
  EditorField,
  EditorFieldConstraints,
  EditorFieldType,
  EditorHost,
  EditorMode,
  EditorPersistence,
  EditorRole,
  EditorScope,
  EditorSemantic,
  SelectionInfo,
} from './types'
import { wsLink } from './ws-link'

/** 固定 URL — 面の側は設定なしで VP daemon に顔を出せる (mako 裁定 2026-10-30) */
export const DEFAULT_LINK_URL = 'ws://127.0.0.1:32000/link'

/** wire の版。互換を壊す変更で上げ、hello に載せる */
export const LINK_VERSION = 1

// ---------- Wire types ----------

/** EditorField の宣言部分だけ (関数は乗らない) */
export interface LinkField {
  id: string
  label: string
  type: EditorFieldType
  semantic: EditorSemantic
  scope?: EditorScope
  group?: string
  order?: number
  role?: EditorRole
  persistence?: EditorPersistence
  constraints?: EditorFieldConstraints
  initial: unknown
  cssVar?: string
}

/** SelectionInfo のうち、画面の外でも意味を持つ部分 (element / rect は乗らない) */
export interface LinkSelection {
  targetId: string
  fieldIds: string[]
  componentId?: string
}

/** 面 → 相手 */
export type LinkOutbound =
  | { t: 'hello'; v: number; app: string; surface: string }
  | { t: 'mode'; mode: EditorMode }
  | { t: 'fields'; fields: LinkField[] }
  | { t: 'selection'; selection: LinkSelection | null }
  | { t: 'values'; values: Record<string, unknown> }
  | { t: 'set'; id: string; value: unknown }

/** 相手 → 面 */
export type LinkInbound =
  | { t: 'set'; id: string; value: unknown }
  | { t: 'mode'; mode: EditorMode }
  | { t: 'get' }

/**
 * Link が使う transport。文字列を送受するだけで、JSON の encode / decode は
 * Link 側が持つ。WebSocket 以外 (wry の ipc 等) に差し替えられる。
 */
export interface LinkTransport {
  send(text: string): void
  onOpen(cb: () => void): () => void
  onMessage(cb: (text: string) => void): () => void
  /** install 時点で既に開いていれば、open を待たずに snapshot を送る */
  isOpen?(): boolean
  close(): void
}

export interface LinkOptions {
  /** 面の名札 (相手の一覧に出る)。default: document.title → location.host → 'editor-host' */
  app?: string
  /** 面の id。default: 生成 (tab ごとに違う) */
  surface?: string
  /** transport の差し替え。省略時は `wsLink(url)` */
  transport?: LinkTransport
  /** transport 省略時の WebSocket URL。default: DEFAULT_LINK_URL */
  url?: string
}

// ---------- Pure mapping ----------

export function toLinkField(field: EditorField): LinkField {
  const out: LinkField = {
    id: field.id,
    label: field.label,
    type: field.type,
    semantic: field.semantic,
    initial: field.initial,
  }
  if (field.scope !== undefined) out.scope = field.scope
  if (field.group !== undefined) out.group = field.group
  if (field.order !== undefined) out.order = field.order
  if (field.role !== undefined) out.role = field.role
  if (field.persistence !== undefined) out.persistence = field.persistence
  if (field.constraints !== undefined) out.constraints = field.constraints
  if (field.cssVar !== undefined) out.cssVar = field.cssVar
  return out
}

export function toLinkSelection(info: SelectionInfo | null): LinkSelection | null {
  if (!info) return null
  const out: LinkSelection = { targetId: info.targetId, fieldIds: [...info.fieldIds] }
  if (info.componentId !== undefined) out.componentId = info.componentId
  return out
}

/** 相手からの 1 message を検証して型に落とす。形が合わなければ null (黙って捨てる) */
export function parseInbound(text: string): LinkInbound | null {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return null
  }
  if (!raw || typeof raw !== 'object') return null
  const msg = raw as Record<string, unknown>
  switch (msg.t) {
    case 'set':
      if (typeof msg.id !== 'string' || !('value' in msg)) return null
      return { t: 'set', id: msg.id, value: msg.value }
    case 'mode':
      if (msg.mode !== 'on' && msg.mode !== 'off') return null
      return { t: 'mode', mode: msg.mode }
    case 'get':
      return { t: 'get' }
    default:
      return null
  }
}

function defaultAppName(): string {
  if (typeof document !== 'undefined' && document.title) return document.title
  if (typeof location !== 'undefined' && location.host) return location.host
  return 'editor-host'
}

function generateSurfaceId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `surface-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

// ---------- Install ----------

/**
 * host を transport に繋ぐ。open のたびに hello + snapshot を送り、以後は変化を
 * 流す。相手から届いた set / mode は host に適用するが、その結果を相手へ
 * 返さない (echo loop 回避)。相手が確認したければ `get` で snapshot を引く。
 */
export function installLink(host: EditorHost, opts: LinkOptions = {}): () => void {
  const transport = opts.transport ?? wsLink(opts.url ?? DEFAULT_LINK_URL)
  const app = opts.app ?? defaultAppName()
  const surface = opts.surface ?? generateSurfaceId()

  /** 相手からの適用中は、その変化を相手へ流さない */
  let applyingRemote = false

  function send(msg: LinkOutbound): void {
    try {
      transport.send(JSON.stringify(msg))
    } catch {
      // serialization 失敗 / 閉じた socket は無視 — Editor が Content を壊さない (D-6)
    }
  }

  function sendSnapshot(): void {
    send({ t: 'mode', mode: host.mode() })
    send({ t: 'fields', fields: host.fields().map(toLinkField) })
    send({ t: 'selection', selection: toLinkSelection(host.selection()) })
    send({ t: 'values', values: host.values() })
  }

  function sendHello(): void {
    send({ t: 'hello', v: LINK_VERSION, app, surface })
  }

  function applyInbound(msg: LinkInbound): void {
    if (msg.t === 'get') {
      sendSnapshot()
      return
    }
    applyingRemote = true
    try {
      if (msg.t === 'set') {
        if (host.getField(msg.id)) host.setValue(msg.id, msg.value)
      } else if (msg.mode === 'on') {
        host.enable()
      } else {
        host.disable()
      }
    } finally {
      applyingRemote = false
    }
  }

  const uninstallers: Array<() => void> = [
    host.onAnyChange((id, value) => {
      if (!applyingRemote) send({ t: 'set', id, value })
    }),
    host.onModeChange((mode) => {
      if (!applyingRemote) send({ t: 'mode', mode })
    }),
    host.onFieldsChange((fields) => {
      send({ t: 'fields', fields: fields.map(toLinkField) })
    }),
    host.onSelectionChange((selection) => {
      if (!applyingRemote) send({ t: 'selection', selection: toLinkSelection(selection) })
    }),
    transport.onOpen(() => {
      sendHello()
      sendSnapshot()
    }),
    transport.onMessage((text) => {
      const msg = parseInbound(text)
      if (msg) applyInbound(msg)
    }),
  ]

  if (transport.isOpen?.()) {
    sendHello()
    sendSnapshot()
  }

  return () => {
    for (const un of uninstallers.reverse()) un()
    try {
      transport.close()
    } catch {
      // ignore
    }
  }
}
