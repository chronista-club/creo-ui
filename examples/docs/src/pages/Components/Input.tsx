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
    attr: 'type',
    values: 'text / email / password / number / search / url / tel',
    def: 'text',
    meaning: 'native HTML input type',
  },
  {
    attr: 'data-variant',
    values: 'bordered / filled',
    def: 'bordered',
    meaning: '視覚的 emphasis',
  },
  { attr: 'data-size', values: 'sm / md / lg', def: 'md', meaning: '5-step rule 中央' },
  {
    attr: 'data-state',
    values: 'default / error',
    def: 'default',
    meaning: 'validation state (aria-invalid と連動)',
  },
  {
    attr: 'disabled / readonly / required',
    values: '(boolean)',
    def: '—',
    meaning: 'native HTML 属性',
  },
] as const

const TOKENS = [
  { slot: 'background (bordered)', token: 'color.surface.surface' },
  { slot: 'background (filled)', token: 'color.surface.bg-subtle' },
  { slot: 'border (default)', token: 'color.surface.border 1px' },
  { slot: 'border (focus)', token: 'color.brand.primary 2px' },
  { slot: 'border (error)', token: 'color.semantic.error 1.5px' },
  { slot: 'text', token: 'color.text.primary' },
  { slot: 'placeholder', token: 'color.text.tertiary' },
  { slot: 'padding', token: 'spacing.sm × spacing.md' },
  { slot: 'border-radius', token: 'radius.{xs/sm/md}' },
  { slot: 'min-height', token: 'layout.target.{focus/tap}' },
] as const

export default function Input() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Input</h1>
        <p class="docs-page-lead">
          single-line text field (native <code>&lt;input&gt;</code>)。 form の主役。 Creo aesthetic
          では "輪郭の柔らかさ + focus 時のはっきりした意思" を両立。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Variants × Sizes</div>
          <div class="docs-preview-stack">
            <input class="creo-input" type="text" placeholder="Bordered sm" data-size="sm" />
            <input class="creo-input" type="text" placeholder="Bordered md (default)" />
            <input class="creo-input" type="text" placeholder="Bordered lg" data-size="lg" />
            <input class="creo-input" type="text" placeholder="Filled md" data-variant="filled" />
          </div>
          <div class="docs-preview-row-label">States</div>
          <div class="docs-preview-stack">
            <input
              class="creo-input"
              type="text"
              data-state="error"
              aria-invalid="true"
              placeholder="Error state"
            />
            <input class="creo-input" type="text" disabled value="Disabled" />
            <input class="creo-input" type="text" readonly value="Read only" />
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
            必ず <code>&lt;label for="id"&gt;</code> を関連付ける (implicit / explicit どちらでも)
          </li>
          <li>
            error state は <code>aria-invalid="true"</code> + <code>aria-describedby</code>{' '}
            でメッセージを関連付け
          </li>
          <li>placeholder を label 代わりに使わない (focus 時に消えて context が失われる)</li>
          <li>
            autocomplete 属性を適切に (<code>email</code> / <code>current-password</code> 等)
          </li>
          <li>error は色だけで示さない (色覚多様性配慮、 aria-invalid + icon 併用)</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle、 right panel から
          input の variant / size / placeholder / value / disabled を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creo-ui-docs.input-editor',
            }}
          >
            <InputEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Basic bordered -->
<label for="email">Email</label>
<input id="email" class="creo-input" type="email" placeholder="you@example.com">

<!-- Filled, large -->
<input class="creo-input" type="text" data-variant="filled" data-size="lg">

<!-- Error state -->
<input
  class="creo-input"
  type="text"
  data-state="error"
  aria-invalid="true"
  aria-describedby="pw-err"
>
<p id="pw-err" class="creo-helper-text creo-helper-text--error">パスワードが短すぎます</p>`}</code>
        </pre>
        <p class="docs-page-helper">
          詳細 spec:{' '}
          <a
            href="https://github.com/chronista-club/creo-ui/blob/main/docs/components/input.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/components/input.md ↗
          </a>
        </p>
      </section>
    </>
  )
}

type InputVariant = 'bordered' | 'filled'
type InputSize = 'sm' | 'md' | 'lg'

function InputEditorDemo() {
  const [variant, setVariant] = createSignal<InputVariant>('bordered')
  const [size, setSize] = createSignal<InputSize>('md')
  const [placeholder, setPlaceholder] = createSignal('you@example.com')
  const [value, setValue] = createSignal('')
  const [disabled, setDisabled] = createSignal(false)

  bind({
    target: signalTarget('input.variant', variant, (v) => setVariant(v as InputVariant)),
    control: select(['bordered', 'filled'] as const),
    placement: { semantic: 'tool', group: 'input', label: 'Variant', order: 1 },
  })
  bind({
    target: signalTarget('input.size', size, (v) => setSize(v as InputSize)),
    control: select(['sm', 'md', 'lg'] as const),
    placement: { semantic: 'tool', group: 'input', label: 'Size', order: 2 },
  })
  bind({
    target: signalTarget('input.disabled', disabled, setDisabled),
    control: boolean({ variant: 'switch' }),
    placement: { semantic: 'tool', group: 'input', label: 'Disabled', order: 3 },
  })
  bind({
    target: signalTarget('input.placeholder', placeholder, setPlaceholder),
    control: string('input'),
    placement: { semantic: 'tool', group: 'content', label: 'Placeholder', order: 1 },
  })
  bind({
    target: signalTarget('input.value', value, setValue),
    control: string('input'),
    placement: { semantic: 'tool', group: 'content', label: 'Value', order: 2 },
  })

  return (
    <div class="docs-playground-stage">
      <input
        class="creo-input"
        type="text"
        data-variant={variant() === 'bordered' ? undefined : variant()}
        data-size={size()}
        placeholder={placeholder()}
        value={value()}
        disabled={disabled()}
        onInput={(e) => setValue(e.currentTarget.value)}
      />
    </div>
  )
}
