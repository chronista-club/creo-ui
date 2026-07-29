import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
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
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.checkbox-editor',
      }}
    >
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
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground checkbox の checked / disabled / label
          を即時編集できる。 Mode ON 中に playground checkbox を click するとその instance に field
          が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <CheckboxLivePreview />
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

      <EditorLayer />
    </EditorHostProvider>
  )
}

/**
 * Live preview の playground。editor-host の bind() で checked / disabled / label を
 * inspector panel に生やし、stage の checkbox 自体を selectable にする (Mode ON で click →
 * その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function CheckboxLivePreview() {
  const [checked, setChecked] = createSignal(false)
  const [disabled, setDisabled] = createSignal(false)
  const [label, setLabel] = createSignal('規約に同意します')

  const binders = [
    bind({
      target: signalTarget('checkbox.checked', checked, setChecked),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'checkbox', label: 'Checked', order: 1 },
    }),
    bind({
      target: signalTarget('checkbox.disabled', disabled, setDisabled),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'checkbox', label: 'Disabled', order: 2 },
    }),
    bind({
      target: signalTarget('checkbox.label', label, setLabel),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Label', order: 1 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'checkbox-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        <label ref={selectable} class="creo-checkbox">
          <input
            type="checkbox"
            class="creo-checkbox-input"
            checked={checked()}
            disabled={disabled()}
          />
          <span>{label()}</span>
        </label>
      </div>
      <EditorModeToggle />
    </>
  )
}
