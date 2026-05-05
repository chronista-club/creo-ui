/**
 * morphFrame — coordinated FLIP transition across multiple slots。
 *
 * 「複数 slot の rect 変化を atomic に animate」 ための coordinator。 caller が
 * (1) layout 変化「前」 に measureSlots() で rect 集合を取得、 (2) layout 変化
 * 「後」 に morphFrame() を呼ぶ。 内部で flip() を slot 毎に呼び、 Promise.all
 * で全 Animation の完了 (`Animation.finished`) を await。
 *
 * 設計位置: stack-adr §3.1 の API surface 表で約束された motion engine の
 * coordinator primitive。 narrow に own すべき low-level layer (Frame schema は
 * 知らない、 純粋な DOM 群の rect coordination)。 Frame schema との bridge は
 * Provider 層 (B-γ) で別途提供予定。
 */

import { type FlipOptions, flip } from './flip'

/**
 * morphFrame の挙動オプション。 全 slot に同一値を適用 (per-slot 差分が必要なら
 * caller 側で flip() を直接呼ぶ)。 形は FlipOptions と同一。
 */
export type MorphFrameOptions = FlipOptions

/**
 * 複数 element の現在 rect を一括 measure (FLIP の measure step、 まとめて版)。
 *
 * layout 変化「前」 に呼び、 結果を morphFrame() の `prevRects` に渡す。 内部は
 * `getBoundingClientRect()` を loop しているだけ — naming で意図 (measure step) を
 * 明示することで caller の使用文脈が読み手に伝わる。
 */
export function measureSlots(
  elementsByName: ReadonlyMap<string, HTMLElement>,
): Map<string, DOMRect> {
  const rects = new Map<string, DOMRect>()
  for (const [name, el] of elementsByName) {
    rects.set(name, el.getBoundingClientRect())
  }
  return rects
}

/**
 * 複数 slot を coordinated に FLIP morph。
 *
 * @param elementsByName layout 変化「後」 の DOM ref map (slot 名 → element)
 * @param prevRects      layout 変化「前」 に measureSlots() で取得した rect map
 * @param options        共通 FLIP options (duration / easing / delay / fill)
 * @returns              実際に動いた slot の Animation 配列に解決する Promise
 *
 * 挙動:
 * - **reduced-motion 時**: 内部 `flip()` が null を返し、 結果は空配列で即解決
 * - **prev rect 不在の slot**: skip (新しく追加された slot 等の case)
 * - **動きなしの slot** (rect 同一): skip (`flip()` の no-op detection に委譲)
 * - **完了待ち**: 全 Animation の `.finished` を `Promise.all` で await
 */
export function morphFrame(
  elementsByName: ReadonlyMap<string, HTMLElement>,
  prevRects: ReadonlyMap<string, DOMRect>,
  options: MorphFrameOptions = {},
): Promise<Animation[]> {
  const animations: Animation[] = []

  for (const [name, el] of elementsByName) {
    const prev = prevRects.get(name)
    if (!prev) continue
    const anim = flip(el, prev, options)
    if (anim) animations.push(anim)
  }

  if (animations.length === 0) return Promise.resolve([])

  return Promise.all(animations.map((a) => a.finished)).then(() => animations)
}
