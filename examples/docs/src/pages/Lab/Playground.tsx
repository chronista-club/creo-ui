import { A } from '@solidjs/router'
import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
  cssVarNumberTarget,
  number,
  select,
  signalTarget,
  string,
} from 'creo-ui-editor-host'
import { FrameProvider, FrameSlot, useFrame, type Frame } from 'creo-ui-frame'
import {
  VisionProvider,
  useGesture,
  useHandPinch,
  type VisionSource,
} from 'creo-ui-vision'
import { createMockSource } from 'creo-ui-vision/mock'
import { For, Show, createEffect, createSignal } from 'solid-js'

export default function Playground() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Lab</p>
        <h1>Playground — Live design surface</h1>
        <p class="docs-page-lead">
          <code>creo-ui-editor-host</code> の reference runtime を動かす実演 area。 Editor Mode を
          ON にして field を操作すると、 下の preview と <strong>token CSS variable</strong> がリアルタイム連動する。
          DevTools Console から <code>window.creoEditor</code> 経由で field を増やすことも可能。
          → <A href="/concepts/editor-mode">Editor Mode protocol</A> も参照。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">操作方法</h2>
        <ul class="docs-bullet-list">
          <li><kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle</li>
          <li>右下に出る floating button からも切替</li>
          <li>RIGHT panel の field を操作 → 下の preview が live 反映</li>
          <li>DevTools Console: <code>creoEditor.help()</code> で REPL コマンド一覧</li>
          <li>URL hash に share 形式で state encode、 別 tab で同 URL 開くと再現</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live demo</h2>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              shortcut: ['ctrl+shift+e', 'meta+shift+e'],
              exposeConsole: true,
              localStorageNamespace: 'creo-ui-docs.playground',
            }}
          >
            <PlaygroundDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
        <p class="docs-page-helper">
          Playground は scope 局所化されているため、 Editor Mode 効果はこの section 内のみ。
          docs site の他 page には影響しない (provider context の境界)。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">この component の構成</h2>
        <pre class="docs-code">
          <code>{`import {
  EditorHostProvider,
  EditorLayer,
  bind,
  number,
  cssVarNumberTarget,
  signalTarget,
  select,
  boolean,
  string,
} from 'creo-ui-editor-host'
import { createSignal } from 'solid-js'

function Demo() {
  // CSS variable に bind (live で全 consumer に反映)
  bind({
    id: 'demo.cardRadius',
    control: number({ variant: 'slider' }),
    target: cssVarNumberTarget('--demo-card-radius', { min: 0, max: 32, unit: 'px' }),
    initial: 12,
    semantic: 'tool',
  })

  // Solid signal に bind (component 内のみ)
  const [elevation, setElevation] = createSignal('raised')
  bind({
    id: 'demo.elevation',
    control: select({ options: ['flat', 'raised', 'floating'] as const }),
    target: signalTarget('demo.elevation', elevation, setElevation),
    initial: 'raised',
    semantic: 'tool',
  })

  return <article data-elevation={elevation()}>...</article>
}

// Provider で囲んで Layer を render
<EditorHostProvider config={{ exposeConsole: true }}>
  <Demo />
  <EditorLayer />
</EditorHostProvider>`}</code>
        </pre>
      </section>

      <section>
        <h2 class="docs-section-title">Live design surface 機能 (creo-ui-editor-host 0.4+)</h2>
        <ul class="docs-bullet-list">
          <li><strong>Console REPL</strong> — <code>window.creoEditor</code> で REPL、 sugar (slider / picker / chooser / flip)、 inspection (fields / values / describe)、 mode 制御</li>
          <li><strong>DOM auto-discover</strong> — 既知 prefix の CSS variable を scan して自動 bind</li>
          <li><strong>URL share</strong> — current state を hash に encode、 別 tab で再現</li>
          <li><strong>Cross-tab sync</strong> — BroadcastChannel で複数 tab の field 値を同期</li>
          <li><strong>Export to CSS patch</strong> — 変更分を CSS / JSON で書き出し</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Frame system demo (Phase 3)</h2>
        <p class="docs-page-helper">
          <code>creo-ui-frame</code> の <code>FrameProvider</code> + <code>FrameSlot</code> + <code>useFrame()</code> で
          2 frame (dashboard / reading) を切替。 同 DOM 保持で transform / opacity が CSS transition で morph。
          → <A href="/concepts/frame-system">Frame system 概念</A> も参照。
        </p>
        <FrameDemo />
      </section>

      <section>
        <h2 class="docs-section-title">Gesture-driven Frame morph (Phase 4 mock)</h2>
        <p class="docs-page-helper">
          <code>creo-ui-vision</code> の <strong>mock source</strong> (wave pattern) → <code>useGesture('wave')</code> →
          <code>setFrame(next)</code> の binding。 実 webcam は使わず synthetic 信号で実演。
          <code>HandPinch</code> 位置も mock で円周運動。
          → <A href="/concepts/editor-mode">Editor Mode</A> 経由で keyboard / mouse / gesture / MCP の 4 経路統合。
        </p>
        <VisionFrameDemo />
      </section>

      <section>
        <h2 class="docs-section-title">Real MediaPipe demo (Phase 4.5)</h2>
        <p class="docs-page-helper">
          実 webcam + <code>createMediaPipeSource()</code> での hand tracking。 <strong>opt-in</strong> —
          enable button を押した時点で permission request + MediaPipe Tasks Web SDK (~3MB) を lazy load。
          🤏 indicator が <strong>本物の手</strong> の pinch 位置に追従、 <strong>pinch する瞬間</strong>に
          frame morph がトリガ (rising edge detection)。 raw frame は on-device に閉じる (V-4 不変条件)。
        </p>
        <RealMediaPipeDemo />
      </section>
    </>
  )
}

function PlaygroundDemo() {
  // Solid signals for ephemeral state (visible in render)
  const [elevation, setElevation] = createSignal<'flat' | 'raised' | 'floating'>('raised')
  const [showLabel, setShowLabel] = createSignal(true)
  const [title, setTitle] = createSignal('Hello, Creo UI')

  // CSS variable bindings (live token effect)
  bind({
    id: 'demo.cardRadius',
    control: number({ variant: 'slider' }),
    target: cssVarNumberTarget('--demo-card-radius', {
      min: 0,
      max: 32,
      step: 1,
      unit: 'px',
    }),
    initial: 12,
    semantic: 'tool',
    placement: { region: 'right', group: 'card', label: 'Card radius', order: 1 },
  })

  bind({
    id: 'demo.cardPadding',
    control: number({ variant: 'slider' }),
    target: cssVarNumberTarget('--demo-card-padding', {
      min: 8,
      max: 48,
      step: 2,
      unit: 'px',
    }),
    initial: 18,
    semantic: 'tool',
    placement: { region: 'right', group: 'card', label: 'Card padding', order: 2 },
  })

  // Signal-backed bindings (component-local state)
  bind({
    id: 'demo.elevation',
    control: select({ options: ['flat', 'raised', 'floating'] as const }),
    target: signalTarget('demo.elevation', elevation, setElevation),
    initial: 'raised',
    semantic: 'tool',
    placement: { region: 'right', group: 'card', label: 'Elevation', order: 3 },
  })

  bind({
    id: 'demo.showLabel',
    control: boolean({ variant: 'switch' }),
    target: signalTarget('demo.showLabel', showLabel, setShowLabel),
    initial: true,
    semantic: 'tool',
    placement: { region: 'right', group: 'card', label: 'Show label', order: 4 },
  })

  bind({
    id: 'demo.title',
    control: string({ variant: 'input' }),
    target: signalTarget('demo.title', title, setTitle),
    initial: 'Hello, Creo UI',
    semantic: 'content',
    placement: { region: 'right', group: 'content', label: 'Card title', order: 1 },
  })

  return (
    <div class="docs-playground-stage">
      <article
        class="docs-playground-card"
        data-elevation={elevation()}
        style={{
          'border-radius': 'var(--demo-card-radius, 12px)',
          padding: 'var(--demo-card-padding, 18px)',
        }}
      >
        <Show when={showLabel()}>
          <span class="docs-playground-label">PREVIEW CARD</span>
        </Show>
        <h3 class="docs-playground-title">{title() || 'Untitled'}</h3>
        <p class="docs-playground-body">
          このカードの radius / padding / elevation / title / label visibility を
          Editor Mode で操作してみてください (<kbd>Ctrl+Shift+E</kbd>)。
        </p>
        <div class="docs-playground-actions">
          <button class="creo-btn" data-variant="primary">Primary</button>
          <button class="creo-btn" data-variant="secondary">Secondary</button>
        </div>
      </article>
    </div>
  )
}

// =============================================================================
// Frame system demo (Phase 3)
// =============================================================================

const dashboardFrame: Frame = {
  id: 'dashboard',
  slots: {
    hero: { x: '0%', y: '-30%', z: 8 },
    sidebar: { x: '-30%', y: '0%', z: 0 },
    main: { x: '20%', y: '10%', z: 4 },
  },
  perspective: 1400,
  transition: { duration: 480, easing: 'spring' },
}

const readingFrame: Frame = {
  id: 'reading',
  slots: {
    hero: { x: '0%', y: '-40%', z: 16, scale: 1.2 },
    sidebar: { x: '-65%', y: '0%', z: -20, opacity: 0.25 },
    main: { x: '0%', y: '0%', z: 8, scale: 1.05 },
  },
  perspective: 'var(--frame-perspective-deep)',
  transition: { duration: 480, easing: 'spring' },
}

function FrameDemo() {
  return (
    <FrameProvider frames={[dashboardFrame, readingFrame]} initial="dashboard">
      <FrameStage />
    </FrameProvider>
  )
}

function FrameStage() {
  const { setFrame, currentFrameId } = useFrame()

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
          current: <code>{currentFrameId()}</code>
        </span>
      </div>
      <div class="docs-frame-stage">
        <FrameSlot name="hero">
          <div class="docs-frame-slot-card" data-slot="hero">
            <span class="docs-frame-slot-label">HERO</span>
            <p>Title / page entrance</p>
          </div>
        </FrameSlot>
        <FrameSlot name="sidebar">
          <div class="docs-frame-slot-card" data-slot="sidebar">
            <span class="docs-frame-slot-label">SIDEBAR</span>
            <p>Nav / source</p>
          </div>
        </FrameSlot>
        <FrameSlot name="main">
          <div class="docs-frame-slot-card" data-slot="main">
            <span class="docs-frame-slot-label">MAIN</span>
            <p>Content / focus</p>
          </div>
        </FrameSlot>
      </div>
    </div>
  )
}

// =============================================================================
// Vision + Frame demo (Phase 4 mock — wave gesture が Frame morph をトリガ)
// =============================================================================

function VisionFrameDemo() {
  // Wave pattern: 周期的に wave gesture を emit、 mock の orbital pinch も同時生成
  const source = createMockSource({ pattern: 'wave', interval: 4000 })

  return (
    <VisionProvider source={source} autoStart={true}>
      <FrameProvider frames={[dashboardFrame, readingFrame]} initial="dashboard">
        <GestureBridge />
        <div class="docs-vision-frame-stage">
          <FrameStage />
          <PinchIndicator />
          <VisionStatus />
        </div>
      </FrameProvider>
    </VisionProvider>
  )
}

function GestureBridge() {
  const { setFrame, currentFrameId } = useFrame()

  useGesture((event) => {
    if (event.type === 'wave') {
      setFrame(currentFrameId() === 'dashboard' ? 'reading' : 'dashboard')
    }
  })

  return null
}

function PinchIndicator() {
  const pinch = useHandPinch()
  return (
    <Show when={pinch()}>
      <div
        class="docs-pinch-indicator"
        data-active={pinch()!.active}
        style={{
          left: `${pinch()!.x * 100}%`,
          top: `${pinch()!.y * 100}%`,
        }}
        aria-hidden="true"
      >
        {pinch()!.active ? '🤏' : '👋'}
      </div>
    </Show>
  )
}

function VisionStatus() {
  return (
    <div class="docs-vision-status">
      <span class="docs-vision-status-dot" data-active="true" />
      Mock source (wave / orbit) — 4s 周期で frame 切替
    </div>
  )
}

// =============================================================================
// Real MediaPipe demo (Phase 4.5 — opt-in webcam + actual hand tracking)
// =============================================================================

function RealMediaPipeDemo() {
  const [enabled, setEnabled] = createSignal(false)
  const [source, setSource] = createSignal<VisionSource | null>(null)
  const [error, setError] = createSignal<string | null>(null)
  const [loading, setLoading] = createSignal(false)

  const enable = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      // Lazy dynamic import — MediaPipe Tasks (~3MB) は ここで初めて load
      const { createMediaPipeSource } = await import('creo-ui-vision/mediapipe')
      const realSource = await createMediaPipeSource({
        camera: 'user',
        models: ['hand'],
      })
      setSource(realSource)
      setEnabled(true)
    } catch (err) {
      // Emscripten 系 (MediaPipe) は WASM/script load 失敗で Event を reject に渡す。
      // Error / Event / object / それ以外を順に unwrap して useful message を抽出。
      setError(formatVisionError(err))
    } finally {
      setLoading(false)
    }
  }

  const disable = (): void => {
    source()?.stop()
    setSource(null)
    setEnabled(false)
  }

  return (
    <div class="docs-mediapipe-frame">
      <Show when={!enabled()}>
        <div class="docs-mediapipe-prompt">
          <h3 class="docs-mediapipe-prompt-title">Webcam を有効化</h3>
          <ul class="docs-bullet-list">
            <li>カメラへのアクセス許可を求めます (browser native dialog)</li>
            <li>MediaPipe Tasks Web SDK (~3MB) を Google CDN から lazy load</li>
            <li>HandLandmarker を初期化して inference loop 開始</li>
            <li>Raw frame は on-device に閉じます (V-4 contract)</li>
          </ul>
          <button
            type="button"
            class="creo-btn"
            data-variant="primary"
            disabled={loading()}
            onClick={() => void enable()}
          >
            {loading() ? 'Loading MediaPipe...' : 'Enable webcam'}
          </button>
          <Show when={error()}>
            <p class="docs-mediapipe-error">
              <strong>Error:</strong> {error()}
            </p>
          </Show>
        </div>
      </Show>
      <Show when={enabled() && source()}>
        <VisionProvider source={source()!} autoStart={true}>
          <FrameProvider frames={[dashboardFrame, readingFrame]} initial="dashboard">
            <PinchEdgeBridge />
            <div class="docs-vision-frame-stage">
              <FrameStage />
              <PinchIndicator />
              <RealVisionStatus onDisable={disable} />
            </div>
          </FrameProvider>
        </VisionProvider>
      </Show>
    </div>
  )
}

/**
 * Vision/MediaPipe error の unwrap helper。
 *
 * Emscripten 系 lib (MediaPipe / TF.js / ONNX) は WASM load 失敗時に Event を
 * reject に渡す古典的 quirk があるため、 instanceof Error だけだと "[object Event]"
 * という unhelpful 表示になる。 Event の場合は target.src / type を抽出。
 */
function formatVisionError(err: unknown): string {
  if (err instanceof Error) return err.message
  if (typeof Event !== 'undefined' && err instanceof Event) {
    const target = (err as Event).target as HTMLElement | null
    const targetTag = target?.tagName?.toLowerCase() ?? 'unknown'
    const src =
      (target as unknown as { src?: string })?.src ??
      (target as unknown as { href?: string })?.href ??
      null
    if (src) return `Failed to load resource (${targetTag}): ${src}`
    return `${(err as Event).type} event from <${targetTag}> (likely network / CDN / CORS failure)`
  }
  if (typeof err === 'object' && err !== null) {
    try {
      return JSON.stringify(err)
    } catch {
      return Object.prototype.toString.call(err)
    }
  }
  return String(err)
}

/**
 * Pinch の inactive → active (rising edge) で frame morph をトリガ。
 * 持続 pinch を 1 回の trigger に圧縮 (`distinctUntilChanged` 同等 idiom)。
 */
function PinchEdgeBridge() {
  const pinch = useHandPinch()
  const { setFrame, currentFrameId } = useFrame()
  let prevActive = false

  createEffect(() => {
    const cur = pinch()?.active ?? false
    if (cur && !prevActive) {
      setFrame(currentFrameId() === 'dashboard' ? 'reading' : 'dashboard')
    }
    prevActive = cur
  })

  return null
}

function RealVisionStatus(props: { onDisable: () => void }) {
  const pinch = useHandPinch()
  return (
    <div class="docs-vision-status">
      <span class="docs-vision-status-dot" data-active="true" />
      <span>
        Real MediaPipe — pinch <strong>{pinch()?.active ? 'YES' : 'no'}</strong>
        {pinch()
          ? ` · x=${pinch()!.x.toFixed(2)} y=${pinch()!.y.toFixed(2)}`
          : ' · waiting for hand'}
      </span>
      <button
        type="button"
        class="creo-btn"
        data-variant="ghost"
        data-size="sm"
        onClick={props.onDisable}
      >
        Stop
      </button>
    </div>
  )
}
