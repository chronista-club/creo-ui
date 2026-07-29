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
import { Show, createSignal } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'
import EditorModeToggle from '../../ui/EditorModeToggle'

const PROPS = [
  {
    attr: 'label markup',
    values: '<label class="creo-form-field-label">',
    def: '—',
    meaning: '<input> と <code>for</code>/<code>id</code> で関連付け',
  },
  {
    attr: '<span class="creo-form-field-required">',
    values: '*',
    def: '—',
    meaning: '必須 indicator、 visual + screen reader 両方',
  },
  {
    attr: 'helper text',
    values: '.creo-helper-text / .creo-helper-text--error',
    def: '—',
    meaning: 'input 下の補助 text、 error variant で aria-describedby と連動',
  },
] as const

const TOKENS = [
  { slot: 'label color', token: 'color.text.primary' },
  { slot: 'label font', token: 'typography.size.s + weight.medium' },
  { slot: 'helper-text color', token: 'color.text.secondary' },
  { slot: 'helper-text--error', token: 'color.semantic.error' },
  { slot: 'gap (label/input/helper)', token: 'spacing.xs' },
  { slot: 'required asterisk', token: 'color.semantic.error' },
] as const

export default function FormField() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.form-field-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Form field</h1>
        <p class="docs-page-lead">
          label + input + helper-text の composite。 input 単体でなく、 label/必須 indicator/ 補助
          text/error message を一括管理する form の最小単位。 a11y は <code>&lt;label for&gt;</code>{' '}
          + <code>id</code> + <code>aria-describedby</code> + <code>aria-invalid</code> で確立。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground form field の required / error state / label /
          helper text を即時編集できる。 Mode ON 中に playground を click するとその instance に
          field が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <FormFieldLivePreview />
          <div class="docs-preview-row-label">Default</div>
          <div class="creo-form-field">
            <label class="creo-form-field-label" for="email-1">
              Email
            </label>
            <input class="creo-input" id="email-1" type="email" placeholder="you@example.com" />
            <p class="creo-helper-text">仕事用 email を入力してください</p>
          </div>

          <div class="docs-preview-row-label">Required</div>
          <div class="creo-form-field">
            <label class="creo-form-field-label" for="name-1">
              Name <span class="creo-form-field-required">*</span>
            </label>
            <input class="creo-input" id="name-1" type="text" required />
          </div>

          <div class="docs-preview-row-label">Error state</div>
          <div class="creo-form-field">
            <label class="creo-form-field-label" for="pw-1">
              Password
            </label>
            <input
              class="creo-input"
              id="pw-1"
              type="password"
              data-state="error"
              aria-invalid="true"
              aria-describedby="pw-1-err"
            />
            <p class="creo-helper-text creo-helper-text--error" id="pw-1-err">
              パスワードは 8 文字以上必要です
            </p>
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
            <code>&lt;label for="..."&gt;</code> + input <code>id</code> で関連付け (visible label)
          </li>
          <li>
            error state は <code>aria-invalid="true"</code> +{' '}
            <code>aria-describedby="error-id"</code> で error message を関連付け
          </li>
          <li>
            必須 indicator は visual のみでなく <code>required</code> 属性 + screen reader への text
            説明
          </li>
          <li>placeholder は label 代わりに使わない (focus 時に消える)</li>
          <li>error は色だけでなく icon + text で重ね伝達 (色覚多様性配慮)</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<div class="creo-form-field">
  <label class="creo-form-field-label" for="email">
    Email <span class="creo-form-field-required">*</span>
  </label>
  <input class="creo-input" id="email" type="email" required
         aria-describedby="email-help" />
  <p class="creo-helper-text" id="email-help">
    仕事用 email を入力してください
  </p>
</div>

<!-- Error -->
<div class="creo-form-field">
  <label class="creo-form-field-label" for="pw">Password</label>
  <input class="creo-input" id="pw" type="password" data-state="error"
         aria-invalid="true" aria-describedby="pw-err" />
  <p class="creo-helper-text creo-helper-text--error" id="pw-err">
    パスワードは 8 文字以上必要です
  </p>
</div>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

/**
 * Live preview の playground。editor-host の bind() で required / error state / label /
 * helper text を inspector panel に生やし、stage の form field 自体を selectable にする
 * (Mode ON で click → その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function FormFieldLivePreview() {
  const [required, setRequired] = createSignal(false)
  const [error, setError] = createSignal(false)
  const [label, setLabel] = createSignal('Email')
  const [helper, setHelper] = createSignal('仕事用 email を入力してください')

  const binders = [
    bind({
      target: signalTarget('form-field.required', required, setRequired),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'form-field', label: 'Required', order: 1 },
    }),
    bind({
      target: signalTarget('form-field.error', error, setError),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'form-field', label: 'Error state', order: 2 },
    }),
    bind({
      target: signalTarget('form-field.label', label, setLabel),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Label', order: 1 },
    }),
    bind({
      target: signalTarget('form-field.helper', helper, setHelper),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Helper text', order: 2 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'form-field-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        <div ref={selectable} class="creo-form-field" style={{ 'min-width': '280px' }}>
          <label class="creo-form-field-label" for="form-field-playground">
            {label()}{' '}
            <Show when={required()}>
              <span class="creo-form-field-required">*</span>
            </Show>
          </label>
          <input
            class="creo-input"
            id="form-field-playground"
            type="email"
            placeholder="you@example.com"
            required={required()}
            data-state={error() ? 'error' : undefined}
            aria-invalid={error() ? 'true' : undefined}
            aria-describedby="form-field-playground-helper"
          />
          <p
            classList={{ 'creo-helper-text': true, 'creo-helper-text--error': error() }}
            id="form-field-playground-helper"
          >
            {helper()}
          </p>
        </div>
      </div>
      <EditorModeToggle />
    </>
  )
}
