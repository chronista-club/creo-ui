import { DimensionScale, type DimensionToken } from '../../ui/TokenList'

const SPACING: readonly DimensionToken[] = [
  { name: 'spacing.xs', cssVar: '--spacing-xs', value: '4px' },
  { name: 'spacing.sm', cssVar: '--spacing-sm', value: '8px' },
  { name: 'spacing.md', cssVar: '--spacing-md', value: '18px', hint: '5-step rule の中央' },
  { name: 'spacing.lg', cssVar: '--spacing-lg', value: '24px' },
  { name: 'spacing.xl', cssVar: '--spacing-xl', value: '32px' },
  { name: 'spacing.2xl', cssVar: '--spacing-2xl', value: '48px' },
]

export default function Spacing() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Spacing</h1>
        <p class="docs-page-lead">
          5-step "size-feel rule" — xs / sm / <strong>md</strong> / lg / xl の 5 段階を中心に、
          2xl で large layout 用を 1 段追加。 md = 18px が中央値、 spacing.md と margin.md は揃える規約。
        </p>
      </header>

      <DimensionScale tokens={SPACING} type="spacing" />

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* CSS */
.card {
  padding: var(--spacing-md);
  gap: var(--spacing-sm);
}

/* Swift */
.padding(CreoUITokens.spacingMd)

/* Rust (ratatui pad helper) */
creo_ui::ratatui::pad::md()  // → ~2 cell`}</code>
        </pre>
      </section>
    </>
  )
}
