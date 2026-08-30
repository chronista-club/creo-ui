/**
 * creo-ui-layout — Layout Engine protocol core（LE-P0）。
 * 設計 SSOT: docs/design/layout-engine.md
 */

export type { DriverRun, TimeCurve, TimeDriverOptions, TransitionDriver } from './drivers'
export { createTimeDriver, defaultCurve, jumpDriver, settleRelease } from './drivers'
export type {
  FloatPosition,
  LayoutEngine,
  LayoutEngineOptions,
  ResolvedListener,
  SettleAuthor,
  SettleEntry,
  TransitionHandle,
} from './engine'
export { cloneLayout, createLayoutEngine } from './engine'
export type { AdmitOptions, DominanceDirection } from './gestures'
export {
  admit,
  equalize,
  lock,
  moveDominance,
  mute,
  popIn,
  popOut,
  setShare,
  solo,
  unlock,
  visibleIds,
} from './gestures'
export { interpolate } from './interpolate'
export type { ParsedNotation } from './notation'
export { formatNotation, parseNotation } from './notation'
export type { ApplyPolicy, ProposeOptions, ProposeResult } from './policy'
export { proposeLayout } from './policy'
export type { ResolveOptions } from './resolve'
export { resolve } from './resolve'
export { appendColumn, insertIntoColumn, isMember, memberIds, removePane } from './structure'
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
