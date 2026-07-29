/**
 * engine — scope key ごとの Layout + settle log を束ねる（LE-11/17/18）。
 *
 * - scope: layout state の単位を型で明示（VP = lane、site = route 等。doc 47 §0 の教訓）
 * - settle log: 履歴 = 無名 Scene の列。永続 = log の末尾（consumer が保存し、復元は
 *   最後の entry を apply するだけ）。連続の knob stream は記録しない
 * - 一時状態（solo / Touch / scrub 逸脱）の戻り先 = last settle（restoreLastSettle）
 * - float の位置は ephemeral（Scene / log / token に直列化しない、LE-18）
 * - DOM 反映（action）は subscribe の外側 — renderer / MIDI motor が resolved を写す
 * - transition（LE-7/P3）: beginTransition が「今の表示」を base snapshot に凍結し、
 *   target への scrub を開く。t を進めるのは driver（drivers.ts / consumer）
 */

import { interpolate } from './interpolate'
import { resolve } from './resolve'
import type { Layout, ResolvedMap, ResolvedPane, Scene } from './types'
import { EMPTY_LAYOUT } from './types'

export type SettleAuthor = 'human' | 'ai' | 'scene'

export interface SettleEntry {
  readonly layout: Layout
  readonly at: number
  readonly author: SettleAuthor
}

export interface FloatPosition {
  readonly x: number
  readonly y: number
}

export type ResolvedListener = (scope: string, resolved: ResolvedMap) => void

/**
 * 進行中の遷移への操作面（LE-7）。t を進めるのは driver（time / hand / jump）で、
 * handle は「どこまで来たか」と「どちらに着地するか」だけを扱う。
 *
 * base は begin 時点の**投影 snapshot**（ResolvedMap）— scrub の中間形は構造の離散性を
 * rect 空間で回避したものなので Layout に逆変換できない。着地は常に端点:
 * commit = target が current になる / cancel = 元の layout のまま。
 *
 * seize（update / moveFloat / applyScene / restoreLastSettle）や後続の beginTransition で
 * 遷移が破棄されたら done = true になり、以降の全メソッドは no-op（stale handle は無害）。
 */
export interface TransitionHandle {
  readonly scope: string
  /** 現在の t ∈ [0, 1] */
  readonly t: number
  /** commit / cancel / seize 済みなら true（以降の操作は no-op） */
  readonly done: boolean
  /** 遷移先の Layout（engine 所有の複製。書き換えは updateTarget で） */
  readonly target: Layout
  /** t を動かして中間形を表示する（非有限は 1 = jump に倒す） */
  scrub(t: number): void
  /**
   * morph を続けたまま目標だけ書き換える（Touch の per-pane 調停の土台 —
   * AI 遷移中に human の knob が target の share を上書きし、morph は続行する）
   */
  updateTarget(fn: (layout: Layout) => Layout): void
  /** target を current にして settle log に刻む（author = 引き金を引いた者） */
  commit(author: SettleAuthor): void
  /** 遷移を破棄して元の layout の表示に戻す（log には何も残らない） */
  cancel(): void
  /** スクラブ手放しの着地先（§5: t < 0.5 → 0 = cancel 側、以上 → 1 = commit 側） */
  nearestEndpoint(): 0 | 1
}

export interface LayoutEngineOptions {
  /** テスト用の時計注入（既定 = Date.now） */
  clock?: () => number
  /** 知覚テーパー（resolve に渡る） */
  taper?: (raw: number) => number
}

export interface LayoutEngine {
  current(scope: string): Layout
  /** 場・構造の変更（gesture 純関数を渡す）。settle は別途（連続操作の途中は log しない） */
  update(scope: string, fn: (layout: Layout) => Layout): void
  /** Scene の total recall（LE-14）。preset は複製され mutate されない。author = "scene" で settle */
  applyScene(scope: string, scene: Scene): void
  /** 形が定まった瞬間を log に刻む（gesture release / AI apply 等、呼び手が判断） */
  settle(scope: string, author: SettleAuthor): void
  history(scope: string): readonly SettleEntry[]
  /** 一時状態（solo / Touch / scrub 逸脱）からの復帰先 = last settle */
  restoreLastSettle(scope: string): boolean
  /** float の一時的な移動（ephemeral — log / Scene に入らない）。pos は左上 0..1 */
  moveFloat(scope: string, id: string, pos: FloatPosition): void
  /**
   * target への遷移を開く（LE-7）。base = 「今の表示」の snapshot なので、遷移中に
   * 次の begin が来ても表示は飛ばない（連鎖）。進行中の遷移は置き換えられ done になる。
   * t = 0 で開くため表示は変わらない — 動かすのは driver / scrub。
   */
  beginTransition(scope: string, target: Layout): TransitionHandle
  /** 進行中の遷移の handle（無ければ null）。Touch 配線 = consumer がこれを掴んで調停する */
  transition(scope: string): TransitionHandle | null
  resolved(scope: string): ResolvedMap
  subscribe(listener: ResolvedListener): () => void
}

interface ActiveTransition {
  /** begin 時点の表示 snapshot（連鎖時は中間形そのもの） */
  base: ResolvedMap
  target: Layout
  targetResolved: ResolvedMap
  t: number
}

interface ScopeState {
  layout: Layout
  log: SettleEntry[]
  floatPos: Map<string, FloatPosition>
  transition: ActiveTransition | null
  transitionHandle: TransitionHandle | null
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n))

/**
 * Layout の構造的複製（純 data なので手書きで足りる — structuredClone = DOM API に依存しない）。
 * consumer も Scene capture 等で使う public API（複製の同型実装を増やさないため export）。
 */
export const cloneLayout = (layout: Layout): Layout => ({
  structure: { columns: layout.structure.columns.map((col) => ({ panes: [...col.panes] })) },
  attention: { ...layout.attention },
  locks: layout.locks ? { ...layout.locks } : undefined,
})

export function createLayoutEngine(options: LayoutEngineOptions = {}): LayoutEngine {
  const clock = options.clock ?? (() => Date.now())
  const taper = options.taper
  const scopes = new Map<string, ScopeState>()
  const listeners = new Set<ResolvedListener>()

  const state = (scope: string): ScopeState => {
    let s = scopes.get(scope)
    if (!s) {
      s = {
        layout: EMPTY_LAYOUT,
        log: [],
        floatPos: new Map(),
        transition: null,
        transitionHandle: null,
      }
      scopes.set(scope, s)
    }
    return s
  }

  /**
   * ephemeral float 位置の合成（枠外に出ない範囲へ clamp）。
   * prune = 浮いていない pane の位置を捨てる（ephemeral の自然な寿命）— 遷移の
   * target 投影では中間形の都合で位置を落とさないよう prune しない
   */
  const overlayFloats = (s: ScopeState, base: ResolvedMap, prune: boolean): ResolvedMap => {
    if (prune) {
      for (const id of [...s.floatPos.keys()]) {
        if (!base[id]?.floating) s.floatPos.delete(id)
      }
    }
    if (s.floatPos.size === 0) return base
    const out: Record<string, ResolvedPane> = { ...base }
    for (const [id, pos] of s.floatPos) {
      const pane = out[id]
      if (!pane?.floating) continue
      out[id] = {
        ...pane,
        rect: {
          ...pane.rect,
          x: clamp01(Math.min(pos.x, 1 - pane.rect.w)),
          y: clamp01(Math.min(pos.y, 1 - pane.rect.h)),
        },
      }
    }
    return out
  }

  const project = (s: ScopeState): ResolvedMap => {
    if (s.transition) {
      return interpolate(s.transition.base, s.transition.targetResolved, s.transition.t)
    }
    return overlayFloats(s, resolve(s.layout, { taper }), true)
  }

  /**
   * 直接操作は遷移を奪取して破棄する（Touch の whole-scope 規則 — 注視の主権は user、
   * LE-16）。morph を続けたまま介入したい場合は handle.updateTarget を使う
   */
  const seize = (s: ScopeState): void => {
    s.transition = null
  }

  const notify = (scope: string): void => {
    const projected = project(state(scope))
    for (const listener of listeners) listener(scope, projected)
  }

  return {
    current(scope) {
      return state(scope).layout
    },
    update(scope, fn) {
      const s = state(scope)
      seize(s)
      s.layout = fn(s.layout)
      notify(scope)
    },
    applyScene(scope, scene) {
      const s = state(scope)
      seize(s)
      s.layout = cloneLayout(scene.layout)
      s.log.push({ layout: cloneLayout(s.layout), at: clock(), author: 'scene' })
      notify(scope)
    },
    settle(scope, author) {
      const s = state(scope)
      s.log.push({ layout: cloneLayout(s.layout), at: clock(), author })
    },
    history(scope) {
      return [...state(scope).log]
    },
    restoreLastSettle(scope) {
      const s = state(scope)
      const last = s.log[s.log.length - 1]
      if (!last) return false
      seize(s)
      s.layout = cloneLayout(last.layout)
      notify(scope)
      return true
    },
    moveFloat(scope, id, pos) {
      const s = state(scope)
      seize(s)
      s.floatPos.set(id, { x: clamp01(pos.x), y: clamp01(pos.y) })
      notify(scope)
    },
    beginTransition(scope, target) {
      const s = state(scope)
      const tr: ActiveTransition = {
        base: project(s), // 遷移中なら中間形 = 連鎖しても表示が飛ばない
        target: cloneLayout(target),
        targetResolved: {},
        t: 0,
      }
      tr.targetResolved = overlayFloats(s, resolve(tr.target, { taper }), false)
      s.transition = tr

      const live = (): boolean => s.transition === tr
      const handle: TransitionHandle = {
        scope,
        get t() {
          return tr.t
        },
        get done() {
          return !live()
        },
        get target() {
          return tr.target
        },
        scrub(t) {
          if (!live()) return
          tr.t = Number.isFinite(t) ? clamp01(t) : 1
          notify(scope)
        },
        updateTarget(fn) {
          if (!live()) return
          tr.target = fn(tr.target)
          tr.targetResolved = overlayFloats(s, resolve(tr.target, { taper }), false)
          notify(scope)
        },
        commit(author) {
          if (!live()) return
          s.transition = null
          s.layout = cloneLayout(tr.target)
          s.log.push({ layout: cloneLayout(s.layout), at: clock(), author })
          notify(scope)
        },
        cancel() {
          if (!live()) return
          s.transition = null
          notify(scope)
        },
        nearestEndpoint() {
          return tr.t >= 0.5 ? 1 : 0
        },
      }
      s.transitionHandle = handle
      notify(scope) // t = 0 なので表示は base のまま（購読側の状態同期のため通知はする）
      return handle
    },
    transition(scope) {
      const s = state(scope)
      return s.transition ? s.transitionHandle : null
    },
    resolved(scope) {
      return project(state(scope))
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}
