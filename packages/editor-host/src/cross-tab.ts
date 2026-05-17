/**
 * creoui-editor-host — Cross-tab sync (F5)
 *
 * BroadcastChannel で同 origin の複数 tab 間で editor values を同期。1 tab で
 * slider を動かすと他 tab の Content が追従する。setValue の silent option で
 * loop を防ぐ。
 */
import type { EditorHost } from './types'

export interface CrossTabOptions {
  /** BroadcastChannel 名 (default: 'creoui-editor-host:{namespace}') */
  channel?: string
  /** namespace (localStorageNamespace と同値を期待、default 'creoui-editor-host') */
  namespace?: string
}

type Msg =
  | { t: 'set'; id: string; value: unknown; origin: string }
  | { t: 'hello'; origin: string }
  | { t: 'snapshot'; values: Record<string, unknown>; origin: string }

function defaultChannelName(namespace: string): string {
  return `creoui-editor-host:${namespace}`
}

function generateTabId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `tab-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
}

export function installCrossTabSync(host: EditorHost, opts: CrossTabOptions = {}): () => void {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    console.warn('[creoEditor/cross-tab] BroadcastChannel が未対応の環境です')
    return () => {}
  }

  const namespace = opts.namespace ?? 'creoui-editor-host'
  const channelName = opts.channel ?? defaultChannelName(namespace)
  const tabId = generateTabId()
  const channel = new BroadcastChannel(channelName)

  // 受信 handler
  const onMessage = (ev: MessageEvent<Msg>): void => {
    const msg = ev.data
    if (!msg || typeof msg !== 'object') return
    if (msg.origin === tabId) return

    if (msg.t === 'set') {
      if (!host.getField(msg.id)) return
      host.setValue(msg.id, msg.value, { silent: true })
    } else if (msg.t === 'snapshot') {
      for (const [id, value] of Object.entries(msg.values)) {
        if (!host.getField(id)) continue
        host.setValue(id, value, { silent: true })
      }
    } else if (msg.t === 'hello') {
      // 新参 tab に現 snapshot を返す
      const values = host.values()
      const snapshot: Msg = { t: 'snapshot', values, origin: tabId }
      try {
        channel.postMessage(snapshot)
      } catch {
        // ignore
      }
    }
  }
  channel.addEventListener('message', onMessage)

  // 送信: onAnyChange (silent=false、自分の setValue のみ broadcast)
  const unsubscribeChange = host.onAnyChange((id, value) => {
    const msg: Msg = { t: 'set', id, value, origin: tabId }
    try {
      channel.postMessage(msg)
    } catch {
      // serialization 失敗 (function / circular ref 等) は ignore
    }
  })

  // 参加通知
  try {
    channel.postMessage({ t: 'hello', origin: tabId } satisfies Msg)
  } catch {
    // ignore
  }

  return () => {
    channel.removeEventListener('message', onMessage)
    unsubscribeChange()
    try {
      channel.close()
    } catch {
      // ignore
    }
  }
}

export const __test__ = { defaultChannelName, generateTabId }
