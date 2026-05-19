const PROPS = [
  {
    attr: 'data-orientation',
    values: 'horizontal (default) / vertical',
    def: 'horizontal',
    meaning: '線の方向、 vertical は inline-flex 等の同 row 内で使用',
  },
  {
    attr: 'data-thickness',
    values: 'thin (1px、 default) / thick (2px)',
    def: 'thin',
    meaning: '線の太さ、 強調したい場合 thick',
  },
  {
    attr: 'data-spacing',
    values: 'xs / s / m (default) / l / xl',
    def: 'm',
    meaning: 'spacing 5-step、 margin override',
  },
  {
    attr: 'data-variant',
    values: 'subtle',
    def: '—',
    meaning: 'low-emphasis (bg-subtle 色)、 軽い区切り',
  },
] as const

const TOKENS = [
  { slot: 'background (default)', token: 'color.surface.border' },
  { slot: 'background (subtle)', token: 'color.surface.bg-subtle' },
  { slot: 'thickness (thin/thick)', token: '1px / 2px' },
  { slot: 'margin (xs/s/m/l/xl)', token: 'spacing.{xs/s/m/l/xl}' },
] as const

export default function Divider() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components — Layout</p>
        <h1>Divider</h1>
        <p class="docs-page-lead">
          区切り線 — section 間の視覚的境界。 native <code>&lt;hr&gt;</code> + class で a11y 自動
          (separator role)。 horizontal (default) / vertical、 thin / thick、 spacing 5-step、
          default / subtle variant。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Horizontal (default)</div>
          <div>
            <p>Section A の content</p>
            <hr class="creo-divider" />
            <p>Section B の content</p>
          </div>

          <div class="docs-preview-row-label">Thick + spacing "l"</div>
          <div>
            <p>Top section</p>
            <hr class="creo-divider" data-thickness="thick" data-spacing="l" />
            <p>Bottom section (大きな視覚分離)</p>
          </div>

          <div class="docs-preview-row-label">Subtle (low-emphasis)</div>
          <div>
            <p>line 1</p>
            <hr class="creo-divider" data-variant="subtle" data-spacing="s" />
            <p>line 2 (軽い区切り)</p>
          </div>

          <div class="docs-preview-row-label">Vertical (inline 内 separator)</div>
          <div
            style={{
              display: 'flex',
              'align-items': 'center',
              gap: 'var(--spacing-s)',
              height: '40px',
            }}
          >
            <span>Home</span>
            <hr class="creo-divider" data-orientation="vertical" data-spacing="xs" />
            <span>Docs</span>
            <hr class="creo-divider" data-orientation="vertical" data-spacing="xs" />
            <span>Components</span>
            <hr class="creo-divider" data-orientation="vertical" data-spacing="xs" />
            <span>Lab</span>
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
            native <code>&lt;hr&gt;</code> = <code>role="separator"</code> 自動、 screen reader が
            "separator" を読む
          </li>
          <li>
            vertical orientation でも <code>&lt;hr&gt;</code> 推奨 (semantic 維持)
          </li>
          <li>過度に divider を使わない (3-5 sections 以上は別 layout 検討)</li>
          <li>
            装飾目的のみなら <code>aria-hidden="true"</code> を付与
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Horizontal (default) -->
<hr class="creo-divider" />

<!-- Thick + larger spacing -->
<hr class="creo-divider" data-thickness="thick" data-spacing="l" />

<!-- Subtle (low-emphasis) -->
<hr class="creo-divider" data-variant="subtle" data-spacing="s" />

<!-- Vertical (inline) -->
<div style="display: flex; align-items: center; gap: 8px">
  <span>Home</span>
  <hr class="creo-divider" data-orientation="vertical" data-spacing="xs" />
  <span>Docs</span>
</div>`}</code>
        </pre>
      </section>
    </>
  )
}
