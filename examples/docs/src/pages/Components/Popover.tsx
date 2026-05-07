const PROPS = [
  {
    attr: 'data-size',
    values: 's / m / l',
    def: 'm',
    meaning: 'popover max-width (240 / 320 / 480 px)',
  },
  {
    attr: 'popover',
    values: '(boolean attribute)',
    def: '—',
    meaning: 'native HTML Popover API、 browser 自動で focus / Esc / outside-click 処理',
  },
  {
    attr: 'popovertarget (on trigger)',
    values: '(popover id)',
    def: '—',
    meaning: 'trigger button 側、 開閉対象 popover の id を指定',
  },
] as const

const TOKENS = [
  { slot: 'background', token: 'color.surface.surface + shadow.l' },
  { slot: 'border', token: 'color.surface.border 1px' },
  { slot: 'border-radius', token: 'radius.m' },
  { slot: 'header padding', token: 'spacing.s × spacing.m' },
  { slot: 'body padding', token: 'spacing.m × spacing.m' },
  { slot: 'footer padding', token: 'spacing.s × spacing.m' },
  { slot: 'max-width (s/m/l)', token: '240 / 320 / 480 px' },
] as const

export default function Popover() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Popover</h1>
        <p class="docs-page-lead">
          inline interactive content panel — config / preview / form 等の "click で開く小さな UI"。
          native HTML Popover API (Chrome 114+ / Safari 17+ / Firefox 125+) base、 focus trap / Esc
          / outside-click は browser 自動。 Tooltip と異なり <strong>interactive</strong>
          (内部 button / link / form OK)、 Dialog と異なり <strong>非 modal</strong>
          (background interaction blocked しない)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Basic popover</div>
          <div class="docs-preview-grid">
            <button type="button" class="creo-btn" data-variant="primary" popovertarget="pop-basic">
              Open popover
            </button>
            <div class="creo-popover" id="pop-basic" popover>
              <div class="creo-popover-header">
                <h3 class="creo-popover-title">Notification</h3>
              </div>
              <div class="creo-popover-body">
                <p>新しい version (v0.14.0) があります。 Update しますか？</p>
              </div>
              <div class="creo-popover-footer">
                <button type="button" class="creo-btn" data-variant="secondary" data-size="s">
                  Later
                </button>
                <button type="button" class="creo-btn" data-variant="primary" data-size="s">
                  Update
                </button>
              </div>
            </div>
          </div>

          <div class="docs-preview-row-label">Sizes (sm / md / lg)</div>
          <div class="docs-preview-grid">
            <button type="button" class="creo-btn" data-variant="ghost" popovertarget="pop-sm">
              sm
            </button>
            <div class="creo-popover" id="pop-sm" popover data-size="s">
              <div class="creo-popover-body">
                <p>Compact tip 表示。</p>
              </div>
            </div>
            <button type="button" class="creo-btn" data-variant="ghost" popovertarget="pop-lg">
              lg
            </button>
            <div class="creo-popover" id="pop-lg" popover data-size="l">
              <div class="creo-popover-header">
                <h3 class="creo-popover-title">Large popover</h3>
              </div>
              <div class="creo-popover-body">
                <p>大きい content や form を含む popover。 max-width 480px。</p>
                <p>段落 2 行目。</p>
              </div>
            </div>
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
        <h2 class="docs-section-title">Popover vs Tooltip vs Dialog</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Popover</strong> — interactive (form / button)、 non-modal、 多行 OK
          </li>
          <li>
            <strong>Tooltip</strong> — 非 interactive、 hover/focus で出る短い text 補足
          </li>
          <li>
            <strong>Dialog</strong> — modal で background block、 重要決定 (削除確認等)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            native <code>popover</code> attribute → focus 移動 / Esc close / outside-click close が
            browser 自動
          </li>
          <li>
            trigger に <code>popovertarget</code>、 popover 側に <code>id</code> + 属性
          </li>
          <li>
            title は <code>&lt;h3&gt;</code> 等の semantic heading で hierarchy 維持
          </li>
          <li>focus は trigger → popover 内へ自動移動、 close 時は trigger に戻る</li>
          <li>長 content (画面 60%+) なら drawer / dialog を検討</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<button type="button" class="creo-btn" popovertarget="my-popover">
  Open
</button>

<div class="creo-popover" id="my-popover" popover>
  <div class="creo-popover-header">
    <h3 class="creo-popover-title">Title</h3>
  </div>
  <div class="creo-popover-body">
    <p>Content here.</p>
  </div>
  <div class="creo-popover-footer">
    <button type="button" class="creo-btn" data-variant="secondary" data-size="s">
      Cancel
    </button>
    <button type="button" class="creo-btn" data-variant="primary" data-size="s">
      Confirm
    </button>
  </div>
</div>

<!-- Compact -->
<div class="creo-popover" id="tip" popover data-size="s">
  ...
</div>`}</code>
        </pre>
      </section>
    </>
  )
}
