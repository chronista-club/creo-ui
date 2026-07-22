/**
 * engine → Solid signal の橋（LE-P1）。
 *
 * subscribe の外側で DOM 反映を担う action 層の入口。core（純 calculation）は
 * ここから import されるだけで、Solid を知らない向きを保つ。
 */

import type { Accessor } from 'solid-js'
import { createSignal, onCleanup } from 'solid-js'
import type { LayoutEngine } from '../engine'
import type { ResolvedMap } from '../types'

/** 指定 scope の resolved を signal として購読する。unmount で自動 unsubscribe */
export function useEngineResolved(engine: LayoutEngine, scope: string): Accessor<ResolvedMap> {
  const [resolved, setResolved] = createSignal<ResolvedMap>(engine.resolved(scope))
  const unsubscribe = engine.subscribe((s, r) => {
    if (s === scope) setResolved(r)
  })
  onCleanup(unsubscribe)
  return resolved
}
