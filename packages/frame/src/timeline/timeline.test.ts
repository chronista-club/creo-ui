/**
 * createTimeline — 時計 1 つで Clip の木を動かす (bun test + happy-dom)。
 *
 * el.animate を偽の Animation に差し替え、作られる keyframe と、seek / play が
 * Animation にどう書くかを確かめる (happy-dom の再生そのものには頼らない)。
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { _resetReducedMotionCache } from '../motion/reduced-motion'
import { type Clip, setPlacement } from './clip'
import { createTimeline } from './timeline'

interface FakeAnimation {
  keyframes: Keyframe[]
  options: KeyframeAnimationOptions
  currentTime: number | null
  playbackRate: number
  playState: AnimationPlayState
  finished: Promise<FakeAnimation>
  finish: () => void
  pause: () => void
  play: () => void
  cancel: () => void
}

function fakeAnimate(el: HTMLElement, log: FakeAnimation[]): void {
  el.animate = ((keyframes: Keyframe[], options: KeyframeAnimationOptions) => {
    let resolve: (a: FakeAnimation) => void = () => {}
    const anim: FakeAnimation = {
      keyframes,
      options,
      currentTime: 0,
      playbackRate: 1,
      playState: 'running',
      finished: new Promise((r) => {
        resolve = r
      }),
      finish() {
        anim.playState = 'finished'
        anim.currentTime = anim.playbackRate > 0 ? Number(options.duration) : 0
        resolve(anim)
      },
      pause() {
        anim.playState = 'paused'
      },
      play() {
        anim.playState = 'running'
      },
      cancel() {
        anim.playState = 'idle'
      },
    }
    log.push(anim)
    return anim as unknown as Animation
  }) as HTMLElement['animate']
}

function setup(targets: string[]) {
  const log: FakeAnimation[] = []
  const els = new Map<string, HTMLElement>()
  for (const name of targets) {
    const el = document.createElement('div')
    fakeAnimate(el, log)
    els.set(name, el)
  }
  return { log, resolve: (target: string) => els.get(target) ?? null }
}

const card: Clip = {
  id: 'card',
  parts: [{ target: 'ring', a: { opacity: 0 }, b: { opacity: 1 } }],
}

const tree: Clip = {
  id: 'screen',
  parts: [{ target: 'scene', a: {}, b: { rx: 58 } }],
  children: [{ clip: card, at: [0.2, 0.6] }],
}

function mockReducedMotion(reduced: boolean): void {
  _resetReducedMotionCache()
  window.matchMedia = ((q: string) => ({
    matches: reduced,
    media: q,
    addEventListener() {},
    removeEventListener() {},
  })) as unknown as typeof window.matchMedia
}

describe('createTimeline', () => {
  beforeEach(() => mockReducedMotion(false))
  afterEach(() => _resetReducedMotionCache())

  it('part ごとに Animation を 1 つ作り、区間を offset に焼き込む', () => {
    const { log, resolve } = setup(['scene', 'ring'])
    createTimeline(tree, { duration: 1000, resolve })
    expect(log).toHaveLength(2)
    const ring = log[1]
    expect(ring?.keyframes.map((k) => k.offset)).toEqual([0, 0.2, 0.6, 1])
    expect(ring?.options).toMatchObject({ duration: 1000, fill: 'both' })
  })

  it('見つからない target は飛ばす', () => {
    const { log, resolve } = setup(['ring'])
    createTimeline(tree, { duration: 1000, resolve })
    expect(log).toHaveLength(1)
  })

  it('作った直後は止まっていて、初期の t の位置にある', () => {
    const { log, resolve } = setup(['scene', 'ring'])
    const tl = createTimeline(tree, { duration: 1000, resolve, t: 0.5 })
    expect(tl.t).toBe(0.5)
    for (const a of log) {
      expect(a.playState).toBe('paused')
      expect(a.currentTime).toBe(500)
    }
  })

  it('seek は全 Animation を止めて currentTime を書き、onUpdate に知らせる', () => {
    const { log, resolve } = setup(['scene', 'ring'])
    const seen: number[] = []
    const tl = createTimeline(tree, {
      duration: 800,
      resolve,
      onUpdate: (t) => seen.push(t),
    })
    tl.seek(0.25)
    expect(tl.t).toBe(0.25)
    for (const a of log) expect(a.currentTime).toBe(200)
    expect(seen.at(-1)).toBe(0.25)
  })

  it('seek は [0, 1] に収める', () => {
    const { resolve } = setup(['scene'])
    const tl = createTimeline(tree, { duration: 800, resolve })
    tl.seek(1.5)
    expect(tl.t).toBe(1)
  })

  it('play(1) は正の速度で、play(0) は逆向きで再生し、終わると t が行き先になる', async () => {
    const { log, resolve } = setup(['scene', 'ring'])
    const tl = createTimeline(tree, { duration: 1000, resolve, t: 0.5 })
    const done = tl.play(0)
    for (const a of log) {
      expect(a.playbackRate).toBe(-1)
      expect(a.playState).toBe('running')
    }
    for (const a of log) a.finish()
    await done
    expect(tl.t).toBe(0)
  })

  it('reduced-motion のとき play は再生せず、行き先へ飛ぶ', async () => {
    mockReducedMotion(true)
    const { log, resolve } = setup(['scene', 'ring'])
    const tl = createTimeline(tree, { duration: 1000, resolve })
    await tl.play(1)
    expect(tl.t).toBe(1)
    for (const a of log) {
      expect(a.playState).toBe('paused')
      expect(a.currentTime).toBe(1000)
    }
  })

  it('update は Animation を作り直し、t を保つ', () => {
    const { log, resolve } = setup(['scene', 'ring'])
    const tl = createTimeline(tree, { duration: 1000, resolve, t: 0.3 })
    tl.update(setPlacement(tree, 'card', [0, 1]))
    expect(log.slice(0, 2).every((a) => a.playState === 'idle')).toBe(true)
    expect(log).toHaveLength(4)
    expect(log[3]?.keyframes.map((k) => k.offset)).toEqual([0, 0, 1, 1])
    expect(log[3]?.currentTime).toBe(300)
    expect(tl.clips.map((c) => [c.key, c.start, c.end])).toEqual([
      ['screen', 0, 1],
      ['card', 0, 1],
    ])
  })

  it('cancel で全 Animation を外す', () => {
    const { log, resolve } = setup(['scene', 'ring'])
    const tl = createTimeline(tree, { duration: 1000, resolve })
    tl.cancel()
    expect(log.every((a) => a.playState === 'idle')).toBe(true)
  })
})
