import { A } from '@solidjs/router'
import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
  select,
  signalTarget,
  string,
} from 'creo-ui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-variant',
    values: 'primary / secondary / ghost',
    def: 'primary',
    meaning: '視覚的強度',
  },
  { attr: 'data-size', values: 'sm / md / lg', def: 'md', meaning: '5-step rule 中央の md が標準' },
  {
    attr: 'disabled',
    values: '(boolean)',
    def: '—',
    meaning: 'native HTML、 pointer-events: none + opacity',
  },
  {
    attr: 'aria-pressed',
    values: '"true" / "false"',
    def: '—',
    meaning: 'toggle button 用、 active state 視覚化',
  },
] as const

const TOKENS = [
  { slot: 'background (primary)', token: 'color.brand.primary' },
  { slot: 'background (secondary)', token: 'color.surface.surface + color.surface.border' },
  { slot: 'background (ghost)', token: 'transparent + hover color.surface.bg-subtle' },
  { slot: 'label color', token: 'color.text.primary (inverse on primary: color.surface.bg-base)' },
  { slot: 'font-size', token: 'typography.size.{sm/md/lg}' },
  { slot: 'padding', token: 'spacing.{xs/sm/md} × spacing.{sm/md/lg}' },
  { slot: 'gap (icon + label)', token: 'layout.gap.tight' },
  { slot: 'border-radius', token: 'radius.sm' },
  { slot: 'min-height', token: 'layout.target.tap (md/lg) / focus (sm)' },
] as const

export default function Button() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Button</h1>
        <p class="docs-page-lead">
          User intent を起動する atomic action trigger。 typography と color token
          が最も目立つ形で出る "digital handshake" 的 element。 native <code>&lt;button&gt;</code>{' '}
          を CSS class で装飾、 pointer / keyboard / a11y は browser に任せる。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Variants × Sizes</div>
          <div class="docs-preview-grid">
            <button type="button" class="creo-btn" data-variant="primary" data-size="sm">
              Primary sm
            </button>
            <button type="button" class="creo-btn" data-variant="primary" data-size="md">
              Primary md
            </button>
            <button type="button" class="creo-btn" data-variant="primary" data-size="lg">
              Primary lg
            </button>
            <button type="button" class="creo-btn" data-variant="secondary" data-size="sm">
              Secondary sm
            </button>
            <button type="button" class="creo-btn" data-variant="secondary" data-size="md">
              Secondary md
            </button>
            <button type="button" class="creo-btn" data-variant="secondary" data-size="lg">
              Secondary lg
            </button>
            <button type="button" class="creo-btn" data-variant="ghost" data-size="sm">
              Ghost sm
            </button>
            <button type="button" class="creo-btn" data-variant="ghost" data-size="md">
              Ghost md
            </button>
            <button type="button" class="creo-btn" data-variant="ghost" data-size="lg">
              Ghost lg
            </button>
          </div>
          <div class="docs-preview-row-label">States</div>
          <div class="docs-preview-grid">
            <button type="button" class="creo-btn" data-variant="primary" disabled>
              Disabled
            </button>
            <button type="button" class="creo-btn" data-variant="ghost" aria-pressed="true">
              Toggle ON
            </button>
            <button type="button" class="creo-btn" data-variant="ghost" aria-pressed="false">
              Toggle OFF
            </button>
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
            semantic: <code>&lt;button&gt;</code> element を使う (<code>&lt;a&gt;</code>{' '}
            で見た目だけ真似しない)
          </li>
          <li>keyboard: Tab でフォーカス、 Enter / Space で activate (native 挙動)</li>
          <li>
            <code>:focus-visible</code> で focus ring を出す (pointer click では出さない)
          </li>
          <li>
            disabled: <code>disabled</code> 属性 (aria-disabled より真の disabled を優先)
          </li>
          <li>
            toggle: <code>aria-pressed="true" | "false"</code> を付与
          </li>
          <li>min tap size: md / lg は自動的に 44pt 以上 (Apple HIG)</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Do / Don't</h2>
        <div class="docs-do-dont">
          <div class="docs-do">
            <h3>Do</h3>
            <ul class="docs-bullet-list">
              <li>
                primary は page 内で <strong>最大 1 つ</strong> (明確な次アクション)
              </li>
              <li>secondary は代替アクション (キャンセル、 戻る)</li>
              <li>ghost は密度の高い UI (toolbar、 inline action)</li>
              <li>44pt tap target を守る</li>
            </ul>
          </div>
          <div class="docs-dont">
            <h3>Don't</h3>
            <ul class="docs-bullet-list">
              <li>primary を乱発しない (視覚的 hierarchy が崩れる)</li>
              <li>ghost を primary 的に使わない (起動の強度が弱い)</li>
              <li>
                button を link 代わりに使わない (別 resource へなら <code>&lt;a&gt;</code>)
              </li>
              <li>hardcode の px / 色を書かない</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle。 right panel から
          button の variant / size / disabled / label を即時編集できる。 token-driven の component
          が runtime で操作可能になる感触 (<A href="/concepts/editor-mode">Editor Mode protocol</A>{' '}
          dogfood) を試せる scope は この section 内のみ。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              shortcut: ['ctrl+shift+e', 'meta+shift+e'],
              exposeConsole: true,
              localStorageNamespace: 'creo-ui-docs.button-editor',
            }}
          >
            <ButtonEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Primary -->
<button type="button" class="creo-btn" data-variant="primary">保存</button>

<!-- Secondary, small -->
<button type="button" class="creo-btn" data-variant="secondary" data-size="sm">キャンセル</button>

<!-- Ghost, large, toggle -->
<button type="button" class="creo-btn" data-variant="ghost" data-size="lg" aria-pressed="true">
  Editor Mode ON
</button>

<!-- Disabled -->
<button type="button" class="creo-btn" data-variant="primary" disabled>Saving…</button>`}</code>
        </pre>
        <p class="docs-page-helper">
          詳細 spec:{' '}
          <a
            href="https://github.com/chronista-club/creo-ui/blob/main/docs/components/button.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/components/button.md ↗
          </a>
        </p>
      </section>
    </>
  )
}

function ButtonEditorDemo() {
  const [variant, setVariant] = createSignal<'primary' | 'secondary' | 'ghost'>('primary')
  const [size, setSize] = createSignal<'sm' | 'md' | 'lg'>('md')
  const [disabled, setDisabled] = createSignal(false)
  const [label, setLabel] = createSignal('Click me')

  bind({
    id: 'btn.variant',
    control: select({ options: ['primary', 'secondary', 'ghost'] as const }),
    target: signalTarget('btn.variant', variant, setVariant),
    initial: 'primary',
    semantic: 'tool',
    placement: { region: 'right', group: 'button', label: 'Variant', order: 1 },
  })
  bind({
    id: 'btn.size',
    control: select({ options: ['sm', 'md', 'lg'] as const }),
    target: signalTarget('btn.size', size, setSize),
    initial: 'md',
    semantic: 'tool',
    placement: { region: 'right', group: 'button', label: 'Size', order: 2 },
  })
  bind({
    id: 'btn.disabled',
    control: boolean({ variant: 'switch' }),
    target: signalTarget('btn.disabled', disabled, setDisabled),
    initial: false,
    semantic: 'tool',
    placement: { region: 'right', group: 'button', label: 'Disabled', order: 3 },
  })
  bind({
    id: 'btn.label',
    control: string({ variant: 'input' }),
    target: signalTarget('btn.label', label, setLabel),
    initial: 'Click me',
    semantic: 'content',
    placement: { region: 'right', group: 'content', label: 'Button label', order: 1 },
  })

  return (
    <div class="docs-playground-stage">
      <button
        type="button"
        class="creo-btn"
        data-variant={variant()}
        data-size={size()}
        disabled={disabled()}
      >
        {label()}
      </button>
    </div>
  )
}
