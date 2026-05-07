import { A } from '@solidjs/router'
import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
  signalTarget,
  string,
} from 'creo-ui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'checked',
    values: '(boolean)',
    def: '—',
    meaning: 'native HTML、 controlled / uncontrolled どちらも可',
  },
  {
    attr: 'disabled',
    values: '(boolean)',
    def: '—',
    meaning: 'native HTML、 opacity 0.5 + cursor not-allowed',
  },
  {
    attr: 'indeterminate',
    values: '(JS only、 element.indeterminate = true)',
    def: '—',
    meaning: '部分選択を表す native state、 mixed checked group の親に',
  },
] as const

const TOKENS = [
  { slot: 'accent (checked color)', token: 'color.brand.primary' },
  { slot: 'label color', token: 'color.text.primary' },
  { slot: 'gap (input + label)', token: 'layout.gap.tight' },
  { slot: 'font-size', token: 'typography.size.m' },
  { slot: 'focus ring', token: 'color.brand.primary (2px outline + 2px offset)' },
] as const

export default function Checkbox() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Checkbox</h1>
        <p class="docs-page-lead">
          複数選択可 binary state の form input。 native <code>&lt;input type="checkbox"&gt;</code>{' '}
          を <code>accent-color</code> で brand 色に染める 最小実装、 keyboard / a11y は browser
          標準。 indeterminate は JS で element に直接 set。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">States</div>
          <div class="docs-preview-grid">
            <label class="creo-checkbox">
              <input type="checkbox" class="creo-checkbox-input" />
              <span>Unchecked</span>
            </label>
            <label class="creo-checkbox">
              <input type="checkbox" class="creo-checkbox-input" checked />
              <span>Checked</span>
            </label>
            <label class="creo-checkbox">
              <input type="checkbox" class="creo-checkbox-input" disabled />
              <span>Disabled</span>
            </label>
            <label class="creo-checkbox">
              <input type="checkbox" class="creo-checkbox-input" disabled checked />
              <span>Disabled checked</span>
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
            wrap で <code>&lt;label&gt;</code> ＋ child input、 click 範囲が label 全体に拡大
          </li>
          <li>keyboard: Tab で focus、 Space で toggle (native)</li>
          <li>
            <code>:focus-visible</code> で 2px outline (pointer click では出さない)
          </li>
          <li>
            disabled は <code>disabled</code> 属性 (aria-disabled より真の disabled)
          </li>
          <li>indeterminate は visual cue のみ、 keyboard 操作で normal toggle に戻る (native)</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle、 right panel から
          checkbox の checked / disabled / label を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creo-ui-docs.checkbox-editor',
            }}
          >
            <CheckboxEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- 基本 -->
<label class="creo-checkbox">
  <input type="checkbox" class="creo-checkbox-input" />
  <span>規約に同意します</span>
</label>

<!-- Checked, disabled -->
<label class="creo-checkbox">
  <input type="checkbox" class="creo-checkbox-input" checked disabled />
  <span>処理中</span>
</label>

<!-- Indeterminate (JS で set) -->
<label class="creo-checkbox">
  <input type="checkbox" class="creo-checkbox-input" ref={el => el && (el.indeterminate = true)} />
  <span>一部選択</span>
</label>`}</code>
        </pre>
      </section>
    </>
  )
}

function CheckboxEditorDemo() {
  const [checked, setChecked] = createSignal(false)
  const [disabled, setDisabled] = createSignal(false)
  const [label, setLabel] = createSignal('規約に同意します')

  bind({
    target: signalTarget('checkbox.checked', checked, setChecked),
    control: boolean({ variant: 'switch' }),
    placement: { semantic: 'tool', group: 'checkbox', label: 'Checked', order: 1 },
  })
  bind({
    target: signalTarget('checkbox.disabled', disabled, setDisabled),
    control: boolean({ variant: 'switch' }),
    placement: { semantic: 'tool', group: 'checkbox', label: 'Disabled', order: 2 },
  })
  bind({
    target: signalTarget('checkbox.label', label, setLabel),
    control: string('input'),
    placement: { semantic: 'tool', group: 'content', label: 'Label', order: 1 },
  })

  return (
    <div class="docs-playground-stage">
      <label class="creo-checkbox">
        <input
          type="checkbox"
          class="creo-checkbox-input"
          checked={checked()}
          disabled={disabled()}
        />
        <span>{label()}</span>
      </label>
    </div>
  )
}
