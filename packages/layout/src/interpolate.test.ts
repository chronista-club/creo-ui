/**
 * interpolate の端点一致 + 欠員収束 + 線形性。
 */

import { describe, expect, test } from 'bun:test'
import { interpolate } from './interpolate'
import { parseNotation } from './notation'
import { resolve } from './resolve'
import { lcg, randomLayout } from './testkit'
import type { Layout } from './types'

function layoutOf(notation: string, attention: Record<string, number>): Layout {
  return { structure: parseNotation(notation).structure, attention }
}

const A = resolve(layoutOf('a | b', { a: 1, b: 1 }))
const B = resolve(layoutOf('a | b', { a: 3, b: 1 }))

describe('interpolate — 端点と線形性', () => {
  test('t = 0 は A そのもの、t = 1 は B そのもの（参照一致）', () => {
    expect(interpolate(A, B, 0)).toBe(A)
    expect(interpolate(A, B, 1)).toBe(B)
  })

  test('t は [0,1] に clamp される', () => {
    expect(interpolate(A, B, -0.5)).toBe(A)
    expect(interpolate(A, B, 1.5)).toBe(B)
  })

  test('中間は rect の線形補間', () => {
    const mid = interpolate(A, B, 0.5)
    // a: w 0.5 → 0.75、中点 0.625
    expect(mid.a?.rect.w).toBeCloseTo(0.625)
    expect(mid.b?.rect.x).toBeCloseTo(0.625)
  })

  test('property: ランダム 200 例で端点一致', () => {
    const rand = lcg(0xd1ce)
    for (let i = 0; i < 200; i++) {
      const ra = resolve(randomLayout(rand))
      const rb = resolve(randomLayout(rand))
      expect(interpolate(ra, rb, 0)).toBe(ra)
      expect(interpolate(ra, rb, 1)).toBe(rb)
    }
  })
})

describe('interpolate — 端点に居ない pane の収束', () => {
  test('B にだけ居る pane は自 rect の中心から生まれてくる', () => {
    const to = resolve(layoutOf('a | nu', { a: 1, nu: 1 }))
    const mid = interpolate(A, to, 0.5)
    const target = to.nu
    if (!target) throw new Error('nu が resolve されていない')
    // t=0.5: 中心（面積 0）と実 rect の中点
    expect(mid.nu?.rect.w).toBeCloseTo(target.rect.w / 2)
    expect(mid.nu?.attention).toBeCloseTo(target.attention / 2)
  })

  test('A にだけ居る pane は自 rect の中心へ畳まれていく', () => {
    const from = resolve(layoutOf('a | old', { a: 1, old: 1 }))
    const to = resolve(layoutOf('a', { a: 1 }))
    const late = interpolate(from, to, 0.75)
    expect(late.old?.rect.w).toBeCloseTo((from.old?.rect.w ?? 0) * 0.25)
  })

  test('t = NaN は jump（= B）に倒れる — Math.min/max は NaN を素通しするため', () => {
    expect(interpolate(A, B, Number.NaN)).toBe(B)
  })
})
