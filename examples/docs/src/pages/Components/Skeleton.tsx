const PROPS = [
  {
    attr: 'data-shape',
    values: 'text / circle / rect',
    def: 'rect',
    meaning: 'placeholder の形 — text (1 行)、 circle (avatar / icon)、 rect (image / card)',
  },
  {
    attr: 'data-size (with text shape)',
    values: 'sm / lg',
    def: 'md',
    meaning: 'text の高さ scale (sm = 12px、 md = 16px、 lg = 20px 等)',
  },
] as const

const TOKENS = [
  { slot: 'background', token: 'color.surface.bg-subtle' },
  { slot: 'shimmer gradient', token: 'linear-gradient with color.surface.bg-subtle stops' },
  { slot: 'animation', token: 'shimmer 1.4s ease-in-out infinite' },
  { slot: 'border-radius (text/rect)', token: 'radius.xs' },
  { slot: 'border-radius (circle)', token: 'radius.full' },
  { slot: 'reduced-motion', token: 'animation: none (a11y 配慮)' },
] as const

export default function Skeleton() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Skeleton</h1>
        <p class="docs-page-lead">
          loading 中の content shape placeholder。 spinner と異なり{' '}
          <strong>最終 layout の 形を hint</strong> することで perceived performance が向上 (user は
          "何が来るか" 視覚的に予測できる)。 3 shape (text / circle / rect) を組み合わせて article
          preview / avatar list / image card 等を作る。 <code>prefers-reduced-motion: reduce</code>{' '}
          で shimmer 停止。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Shapes</div>
          <div class="docs-preview-stack" style={{ width: '320px', gap: 'var(--spacing-s)' }}>
            <span class="creo-skeleton" data-shape="text" data-size="lg" />
            <span class="creo-skeleton" data-shape="text" />
            <span class="creo-skeleton" data-shape="text" data-size="sm" />
            <div style={{ display: 'flex', gap: 'var(--spacing-s)', 'align-items': 'center' }}>
              <span
                class="creo-skeleton"
                data-shape="circle"
                style={{ width: '44px', height: '44px' }}
              />
              <div style={{ flex: 1 }}>
                <span class="creo-skeleton" data-shape="text" />
                <span class="creo-skeleton" data-shape="text" data-size="sm" />
              </div>
            </div>
            <span
              class="creo-skeleton"
              data-shape="rect"
              style={{ width: '100%', height: '120px' }}
            />
          </div>

          <div class="docs-preview-row-label">Card placeholder (composite example)</div>
          <article
            class="creo-card"
            style={{
              width: '320px',
              display: 'flex',
              'flex-direction': 'column',
              gap: 'var(--spacing-s)',
            }}
          >
            <span
              class="creo-skeleton"
              data-shape="rect"
              style={{ width: '100%', height: '160px' }}
            />
            <span class="creo-skeleton" data-shape="text" data-size="lg" />
            <span class="creo-skeleton" data-shape="text" />
            <span class="creo-skeleton" data-shape="text" />
            <span class="creo-skeleton" data-shape="text" data-size="sm" style={{ width: '40%' }} />
          </article>
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
        <h2 class="docs-section-title">Skeleton vs Spinner</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Skeleton</strong> — content shape を hint、 perceived performance 高、 数百 ms
            以上の load (block render 系) 向け
          </li>
          <li>
            <strong>Spinner</strong> — content 形が予測できない / 短い load (button click feedback
            等) 向け
          </li>
          <li>"何が来るか分かっている" なら skeleton、 "とりあえず処理中" なら spinner</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            container に <code>aria-busy="true"</code> を付与、 完了したら removed (screen reader が
            "loading" を読む)
          </li>
          <li>
            skeleton 自体は装飾、 <code>aria-hidden="true"</code> でも OK (text 内容 0 なので)
          </li>
          <li>
            <code>prefers-reduced-motion: reduce</code> で shimmer animation 停止 (CSS で 自動
            fallback)
          </li>
          <li>load 完了で skeleton → real content に置換、 layout shift を防ぐため形を一致</li>
          <li>長期 load (5 秒+) は skeleton + cancel button + retry など progressive UI を</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Text lines -->
<span class="creo-skeleton" data-shape="text"></span>
<span class="creo-skeleton" data-shape="text" data-size="sm"></span>

<!-- Circle (avatar) -->
<span class="creo-skeleton" data-shape="circle" style="width: 44px; height: 44px"></span>

<!-- Rect (image) -->
<span class="creo-skeleton" data-shape="rect" style="width: 100%; height: 160px"></span>

<!-- Card placeholder (composite) -->
<article class="creo-card" aria-busy="true">
  <span class="creo-skeleton" data-shape="rect" style="height: 160px"></span>
  <span class="creo-skeleton" data-shape="text" data-size="lg"></span>
  <span class="creo-skeleton" data-shape="text"></span>
  <span class="creo-skeleton" data-shape="text" style="width: 40%"></span>
</article>`}</code>
        </pre>
      </section>
    </>
  )
}
