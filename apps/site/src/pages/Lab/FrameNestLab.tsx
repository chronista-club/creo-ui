import {
  type Clip,
  type ClipPart,
  createTimeline,
  type Pose,
  springEasing,
  type Timeline,
  TimelineInspector,
} from '@chronista-club/creo-ui-frame'
import { createSignal, For, onSettled } from 'solid-js'
import { A } from '../../ui/RouterLink'

/**
 * Frame in Frame — t（進み具合 0→1）を中心にした入れ子のアニメーションの試作。
 *
 * - 各 Frame (Clip) は「自分の t に対して自分がどう動くか」(parts の A → B) だけを持つ
 * - 親は「子の t を、自分の t のどの区間に割り当てるか」(window) だけを決める
 * - 時計は一番上に 1 つ。全 part を WAAPI の Animation にし、同じ長さの時間軸に並べる。
 *   子の区間は keyframe の offset に焼き込む (A を start まで保持 → end で B → 以後 B)。
 *   再生はブラウザに任せ (合成スレッド)、スクラブは pause して currentTime を書く
 *
 * 木の合成・時計・時間軸の表示は creo-ui-frame の timeline (Clip / createTimeline / TimelineInspector)。
 * この page が持つのは宣言 (buildTree) と舞台の DOM だけ。
 */

// --- 宣言: 画面の Frame の中に、project の Frame と線の Frame ------------------------

const PROJECTS = [
  {
    id: 'creo',
    name: 'Creo Memories',
    badge: 'App',
    catch: '記憶を、外部脳に',
  },
  {
    id: 'vp',
    name: 'Vantage Point',
    badge: 'ADE',
    catch: '並列開発を、一画面で',
  },
  {
    id: 'midi',
    name: 'midistage',
    badge: 'Sys',
    catch: 'MIDI と App の signal router',
  },
] as const

type Mode = 'floor' | 'space'

/** Structure のときの project の位置 (px、舞台の中心から)。床は z = 0 の面の上、空間は奥行きつき */
const NODE_POS: Record<Mode, { x: number; y: number; z: number }[]> = {
  floor: [
    { x: -180, y: 110, z: 0 },
    { x: 0, y: -120, z: 0 },
    { x: 180, y: 110, z: 0 },
  ],
  space: [
    { x: -190, y: 60, z: -160 },
    { x: 0, y: -90, z: 90 },
    { x: 190, y: 50, z: -30 },
  ],
}

/** 線 (project の index の組) */
const EDGES = [
  [1, 0],
  [1, 2],
] as const

/** Structure のときの舞台の傾き。face は文字をこちらへ向け直す逆回転 (billboard) */
const VIEW: Record<Mode, { scene: Pose; face: Pose }> = {
  floor: { scene: { y: 20, rx: 58 }, face: { rx: -58 } },
  space: { scene: { rx: -12, ry: 24, order: 'xy' }, face: { rx: 12, ry: -24, order: 'yx' } },
}

/** 子 (project) は「自分の見た目がどう変わるか」だけを持つ。どこで使われるかは知らない */
const PROJECT_CLIPS: Clip[] = PROJECTS.map((p) => ({
  id: p.id,
  label: p.name,
  parts: [
    { target: `catch-${p.id}`, a: { opacity: 1, y: 0 }, b: { opacity: 0, y: -8 } },
    { target: `badge-${p.id}`, a: { x: 0 }, b: { x: -46, y: -28 } },
    { target: `ring-${p.id}`, a: { opacity: 0, scale: 0.6 }, b: { opacity: 1, scale: 1 } },
  ],
}))

const LINES_CLIP: Clip = {
  id: 'lines',
  label: '線',
  // opacity は線 1 本ずつにかける (3D の箱に opacity をかけると、ブラウザが中を平らにする)
  parts: EDGES.map((_, i) => ({ target: `line-${i}`, a: { opacity: 0 }, b: { opacity: 1 } })),
}

type At = readonly [number, number]

/** 親が決める「子の t の始まりと終わり」。調整はここ (= 時間軸の帯) にまとまる */
const INITIAL_AT: Record<string, At> = {
  creo: [0, 0.6],
  vp: [0.12, 0.72],
  midi: [0.24, 0.84],
  lines: [0.6, 1],
}

function buildTree(mode: Mode, at: Record<string, At>): Clip {
  return {
    id: 'screen',
    label: '画面',
    // 親が決めるのは「どこに、どの向きで置くか」と「子をいつ動かすか」
    parts: [
      { target: 'scene', a: {}, b: VIEW[mode].scene },
      { target: 'ground', a: { opacity: 0 }, b: { opacity: 1 } },
      ...PROJECTS.flatMap((p, i): ClipPart[] => [
        {
          target: `place-${p.id}`,
          a: { x: 0, y: (i - 1) * 84, z: 0 },
          b: NODE_POS[mode][i],
        },
        { target: `face-${p.id}`, a: {}, b: VIEW[mode].face },
      ]),
    ],
    children: [...PROJECT_CLIPS, LINES_CLIP].map((clip) => ({
      clip,
      at: at[clip.id] ?? [0, 1],
    })),
  }
}

/** 奥行きを読ませるグリッド。床の案は図の面そのもの、空間の案は下に敷く地面 */
const GROUND: Record<Mode, string> = {
  floor: 'translateZ(-1px)',
  space: 'translateY(170px) rotateX(90deg)',
}

/** 3D の 2 点を結ぶ線の transform (幅 = 長さの div を、始点から終点へ向ける) */
function lineTransform(
  p: { x: number; y: number; z: number },
  q: { x: number; y: number; z: number },
) {
  const dx = q.x - p.x
  const dy = q.y - p.y
  const dz = q.z - p.z
  const h = Math.hypot(dx, dz)
  const len = Math.hypot(dx, dy, dz)
  const yaw = (Math.atan2(-dz, dx) * 180) / Math.PI
  const pitch = (Math.atan2(dy, h) * 180) / Math.PI
  return {
    width: `${len}px`,
    transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px) rotateY(${yaw}deg) rotateZ(${pitch}deg)`,
  }
}

// --- page -------------------------------------------------------------------

export default function FrameNestLab() {
  const [duration, setDuration] = createSignal(900)
  const [at, setAt] = createSignal(INITIAL_AT)
  const [t, setT] = createSignal(0)
  const [playing, setPlaying] = createSignal(false)
  const [mode, setMode] = createSignal<Mode>('floor')
  // 視点 (ドラッグで回す)。t に比例してかかるので、List (t = 0) では効かない
  const [orbit, setOrbit] = createSignal({ x: 0, y: 0 })

  const tree = () => buildTree(mode(), at())
  const [clips, setClips] = createSignal<Timeline['clips']>([])

  let stage: HTMLDivElement | undefined
  let tl: Timeline | undefined

  onSettled(() => {
    tl = createTimeline(tree(), {
      duration: duration(),
      easing: springEasing('slow'),
      resolve: (target) => stage?.querySelector(`[data-part="${target}"]`),
      onUpdate: setT,
    })
    setClips(tl.clips)
    return () => tl?.cancel()
  })

  /** 宣言から Animation を作り直す。t は保つ */
  const rebuild = () => {
    if (!tl) return
    setPlaying(false)
    tl.update(tree(), { duration: duration() })
    setClips(tl.clips)
  }

  const scrub = (next: number) => {
    setPlaying(false)
    tl?.seek(next)
  }

  /** 再生はブラウザに任せる。t は timeline の onUpdate が毎フレーム書く */
  const playTo = async (target: 0 | 1) => {
    if (!tl || t() === target) return
    setPlaying(true)
    await tl.play(target)
    setPlaying(false)
  }

  let drag: { x: number; y: number; ox: number; oy: number } | undefined
  const onPointerDown = (e: PointerEvent) => {
    if (t() === 0) return
    drag = { x: e.clientX, y: e.clientY, ox: orbit().x, oy: orbit().y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!drag) return
    const x = Math.max(-35, Math.min(35, drag.ox - (e.clientY - drag.y) * 0.3))
    const y = Math.max(-60, Math.min(60, drag.oy + (e.clientX - drag.x) * 0.3))
    setOrbit({ x, y })
  }
  const onPointerUp = () => {
    drag = undefined
  }

  const switchMode = (next: Mode) => {
    setMode(next)
    rebuild()
  }

  /** 区間や長さを変えたら作り直す */
  /** 時間軸の帯を動かしたら、親の置き場を書き換えて作り直す */
  const place = (key: string, next: [number, number]) => {
    setAt({ ...at(), [key]: next })
    rebuild()
  }

  const update = (set: (v: number) => void) => (v: number) => {
    set(v)
    rebuild()
  }

  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Lab · spike</p>
        <h1>Frame in Frame — t</h1>
        <p class="docs-page-lead">
          画面の Frame の中に project の Frame を入れる。各 Frame は自分の
          t（0→1）に対する動きだけを持ち、 親は子の t の始まりと終わりを 自分の t
          のどこに置くかを決める — 調整は親の時間軸にまとまる。時計は 1 つ。 →{' '}
          <A href="/lab/frame">Frame & Gaze</A>
        </p>
      </header>

      <section>
        <div class="cu-row cu-center cu-gap-s docs-frame-controls">
          <button
            type="button"
            class="creo-btn"
            data-variant={t() === 0 && !playing() ? 'primary' : 'secondary'}
            onClick={() => playTo(0)}
          >
            List
          </button>
          <button
            type="button"
            class="creo-btn"
            data-variant={t() === 1 && !playing() ? 'primary' : 'secondary'}
            onClick={() => playTo(1)}
          >
            Structure
          </button>
          <label class="docs-ft-scrub">
            <span>
              t = <code>{t().toFixed(3)}</code>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.001"
              value={t()}
              onInput={(e) => scrub(Number(e.currentTarget.value))}
            />
          </label>
        </div>
        <div class="cu-row cu-center cu-gap-s docs-frame-controls">
          <span class="docs-ft-hint">Structure の 3D</span>
          <For
            each={
              [
                ['floor', '1. 床に寝かせる'],
                ['space', '3. 空間に浮かべる'],
              ] as const
            }
          >
            {([value, text]) => (
              <button
                type="button"
                class="creo-btn"
                data-size="s"
                data-variant={mode() === value ? 'primary' : 'secondary'}
                onClick={() => switchMode(value)}
              >
                {text}
              </button>
            )}
          </For>
          <button
            type="button"
            class="creo-btn"
            data-size="s"
            data-variant="secondary"
            onClick={() => setOrbit({ x: 0, y: 0 })}
          >
            視点をもとに
          </button>
          <span class="docs-ft-hint">舞台をドラッグで視点を回す（Structure 側で効く）</span>
        </div>

        <div
          class="docs-frame-stage docs-ft-stage"
          ref={(el) => {
            stage = el
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            class="docs-ft-orbit"
            style={{ transform: `rotateX(${orbit().x * t()}deg) rotateY(${orbit().y * t()}deg)` }}
          >
            <div class="docs-ft-scene" data-part="scene">
              <div
                class="docs-ft-ground"
                data-part="ground"
                style={{ transform: GROUND[mode()] }}
              />
              <For each={EDGES}>
                {([from, to], i) => (
                  <div
                    class="docs-ft-line"
                    data-part={`line-${i()}`}
                    style={lineTransform(NODE_POS[mode()][from], NODE_POS[mode()][to])}
                  />
                )}
              </For>
              <For each={PROJECTS}>
                {(p) => (
                  <div class="docs-ft-place" data-part={`place-${p.id}`}>
                    <div class="docs-ft-face" data-part={`face-${p.id}`}>
                      <div class="docs-ft-card">
                        <span class="docs-ft-ring" data-part={`ring-${p.id}`} />
                        <span class="docs-ft-name">{p.name}</span>
                        <span class="docs-ft-badge" data-part={`badge-${p.id}`}>
                          {p.badge}
                        </span>
                        <span class="docs-ft-catch" data-part={`catch-${p.id}`}>
                          {p.catch}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">時間軸（親が決めること）</h2>
        <p class="docs-page-helper">
          帯 = 各 Frame の t の始まりと終わりを、親の t のどこに置くか。帯の中の色 = その Frame
          自身の t（local
          t）。帯の両端をドラッグで伸び縮み、真ん中で平行移動。帯の外をドラッグすると t が動く。
        </p>
        <TimelineInspector clips={clips()} t={t()} onSeek={scrub} onPlace={place} />
        <div class="docs-ft-knobs docs-ft-knobs-after">
          <Knob
            label="全体の長さ (ms)"
            value={duration()}
            min={300}
            max={3000}
            step={10}
            digits={0}
            onInput={update(setDuration)}
          />
          <div class="cu-row cu-center">
            <button
              type="button"
              class="creo-btn"
              data-size="s"
              data-variant="secondary"
              onClick={() => {
                setAt(INITIAL_AT)
                rebuild()
              }}
            >
              区間をもとに
            </button>
          </div>
        </div>
      </section>
    </>
  )
}

function Knob(props: {
  label: string
  value: number
  min: number
  max: number
  step?: number
  digits?: number
  onInput: (v: number) => void
}) {
  return (
    <label class="docs-ft-knob">
      <span>
        {props.label}: <code>{props.value.toFixed(props.digits ?? 2)}</code>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step ?? 0.01}
        value={props.value}
        onInput={(e) => props.onInput(Number(e.currentTarget.value))}
      />
    </label>
  )
}
