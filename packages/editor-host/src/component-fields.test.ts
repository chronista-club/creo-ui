/**
 * bun test packages/editor-host/src/component-fields.test.ts
 *
 * F2c の pure 部分 (index 構築 + 逆引き)。register / bind は SolidJS owner と
 * DOM が要るので host.test.ts 側の責務。
 */
import { describe, expect, test } from 'bun:test'
import type { RawTweakVar } from './auto-discover'
import { buildKnobIndex, matchKnobs, toComponentKnobs } from './component-fields'

/**
 * `scanRawTweakVars` が返す形の最小モック。fallback は未解決のまま持つ
 * (解決は選択要素に対して register 時に行うため)。
 */
function discovered(cssVar: string, _id: string, selectors: string[] = []): RawTweakVar {
  return { cssVar, fallback: '8px', selectors }
}

/**
 * Element 代役。渡した class から classList を作り、`.creo-x` 形の selector に
 * 一致するかを判定する (index の絞り込みと matches の両方が効くように)。
 */
function elWith(...classes: string[]): Element {
  return {
    classList: classes,
    matches: (sel: string) =>
      sel.split(',').some((part) => {
        const cls = part.trim().replace(/^\./, '')
        return classes.includes(cls)
      }),
  } as unknown as Element
}

describe('toComponentKnobs', () => {
  test('component 名は var 名の略記ではなく selector 由来になる', () => {
    const [knob] = toComponentKnobs([
      discovered('--_eb-pad-x', 'eb.pad.x', ['.creo-error-boundary']),
    ])
    expect(knob.component).toBe('error-boundary')
    // field id は永続化 key なので var 名由来のまま変えない
    expect(knob.id).toBe('eb.pad.x')
    expect(knob.label).toBe('Pad X')
  })

  test('matcher は state 疑似を剥がした形になる', () => {
    const [knob] = toComponentKnobs([
      discovered('--_btn-fg', 'btn.fg', ['.creo-btn:hover', '.creo-btn:focus-visible']),
    ])
    expect(knob.matchers).toEqual(['.creo-btn', '.creo-btn'])
  })

  test('selector を持たない var は index から落ちる (逆引き不能なので)', () => {
    expect(toComponentKnobs([discovered('--_x-y', 'x.y')])).toHaveLength(0)
    expect(toComponentKnobs([discovered('--_x-y', 'x.y', [])])).toHaveLength(0)
  })

  test('creo- class が無い selector でも var 名 fallback で group が付く', () => {
    const [knob] = toComponentKnobs([discovered('--_misc-gap', 'misc.gap', ['main > section'])])
    expect(knob.component).toBe('misc')
  })
})

describe('buildKnobIndex', () => {
  test('subject の class 名で索引化する', () => {
    const index = buildKnobIndex(
      toComponentKnobs([
        discovered('--_btn-pad-x', 'btn.pad.x', ['.creo-btn']),
        discovered('--_card-pad', 'card.pad', ['.creo-card']),
      ]),
    )
    expect([...index.byComponent.keys()].sort()).toEqual(['btn', 'card'])
    expect(index.unindexed).toHaveLength(0)
  })

  test('comma list は両方の subject に登録する', () => {
    const index = buildKnobIndex(
      toComponentKnobs([
        discovered('--_checkbox-gap', 'checkbox.gap', ['.creo-checkbox, .creo-radio']),
      ]),
    )
    expect([...index.byComponent.keys()].sort()).toEqual(['checkbox', 'radio'])
  })

  test('class で絞れない selector は総当たり側に置く (取りこぼさない)', () => {
    const index = buildKnobIndex(
      toComponentKnobs([discovered('--_misc-gap', 'misc.gap', ['main > section'])]),
    )
    expect(index.byComponent.size).toBe(0)
    expect(index.unindexed).toHaveLength(1)
  })
})

describe('matchKnobs', () => {
  const index = buildKnobIndex(
    toComponentKnobs([
      discovered('--_btn-pad-x', 'btn.pad.x', ['.creo-btn']),
      discovered('--_btn-size-pad-x', 'btn.size.pad.x', ['.creo-btn--sm']),
      discovered('--_card-pad', 'card.pad', ['.creo-card']),
    ]),
  )

  test('要素に効くノブだけを返す', () => {
    expect(matchKnobs(elWith('creo-btn'), index).map((k) => k.id)).toEqual(['btn.pad.x'])
  })

  test('modifier が付いていれば variant 固有ノブも出る', () => {
    const ids = matchKnobs(elWith('creo-btn', 'creo-btn--sm'), index).map((k) => k.id)
    expect(ids).toEqual(['btn.pad.x', 'btn.size.pad.x'])
  })

  test('無関係な要素では空', () => {
    expect(matchKnobs(elWith('creo-alert'), index)).toHaveLength(0)
  })

  test('creo- class を持たない要素では matches を 1 度も呼ばない (絞り込みが効く)', () => {
    let calls = 0
    const plain = {
      classList: ['docs-main'],
      matches: () => {
        calls++
        return true
      },
    } as unknown as Element
    expect(matchKnobs(plain, index)).toHaveLength(0)
    expect(calls).toBe(0)
  })
})
