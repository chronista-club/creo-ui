import { CUButton } from '@chronista-club/creo-ui/controls'
import {
  bind,
  boolean,
  EditorHostProvider,
  EditorLayer,
  select,
  signalTarget,
  string,
  useEditorHost,
  useEditorMode,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'

const PROPS = [
  {
    attr: 'list (on <input>)',
    values: '(datalist id)',
    def: '—',
    meaning: 'native HTML、 input と <datalist> を関連付け、 option suggestion を起動',
  },
  {
    attr: '<datalist id>',
    values: '(string)',
    def: '—',
    meaning: '対応 <input list> から参照される option container',
  },
  {
    attr: '<option value>',
    values: '(string)',
    def: '—',
    meaning: 'suggestion 候補、 textContent で 表示 label',
  },
] as const

const TOKENS = [
  { slot: '(consumes input tokens)', token: 'creo-input style 全部' },
  { slot: 'datalist suggestion bg', token: 'browser default (UA stylesheet)' },
  { slot: 'datalist option text', token: 'color.text.primary' },
  { slot: 'border (focus)', token: 'color.brand.primary 2px (input と同 token)' },
] as const

export default function Combobox() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.combobox-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Combobox</h1>
        <p class="docs-page-lead">
          input + suggestion list の組合せ — type-ahead で候補を絞り込む UI。 native HTML{' '}
          <code>&lt;input list="..."&gt;</code> + <code>&lt;datalist&gt;</code> で実装、 keyboard /
          a11y / open-close は browser 自動、 JS-zero。 自前 dropdown より軽量、 OS UA stylesheet
          を尊重するため Apple HIG / GNOME / Windows native 準拠。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground combobox の variant / size / disabled / label /
          placeholder を即時編集できる。 Mode ON 中に playground input を click するとその instance
          に field が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A>{' '}
          の dogfood。
        </p>
        <div class="docs-component-preview">
          <ComboboxLivePreview />
          <div class="docs-preview-row-label">Country picker</div>
          <div class="creo-form-field">
            <label class="creo-form-field-label" for="country">
              Country
            </label>
            <input
              class="creo-input"
              id="country"
              type="text"
              list="country-list"
              placeholder="Type to search…"
            />
            <datalist id="country-list">
              <option value="Japan" />
              <option value="United States" />
              <option value="United Kingdom" />
              <option value="Germany" />
              <option value="France" />
              <option value="Brazil" />
              <option value="India" />
              <option value="Korea" />
              <option value="China" />
              <option value="Italy" />
            </datalist>
            <p class="creo-helper-text">
              type で suggestion 表示、 free text 入力も可 (国名以外も入力可能)
            </p>
          </div>

          <div class="docs-preview-row-label">Browser shortcut (filled variant + s)</div>
          <div class="creo-form-field">
            <label class="creo-form-field-label" for="cmd">
              Command
            </label>
            <input
              class="creo-input"
              id="cmd"
              data-variant="filled"
              data-size="s"
              type="text"
              list="cmd-list"
              placeholder=":save / :run / :build…"
            />
            <datalist id="cmd-list">
              <option value=":save" />
              <option value=":run" />
              <option value=":build" />
              <option value=":test" />
              <option value=":publish" />
              <option value=":deploy" />
            </datalist>
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
        <h2 class="docs-section-title">Combobox vs Select vs Menu</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Combobox</strong> — input + suggestion、 free text 入力可、 type-ahead 検索
          </li>
          <li>
            <strong>Select</strong> — 固定 option から 1 つ、 free text 不可 (将来 native
            &lt;select&gt; wrap で対応予定)
          </li>
          <li>
            <strong>Menu</strong> — action 群 (click で実行)、 input でない
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            native <code>&lt;input list&gt;</code> + <code>&lt;datalist&gt;</code> → keyboard /
            arrow / Enter は all-browser 自動
          </li>
          <li>
            <code>&lt;label for&gt;</code> + <code>id</code> で input と関連付け (form-field と 同
            a11y rule)
          </li>
          <li>UA stylesheet で OS native dropdown が出る (Mac = Native pop、 Win = list 等)</li>
          <li>option 数 ≤ 100 が実用、 大規模は server-side filter + custom UI 検討</li>
          <li>
            datalist は visual customization 不可 (browser 制御)、 styling 必要なら別 component
            (将来)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<label for="country">Country</label>
<input class="creo-input" id="country" type="text" list="countries"
       placeholder="Type to search…" />

<datalist id="countries">
  <option value="Japan"></option>
  <option value="United States"></option>
  <option value="Germany"></option>
  <option value="France"></option>
  ...
</datalist>

<!-- With form-field wrapper + helper text -->
<div class="creo-form-field">
  <label class="creo-form-field-label" for="lang">Language</label>
  <input class="creo-input" id="lang" list="langs" />
  <datalist id="langs">
    <option value="TypeScript"></option>
    <option value="Rust"></option>
    <option value="Swift"></option>
  </datalist>
  <p class="creo-helper-text">type-ahead で suggestion、 free text も可</p>
</div>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type InputVariant = 'bordered' | 'filled'
type InputSize = 's' | 'm' | 'l'

/**
 * Live preview の playground。editor-host の bind() で variant / size / disabled / label /
 * placeholder を inspector panel に生やし、stage の input 自体を selectable にする (Mode ON で
 * click → その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function ComboboxLivePreview() {
  const host = useEditorHost()
  const mode = useEditorMode()

  const [variant, setVariant] = createSignal<InputVariant>('bordered')
  const [size, setSize] = createSignal<InputSize>('m')
  const [disabled, setDisabled] = createSignal(false)
  const [label, setLabel] = createSignal('Language')
  const [placeholder, setPlaceholder] = createSignal('Type to search…')

  const binders = [
    bind({
      target: signalTarget('combobox.variant', variant, (v) => setVariant(v as InputVariant)),
      control: select(['bordered', 'filled'] as const),
      placement: { semantic: 'tool', group: 'combobox', label: 'Variant', order: 1 },
    }),
    bind({
      target: signalTarget('combobox.size', size, (v) => setSize(v as InputSize)),
      control: select(['s', 'm', 'l'] as const),
      placement: { semantic: 'tool', group: 'combobox', label: 'Size', order: 2 },
    }),
    bind({
      target: signalTarget('combobox.disabled', disabled, setDisabled),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'combobox', label: 'Disabled', order: 3 },
    }),
    bind({
      target: signalTarget('combobox.label', label, setLabel),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Field label', order: 1 },
    }),
    bind({
      target: signalTarget('combobox.placeholder', placeholder, setPlaceholder),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Placeholder', order: 2 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'combobox-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="cu-row cu-center docs-playground-stage">
        <div class="creo-form-field" style={{ width: '100%', 'max-width': '360px' }}>
          <label class="creo-form-field-label" for="combobox-playground">
            {label()}
          </label>
          <input
            ref={selectable}
            class="creo-input"
            id="combobox-playground"
            type="text"
            list="combobox-playground-list"
            data-variant={variant() === 'filled' ? 'filled' : undefined}
            data-size={size()}
            disabled={disabled()}
            placeholder={placeholder()}
          />
          <datalist id="combobox-playground-list">
            <option value="TypeScript" />
            <option value="Rust" />
            <option value="Swift" />
            <option value="SolidJS" />
            <option value="OKLCH" />
            <option value="Style Dictionary" />
          </datalist>
        </div>
      </div>
      <div class="cu-row cu-gap-s cu-center docs-preview-grid">
        <CUButton variant="ghost" size="s" pressed={mode() === 'on'} onClick={() => host.toggle()}>
          Editor Mode: {mode() === 'on' ? 'ON' : 'OFF'}
        </CUButton>
      </div>
    </>
  )
}
