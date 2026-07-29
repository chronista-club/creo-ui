/**
 * Layout Engine — protocol types（LE-P0）。
 *
 * 設計 SSOT: docs/design/layout-engine.md（LE-1〜LE-20）。
 * 場（attention）が唯一のサイズ真実源（LE-3）、構造は軸交代 + 所属のみ（LE-4/5）。
 * keyboard focus は protocol の関心外（LE-20 — DOM / consumer の領分）。
 */

/** pane identity — 「何が存在するか」は consumer 供給（LE-11/12）。primitive は kind を意味づけしない */
export interface PaneRef {
  readonly id: string
  readonly kind?: string
  readonly label?: string
}

/** 列 = 副軸（縦）の並び。構造はサイズを持たない（LE-4） */
export interface Column {
  readonly panes: readonly string[]
}

/** 主軸 = 水平の列並び。軸交代はここで打ち止め（LE-5、arity は無制限） */
export interface Structure {
  readonly columns: readonly Column[]
}

/**
 * 場: pane id → raw attention（≥ 0）。0 = 非表示（LE-3）。
 * 格納は raw、操作/表示は share（正規化後の取り分）— 二重読みは gestures / resolve が担う。
 */
export type Attention = Readonly<Record<string, number>>

export interface Layout {
  readonly structure: Structure
  readonly attention: Attention
  /**
   * 列幅 lock（LE-21、fader lock の幅版）: pane id → 幅 share ∈ (0, 1)。
   * その pane を**含む列**の幅を固定し、残りの列が余りを正規化する。
   * サイズ情報なので構造/記法には入らず場の側に住む（LE-4）。px 固定は consumer が
   * resize 時に fraction を再計算して更新する（viewport は protocol の外、LE-9）。
   * 非所属 pane の lock は休眠（popIn で復活）。
   */
  readonly locks?: Readonly<Record<string, number>>
}

/** Scene = Layout の名前付き immutable snapshot = 注視の表現 = scrub の端点（LE-14） */
export interface Scene {
  readonly id: string
  readonly name: string
  readonly layout: Layout
  readonly description?: string
}

/** 0..1 連続の矩形。量子化は投影の縁でやる（LE-9 — ここでは丸めない） */
export interface Rect {
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
}

/** resolve の出力 1 pane 分 */
export interface ResolvedPane {
  readonly rect: Rect
  /** 全可視 pane に対する share。遠近・明暗への射影は platform 判断（frame F-3） */
  readonly attention: number
  readonly floating: boolean
}

export type ResolvedMap = Readonly<Record<string, ResolvedPane>>

/** 空 Layout。全 scope の初期値として共有されるため freeze（in-place mutation 事故の構造的防止） */
export const EMPTY_LAYOUT: Layout = Object.freeze({
  structure: Object.freeze({ columns: Object.freeze([]) }),
  attention: Object.freeze({}),
})
