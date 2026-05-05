/**
 * FLIP technique (Paul Lewis) — measure → invert → play
 *
 * https://aerotwist.com/blog/flip-your-animations/
 *
 * Frame morph の core primitive。 layout 変化前に rect を measure、 変化後に
 * `flip()` で invert + animate して identity transform へ playback。 結果として
 * layout が瞬間移動したように見えるのを smooth な transform animation に変換。
 */

import { respectsReducedMotion } from './reduced-motion'
import { type EasingName, ease } from './tokens'

export interface FlipOptions {
  /** Animation duration (ms)。 default 220 (= duration.normal) */
  duration?: number
  /**
   * Easing string (cubic-bezier / linear / keyword) または token name。
   * default 'spring' (cubic-bezier(0.2, 0.8, 0.2, 1))
   */
  easing?: string | EasingName
  /** ms delay before playback、 default 0 */
  delay?: number
  /**
   * Web Animations API の fill mode。 default 'both' (start state まで保持)
   */
  fill?: FillMode
}

const KNOWN_EASING_NAMES: ReadonlySet<string> = new Set(['linear', 'in', 'out', 'in-out', 'spring'])

function resolveEasing(value: string | EasingName | undefined): string {
  if (!value) return ease('spring')
  if (KNOWN_EASING_NAMES.has(value)) return ease(value as EasingName)
  return value // raw cubic-bezier / linear / keyword passthrough
}

/**
 * 要素の現在 bounding rect を取得。
 *
 * layout 変化「前」 に呼び、 結果を `flip()` の `prevRect` に渡す。
 * `getBoundingClientRect()` の thin wrapper だが、 名前を明示することで
 * caller の意図 (FLIP の measure step) が読み手に伝わる。
 */
export function measureRect(el: Element): DOMRect {
  return el.getBoundingClientRect()
}

/**
 * FLIP animation を実行。
 *
 * @param el         animate 対象 (layout 変化を経た要素)
 * @param prevRect   layout 変化「前」 の rect (`measureRect()` で事前取得)
 * @param options    duration / easing / delay / fill
 * @returns          Animation handle (reduce-motion ON のときは null)
 *
 * Reduce-motion 配慮: `prefers-reduced-motion: reduce` 時は null を返し animation
 * skip。 caller の guard 不要。
 *
 * 移動が px 単位で 1 未満 + scale 差が 0.001 未満なら no-op (animate せず null)。
 */
export function flip(
  el: HTMLElement,
  prevRect: DOMRect,
  options: FlipOptions = {},
): Animation | null {
  if (respectsReducedMotion()) return null

  const newRect = el.getBoundingClientRect()
  const dx = prevRect.left - newRect.left
  const dy = prevRect.top - newRect.top
  const sw = newRect.width === 0 ? 1 : prevRect.width / newRect.width
  const sh = newRect.height === 0 ? 1 : prevRect.height / newRect.height

  // No-op detection — visible delta が無いなら animate しない
  if (
    Math.abs(dx) < 1 &&
    Math.abs(dy) < 1 &&
    Math.abs(sw - 1) < 0.001 &&
    Math.abs(sh - 1) < 0.001
  ) {
    return null
  }

  return el.animate(
    [
      { transform: `translate(${dx}px, ${dy}px) scale(${sw}, ${sh})` },
      { transform: 'translate(0, 0) scale(1, 1)' },
    ],
    {
      duration: options.duration ?? 220,
      easing: resolveEasing(options.easing),
      delay: options.delay ?? 0,
      fill: options.fill ?? 'both',
    },
  )
}
