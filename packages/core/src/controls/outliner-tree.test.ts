import { describe, expect, test } from 'bun:test'
import {
  flattenVisible,
  indent,
  insertSiblingAfter,
  moveDown,
  moveUp,
  nextVisibleId,
  type OutlinerNode,
  outdent,
  prevVisibleId,
  removeNode,
  setText,
  toggleCollapsed,
} from './outliner-tree'

/**
 * outliner-tree — CUOutliner の keyboard grammar が呼ぶ木の書き換え。
 *
 * 検証の主眼は 2 つ:
 *   1. **immutability** — 引数の木を書き換えない (SolidJS の signal に入れて
 *      差分検知を効かせる前提が壊れると、 画面が更新されない bug になる)
 *   2. **操作できない時に同一参照を返す** — 呼び出し側は `next === prev` で
 *      「何も起きなかった」を判定して focus 移動等を抑制するため、 ここが
 *      新しい配列を返すと「変わっていないのに変わった」扱いになる
 */

/** a > (b > (c)), d  の木 */
const tree = (): OutlinerNode[] => [
  {
    id: 'a',
    text: 'A',
    children: [{ id: 'b', text: 'B', children: [{ id: 'c', text: 'C' }] }],
  },
  { id: 'd', text: 'D' },
]

const ids = (nodes: OutlinerNode[]) => flattenVisible(nodes).map((r) => r.node.id)
const depths = (nodes: OutlinerNode[]) => flattenVisible(nodes).map((r) => r.depth)

describe('flattenVisible', () => {
  test('木を上から 1 次元に並べ、 深さを付ける', () => {
    expect(ids(tree())).toEqual(['a', 'b', 'c', 'd'])
    expect(depths(tree())).toEqual([0, 1, 2, 0])
  })

  test('畳んだ枝の子孫は並びに出ない', () => {
    const collapsed = toggleCollapsed(tree(), 'a')
    expect(ids(collapsed)).toEqual(['a', 'd'])
  })

  test('hasChildren は葉と枝を区別する', () => {
    const rows = flattenVisible(tree())
    expect(rows.map((r) => r.hasChildren)).toEqual([true, true, false, false])
  })
})

describe('immutability', () => {
  test('元の木を書き換えない', () => {
    const before = tree()
    const snapshot = JSON.stringify(before)
    indent(before, 'd')
    outdent(before, 'c')
    moveUp(before, 'd')
    setText(before, 'a', 'changed')
    removeNode(before, 'd')
    expect(JSON.stringify(before)).toBe(snapshot)
  })
})

describe('indent (Tab)', () => {
  test('直前の兄弟の末子になる', () => {
    const next = indent(tree(), 'd')
    expect(ids(next)).toEqual(['a', 'b', 'c', 'd'])
    expect(depths(next)).toEqual([0, 1, 2, 1]) // d が a の子に
  })

  test('先頭の行は受け皿が無いので何もしない (同一参照)', () => {
    const before = tree()
    expect(indent(before, 'a')).toBe(before)
  })

  test('受け皿が畳まれていたら開く (潜らせた行が消えないように)', () => {
    const collapsed = toggleCollapsed(tree(), 'a')
    expect(ids(collapsed)).toEqual(['a', 'd'])
    const next = indent(collapsed, 'd')
    // a が開き、 d が a の末子として見えている
    expect(ids(next)).toEqual(['a', 'b', 'c', 'd'])
  })
})

describe('outdent (Shift+Tab)', () => {
  test('親の次の兄弟になる', () => {
    const next = outdent(tree(), 'b')
    expect(ids(next)).toEqual(['a', 'b', 'c', 'd'])
    expect(depths(next)).toEqual([0, 0, 1, 0]) // b が a の直後の root 行、 c は b の子のまま
  })

  test('自分の子は連れて行く', () => {
    const next = outdent(tree(), 'b')
    const b = next.find((n) => n.id === 'b')
    expect(b?.children?.map((c) => c.id)).toEqual(['c'])
  })

  test('root 直下の行は何もしない (同一参照)', () => {
    const before = tree()
    expect(outdent(before, 'a')).toBe(before)
    expect(outdent(before, 'd')).toBe(before)
  })

  test('後続の兄弟は元の親に残る (連れ出さない)', () => {
    const src: OutlinerNode[] = [
      {
        id: 'p',
        text: 'P',
        children: [
          { id: 'x', text: 'X' },
          { id: 'y', text: 'Y' },
        ],
      },
    ]
    const next = outdent(src, 'x')
    expect(ids(next)).toEqual(['p', 'y', 'x'])
    expect(depths(next)).toEqual([0, 1, 0]) // y は p の子のまま
  })
})

describe('moveUp / moveDown (⌥↑ ⌥↓)', () => {
  test('兄弟の中で入れ替わる', () => {
    const src: OutlinerNode[] = [
      { id: 'x', text: 'X' },
      { id: 'y', text: 'Y' },
    ]
    expect(ids(moveUp(src, 'y'))).toEqual(['y', 'x'])
    expect(ids(moveDown(src, 'x'))).toEqual(['y', 'x'])
  })

  test('親をまたがない — 端では何もしない (同一参照)', () => {
    const before = tree()
    expect(moveUp(before, 'a')).toBe(before)
    expect(moveDown(before, 'd')).toBe(before)
    expect(moveUp(before, 'b')).toBe(before) // b は親 a の唯一の子
  })
})

describe('insertSiblingAfter (Enter)', () => {
  test('同じ深さで直後に入る', () => {
    const next = insertSiblingAfter(tree(), 'b', { id: 'new', text: '' })
    expect(ids(next)).toEqual(['a', 'b', 'c', 'new', 'd'])
    expect(depths(next)).toEqual([0, 1, 2, 1, 0]) // new は b と同じ深さ
  })

  test('id が null なら末尾に足す (空の outliner でも 1 行目が書ける)', () => {
    const next = insertSiblingAfter([], null, { id: 'first', text: '' })
    expect(ids(next)).toEqual(['first'])
  })
})

describe('removeNode (Backspace)', () => {
  test('葉は消せる', () => {
    expect(ids(removeNode(tree(), 'd'))).toEqual(['a', 'b', 'c'])
  })

  test('子を持つ行は消さない — 畳んでいると子ごと消えて取り返しがつかないため', () => {
    const before = tree()
    expect(removeNode(before, 'a')).toBe(before)
    expect(removeNode(before, 'b')).toBe(before)
  })
})

describe('prevVisibleId / nextVisibleId (↑ ↓)', () => {
  test('見えている並びで前後を返す', () => {
    const t = tree()
    expect(prevVisibleId(t, 'c')).toBe('b')
    expect(nextVisibleId(t, 'c')).toBe('d')
  })

  test('端では null', () => {
    const t = tree()
    expect(prevVisibleId(t, 'a')).toBeNull()
    expect(nextVisibleId(t, 'd')).toBeNull()
  })

  test('畳んだ枝は飛ばす', () => {
    const collapsed = toggleCollapsed(tree(), 'a')
    expect(nextVisibleId(collapsed, 'a')).toBe('d')
    expect(prevVisibleId(collapsed, 'd')).toBe('a')
  })
})

describe('setText', () => {
  test('同じ文字なら同一参照 (無駄な再描画を避ける)', () => {
    const before = tree()
    expect(setText(before, 'a', 'A')).toBe(before)
  })

  test('違う文字なら更新される', () => {
    const next = setText(tree(), 'c', 'C+')
    expect(flattenVisible(next).find((r) => r.node.id === 'c')?.node.text).toBe('C+')
  })
})
