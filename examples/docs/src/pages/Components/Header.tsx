const PROPS = [
  {
    attr: 'data-variant',
    values: 'default / marketing',
    def: 'default',
    meaning: 'default = product app header (slim)、 marketing = landing page header (大胆)',
  },
  {
    attr: 'data-sticky',
    values: '"true"',
    def: '—',
    meaning: 'scroll 中も top 固定、 navigation 常時可視',
  },
  {
    attr: 'data-elevation',
    values: 'none / default (shadow.s)',
    def: 'default',
    meaning: 'header 下端の shadow / border、 page との視覚分離',
  },
] as const

const TOKENS = [
  { slot: 'background', token: 'color.surface.surface' },
  { slot: 'border-bottom (default)', token: 'color.surface.border 1px' },
  { slot: 'shadow (default elevation)', token: 'shadow.s' },
  { slot: 'logo size', token: '24px (default) / 32px (marketing)' },
  { slot: 'padding (default)', token: 'spacing.s × spacing.m' },
  { slot: 'padding (marketing)', token: 'spacing.m × spacing.l' },
  { slot: 'gap (logo / nav / actions)', token: 'spacing.m' },
  { slot: 'sticky z-index', token: '50 (above page content、 below modals)' },
] as const

export default function Header() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Header</h1>
        <p class="docs-page-lead">
          page 上部の navigation bar — logo / nav / actions の 3-slot ViewBuilder。 default variant
          は product app 用 slim、 marketing variant は landing page 用 大胆 layout。 sticky で
          scroll 中も top 固定可能、 elevation で page との視覚分離。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Default (product app)</div>
          <header class="creo-header" style={{ position: 'static' }}>
            <div class="creo-header-logo">Creo UI</div>
            <nav class="creo-header-nav">
              <a href="#home">Home</a>
              <a href="#docs">Docs</a>
              <a href="#blog">Blog</a>
            </nav>
            <div class="creo-header-actions">
              <button type="button" class="creo-btn" data-variant="ghost" data-size="sm">
                Sign in
              </button>
              <button type="button" class="creo-btn" data-variant="primary" data-size="sm">
                Sign up
              </button>
            </div>
          </header>

          <div class="docs-preview-row-label">Marketing variant</div>
          <header class="creo-header" data-variant="marketing" style={{ position: 'static' }}>
            <div class="creo-header-logo">✨ Creo UI</div>
            <nav class="creo-header-nav">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#docs">Docs</a>
              <a href="#blog">Blog</a>
            </nav>
            <div class="creo-header-actions">
              <button type="button" class="creo-btn" data-variant="ghost">
                Sign in
              </button>
              <button type="button" class="creo-btn" data-variant="primary">
                Get started
              </button>
            </div>
          </header>

          <div class="docs-preview-row-label">No elevation (flat)</div>
          <header class="creo-header" data-elevation="none" style={{ position: 'static' }}>
            <div class="creo-header-logo">Flat</div>
            <nav class="creo-header-nav">
              <a href="#a">Item</a>
            </nav>
            <div class="creo-header-actions">
              <button type="button" class="creo-btn" data-variant="primary" data-size="sm">
                Action
              </button>
            </div>
          </header>
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
        <h2 class="docs-section-title">3-slot 構造</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>logo</strong> (left) — brand identity、 home に link
          </li>
          <li>
            <strong>nav</strong> (center) — primary navigation、 link 群 (3-7 項目)
          </li>
          <li>
            <strong>actions</strong> (right) — sign-in / cart / search / user menu 等の CTA
          </li>
          <li>mobile では nav が折り畳み (hamburger button → drawer / popover で展開)</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            wrapper は <code>&lt;header&gt;</code> (page-level)、 nav 部分は{' '}
            <code>&lt;nav aria-label="primary"&gt;</code>
          </li>
          <li>
            logo link は <code>aria-label</code> ("Creo UI、 home へ" 等)
          </li>
          <li>sticky 時 z-index 設計 (modal / drawer の下、 page content の上)</li>
          <li>nav 数 ≤ 7、 8+ なら "More" menu に折り畳み</li>
          <li>mobile breakpoint で nav → hamburger menu へ転換</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<header class="creo-header" data-sticky="true">
  <div class="creo-header-logo">
    <a href="/" aria-label="Creo UI、 home へ">✨ Creo UI</a>
  </div>
  <nav class="creo-header-nav" aria-label="primary">
    <a href="/docs">Docs</a>
    <a href="/components">Components</a>
    <a href="/blog">Blog</a>
  </nav>
  <div class="creo-header-actions">
    <button type="button" class="creo-btn" data-variant="ghost">Sign in</button>
    <button type="button" class="creo-btn" data-variant="primary">Sign up</button>
  </div>
</header>

<!-- Marketing variant -->
<header class="creo-header" data-variant="marketing">
  ...
</header>

<!-- Flat (no shadow / border) -->
<header class="creo-header" data-elevation="none">
  ...
</header>`}</code>
        </pre>
      </section>
    </>
  )
}
