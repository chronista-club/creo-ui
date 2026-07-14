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

/**
 * Gaze — 観察者の視線 (= CSS perspective-origin)。
 *
 * 消失点の水平位置 (x) と 水平線の高さ (y) を持つ。3D grid / slot が「どこへ収束するか」
 * を決める視点 parameter で、Frame ごとの default を宣言でき、runtime で `setGaze` により
 * user 操作にも開ける (F-4)。値は number = px、string = '50%' 等の任意 CSS <position>。
 */
export interface Gaze {
  /** 消失点の水平位置 (perspective-origin X)。未指定は '50%' (中央) */
  x?: number | string
  /** 水平線の高さ (perspective-origin Y)。未指定は '50%' (目線が画面中央) */
  y?: number | string
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
  /**
   * Gaze (視線 = perspective-origin)。Frame ごとの default 視点。未指定は中央 (50% 50%)。
   * runtime の `setGaze` が指定されると そちらが優先される (F-4)。
   */
  gaze?: Gaze
  /** Transition (このフレームへの morph 時の挙動) */
  transition?: FrameTransition
}
