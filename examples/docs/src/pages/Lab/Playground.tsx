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
import { type Frame, FrameProvider, FrameSlot, useFrame } from 'creo-ui-frame'
import { VisionProvider, type VisionSource, useGesture, useHandPinch } from 'creo-ui-vision'
import { createMockSource } from 'creo-ui-vision/mock'
import { For, Show, createEffect, createSignal, onCleanup, onMount } from 'solid-js'

export default function Playground() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Lab</p>
        <h1>Playground — Live design surface</h1>
        <p class="docs-page-lead">
          <code>creo-ui-editor-host</code> の reference runtime を動かす実演 area。 Editor Mode を
          ON にして field を操作すると、 下の preview と <strong>token CSS variable</strong>{' '}
          がリアルタイム連動する。 DevTools Console から <code>window.creoEditor</code> 経由で field
          を増やすことも可能。 → <A href="/concepts/editor-mode">Editor Mode protocol</A> も参照。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">操作方法</h2>
        <ul class="docs-bullet-list">
          <li>
            <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle
          </li>
          <li>右下に出る floating button からも切替</li>
          <li>RIGHT panel の field を操作 → 下の preview が live 反映</li>
          <li>
            DevTools Console: <code>creoEditor.help()</code> で REPL コマンド一覧
          </li>
          <li>URL hash に share 形式で state encode、 別 tab で同 URL 開くと再現</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live demo</h2>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creo-ui-docs.playground',
            }}
          >
            <PlaygroundDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
        <p class="docs-page-helper">
          Playground は scope 局所化されているため、 Editor Mode 効果はこの section 内のみ。 docs
          site の他 page には影響しない (provider context の境界)。
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
          <li>
            <strong>Console REPL</strong> — <code>window.creoEditor</code> で REPL、 sugar (slider /
            picker / chooser / flip)、 inspection (fields / values / describe)、 mode 制御
          </li>
          <li>
            <strong>DOM auto-discover</strong> — 既知 prefix の CSS variable を scan して自動 bind
          </li>
          <li>
            <strong>URL share</strong> — current state を hash に encode、 別 tab で再現
          </li>
          <li>
            <strong>Cross-tab sync</strong> — BroadcastChannel で複数 tab の field 値を同期
          </li>
          <li>
            <strong>Export to CSS patch</strong> — 変更分を CSS / JSON で書き出し
          </li>
        </ul>
      </section>

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
        <h2 class="docs-section-title">Gesture-driven Frame morph (Phase 4 mock)</h2>
        <p class="docs-page-helper">
          <code>creo-ui-vision</code> の <strong>mock source</strong> (wave pattern) →{' '}
          <code>useGesture('wave')</code> →<code>setFrame(next)</code> の binding。 実 webcam
          は使わず synthetic 信号で実演。
          <code>HandPinch</code> 位置も mock で円周運動。 →{' '}
          <A href="/concepts/editor-mode">Editor Mode</A> 経由で keyboard / mouse / gesture / MCP の
          4 経路統合。
        </p>
        <VisionFrameDemo />
      </section>

      <section>
        <h2 class="docs-section-title">Camera probe (diagnostic)</h2>
        <p class="docs-page-helper">
          VP / browser が公開している camera の一覧、 取得 stream の解像度、 preview 映像、
          MediaPipe asset の load 履歴を画面に直接表示。 visionOS Safari で 「 hand 検出されない」
          等の partial-α 観察時に、 persona camera 経由か / 解像度が model 想定と外れているか /
          model load が完了しているかを切り分ける。
        </p>
        <CameraProbe />
      </section>

      <section>
        <h2 class="docs-section-title">Real MediaPipe demo (Phase 4.5 + P-5 spatial morph)</h2>
        <p class="docs-page-helper">
          実 webcam + <code>createMediaPipeSource()</code> での hand tracking。{' '}
          <strong>opt-in</strong> — enable button を押した時点で permission request + MediaPipe
          Tasks Web SDK (~3MB) を lazy load。 🤏 indicator が <strong>本物の手</strong> の pinch
          位置に追従、 <strong>左で pinch</strong> → dashboard、 <strong>右で pinch</strong> →
          reading frame に morph (空間意味付き trigger、 V-6 user-space coords)。 中央帯
          (x=0.4〜0.6) は <strong>dead-band</strong> で意図しない切替を防止。 raw frame は on-device
          に閉じる (V-4 不変条件)、 jitter は One-Euro Filter で平滑化済 (default)。
        </p>
        <p class="docs-page-helper">
          <strong>Target environments (CV-8)</strong>: この demo は{' '}
          <strong>Mac / Windows / Linux の desktop browser</strong> 向け。 hand tracking を mouse /
          keyboard と並ぶ <strong>UI input modality の一つ</strong> として使う想定。{' '}
          <strong>Vision Pro Safari では動きません</strong> — OS が eye+pinch を pointer event
          として透過提供しているので、 VP page では <code>creo-ui-vision</code>を import せず Frame
          system + 通常 <code>onClick</code> で同じ UX が成立する (
          <a href="/concepts/frame-system">Frame system</a> 参照、 vision-cross-platform.md §10
          Phase A observation log)。
        </p>
        <RealMediaPipeDemo />
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

type PlaygroundElevation = 'flat' | 'raised' | 'floating'

function PlaygroundDemo() {
  // Solid signals for ephemeral state (visible in render)
  const [elevation, setElevation] = createSignal<PlaygroundElevation>('raised')
  const [showLabel, setShowLabel] = createSignal(true)
  const [title, setTitle] = createSignal('Hello, Creo UI')

  // CSS variable bindings (live token effect)
  bind({
    target: cssVarNumberTarget('demo.cardRadius', '--demo-card-radius', 12, 'px'),
    control: number({ min: 0, max: 32, step: 1, unit: 'px', variant: 'slider' }),
    placement: { semantic: 'tool', group: 'card', label: 'Card radius', order: 1 },
  })

  bind({
    target: cssVarNumberTarget('demo.cardPadding', '--demo-card-padding', 18, 'px'),
    control: number({ min: 8, max: 48, step: 2, unit: 'px', variant: 'slider' }),
    placement: { semantic: 'tool', group: 'card', label: 'Card padding', order: 2 },
  })

  // Signal-backed bindings (component-local state)
  bind({
    target: signalTarget('demo.elevation', elevation, (v) =>
      setElevation(v as PlaygroundElevation),
    ),
    control: select(['flat', 'raised', 'floating'] as const),
    placement: { semantic: 'tool', group: 'card', label: 'Elevation', order: 3 },
  })

  bind({
    target: signalTarget('demo.showLabel', showLabel, setShowLabel),
    control: boolean({ variant: 'switch' }),
    placement: { semantic: 'tool', group: 'card', label: 'Show label', order: 4 },
  })

  bind({
    target: signalTarget('demo.title', title, setTitle),
    control: string('input'),
    placement: { semantic: 'tool', group: 'content', label: 'Card title', order: 1 },
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
          このカードの radius / padding / elevation / title / label visibility を Editor Mode
          で操作してみてください (<kbd>Ctrl+Shift+E</kbd>)。
        </p>
        <div class="docs-playground-actions">
          <button type="button" class="creo-btn" data-variant="primary">
            Primary
          </button>
          <button type="button" class="creo-btn" data-variant="secondary">
            Secondary
          </button>
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
        data-active={pinch()?.active}
        style={{
          left: `${(pinch()?.x ?? 0) * 100}%`,
          top: `${(pinch()?.y ?? 0) * 100}%`,
        }}
        aria-hidden="true"
      >
        {pinch()?.active ? '🤏' : '👋'}
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
  const [delegate, setDelegate] = createSignal<'GPU' | 'CPU'>('GPU')

  const enable = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      // Lazy dynamic import — MediaPipe Tasks (~3MB) は ここで初めて load
      const { createMediaPipeSource } = await import('creo-ui-vision/mediapipe')
      const realSource = await createMediaPipeSource({
        camera: 'user',
        models: ['hand'],
        delegate: delegate(),
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
            <li>MediaPipe Tasks Web SDK (~3MB) を jsDelivr CDN から lazy load</li>
            <li>HandLandmarker を初期化して inference loop 開始</li>
            <li>Raw frame は on-device に閉じます (V-4 contract)</li>
          </ul>
          <fieldset class="docs-mediapipe-delegate">
            <legend>Inference delegate</legend>
            <label>
              <input
                type="radio"
                name="mediapipe-delegate"
                value="GPU"
                checked={delegate() === 'GPU'}
                onChange={() => setDelegate('GPU')}
              />
              <span>
                <strong>GPU</strong> (default、 WebGL 経由で高速)
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="mediapipe-delegate"
                value="CPU"
                checked={delegate() === 'CPU'}
                onChange={() => setDelegate('CPU')}
              />
              <span>
                <strong>CPU</strong> (visionOS Safari の WebGL 互換性が 怪しい時の fallback、 slower
                だが確実)
              </span>
            </label>
          </fieldset>
          <button
            type="button"
            class="creo-btn"
            data-variant="primary"
            disabled={loading()}
            onClick={() => void enable()}
          >
            {loading() ? 'Loading MediaPipe...' : `Enable webcam (${delegate()})`}
          </button>
          <Show when={error()}>
            <p class="docs-mediapipe-error">
              <strong>Error:</strong> {error()}
            </p>
          </Show>
        </div>
      </Show>
      <Show when={enabled() && source()}>
        <VisionProvider source={source() as VisionSource} autoStart={true}>
          <FrameProvider frames={[dashboardFrame, readingFrame]} initial="dashboard">
            <SpatialPinchBridge />
            <div class="docs-vision-frame-stage">
              <SpatialPinchZones />
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
 * P-5: Spatial pinch bridge — pinch 位置 (V-6 user-space x) に応じて Frame を選択。
 *
 * - x < 0.4: dashboard frame (左半分)
 * - x > 0.6: reading frame (右半分)
 * - 0.4 ≤ x ≤ 0.6: dead-band (中央帯) — 意図しない oscillation 防止
 *
 * Rising edge (inactive → active) でのみ trigger。 持続 pinch は 1 回として圧縮。
 * 同 frame への再選択は no-op (FrameProvider 側で diff 検知)。
 */
function SpatialPinchBridge() {
  const pinch = useHandPinch()
  const { setFrame } = useFrame()
  let prevActive = false

  createEffect(() => {
    const cur = pinch()?.active ?? false
    if (cur && !prevActive) {
      const x = pinch()?.x
      if (x !== undefined) {
        if (x < 0.4) setFrame('dashboard')
        else if (x > 0.6) setFrame('reading')
        // dead-band (0.4 ≤ x ≤ 0.6): 何もしない
      }
    }
    prevActive = cur
  })

  return null
}

/**
 * Spatial zone の visual hint — pinch 位置が左 / 右 zone に入った時 highlight。
 *
 * 「どこで pinch すれば何が起きるか」 を空間的に可視化。 dead-band は何も表示しない
 * ことで「意図不明 = 何もしない」 が直感的に分かる。
 */
function SpatialPinchZones() {
  const pinch = useHandPinch()
  const x = (): number | null => pinch()?.x ?? null
  const inLeft = (): boolean => {
    const v = x()
    return v !== null && v < 0.4
  }
  const inRight = (): boolean => {
    const v = x()
    return v !== null && v > 0.6
  }

  return (
    <>
      <div class="docs-pinch-zone" data-side="left" data-active={inLeft()} aria-hidden="true">
        <span class="docs-pinch-zone-label">→ dashboard</span>
      </div>
      <div class="docs-pinch-zone" data-side="right" data-active={inRight()} aria-hidden="true">
        <span class="docs-pinch-zone-label">→ reading</span>
      </div>
    </>
  )
}

// =============================================================================
// Camera probe — VP / browser の camera 公開状況を画面で観察する diagnostic UI
// =============================================================================

interface VideoInputSummary {
  deviceId: string
  label: string
}

interface AssetLoadSummary {
  name: string
  transferSize: number
  encodedBodySize: number
  duration: number
}

function CameraProbe() {
  const [devices, setDevices] = createSignal<VideoInputSummary[] | null>(null)
  const [trackSettings, setTrackSettings] = createSignal<MediaTrackSettings | null>(null)
  const [trackLabel, setTrackLabel] = createSignal<string | null>(null)
  const [error, setError] = createSignal<string | null>(null)
  const [previewStream, setPreviewStream] = createSignal<MediaStream | null>(null)
  const [loading, setLoading] = createSignal(false)
  const [assetLoads, setAssetLoads] = createSignal<AssetLoadSummary[] | null>(null)
  let videoEl: HTMLVideoElement | undefined

  const stopPreview = (): void => {
    const tracks = previewStream()?.getTracks()
    if (tracks) {
      for (const t of tracks) t.stop()
    }
    setPreviewStream(null)
    if (videoEl) videoEl.srcObject = null
  }

  /**
   * 段階的に制約を緩めて getUserMedia を試行。 visionOS Safari では facingMode 制約
   * が厳しすぎて 2 度目以降に OverconstrainedError を出すケースを観察した (2026-05-03)。
   * 第一試行 → 第二試行 (制約なし) → 第三試行 (deviceId 直指定の最初の input) と
   * fallback。 全部失敗したら error として最後の message を返す。
   */
  const probe = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    stopPreview() // 既存の preview があれば閉じてから始める

    const attempts: Array<{ name: string; constraints: MediaStreamConstraints }> = [
      { name: 'facingMode user', constraints: { video: { facingMode: 'user' } } },
      { name: 'video: true', constraints: { video: true } },
    ]

    let stream: MediaStream | null = null
    const errors: string[] = []
    for (const attempt of attempts) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(attempt.constraints)
        if (stream) break
      } catch (err) {
        errors.push(`[${attempt.name}] ${formatVisionError(err)}`)
      }
    }

    // 第三試行: enumerateDevices で見つかった最初の videoinput を deviceId で直指定
    if (!stream) {
      try {
        const all = await navigator.mediaDevices.enumerateDevices()
        const firstVideo = all.find((d) => d.kind === 'videoinput')
        if (firstVideo?.deviceId) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: firstVideo.deviceId } },
          })
        } else {
          errors.push('[deviceId] no videoinput found via enumerateDevices')
        }
      } catch (err) {
        errors.push(`[deviceId exact] ${formatVisionError(err)}`)
      }
    }

    if (!stream) {
      setError(`All probe attempts failed:\n${errors.join('\n')}`)
      setLoading(false)
      return
    }

    try {
      setPreviewStream(stream)
      const track = stream.getVideoTracks()[0]
      if (track) {
        setTrackSettings(track.getSettings())
        setTrackLabel(track.label || '(no label)')
      }
      const all = await navigator.mediaDevices.enumerateDevices()
      const videoInputs = all
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({
          deviceId: d.deviceId.slice(0, 16),
          label: d.label || '(no label)',
        }))
      setDevices(videoInputs)
      const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const mp = entries
        .filter((e) => /tasks-vision|mediapipe|landmarker|wasm|jsdelivr/i.test(e.name))
        .map((e) => ({
          name: e.name.length > 70 ? `…${e.name.slice(-70)}` : e.name,
          transferSize: e.transferSize,
          encodedBodySize: e.encodedBodySize,
          duration: Math.round(e.duration),
        }))
      setAssetLoads(mp)
      requestAnimationFrame(() => {
        if (videoEl && stream) {
          videoEl.srcObject = stream
          videoEl.play().catch(() => {
            /* ignore autoplay rejection */
          })
        }
      })
    } catch (err) {
      setError(formatVisionError(err))
    } finally {
      setLoading(false)
    }
  }

  onCleanup(stopPreview)

  return (
    <div class="docs-camera-probe">
      <div class="docs-camera-probe-controls">
        <button
          type="button"
          class="creo-btn"
          data-variant="secondary"
          disabled={loading()}
          onClick={() => void probe()}
        >
          {loading() ? 'Probing...' : 'Probe cameras'}
        </button>
        <Show when={previewStream()}>
          <button
            type="button"
            class="creo-btn"
            data-variant="ghost"
            data-size="sm"
            onClick={stopPreview}
          >
            Stop preview
          </button>
        </Show>
      </div>
      <Show when={error()}>
        <pre class="docs-mediapipe-error">
          <strong>Probe error:</strong>
          {'\n'}
          {error()}
        </pre>
      </Show>
      <video
        ref={videoEl}
        class="docs-camera-probe-video"
        data-active={previewStream() !== null}
        autoplay
        muted
        playsinline
      />
      <Show when={trackSettings()}>
        <div class="docs-camera-probe-stats">
          <h4>Active video track</h4>
          <p class="docs-camera-probe-stat-line">
            <strong>label:</strong> <code>{trackLabel()}</code>
          </p>
          <p class="docs-camera-probe-stat-line">
            <strong>resolution:</strong>{' '}
            <code>
              {trackSettings()?.width ?? '?'}×{trackSettings()?.height ?? '?'}
            </code>
            {' · '}
            <strong>frameRate:</strong>{' '}
            <code>{trackSettings()?.frameRate?.toFixed(0) ?? '?'} fps</code>
          </p>
          <p class="docs-camera-probe-stat-line">
            <strong>facingMode:</strong> <code>{trackSettings()?.facingMode ?? '(none)'}</code>
            {' · '}
            <strong>aspectRatio:</strong>{' '}
            <code>{trackSettings()?.aspectRatio?.toFixed(3) ?? '?'}</code>
          </p>
          <details class="docs-camera-probe-details">
            <summary>raw settings</summary>
            <pre class="docs-code">{JSON.stringify(trackSettings(), null, 2)}</pre>
          </details>
        </div>
      </Show>
      <Show when={devices()}>
        <div class="docs-camera-probe-stats">
          <h4>Available video inputs ({devices()?.length})</h4>
          <ul class="docs-bullet-list">
            <For each={devices()}>
              {(d) => (
                <li>
                  <code>{d.label}</code> <small>({d.deviceId}…)</small>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
      <Show when={assetLoads()}>
        <div class="docs-camera-probe-stats">
          <h4>MediaPipe asset loads ({assetLoads()?.length})</h4>
          <Show when={assetLoads()?.length === 0}>
            <p class="docs-page-helper">
              MediaPipe asset 履歴なし。 Real MediaPipe demo を一度 Enable すると fetched
              履歴が見える。
            </p>
          </Show>
          <ul class="docs-bullet-list">
            <For each={assetLoads()}>
              {(e) => (
                <li>
                  <code>{e.name}</code>
                  <br />
                  <small>
                    transfer: {e.transferSize}B (decoded {e.encodedBodySize}B) · {e.duration}ms
                  </small>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  )
}

function RealVisionStatus(props: { onDisable: () => void }) {
  const pinch = useHandPinch()
  return (
    <div class="docs-vision-status">
      <span class="docs-vision-status-dot" data-active="true" />
      <span>
        Real MediaPipe — pinch <strong>{pinch()?.active ? 'YES' : 'no'}</strong>
        {pinch()
          ? ` · x=${pinch()?.x.toFixed(2)} y=${pinch()?.y.toFixed(2)}`
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

// =============================================================================
// Phase B-spatial-web demo — `<model>` element in FrameSlot (visionOS 26+)
// =============================================================================

/**
 * USDZ model URL — Apple Quick Look gallery の公開 USDZ を default に。
 * もし CORS / availability で動かない場合は `examples/docs/public/` 内に vendor して
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
