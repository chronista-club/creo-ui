/**
 * MediaPipe-backed VisionSource — 実 webcam + Tasks Web SDK で hand / face inference。
 *
 * `@mediapipe/tasks-vision` は **optional peerDependency**。 consumer が createMediaPipeSource
 * を呼んだ時のみ dynamic import で load (~3MB)。 mock-only consumer は install 不要。
 *
 * Lifecycle:
 *   1. createMediaPipeSource(options) — async factory (FilesetResolver + Landmarker init)
 *   2. source.start() — webcam permission request + inference loop 開始
 *   3. source.on(listener) で update subscribe
 *   4. source.stop() — loop 停止 + camera release + landmarker.close()
 *
 * V-4 不変条件 (privacy): raw frame は VisualVideoElement → HandLandmarker / FaceLandmarker
 * の WASM 内に閉じ、 server 送信なし。 server endpoint への通信は一切発生しない。
 *
 * Coordinate space (V-6, 2026-05-03):
 *   MediaPipe の生 landmark は camera image plane (selfie だと user の右手は x が小さい側に映る)。
 *   Creo UI vision API は **user-space を canonical** とする — `camera: 'user'` の時 x を 1-x で
 *   反転、 user の右手 → x 大、 左手 → x 小。 これにより VP の ARKit (worldspace、 user 視点と
 *   一致) と semantic 互換になり、 consumer の UI 層は coord 変換不要で書ける。 raw camera POV が
 *   必要な spatial reasoning consumer は `coordSpace: 'camera'` で opt-out 可。
 */

import type {
  FaceLandmarker as FaceLandmarkerType,
  HandLandmarker as HandLandmarkerType,
} from '@mediapipe/tasks-vision'
import type { VisionListener, VisionSource, VisionUpdate } from './source'
import type { Point3D } from './types'
import { isPinchActive, pinchCenter } from './utils'
import { matrixToEuler, normalizeVector } from './mediapipe-utils'
import { requestCameraStream, stopCameraStream } from './permission'

export interface MediaPipeSourceOptions {
  /** Camera facing — default 'user' (front) */
  camera?: 'user' | 'environment'
  /** Models to load — default ['hand'] (face は重いので opt-in) */
  models?: readonly ('hand' | 'face')[]
  /** WASM assets base URL — default jsDelivr CDN (npm package mirror) */
  wasmBase?: string
  /** Hand model URL — default Google MediaPipe model */
  handModelPath?: string
  /** Face model URL — default Google MediaPipe model */
  faceModelPath?: string
  /** Inference delegate — 'GPU' (default) or 'CPU' */
  delegate?: 'GPU' | 'CPU'
  /**
   * Coordinate space for emitted landmarks (V-6).
   * - `'user'`: x mirrored so user's right hand → high x。 Selfie UI / VP ARKit と semantic 一致。
   * - `'camera'`: raw image plane (MediaPipe convention)。 3D reasoning / multi-view fusion 用。
   *
   * Default: `'user'` for `camera: 'user'`、 `'camera'` for `camera: 'environment'` (背面 camera は
   * user 視点と camera POV がほぼ一致するため反転不要)。
   */
  coordSpace?: 'user' | 'camera'
}

// jsDelivr serves @mediapipe/tasks-vision npm package's `wasm/` directory directly.
// `storage.googleapis.com/mediapipe-tasks/wasm` was the old default but is now unreliable
// (404 / 403 observed 2026-05). jsDelivr is the recommended CDN per MediaPipe docs.
const DEFAULT_WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10/wasm'
const DEFAULT_HAND_MODEL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task'
const DEFAULT_FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task'

// MediaPipe landmark indices (HandLandmarker)
const LANDMARK_WRIST = 0
const LANDMARK_THUMB_TIP = 4
const LANDMARK_INDEX_TIP = 8

/**
 * Create a real MediaPipe-backed VisionSource。 Webcam permission は start() 内で request。
 *
 * @example
 * const source = await createMediaPipeSource({ camera: 'user', models: ['hand', 'face'] })
 * <VisionProvider source={source} autoStart={false}>
 *   <button onClick={() => source.start()}>Enable camera</button>
 *   ...
 * </VisionProvider>
 */
export async function createMediaPipeSource(
  options: MediaPipeSourceOptions = {},
): Promise<VisionSource> {
  const camera = options.camera ?? 'user'
  const models = options.models ?? ['hand']
  const wasmBase = options.wasmBase ?? DEFAULT_WASM_BASE
  const delegate = options.delegate ?? 'GPU'
  const coordSpace = options.coordSpace ?? (camera === 'user' ? 'user' : 'camera')
  const mirrorX = coordSpace === 'user'
  const toUserSpace = (p: Point3D): Point3D =>
    mirrorX ? { x: 1 - p.x, y: p.y, z: p.z } : p

  // Dynamic import — keeps mediapipe out of base bundle
  // eslint-disable-next-line import/no-unresolved
  const tasksVision = await import('@mediapipe/tasks-vision')
  const { FilesetResolver, HandLandmarker, FaceLandmarker } = tasksVision

  const filesetResolver = await FilesetResolver.forVisionTasks(wasmBase)

  let handLandmarker: HandLandmarkerType | null = null
  let faceLandmarker: FaceLandmarkerType | null = null

  if (models.includes('hand')) {
    handLandmarker = await HandLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: options.handModelPath ?? DEFAULT_HAND_MODEL,
        delegate,
      },
      runningMode: 'VIDEO',
      numHands: 1,
    })
  }

  if (models.includes('face')) {
    faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: options.faceModelPath ?? DEFAULT_FACE_MODEL,
        delegate,
      },
      outputFacialTransformationMatrixes: true,
      runningMode: 'VIDEO',
      numFaces: 1,
    })
  }

  const listeners = new Set<VisionListener>()
  const dispatch = (update: VisionUpdate): void => {
    for (const l of listeners) l(update)
  }

  let stream: MediaStream | null = null
  let video: HTMLVideoElement | null = null
  let rafId: number | null = null
  let running = false

  const tick = (): void => {
    if (!running) return
    if (!video || video.readyState < 2 /* HAVE_CURRENT_DATA */) {
      rafId = requestAnimationFrame(tick)
      return
    }

    const ts = performance.now()

    // Hand inference
    if (handLandmarker) {
      try {
        const result = handLandmarker.detectForVideo(video, ts)
        if (result.landmarks.length > 0) {
          const landmarks = result.landmarks[0]
          if (
            landmarks &&
            landmarks[LANDMARK_THUMB_TIP] &&
            landmarks[LANDMARK_INDEX_TIP] &&
            landmarks[LANDMARK_WRIST]
          ) {
            // Apply coordSpace transform — user-space mirror is the V-6 canonical.
            const thumb = toUserSpace(landmarks[LANDMARK_THUMB_TIP] as Point3D)
            const indexTip = toUserSpace(landmarks[LANDMARK_INDEX_TIP] as Point3D)
            const wrist = toUserSpace(landmarks[LANDMARK_WRIST] as Point3D)
            const handedness = result.handedness?.[0]?.[0]
            const score = handedness?.score ?? 0.8

            const active = isPinchActive(thumb, indexTip)
            const center = pinchCenter(thumb, indexTip)

            dispatch({
              type: 'hand-pinch',
              data: {
                active,
                x: center.x,
                y: center.y,
                z: center.z,
                confidence: score,
              },
            })
            dispatch({
              type: 'hand-pointing',
              data: {
                origin: wrist,
                direction: normalizeVector({
                  x: indexTip.x - wrist.x,
                  y: indexTip.y - wrist.y,
                  z: indexTip.z - wrist.z,
                }),
                confidence: score,
              },
            })
          }
        } else {
          dispatch({ type: 'hand-pinch', data: null })
          dispatch({ type: 'hand-pointing', data: null })
        }
      } catch (err) {
        dispatch({
          type: 'error',
          data: { message: err instanceof Error ? err.message : String(err) },
        })
      }
    }

    // Face inference
    if (faceLandmarker) {
      try {
        const result = faceLandmarker.detectForVideo(video, ts)
        if (result.faceLandmarks.length > 0) {
          const matrix = result.facialTransformationMatrixes?.[0]?.data
          if (matrix) {
            const euler = matrixToEuler(matrix)
            // yaw / roll は左右に符号を持つので、 user-space に揃える時は反転 (V-6)。
            // pitch は上下なので変えない。 4x4 matrix を直接 mirror すると pitch にも影響する
            // 計算誤差が乗るので、 Tait-Bryan 角に分解した後に scalar 反転する shortcut。
            dispatch({
              type: 'head-pose',
              data: {
                pitch: euler.pitch,
                yaw: mirrorX ? -euler.yaw : euler.yaw,
                roll: mirrorX ? -euler.roll : euler.roll,
                confidence: 0.85,
              },
            })
          }
          dispatch({
            type: 'face-mesh',
            data: { present: true, focused: true, confidence: 0.85 },
          })
        } else {
          dispatch({ type: 'head-pose', data: null })
          dispatch({ type: 'face-mesh', data: null })
        }
      } catch (err) {
        dispatch({
          type: 'error',
          data: { message: err instanceof Error ? err.message : String(err) },
        })
      }
    }

    rafId = requestAnimationFrame(tick)
  }

  return {
    async start() {
      if (running) return
      stream = await requestCameraStream(camera)
      video = document.createElement('video')
      video.srcObject = stream
      video.autoplay = true
      video.playsInline = true
      video.muted = true
      try {
        await video.play()
      } catch {
        // Some browsers throw on autoplay even with muted=true; safe to ignore
        // (frames will still be available once readyState >= 2)
      }
      running = true
      rafId = requestAnimationFrame(tick)
    },
    stop() {
      running = false
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
        rafId = null
      }
      if (video) {
        video.srcObject = null
        video = null
      }
      if (stream) {
        stopCameraStream(stream)
        stream = null
      }
      handLandmarker?.close?.()
      faceLandmarker?.close?.()
      handLandmarker = null
      faceLandmarker = null

      // Notify nulls — consumers can show "stopped" UI
      dispatch({ type: 'hand-pinch', data: null })
      dispatch({ type: 'hand-pointing', data: null })
      dispatch({ type: 'head-pose', data: null })
      dispatch({ type: 'face-mesh', data: null })
    },
    on(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    isRunning() {
      return running
    },
  }
}
