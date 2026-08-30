/**
 * creo-ui-frame motion engine — public API
 *
 * Web Animations API (`Element.animate()`) を直叩きする narrow self-built engine。
 * Motion One archived (2024) を契機に creo-ui core dependency として own する判断
 * (詳細: docs/design/stack-adr.md)。
 */

export { type FlipOptions, flip, measureRect } from './flip'
export { type MorphFrameOptions, measureSlots, morphFrame } from './morph'
export { respectsReducedMotion, watchReducedMotion } from './reduced-motion'
export {
  type SpringCurve,
  type SpringOptions,
  type SpringPreset,
  springCurve,
  springEasing,
  springPreset,
} from './spring'
export {
  type DurationName,
  duration,
  durationFromCss,
  type EasingName,
  ease,
  easeFromCss,
} from './tokens'
