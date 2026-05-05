const PROPS = [
  {
    attr: 'data-size',
    values: 'sm (640) / md (768) / lg (1024) / xl (1280) / full',
    def: 'md',
    meaning: 'max-width、 default md は reading-friendly、 full は max-width: 100%',
  },
  {
    attr: 'data-padding',
    values: 'none / s / m (default) / l',
    def: 'm',
    meaning: '左右の padding override、 mobile / desktop の breakpoint 補助',
  },
] as const

const TOKENS = [
  { slot: 'max-width (sm/md/lg/xl)', token: '640 / 768 / 1024 / 1280 px' },
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
        'border-radius': 'var(--radius-md)',
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
          (sm/md/lg/xl/full)、 default md (768px = reading-friendly)。 nested 可能 (small content を
          md container 内で sm container に絞る等)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">5 sizes (visual outline で max-width を示す)</div>
          {sample('sm — 640px (form / narrow read)', 'sm')}
          {sample('md — 768px (default、 reading-friendly)', 'md')}
          {sample('lg — 1024px (dashboard / table)', 'lg')}
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
            page level — outer Container (xl) で全幅制限、 内部で細い Container (md / sm) を nest
          </li>
          <li>article (long-read) — md container (768px、 行長 60-80 char)</li>
          <li>form (narrow) — sm container (640px、 input が長すぎず短すぎず)</li>
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
<form class="creo-container" data-size="sm">
  ...
</form>

<!-- Wide dashboard -->
<div class="creo-container" data-size="xl">
  ...
</div>

<!-- Nested (outer wide + inner narrow) -->
<div class="creo-container" data-size="xl">
  <header>...</header>
  <article class="creo-container" data-size="md">
    long-read article
  </article>
</div>`}</code>
        </pre>
      </section>
    </>
  )
}
