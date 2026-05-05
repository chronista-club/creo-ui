const PROPS = [
  {
    attr: 'data-direction',
    values: 'vertical (default) / horizontal',
    def: 'vertical',
    meaning: 'flex-direction、 column が default (top-to-bottom)',
  },
  {
    attr: 'data-gap',
    values: 'xs / s / m / l / xl',
    def: 'm',
    meaning: '5-step rule、 子要素間の gap (token)',
  },
  {
    attr: 'data-align',
    values: 'start / center / end / stretch',
    def: '—',
    meaning: 'cross-axis alignment (vertical なら左右)',
  },
  {
    attr: 'data-justify',
    values: 'start / center / end / between / around',
    def: 'start',
    meaning: 'main-axis alignment (vertical なら上下)',
  },
  {
    attr: 'data-wrap',
    values: '"true"',
    def: '—',
    meaning: 'flex-wrap: wrap (overflow 折り返し)',
  },
] as const

const TOKENS = [
  { slot: 'gap (xs/s/m/l/xl)', token: 'spacing.{xs/s/m/l/xl}' },
  { slot: 'display', token: 'flex' },
  { slot: 'flex-direction', token: 'column (default) / row' },
] as const

export default function Stack() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components — Layout</p>
        <h1>Stack</h1>
        <p class="docs-page-lead">
          子要素を一方向に並べる最小 layout primitive。 default vertical (column)、{' '}
          <code>data-direction="horizontal"</code> で row。 gap / align / justify は 5-step token
          (xs/s/m/l/xl)。 page level の section 並べ や form の field 列など form / dashboard /
          editor 全般に汎用。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Vertical (default)</div>
          <div class="creo-stack" style={{ 'max-width': '320px' }}>
            <div class="creo-card">First</div>
            <div class="creo-card">Second</div>
            <div class="creo-card">Third</div>
          </div>

          <div class="docs-preview-row-label">Horizontal + gap "s"</div>
          <div class="creo-stack" data-direction="horizontal" data-gap="s">
            <button type="button" class="creo-btn" data-variant="primary">
              Save
            </button>
            <button type="button" class="creo-btn" data-variant="secondary">
              Cancel
            </button>
            <button type="button" class="creo-btn" data-variant="ghost">
              Help
            </button>
          </div>

          <div class="docs-preview-row-label">Horizontal + justify "between" (toolbar)</div>
          <div
            class="creo-stack"
            data-direction="horizontal"
            data-justify="between"
            style={{ 'min-width': '480px' }}
          >
            <strong>Title</strong>
            <button type="button" class="creo-btn" data-variant="ghost" data-size="sm">
              Action
            </button>
          </div>

          <div class="docs-preview-row-label">Horizontal + wrap (chip group)</div>
          <div
            class="creo-stack"
            data-direction="horizontal"
            data-gap="xs"
            data-wrap="true"
            style={{ 'max-width': '320px' }}
          >
            <span class="creo-badge" data-variant="brand">
              creo-ui
            </span>
            <span class="creo-badge" data-variant="success">
              shipped
            </span>
            <span class="creo-badge" data-variant="info">
              v0.14
            </span>
            <span class="creo-badge" data-variant="warning">
              beta
            </span>
            <span class="creo-badge">design-system</span>
            <span class="creo-badge">multi-platform</span>
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
        <h2 class="docs-section-title">Stack vs Grid</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Stack</strong> — 1 axis に並べる、 簡潔、 flex base。 list / toolbar / form
          </li>
          <li>
            <strong>Grid</strong> — 2D layout、 column 数指定、 dashboard / image gallery
          </li>
          <li>「縦か横に並べたい」 なら Stack、 「行と列を持つ」 なら Grid</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Vertical (default) -->
<div class="creo-stack">
  <div>...</div>
  <div>...</div>
</div>

<!-- Horizontal toolbar -->
<div class="creo-stack" data-direction="horizontal" data-gap="s">
  <button class="creo-btn" data-variant="primary">Save</button>
  <button class="creo-btn" data-variant="secondary">Cancel</button>
</div>

<!-- Justified header -->
<div class="creo-stack" data-direction="horizontal" data-justify="between">
  <strong>Title</strong>
  <button class="creo-btn">Action</button>
</div>

<!-- Wrap (chip group) -->
<div class="creo-stack" data-direction="horizontal" data-gap="xs" data-wrap="true">
  <span class="creo-badge">a</span>
  <span class="creo-badge">b</span>
  ...
</div>`}</code>
        </pre>
      </section>
    </>
  )
}
