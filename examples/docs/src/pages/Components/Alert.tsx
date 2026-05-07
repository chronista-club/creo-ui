import { A } from '@solidjs/router'
import {
  EditorHostProvider,
  EditorLayer,
  bind,
  select,
  signalTarget,
  string,
} from 'creo-ui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-variant',
    values: 'info / success / warning / error',
    def: 'info',
    meaning: '色 + icon hint、 semantic 系の 15% tint background + 30% border',
  },
  {
    attr: 'role',
    values: '"alert" / "status"',
    def: '—',
    meaning: 'screen reader 通知。 error/warning は alert (即時)、 info/success は status',
  },
] as const

const TOKENS = [
  { slot: 'background', token: 'color.semantic.{info/success/warning/error} (15% tint)' },
  { slot: 'border', token: 'color.semantic.* (30% tint)' },
  { slot: 'icon color', token: 'color.semantic.* (full)' },
  { slot: 'text color', token: 'color.text.primary' },
  { slot: 'padding', token: 'spacing.s × spacing.m' },
  { slot: 'gap (icon + content)', token: 'spacing.s' },
  { slot: 'border-radius', token: 'radius.m' },
  { slot: 'font-size', token: 'typography.size.m' },
] as const

export default function Alert() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Alert</h1>
        <p class="docs-page-lead">
          inline persistent status — 永続的に画面に残る通知 (toast と違い時間で消えない)。 form
          validation summary / page header / banner-like 用途に。 4 variant (info / success /
          warning / error)、 各々 15% tint bg + 30% border の透過レイヤー、 dark/light theme
          自動追従。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Variants</div>
          <div
            class="docs-preview-grid"
            style={{ 'grid-template-columns': '1fr', gap: 'var(--spacing-s)' }}
          >
            <div class="creo-alert" data-variant="info" role="status">
              <span class="creo-alert-icon" aria-hidden="true">
                ℹ
              </span>
              <div class="creo-alert-content">
                <strong>Info:</strong> Tokens v0.14.0 がリリースされました。
              </div>
            </div>
            <div class="creo-alert" data-variant="success" role="status">
              <span class="creo-alert-icon" aria-hidden="true">
                ✓
              </span>
              <div class="creo-alert-content">
                <strong>Success:</strong> 設定が保存されました。
              </div>
            </div>
            <div class="creo-alert" data-variant="warning" role="alert">
              <span class="creo-alert-icon" aria-hidden="true">
                ⚠
              </span>
              <div class="creo-alert-content">
                <strong>Warning:</strong> この操作は取り消せません。
              </div>
            </div>
            <div class="creo-alert" data-variant="error" role="alert">
              <span class="creo-alert-icon" aria-hidden="true">
                ✕
              </span>
              <div class="creo-alert-content">
                <strong>Error:</strong> ネットワークに接続できませんでした。 再試行してください。
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Props</h2>
        <div class="docs-props-table">
          <div class="docs-props-row docs-props-head">
            <div>Attribute</div>
            <div>Values</div>
            <div>Default</div>
            <div>Meaning</div>
          </div>
          {PROPS.map((p) => (
            <div class="docs-props-row">
              <code>{p.attr}</code>
              <code>{p.values}</code>
              <code>{p.def}</code>
              <span>{p.meaning}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Token reference</h2>
        <div class="docs-tokens-table">
          {TOKENS.map((t) => (
            <div class="docs-tokens-row">
              <span class="docs-tokens-slot">{t.slot}</span>
              <code class="docs-tokens-name">{t.token}</code>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Alert vs Toast</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Alert</strong> — page 内に permanent / persistent、 user が dismiss するまで
            残る。 form summary / page banner
          </li>
          <li>
            <strong>Toast</strong> — 時間で消える transient notification (3-5 秒)、 successful
            action の feedback。 page 上に portal で出現
          </li>
          <li>「画面に残ってないと困る」 なら alert、 「行動の補足だけ」 なら toast</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            <code>role="alert"</code> — 緊急 (warning / error) 即時通知、 screen reader 即読
          </li>
          <li>
            <code>role="status"</code> — 緩やか (info / success) 通知、 polite read
          </li>
          <li>
            icon は <code>aria-hidden="true"</code> + <strong>必ず文字も併記</strong> (色 only NG)
          </li>
          <li>
            dismiss button があるなら <code>aria-label="閉じる"</code>
          </li>
          <li>
            error variant は form invalid summary としても使える (focus を最初の error field に)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle、 right panel から
          alert の variant / strong / body を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。 role は variant に
          応じて自動 (warning/error → "alert"、 info/success → "status")。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creo-ui-docs.alert-editor',
            }}
          >
            <AlertEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Info -->
<div class="creo-alert" data-variant="info" role="status">
  <span class="creo-alert-icon" aria-hidden="true">ℹ</span>
  <div class="creo-alert-content">
    <strong>Tip:</strong> Ctrl+S で保存できます。
  </div>
</div>

<!-- Error (即時通知) -->
<div class="creo-alert" data-variant="error" role="alert">
  <span class="creo-alert-icon" aria-hidden="true">✕</span>
  <div class="creo-alert-content">
    <strong>Error:</strong> 入力に誤りがあります。
  </div>
</div>`}</code>
        </pre>
      </section>
    </>
  )
}

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

function AlertEditorDemo() {
  const [variant, setVariant] = createSignal<AlertVariant>('info')
  const [strongText, setStrongText] = createSignal('Tip:')
  const [bodyText, setBodyText] = createSignal('Ctrl+S で保存できます。')

  bind({
    target: signalTarget('alert.variant', variant, (v) => setVariant(v as AlertVariant)),
    control: select(['info', 'success', 'warning', 'error'] as const),
    placement: { semantic: 'tool', group: 'alert', label: 'Variant', order: 1 },
  })
  bind({
    target: signalTarget('alert.strong', strongText, setStrongText),
    control: string('input'),
    placement: { semantic: 'tool', group: 'content', label: 'Strong text', order: 1 },
  })
  bind({
    target: signalTarget('alert.body', bodyText, setBodyText),
    control: string('textarea'),
    placement: { semantic: 'tool', group: 'content', label: 'Body text', order: 2 },
  })

  // role mapping: warning/error → alert (即時)、 info/success → status (polite)
  const role = (): 'alert' | 'status' =>
    variant() === 'warning' || variant() === 'error' ? 'alert' : 'status'
  const icon = (): string => {
    if (variant() === 'success') return '✓'
    if (variant() === 'warning') return '⚠'
    if (variant() === 'error') return '✕'
    return 'ℹ'
  }

  return (
    <div class="docs-playground-stage">
      <div class="creo-alert" data-variant={variant()} role={role()}>
        <span class="creo-alert-icon" aria-hidden="true">
          {icon()}
        </span>
        <div class="creo-alert-content">
          <strong>{strongText()}</strong> {bodyText()}
        </div>
      </div>
    </div>
  )
}
