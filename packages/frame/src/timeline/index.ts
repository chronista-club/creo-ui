/**
 * creo-ui-frame timeline — t (進み具合 0 → 1) を中心にした入れ子のアニメーション。
 *
 * Clip の木 (宣言) → createTimeline (時計 1 つ、WAAPI) → TimelineInspector (時間軸の表示)。
 * 詳細は docs/design/frame-system.md の「Timeline」節。
 */

export {
  bakeKeyframes,
  type Clip,
  type ClipPart,
  type DragHandle,
  dragPlacement,
  type FlatClip,
  type FlatPart,
  flattenClip,
  localT,
  type Placement,
  type Pose,
  poseKeyframes,
  setPlacement,
} from './clip'
export { TimelineInspector, type TimelineInspectorProps } from './inspector'
export {
  createTimeline,
  type Timeline,
  type TimelineOptions,
} from './timeline'
