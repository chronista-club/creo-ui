/**
 * layer — Z 軸 layer add-on の pure logic + store の test (docs §6)
 *
 * parse / serialize / equals は router 非依存の pure 部。URL ⇄ store sync の
 * 無限ループ収束は `layerEqualsParam` ガードに依るため、本 test がその核を固定する。
 */

import { describe, expect, test } from 'bun:test'
import { createRoot } from 'solid-js'
import { createLayerStore, layerEqualsParam, layerToParam, parseLayerParam } from './layer'

describe('parseLayerParam', () => {
  test('atlasId 文字列はそのまま', () => {
    expect(parseLayerParam('atl_abc')).toBe('atl_abc')
  })

  test('空文字 / null / undefined はルート層 (undefined)', () => {
    expect(parseLayerParam('')).toBeUndefined()
    expect(parseLayerParam(null)).toBeUndefined()
    expect(parseLayerParam(undefined)).toBeUndefined()
  })
})

describe('layerToParam', () => {
  test('atlasId はそのまま param 値', () => {
    expect(layerToParam('atl_abc')).toBe('atl_abc')
  })

  test('ルート層 (undefined) は param 削除 = undefined', () => {
    expect(layerToParam(undefined)).toBeUndefined()
    expect(layerToParam('')).toBeUndefined()
  })
})

describe('layerEqualsParam', () => {
  test('layer と param が一致', () => {
    expect(layerEqualsParam('atl_abc', 'atl_abc')).toBe(true)
  })

  test('ルート層 ⇔ 空 param は一致 (無限ループ収束の核)', () => {
    expect(layerEqualsParam(undefined, null)).toBe(true)
    expect(layerEqualsParam(undefined, '')).toBe(true)
    expect(layerEqualsParam(undefined, undefined)).toBe(true)
  })

  test('不一致', () => {
    expect(layerEqualsParam('atl_abc', 'atl_xyz')).toBe(false)
    expect(layerEqualsParam('atl_abc', null)).toBe(false)
    expect(layerEqualsParam(undefined, 'atl_abc')).toBe(false)
  })
})

describe('createLayerStore', () => {
  test('初期値と setLayer による Z 位置の更新', () => {
    createRoot((dispose) => {
      const store = createLayerStore('atl_a')
      expect(store.layer()).toBe('atl_a')

      store.setLayer('atl_b')
      expect(store.layer()).toBe('atl_b')

      store.setLayer(undefined)
      expect(store.layer()).toBeUndefined()

      dispose()
    })
  })

  test('初期値なしはルート層 (undefined) から始まる', () => {
    createRoot((dispose) => {
      expect(createLayerStore().layer()).toBeUndefined()
      dispose()
    })
  })
})
