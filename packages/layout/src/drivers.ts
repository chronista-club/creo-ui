/**
 * drivers — t を進める者たち（LE-7）。
 *
 * interpolate / scrub は t を受けるだけで、時間は常に外から来る:
 *   - time driver : curve（spring 等）が実時間で t を進める（従来のアニメーション相当）
 *   - jump driver : t を即 to に（prefers-reduced-motion は「jump driver の選択」に落ちる）
 *   - hand driver : fader / gesture がそのまま handle.scrub を呼ぶ（driver 実装は不要）
 *
 * curve は構造型 `TimeCurve` — creo-ui-frame の `springCurve` がそのまま刺さるが、
 * core は frame を import しない（LE-7）。frame 不在の consumer（VP webview 等）は
 * `defaultCurve` で動く。
 *
 * DOM 依存ゼロの規律: requestAnimationFrame は typeof ガード付きで使い、非 browser では
 * setTimeout に落ちる（テストは schedule 注入で決定的に回す）。
 */

import type { SettleAuthor, TransitionHandle } from './engine'

/**
 * 経過時間 → 進行度の純関数。position は 0 始まりで settleTime 秒後に ≈1 に静定。
 * 1 超え（spring の overshoot）は許すが、scrub 側で [0,1] に clamp される —
 * 面積和 = 1 の invariant を外挿で壊さないため（overshoot の表現は frame / WAAPI の領分）
 */
export interface TimeCurve {
  position(elapsedSeconds: number): number
  settleTime: number
}

/**
 * 既定 curve = 臨界減衰 spring の閉形式（overshoot なし、約 0.35s で静定）。
 * ω = 26.4 は |x - 1| < 0.001 が 0.35s になる値。frame の springCurve を使えば
 * preset（gentle / wobbly / …）で差し替えられる
 */
export const defaultCurve: TimeCurve = {
  position: (t) => 1 - Math.exp(-26.4 * t) * (1 + 26.4 * t),
  settleTime: 0.35,
}

export interface DriverRun {
  cancel(): void
  /** true = 端点まで走り切った / false = cancel された */
  finished: Promise<boolean>
}

export interface TransitionDriver {
  /** apply に t を流し込む。range で部分区間（release の「現在地 → 端点」等）を駆動 */
  start(apply: (t: number) => void, range?: { from?: number; to?: number }): DriverRun
}

export interface TimeDriverOptions {
  curve?: TimeCurve
  /** ms 時計（テスト注入用。既定 = performance.now / Date.now） */
  now?: () => number
  /** 次 frame の予約（テスト注入用。既定 = rAF、非 browser は setTimeout 16ms）。戻り値 = 予約取消 */
  schedule?: (cb: () => void) => () => void
}

const defaultNow = (): number =>
  typeof performance !== 'undefined' ? performance.now() : Date.now()

const defaultSchedule = (cb: () => void): (() => void) => {
  if (typeof requestAnimationFrame === 'function') {
    const id = requestAnimationFrame(() => cb())
    return () => cancelAnimationFrame(id)
  }
  const id = setTimeout(cb, 16)
  return () => clearTimeout(id)
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n))

/** time driver: curve を実時間で sample して t を進める。settleTime 到達で必ず to に着地 */
export function createTimeDriver(options: TimeDriverOptions = {}): TransitionDriver {
  const curve = options.curve ?? defaultCurve
  const now = options.now ?? defaultNow
  const schedule = options.schedule ?? defaultSchedule

  return {
    start(apply, range = {}) {
      const from = range.from ?? 0
      const to = range.to ?? 1
      let cancelled = false
      let cancelTick: (() => void) | null = null
      let resolveFinished!: (v: boolean) => void
      const finished = new Promise<boolean>((r) => {
        resolveFinished = r
      })
      const startAt = now()

      const step = (): void => {
        if (cancelled) return
        const elapsed = (now() - startAt) / 1000
        if (elapsed >= curve.settleTime) {
          apply(to)
          resolveFinished(true)
          return
        }
        // 壊れた curve 値はその frame を from 側に倒すだけ — settleTime で必ず終端に着く
        const p = clamp01(curve.position(elapsed))
        apply(from + (to - from) * (Number.isFinite(p) ? p : 0))
        cancelTick = schedule(step)
      }
      // 初回も schedule 経由（start の同期中に apply しない — 呼び手の再入を避ける）
      cancelTick = schedule(step)

      return {
        cancel() {
          if (cancelled) return
          cancelled = true
          cancelTick?.()
          resolveFinished(false)
        },
        finished,
      }
    },
  }
}

/** jump driver: 即 to（reduced-motion / テンポの速い操作用）。同期に apply する */
export const jumpDriver: TransitionDriver = {
  start(apply, range = {}) {
    apply(range.to ?? 1)
    return { cancel() {}, finished: Promise.resolve(true) }
  },
}

/**
 * スクラブ手放しの着地（§5）: 近い端点へ driver で運び、1 なら commit / 0 なら cancel。
 * 「一時状態は必ず settle 状態に着地する」の実行形
 */
export function settleRelease(
  handle: TransitionHandle,
  driver: TransitionDriver,
  author: SettleAuthor = 'human',
): DriverRun {
  const to = handle.nearestEndpoint()
  const run = driver.start((t) => handle.scrub(t), { from: handle.t, to })
  run.finished.then((ok) => {
    if (!ok || handle.done) return
    if (to === 1) handle.commit(author)
    else handle.cancel()
  })
  return run
}
