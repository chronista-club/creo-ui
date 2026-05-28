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
 * v0.23.0 命名規約 (= owner decision、 ecosystem vocabulary 統一):
 *  - primitive component prefix = `CU*` (= creoui-shells、 ergonomics + import 1 行 で
 *    primitive vs project-local の即判別を成立させる)
 *  - 旧 `Creo*` 名は 0.23.x / 0.24.x で **alias re-export** で keep、 0.25.0 で撤去
 *  - brand "Creo Memories" / "Creo ID" 等は touch せず keep (= component prefix と
 *    brand surface を意味的に分離する articulate)
 */

// Primary export — CU* prefix (v0.23.0+ canonical)
export { CUEdgeShell } from './CUEdgeShell'
export { CUFacetGrid } from './CUFacetGrid'
export { CUPageShell } from './CUPageShell'
export { CURail } from './CURail'

// Backward compat alias — 0.23.x / 0.24.x で keep、 0.25.0 撤去予定
export { CUEdgeShell as CreoEdgeShell } from './CUEdgeShell'
export { CUFacetGrid as CreoFacetGrid } from './CUFacetGrid'
export { CUPageShell as CreoPageShell } from './CUPageShell'
export { CURail as CreoRail } from './CURail'

export {
  createLayerStore,
  createLayerUrlSync,
  type LayerId,
  type LayerStore,
  type LayerUrlSyncPorts,
  layerEqualsParam,
  layerToParam,
  parseLayerParam,
} from './layer'
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
