const PROPS = [
  {
    attr: 'data-size',
    values: 'xs (480) / s (640) / m (768) / l (1024) / xl (1280) / full',
    def: 'm',
    meaning:
      'max-width、 default m は reading-friendly、 full は max-width: 100% (5 tier convention with spacing)',
  },
  {
    attr: 'data-padding',
    values: 'none / s / m (default) / l',
    def: 'm',
    meaning: '左右の padding override、 mobile / desktop の breakpoint 補助',
  },
] as const

const TOKENS = [
  { slot: 'max-width (xs/s/m/l/xl)', token: '480 / 640 / 768 / 1024 / 1280 px' },
  { slot: 'padding (default)', token: 'spacing.m × spacing.m' },
  { slot: 'margin', token: 'auto auto (horizontal centering)' },
] as const

export default function Container() {
  const sample = (label: string, size?: string) => (
    <div
      class="creo-container"
      data-size={size}
      style={{
        'background-color': 'var(--color-surface-bg-subtle)',
        'min-height': '60px',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'border-radius': 'var(--radius-m)',
        margin: 'var(--spacing-s) auto',
      }}
    >
      {label}
    </div>
  )

  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components — Layout</p>
        <h1>Container</h1>
        <p class="docs-page-lead">
          page-level content の max-width 制限 + horizontal centering + side padding。 5 size
          (xs/s/m/l/xl) + full、 default m (768px = reading-friendly)、 命名は spacing convention
          に揃え 5 tier 統一。 nested 可能 (small content を m container 内で s container
          に絞る等)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">
            5 sizes + full (visual outline で max-width を示す)
          </div>
          {sample('xs — 480px (extra-narrow / minimal modal)', 'xs')}
          {sample('s — 640px (form / narrow read)', 's')}
          {sample('m — 768px (default、 reading-friendly)', 'm')}
          {sample('l — 1024px (dashboard / table)', 'l')}
          {sample('xl — 1280px (hero / multi-column)', 'xl')}
          {sample('full — 100% (custom layout 内)', 'full')}
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
        <h2 class="docs-section-title">使い分けと層構造</h2>
        <ul class="docs-bullet-list">
          <li>
            page level — outer Container (xl) で全幅制限、 内部で細い Container (m / s) を nest
          </li>
          <li>article (long-read) — m container (768px、 行長 60-80 char)</li>
          <li>form (narrow) — s container (640px、 input が長すぎず短すぎず)</li>
          <li>xs (modal body / single-line CTA) は narrow Dialog 内側で更に絞る用途</li>
          <li>full — Container を弾いて全幅にしたい hero / image grid 等</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Default md (reading-friendly) -->
<main class="creo-container">
  <h1>Article</h1>
  <p>...</p>
</main>

<!-- Narrow form -->
<form class="creo-container" data-size="s">
  ...
</form>

<!-- Wide dashboard -->
<div class="creo-container" data-size="xl">
  ...
</div>

<!-- Nested (outer wide + inner narrow) -->
<div class="creo-container" data-size="xl">
  <header>...</header>
  <article class="creo-container" data-size="m">
    long-read article
  </article>
</div>`}</code>
        </pre>
      </section>
    </>
  )
}
