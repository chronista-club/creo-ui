/**
 * creoui-frame frame protocol — public API
 *
 * Frame system runtime: <FrameProvider> + <FrameSlot> + setFrame()。
 * docs/design/frame-system.md F-1〜F-3 の reference 実装。
 */

export type { Frame, SlotPlacement, FrameTransition } from './types'
export {
  FrameProvider,
  useFrame,
  type FrameProviderProps,
  type FrameContextValue,
} from './provider'
export { FrameSlot, type FrameSlotProps } from './slot'
export {
  DEFAULT_PLACEMENT,
  formatLength,
  formatPerspective,
  buildTransformString,
  mergePlacement,
} from './utils'
