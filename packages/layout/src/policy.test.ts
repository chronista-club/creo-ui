/**
 * policy — apply policy = DAW automation modes（LE-16）。
 */

import { describe, expect, test } from 'bun:test'
import { createTimeDriver, jumpDriver } from './drivers'
import type { TimeCurve } from './drivers'
import { createLayoutEngine } from './engine'
import { parseNotation } from './notation'
import { proposeLayout } from './policy'
import type { Layout } from './types'

function layoutOf(notation: string, attention: Record<string, number>): Layout {
  return { structure: parseNotation(notation).structure, attention }
}

function setup() {
  const engine = createLayoutEngine({ clock: () => 1 })
  engine.update('s', () => layoutOf('a | b', { a: 1, b: 1 }))
  const target = layoutOf('a | b', { a: 1, b: 0 })
  return { engine, target }
}

describe('proposeLayout — mode table', () => {
  test('off: 受けない（遷移も開かない）', () => {
    const { engine, target } = setup()
    const result = proposeLayout(engine, 's', target, { policy: 'off' })
    expect(result.accepted).toBe(false)
    expect(engine.transition('s')).toBeNull()
    expect(engine.resolved('s').b?.rect.w).toBeCloseTo(0.5)
  })

  test('write: 遷移を開くだけで表示は動かない — 適用は人の手', () => {
    const { engine, target } = setup()
    const result = proposeLayout(engine, 's', target, { policy: 'write' })
    expect(result.accepted).toBe(true)
    expect(result.drive).toBeUndefined()
    expect(engine.resolved('s').b?.rect.w).toBeCloseTo(0.5) // t = 0 のまま
    // 人が t フェーダーで覗いて commit する
    result.handle?.scrub(0.5)
    expect(engine.resolved('s').b?.rect.w).toBeCloseTo(0.25)
    result.handle?.commit('human')
    expect(engine.history('s')[0]?.author).toBe('human')
  })

  test('read: driver が t を 1 へ運び、到達で commit（author = ai の監査証跡）', async () => {
    const { engine, target } = setup()
    const result = proposeLayout(engine, 's', target, { policy: 'read', driver: jumpDriver })
    expect(result.accepted).toBe(true)
    await result.drive?.finished
    await Promise.resolve() // commit は finished の .then で走る
    expect(engine.current('s').attention.b).toBe(0)
    expect(engine.history('s')[0]?.author).toBe('ai')
  })

  test('read: time driver 経由でも同じ着地（手動時計で決定的に）', async () => {
    const { engine, target } = setup()
    let nowMs = 0
    let pending: (() => void) | null = null
    const linear: TimeCurve = { position: (s) => s, settleTime: 1 }
    const driver = createTimeDriver({
      curve: linear,
      now: () => nowMs,
      schedule: (cb) => {
        pending = cb
        return () => {
          pending = null
        }
      },
    })
    const result = proposeLayout(engine, 's', target, { policy: 'read', driver })
    const step = (ms: number) => {
      nowMs += ms
      const cb = pending
      pending = null
      cb?.()
    }
    step(500)
    expect(engine.resolved('s').b?.rect.w).toBeCloseTo(0.25) // 中間形が見えている
    step(600)
    await result.drive?.finished
    await Promise.resolve()
    expect(engine.current('s').attention.b).toBe(0)
    expect(engine.history('s')[0]?.author).toBe('ai')
  })

  test('touch: 駆動中の human 奪取（drive.cancel + 直接操作）で commit は起きない', async () => {
    const { engine, target } = setup()
    let pending: (() => void) | null = null
    const driver = createTimeDriver({
      curve: { position: (s) => s, settleTime: 1 },
      now: () => 0,
      schedule: (cb) => {
        pending = cb
        return () => {
          pending = null
        }
      },
    })
    const result = proposeLayout(engine, 's', target, { policy: 'touch', driver })
    // human がコントロールに触れた → consumer 配線: drive を止め、直接操作へ
    result.drive?.cancel()
    engine.update('s', (l) => ({ ...l, attention: { ...l.attention, b: 0.8 } }))
    expect(await result.drive?.finished).toBe(false)
    await Promise.resolve()
    expect(engine.current('s').attention.b).toBe(0.8) // human の操作が最終形
    expect(engine.history('s').length).toBe(0) // AI commit は走っていない
    void pending
  })
})
