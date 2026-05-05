/**
 * VisionSource — inference engine の差替可能 interface。
 *
 * MediaPipe (P-4.5)、 mock (dev / test)、 disabled (camera off) 等、 各 implementation
 * が同 contract を満たす。 <VisionProvider source={...}> で plug-in。
 */

import type { FaceMesh, GestureEvent, HandPinch, HandPointing, HeadPose } from './types'

/**
 * Source からの event 種別。 連続値 (signal-like) と離散 event を分ける。
 */
export type VisionUpdate =
  | { type: 'hand-pinch'; data: HandPinch | null }
  | { type: 'hand-pointing'; data: HandPointing | null }
  | { type: 'head-pose'; data: HeadPose | null }
  | { type: 'face-mesh'; data: FaceMesh | null }
  | { type: 'gesture'; data: GestureEvent }
  | { type: 'error'; data: { message: string } }

/** 1 update に反応する callback。 source が dispatch する */
export type VisionListener = (update: VisionUpdate) => void

/**
 * VisionSource — inference engine の interface。
 *
 * Lifecycle:
 *   constructor (sync) → start() (async、 webcam permission + WASM load) →
 *   on() で listener 登録 → 推論 loop が internal で走る → stop() で teardown。
 */
export interface VisionSource {
  /** 推論 loop 開始。 webcam permission / WASM load 等の async 初期化 */
  start(): Promise<void>
  /** 推論 loop 停止 + リソース解放 */
  stop(): void
  /** Update event subscribe — 戻り値で unsubscribe */
  on(listener: VisionListener): () => void
  /** 現在 running か */
  isRunning(): boolean
}
