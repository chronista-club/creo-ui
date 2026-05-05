import { ColorGroup, type ColorSwatchSpec } from '../../ui/ColorSwatch'

const BRAND: readonly ColorSwatchSpec[] = [
  { name: 'color.brand.primary', cssVar: '--color-brand-primary', hint: 'Action / Link / Active' },
  { name: 'color.brand.secondary', cssVar: '--color-brand-secondary', hint: 'Hover / Accent 補色' },
]

const SEMANTIC: readonly ColorSwatchSpec[] = [
  { name: 'color.semantic.success', cssVar: '--color-semantic-success' },
  { name: 'color.semantic.warning', cssVar: '--color-semantic-warning' },
  { name: 'color.semantic.error', cssVar: '--color-semantic-error' },
  { name: 'color.semantic.info', cssVar: '--color-semantic-info' },
]

const SURFACE: readonly ColorSwatchSpec[] = [
  { name: 'color.surface.bg-base', cssVar: '--color-surface-bg-base', hint: 'Page background' },
  { name: 'color.surface.bg-subtle', cssVar: '--color-surface-bg-subtle', hint: 'Code / Tag bg' },
  { name: 'color.surface.surface', cssVar: '--color-surface-surface', hint: 'Card / Panel' },
  { name: 'color.surface.border', cssVar: '--color-surface-border', hint: 'Divider / Outline' },
]

const TEXT: readonly ColorSwatchSpec[] = [
  { name: 'color.text.primary', cssVar: '--color-text-primary', hint: 'Body / Heading' },
  { name: 'color.text.secondary', cssVar: '--color-text-secondary', hint: 'Helper / Caption' },
  { name: 'color.text.tertiary', cssVar: '--color-text-tertiary', hint: 'Disabled / Footer' },
]

export default function Color() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Color</h1>
        <p class="docs-page-lead">
          Token は OKLCH で記述、 modern browser がそのまま解釈。 4 family × light/dark = 8 theme
          で同じ token 名のまま値が切替わる。 Header の theme switcher で確認できます。
        </p>
      </header>

      <ColorGroup
        title="Brand"
        description="Action / Link / Active state に使う core 色。 brand.primary が CTA、 secondary は hover や accent 補色。"
        swatches={BRAND}
      />
      <ColorGroup
        title="Semantic"
        description="意味を持つ status 色 (toast / alert / form error 等)。 ratatui / egui で同じ意味マッピング。"
        swatches={SEMANTIC}
      />
      <ColorGroup
        title="Surface"
        description="Page background / panel / divider などの構造色。 contrast 維持のため bg-base と surface は十分な差を持たせる。"
        swatches={SURFACE}
      />
      <ColorGroup
        title="Text"
        description="primary は body / heading、 secondary は helper / caption、 tertiary は disabled / footer。 contrast (WCAG) を満たすペア構成。"
        swatches={TEXT}
      />

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* CSS */
.button {
  background: var(--color-brand-primary);
  color: var(--color-text-primary);
}

/* Swift (CreoUITokens) */
Color.colorBrandPrimary

/* Rust (creo-ui::tokens) */
tokens::COLOR_BRAND_PRIMARY  // → Rgb { r, g, b }`}</code>
        </pre>
      </section>
    </>
  )
}
