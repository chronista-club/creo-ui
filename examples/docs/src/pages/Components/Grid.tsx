const PROPS = [
  {
    attr: 'data-cols',
    values: '1 / 2 / 3 / 4 / 6 / 12 / auto-sm / auto-md / auto-lg',
    def: '12',
    meaning: 'column 数。 auto-* は responsive (min-column-width 基準で auto-fit)',
  },
  {
    attr: 'data-gap',
    values: 'xs / s / m / l / xl',
    def: 'm',
    meaning: '5-step rule、 cell 間 gap',
  },
] as const

const TOKENS = [
  { slot: 'gap (xs/s/m/l/xl)', token: 'spacing.{xs/s/m/l/xl}' },
  { slot: 'display', token: 'grid' },
  { slot: 'auto-sm/md/lg minmax', token: '160px / 220px / 320px' },
] as const

export default function Grid() {
  const Cell = (text: string) => (
    <div
      class="creo-card"
      data-padding="sm"
      style={{ 'text-align': 'center', 'font-family': 'var(--typography-family-mono)' }}
    >
      {text}
    </div>
  )

  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components — Layout</p>
        <h1>Grid</h1>
        <p class="docs-page-lead">
          2D layout primitive (CSS Grid)。 column 数を <code>data-cols</code> で指定
          (1/2/3/4/6/12)、 または <code>auto-sm/md/lg</code> で responsive auto-fit。 gap は 5-step
          token。 dashboard / image gallery / card list 等に汎用。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">3 columns</div>
          <div class="creo-grid" data-cols="3">
            {Cell('1')}
            {Cell('2')}
            {Cell('3')}
            {Cell('4')}
            {Cell('5')}
            {Cell('6')}
          </div>

          <div class="docs-preview-row-label">4 columns + gap "l"</div>
          <div class="creo-grid" data-cols="4" data-gap="l">
            {Cell('a')}
            {Cell('b')}
            {Cell('c')}
            {Cell('d')}
          </div>

          <div class="docs-preview-row-label">Auto-fit (min 220px、 responsive)</div>
          <div class="creo-grid" data-cols="auto-md">
            {Cell('auto 1')}
            {Cell('auto 2')}
            {Cell('auto 3')}
            {Cell('auto 4')}
            {Cell('auto 5')}
          </div>

          <div class="docs-preview-row-label">12 column (default、 reading 例)</div>
          <div class="creo-grid">
            <div class="creo-card" data-padding="sm" style={{ 'grid-column': 'span 4' }}>
              span 4
            </div>
            <div class="creo-card" data-padding="sm" style={{ 'grid-column': 'span 8' }}>
              span 8
            </div>
            <div class="creo-card" data-padding="sm" style={{ 'grid-column': 'span 6' }}>
              span 6
            </div>
            <div class="creo-card" data-padding="sm" style={{ 'grid-column': 'span 6' }}>
              span 6
            </div>
            <div class="creo-card" data-padding="sm" style={{ 'grid-column': 'span 12' }}>
              span 12 (full)
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
        <h2 class="docs-section-title">Grid vs Stack</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Grid</strong> — 2D (行 × 列)、 column 数を制御、 cell が span を持つことも可
          </li>
          <li>
            <strong>Stack</strong> — 1D (縦 or 横)、 flex base、 list / toolbar
          </li>
          <li>
            <code>data-cols="auto-*"</code> は responsive (container 幅に応じて column 数自動)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- 3 column -->
<div class="creo-grid" data-cols="3">
  <div>1</div><div>2</div><div>3</div>
  <div>4</div><div>5</div><div>6</div>
</div>

<!-- Auto-fit (responsive) -->
<div class="creo-grid" data-cols="auto-md">
  <article class="creo-card">a</article>
  <article class="creo-card">b</article>
  <article class="creo-card">c</article>
</div>

<!-- 12 column with span (CSS Grid 標準) -->
<div class="creo-grid">
  <div style="grid-column: span 4">sidebar</div>
  <div style="grid-column: span 8">main</div>
</div>

<!-- Tight gap -->
<div class="creo-grid" data-cols="6" data-gap="xs">
  ...
</div>`}</code>
        </pre>
      </section>
    </>
  )
}
