import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
  select,
  signalTarget,
  string,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { A } from '@solidjs/router'
import { Show, createSignal } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'
import EditorModeToggle from '../../ui/EditorModeToggle'

const PROPS = [
  {
    attr: 'data-placement (on .creo-toast-region)',
    values:
      'top-right (default) / top-left / top-center / bottom-right / bottom-left / bottom-center',
    def: 'top-right',
    meaning: 'toast 集合の出現位置、 region 1 つで 1 placement',
  },
  {
    attr: 'data-variant (on .creo-toast)',
    values: 'info / success / warning / error / neutral',
    def: 'neutral',
    meaning: 'icon + accent 色の semantic hint',
  },
  {
    attr: 'role="status" / "alert"',
    values: 'WAI-ARIA',
    def: '—',
    meaning: 'severity に応じて — info/success → status、 warning/error → alert',
  },
] as const

const TOKENS = [
  { slot: 'background', token: 'color.surface.surface + shadow.l' },
  { slot: 'border', token: 'color.surface.border 1px' },
  { slot: 'icon (semantic)', token: 'color.semantic.{info/success/warning/error}' },
  { slot: 'border-radius', token: 'radius.m' },
  { slot: 'padding', token: 'spacing.s × spacing.m' },
  { slot: 'gap (icon + content)', token: 'spacing.s' },
  { slot: 'region offset', token: 'spacing.l (画面端からの距離)' },
  { slot: 'max-width', token: '420px (適切な readability)' },
] as const

export default function Toast() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.toast-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Toast</h1>
        <p class="docs-page-lead">
          時間で消える transient notification (3-5 秒)、 successful action の feedback / non-
          blocking error 等。 portal で画面端に出現、 6 placement 選択可。 Alert (永続) と異なり
          "見逃しても良い" 軽い情報、 重要決定は Dialog を使う。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground toast の variant / icon / close button / title /
          message を即時編集できる。 Mode ON 中に playground toast を click するとその instance に
          field が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <ToastLivePreview />
          <div class="docs-preview-row-label">5 variants (inline showcase、 真の portal は別)</div>
          <div class="docs-preview-stack" style={{ 'max-width': '420px', gap: 'var(--spacing-s)' }}>
            <div class="creo-toast" data-variant="info" role="status">
              <span class="creo-toast-icon" aria-hidden="true">
                ℹ
              </span>
              <div class="creo-toast-content">
                <strong>Info:</strong> Tokens v0.14.0 がリリースされました。
              </div>
              <button type="button" class="creo-toast-close" aria-label="閉じる">
                ✕
              </button>
            </div>
            <div class="creo-toast" data-variant="success" role="status">
              <span class="creo-toast-icon" aria-hidden="true">
                ✓
              </span>
              <div class="creo-toast-content">
                <strong>Saved:</strong> 設定が保存されました。
              </div>
              <button type="button" class="creo-toast-close" aria-label="閉じる">
                ✕
              </button>
            </div>
            <div class="creo-toast" data-variant="warning" role="alert">
              <span class="creo-toast-icon" aria-hidden="true">
                ⚠
              </span>
              <div class="creo-toast-content">
                <strong>Heads up:</strong> 接続が不安定です。
              </div>
              <button type="button" class="creo-toast-close" aria-label="閉じる">
                ✕
              </button>
            </div>
            <div class="creo-toast" data-variant="error" role="alert">
              <span class="creo-toast-icon" aria-hidden="true">
                ✕
              </span>
              <div class="creo-toast-content">
                <strong>Error:</strong> 保存に失敗しました。 再試行してください。
              </div>
              <button type="button" class="creo-toast-close" aria-label="閉じる">
                ✕
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Props</h2>
        <PropsTable rows={PROPS} />
      </section>

      <section>
        <h2 class="docs-section-title">Token reference</h2>
        <TokensTable rows={TOKENS} />
      </section>

      <section>
        <h2 class="docs-section-title">Toast vs Alert vs Dialog</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Toast</strong> — 時間で消える、 軽い feedback、 user 対応不要 (見逃しても OK)
          </li>
          <li>
            <strong>Alert</strong> — 永続、 page 内 banner、 user dismiss するまで残る
          </li>
          <li>
            <strong>Dialog</strong> — modal、 user 注意 hijack、 重要決定 (削除確認等)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            severity に応じた role: <code>status</code> (info/success、 polite) / <code>alert</code>{' '}
            (warning/error、 即時)
          </li>
          <li>
            icon は <code>aria-hidden</code>、 text と必ず併記 (色 only NG)
          </li>
          <li>
            close button は <code>aria-label="閉じる"</code> 必須 (icon-only)
          </li>
          <li>auto-dismiss 時間は user dismiss を妨げない (hover で pause、 focus 中は extend)</li>
          <li>多 stack 時 (3+) は old toast 上に新規 stack、 古いものを fade-out</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Region (1 placement = 1 region、 通常 portal で body 直下) -->
<div class="creo-toast-region" data-placement="top-right">

  <!-- Toast (success) -->
  <div class="creo-toast" data-variant="success" role="status">
    <span class="creo-toast-icon" aria-hidden="true">✓</span>
    <div class="creo-toast-content">
      <strong>Saved:</strong> 設定が保存されました
    </div>
    <button type="button" class="creo-toast-close" aria-label="閉じる">✕</button>
  </div>

  <!-- Toast (error、 即時通知) -->
  <div class="creo-toast" data-variant="error" role="alert">
    <span class="creo-toast-icon" aria-hidden="true">✕</span>
    <div class="creo-toast-content">
      <strong>Error:</strong> 接続失敗
    </div>
    <button type="button" class="creo-toast-close" aria-label="閉じる">✕</button>
  </div>

</div>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type ToastVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error'

const TOAST_ICONS: Record<ToastVariant, string> = {
  neutral: '•',
  info: 'ℹ',
  success: '✓',
  warning: '⚠',
  error: '✕',
}

/**
 * Live preview の playground。editor-host の bind() で variant / icon / close button /
 * title / message を inspector panel に生やし、stage の toast 自体を selectable にする
 * (Mode ON で click → その instance に field が絞られる)。portal は使わず inline 表示
 * (既存 showcase と同形)。provider はページ root の 1 枚を共有。
 */
function ToastLivePreview() {
  const [variant, setVariant] = createSignal<ToastVariant>('success')
  const [showIcon, setShowIcon] = createSignal(true)
  const [showClose, setShowClose] = createSignal(true)
  const [title, setTitle] = createSignal('Saved:')
  const [message, setMessage] = createSignal('設定が保存されました。')

  const binders = [
    bind({
      target: signalTarget('toast.variant', variant, (v) => setVariant(v as ToastVariant)),
      control: select(['neutral', 'info', 'success', 'warning', 'error'] as const),
      placement: { semantic: 'tool', group: 'toast', label: 'Variant', order: 1 },
    }),
    bind({
      target: signalTarget('toast.showIcon', showIcon, setShowIcon),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'toast', label: 'Icon', order: 2 },
    }),
    bind({
      target: signalTarget('toast.showClose', showClose, setShowClose),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'toast', label: 'Close button', order: 3 },
    }),
    bind({
      target: signalTarget('toast.title', title, setTitle),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Title', order: 1 },
    }),
    bind({
      target: signalTarget('toast.message', message, setMessage),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Message', order: 2 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'toast-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        <div
          class="creo-toast"
          data-variant={variant()}
          role={variant() === 'warning' || variant() === 'error' ? 'alert' : 'status'}
          style={{ width: '100%', 'max-width': '420px' }}
          ref={selectable}
        >
          <Show when={showIcon()}>
            <span class="creo-toast-icon" aria-hidden="true">
              {TOAST_ICONS[variant()]}
            </span>
          </Show>
          <div class="creo-toast-content">
            <strong>{title()}</strong> {message()}
          </div>
          <Show when={showClose()}>
            <button type="button" class="creo-toast-close" aria-label="閉じる">
              ✕
            </button>
          </Show>
        </div>
      </div>
      <EditorModeToggle />
    </>
  )
}
