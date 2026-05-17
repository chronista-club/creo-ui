/**
 * <FrameProvider> — Frame state を保持する SolidJS context provider。
 *
 * 子の <FrameSlot> が現 Frame の slot 配置を購読、 setFrame(id) で morph trigger。
 */

import {
  type Accessor,
  type JSX,
  createContext,
  createMemo,
  createSignal,
  useContext,
} from 'solid-js'
import type { Frame } from './types'
import { formatPerspective } from './utils'

export interface FrameContextValue {
  /** 現在 active な Frame (signal accessor) */
  currentFrame: Accessor<Frame | undefined>
  /** 現在 frame の id (短縮 access) */
  currentFrameId: Accessor<string>
  /** 全 frame map (id → Frame) */
  frames: Accessor<ReadonlyMap<string, Frame>>
  /** Frame 切替 trigger (id が未登録なら no-op + warn) */
  setFrame: (id: string) => void
}

const FrameCtx = createContext<FrameContextValue>()

export interface FrameProviderProps {
  /** 利用可能な Frame 一覧 */
  frames: readonly Frame[]
  /** 初期 Frame id、 default は frames[0].id */
  initial?: string
  /** Provider root element に追加する class */
  class?: string
  /** 子 elements (<FrameSlot> 等) */
  children?: JSX.Element
}

export function FrameProvider(props: FrameProviderProps): JSX.Element {
  const framesMap = createMemo<ReadonlyMap<string, Frame>>(() => {
    return new Map(props.frames.map((f) => [f.id, f]))
  })

  const initialId = (): string => {
    const requested = props.initial
    if (requested && framesMap().has(requested)) return requested
    return props.frames[0]?.id ?? ''
  }

  const [currentId, setCurrentId] = createSignal(initialId())

  const currentFrame = createMemo(() => framesMap().get(currentId()))

  const setFrame = (id: string): void => {
    if (!framesMap().has(id)) {
      // eslint-disable-next-line no-console
      console.warn(`[creoui-frame] setFrame: frame "${id}" not registered`)
      return
    }
    setCurrentId(id)
  }

  const ctx: FrameContextValue = {
    currentFrame,
    currentFrameId: currentId,
    frames: framesMap,
    setFrame,
  }

  const perspective = createMemo(() => formatPerspective(currentFrame()?.perspective))

  return (
    <FrameCtx.Provider value={ctx}>
      <div
        class={`creo-frame-root ${props.class ?? ''}`.trim()}
        data-frame={currentId()}
        style={{
          perspective: perspective(),
          'transform-style': 'preserve-3d',
          position: 'relative',
        }}
      >
        {props.children}
      </div>
    </FrameCtx.Provider>
  )
}

/** Frame context にアクセスする hook。 Provider 外で呼ぶと throw */
export function useFrame(): FrameContextValue {
  const ctx = useContext(FrameCtx)
  if (!ctx) {
    throw new Error('[creoui-frame] useFrame() must be used inside <FrameProvider>')
  }
  return ctx
}
