/**
 * <FrameSlot> — 名前付き slot に component を bind。
 *
 * 現 Frame の slot 配置を購読し、 transform / opacity / transition を CSS で
 * 適用。 reduce-motion 時は transition: none で即座 snap。
 */

import { type JSX, createMemo } from 'solid-js'
import { respectsReducedMotion } from '../motion/reduced-motion'
import { duration, ease } from '../motion/tokens'
import { useFrame } from './provider'
import type { SlotPlacement } from './types'
import { DEFAULT_PLACEMENT, buildTransformString, mergePlacement } from './utils'

export interface FrameSlotProps {
  /** Slot 識別子 (Frame.slots の key と一致) */
  name: string
  /** 当 Frame に slot 定義がない時の fallback placement */
  fallback?: SlotPlacement
  /** Slot 自体の class (内部の transform は inline style で適用) */
  class?: string
  children?: JSX.Element
}

const KNOWN_EASING_TOKENS = new Set(['linear', 'in', 'out', 'in-out', 'spring'])

function resolveEasing(value: string | undefined): string {
  if (!value) return ease('spring')
  if (KNOWN_EASING_TOKENS.has(value)) {
    return ease(value as Parameters<typeof ease>[0])
  }
  return value // raw cubic-bezier / linear() / keyword passthrough
}

export function FrameSlot(props: FrameSlotProps): JSX.Element {
  const { currentFrame } = useFrame()

  const placement = createMemo<SlotPlacement>(() => {
    const f = currentFrame()
    const slot = f?.slots[props.name]
    return mergePlacement(DEFAULT_PLACEMENT, slot ?? props.fallback)
  })

  const transform = createMemo(() => buildTransformString(placement()))

  const transition = createMemo(() => {
    if (respectsReducedMotion()) return 'none'
    const t = currentFrame()?.transition
    const ms = t?.duration ?? duration('slow')
    const easing = resolveEasing(t?.easing)
    return `transform ${ms}ms ${easing}, opacity ${ms}ms ${easing}`
  })

  return (
    <div
      class={`creo-frame-slot ${props.class ?? ''}`.trim()}
      data-slot={props.name}
      style={{
        position: 'absolute',
        inset: '0',
        transform: transform(),
        opacity: placement().opacity ?? 1,
        transition: transition(),
        'transform-style': 'preserve-3d',
        'will-change': 'transform, opacity',
      }}
    >
      {props.children}
    </div>
  )
}
