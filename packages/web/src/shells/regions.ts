/**
 * Principal Layout — 位置語彙 (PL-2)
 *
 * docs/design/principal-layout.md §2-3。
 * region は位置 (どこ) で命名する。「sidebar」のような位置を持たない語を禁ずる。
 * この語彙は creoui-frame (3D spatial morph) とも共有しうる canonical vocabulary
 * (principal-layout.md §4) — ただし本 module は creoui-frame を import しない
 * (2D consumer に 3D 依存を持ち込まないため、PL-1)。
 */

/** center を囲む 4 edge (doc 29 §3.2 の 2 直交軸: 横=起点⇄ツール / 縦=global⇄local) */
export type EdgeRegion = 'leftEdge' | 'rightEdge' | 'upEdge' | 'downEdge'

/** 隣接 2 edge の積 = corner (doc 29 §3.3、実装は別スライス) */
export type CornerRegion = 'cornerTL' | 'cornerTR' | 'cornerBL' | 'cornerBR'

/** Principal Layout の全 region */
export type Region = EdgeRegion | CornerRegion | 'center'

export const EDGE_REGIONS: readonly EdgeRegion[] = ['leftEdge', 'rightEdge', 'upEdge', 'downEdge']

export const CORNER_REGIONS: readonly CornerRegion[] = [
  'cornerTL',
  'cornerTR',
  'cornerBL',
  'cornerBR',
]
