/**
 * railRegistry — Rail registry pure logic の contract test (docs §5.2)
 *
 * registry は app 供給 (PL-3) なので、logic 関数は任意の registry で正しく動く
 * 必要がある。本 test は fixture registry で route SSOT (PL-4) の挙動を固定する。
 */

import { describe, expect, test } from 'bun:test'
import type { Component } from 'solid-js'
import { type RailDef, railById, railsByOrder, selectRailId } from './railRegistry'

const noop: Component = () => null

const mkRail = (id: string, route: string, order: number): RailDef => ({
  id,
  route,
  order,
  icon: noop,
  peek: noop,
  labelKey: `leftEdge.rail.${id}`,
})

const registry: RailDef[] = [
  mkRail('memory', '/memories', 0),
  mkRail('atlas', '/atlas', 1),
  mkRail('views', '/views', 2),
]

describe('selectRailId', () => {
  test('exact route 一致でその Rail', () => {
    expect(selectRailId('/atlas', registry)).toBe('atlas')
  })

  test('sub-path も親 Rail にマッチ', () => {
    expect(selectRailId('/memories/mem_xyz', registry)).toBe('memory')
  })

  test('どの Rail にも当たらなければ undefined', () => {
    expect(selectRailId('/settings', registry)).toBeUndefined()
  })

  test('空 registry は undefined', () => {
    expect(selectRailId('/memories', [])).toBeUndefined()
  })

  test('最長 prefix 一致が勝つ', () => {
    const nested = [mkRail('a', '/a', 0), mkRail('ab', '/a/b', 1)]
    expect(selectRailId('/a/b/c', nested)).toBe('ab')
    expect(selectRailId('/a/x', nested)).toBe('a')
  })

  test('segment 境界で判定 — /atlasation は /atlas にマッチしない', () => {
    expect(selectRailId('/atlasation', registry)).toBeUndefined()
  })
})

describe('railsByOrder', () => {
  test('order 昇順に並べる', () => {
    const shuffled = [mkRail('c', '/c', 2), mkRail('a', '/a', 0), mkRail('b', '/b', 1)]
    expect(railsByOrder(shuffled).map((r) => r.id)).toEqual(['a', 'b', 'c'])
  })

  test('元配列を破壊しない', () => {
    const orig = [mkRail('c', '/c', 2), mkRail('a', '/a', 0)]
    railsByOrder(orig)
    expect(orig.map((r) => r.id)).toEqual(['c', 'a'])
  })
})

describe('railById', () => {
  test('id から RailDef を引く', () => {
    expect(railById(registry, 'atlas')?.id).toBe('atlas')
  })

  test('未発見は undefined', () => {
    expect(railById(registry, 'nope')).toBeUndefined()
  })

  test('id undefined は undefined', () => {
    expect(railById(registry, undefined)).toBeUndefined()
  })
})
