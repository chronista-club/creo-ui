/**
 * 記法の golden + 往復 property。
 * golden は記法文字列そのもので書く = テストが読める仕様書（LE-P0 受け入れ条件）。
 */

import { describe, expect, test } from 'bun:test'
import { formatNotation, parseNotation } from './notation'
import { lcg, randomLayout } from './testkit'

describe('parseNotation / formatNotation — golden', () => {
  test('列と縦積み: ec | cv/pp', () => {
    const parsed = parseNotation('ec | cv/pp')
    expect(parsed.structure.columns).toEqual([{ panes: ['ec'] }, { panes: ['cv', 'pp'] }])
    expect(parsed.floats).toEqual([])
  })

  test('float 付き: ec | cv/pp ~ board', () => {
    const parsed = parseNotation('ec | cv/pp ~ board')
    expect(parsed.structure.columns).toEqual([{ panes: ['ec'] }, { panes: ['cv', 'pp'] }])
    expect(parsed.floats).toEqual(['board'])
  })

  test('float のみ: ~ board', () => {
    const parsed = parseNotation('~ board')
    expect(parsed.structure.columns).toEqual([])
    expect(parsed.floats).toEqual(['board'])
  })

  test('1 枚だけ: solo', () => {
    expect(parseNotation('solo').structure.columns).toEqual([{ panes: ['solo'] }])
  })

  test('空文字列 = 空構造', () => {
    const parsed = parseNotation('')
    expect(parsed.structure.columns).toEqual([])
    expect(parsed.floats).toEqual([])
  })

  test('空白ゆらぎを正準化する', () => {
    const parsed = parseNotation('ec|cv / pp~board')
    expect(formatNotation(parsed.structure, parsed.floats)).toBe('ec | cv/pp ~ board')
  })
})

describe('parseNotation — 不正入力', () => {
  test('id 重複', () => {
    expect(() => parseNotation('a | a')).toThrow(/重複/)
    expect(() => parseNotation('a ~ a')).toThrow(/重複/)
  })

  test('空の列 / 空の pane', () => {
    expect(() => parseNotation('a | | b')).toThrow(/空の列/)
    expect(() => parseNotation('a//b')).toThrow(/空の pane/)
  })

  test('~ は 1 つまで', () => {
    expect(() => parseNotation('a ~ b ~ c')).toThrow(/1 つまで/)
  })

  test('id 内の空白', () => {
    expect(() => parseNotation('a b/c')).toThrow(/不正な pane id/)
  })
})

describe('往復 property: parse ∘ format = id', () => {
  test('ランダム構造 200 例', () => {
    const rand = lcg(0xc0ffee)
    for (let i = 0; i < 200; i++) {
      const layout = randomLayout(rand)
      const floats = Object.keys(layout.attention).filter((id) => id.startsWith('f'))
      const text = formatNotation(layout.structure, floats)
      const parsed = parseNotation(text)
      expect(parsed.structure).toEqual(layout.structure)
      expect(parsed.floats).toEqual(floats)
      // 正準形は不動点
      expect(formatNotation(parsed.structure, parsed.floats)).toBe(text)
    }
  })
})
