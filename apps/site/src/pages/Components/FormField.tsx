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
    <>
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
        <div class="docs-component-preview">
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
    </>
  )
}
