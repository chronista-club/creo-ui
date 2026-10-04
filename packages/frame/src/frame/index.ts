/**
 * creo-ui-frame frame protocol — public API
 *
 * Frame system runtime: <FrameProvider> + <FrameSlot> + setFrame()。
 * docs/design/frame-system.md F-1〜F-3 の reference 実装。
 */

export {
  type FrameContextValue,
  FrameProvider,
  type FrameProviderProps,
  useFrame,
} from './provider'
export { FrameSlot, type FrameSlotProps } from './slot'
export type { Frame, FrameTransition, SlotPlacement } from './types'
export {
  buildTransformString,
  DEFAULT_PLACEMENT,
  formatLength,
  formatPerspective,
  mergePlacement,
} from './utils'
