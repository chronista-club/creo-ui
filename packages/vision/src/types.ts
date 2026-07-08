/**
 * Vision input — type definitions。
 *
 * MediaPipe Tasks の 4 主要 task (Hand / Pose / Face / Gesture) を
 * creo-ui で扱う semantic 型に正規化。
 */

/** 3D 点 (x, y は normalized [0, 1] viewport 座標、 z は depth proxy) */
export interface Point3D {
  x: number
  y: number
  z: number
}

/** Hand pinch state — thumb + index がくっついた状態 */
export interface HandPinch {
  /** Pinch closed (thumb + index 接触) */
  active: boolean
  /** Pinch 中心位置 (normalized viewport coords) */
  x: number
  y: number
  z: number
  /** ∈ [0, 1]、 検出信頼度 */
  confidence: number
}

/** Hand pointing — 人差し指の指す方向 */
export interface HandPointing {
  /** 指の根元位置 */
  origin: Point3D
  /** 指先方向 unit vector */
  direction: Point3D
  confidence: number
}

/** Head pose — 顔の傾き (Tait-Bryan angles, deg) */
export interface HeadPose {
  /** 上下回転 (頷き)、 + が下向き */
  pitch: number
  /** 左右回転 (首振り)、 + が右向き */
  yaw: number
  /** 傾き (横倒し)、 + が右肩下がり */
  roll: number
  confidence: number
}

/** Face mesh — 顔の存在 + 注視 */
export interface FaceMesh {
  /** 顔が画面内にあるか */
  present: boolean
  /** Camera を見ているか (gaze focus) */
  focused: boolean
  /** 表情 (option、 detector が対応していれば) */
  expression?: 'neutral' | 'smile' | 'surprise' | 'frown'
  confidence: number
}

/** 高レベル gesture (一時 event、 連続値ではない) */
export interface GestureEvent {
  type: 'wave' | 'nod' | 'shake' | 'pinch-tap' | 'palm-open'
  /** ms epoch */
  timestamp: number
  /** ∈ [0, 1] */
  confidence: number
}

/** Vision system 全体の state */
export interface VisionState {
  /** Source が初期化完了 */
  ready: boolean
  /** 推論 loop running 中 */
  enabled: boolean
  /** Camera permission */
  permission: 'unknown' | 'granted' | 'denied' | 'pending'
  /** error message (あれば) */
  error?: string
}

/** Provider config */
export interface VisionConfig {
  /** Camera facing — default 'user' (front-facing) */
  camera?: 'user' | 'environment'
  /** Inference target FPS — default 30 */
  sampleRate?: number
  /** Default OFF (V-5)、 user opt-in 経由で true に */
  enabled?: boolean
}
