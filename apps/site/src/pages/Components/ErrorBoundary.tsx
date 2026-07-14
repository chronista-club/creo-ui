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
import EditorModeToggle from '../../ui/EditorModeToggle'

const PROPS = [
  {
    attr: 'role',
    values: '"alert"',
    def: '—',
    meaning: 'a11y 必須、 screen reader が即座に announce',
  },
  {
    attr: 'aria-live',
    values: '"assertive" / "polite"',
    def: 'assertive (推奨)',
    meaning: 'error は緊急性高い、 polite では assertive なし、 assertive で割り込み',
  },
  {
    attr: 'data-size',
    values: 's / m / l',
    def: 'm',
    meaning: '5 tier convention、 inline error なら s、 page-blocking error なら l',
  },
] as const

const TOKENS = [
  {
    slot: 'background (gradient)',
    token: 'semantic-error-subtle 70% + brand-primary-subtle 30% (linear 135deg)',
  },
  {
    slot: 'border',
    token: 'semantic-error 35% mix surface-border (subtle 強調)',
  },
  { slot: 'icon color', token: 'color.semantic.error (assertive)' },
  { slot: 'title color', token: 'color.semantic.error-text (subtle bg 上で readable)' },
  { slot: 'reason text', token: 'color.text.secondary' },
  { slot: 'border-radius', token: 'radius.l (modal-tier surface)' },
  { slot: 'padding', token: 'spacing.xl (l-size: spacing.xl × 1.5)' },
  { slot: 'icon size', token: 'typography.icon.l (l-size: xl)' },
  { slot: 'gap', token: 'spacing.s (l-size: spacing.m)' },
] as const

export default function ErrorBoundary() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.error-boundary-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Error boundary</h1>
        <p class="docs-page-lead">
          状態 polish primitive — semantic error 色 (subtle bg + text) と brand identity (primary
          subtle + family border) の <strong>dual layer</strong> で「壊れたが、 まだ Creo」 を
          articulate。 purely error-tinted は anonymity、 brand layer を残すことで Creo ecosystem
          internal の error と認識される。 詳細は <A href="/foundations/principles">Principles</A>{' '}
          原則 5 (Multi-platform parity) と原則 8 (a11y baseline)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground error boundary の size / technical detail / title
          / reason を即時編集できる。 Mode ON 中に playground を click するとその instance に field
          が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <ErrorBoundaryLivePreview />
          <div class="docs-preview-row-label">Default (medium)</div>
          <div class="creo-error-boundary" role="alert" aria-live="assertive">
            <span class="creo-error-boundary-icon" aria-hidden="true">
              ⚠
            </span>
            <h3 class="creo-error-boundary-title">Failed to load memory</h3>
            <p class="creo-error-boundary-reason">
              Network error: connection timeout after 30s. Check your VPN connection or retry.
            </p>
            <details class="creo-error-boundary-detail">
              <summary>Show technical detail</summary>
              <pre>
                {
                  'Error: ECONNRESET\n  at SurrealDBConnection.connect()\n  at MemoryRepository.find()\n  ... 4 more frames'
                }
              </pre>
            </details>
            <div class="creo-error-boundary-actions">
              <button type="button" class="creo-btn" data-variant="primary">
                Retry
              </button>
              <button type="button" class="creo-btn" data-variant="secondary">
                Go back
              </button>
            </div>
          </div>

          <div class="docs-preview-row-label">Small (inline)</div>
          <div class="creo-error-boundary" data-size="s" role="alert" aria-live="polite">
            <span class="creo-error-boundary-icon" aria-hidden="true">
              ⚠
            </span>
            <h3 class="creo-error-boundary-title">Failed to save</h3>
            <p class="creo-error-boundary-reason">Try again in a moment.</p>
            <div class="creo-error-boundary-actions">
              <button type="button" class="creo-btn" data-variant="primary" data-size="s">
                Retry
              </button>
            </div>
          </div>

          <div class="docs-preview-row-label">Large (page-blocking)</div>
          <div class="creo-error-boundary" data-size="l" role="alert" aria-live="assertive">
            <span class="creo-error-boundary-icon" aria-hidden="true">
              ✕
            </span>
            <h3 class="creo-error-boundary-title">Application crashed</h3>
            <p class="creo-error-boundary-reason">
              Unrecoverable error. Reload the page to recover, or report this incident to the
              support team.
            </p>
            <div class="creo-error-boundary-actions">
              <button type="button" class="creo-btn" data-variant="primary" data-size="l">
                Reload
              </button>
              <button type="button" class="creo-btn" data-variant="secondary" data-size="l">
                Report
              </button>
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
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            <code>role="alert"</code> 必須 — screen reader が即座に announce
          </li>
          <li>
            <code>aria-live="assertive"</code> (default) — error は緊急性高い、 polite だと screen
            reader 読み上げが遅延。 inline で軽い retry 可能 error は{' '}
            <code>aria-live="polite"</code> も可
          </li>
          <li>
            retry button は keyboard reachable (<code>creo-btn</code> の <code>:focus-visible</code>{' '}
            policy が apply、 詳細は <A href="/foundations/focus-ring">Focus Ring</A>)
          </li>
          <li>
            technical detail は collapsible (<code>&lt;details&gt;</code>) で default closed、 dev
            mode のみ open
          </li>
          <li>
            color contrast は semantic-error-text が semantic-error-subtle bg 上で WCAG AAA 確保 (8
            theme 全部)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">設計規約</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Dual layer aesthetic</strong> — semantic error (assertive) + brand identity
            (whisper) で「壊れたが、 まだ Creo」 を articulate
          </li>
          <li>
            <strong>Recovery affordance 必須</strong> — error だけでなく retry / reload / report の
            CTA を articulate (user が次の action を取れる状態に戻す)
          </li>
          <li>
            <strong>Reason は読みやすく</strong> — technical detail は detail 内 collapsible
            に隔離、 一次 reason は user-facing language で
          </li>
          <li>
            inline error と page-blocking error を size で articulate (s / m / l = inline / default
            / blocking)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`<!-- Default (m) error boundary -->
<div class="creo-error-boundary" role="alert" aria-live="assertive">
  <span class="creo-error-boundary-icon" aria-hidden="true"></span>
  <h3 class="creo-error-boundary-title">Failed to load</h3>
  <p class="creo-error-boundary-reason">Network error: timeout</p>
  <div class="creo-error-boundary-actions">
    <button class="creo-btn" data-variant="primary">Retry</button>
  </div>
</div>

<!-- With technical detail (dev mode) -->
<div class="creo-error-boundary" role="alert" aria-live="assertive">
  ...
  <details class="creo-error-boundary-detail">
    <summary>Show technical detail</summary>
    <pre>Error: ECONNRESET\n  at ...</pre>
  </details>
  ...
</div>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type ErrorBoundarySize = 's' | 'm' | 'l'

/**
 * Live preview の playground。editor-host の bind() で size / technical detail / title / reason
 * を inspector panel に生やし、stage の error boundary 自体を selectable にする (Mode ON で
 * click → その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function ErrorBoundaryLivePreview() {
  const [size, setSize] = createSignal<ErrorBoundarySize>('m')
  const [showDetail, setShowDetail] = createSignal(true)
  const [title, setTitle] = createSignal('Failed to load memory')
  const [reason, setReason] = createSignal(
    'Network error: connection timeout after 30s. Check your VPN connection or retry.',
  )

  const binders = [
    bind({
      target: signalTarget('error-boundary.size', size, (v) => setSize(v as ErrorBoundarySize)),
      control: select(['s', 'm', 'l'] as const),
      placement: { semantic: 'tool', group: 'error-boundary', label: 'Size', order: 1 },
    }),
    bind({
      target: signalTarget('error-boundary.detail', showDetail, setShowDetail),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'error-boundary', label: 'Technical detail', order: 2 },
    }),
    bind({
      target: signalTarget('error-boundary.title', title, setTitle),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Title', order: 1 },
    }),
    bind({
      target: signalTarget('error-boundary.reason', reason, setReason),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Reason', order: 2 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'error-boundary-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        <div
          ref={selectable}
          class="creo-error-boundary"
          data-size={size()}
          role="alert"
          aria-live="assertive"
        >
          <span class="creo-error-boundary-icon" aria-hidden="true">
            ⚠
          </span>
          <h3 class="creo-error-boundary-title">{title()}</h3>
          <p class="creo-error-boundary-reason">{reason()}</p>
          <Show when={showDetail()}>
            <details class="creo-error-boundary-detail">
              <summary>Show technical detail</summary>
              <pre>
                {
                  'Error: ECONNRESET\n  at SurrealDBConnection.connect()\n  at MemoryRepository.find()\n  ... 4 more frames'
                }
              </pre>
            </details>
          </Show>
          <div class="creo-error-boundary-actions">
            <button type="button" class="creo-btn" data-variant="primary">
              Retry
            </button>
            <button type="button" class="creo-btn" data-variant="secondary">
              Go back
            </button>
          </div>
        </div>
      </div>
      <EditorModeToggle />
    </>
  )
}
