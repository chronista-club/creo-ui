import {
  bind,
  cssVarNumberTarget,
  number,
  signalTarget,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { type Frame, FrameProvider, useFrame } from 'creo-ui-frame'
import EditorModeToggle from './EditorModeToggle'

/**
 * gaze (視線 = perspective-origin) の Live Preview。
 *
 * creo-ui-frame の実 runtime を dogfood しつつ、**ドラッグ**と **Editor Mode パネル**の
 * 双方から同じ gaze を操作できる (単一 source = FrameProvider の gaze なので双方向 sync)。
 * - stage を掴む → `useFrame().setGaze` で視点を上書き
 * - Editor Mode ON → inspector パネルの slider (消失点 X / 水平線 Y / perspective) で精密調整
 *
 * perspective は `--_gaze-persp` (この demo だけが読む scoped var) 経由で slider に開くので、
 * 調整しても page 全体の `--frame-perspective-default` token は汚さない。
 */
const GAZE_FRAME: Frame = {
  id: 'gaze',
  slots: {},
  perspective: 'var(--_gaze-persp, 1400px)',
  // horizon を少し上 (目線が中央よりやや上) に置いた初期視点
  gaze: { x: '50%', y: '42%' },
}

/** Gaze 軸の string ('42%') から数値 % を取り出す (slider / readout 用、fallback 50) */
function gazePct(value: number | string | undefined): number {
  if (typeof value === 'number') return value
  const n = value ? Number.parseFloat(value) : Number.NaN
  return Number.isFinite(n) ? n : 50
}

/**
 * global EditorHostProvider (App root) の配下で動く。bind() は context 経由で
 * site 共通 host に register されるため、local provider は持たない (一本化 2026-08-13)。
 */
export default function GazeLivePreview() {
  return (
    <>
      <FrameProvider frames={[GAZE_FRAME]} class="docs-horizon">
        <GazeScene />
      </FrameProvider>
      <EditorModeToggle />
    </>
  )
}

function GazeScene() {
  const { gaze, setGaze } = useFrame()

  const gx = () => gazePct(gaze().x)
  const gy = () => gazePct(gaze().y)

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

  const moveTo = (el: HTMLElement, clientX: number, clientY: number) => {
    const rect = el.getBoundingClientRect()
    const x = clamp(((clientX - rect.left) / rect.width) * 100, 6, 94)
    // horizon は上寄り〜中央 (地平を空へ突き抜けさせない)
    const y = clamp(((clientY - rect.top) / rect.height) * 100, 14, 66)
    setGaze({ x: `${x.toFixed(1)}%`, y: `${y.toFixed(1)}%` })
  }

  const onPointerDown = (e: PointerEvent) => {
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    moveTo(el, e.clientX, e.clientY)
  }
  const onPointerMove = (e: PointerEvent) => {
    const el = e.currentTarget as HTMLElement
    if (!el.hasPointerCapture(e.pointerId)) return
    moveTo(el, e.clientX, e.clientY)
  }

  // Editor パネル: ドラッグと同じ gaze を slider から操作 (双方向 sync)。
  // 消失点 X / 水平線 Y は runtime gaze (setGaze) へ、perspective は scoped var へ bind。
  const binders = [
    bind({
      target: signalTarget('gaze.x', gx, (v) => setGaze({ x: `${v}%`, y: gaze().y })),
      control: number({ min: 6, max: 94, step: 1, unit: '%', variant: 'slider' }),
      placement: {
        semantic: 'tool',
        group: 'gaze',
        label: '消失点 X (perspective-origin)',
        order: 1,
        scope: 'component',
      },
    }),
    bind({
      target: signalTarget('gaze.y', gy, (v) => setGaze({ x: gaze().x, y: `${v}%` })),
      control: number({ min: 14, max: 66, step: 1, unit: '%', variant: 'slider' }),
      placement: {
        semantic: 'tool',
        group: 'gaze',
        label: '水平線 Y (horizon)',
        order: 2,
        scope: 'component',
      },
    }),
    bind({
      target: cssVarNumberTarget('gaze.persp', '--_gaze-persp', 1400, 'px'),
      control: number({ min: 600, max: 2400, step: 50, unit: 'px', variant: 'slider' }),
      placement: {
        semantic: 'tool',
        group: 'perspective',
        label: 'Perspective (--_gaze-persp)',
        order: 1,
        scope: 'token',
      },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'gaze-live-preview' })

  return (
    <div
      ref={selectable}
      class="docs-horizon-inner"
      style={{ '--gx': String(gx()), '--gy': String(gy()) }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      role="application"
      aria-label="視線 (注視点) を動かして 3D grid の収束を確かめる interactive demo"
    >
      <div class="docs-horizon-world">
        <div class="docs-horizon-floor" />
        <div class="docs-horizon-card" data-depth="far">
          far · z-40
        </div>
        <div class="docs-horizon-card" data-depth="mid">
          mid · z+30
        </div>
        <div class="docs-horizon-card" data-depth="near">
          near · z+90
        </div>
      </div>
      <div class="docs-horizon-line" />
      <div class="docs-horizon-reticle" />
      <div class="docs-horizon-readout">
        gaze <code>{gx().toFixed(0)}%</code> <code>{gy().toFixed(0)}%</code>
      </div>
    </div>
  )
}
