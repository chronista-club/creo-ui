/**
 * bun test packages/editor-host/src/component-id.test.ts
 *
 * 命名規約 `--_<component>__<knob>` の split と、class からの component id 抽出。
 * ここが崩れると Editor Mode の component 抽出が丸ごと外れる。
 */
import { describe, expect, test } from 'bun:test'
import {
  componentClassIdsOf,
  componentDisplayName,
  componentIdOfElement,
  componentSelector,
  knobLabel,
  parseTweakVarName,
} from './component-id'

/** classList だけを持つ Element 代役 (bun test には DOM が無い) */
function elWith(...classes: string[]): Element {
  return { classList: classes } as unknown as Element
}

describe('parseTweakVarName', () => {
  test('__ の左右で component / knob に割れる', () => {
    expect(parseTweakVarName('--_btn__pad-x')).toEqual({ component: 'btn', knob: 'pad-x' })
  })

  test('component 側のハイフンは境界にならない', () => {
    // 区切りが無いと accordion / accordion-content のどちらか原理的に決まらない
    expect(parseTweakVarName('--_accordion-content__pad-top')).toEqual({
      component: 'accordion-content',
      knob: 'pad-top',
    })
  })

  test('knob 側のハイフンも境界にならない', () => {
    expect(parseTweakVarName('--_btn__size-min-h')).toEqual({
      component: 'btn',
      knob: 'size-min-h',
    })
  })

  test('規約に合わない名前は null', () => {
    expect(parseTweakVarName('--_no-separator')).toBeNull()
    expect(parseTweakVarName('--_a__b__c')).toBeNull()
    expect(parseTweakVarName('--_btn__')).toBeNull()
    expect(parseTweakVarName('--__pad-x')).toBeNull()
    expect(parseTweakVarName('--spacing-m')).toBeNull() // prefix 違い
  })
})

describe('knobLabel', () => {
  test('ハイフンを空白に開いて先頭大文字', () => {
    expect(knobLabel('pad-x')).toBe('Pad X')
    expect(knobLabel('size-min-h')).toBe('Size Min H')
    expect(knobLabel('radius')).toBe('Radius')
  })
})

describe('componentClassIdsOf', () => {
  test('creo- class を全部返し modifier は落とす', () => {
    expect(componentClassIdsOf(elWith('creo-btn', 'creo-btn--primary', 'creo-icon'))).toEqual([
      'btn',
      'icon',
    ])
  })
  test('creo- 以外は無視', () => {
    expect(componentClassIdsOf(elWith('docs-main', 'foo'))).toEqual([])
  })
  test('class 無しでも落ちない', () => {
    expect(componentClassIdsOf(elWith())).toEqual([])
  })
})

describe('componentIdOfElement', () => {
  test('複数あれば最短 (= base component) を採る', () => {
    expect(componentIdOfElement(elWith('creo-card-header', 'creo-card'))).toBe('card')
  })
  test('creo- class が無ければ null', () => {
    expect(componentIdOfElement(elWith('docs-main'))).toBeNull()
  })
})

describe('componentSelector / componentDisplayName', () => {
  test('component id から class 形へ戻す', () => {
    expect(componentSelector('error-boundary')).toBe('.creo-error-boundary')
    expect(componentDisplayName('btn')).toBe('.creo-btn')
  })
})
