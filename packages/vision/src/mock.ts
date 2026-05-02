/**
 * Mock VisionSource — dev / test / docs Playground 用 synthetic data。
 *
 * 実 webcam 不要。 sin/cos で円周運動 / 周期 pinch / random gesture を生成。
 * MediaPipe load 待ちなしで Frame morph + gesture binding を即実演できる。
 */

import type { VisionListener, VisionSource, VisionUpdate } from './source'
import type { GestureEvent } from './types'

export type MockPattern = 'static' | 'orbit' | 'wave' | 'pinch-tap'

export interface MockSourceOptions {
  /** 動きの pattern */
  pattern?: MockPattern
  /** ms — 1 cycle の長さ */
  interval?: number
  /** ms — frame ごとの emit 間隔、 default 33ms (~30 FPS) */
  frameInterval?: number
  /** Pinch active を toggle する周期 (pattern: 'pinch-tap')、 default は 1500ms */
  pinchPeriod?: number
}

/**
 * Mock VisionSource を生成。 start() で setInterval loop 開始、 stop() で停止。
 *
 * @example
 * const source = createMockSource({ pattern: 'orbit', interval: 2000 })
 * <VisionProvider source={source}>...</VisionProvider>
 */
export function createMockSource(options: MockSourceOptions = {}): VisionSource {
  const pattern = options.pattern ?? 'orbit'
  const interval = options.interval ?? 2000
  const frameInterval = options.frameInterval ?? 33
  const pinchPeriod = options.pinchPeriod ?? 1500

  const listeners = new Set<VisionListener>()
  let timer: ReturnType<typeof setInterval> | null = null
  let startTime = 0

  const dispatch = (update: VisionUpdate): void => {
    for (const l of listeners) l(update)
  }

  const tick = (): void => {
    const elapsed = Date.now() - startTime
    const phase = (elapsed % interval) / interval // [0, 1)

    // Hand pinch — orbital motion + periodic active toggle
    const angle = phase * Math.PI * 2
    const x = 0.5 + Math.cos(angle) * 0.2
    const y = 0.5 + Math.sin(angle) * 0.2
    const active =
      pattern === 'pinch-tap' || pattern === 'orbit'
        ? Math.floor(elapsed / pinchPeriod) % 2 === 0
        : false

    dispatch({
      type: 'hand-pinch',
      data: {
        active,
        x,
        y,
        z: Math.sin(angle * 2) * 0.1,
        confidence: 0.9,
      },
    })

    // Head pose — gentle sway
    const headPhase = phase * Math.PI * 2
    dispatch({
      type: 'head-pose',
      data: {
        pitch: Math.sin(headPhase) * 5,
        yaw: Math.cos(headPhase * 0.7) * 8,
        roll: Math.sin(headPhase * 0.3) * 2,
        confidence: 0.95,
      },
    })

    // Face mesh — always present, focused
    dispatch({
      type: 'face-mesh',
      data: { present: true, focused: true, confidence: 0.9 },
    })

    // Wave gesture — every interval cycle (pattern: 'wave')
    if (pattern === 'wave' && phase < 0.05) {
      const event: GestureEvent = {
        type: 'wave',
        timestamp: Date.now(),
        confidence: 0.85,
      }
      dispatch({ type: 'gesture', data: event })
    }
  }

  return {
    async start() {
      if (timer !== null) return
      startTime = Date.now()
      timer = setInterval(tick, frameInterval)
    },
    stop() {
      if (timer !== null) {
        clearInterval(timer)
        timer = null
      }
      // Emit null for all signals so consumer can show "stopped" state
      dispatch({ type: 'hand-pinch', data: null })
      dispatch({ type: 'head-pose', data: null })
      dispatch({ type: 'face-mesh', data: null })
    },
    on(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    isRunning() {
      return timer !== null
    },
  }
}

/** 何もしない source — camera 不可 / permission 拒否時の fallback */
export function createDisabledSource(): VisionSource {
  return {
    async start() {
      // no-op
    },
    stop() {
      // no-op
    },
    on() {
      return () => {}
    },
    isRunning() {
      return false
    },
  }
}
