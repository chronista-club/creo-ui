import {
  bind,
  boolean,
  EditorHostProvider,
  EditorLayer,
  select,
  signalTarget,
  string,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'
import EditorModeToggle from '../../ui/EditorModeToggle'

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
  { attr: 'data-size', values: 's / m / l', def: 'm', meaning: '5 tier convention 中央' },
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
  { slot: 'padding', token: 'spacing.s × spacing.m' },
  { slot: 'border-radius', token: 'radius.{xs/s/m}' },
  { slot: 'min-height', token: 'layout.target.{focus/tap}' },
] as const

export default function Input() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.input-editor',
      }}
    >
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
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground input の variant / size / placeholder / value /
          disabled を即時編集できる。 Mode ON 中に playground input を click するとその instance に
          field が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <InputLivePreview />
          <div class="docs-preview-row-label">Variants × Sizes</div>
          <div class="docs-preview-stack">
            <input class="creo-input" type="text" placeholder="Bordered s" data-size="s" />
            <input class="creo-input" type="text" placeholder="Bordered m (default)" />
            <input class="creo-input" type="text" placeholder="Bordered l" data-size="l" />
            <input class="creo-input" type="text" placeholder="Filled m" data-variant="filled" />
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
        <PropsTable rows={PROPS} />
      </section>

      <section>
        <h2 class="docs-section-title">Token reference</h2>
        <TokensTable rows={TOKENS} />
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
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Basic bordered -->
<label for="email">Email</label>
<input id="email" class="creo-input" type="email" placeholder="you@example.com">

<!-- Filled, large -->
<input class="creo-input" type="text" data-variant="filled" data-size="l">

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

      <EditorLayer />
    </EditorHostProvider>
  )
}

type InputVariant = 'bordered' | 'filled'
type InputSize = 's' | 'm' | 'l'

/**
 * Live preview の playground。editor-host の bind() で variant / size / placeholder / value /
 * disabled を inspector panel に生やし、stage の input 自体を selectable にする (Mode ON で click →
 * その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function InputLivePreview() {
  const [variant, setVariant] = createSignal<InputVariant>('bordered')
  const [size, setSize] = createSignal<InputSize>('m')
  const [placeholder, setPlaceholder] = createSignal('you@example.com')
  const [value, setValue] = createSignal('')
  const [disabled, setDisabled] = createSignal(false)

  const binders = [
    bind({
      target: signalTarget('input.variant', variant, (v) => setVariant(v as InputVariant)),
      control: select(['bordered', 'filled'] as const),
      placement: { semantic: 'tool', group: 'input', label: 'Variant', order: 1 },
    }),
    bind({
      target: signalTarget('input.size', size, (v) => setSize(v as InputSize)),
      control: select(['s', 'm', 'l'] as const),
      placement: { semantic: 'tool', group: 'input', label: 'Size', order: 2 },
    }),
    bind({
      target: signalTarget('input.disabled', disabled, setDisabled),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'input', label: 'Disabled', order: 3 },
    }),
    bind({
      target: signalTarget('input.placeholder', placeholder, setPlaceholder),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Placeholder', order: 1 },
    }),
    bind({
      target: signalTarget('input.value', value, setValue),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Value', order: 2 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'input-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        <input
          ref={selectable}
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
      <EditorModeToggle />
    </>
  )
}
