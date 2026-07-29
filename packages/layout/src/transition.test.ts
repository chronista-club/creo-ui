/**
 * engine transition — scrub の中間形 / commit・cancel の着地 / 連鎖 / seize（LE-7 / P3）。
 */

import { describe, expect, test } from 'bun:test'
import { createLayoutEngine } from './engine'
import { solo } from './gestures'
import { parseNotation } from './notation'
import type { Layout, Scene } from './types'

function layoutOf(notation: string, attention: Record<string, number>): Layout {
  return { structure: parseNotation(notation).structure, attention }
}

function makeEngine() {
  let now = 1000
  return createLayoutEngine({ clock: () => now++ })
}

/** 半々の a | b から「a solo」への遷移を開いた状態を作る */
function opened() {
  const engine = makeEngine()
  engine.update('s', () => layoutOf('a | b', { a: 1, b: 1 }))
  const target = layoutOf('a | b', { a: 1, b: 0 })
  const handle = engine.beginTransition('s', target)
  return { engine, handle }
}

describe('transition — scrub の中間形', () => {
  test('t = 0 では表示は base のまま', () => {
    const { engine } = opened()
    expect(engine.resolved('s').a?.rect.w).toBeCloseTo(0.5)
  })

  test('t = 0.5 で rect が線形補間される', () => {
    const { engine, handle } = opened()
    handle.scrub(0.5)
    // a: 0.5 → 1 の中点 = 0.75 / b: 0.5 → 0 の中点 = 0.25
    expect(engine.resolved('s').a?.rect.w).toBeCloseTo(0.75)
    expect(engine.resolved('s').b?.rect.w).toBeCloseTo(0.25)
  })

  test('非有限の t は 1 = jump に倒す', () => {
    const { engine, handle } = opened()
    handle.scrub(Number.NaN)
    expect(handle.t).toBe(1)
    expect(engine.resolved('s').a?.rect.w).toBeCloseTo(1)
  })

  test('scrub が purely 表示を動かすだけで current layout は不変', () => {
    const { engine, handle } = opened()
    handle.scrub(0.9)
    expect(engine.current('s').attention.b).toBe(1)
  })
})

describe('transition — 着地（commit / cancel）', () => {
  test('commit で target が current になり settle log に author 付きで刻まれる', () => {
    const { engine, handle } = opened()
    handle.scrub(1)
    handle.commit('ai')
    expect(engine.current('s').attention.b).toBe(0)
    expect(engine.resolved('s').a?.rect.w).toBeCloseTo(1)
    const log = engine.history('s')
    expect(log.length).toBe(1)
    expect(log[0]?.author).toBe('ai')
    expect(handle.done).toBe(true)
    expect(engine.transition('s')).toBeNull()
  })

  test('cancel で元の layout の表示に戻り、log には何も残らない', () => {
    const { engine, handle } = opened()
    handle.scrub(0.7)
    handle.cancel()
    expect(engine.resolved('s').a?.rect.w).toBeCloseTo(0.5)
    expect(engine.history('s').length).toBe(0)
    expect(handle.done).toBe(true)
  })

  test('done 後の handle 操作は全て no-op（stale handle は無害）', () => {
    const { engine, handle } = opened()
    handle.commit('human')
    const before = engine.resolved('s')
    handle.scrub(0.5)
    handle.cancel()
    handle.updateTarget((l) => solo(l, 'b'))
    expect(engine.resolved('s')).toEqual(before)
    expect(engine.history('s').length).toBe(1)
  })

  test('nearestEndpoint: t < 0.5 → 0、以上 → 1（§5 スクラブ手放し）', () => {
    const { handle } = opened()
    handle.scrub(0.49)
    expect(handle.nearestEndpoint()).toBe(0)
    handle.scrub(0.5)
    expect(handle.nearestEndpoint()).toBe(1)
  })
})

describe('transition — 連鎖と再目標', () => {
  test('遷移中の begin は「今見えている中間形」を base にする（表示が飛ばない）', () => {
    const { engine, handle } = opened()
    handle.scrub(0.5)
    const midWidth = engine.resolved('s').a?.rect.w // 0.75

    const next = engine.beginTransition('s', layoutOf('a | b', { a: 1, b: 1 }))
    expect(handle.done).toBe(true) // 前の遷移は置き換え
    expect(engine.resolved('s').a?.rect.w).toBeCloseTo(midWidth ?? -1) // t = 0 = 中間形のまま
    next.scrub(1)
    expect(engine.resolved('s').a?.rect.w).toBeCloseTo(0.5)
  })

  test('updateTarget は morph を続けたまま目標だけ書き換える（Touch per-pane の土台）', () => {
    const { engine, handle } = opened()
    handle.scrub(0.5)
    handle.updateTarget((l) => ({ ...l, attention: { ...l.attention, b: 0.5 } }))
    expect(handle.done).toBe(false)
    handle.scrub(1)
    // 新 target: a:1, b:0.5 → 幅 2/3 : 1/3
    expect(engine.resolved('s').a?.rect.w).toBeCloseTo(2 / 3)
  })
})

describe('transition — seize（直接操作の奪取）', () => {
  test('update が遷移を破棄して直接操作が勝つ', () => {
    const { engine, handle } = opened()
    handle.scrub(0.5)
    engine.update('s', (l) => solo(l, 'b'))
    expect(handle.done).toBe(true)
    expect(engine.resolved('s').b?.rect.w).toBeCloseTo(1)
    // stale handle の commit は効かない
    handle.commit('ai')
    expect(engine.current('s').attention.a).toBe(0)
  })

  test('applyScene / restoreLastSettle / moveFloat も同じ規則で seize', () => {
    const engine = makeEngine()
    engine.update('s', () => layoutOf('a | b', { a: 1, b: 1 }))
    engine.settle('s', 'human')

    const h1 = engine.beginTransition('s', layoutOf('a', { a: 1 }))
    const scene: Scene = { id: 'sc', name: 'both', layout: layoutOf('a | b', { a: 1, b: 1 }) }
    engine.applyScene('s', scene)
    expect(h1.done).toBe(true)

    const h2 = engine.beginTransition('s', layoutOf('a', { a: 1 }))
    engine.restoreLastSettle('s')
    expect(h2.done).toBe(true)

    engine.update('s', () => layoutOf('a ~ f', { a: 1, f: 1 }))
    const h3 = engine.beginTransition('s', layoutOf('a', { a: 1 }))
    engine.moveFloat('s', 'f', { x: 0.1, y: 0.1 })
    expect(h3.done).toBe(true)
  })
})
