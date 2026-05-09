/**
 * creo-ui-web/shells — Layered Surface page grammar primitives
 *
 * Phase 1 (CREO-160) で creo-web 内に直書きされた layout pattern を
 * 抽出した Solid component primitive 群。 vp-app / chronista-hub /
 * fleetstage CP 等で再利用可能。
 *
 * Vision: mem_1Cak5rxTFWvLNxjSRiQ1Ak (Layered Surface v5.1)
 * Pivot: mem_1CamfZKHbiSdMrzo4pn32T (architectural pivot 2026-05-07)
 *
 * 後続 PR で追加予定 (CREO-84 Phase B):
 *  - PR-3: creo-web migration (consumer 側で <CreoFacetGrid> + <CreoPageShell> 適用)
 *  - PR-4: <CreoFacet>       (intrinsic / extrinsic prop で main/sidebar 子配置)
 *  - PR-5: <CreoOrientation> (Rail+Nav grammar) + <CreoPaneShell> (list + opt Sub pane)
 */

export { CreoFacetGrid } from './CreoFacetGrid'
export { CreoPageShell } from './CreoPageShell'
