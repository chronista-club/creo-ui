/**
 * <VisionProvider> — VisionSource を管理する SolidJS context provider。
 *
 * source.on() で update を受け取り、 内部 signal を更新。 子の hooks
 * (useHandPinch / useHeadPose / 等) が context 経由で signal を購読する。
 */

import {
  type Accessor,
  type JSX,
  createContext,
  createSignal,
  onCleanup,
  onMount,
  useContext,
} from 'solid-js'
import type { VisionSource } from './source'
import type {
  FaceMesh,
  GestureEvent,
  HandPinch,
  HandPointing,
  HeadPose,
  VisionState,
} from './types'

export interface VisionContextValue {
  state: Accessor<VisionState>
  handPinch: Accessor<HandPinch | null>
  handPointing: Accessor<HandPointing | null>
  headPose: Accessor<HeadPose | null>
  faceMesh: Accessor<FaceMesh | null>
  /** Gesture event listeners — subscribe pattern */
  onGesture: (callback: (event: GestureEvent) => void) => () => void
  start: () => Promise<void>
  stop: () => void
}

const VisionCtx = createContext<VisionContextValue>()

export interface VisionProviderProps {
  source: VisionSource
  /** Mount 時に start() を auto 実行 (default false = V-5 opt-in) */
  autoStart?: boolean
  children?: JSX.Element
}

export function VisionProvider(props: VisionProviderProps): JSX.Element {
  const [state, setState] = createSignal<VisionState>({
    ready: false,
    enabled: false,
    permission: 'unknown',
  })
  const [handPinch, setHandPinch] = createSignal<HandPinch | null>(null)
  const [handPointing, setHandPointing] = createSignal<HandPointing | null>(null)
  const [headPose, setHeadPose] = createSignal<HeadPose | null>(null)
  const [faceMesh, setFaceMesh] = createSignal<FaceMesh | null>(null)
  const gestureListeners = new Set<(event: GestureEvent) => void>()

  const start = async (): Promise<void> => {
    setState((s) => ({ ...s, permission: 'pending' }))
    try {
      await props.source.start()
      setState((s) => ({ ...s, ready: true, enabled: true, permission: 'granted' }))
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      setState((s) => ({
        ...s,
        ready: false,
        enabled: false,
        permission: 'denied',
        error: message,
      }))
    }
  }

  const stop = (): void => {
    props.source.stop()
    setState((s) => ({ ...s, enabled: false }))
  }

  const ctx: VisionContextValue = {
    state,
    handPinch,
    handPointing,
    headPose,
    faceMesh,
    onGesture(callback) {
      gestureListeners.add(callback)
      return () => gestureListeners.delete(callback)
    },
    start,
    stop,
  }

  onMount(() => {
    const unsubscribe = props.source.on((update) => {
      switch (update.type) {
        case 'hand-pinch':
          setHandPinch(update.data)
          break
        case 'hand-pointing':
          setHandPointing(update.data)
          break
        case 'head-pose':
          setHeadPose(update.data)
          break
        case 'face-mesh':
          setFaceMesh(update.data)
          break
        case 'gesture':
          for (const cb of gestureListeners) cb(update.data)
          break
        case 'error':
          setState((s) => ({ ...s, error: update.data.message }))
          break
      }
    })

    if (props.autoStart) {
      void start()
    }

    onCleanup(() => {
      unsubscribe()
      props.source.stop()
    })
  })

  return <VisionCtx.Provider value={ctx}>{props.children}</VisionCtx.Provider>
}

export function useVision(): VisionContextValue {
  const ctx = useContext(VisionCtx)
  if (!ctx) {
    throw new Error('[creo-ui-vision] useVision() must be used inside <VisionProvider>')
  }
  return ctx
}
