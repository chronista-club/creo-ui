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
  /** WASM assets base URL — default Google CDN */
  wasmBase?: string
  /** Hand model URL — default Google MediaPipe model */
  handModelPath?: string
  /** Face model URL — default Google MediaPipe model */
  faceModelPath?: string
  /** Inference delegate — 'GPU' (default) or 'CPU' */
  delegate?: 'GPU' | 'CPU'
}

const DEFAULT_WASM_BASE = 'https://storage.googleapis.com/mediapipe-tasks/wasm'
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
            const thumb = landmarks[LANDMARK_THUMB_TIP] as Point3D
            const indexTip = landmarks[LANDMARK_INDEX_TIP] as Point3D
            const wrist = landmarks[LANDMARK_WRIST] as Point3D
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
            const { pitch, yaw, roll } = matrixToEuler(matrix)
            dispatch({
              type: 'head-pose',
              data: { pitch, yaw, roll, confidence: 0.85 },
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
