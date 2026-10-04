/**
 * creo-ui/controls — interactive component primitives
 *
 * `shells/` (Layered Surface の layout grammar) とは別系統の、 ユーザー操作を
 * 起動する atomic control primitive 群。 各 component は対応する CSS-only component
 * (`components/*.css`、 例: `button.css`) を type-safe に wrap し、 data 属性で
 * variant / state を表現する (CU* 規約)。
 *
 * v0.x: CUButton / CUOutliner。 今後 Input / Select 等の wrapper もここに集約予定。
 */

export { type CUButtonOptions, cuButtonAttrs } from './button-attrs'
export type { CUButtonProps, CUButtonSize, CUButtonVariant } from './CUButton'
export { CUButton } from './CUButton'
export type { CUOutlinerProps, CUOutlinerVariant, FlatRow, OutlinerNode } from './CUOutliner'
export { CUOutliner } from './CUOutliner'
export {
  createNodeId,
  flattenVisible,
  indent,
  insertSiblingAfter,
  moveDown,
  moveUp,
  nextVisibleId,
  outdent,
  prevVisibleId,
  removeNode,
  setDone,
  setText,
  toggleCollapsed,
  updateNode,
} from './outliner-tree'
