/**
 * creoui/shells — Layered Surface page grammar primitives
 *
 * Phase 1 (CREO-160) で creo-web 内に直書きされた layout pattern を
 * 抽出した Solid component primitive 群。 vp-app / chronista-hub /
 * fleetstage CP 等で再利用可能。
 *
 * Vision: mem_1Cak5rxTFWvLNxjSRiQ1Ak (Layered Surface v5.1)
 * Pivot: mem_1CamfZKHbiSdMrzo4pn32T (architectural pivot 2026-05-07)
 *
 * Principal Layout (Edge Ring + Rail) — docs/design/principal-layout.md。
 * creo-memories doc 29/30 の 3x3 Frame / Rail UX を primitive 化したもの
 * (fleetstage handoff mem_1CbCE1rdYJ4ySg87DF5hwa が起点)。
 *
 * 後続 PR で追加予定 (CREO-84 Phase B):
 *  - PR-3: creo-web migration (consumer 側で <CreoFacetGrid> + <CreoPageShell> 適用)
 *  - PR-4: <CreoFacet>       (intrinsic / extrinsic prop で main/sidebar 子配置)
 */

export { CreoEdgeShell } from './CreoEdgeShell'
export { CreoFacetGrid } from './CreoFacetGrid'
export { CreoPageShell } from './CreoPageShell'
export { CreoRail } from './CreoRail'
export {
  type RailAspect,
  type RailDef,
  railById,
  railsByOrder,
  selectRailId,
} from './railRegistry'
export {
  CORNER_REGIONS,
  type CornerRegion,
  EDGE_REGIONS,
  type EdgeRegion,
  type Region,
} from './regions'
