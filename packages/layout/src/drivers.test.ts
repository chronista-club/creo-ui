/**
 * drivers — time / jump driver と settleRelease（LE-7 / P3）。
 * 時計と scheduler を注入して決定的に回す（実時間には依存しない）。
 */

import { describe, expect, test } from 'bun:test'
import { createTimeDriver, defaultCurve, jumpDriver, settleRelease } from './drivers'
import type { TimeCurve } from './drivers'
import { createLayoutEngine } from './engine'
import { parseNotation } from './notation'
import type { Layout } from './types'

/** 手動 scheduler + 手動時計。tick(ms) で 1 frame 進める */
function manualClock() {
  let nowMs = 0
  let pending: (() => void) | null = null
  return {
    now: () => nowMs,
    schedule: (cb: () => void) => {
      pending = cb
      return () => {
        pending = null
      }
    },
    tick(ms: number) {
      nowMs += ms
      const cb = pending
      pending = null
      cb?.()
    },
    hasPending: () => pending !== null,
  }
}

/** 線形 curve（1 秒で 0 → 1）。spring の物理はここでは無関係なので最単純形で */
const linear: TimeCurve = { position: (s) => s, settleTime: 1 }

describe('createTimeDriver', () => {
  test('curve を実時間で sample して t を進め、settleTime で必ず to に着地する', async () => {
    const clock = manualClock()
    const driver = createTimeDriver({ curve: linear, now: clock.now, schedule: clock.schedule })
    const applied: number[] = []
    const run = driver.start((t) => applied.push(t))

    expect(applied.length).toBe(0) // start は同期に apply しない
    clock.tick(0)
    clock.tick(250)
    clock.tick(250)
    clock.tick(600) // 累計 1100ms > settleTime
    expect(applied[0]).toBeCloseTo(0)
    expect(applied[1]).toBeCloseTo(0.25)
    expect(applied[2]).toBeCloseTo(0.5)
    expect(applied[3]).toBe(1) // 終端は正確に to
    expect(await run.finished).toBe(true)
    expect(clock.hasPending()).toBe(false)
  })

  test('range で部分区間を駆動できる（release の「現在地 → 端点」）', () => {
    const clock = manualClock()
    const driver = createTimeDriver({ curve: linear, now: clock.now, schedule: clock.schedule })
    const applied: number[] = []
    driver.start((t) => applied.push(t), { from: 0.8, to: 0 })
    clock.tick(500)
    clock.tick(600)
    expect(applied[0]).toBeCloseTo(0.4) // 0.8 → 0 の中点
    expect(applied[1]).toBe(0)
  })

  test('cancel で以降の apply が止まり finished = false', async () => {
    const clock = manualClock()
    const driver = createTimeDriver({ curve: linear, now: clock.now, schedule: clock.schedule })
    const applied: number[] = []
    const run = driver.start((t) => applied.push(t))
    clock.tick(300)
    run.cancel()
    clock.tick(1000)
    expect(applied.length).toBe(1)
    expect(await run.finished).toBe(false)
  })

  test('壊れた curve（NaN）でも settleTime で終端に着く', async () => {
    const clock = manualClock()
    const broken: TimeCurve = { position: () => Number.NaN, settleTime: 1 }
    const driver = createTimeDriver({ curve: broken, now: clock.now, schedule: clock.schedule })
    const applied: number[] = []
    const run = driver.start((t) => applied.push(t))
    clock.tick(500)
    clock.tick(600)
    expect(applied.every((t) => Number.isFinite(t))).toBe(true)
    expect(applied[applied.length - 1]).toBe(1)
    expect(await run.finished).toBe(true)
  })
})

describe('defaultCurve', () => {
  test('臨界減衰: 0 始まり、単調、settleTime で ≈1、overshoot なし', () => {
    expect(defaultCurve.position(0)).toBeCloseTo(0, 6)
    let prev = -1
    for (let s = 0; s <= defaultCurve.settleTime; s += defaultCurve.settleTime / 50) {
      const p = defaultCurve.position(s)
      expect(p).toBeGreaterThanOrEqual(prev)
      expect(p).toBeLessThanOrEqual(1)
      prev = p
    }
    expect(defaultCurve.position(defaultCurve.settleTime)).toBeCloseTo(1, 2)
  })
})

describe('jumpDriver', () => {
  test('同期に to へ jump（reduced-motion の driver 選択の受け皿）', async () => {
    const applied: number[] = []
    const run = jumpDriver.start((t) => applied.push(t))
    expect(applied).toEqual([1])
    expect(await run.finished).toBe(true)
  })
})

describe('settleRelease — スクラブ手放しの着地（§5）', () => {
  function layoutOf(notation: string, attention: Record<string, number>): Layout {
    return { structure: parseNotation(notation).structure, attention }
  }

  function openedAt(t: number) {
    const engine = createLayoutEngine({ clock: () => 1 })
    engine.update('s', () => layoutOf('a | b', { a: 1, b: 1 }))
    const handle = engine.beginTransition('s', layoutOf('a | b', { a: 1, b: 0 }))
    handle.scrub(t)
    return { engine, handle }
  }

  test('t ≥ 0.5 は commit 側へ着地（author は引数）', async () => {
    const { engine, handle } = openedAt(0.7)
    const run = settleRelease(handle, jumpDriver)
    await run.finished
    expect(handle.done).toBe(true)
    expect(engine.current('s').attention.b).toBe(0)
    expect(engine.history('s')[0]?.author).toBe('human')
  })

  test('t < 0.5 は cancel 側へ着地（log には残らない）', async () => {
    const { engine, handle } = openedAt(0.3)
    const run = settleRelease(handle, jumpDriver)
    await run.finished
    expect(handle.done).toBe(true)
    expect(engine.current('s').attention.b).toBe(1)
    expect(engine.history('s').length).toBe(0)
  })
})
