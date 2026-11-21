/**
 * createTimeline — Clip の木を、時計 1 つで動かす。
 *
 * 全 part を同じ長さ (duration) の WAAPI Animation にし、clip の区間は keyframe の offset に
 * 焼き込む (clip.ts の bakeKeyframes)。全部が同じ時間軸に乗るので、
 * - 再生はブラウザに任せられる (合成スレッドで動き、JS は毎フレーム何もしない)
 * - スクラブは pause して currentTime を書くだけ
 * - 逆再生は playbackRate = -1
 *
 * reduced-motion のときは play が再生せず、行き先へ飛ぶ。
 */

import { respectsReducedMotion } from '../motion/reduced-motion'
import { bakeKeyframes, type Clip, type FlatClip, flattenClip } from './clip'

export interface TimelineOptions {
  /** 全体 (t: 0 → 1) の長さ、ms */
  duration: number
  /** part の target 名から要素を引く。見つからない part は飛ばす */
  resolve: (target: string) => Element | null | undefined
  /** 各 clip の区間にかける easing (CSS easing)。省くと linear */
  easing?: string
  /** 最初の t、default 0 */
  t?: number
  /** t が変わったとき (seek、再生中は毎フレーム、再生の終わり) */
  onUpdate?: (t: number) => void
}

export interface Timeline {
  /** いまの t */
  readonly t: number
  /** 絶対区間つきの clip (inspector に渡す) */
  readonly clips: readonly FlatClip[]
  /** t へ飛ぶ (再生中なら止める) */
  seek(t: number): void
  /** to まで再生する。終わる (または止められる) と解決する */
  play(to: 0 | 1): Promise<void>
  /** 再生を止める (t はその場に残る) */
  stop(): void
  /** 木や長さを差し替えて Animation を作り直す。t は保つ */
  update(root: Clip, options?: Partial<Pick<TimelineOptions, 'duration' | 'easing'>>): void
  /** 全 Animation を外す */
  cancel(): void
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v))

export function createTimeline(root: Clip, options: TimelineOptions): Timeline {
  let duration = options.duration
  let easing = options.easing
  let t = clamp01(options.t ?? 0)
  let clips: FlatClip[] = []
  let anims: Animation[] = []
  let raf = 0
  let settle: (() => void) | undefined

  const notify = (): void => options.onUpdate?.(t)

  const build = (tree: Clip): void => {
    for (const a of anims) a.cancel()
    const flat = flattenClip(tree)
    clips = flat.clips
    anims = flat.parts.flatMap(({ part, start, end }) => {
      const el = options.resolve(part.target)
      if (!el) return []
      const frames = bakeKeyframes(part.a, part.b, start, end, part.easing ?? easing)
      const anim = el.animate(frames, { duration, fill: 'both' })
      anim.pause()
      anim.currentTime = t * duration
      return [anim]
    })
  }

  const stop = (): void => {
    if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf)
    for (const a of anims) {
      if (a.playState === 'running') a.pause()
    }
    settle?.()
    settle = undefined
  }

  const seek = (next: number): void => {
    stop()
    t = clamp01(next)
    for (const a of anims) {
      a.pause()
      a.currentTime = t * duration
    }
    notify()
  }

  const play = (to: 0 | 1): Promise<void> => {
    stop()
    if (t === to || anims.length === 0 || respectsReducedMotion()) {
      seek(to)
      return Promise.resolve()
    }
    const rate = to === 1 ? 1 : -1
    for (const a of anims) {
      a.playbackRate = rate
      a.play()
    }
    const head = anims[0] as Animation
    // 再生中の t は、先頭の Animation の currentTime から読む (全部同じ時間軸)
    const tick = (): void => {
      t = clamp01(Number(head.currentTime ?? 0) / duration)
      notify()
      raf = requestAnimationFrame(tick)
    }
    if (typeof requestAnimationFrame === 'function') raf = requestAnimationFrame(tick)

    return new Promise<void>((resolve) => {
      let done = false
      const finish = (): void => {
        if (done) return
        done = true
        resolve()
      }
      settle = finish
      Promise.all(anims.map((a) => a.finished)).then(
        () => {
          if (done) return
          settle = undefined
          if (typeof cancelAnimationFrame === 'function') cancelAnimationFrame(raf)
          t = to
          notify()
          finish()
        },
        // cancel された (update / cancel で作り直した) とき
        finish,
      )
    })
  }

  build(root)

  return {
    get t() {
      return t
    },
    get clips() {
      return clips
    },
    seek,
    play,
    stop,
    update(tree, next) {
      stop()
      if (next?.duration !== undefined) duration = next.duration
      if (next && 'easing' in next) easing = next.easing
      build(tree)
    },
    cancel() {
      stop()
      for (const a of anims) a.cancel()
      anims = []
    },
  }
}
