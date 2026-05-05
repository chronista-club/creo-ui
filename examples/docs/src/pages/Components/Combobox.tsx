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
    <>
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
        <div class="docs-component-preview">
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

          <div class="docs-preview-row-label">Browser shortcut (filled variant + sm)</div>
          <div class="creo-form-field">
            <label class="creo-form-field-label" for="cmd">
              Command
            </label>
            <input
              class="creo-input"
              id="cmd"
              data-variant="filled"
              data-size="sm"
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
    </>
  )
}
