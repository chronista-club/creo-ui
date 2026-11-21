/**
 * Clip の木 — t (進み具合 0 → 1) を中心にした入れ子のアニメーションの宣言。
 *
 * - Clip は「自分の t に対して、自分の part がどう動くか」(A → B) だけを持つ。
 *   どこで使われるかは知らない (同じ Clip を何か所にでも置ける)
 * - 親は children の Placement で「子の t の始まりと終わりを、自分の t のどこに置くか」(at) を決める。
 *   調整は親にまとまる
 * - 区間は合成される: 親の絶対区間 [s, e] の中の at [a, b] は
 *   絶対区間 [s + a·(e − s), s + b·(e − s)] になる。root は全体 [0, 1]
 *
 * 時計は持たない (純関数だけ)。時計を回すのは timeline.ts の createTimeline。
 */

/** 1 要素の姿勢。回転は order の順に書く ('xy' = rotateX → rotateY) */
export interface Pose {
  x?: number
  y?: number
  z?: number
  rx?: number
  ry?: number
  order?: 'xy' | 'yx'
  scale?: number
  opacity?: number
}

/** Clip の中の 1 要素の A → B。target は createTimeline の resolve に渡す名前 */
export interface ClipPart {
  target: string
  a: Pose
  b: Pose
  /** この part だけの easing (CSS easing)。省くと timeline の easing */
  easing?: string
}

/** 自分の t を持つ単位。自分の動き (parts) と、子の置き場 (children) を持つ */
export interface Clip {
  id: string
  /** inspector に出す名前。省くと id */
  label?: string
  parts?: readonly ClipPart[]
  children?: readonly Placement[]
}

/** 親が子を置く: 子の t の 0 → 1 を、親の t の at[0] → at[1] に合わせる ([0, 1] の中、start ≤ end) */
export interface Placement {
  clip: Clip
  at: readonly [number, number]
  /** 置き場の名前 (inspector の行、setPlacement の宛先)。省くと clip.id。同じ子を 2 度置くときに分ける */
  key?: string
}

/** 絶対区間つきの part。key は持ち主の置き場 */
export interface FlatPart {
  key: string
  part: ClipPart
  start: number
  end: number
}

/** 絶対区間つきの clip。depth は root が 0。parentStart / parentEnd は親の絶対区間 (root は 0 / 1) */
export interface FlatClip {
  key: string
  clip: Clip
  start: number
  end: number
  depth: number
  parentStart: number
  parentEnd: number
}

const validAt = (at: readonly [number, number]): boolean =>
  at[0] >= 0 && at[1] <= 1 && at[0] <= at[1]

/** 木を、絶対区間つきの平らな一覧にする。clip は深さ優先・宣言順 */
export function flattenClip(root: Clip): { parts: FlatPart[]; clips: FlatClip[] } {
  const parts: FlatPart[] = []
  const clips: FlatClip[] = []
  const seen = new Set<string>()
  const walk = (
    clip: Clip,
    key: string,
    start: number,
    end: number,
    parent: [number, number],
    depth: number,
  ): void => {
    if (seen.has(key))
      throw new Error(
        `Clip "${key}": key が重なっている (同じ子を 2 度置くなら Placement.key で分ける)`,
      )
    seen.add(key)
    clips.push({ key, clip, start, end, depth, parentStart: parent[0], parentEnd: parent[1] })
    for (const part of clip.parts ?? []) parts.push({ key, part, start, end })
    const len = end - start
    for (const child of clip.children ?? []) {
      const childKey = child.key ?? child.clip.id
      if (!validAt(child.at)) {
        throw new RangeError(
          `Clip "${childKey}": at [${child.at[0]}, ${child.at[1]}] は [0, 1] の中で start ≤ end にする`,
        )
      }
      walk(
        child.clip,
        childKey,
        start + child.at[0] * len,
        start + child.at[1] * len,
        [start, end],
        depth + 1,
      )
    }
  }
  walk(root, root.id, 0, 1, [0, 1], 0)
  return { parts, clips }
}

/** key の置き場の at を書き換えた新しい木を返す (元の木は変えない) */
export function setPlacement(root: Clip, key: string, at: readonly [number, number]): Clip {
  let found = false
  const visit = (clip: Clip): Clip => {
    if (!clip.children) return clip
    return {
      ...clip,
      children: clip.children.map((p) => {
        const next = { ...p, clip: visit(p.clip) }
        if ((p.key ?? p.clip.id) === key) {
          found = true
          next.at = at
        }
        return next
      }),
    }
  }
  const next = visit(root)
  if (!found) throw new Error(`setPlacement: 置き場 "${key}" が無い`)
  return next
}

/** 帯のどこを掴んだか: 始まりの端 / 終わりの端 / 真ん中 (平行移動) */
export type DragHandle = 'start' | 'end' | 'move'

/**
 * 帯のドラッグを at に直す。delta は親の t の上の量 (親の帯の幅を 1 とする)。
 * [0, 1] の外へは出さず、端は反対側を越えない。step を渡すとその目盛りに丸める。
 */
export function dragPlacement(
  handle: DragHandle,
  at: readonly [number, number],
  delta: number,
  step?: number,
): [number, number] {
  const snap = (v: number): number => (step ? Math.round(v / step) * step : v)
  const [s, e] = at
  if (handle === 'move') {
    const d = Math.min(1 - e, Math.max(-s, snap(delta)))
    return [s + d, e + d]
  }
  if (handle === 'start') return [Math.min(e, Math.max(0, s + snap(delta))), e]
  return [s, Math.max(s, Math.min(1, e + snap(delta)))]
}

const clamp01 = (v: number): number => Math.min(1, Math.max(0, v))

/** 親 (全体) の t から、絶対区間 [start, end] の clip 自身の t へ */
export function localT(t: number, start: number, end: number): number {
  if (end <= start) return t >= end ? 1 : 0
  return clamp01((t - start) / (end - start))
}

const GEOMETRY = ['x', 'y', 'z', 'rx', 'ry', 'scale'] as const

/**
 * A と B を、同じ property の組の keyframe にする (片方にしか無い property も両方に入れて補間させる)。
 * 幾何が無ければ transform を書かない — opacity だけの part が他の transform を上書きしないように。
 */
export function poseKeyframes(a: Pose, b: Pose): [Keyframe, Keyframe] {
  const hasGeometry = GEOMETRY.some((k) => k in a || k in b)
  const hasOpacity = 'opacity' in a || 'opacity' in b
  const one = (p: Pose): Keyframe => {
    const kf: Keyframe = {}
    if (hasGeometry) {
      const rx = `rotateX(${p.rx ?? 0}deg)`
      const ry = `rotateY(${p.ry ?? 0}deg)`
      const rot = (p.order ?? 'xy') === 'xy' ? `${rx} ${ry}` : `${ry} ${rx}`
      kf.transform = `translate3d(${p.x ?? 0}px, ${p.y ?? 0}px, ${p.z ?? 0}px) ${rot} scale(${p.scale ?? 1})`
    }
    if (hasOpacity) kf.opacity = p.opacity ?? 1
    return kf
  }
  return [one(a), one(b)]
}

/**
 * 絶対区間 [start, end] を keyframe の offset に焼き込む: A を start まで保ち、end で B、以後 B。
 * easing は start → end の間にかかる (WAAPI は keyframe の easing を「次の keyframe まで」に使う)。
 */
export function bakeKeyframes(
  a: Pose,
  b: Pose,
  start: number,
  end: number,
  easing?: string,
): Keyframe[] {
  const [ka, kb] = poseKeyframes(a, b)
  return [
    { ...ka, offset: 0 },
    easing ? { ...ka, offset: start, easing } : { ...ka, offset: start },
    { ...kb, offset: Math.max(start, end) },
    { ...kb, offset: 1 },
  ]
}
