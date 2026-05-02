/**
 * Reduced-motion a11y guard — `prefers-reduced-motion: reduce` を尊重する helper。
 *
 * Frame morph / FLIP / spring 全 motion API の不変条件 (V-3 in vision-input.md)。
 * 結果は memoize、 user 設定変更は `watchReducedMotion()` で subscribe。
 */

let cachedReducedMotion: boolean | null = null

/**
 * 現在の reduced-motion 設定を返す。 SSR / 非 browser 環境では false (= 動かす)。
 *
 * memoize 済 — 初回アクセスで matchMedia を読み、 以降は cache。 user の OS 設定
 * 変更は `watchReducedMotion()` 経由で subscribe して cache invalidate される。
 */
export function respectsReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  if (cachedReducedMotion !== null) return cachedReducedMotion
  cachedReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  return cachedReducedMotion
}

/**
 * Reduced-motion 設定の変化を購読する。 OS 設定切替時に callback が発火。
 *
 * Returns: cleanup function (call to unsubscribe)
 */
export function watchReducedMotion(
  callback: (reduced: boolean) => void,
): () => void {
  if (typeof window === 'undefined') return () => {}
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handler = (e: MediaQueryListEvent): void => {
    cachedReducedMotion = e.matches
    callback(e.matches)
  }
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}

/** Test / advanced consumer 向け — cache 無効化 */
export function _resetReducedMotionCache(): void {
  cachedReducedMotion = null
}
