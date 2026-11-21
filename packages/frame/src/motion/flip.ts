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
   * Web Animations API の fill mode。 default 'backwards' (delay 中は start state を保持し、
   * 終わった animation は要素に残さない。終点は identity なので見た目は変わらない)
   */
  fill?: FillMode
  /**
   * 大きさの違いをどう埋めるか。default 'xy'
   *
   * - 'xy': 幅と高さを別々の比率で scale し、前の rect にぴったり重ねる (箱向き。文字は潰れる)
   * - 'uniform': 縦横同じ比率 (面積比の平方根) で、中心を基点に scale する (文字の大きさが変わる要素向き)
   * - 'none': scale せず、中心どうしを合わせる translate だけ (大きさの違う要素の間を「位置だけ」動かす)
   */
  scale?: FlipScale
}

/** flip() が大きさの違いを埋める方法 (FlipOptions.scale) */
export type FlipScale = 'xy' | 'uniform' | 'none'

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
  const mode = options.scale ?? 'xy'
  const sw = newRect.width === 0 ? 1 : prevRect.width / newRect.width
  const sh = newRect.height === 0 ? 1 : prevRect.height / newRect.height
  // 'xy' は左上を合わせる (基点 0 0)。それ以外は中心を合わせる (基点 50% 50%)
  const anchorLeft = mode === 'xy' ? 0 : 0.5
  const dx =
    prevRect.left + prevRect.width * anchorLeft - (newRect.left + newRect.width * anchorLeft)
  const dy =
    prevRect.top + prevRect.height * anchorLeft - (newRect.top + newRect.height * anchorLeft)
  const uniform = Math.sqrt(sw * sh)
  const [sx, sy] = mode === 'xy' ? [sw, sh] : mode === 'uniform' ? [uniform, uniform] : [1, 1]

  // No-op detection — visible delta が無いなら animate しない
  if (
    Math.abs(dx) < 1 &&
    Math.abs(dy) < 1 &&
    Math.abs(sx - 1) < 0.001 &&
    Math.abs(sy - 1) < 0.001
  ) {
    return null
  }

  // 基点は keyframe に入れる。要素の CSS (transform-origin) を consumer に指定させない
  const transformOrigin = mode === 'xy' ? '0 0' : '50% 50%'
  const from =
    mode === 'xy'
      ? `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`
      : mode === 'uniform'
        ? `translate(${dx}px, ${dy}px) scale(${sx})`
        : `translate(${dx}px, ${dy}px)`
  const to =
    mode === 'xy'
      ? 'translate(0, 0) scale(1, 1)'
      : mode === 'uniform'
        ? 'translate(0, 0) scale(1)'
        : 'translate(0, 0)'
  return el.animate(
    [
      { transform: from, transformOrigin },
      { transform: to, transformOrigin },
    ],
    {
      duration: options.duration ?? 220,
      easing: resolveEasing(options.easing),
      delay: options.delay ?? 0,
      fill: options.fill ?? 'backwards',
    },
  )
}
