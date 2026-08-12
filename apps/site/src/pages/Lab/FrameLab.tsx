import { A } from '@solidjs/router'
import { FrameProvider, FrameSlot, useFrame } from 'creo-ui-frame'
import { createSignal, onMount } from 'solid-js'
import GazeLivePreview from '../../ui/GazeLivePreview'
import { FrameStage } from './FrameStage'
import { dashboardFrame, readingFrame } from './frames'

export default function FrameLab() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Lab</p>
        <h1>Frame & Gaze — 3D Frame lab</h1>
        <p class="docs-page-lead">
          <code>creo-ui-frame</code> の <code>FrameProvider</code> / <code>FrameSlot</code> /{' '}
          <code>setFrame</code> と gaze (視線) を実 runtime で試す area。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Frame system demo (Phase 3)</h2>
        <p class="docs-page-helper">
          <code>creo-ui-frame</code> の <code>FrameProvider</code> + <code>FrameSlot</code> +{' '}
          <code>useFrame()</code> で 2 frame (dashboard / reading) を切替。 同 DOM 保持で transform
          / opacity が CSS transition で morph。 →{' '}
          <A href="/concepts/frame-system">Frame system 概念</A> も参照。
        </p>
        <FrameDemo />
      </section>

      <section>
        <h2 class="docs-section-title">Gaze (視線 / horizon) Live Preview — F-4</h2>
        <p class="docs-page-helper">
          <code>Frame.gaze</code> + <code>useFrame().setGaze</code> の実 runtime。 stage を掴んで
          注視点を動かす (ドラッグ) か、 <kbd>Ctrl+Shift+G</kbd> / 鉛筆 toggle で Editor Mode ON →
          パネルの slider (消失点 X / 水平線 Y / perspective) で精密調整できる (双方向 sync)。 →{' '}
          <A href="/concepts/frame-system">F-4 視線の概念</A> も参照。
        </p>
        <GazeLivePreview />
      </section>

      <section>
        <h2 class="docs-section-title">
          Spatial 3D model in Frame slot (Phase B-spatial-web、 visionOS 26)
        </h2>
        <p class="docs-page-helper">
          HTML <code>&lt;model&gt;</code> element (Apple WebKit、 visionOS 26 で実装) を FrameSlot
          内に配置。 <strong>visionOS Safari では物理 3D entity</strong> として render され
          pinch-and-drag で rotate 可能、{' '}
          <strong>
            他 browser では子の <code>&lt;img&gt;</code> が graceful fallback
          </strong>{' '}
          として表示される。 同じ web markup で 「VP では literal 3D、 desktop では平面 image」
          を実現するのが Apple の progressive enhancement 流儀。
        </p>
        <p class="docs-page-helper">
          Frame system <strong>F-3 (depth metaphor multi-platform)</strong> の web 実装例 — protocol
          (FrameSlot) は変えず、 representation だけが platform 能力で richer に。 dashboard /
          reading button で frame morph すると、 <code>&lt;model&gt;</code> entity も spatial に
          移動する (CSS transform は VP の <code>&lt;model&gt;</code> render にも適用される)。
        </p>
        <ModelInFrameDemo />
      </section>
    </>
  )
}

// =============================================================================
// Frame system demo (Phase 3)
// =============================================================================

function FrameDemo() {
  return (
    <FrameProvider frames={[dashboardFrame, readingFrame]} initial="dashboard">
      <FrameStage />
    </FrameProvider>
  )
}

// =============================================================================
// Phase B-spatial-web demo — `<model>` element in FrameSlot (visionOS 26+)
// =============================================================================

/**
 * USDZ model URL — Apple Quick Look gallery の公開 USDZ を default に。
 * もし CORS / availability で動かない場合は `apps/site/public/` 内に vendor して
 * 相対 path に切替可能。
 */
const MODEL_USDZ_URL =
  'https://developer.apple.com/augmented-reality/quick-look/models/teapot/teapot.usdz'

/** Fallback image for non-VP browsers (`<model>` 非対応 browser で表示される)。 */
const MODEL_FALLBACK_IMG =
  'https://developer.apple.com/augmented-reality/quick-look/images/teapot/teapot.jpg'

function ModelInFrameDemo() {
  return (
    <FrameProvider frames={[dashboardFrame, readingFrame]} initial="dashboard">
      <ModelFrameStage />
    </FrameProvider>
  )
}

function ModelFrameStage() {
  const { setFrame, currentFrameId } = useFrame()
  const [supportsModel, setSupportsModel] = createSignal<boolean | null>(null)

  onMount(() => {
    // visionOS Safari 26+ でのみ true、 他 browser では undefined
    setSupportsModel(typeof window !== 'undefined' && 'HTMLModelElement' in window)
  })

  return (
    <div>
      <div class="docs-frame-controls">
        <button
          type="button"
          class="creo-btn"
          data-variant={currentFrameId() === 'dashboard' ? 'primary' : 'secondary'}
          onClick={() => setFrame('dashboard')}
        >
          dashboard
        </button>
        <button
          type="button"
          class="creo-btn"
          data-variant={currentFrameId() === 'reading' ? 'primary' : 'secondary'}
          onClick={() => setFrame('reading')}
        >
          reading
        </button>
        <span class="docs-frame-current">
          <code>&lt;model&gt;</code> support:{' '}
          <strong>
            {supportsModel() === null
              ? '…detecting'
              : supportsModel()
                ? 'YES (visionOS Safari)'
                : 'no (fallback img 表示中)'}
          </strong>
        </span>
      </div>
      <div class="docs-frame-stage docs-model-frame-stage">
        <FrameSlot name="hero">
          <div class="docs-frame-slot-card docs-model-slot-card" data-slot="hero">
            <span class="docs-frame-slot-label">3D MODEL</span>
            <model class="docs-model-element" stagemode="orbit">
              <source src={MODEL_USDZ_URL} type="model/vnd.usdz+zip" />
              <img
                class="docs-model-fallback"
                src={MODEL_FALLBACK_IMG}
                alt="Teapot 3D model — fallback for non-visionOS browsers"
              />
            </model>
          </div>
        </FrameSlot>
        <FrameSlot name="sidebar">
          <div class="docs-frame-slot-card" data-slot="sidebar">
            <span class="docs-frame-slot-label">SIDEBAR</span>
            <p>Frame system が `&lt;model&gt;` を slot に持つ可能性</p>
          </div>
        </FrameSlot>
        <FrameSlot name="main">
          <div class="docs-frame-slot-card" data-slot="main">
            <span class="docs-frame-slot-label">MAIN</span>
            <p>F-3 metaphor → literal 3D の web 実装</p>
          </div>
        </FrameSlot>
      </div>
    </div>
  )
}
