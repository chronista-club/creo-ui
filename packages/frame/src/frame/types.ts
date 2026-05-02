/**
 * Frame system — schema types。
 *
 * Frame = 名前付き spatial container (slots × perspective × transition)。
 * 詳細: docs/design/frame-system.md (F-1 〜 F-3)。
 */

/**
 * 1 つの slot の 3D 配置 + visual hint。
 * 全 prop optional、 未指定時は default (0 / 1 / 1) が使われる。
 */
export interface SlotPlacement {
  /** Translate X (number = px、 string = '50%' 等の任意 CSS length) */
  x?: number | string
  y?: number | string
  z?: number | string
  /** Rotate (deg) */
  rotateX?: number
  rotateY?: number
  rotateZ?: number
  /** Scale (= 1 で no-op) */
  scale?: number
  /** Opacity ∈ [0, 1] */
  opacity?: number
}

/** Frame transition 設定 (motion engine で resolve) */
export interface FrameTransition {
  /** Duration (ms)、 default = duration('slow') = 320ms */
  duration?: number
  /**
   * Easing — 'linear'/'in'/'out'/'in-out'/'spring' の token name か、
   * 任意 CSS easing 文字列 (cubic-bezier / linear() 等)。
   * default = 'spring'
   */
  easing?: string
}

/** Frame 定義 — id + slot 集合 + 視点 + 遷移 */
export interface Frame {
  /** Frame 識別子 ('dashboard' / 'reading' / ...) */
  id: string
  /** Slot 名 → 配置の map */
  slots: Readonly<Record<string, SlotPlacement>>
  /**
   * Perspective (number = px、 string = '1400px' 等)。 Frame ごとに 3D 強度を変える。
   * 未指定時は CSS variable 経由 (`--frame-perspective-default`) で fallback。
   */
  perspective?: number | string
  /** Transition (このフレームへの morph 時の挙動) */
  transition?: FrameTransition
}
