/**
 * engine — scope key ごとの Layout + settle log を束ねる（LE-11/17/18）。
 *
 * - scope: layout state の単位を型で明示（VP = lane、site = route 等。doc 47 §0 の教訓）
 * - settle log: 履歴 = 無名 Scene の列。永続 = log の末尾（consumer が保存し、復元は
 *   最後の entry を apply するだけ）。連続の knob stream は記録しない
 * - 一時状態（solo / Touch / scrub 逸脱）の戻り先 = last settle（restoreLastSettle）
 * - float の位置は ephemeral（Scene / log / token に直列化しない、LE-18）
 * - DOM 反映（action）は subscribe の外側 — renderer / MIDI motor が resolved を写す
 */

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
  resolved(scope: string): ResolvedMap
  subscribe(listener: ResolvedListener): () => void
}

interface ScopeState {
  layout: Layout
  log: SettleEntry[]
  floatPos: Map<string, FloatPosition>
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n))

/** Layout の構造的複製（純 data なので手書きで足りる — structuredClone = DOM API に依存しない） */
const cloneLayout = (layout: Layout): Layout => ({
  structure: { columns: layout.structure.columns.map((col) => ({ panes: [...col.panes] })) },
  attention: { ...layout.attention },
})

export function createLayoutEngine(options: LayoutEngineOptions = {}): LayoutEngine {
  const clock = options.clock ?? (() => Date.now())
  const taper = options.taper
  const scopes = new Map<string, ScopeState>()
  const listeners = new Set<ResolvedListener>()

  const state = (scope: string): ScopeState => {
    let s = scopes.get(scope)
    if (!s) {
      s = { layout: EMPTY_LAYOUT, log: [], floatPos: new Map() }
      scopes.set(scope, s)
    }
    return s
  }

  /** resolve + ephemeral float 位置の合成（枠外に出ない範囲へ clamp） */
  const project = (s: ScopeState): ResolvedMap => {
    const base = resolve(s.layout, { taper })
    // 浮いていない pane の位置は捨てる（ephemeral の自然な寿命）
    for (const id of [...s.floatPos.keys()]) {
      if (!base[id]?.floating) s.floatPos.delete(id)
    }
    if (s.floatPos.size === 0) return base
    const out: Record<string, ResolvedPane> = { ...base }
    for (const [id, pos] of s.floatPos) {
      const pane = out[id]
      if (!pane) continue
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
      s.layout = fn(s.layout)
      notify(scope)
    },
    applyScene(scope, scene) {
      const s = state(scope)
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
      s.layout = cloneLayout(last.layout)
      notify(scope)
      return true
    },
    moveFloat(scope, id, pos) {
      state(scope).floatPos.set(id, { x: clamp01(pos.x), y: clamp01(pos.y) })
      notify(scope)
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
