/**
 * bun test packages/editor-host/src/component-fields.test.ts
 *
 * F2c の pure 部分 (規約 split による index 構築 + class 由来の照合)。
 * register / bind は SolidJS owner と DOM が要るので対象外。
 */
import { describe, expect, test } from 'bun:test'
import type { RawTweakVar } from './auto-discover'
import { buildKnobIndex, matchKnobs, toComponentKnobs } from './component-fields'

/** `scanRawTweakVars` が返す形の最小モック (fallback は未解決のまま) */
function raw(cssVar: string, fallback = '8px'): RawTweakVar {
  return { cssVar, fallback }
}

/** classList だけを持つ Element 代役 (bun test には DOM が無い) */
function elWith(...classes: string[]): Element {
  return { classList: classes } as unknown as Element
}

describe('toComponentKnobs', () => {
  test('--_<component>__<knob> を split して component と label を決める', () => {
    const [knob] = toComponentKnobs([raw('--_error-boundary__pad-x')])
    expect(knob.component).toBe('error-boundary')
    expect(knob.label).toBe('Pad X')
    expect(knob.id).toBe('error.boundary.pad.x')
  })

  test('component 名にハイフンが何個あっても境界は __ で決まる', () => {
    // 区切りが無いと accordion / accordion-content のどちらか決められない
    const [knob] = toComponentKnobs([raw('--_accordion-content__pad-top')])
    expect(knob.component).toBe('accordion-content')
    expect(knob.label).toBe('Pad Top')
  })

  test('knob 側のハイフンは label に展開される', () => {
    const [knob] = toComponentKnobs([raw('--_btn__size-min-h')])
    expect(knob.component).toBe('btn')
    expect(knob.label).toBe('Size Min H')
  })

  test('規約に合わない var は index に載せない', () => {
    expect(toComponentKnobs([raw('--_no-separator-here')])).toHaveLength(0)
    expect(toComponentKnobs([raw('--_a__b__c')])).toHaveLength(0)
    expect(toComponentKnobs([raw('--_btn__')])).toHaveLength(0)
  })
})

describe('buildKnobIndex', () => {
  test('component id で索引化する', () => {
    const index = buildKnobIndex(
      toComponentKnobs([raw('--_btn__pad-x'), raw('--_btn__radius'), raw('--_card__pad')]),
    )
    expect([...index.byComponent.keys()].sort()).toEqual(['btn', 'card'])
    expect(index.byComponent.get('btn')).toHaveLength(2)
  })
})

describe('matchKnobs', () => {
  const index = buildKnobIndex(
    toComponentKnobs([raw('--_btn__pad-x'), raw('--_card__pad'), raw('--_card-header__pad-y')]),
  )

  test('要素の creo- class からノブを引く (selector 照合は不要)', () => {
    expect(matchKnobs(elWith('creo-btn'), index).map((k) => k.id)).toEqual(['btn.pad.x'])
  })

  test('modifier は落として base component として引く', () => {
    expect(matchKnobs(elWith('creo-btn', 'creo-btn--primary'), index).map((k) => k.id)).toEqual([
      'btn.pad.x',
    ])
  })

  test('sub-part は独立した component として引かれる', () => {
    expect(matchKnobs(elWith('creo-card-header'), index).map((k) => k.id)).toEqual([
      'card.header.pad.y',
    ])
  })

  test('creo- class を持たない要素では空', () => {
    expect(matchKnobs(elWith('docs-main'), index)).toHaveLength(0)
  })
})
