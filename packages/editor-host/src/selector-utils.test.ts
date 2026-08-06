/**
 * bun test packages/editor-host/src/selector-utils.test.ts
 *
 * F2c 逆引きの土台。ここが崩れると「component をクリックしてもノブが出ない」
 * (state 疑似を剥がし損ねる) / 「関係ないノブが出る」(剥がしすぎ) の両方が起きる。
 */
import { describe, expect, test } from 'bun:test'
import {
  componentDisplayName,
  componentIdFromSelector,
  componentIdFromSelectors,
  componentIdOfElement,
  normalizeSelectorForMatch,
  splitSelectorList,
} from './selector-utils'

/** classList だけを持つ最小の Element 代役 (bun test には DOM が無い) */
function elWithClasses(...classes: string[]): Element {
  return { classList: classes } as unknown as Element
}

describe('splitSelectorList', () => {
  test('depth 0 の comma で分割する', () => {
    expect(splitSelectorList('.a, .b , .c')).toEqual(['.a', '.b', '.c'])
  })
  test(':is() 内側の comma では分割しない', () => {
    expect(splitSelectorList('.creo-btn:is(.a, .b), .creo-card')).toEqual([
      '.creo-btn:is(.a, .b)',
      '.creo-card',
    ])
  })
  test('属性値の中の comma でも分割しない', () => {
    expect(splitSelectorList('[data-x="a,b"], .c')).toEqual(['[data-x="a,b"]', '.c'])
  })
})

describe('normalizeSelectorForMatch', () => {
  test('state 疑似クラスを剥がす (hover 時だけのノブを拾えるように)', () => {
    expect(normalizeSelectorForMatch('.creo-btn:hover')).toBe('.creo-btn')
    expect(normalizeSelectorForMatch('.creo-input:focus-visible')).toBe('.creo-input')
    expect(normalizeSelectorForMatch('.creo-btn:disabled')).toBe('.creo-btn')
  })

  test('疑似要素も剥がす', () => {
    expect(normalizeSelectorForMatch('.creo-badge::after')).toBe('.creo-badge')
  })

  test('構造疑似クラスと属性 selector は残す (variant 固有ノブを守る)', () => {
    expect(normalizeSelectorForMatch('.creo-btn[data-variant="primary"]')).toBe(
      '.creo-btn[data-variant="primary"]',
    )
    expect(normalizeSelectorForMatch('.creo-tabs > :not(.creo-tab)')).toBe(
      '.creo-tabs > :not(.creo-tab)',
    )
    expect(normalizeSelectorForMatch('.creo-table tr:nth-child(2n)')).toBe(
      '.creo-table tr:nth-child(2n)',
    )
  })

  test('comma list は part ごとに処理して再結合する', () => {
    expect(normalizeSelectorForMatch('.creo-btn:hover, .creo-card:focus-within')).toBe(
      '.creo-btn, .creo-card',
    )
  })

  test('剥がすと空になる part は落とす', () => {
    // `:root` 直下の宣言のような、剥がすと何も残らないものは match 対象外
    expect(normalizeSelectorForMatch('::selection')).toBeNull()
  })
})

describe('componentIdFromSelector', () => {
  test('subject 側 (最後の .creo-*) を採る', () => {
    expect(componentIdFromSelector('.creo-card > .creo-card-header')).toBe('card-header')
  })
  test('BEM modifier を落とす', () => {
    expect(componentIdFromSelector('.creo-btn--primary')).toBe('btn')
  })
  test('creo- class が無ければ null', () => {
    expect(componentIdFromSelector('body > main')).toBeNull()
  })

  test('comma list は先頭 part の subject を採る (list 全体の末尾ではない)', () => {
    // `.creo-checkbox, .creo-radio` を「最後の .creo-*」で採ると radio になり、
    // checkbox をクリックしたのに group が radio になる
    expect(componentIdFromSelector('.creo-checkbox, .creo-radio')).toBe('checkbox')
  })
})

describe('componentIdFromSelectors', () => {
  test('出現数が多い component を採る', () => {
    expect(componentIdFromSelectors(['.creo-btn', '.creo-btn--sm', '.creo-card'])).toBe('btn')
  })

  test('同数なら記述順の先頭 (共有 rule の代表を安定させる)', () => {
    expect(componentIdFromSelectors(['.creo-checkbox', '.creo-radio'])).toBe('checkbox')
  })

  test('var 名の略記 (--_eb-*) ではなく selector 由来の名前が取れる', () => {
    // これが F2c の肝 — .creo-error-boundary の rule で使われる --_eb-pad-x は
    // 「eb」ではなく「error-boundary」として panel に出したい
    expect(componentIdFromSelectors(['.creo-error-boundary'])).toBe('error-boundary')
  })
})

describe('componentIdOfElement', () => {
  test('modifier を落として base component を返す', () => {
    expect(componentIdOfElement(elWithClasses('creo-btn', 'creo-btn--primary'))).toBe('btn')
  })
  test('creo- 以外の class は無視する', () => {
    expect(componentIdOfElement(elWithClasses('foo', 'creo-card', 'bar'))).toBe('card')
  })
  test('creo- class が無ければ null', () => {
    expect(componentIdOfElement(elWithClasses('foo', 'bar'))).toBeNull()
  })
  test('class 無しでも落ちない', () => {
    expect(componentIdOfElement(elWithClasses())).toBeNull()
  })
})

describe('componentDisplayName', () => {
  test('panel 表示用に class 形へ戻す', () => {
    expect(componentDisplayName('error-boundary')).toBe('.creo-error-boundary')
  })
})
