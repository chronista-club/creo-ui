const PROPS = [
  {
    attr: 'data-variant',
    values: 'default / compact',
    def: 'default',
    meaning: 'compact は ellipsis 圧縮 (5+ pages を "1 … 7 8 9 … 100" 形式)',
  },
  {
    attr: 'data-size',
    values: 'sm / md / lg',
    def: 'md',
    meaning: '5-step rule、 table footer なら sm、 mobile-first なら lg (tap target)',
  },
  {
    attr: 'data-action (on .creo-pagination-item)',
    values: 'prev / next',
    def: '—',
    meaning: '矢印 button の意味、 chevron icon を render',
  },
  {
    attr: 'aria-current="page"',
    values: '"page"',
    def: '—',
    meaning: '現在 page item に必須、 visual + a11y で active state',
  },
  {
    attr: 'aria-label (on nav)',
    values: '"pagination"',
    def: '—',
    meaning: 'screen reader 認識用、 nav 要素に必須',
  },
] as const

const TOKENS = [
  { slot: 'item bg (default)', token: 'transparent' },
  { slot: 'item bg (hover)', token: 'color.surface.bg-subtle' },
  { slot: 'item bg (current)', token: 'color.brand.primary-subtle' },
  { slot: 'item color (default)', token: 'color.text.secondary' },
  { slot: 'item color (current)', token: 'color.brand.primary' },
  { slot: 'item size (sm/md/lg)', token: '32 / 40 / 44 px (lg = tap target)' },
  { slot: 'gap', token: 'layout.gap.tight' },
  { slot: 'border-radius', token: 'radius.sm' },
] as const

export default function Pagination() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Pagination</h1>
        <p class="docs-page-lead">
          page 群を行き来する numbered navigation。 native <code>&lt;nav&gt;</code> +{' '}
          <code>&lt;ol&gt;</code> + 順序付き list で a11y 確保、 <code>aria-current="page"</code>{' '}
          で現在 page を明示。 prev/next の chevron は <code>data-action</code> で示し、 ellipsis (
          <code>…</code>) で長 list を圧縮。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Default (full pages)</div>
          <nav class="creo-pagination" aria-label="pagination">
            <ol class="creo-pagination-list">
              <li>
                <button
                  type="button"
                  class="creo-pagination-item"
                  data-action="prev"
                  aria-label="previous page"
                >
                  ‹
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  1
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item" aria-current="page">
                  2
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  3
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  4
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  5
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="creo-pagination-item"
                  data-action="next"
                  aria-label="next page"
                >
                  ›
                </button>
              </li>
            </ol>
          </nav>

          <div class="docs-preview-row-label">Compact (with ellipsis)</div>
          <nav class="creo-pagination" data-variant="compact" aria-label="pagination compact">
            <ol class="creo-pagination-list">
              <li>
                <button
                  type="button"
                  class="creo-pagination-item"
                  data-action="prev"
                  aria-label="previous"
                >
                  ‹
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  1
                </button>
              </li>
              <li>
                <span class="creo-pagination-ellipsis" aria-hidden="true">
                  …
                </span>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  7
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item" aria-current="page">
                  8
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  9
                </button>
              </li>
              <li>
                <span class="creo-pagination-ellipsis" aria-hidden="true">
                  …
                </span>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  100
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="creo-pagination-item"
                  data-action="next"
                  aria-label="next"
                >
                  ›
                </button>
              </li>
            </ol>
          </nav>

          <div class="docs-preview-row-label">Sizes</div>
          <nav class="creo-pagination" data-size="sm" aria-label="pagination sm">
            <ol class="creo-pagination-list">
              <li>
                <button type="button" class="creo-pagination-item" aria-current="page">
                  1
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  2
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  3
                </button>
              </li>
            </ol>
          </nav>
          <nav class="creo-pagination" data-size="lg" aria-label="pagination lg">
            <ol class="creo-pagination-list">
              <li>
                <button type="button" class="creo-pagination-item" aria-current="page">
                  1
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  2
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  3
                </button>
              </li>
            </ol>
          </nav>
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
            wrapper は <code>&lt;nav aria-label="pagination"&gt;</code>、 list は順序付き{' '}
            <code>&lt;ol&gt;</code>
          </li>
          <li>
            現在 page に <code>aria-current="page"</code>、 visual + screen reader 両方
          </li>
          <li>
            prev / next は icon-only なら <code>aria-label</code> 必須 (例:{' '}
            <code>aria-label="previous page"</code>)
          </li>
          <li>
            ellipsis は装飾、 <code>aria-hidden="true"</code> で screen reader 読み飛ばし
          </li>
          <li>tap target ≥ 44pt (lg variant) を mobile-first で守る</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<nav class="creo-pagination" aria-label="pagination">
  <ol class="creo-pagination-list">
    <li>
      <button type="button" class="creo-pagination-item"
              data-action="prev" aria-label="previous">‹</button>
    </li>
    <li><button type="button" class="creo-pagination-item">1</button></li>
    <li><button type="button" class="creo-pagination-item"
                aria-current="page">2</button></li>
    <li><button type="button" class="creo-pagination-item">3</button></li>
    <li>
      <button type="button" class="creo-pagination-item"
              data-action="next" aria-label="next">›</button>
    </li>
  </ol>
</nav>

<!-- Compact with ellipsis -->
<nav class="creo-pagination" data-variant="compact" aria-label="pagination">
  <ol class="creo-pagination-list">
    <li><button class="creo-pagination-item">1</button></li>
    <li><span class="creo-pagination-ellipsis" aria-hidden>…</span></li>
    <li><button class="creo-pagination-item" aria-current="page">8</button></li>
    ...
  </ol>
</nav>`}</code>
        </pre>
      </section>
    </>
  )
}
