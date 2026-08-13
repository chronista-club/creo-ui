/**
 * bun test packages/editor-host/src/component-tree.test.ts
 *
 * Discovery の DOM ツリー構築 (pure)。bun test には DOM が無いので、
 * children / classList / dataset だけを持つ最小の Element 代役で検証する。
 */
import { describe, expect, test } from 'bun:test'
import type { RawTweakVar } from './auto-discover'
import { buildKnobIndex, toComponentKnobs } from './component-fields'
import { buildComponentTree } from './component-tree'

interface FakeEl {
  classList: string[]
  children: FakeEl[]
  dataset: Record<string, string>
}

function el(classes: string[], children: FakeEl[] = []): FakeEl {
  return { classList: classes, children, dataset: {} }
}

function editorLayer(children: FakeEl[] = []): FakeEl {
  return { classList: [], children, dataset: { editorLayer: '' } }
}

const asElement = (e: FakeEl): Element => e as unknown as Element

const raw = (cssVar: string): RawTweakVar => ({ cssVar, fallback: '8px' })
const index = buildKnobIndex(
  toComponentKnobs([raw('--_btn__pad-x'), raw('--_btn__radius'), raw('--_card__pad')]),
)

describe('buildComponentTree', () => {
  test('creo component が DOM の入れ子どおりにツリーになる', () => {
    const root = el([], [el(['creo-card'], [el(['creo-btn'])])])
    const tree = buildComponentTree(asElement(root), index)
    expect(tree).toHaveLength(1)
    expect(tree[0].componentId).toBe('card')
    expect(tree[0].children.map((c) => c.componentId)).toEqual(['btn'])
  })

  test('非 creo のラッパは素通しして子を引き上げる', () => {
    // <div class="docs-grid"><section><button class="creo-btn"/></section></div>
    const root = el([], [el(['docs-grid'], [el([], [el(['creo-btn'])])])])
    const tree = buildComponentTree(asElement(root), index)
    expect(tree.map((n) => n.componentId)).toEqual(['btn'])
  })

  test('同 level の同 component は 1 node に畳まれ count を持つ', () => {
    const root = el([], [el(['creo-btn']), el(['creo-btn']), el(['creo-btn']), el(['creo-card'])])
    const tree = buildComponentTree(asElement(root), index)
    expect(tree.map((n) => [n.componentId, n.count])).toEqual([
      ['btn', 3],
      ['card', 1],
    ])
  })

  test('畳んだ node の代表は最初の instance', () => {
    const first = el(['creo-btn'])
    const root = el([], [first, el(['creo-btn'])])
    const tree = buildComponentTree(asElement(root), index)
    expect(tree[0].element).toBe(asElement(first))
  })

  test('knobCount は index から引く (ノブ無し component は 0)', () => {
    const root = el([], [el(['creo-btn']), el(['creo-divider'])])
    const tree = buildComponentTree(asElement(root), index)
    expect(tree.map((n) => [n.componentId, n.knobCount])).toEqual([
      ['btn', 2],
      ['divider', 0],
    ])
  })

  test('editor layer 配下は出さない (panel 自身がツリーに映らない)', () => {
    const root = el([], [el(['creo-card']), editorLayer([el(['creo-btn'])])])
    const tree = buildComponentTree(asElement(root), index)
    expect(tree.map((n) => n.componentId)).toEqual(['card'])
  })

  test('modifier は component id に畳まれる (.creo-btn--primary → btn)', () => {
    const root = el([], [el(['creo-btn', 'creo-btn--primary'])])
    const tree = buildComponentTree(asElement(root), index)
    expect(tree[0].componentId).toBe('btn')
  })

  test('key はツリー内で一意 (兄弟の別 component / 親子で衝突しない)', () => {
    const root = el([], [el(['creo-card'], [el(['creo-btn'])]), el(['creo-btn'])])
    const tree = buildComponentTree(asElement(root), index)
    const keys = [tree[0].key, tree[0].children[0].key, tree[1].key]
    expect(new Set(keys).size).toBe(3)
  })
})
