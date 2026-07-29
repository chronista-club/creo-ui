/**
 * gestures — 場と構造への純操作（LE-3/16/18/20）。
 *
 * 全関数は Layout → Layout の純関数。無変更（no-op / guard による拒否）なら
 * 同一参照を返す — 呼び手が「効かなかった」を検知できる。
 *
 * - 量子化（equalize 等の snap）はここ = UI 作法の層。場そのものは連続のまま
 * - share 指定: touched の取り分を固定し untouched は余りを比例配分（VCA と同型）
 * - 全零 guard: 場を全零にする変更は拒否（最後の 1 枚、LE-3 の 2 規則の 2 つ目）
 * - dominance = argmax（主役 = 最大面積）。keyboard focus ではない（LE-20）
 */

import { appendColumn, insertIntoColumn, isMember, memberIds, removePane } from './structure'
import type { Attention, Layout } from './types'

/** 場に正の値を持つ pane id（tiled + floating） */
export function visibleIds(layout: Layout): string[] {
  return Object.keys(layout.attention).filter((id) => (layout.attention[id] ?? 0) > 0)
}

function withAttention(layout: Layout, attention: Attention): Layout {
  return { structure: layout.structure, attention, locks: layout.locks }
}

/** share の上限（1 に漸近すると raw が発散するため） */
const MAX_SHARE = 0.99

/**
 * share 直接指定（knob / float リサイズの実体）。
 * raw_id = share / (1 - share) × Σ(他の可視 raw) — untouched の raw は不変のまま、
 * 正規化で全員の share が動く（モータライズノブが「連動して動く」の根拠）。
 */
export function setShare(layout: Layout, id: string, share: number): Layout {
  if (share <= 0) return mute(layout, id)
  const s = Math.min(share, MAX_SHARE)
  const others = visibleIds(layout)
    .filter((v) => v !== id)
    .reduce((sum, v) => sum + (layout.attention[v] ?? 0), 0)
  if (others <= 0) {
    // 他に可視が居ない = share は常に 1。可視であることだけ保証する
    const prev = layout.attention[id] ?? 0
    if (prev > 0) return layout
    return withAttention(layout, { ...layout.attention, [id]: 1 })
  }
  const raw = (s / (1 - s)) * others
  return withAttention(layout, { ...layout.attention, [id]: raw })
}

/** 非表示（= 0）。最後の可視 1 枚は拒否（全零 guard） */
export function mute(layout: Layout, id: string): Layout {
  if ((layout.attention[id] ?? 0) <= 0) return layout
  const visible = visibleIds(layout)
  if (visible.length <= 1) return layout
  return withAttention(layout, { ...layout.attention, [id]: 0 })
}

/**
 * 独占（9 の残滓 = mixer の solo）。指定 pane 以外を 0 に。
 * un-solo は engine の「last settle へ復帰」で行う（一時状態の統一）。
 */
export function solo(layout: Layout, id: string): Layout {
  const prev = layout.attention[id] ?? 0
  const raw = prev > 0 ? prev : 1
  const attention: Record<string, number> = {}
  for (const key of Object.keys(layout.attention)) attention[key] = 0
  attention[id] = raw
  return withAttention(layout, attention)
}

/** 等分 snap（UI 作法の量子化 — 場は raw 同値で表現する） */
export function equalize(layout: Layout, ids?: readonly string[]): Layout {
  const targets = ids ?? visibleIds(layout)
  if (targets.length === 0) return layout
  const attention = { ...layout.attention } as Record<string, number>
  for (const id of targets) attention[id] = 1
  return withAttention(layout, attention)
}

export type DominanceDirection = 'left' | 'right' | 'up' | 'down'

/**
 * dominance（argmax）の空間移動 — 2D cyclic（横 = 列間 / 縦 = 列内）。
 * 実装は raw 値の swap: 場の multiset を保存し、位置だけが入れ替わる。
 * dominant が floating の間は no-op（浮きは列に居ない）。
 */
export function moveDominance(layout: Layout, dir: DominanceDirection): Layout {
  const att = layout.attention
  const members = memberIds(layout.structure)
  const memberSet = new Set(members)
  const visibleMembers = members.filter((id) => (att[id] ?? 0) > 0)
  const visibleFloats = Object.keys(att).filter((id) => !memberSet.has(id) && (att[id] ?? 0) > 0)
  const candidates = [...visibleMembers, ...visibleFloats]
  if (candidates.length === 0) return layout

  let dominant = candidates[0] as string
  for (const id of candidates) {
    if ((att[id] ?? 0) > (att[dominant] ?? 0)) dominant = id
  }
  if (!memberSet.has(dominant)) return layout

  // 可視 pane を持つ列だけの格子で移動する
  const visibleColumns = layout.structure.columns
    .map((col) => col.panes.filter((p) => (att[p] ?? 0) > 0))
    .filter((panes) => panes.length > 0)
  const colIndex = visibleColumns.findIndex((panes) => panes.includes(dominant))
  if (colIndex < 0) return layout
  const column = visibleColumns[colIndex] as string[]

  let target: string
  if (dir === 'left' || dir === 'right') {
    const delta = dir === 'right' ? 1 : -1
    const nextCol = visibleColumns[
      (colIndex + delta + visibleColumns.length) % visibleColumns.length
    ] as string[]
    let best = nextCol[0] as string
    for (const p of nextCol) {
      if ((att[p] ?? 0) > (att[best] ?? 0)) best = p
    }
    target = best
  } else {
    const paneIndex = column.indexOf(dominant)
    const delta = dir === 'down' ? 1 : -1
    target = column[(paneIndex + delta + column.length) % column.length] as string
  }
  if (target === dominant) return layout

  return withAttention(layout, {
    ...att,
    [dominant]: att[target] ?? 0,
    [target]: att[dominant] ?? 0,
  })
}

export interface AdmitOptions {
  /** 入れる列 index（省略 = 末尾に新規列） */
  column?: number
  /** 初期 share（省略 = 可視 pane の raw 平均で入る） */
  share?: number
}

/**
 * 入場 — 新 pane は tiled 直入り（float 入場は不採用、mako 2026-07-22）。
 * 既定 = 末尾に新規列、attention = 可視 pane の raw 平均（居なければ 1）。
 */
export function admit(layout: Layout, id: string, opts: AdmitOptions = {}): Layout {
  if (isMember(layout.structure, id)) return layout
  const structure =
    opts.column != null
      ? insertIntoColumn(layout.structure, id, opts.column)
      : appendColumn(layout.structure, id)
  const visible = visibleIds(layout).filter((v) => v !== id)
  const mean =
    visible.length > 0
      ? visible.reduce((s, v) => s + (layout.attention[v] ?? 0), 0) / visible.length
      : 1
  const prev = layout.attention[id] ?? 0
  const raw = prev > 0 ? prev : mean
  const admitted: Layout = {
    structure,
    attention: { ...layout.attention, [id]: raw },
    locks: layout.locks,
  }
  return opts.share != null ? setShare(admitted, id, opts.share) : admitted
}

/** tiled → floating（構造から抜くだけ。場は不変 = サイズが保存される。lock は休眠） */
export function popOut(layout: Layout, id: string): Layout {
  const structure = removePane(layout.structure, id)
  if (structure === layout.structure) return layout
  return { structure, attention: layout.attention, locks: layout.locks }
}

/** floating → tiled（構造へ戻すだけ。場は不変、休眠 lock は復活）。既定 = 末尾に新規列 */
export function popIn(layout: Layout, id: string, column?: number): Layout {
  if (isMember(layout.structure, id)) return layout
  const structure =
    column != null
      ? insertIntoColumn(layout.structure, id, column)
      : appendColumn(layout.structure, id)
  return { structure, attention: layout.attention, locks: layout.locks }
}

/**
 * 列幅 lock（LE-21、fader lock の幅版）。share = その pane を含む列の幅 share。
 * サイズ情報なので場の側（Layout.locks）に住む — 構造・記法には入らない（LE-4）。
 */
export function lock(layout: Layout, id: string, share: number): Layout {
  if (!Number.isFinite(share) || share <= 0) return unlock(layout, id)
  const clamped = Math.min(share, MAX_SHARE)
  return {
    structure: layout.structure,
    attention: layout.attention,
    locks: { ...(layout.locks ?? {}), [id]: clamped },
  }
}

/** lock 解除。無ければ no-op（同一参照） */
export function unlock(layout: Layout, id: string): Layout {
  if (!layout.locks || !(id in layout.locks)) return layout
  const locks: Record<string, number> = { ...layout.locks }
  delete locks[id]
  return {
    structure: layout.structure,
    attention: layout.attention,
    locks: Object.keys(locks).length > 0 ? locks : undefined,
  }
}
