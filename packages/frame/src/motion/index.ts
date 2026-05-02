/**
 * creo-ui-frame motion engine — public API
 *
 * Web Animations API (`Element.animate()`) を直叩きする narrow self-built engine。
 * Motion One archived (2024) を契機に creo-ui core dependency として own する判断
 * (詳細: docs/design/stack-adr.md)。
 */

export { flip, measureRect, type FlipOptions } from './flip'
export {
  ease,
  duration,
  easeFromCss,
  durationFromCss,
  type EasingName,
  type DurationName,
} from './tokens'
export { springEasing, type SpringOptions } from './spring'
export { respectsReducedMotion, watchReducedMotion } from './reduced-motion'
