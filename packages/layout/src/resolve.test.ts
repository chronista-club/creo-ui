/**
 * resolve の golden + property。
 * golden は記法文字列で状況を書く。property は §2 再導出表の実行形。
 */

import { describe, expect, test } from 'bun:test'
import { popIn, popOut, setShare } from './gestures'
import { parseNotation } from './notation'
import { resolve } from './resolve'
import { lcg, randomLayout } from './testkit'
import type { Layout, ResolvedPane } from './types'

function layoutOf(notation: string, attention: Record<string, number>): Layout {
  return { structure: parseNotation(notation).structure, attention }
}

const area = (p: ResolvedPane): number => p.rect.w * p.rect.h

/** 2 つの rect の重なり面積 */
function overlap(a: ResolvedPane, b: ResolvedPane): number {
  const w = Math.min(a.rect.x + a.rect.w, b.rect.x + b.rect.w) - Math.max(a.rect.x, b.rect.x)
  const h = Math.min(a.rect.y + a.rect.h, b.rect.y + b.rect.h) - Math.max(a.rect.y, b.rect.y)
  return Math.max(0, w) * Math.max(0, h)
}

describe('resolve — golden', () => {
  test('a | b 等値 → 半々', () => {
    const r = resolve(layoutOf('a | b', { a: 1, b: 1 }))
    expect(r.a?.rect).toEqual({ x: 0, y: 0, w: 0.5, h: 1 })
    expect(r.b?.rect).toEqual({ x: 0.5, y: 0, w: 0.5, h: 1 })
  })

  test('a | b/c 等値 → 右列は縦半々', () => {
    const r = resolve(layoutOf('a | b/c', { a: 1, b: 1, c: 1 }))
    expect(r.a?.rect).toEqual({ x: 0, y: 0, w: 0.5, h: 1 })
    expect(r.b?.rect).toEqual({ x: 0.5, y: 0, w: 0.5, h: 0.5 })
    expect(r.c?.rect).toEqual({ x: 0.5, y: 0.5, w: 0.5, h: 0.5 })
  })

  test('列集約は max — 列の幅はその列で一番見たいものが決める', () => {
    const r = resolve(layoutOf('a | b/c', { a: 0.2, b: 0.1, c: 0.6 }))
    // 列実効 = max(0.1, 0.6) = 0.6、幅 = 0.2:0.6 → 0.25 / 0.75
    expect(r.a?.rect.w).toBeCloseTo(0.25)
    expect(r.b?.rect.w).toBeCloseTo(0.75)
    // 列内の高さは 0.1:0.6 の正規化
    expect(r.b?.rect.h).toBeCloseTo(0.1 / 0.7)
    expect(r.c?.rect.h).toBeCloseTo(0.6 / 0.7)
  })

  test('attention 0 = 非表示: 残りが全面を取り、非表示は所属位置で面積 0', () => {
    const r = resolve(layoutOf('a | b', { a: 1, b: 0 }))
    expect(r.a?.rect).toEqual({ x: 0, y: 0, w: 1, h: 1 })
    expect(area(r.b as ResolvedPane)).toBe(0)
    expect(r.b?.rect.x).toBe(1) // 自列の位置（右端境界）に畳まれる
  })

  test('列の中の 1 枚だけ非表示 → 残りが列の全高', () => {
    const r = resolve(layoutOf('a | b/c', { a: 1, b: 1, c: 0 }))
    expect(r.b?.rect.h).toBe(1)
    expect(r.c?.rect.h).toBe(0)
    expect(r.c?.rect.y).toBe(1)
  })

  test('floating: 構造非所属 × attention > 0 は中央に浮く', () => {
    const r = resolve(layoutOf('a ~ f', { a: 1, f: 1 }))
    expect(r.a?.rect).toEqual({ x: 0, y: 0, w: 1, h: 1 }) // tiled は面積を奪われない
    const f = r.f as ResolvedPane
    expect(f.floating).toBe(true)
    expect(f.rect.w).toBeCloseTo(0.5) // share = 1/2 の射影
    expect(f.rect.x).toBeCloseTo(0.25) // 中央
  })

  test('非所属 × 0 = 外（emit されない）', () => {
    const layout: Layout = { structure: parseNotation('a').structure, attention: { a: 1, gone: 0 } }
    expect(resolve(layout).gone).toBeUndefined()
  })

  test('taper が面積写像に効く', () => {
    const square = (n: number) => n * n
    const r = resolve(layoutOf('a | b', { a: 1, b: 2 }), { taper: square })
    expect(r.a?.rect.w).toBeCloseTo(1 / 5) // 1² : 2² = 1 : 4
  })
})

describe('resolve — property（§2 再導出表の実行形）', () => {
  test('500 例: 可視 tiled の面積和 = 1 / 非重複 / 範囲内 / share 和 = 1', () => {
    const rand = lcg(0xbada55)
    for (let i = 0; i < 500; i++) {
      const layout = randomLayout(rand)
      const resolved = resolve(layout)
      const visibleTiled = Object.values(resolved).filter((p) => !p.floating && area(p) > 0)

      // 面積和 = 1（可視の所属 pane が 1 つでもあれば）
      if (visibleTiled.length > 0) {
        const total = visibleTiled.reduce((s, p) => s + area(p), 0)
        expect(total).toBeCloseTo(1, 9)
      }

      // tiled 同士は重ならない
      for (let x = 0; x < visibleTiled.length; x++) {
        for (let y = x + 1; y < visibleTiled.length; y++) {
          expect(
            overlap(visibleTiled[x] as ResolvedPane, visibleTiled[y] as ResolvedPane),
          ).toBeLessThan(1e-9)
        }
      }

      // 全 rect が 0..1 に収まり有限
      for (const p of Object.values(resolved)) {
        for (const v of [p.rect.x, p.rect.y, p.rect.w, p.rect.h, p.attention]) {
          expect(Number.isFinite(v)).toBe(true)
          expect(v).toBeGreaterThanOrEqual(0)
          expect(v).toBeLessThanOrEqual(1 + 1e-9)
        }
      }

      // 可視 pane の share 和 = 1
      const shares = Object.values(resolved).filter((p) => p.attention > 0)
      if (shares.length > 0) {
        expect(shares.reduce((s, p) => s + p.attention, 0)).toBeCloseTo(1, 9)
      }
    }
  })
})

describe('resolve — 壊れた入力への耐性（非有限は 0 = 非表示に倒す）', () => {
  test('Infinity は非表示扱いになり、兄弟の座標を汚染しない', () => {
    const r = resolve(layoutOf('a | b', { a: Number.POSITIVE_INFINITY, b: 1 }))
    expect(r.b?.rect).toEqual({ x: 0, y: 0, w: 1, h: 1 })
    expect(area(r.a as ResolvedPane)).toBe(0)
    for (const p of Object.values(r)) {
      for (const v of [p.rect.x, p.rect.y, p.rect.w, p.rect.h, p.attention]) {
        expect(Number.isFinite(v)).toBe(true)
      }
    }
  })

  test('NaN / 負値も非表示扱い', () => {
    const r = resolve(layoutOf('a | b/c', { a: 1, b: Number.NaN, c: -2 }))
    expect(r.a?.rect).toEqual({ x: 0, y: 0, w: 1, h: 1 })
    expect(area(r.b as ResolvedPane)).toBe(0)
    expect(area(r.c as ResolvedPane)).toBe(0)
  })

  test('taper が非有限を返しても非表示に倒れる', () => {
    const broken = () => Number.NaN
    const r = resolve(layoutOf('a | b', { a: 1, b: 1 }), { taper: broken })
    for (const p of Object.values(r)) {
      expect(Number.isFinite(p.rect.x)).toBe(true)
      expect(p.attention).toBe(0)
    }
  })
})

describe('resolve — 列幅 lock（LE-21）', () => {
  test('lock した列の幅は場が動いても不変（sidebar 用途）', () => {
    const base: Layout = { ...layoutOf('sb | a/b', { sb: 1, a: 1, b: 1 }), locks: { sb: 0.25 } }
    expect(resolve(base).sb?.rect.w).toBeCloseTo(0.25)
    // 場を大きく動かしても lock は不変、残り列が余りを吸収する
    const shifted = setShare(base, 'a', 0.8)
    expect(shifted.locks?.sb).toBe(0.25) // gesture が locks を保持
    expect(resolve(shifted).sb?.rect.w).toBeCloseTo(0.25)
    expect(resolve(shifted).a?.rect.w).toBeCloseTo(0.75)
  })

  test('unlocked 列が余りを正規化', () => {
    const l: Layout = { ...layoutOf('sb | a | b', { sb: 1, a: 1, b: 1 }), locks: { sb: 0.25 } }
    const r = resolve(l)
    expect(r.a?.rect.w).toBeCloseTo(0.375)
    expect(r.b?.rect.w).toBeCloseTo(0.375)
  })

  test('locked 列しか可視で無ければ正規化して埋める（幅和 = 1 維持）', () => {
    const l: Layout = { ...layoutOf('sb | a', { sb: 1, a: 0 }), locks: { sb: 0.25 } }
    expect(resolve(l).sb?.rect.w).toBeCloseTo(1)
  })

  test('過剰 lock は比例縮小して幅和 = 1 を保つ（unlocked は 0 幅まで潰れる）', () => {
    const l: Layout = { ...layoutOf('x | y | c', { x: 1, y: 1, c: 1 }), locks: { x: 0.7, y: 0.7 } }
    const r = resolve(l)
    expect(r.x?.rect.w).toBeCloseTo(0.5)
    expect(r.y?.rect.w).toBeCloseTo(0.5)
    expect(r.c?.rect.w).toBeCloseTo(0)
  })

  test('非所属 pane の lock は休眠し、popIn で復活', () => {
    const base: Layout = { ...layoutOf('sb | a', { sb: 1, a: 1 }), locks: { sb: 0.3 } }
    const floated = popOut(base, 'sb')
    expect(resolve(floated).a?.rect.w).toBeCloseTo(1) // lock 休眠
    expect(resolve(floated).sb?.floating).toBe(true)
    const docked = popIn(floated, 'sb')
    expect(resolve(docked).sb?.rect.w).toBeCloseTo(0.3) // 復活
    expect(resolve(docked).a?.rect.w).toBeCloseTo(0.7)
  })

  test('壊れた lock 値（NaN / 負）は無視、範囲外は 1 に clamp', () => {
    const broken: Layout = {
      ...layoutOf('a | b', { a: 1, b: 1 }),
      locks: { a: Number.NaN, b: -1 },
    }
    expect(resolve(broken).a?.rect.w).toBeCloseTo(0.5) // 両方無視 → 通常の正規化

    const over: Layout = { ...layoutOf('a | b', { a: 1, b: 1 }), locks: { a: 2.5 } }
    const r = resolve(over)
    expect(r.a?.rect.w).toBeCloseTo(1) // clamp → 全幅
    expect(r.b?.rect.w).toBeCloseTo(0)
  })
})
