/**
 * bun test packages/editor-host/src/class-overrides.test.ts
 *
 * 脱出ハッチの pure 部分 (宣言 parse / override CSS 生成)。
 * CSSOM 読み出しと stylesheet 注入は browser 前提なので対象外。
 */
import { describe, expect, test } from 'bun:test'
import { parseDeclarations, renderOverridesCss } from './class-overrides'

describe('parseDeclarations', () => {
  test('基本の宣言を property / value に割る', () => {
    expect(parseDeclarations('display: flex; gap: 8px')).toEqual([
      { property: 'display', value: 'flex' },
      { property: 'gap', value: '8px' },
    ])
  })

  test('var() / calc() の中の記号では区切らない', () => {
    const [d] = parseDeclarations(
      'padding: calc(var(--_btn__pad-y, var(--spacing-s)) * var(--density-padding-scale, 1))',
    )
    expect(d.property).toBe('padding')
    expect(d.value).toContain('--density-padding-scale')
  })

  test('url(data:…) の : や ; で壊れない', () => {
    const [d] = parseDeclarations('background-image: url("data:image/svg+xml;utf8,<svg/>")')
    expect(d.property).toBe('background-image')
    expect(d.value).toContain('svg+xml;utf8')
  })

  test('引用符内の ; では区切らない (content: "›" 等)', () => {
    const decls = parseDeclarations('content: "a;b"; color: red')
    expect(decls).toHaveLength(2)
    expect(decls[0].value).toBe('"a;b"')
  })

  test('custom property (--*) は除外する — knob / token の管轄', () => {
    const decls = parseDeclarations('--_btn__fg: red; color: var(--_btn__fg); --x: 1')
    expect(decls).toEqual([{ property: 'color', value: 'var(--_btn__fg)' }])
  })

  test('空文字・不正な断片は無視する', () => {
    expect(parseDeclarations('')).toEqual([])
    expect(parseDeclarations(';;; nonsense ;')).toEqual([])
  })
})

describe('renderOverridesCss', () => {
  test('component ごとに 1 rule を組み立てる', () => {
    const css = renderOverridesCss({
      btn: { 'font-weight': '600', gap: '4px' },
      card: { 'border-color': 'red' },
    })
    expect(css).toBe(
      '.creo-btn {\n  font-weight: 600;\n  gap: 4px;\n}\n\n.creo-card {\n  border-color: red;\n}',
    )
  })

  test('空の component は出力しない', () => {
    expect(renderOverridesCss({ btn: {} })).toBe('')
  })
})
