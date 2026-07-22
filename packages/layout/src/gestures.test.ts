/**
 * gestures の golden + guard。
 * no-op / 拒否は「同一参照を返す」で検知する（呼び手が失敗を知れる契約）。
 */

import { describe, expect, test } from 'bun:test'
import {
  admit,
  equalize,
  lock,
  moveDominance,
  mute,
  popIn,
  popOut,
  setShare,
  solo,
  unlock,
  visibleIds,
} from './gestures'
import { parseNotation } from './notation'
import { resolve } from './resolve'
import { lcg, randomLayout } from './testkit'
import type { Layout } from './types'

function layoutOf(notation: string, attention: Record<string, number>): Layout {
  return { structure: parseNotation(notation).structure, attention }
}

describe('setShare — share 直接指定（VCA 同型）', () => {
  test('share 0.75 を指定すると resolved の取り分が 0.75 になる', () => {
    const l = setShare(layoutOf('a | b', { a: 1, b: 1 }), 'a', 0.75)
    expect(l.attention.a).toBeCloseTo(3) // 0.75/(1-0.75) × 1
    const r = resolve(l)
    expect(r.a?.rect.w).toBeCloseTo(0.75)
    expect(r.b?.rect.w).toBeCloseTo(0.25) // untouched は余りへ比例配分
  })

  test('非表示 pane への setShare は un-mute になる', () => {
    const l = setShare(layoutOf('a | b', { a: 1, b: 0 }), 'b', 0.5)
    expect(l.attention.b).toBeCloseTo(1)
  })

  test('share 0 は mute に落ちる', () => {
    const l = setShare(layoutOf('a | b', { a: 1, b: 1 }), 'b', 0)
    expect(l.attention.b).toBe(0)
  })

  test('他に可視が居なければ share は常に 1（raw は保存）', () => {
    const base = layoutOf('a', { a: 0.4 })
    expect(setShare(base, 'a', 0.7)).toBe(base)
  })
})

describe('mute — 全零 guard', () => {
  test('最後の可視 1 枚は拒否（同一参照）', () => {
    const base = layoutOf('a | b', { a: 1, b: 0 })
    expect(mute(base, 'a')).toBe(base)
  })

  test('既に非表示なら no-op', () => {
    const base = layoutOf('a | b', { a: 1, b: 0 })
    expect(mute(base, 'b')).toBe(base)
  })

  test('通常の mute', () => {
    const l = mute(layoutOf('a | b', { a: 1, b: 1 }), 'b')
    expect(l.attention.b).toBe(0)
    expect(visibleIds(l)).toEqual(['a'])
  })
})

describe('solo / equalize', () => {
  test('solo は指定以外を全部 0 に', () => {
    const l = solo(layoutOf('a | b/c', { a: 1, b: 2, c: 3 }), 'b')
    expect(visibleIds(l)).toEqual(['b'])
    expect(l.attention.b).toBe(2) // raw は保存
  })

  test('非表示 pane の solo は 1 で立ち上がる', () => {
    const l = solo(layoutOf('a | b', { a: 1, b: 0 }), 'b')
    expect(l.attention.b).toBe(1)
    expect(l.attention.a).toBe(0)
  })

  test('equalize は可視を等分 snap', () => {
    const l = equalize(layoutOf('a | b', { a: 3, b: 1 }))
    const r = resolve(l)
    expect(r.a?.rect.w).toBeCloseTo(0.5)
  })
})

describe('moveDominance — 2D cyclic swap', () => {
  const base = layoutOf('a | b/c', { a: 3, b: 2, c: 1 })

  test('右へ: 隣列の代表（max）と swap', () => {
    const l = moveDominance(base, 'right')
    // dominant = a(3)、右列の代表 = b(2) → swap
    expect(l.attention.a).toBe(2)
    expect(l.attention.b).toBe(3)
  })

  test('横は wrap する', () => {
    const l = moveDominance(base, 'left') // 2 列なので left も右列へ
    expect(l.attention.b).toBe(3)
  })

  test('縦は列内で cyclic', () => {
    const vertical = layoutOf('a/b', { a: 2, b: 1 })
    const l = moveDominance(vertical, 'down')
    expect(l.attention.b).toBe(2)
    expect(l.attention.a).toBe(1)
  })

  test('1 枚だけなら no-op（同一参照）', () => {
    const single = layoutOf('a', { a: 1 })
    expect(moveDominance(single, 'right')).toBe(single)
  })

  test('dominant が floating の間は no-op', () => {
    const l = layoutOf('a ~ f', { a: 1, f: 5 })
    expect(moveDominance(l, 'right')).toBe(l)
  })
})

describe('admit / popOut / popIn', () => {
  test('入場は tiled 直入り: 末尾新規列 + 可視平均', () => {
    const l = admit(layoutOf('a | b', { a: 2, b: 4 }), 'nu')
    expect(l.structure.columns).toEqual([{ panes: ['a'] }, { panes: ['b'] }, { panes: ['nu'] }])
    expect(l.attention.nu).toBeCloseTo(3) // (2+4)/2
  })

  test('列指定 admit', () => {
    const l = admit(layoutOf('a | b', { a: 1, b: 1 }), 'nu', { column: 1 })
    expect(l.structure.columns[1]?.panes).toEqual(['b', 'nu'])
  })

  test('既に所属していれば no-op（同一参照）', () => {
    const base = layoutOf('a', { a: 1 })
    expect(admit(base, 'a')).toBe(base)
  })

  test('popOut → floating（場は不変 = サイズ保存）、popIn で戻る', () => {
    const base = layoutOf('a | b', { a: 1, b: 2 })
    const out = popOut(base, 'b')
    expect(out.structure.columns).toEqual([{ panes: ['a'] }])
    expect(out.attention.b).toBe(2)
    expect(resolve(out).b?.floating).toBe(true)

    const backIn = popIn(out, 'b')
    expect(backIn.structure.columns).toEqual([{ panes: ['a'] }, { panes: ['b'] }])
    expect(resolve(backIn).b?.floating).toBe(false)
  })

  test('非表示は所属を保持する（復帰位置の invariant）— mute しても構造は不変', () => {
    const base = layoutOf('a | b/c', { a: 1, b: 1, c: 1 })
    const l = mute(base, 'c')
    expect(l.structure).toBe(base.structure)
  })
})

describe('lock / unlock（LE-21）', () => {
  const base = lock(layoutOf('sb | a', { sb: 1, a: 1 }), 'sb', 0.3)

  test('lock が locks に入り、他 gesture が保持する', () => {
    expect(base.locks?.sb).toBe(0.3)
    expect(mute(base, 'a').locks?.sb).toBe(0.3)
    expect(solo(base, 'a').locks?.sb).toBe(0.3)
    expect(equalize(base).locks?.sb).toBe(0.3)
    expect(moveDominance(base, 'right').locks?.sb).toBe(0.3)
    expect(admit(base, 'nu').locks?.sb).toBe(0.3)
    expect(popOut(base, 'sb').locks?.sb).toBe(0.3) // 休眠でも保持
  })

  test('unlock は lock を外し、無ければ no-op（同一参照）', () => {
    const unlocked = unlock(base, 'sb')
    expect(unlocked.locks).toBeUndefined()
    expect(unlock(unlocked, 'sb')).toBe(unlocked)
  })

  test('share <= 0 の lock は unlock に落ちる', () => {
    expect(lock(base, 'sb', 0).locks).toBeUndefined()
  })
})

describe('全 pane 非表示の layout に対する gesture', () => {
  const dark = layoutOf('a | b', { a: 0, b: 0 })

  test('setShare / solo は un-mute で立ち上がる', () => {
    expect(setShare(dark, 'a', 0.5).attention.a).toBe(1)
    expect(solo(dark, 'a').attention.a).toBe(1)
  })

  test('mute / moveDominance / equalize は no-op（同一参照）', () => {
    expect(mute(dark, 'a')).toBe(dark)
    expect(moveDominance(dark, 'right')).toBe(dark)
    expect(equalize(dark)).toBe(dark)
  })
})

describe('property: 全 gesture の出力は valid な場', () => {
  test('300 例: 非負 / 全零を作らない', () => {
    const rand = lcg(0xfeed)
    for (let i = 0; i < 300; i++) {
      const base = randomLayout(rand)
      // 全 pane 非表示の base は上の describe が明示的にカバーする（ここでは可視 ≥ 1 を前提に回す）
      if (visibleIds(base).length === 0) continue
      const ids = Object.keys(base.attention)
      const pick = ids[Math.floor(rand() * ids.length)] as string
      const dirs = ['left', 'right', 'up', 'down'] as const
      const results = [
        setShare(base, pick, rand()),
        mute(base, pick),
        solo(base, pick),
        equalize(base),
        moveDominance(base, dirs[Math.floor(rand() * 4)] as (typeof dirs)[number]),
        popOut(base, pick),
        popIn(base, `extra${i}`),
        lock(base, pick, rand()),
        unlock(base, pick),
      ]
      for (const l of results) {
        const values = Object.values(l.attention)
        expect(values.every((v) => v >= 0 && Number.isFinite(v))).toBe(true)
        expect(values.some((v) => v > 0)).toBe(true) // 全零 guard
      }
    }
  })
})
