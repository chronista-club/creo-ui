/**
 * Vision hooks — 個別 signal access を ergonomic に提供。
 *
 * `useVision()` で context 全体取得もできるが、 「pinch だけ欲しい」 ようなケースで
 * `useHandPinch()` を呼ぶ方が宣言的で意図が明確。
 */

import { onCleanup } from 'solid-js'
import { useVision } from './provider'
import type {
  FaceMesh,
  GestureEvent,
  HandPinch,
  HandPointing,
  HeadPose,
  VisionState,
} from './types'
import type { Accessor } from 'solid-js'

/** Vision system 全体 state */
export function useVisionState(): Accessor<VisionState> {
  return useVision().state
}

/** Hand pinch (active + position + confidence) */
export function useHandPinch(): Accessor<HandPinch | null> {
  return useVision().handPinch
}

/** Hand pointing (origin + direction) */
export function useHandPointing(): Accessor<HandPointing | null> {
  return useVision().handPointing
}

/** Head pose (pitch / yaw / roll) */
export function useHeadPose(): Accessor<HeadPose | null> {
  return useVision().headPose
}

/** Face mesh (present / focused / expression) */
export function useFaceMesh(): Accessor<FaceMesh | null> {
  return useVision().faceMesh
}

/** Face presence (boolean — mesh.present の short access) */
export function useFacePresence(): Accessor<boolean> {
  const face = useFaceMesh()
  return () => face()?.present ?? false
}

/**
 * Gesture event subscribe — wave / nod / shake / pinch-tap 等の離散 event。
 *
 * onCleanup で auto unsubscribe。 component unmount 時に cleanup。
 *
 * @example
 * useGesture((event) => {
 *   if (event.type === 'wave') setFrame('next')
 * })
 */
export function useGesture(callback: (event: GestureEvent) => void): void {
  const unsubscribe = useVision().onGesture(callback)
  onCleanup(unsubscribe)
}
