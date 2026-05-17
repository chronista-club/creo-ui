import { A } from '@solidjs/router'
import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
  signalTarget,
  string,
} from 'creoui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'name',
    values: '(string)',
    def: '—',
    meaning: '同 name の radio で 1 つのみ checked、 group を form する identifier',
  },
  {
    attr: 'value',
    values: '(string)',
    def: '—',
    meaning: 'submit 時の value、 form 内で必須',
  },
  {
    attr: 'checked',
    values: '(boolean)',
    def: '—',
    meaning: 'native HTML、 同 name group で初期 selected を指定',
  },
  {
    attr: 'disabled',
    values: '(boolean)',
    def: '—',
    meaning: 'native HTML、 opacity 0.5 + cursor not-allowed',
  },
] as const

const TOKENS = [
  { slot: 'accent (selected color)', token: 'color.brand.primary' },
  { slot: 'label color', token: 'color.text.primary' },
  { slot: 'gap (input + label)', token: 'layout.gap.tight' },
  { slot: 'font-size', token: 'typography.size.m' },
  { slot: 'focus ring', token: 'color.brand.primary (2px outline + 2px offset)' },
] as const

export default function Radio() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Radio</h1>
        <p class="docs-page-lead">
          排他選択 (同 group で 1 つのみ) の form input。 同 <code>name</code> 属性を持つ radio が
          group を成す。 <code>accent-color</code> で brand 色に染める。 同等代替の{' '}
          <code>creo-segmented</code> も別途あり (toggle group の見た目)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Group (vertical)</div>
          <div class="docs-preview-grid">
            <label class="creo-radio">
              <input type="radio" class="creo-radio-input" name="theme-demo" value="light" />
              <span>Light</span>
            </label>
            <label class="creo-radio">
              <input type="radio" class="creo-radio-input" name="theme-demo" value="dark" checked />
              <span>Dark (initial)</span>
            </label>
            <label class="creo-radio">
              <input type="radio" class="creo-radio-input" name="theme-demo" value="auto" />
              <span>Auto</span>
            </label>
          </div>
          <div class="docs-preview-row-label">Disabled</div>
          <div class="docs-preview-grid">
            <label class="creo-radio">
              <input type="radio" class="creo-radio-input" name="d-demo" disabled />
              <span>Disabled</span>
            </label>
            <label class="creo-radio">
              <input type="radio" class="creo-radio-input" name="d-demo" disabled checked />
              <span>Disabled selected</span>
            </label>
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
            同 <code>name</code> で group 化、 keyboard arrow keys で同 group 内移動 (native)
          </li>
          <li>
            group 全体に <code>&lt;fieldset&gt;</code> + <code>&lt;legend&gt;</code> で見出しを
            (推奨)
          </li>
          <li>Tab は group 単位 (group に入る/出る)、 group 内は arrow で navigate (native)</li>
          <li>Space で activate (focus 中の radio が selected)</li>
          <li>必ず 1 つは selected を default で持たせる (none = unsubmitted form)</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle、 right panel から
          single radio の checked / disabled / label を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。 group 全体の dogfood
          は scope 大のため single radio で示す。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creoui-docs.radio-editor',
            }}
          >
            <RadioEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<fieldset>
  <legend>Theme</legend>

  <label class="creo-radio">
    <input type="radio" class="creo-radio-input" name="theme" value="light" />
    <span>Light</span>
  </label>

  <label class="creo-radio">
    <input type="radio" class="creo-radio-input" name="theme" value="dark" checked />
    <span>Dark</span>
  </label>

  <label class="creo-radio">
    <input type="radio" class="creo-radio-input" name="theme" value="auto" />
    <span>Auto</span>
  </label>
</fieldset>`}</code>
        </pre>
      </section>
    </>
  )
}

function RadioEditorDemo() {
  const [checked, setChecked] = createSignal(true)
  const [disabled, setDisabled] = createSignal(false)
  const [label, setLabel] = createSignal('Light')

  bind({
    target: signalTarget('radio.checked', checked, setChecked),
    control: boolean({ variant: 'switch' }),
    placement: { semantic: 'tool', group: 'radio', label: 'Checked', order: 1 },
  })
  bind({
    target: signalTarget('radio.disabled', disabled, setDisabled),
    control: boolean({ variant: 'switch' }),
    placement: { semantic: 'tool', group: 'radio', label: 'Disabled', order: 2 },
  })
  bind({
    target: signalTarget('radio.label', label, setLabel),
    control: string('input'),
    placement: { semantic: 'tool', group: 'content', label: 'Label', order: 1 },
  })

  return (
    <div class="docs-playground-stage">
      <label class="creo-radio">
        <input
          type="radio"
          class="creo-radio-input"
          name="radio-editor-demo"
          checked={checked()}
          disabled={disabled()}
        />
        <span>{label()}</span>
      </label>
    </div>
  )
}
