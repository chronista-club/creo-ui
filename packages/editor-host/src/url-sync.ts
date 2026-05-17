/**
 * @chronista-club/creoui-editor-host — URL shareable state (F4)
 *
 * location.hash に editor state を base64-encoded JSON で書く / 読む。
 * autoSync: setValue で自動 hash 更新。autoApply: mount 時に hash から復元。
 *
 * hash 形式:
 *   #creo=<base64url-encoded JSON>                 単独
 *   #other=foo&creo=<base64url-encoded JSON>       他 fragment と共存 (& 区切り)
 */
import type { EditorHost } from './types'

export interface UrlSyncOptions {
  /** hash の segment key (default 'creo') */
  key?: string
  /** setValue で自動 hash 更新 (default false) */
  autoSync?: boolean
  /** onMount で hash → setValue (default false) */
  autoApply?: boolean
  /** 変更された field だけ encode (default true) */
  onlyChanged?: boolean
}

const DEFAULT_KEY = 'creo'

function toBase64Url(input: string): string {
  if (typeof btoa !== 'function') return ''
  const b64 = btoa(unescape(encodeURIComponent(input)))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(input: string): string | null {
  if (typeof atob !== 'function') return null
  try {
    let b64 = input.replace(/-/g, '+').replace(/_/g, '/')
    while (b64.length % 4 !== 0) b64 += '='
    return decodeURIComponent(escape(atob(b64)))
  } catch {
    return null
  }
}

function collectPayload(host: EditorHost, onlyChanged: boolean): Record<string, unknown> {
  const values = host.values()
  if (!onlyChanged) return { ...values }
  const out: Record<string, unknown> = {}
  for (const field of host.fields()) {
    const value = values[field.id]
    const changed = (() => {
      try {
        return JSON.stringify(value) !== JSON.stringify(field.initial)
      } catch {
        return !Object.is(value, field.initial)
      }
    })()
    if (changed) out[field.id] = value
  }
  return out
}

/** 現 hash から segments を map として取り出す */
function parseHash(hash: string): Map<string, string> {
  const result = new Map<string, string>()
  const body = hash.startsWith('#') ? hash.slice(1) : hash
  if (!body) return result
  for (const seg of body.split('&')) {
    if (!seg) continue
    const eq = seg.indexOf('=')
    if (eq < 0) {
      result.set(seg, '')
    } else {
      result.set(seg.slice(0, eq), seg.slice(eq + 1))
    }
  }
  return result
}

function buildHash(segments: Map<string, string>): string {
  const parts: string[] = []
  for (const [k, v] of segments) parts.push(v ? `${k}=${v}` : k)
  return parts.length ? `#${parts.join('&')}` : ''
}

/** 現 URL に encoded state を書き込み、完成 URL string を返す */
export function shareUrl(host: EditorHost, opts: UrlSyncOptions = {}): string {
  const key = opts.key ?? DEFAULT_KEY
  const onlyChanged = opts.onlyChanged ?? true
  if (typeof window === 'undefined') return ''

  const payload = collectPayload(host, onlyChanged)
  const encoded = toBase64Url(JSON.stringify(payload))
  const segments = parseHash(window.location.hash)
  if (encoded) segments.set(key, encoded)
  else segments.delete(key)

  const newHash = buildHash(segments)
  const { origin, pathname, search } = window.location
  const newUrl = `${origin}${pathname}${search}${newHash}`
  // history.replaceState で reload せずに update
  if (newHash !== window.location.hash) {
    window.history.replaceState(null, '', newUrl)
  }
  return newUrl
}

/** hash から decode して host.setValue を呼ぶ。成功したら true */
export function applyFromUrl(host: EditorHost, opts: UrlSyncOptions = {}): boolean {
  const key = opts.key ?? DEFAULT_KEY
  if (typeof window === 'undefined') return false

  const segments = parseHash(window.location.hash)
  const encoded = segments.get(key)
  if (!encoded) return false

  const decoded = fromBase64Url(encoded)
  if (!decoded) {
    console.warn('[creoEditor/url-sync] base64 decode failed')
    return false
  }
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(decoded)
  } catch {
    console.warn('[creoEditor/url-sync] JSON parse failed')
    return false
  }

  let applied = 0
  for (const [id, value] of Object.entries(payload)) {
    if (!host.getField(id)) continue
    host.setValue(id, value)
    applied++
  }
  return applied > 0
}

/**
 * Provider onMount で install する URL sync。autoApply=true で初回 apply、
 * autoSync=true で onAnyChange hook で hash を連動更新 (loop 防止あり)。
 */
export function installUrlSync(host: EditorHost, opts: UrlSyncOptions = {}): () => void {
  if (typeof window === 'undefined') return () => {}
  const autoApply = opts.autoApply ?? false
  const autoSync = opts.autoSync ?? false

  if (autoApply) {
    try {
      applyFromUrl(host, opts)
    } catch (err) {
      console.warn('[creoEditor/url-sync] applyFromUrl threw:', err)
    }
  }

  let unsubscribe: (() => void) | null = null
  let lastHash = window.location.hash

  if (autoSync) {
    unsubscribe = host.onAnyChange(() => {
      try {
        shareUrl(host, opts)
        lastHash = window.location.hash
      } catch {
        // ignore
      }
    })
  }

  const onHashChange = (): void => {
    if (window.location.hash === lastHash) return
    lastHash = window.location.hash
    if (autoApply) {
      applyFromUrl(host, opts)
    }
  }
  window.addEventListener('hashchange', onHashChange)

  return () => {
    unsubscribe?.()
    window.removeEventListener('hashchange', onHashChange)
  }
}

export const __test__ = { parseHash, buildHash, toBase64Url, fromBase64Url, collectPayload }
