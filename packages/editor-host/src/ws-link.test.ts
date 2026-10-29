/**
 * bun test packages/editor-host/src/ws-link.test.ts
 *
 * WebSocket transport の純計算部分 (再接続の間隔) だけ検証する。
 * 実 WebSocket は bun test で開かない。
 */
import { describe, expect, test } from 'bun:test'
import { __test__ } from './ws-link'

describe('reconnectDelay', () => {
  test('doubles from 1s and caps at the max', () => {
    const delays = [0, 1, 2, 3, 4, 5, 6].map((n) => __test__.reconnectDelay(n, 30_000))
    expect(delays).toEqual([1_000, 2_000, 4_000, 8_000, 16_000, 30_000, 30_000])
  })

  test('respects a smaller cap', () => {
    expect(__test__.reconnectDelay(10, 5_000)).toBe(5_000)
  })
})
