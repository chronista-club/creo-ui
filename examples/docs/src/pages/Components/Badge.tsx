import { A } from '@solidjs/router'
import {
  EditorHostProvider,
  EditorLayer,
  bind,
  select,
  signalTarget,
  string,
} from 'creoui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-variant',
    values: 'neutral / brand / success / warning / error / info',
    def: 'neutral',
    meaning: '色 hint、 semantic 系は color.semantic.* を使った tint',
  },
] as const

const TOKENS = [
  { slot: 'background (neutral)', token: 'color.surface.bg-subtle' },
  { slot: 'background (brand)', token: 'color.brand.primary-subtle' },
  {
    slot: 'background (semantic)',
    token: 'color.semantic.{success/warning/error/info} (20% tint)',
  },
  { slot: 'text color', token: 'color.text.secondary / brand / semantic.*' },
  { slot: 'padding', token: '2px × spacing.xs' },
  { slot: 'font-size', token: 'typography.size.s' },
  { slot: 'font-weight', token: 'typography.weight.medium' },
  { slot: 'border-radius', token: 'radius.full (pill)' },
] as const

export default function Badge() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Badge</h1>
        <p class="docs-page-lead">
          pill-shaped status / count / tag。 unread count / online status / version number / tag
          list 等の inline 強調に。 6 variant (neutral + 5 semantic)、 fully rounded (radius.full)、
          keyboard 不要 (interactive ではない)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Variants</div>
          <div class="docs-preview-grid">
            <span class="creo-badge">Neutral</span>
            <span class="creo-badge" data-variant="brand">
              Brand
            </span>
            <span class="creo-badge" data-variant="success">
              Success
            </span>
            <span class="creo-badge" data-variant="warning">
              Warning
            </span>
            <span class="creo-badge" data-variant="error">
              Error
            </span>
            <span class="creo-badge" data-variant="info">
              Info
            </span>
          </div>
          <div class="docs-preview-row-label">Use cases</div>
          <div class="docs-preview-grid">
            <span class="creo-badge" data-variant="brand">
              v0.14.0
            </span>
            <span class="creo-badge" data-variant="success">
              42
            </span>
            <span class="creo-badge" data-variant="warning">
              Beta
            </span>
            <span class="creo-badge">design-system</span>
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
            数字 only の badge (例: unread count) は <code>aria-label="3 件未読"</code>{' '}
            等の説明を持たせる
          </li>
          <li>
            装飾 only の badge は <code>aria-hidden="true"</code> でも OK
          </li>
          <li>color だけで意味を伝えない (icon + text を併用、 例: "Beta" 等の文字)</li>
          <li>interactive ではないので keyboard focus 不要 (button にする場合は別 component)</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Do / Don't</h2>
        <div class="docs-do-dont">
          <div class="docs-do">
            <h3>Do</h3>
            <ul class="docs-bullet-list">
              <li>短い text (1-3 word、 数字、 1 行)</li>
              <li>inline で大きさを揃える (font-size: sm 固定)</li>
              <li>semantic variant を意味通り使う (success = positive、 error = blocking)</li>
            </ul>
          </div>
          <div class="docs-dont">
            <h3>Don't</h3>
            <ul class="docs-bullet-list">
              <li>長い文を入れない (overflow + visual noise)</li>
              <li>interactive にしない (badge は status、 button は action)</li>
              <li>6 variant を超える色を作らない (semantic 系 5 + neutral で十分)</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle、 right panel から
          badge の variant (6 種) / text を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creoui-docs.badge-editor',
            }}
          >
            <BadgeEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<span class="creo-badge">Neutral</span>
<span class="creo-badge" data-variant="brand">v0.14.0</span>
<span class="creo-badge" data-variant="success">42</span>
<span class="creo-badge" data-variant="warning">Beta</span>
<span class="creo-badge" data-variant="error">Critical</span>
<span class="creo-badge" data-variant="info">New</span>`}</code>
        </pre>
      </section>
    </>
  )
}

type BadgeVariant = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info'

function BadgeEditorDemo() {
  const [variant, setVariant] = createSignal<BadgeVariant>('brand')
  const [text, setText] = createSignal('v0.14.0')

  bind({
    target: signalTarget('badge.variant', variant, (v) => setVariant(v as BadgeVariant)),
    control: select(['neutral', 'brand', 'success', 'warning', 'error', 'info'] as const),
    placement: { semantic: 'tool', group: 'badge', label: 'Variant', order: 1 },
  })
  bind({
    target: signalTarget('badge.text', text, setText),
    control: string('input'),
    placement: { semantic: 'tool', group: 'content', label: 'Text', order: 1 },
  })

  return (
    <div class="docs-playground-stage">
      <span class="creo-badge" data-variant={variant() === 'neutral' ? undefined : variant()}>
        {text()}
      </span>
    </div>
  )
}
