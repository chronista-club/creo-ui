/**
 * Clip の木の合成 (flattenClip) / 置き直し (setPlacement, dragPlacement) / local t /
 * keyframe への焼き込み — 純関数の test。
 */

import { describe, expect, it } from 'bun:test'
import {
  bakeKeyframes,
  type Clip,
  dragPlacement,
  flattenClip,
  localT,
  poseKeyframes,
  setPlacement,
} from './clip'

const leaf = (id: string, target = id): Clip => ({
  id,
  parts: [{ target, a: { opacity: 0 }, b: { opacity: 1 } }],
})

describe('flattenClip — 区間の合成', () => {
  it('root は全体 [0, 1] を持つ', () => {
    const { clips } = flattenClip(leaf('root'))
    expect(clips).toHaveLength(1)
    expect(clips[0]).toMatchObject({ key: 'root', start: 0, end: 1, depth: 0 })
  })

  it('親が置いた区間 at は、親の絶対区間の中に写る (abs = s + a·(e − s))', () => {
    const root: Clip = {
      id: 'root',
      children: [
        {
          clip: { id: 'p', children: [{ clip: leaf('c'), at: [0.5, 1] }] },
          at: [0.2, 0.6],
        },
      ],
    }
    const c = flattenClip(root).clips.find((x) => x.key === 'c')
    expect(c?.start).toBeCloseTo(0.4)
    expect(c?.end).toBeCloseTo(0.6)
    expect(c?.depth).toBe(2)
    // 親の絶対区間も持つ (inspector が絶対 → at に戻すのに使う)
    expect(c?.parentStart).toBeCloseTo(0.2)
    expect(c?.parentEnd).toBeCloseTo(0.6)
  })

  it('clip は深さ優先・宣言順に並ぶ (inspector の行の順)', () => {
    const root: Clip = {
      id: 'root',
      children: [
        { clip: { id: 'a', children: [{ clip: leaf('a1'), at: [0, 1] }] }, at: [0, 0.5] },
        { clip: leaf('b'), at: [0.5, 1] },
      ],
    }
    expect(flattenClip(root).clips.map((c) => c.key)).toEqual(['root', 'a', 'a1', 'b'])
  })

  it('part は自分の clip の絶対区間を持つ', () => {
    const root: Clip = { id: 'root', children: [{ clip: leaf('p', 'el'), at: [0.25, 0.75] }] }
    const { parts } = flattenClip(root)
    expect(parts).toHaveLength(1)
    expect(parts[0]).toMatchObject({ key: 'p', start: 0.25, end: 0.75 })
    expect(parts[0]?.part.target).toBe('el')
  })

  it('同じ子を key を変えて 2 か所に置ける (子は使い回せる)', () => {
    const card = leaf('card')
    const root: Clip = {
      id: 'root',
      children: [
        { clip: card, at: [0, 0.5] },
        { clip: card, at: [0.5, 1], key: 'card-2' },
      ],
    }
    const { clips } = flattenClip(root)
    expect(clips.map((c) => [c.key, c.start])).toEqual([
      ['root', 0],
      ['card', 0],
      ['card-2', 0.5],
    ])
  })

  it('at が [0, 1] の外や逆向きなら RangeError', () => {
    const bad = (at: [number, number]): Clip => ({ id: 'r', children: [{ clip: leaf('x'), at }] })
    expect(() => flattenClip(bad([-0.1, 1]))).toThrow(RangeError)
    expect(() => flattenClip(bad([0, 1.2]))).toThrow(RangeError)
    expect(() => flattenClip(bad([0.6, 0.4]))).toThrow(RangeError)
  })

  it('同じ key が 2 度出たら Error (inspector と置き直しの対応が崩れるため)', () => {
    const root: Clip = {
      id: 'root',
      children: [
        { clip: leaf('a'), at: [0, 1] },
        { clip: leaf('a'), at: [0, 1] },
      ],
    }
    expect(() => flattenClip(root)).toThrow(/a/)
  })
})

describe('setPlacement — 親の at を書き換えた新しい木', () => {
  const tree: Clip = {
    id: 'root',
    children: [
      { clip: { id: 'p', children: [{ clip: leaf('c'), at: [0, 1] }] }, at: [0, 0.5] },
      { clip: leaf('d'), at: [0.5, 1] },
    ],
  }

  it('深い所の at も key で書き換える。元の木は変えない', () => {
    const next = setPlacement(tree, 'c', [0.25, 0.75])
    const c = flattenClip(next).clips.find((x) => x.key === 'c')
    expect(c?.start).toBeCloseTo(0.125)
    expect(c?.end).toBeCloseTo(0.375)
    expect(flattenClip(tree).clips.find((x) => x.key === 'c')?.start).toBe(0)
  })

  it('知らない key なら Error', () => {
    expect(() => setPlacement(tree, 'nope', [0, 1])).toThrow(/nope/)
  })
})

const expectAt = (got: [number, number], want: [number, number]): void => {
  expect(got[0]).toBeCloseTo(want[0])
  expect(got[1]).toBeCloseTo(want[1])
}

describe('dragPlacement — 帯のドラッグ (親の t の上の量) を at に', () => {
  it('move は長さを保って動かし、[0, 1] の端で止める', () => {
    expectAt(dragPlacement('move', [0.2, 0.6], 0.1), [0.3, 0.7])
    expectAt(dragPlacement('move', [0.2, 0.6], 0.6), [0.6, 1])
    expectAt(dragPlacement('move', [0.2, 0.6], -0.5), [0, 0.4])
  })

  it('start / end は片側だけ動かし、反対側を越えない', () => {
    expectAt(dragPlacement('start', [0.2, 0.6], 0.1), [0.3, 0.6])
    expectAt(dragPlacement('start', [0.2, 0.6], 0.9), [0.6, 0.6])
    expectAt(dragPlacement('end', [0.2, 0.6], -0.1), [0.2, 0.5])
    expectAt(dragPlacement('end', [0.2, 0.6], 0.9), [0.2, 1])
  })

  it('step を渡すと 0.01 などの目盛りに丸める', () => {
    const [s, e] = dragPlacement('move', [0.2, 0.6], 0.1234, 0.01)
    expect(s).toBeCloseTo(0.32)
    expect(e).toBeCloseTo(0.72)
  })
})

describe('localT — 親の t から clip 自身の t へ', () => {
  it('区間の前は 0、後は 1、中は線形', () => {
    expect(localT(0.1, 0.2, 0.6)).toBe(0)
    expect(localT(0.4, 0.2, 0.6)).toBeCloseTo(0.5)
    expect(localT(0.9, 0.2, 0.6)).toBe(1)
  })

  it('長さ 0 の区間は、その点を過ぎたら 1', () => {
    expect(localT(0.49, 0.5, 0.5)).toBe(0)
    expect(localT(0.5, 0.5, 0.5)).toBe(1)
  })
})

describe('poseKeyframes — Pose から keyframe へ', () => {
  it('幾何が片方にでもあれば transform を両方に持つ (補間の組をそろえる)', () => {
    const [a, b] = poseKeyframes({}, { x: 10, rx: 30 })
    expect(a.transform).toBe('translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) scale(1)')
    expect(b.transform).toBe('translate3d(10px, 0px, 0px) rotateX(30deg) rotateY(0deg) scale(1)')
    expect('opacity' in a).toBe(false)
  })

  it('opacity だけなら transform を持たない (他の transform を上書きしない)', () => {
    const [a, b] = poseKeyframes({ opacity: 0 }, { opacity: 1 })
    expect(a).toEqual({ opacity: 0 })
    expect(b).toEqual({ opacity: 1 })
  })

  it("order 'yx' は rotateY を先に書く (billboard の逆回転)", () => {
    const [, b] = poseKeyframes({}, { rx: 12, ry: -24, order: 'yx' })
    expect(b.transform).toContain('rotateY(-24deg) rotateX(12deg)')
  })
})

describe('bakeKeyframes — 区間を offset に焼き込む', () => {
  it('[A@0, A@start (easing), B@end, B@1]', () => {
    const frames = bakeKeyframes({ opacity: 0 }, { opacity: 1 }, 0.2, 0.6, 'ease-out')
    expect(frames).toEqual([
      { opacity: 0, offset: 0 },
      { opacity: 0, offset: 0.2, easing: 'ease-out' },
      { opacity: 1, offset: 0.6 },
      { opacity: 1, offset: 1 },
    ])
  })

  it('easing を省くと keyframe に easing を書かない (linear)', () => {
    const frames = bakeKeyframes({ opacity: 0 }, { opacity: 1 }, 0, 1)
    expect('easing' in (frames[1] ?? {})).toBe(false)
  })
})
