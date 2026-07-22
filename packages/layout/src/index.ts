/**
 * creo-ui-layout — Layout Engine protocol core（LE-P0）。
 * 設計 SSOT: docs/design/layout-engine.md
 */

export type {
  Attention,
  Column,
  Layout,
  PaneRef,
  Rect,
  ResolvedMap,
  ResolvedPane,
  Scene,
  Structure,
} from './types'
export { EMPTY_LAYOUT } from './types'

export { appendColumn, insertIntoColumn, isMember, memberIds, removePane } from './structure'

export type { ParsedNotation } from './notation'
export { formatNotation, parseNotation } from './notation'

export type { ResolveOptions } from './resolve'
export { resolve } from './resolve'

export { interpolate } from './interpolate'

export type { AdmitOptions, DominanceDirection } from './gestures'
export {
  admit,
  equalize,
  moveDominance,
  mute,
  popIn,
  popOut,
  setShare,
  solo,
  visibleIds,
} from './gestures'

export type {
  FloatPosition,
  LayoutEngine,
  LayoutEngineOptions,
  ResolvedListener,
  SettleAuthor,
  SettleEntry,
} from './engine'
export { createLayoutEngine } from './engine'
