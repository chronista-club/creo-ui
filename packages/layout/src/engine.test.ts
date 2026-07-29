/**
 * engine — scope 束ね / settle log / 一時状態の復帰 / float の ephemeral 位置。
 */

import { describe, expect, test } from 'bun:test'
import { createLayoutEngine } from './engine'
import { admit, popOut, solo } from './gestures'
import { parseNotation } from './notation'
import type { Layout, ResolvedMap, Scene } from './types'

function layoutOf(notation: string, attention: Record<string, number>): Layout {
  return { structure: parseNotation(notation).structure, attention }
}

function makeEngine() {
  let now = 1000
  const engine = createLayoutEngine({ clock: () => now++ })
  return { engine, tick: () => now }
}

describe('engine — scope と settle log', () => {
  test('scope ごとに独立した Layout（LE-11）', () => {
    const { engine } = makeEngine()
    engine.update('lane-a', () => layoutOf('a', { a: 1 }))
    engine.update('lane-b', () => layoutOf('x | y', { x: 1, y: 1 }))
    expect(engine.current('lane-a').structure.columns.length).toBe(1)
    expect(engine.current('lane-b').structure.columns.length).toBe(2)
  })

  test('settle が log に刻まれ、履歴 = 無名 Scene の列になる', () => {
    const { engine } = makeEngine()
    engine.update('s', () => layoutOf('a | b', { a: 1, b: 1 }))
    engine.settle('s', 'human')
    engine.update('s', (l) => solo(l, 'a'))
    engine.settle('s', 'ai')
    const log = engine.history('s')
    expect(log.length).toBe(2)
    expect(log[0]?.author).toBe('human')
    expect(log[1]?.author).toBe('ai')
    expect(log[1]?.at).toBeGreaterThan(log[0]?.at as number)
  })

  test('restoreLastSettle — 一時状態（solo 等）からの復帰先は last settle', () => {
    const { engine } = makeEngine()
    engine.update('s', () => layoutOf('a | b', { a: 1, b: 1 }))
    engine.settle('s', 'human')
    engine.update('s', (l) => solo(l, 'a')) // 逸脱（settle しない）
    expect(engine.current('s').attention.b).toBe(0)
    expect(engine.restoreLastSettle('s')).toBe(true)
    expect(engine.current('s').attention.b).toBe(1) // un-solo
  })

  test('log が空なら restore は false', () => {
    const { engine } = makeEngine()
    expect(engine.restoreLastSettle('empty')).toBe(false)
  })
})

describe('engine — Scene apply（total recall、LE-14）', () => {
  test('未記載 pane は消え、preset は mutate されない', () => {
    const { engine } = makeEngine()
    engine.update('s', () => layoutOf('a | b | c', { a: 1, b: 1, c: 1 }))
    const scene: Scene = { id: 'sc', name: 'focus a', layout: layoutOf('a', { a: 1 }) }
    engine.applyScene('s', scene)
    expect(engine.current('s').attention.b).toBeUndefined()
    expect(engine.history('s')[0]?.author).toBe('scene')
    // preset の immutable 性: current を触っても scene 側は不変
    engine.update('s', (l) => solo(l, 'a'))
    expect(scene.layout.attention.a).toBe(1)
  })
})

describe('engine — float の ephemeral 位置（LE-18）', () => {
  test('moveFloat が resolved の rect に効き、popIn で位置が消える', () => {
    const { engine } = makeEngine()
    let last: ResolvedMap = {}
    engine.subscribe((_, resolved) => {
      last = resolved
    })

    engine.update('s', () => layoutOf('a ~ f', { a: 1, f: 1 }))
    const centered = last.f
    expect(centered?.floating).toBe(true)
    expect(centered?.rect.x).toBeCloseTo(0.25)

    engine.moveFloat('s', 'f', { x: 0.1, y: 0.05 })
    expect(last.f?.rect.x).toBeCloseTo(0.1)
    expect(last.f?.rect.y).toBeCloseTo(0.05)

    // dock すると floating でなくなり、ephemeral 位置は捨てられる
    engine.update('s', (l) => admit(l, 'f', { column: 0 }))
    expect(last.f?.floating).toBe(false)
    // 再び popOut しても位置は復活しない（中央に戻る = ephemeral の寿命）
    engine.update('s', (l) => popOut(l, 'f'))
    expect(last.f?.rect.x).toBeCloseTo((1 - (last.f?.rect.w ?? 0)) / 2)
  })

  test('位置は枠内に clamp される', () => {
    const { engine } = makeEngine()
    engine.update('s', () => layoutOf('a ~ f', { a: 1, f: 1 }))
    engine.moveFloat('s', 'f', { x: 0.9, y: 0.9 })
    const f = engine.resolved('s').f
    expect((f?.rect.x ?? 0) + (f?.rect.w ?? 0)).toBeLessThanOrEqual(1 + 1e-9)
  })
})
