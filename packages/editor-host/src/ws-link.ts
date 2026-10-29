/**
 * @chronista-club/creo-ui-editor-host — WebSocket transport for the Editor Link
 *
 * URL は固定 (`DEFAULT_LINK_URL`) が前提。相手 (VP daemon) が居なければ再接続を
 * 繰り返すだけで、Content にも Editor にも影響しない (D-6)。JS からは何も出さないが、
 * ブラウザ自身の接続エラーは console に出る (抑えられない)。閉じている間に送った
 * ものは捨てる — open のたびに Link が hello + snapshot を送り直すので、相手は
 * そこで追いつける。
 */
import type { LinkTransport } from './link'

export interface WsLinkOptions {
  /** 切れたら繋ぎ直す (default: true) */
  reconnect?: boolean
  /** 再接続間隔の上限 ms (default: 30_000)。1s から倍々で伸びる */
  maxDelayMs?: number
}

function reconnectDelay(attempt: number, maxDelayMs: number): number {
  return Math.min(1_000 * 2 ** attempt, maxDelayMs)
}

export function wsLink(url: string, opts: WsLinkOptions = {}): LinkTransport {
  const reconnect = opts.reconnect ?? true
  const maxDelayMs = opts.maxDelayMs ?? 30_000
  const openHandlers = new Set<() => void>()
  const messageHandlers = new Set<(text: string) => void>()
  let socket: WebSocket | null = null
  let attempt = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let closed = false

  function schedule(): void {
    if (closed || !reconnect || timer) return
    const delay = reconnectDelay(attempt, maxDelayMs)
    attempt += 1
    timer = setTimeout(() => {
      timer = null
      connect()
    }, delay)
  }

  function connect(): void {
    if (closed || typeof WebSocket === 'undefined') return
    let ws: WebSocket
    try {
      ws = new WebSocket(url)
    } catch {
      schedule()
      return
    }
    socket = ws
    ws.addEventListener('open', () => {
      attempt = 0
      for (const cb of openHandlers) cb()
    })
    ws.addEventListener('message', (ev) => {
      if (typeof ev.data !== 'string') return
      for (const cb of messageHandlers) cb(ev.data)
    })
    ws.addEventListener('close', () => {
      if (socket === ws) socket = null
      schedule()
    })
    // error の後は必ず close が来るので、再接続は close 側に任せる (console は汚さない)
    ws.addEventListener('error', () => {})
  }

  connect()

  return {
    send(text) {
      if (socket && socket.readyState === WebSocket.OPEN) socket.send(text)
    },
    onOpen(cb) {
      openHandlers.add(cb)
      return () => {
        openHandlers.delete(cb)
      }
    },
    onMessage(cb) {
      messageHandlers.add(cb)
      return () => {
        messageHandlers.delete(cb)
      }
    },
    isOpen() {
      return socket !== null && socket.readyState === WebSocket.OPEN
    },
    close() {
      closed = true
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      if (socket) {
        try {
          socket.close()
        } catch {
          // ignore
        }
        socket = null
      }
    },
  }
}

export const __test__ = { reconnectDelay }
