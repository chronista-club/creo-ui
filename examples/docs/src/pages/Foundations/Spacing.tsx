import { DimensionScale, type DimensionToken } from '../../ui/TokenList'
import { A } from '@solidjs/router'

const SPACING: readonly DimensionToken[] = [
  { name: 'spacing.xs', cssVar: '--spacing-xs', value: '4px' },
  { name: 'spacing.sm', cssVar: '--spacing-sm', value: '8px' },
  { name: 'spacing.md', cssVar: '--spacing-md', value: '18px', hint: '5-step rule の中央' },
  { name: 'spacing.lg', cssVar: '--spacing-lg', value: '24px' },
  { name: 'spacing.xl', cssVar: '--spacing-xl', value: '32px' },
]

const MARGIN: readonly DimensionToken[] = [
  { name: 'margin.xs', cssVar: '--margin-xs', value: '8px' },
  { name: 'margin.sm', cssVar: '--margin-sm', value: '16px' },
  { name: 'margin.md', cssVar: '--margin-md', value: '18px', hint: 'spacing.md と揃える' },
  { name: 'margin.lg', cssVar: '--margin-lg', value: '40px' },
  { name: 'margin.xl', cssVar: '--margin-xl', value: '64px' },
]

const GAPS: readonly DimensionToken[] = [
  {
    name: 'layout.gap.tight',
    cssVar: '--layout-gap-tight',
    value: '4px',
    hint: '→ {spacing.xs} (icon+label inline / chip)',
  },
  {
    name: 'layout.gap.sibling',
    cssVar: '--layout-gap-sibling',
    value: '18px',
    hint: '→ {spacing.md} (form field 縦間隔 / list item 間)',
  },
  {
    name: 'layout.gap.section',
    cssVar: '--layout-gap-section',
    value: '40px',
    hint: '→ {margin.lg} (section to section)',
  },
  {
    name: 'layout.gap.page',
    cssVar: '--layout-gap-page',
    value: '64px',
    hint: '→ {margin.xl} (hero / footer の major break)',
  },
]

const TARGETS: readonly DimensionToken[] = [
  { name: 'layout.target.tap', cssVar: '--layout-target-tap', value: '44px', hint: 'Apple HIG min tap (touch)' },
  { name: 'layout.target.focus', cssVar: '--layout-target-focus', value: '32px', hint: 'Pointer-friendly' },
  { name: 'layout.target.hit', cssVar: '--layout-target-hit', value: '24px', hint: 'Dense UI w/ hover affordance' },
]

export default function Spacing() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Spacing & Margin</h1>
        <p class="docs-page-lead">
          5-step size-feel rule に基づく 2 系統の dimension scale。
          <strong>spacing.*</strong> = 要素「間」 (sibling)、 <strong>margin.*</strong> = block「外」 (section)。
          同 md=18px で結節し、 lg/xl で発散。 詳細は{' '}
          <A href="/foundations/principles">Principles</A> の原則 1-2 を参照。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">spacing.* — sibling 間</h2>
        <p class="docs-page-helper">
          要素同士の <strong>密な</strong> gap。 form field の縦間隔、 list item 間、 icon と label の inline、
          card 内側の padding 等。
        </p>
        <DimensionScale tokens={SPACING} type="spacing" />
      </section>

      <section>
        <h2 class="docs-section-title">margin.* — block 外</h2>
        <p class="docs-page-helper">
          block 同士の <strong>呼吸する</strong> rhythm。 section 間、 hero / footer の major break。
          spacing より大きくなる方向 (lg/xl) で発散して呼吸量を増やす。
        </p>
        <DimensionScale tokens={MARGIN} type="spacing" />
      </section>

      <section>
        <h2 class="docs-section-title">layout.gap.* — semantic alias</h2>
        <p class="docs-page-helper">
          意図を表現する semantic alias。 base token (spacing / margin) を参照しているので、 base を変えれば全 alias が同期。
          consumer は alias を使う、 maintainer は base を tune する。
        </p>
        <DimensionScale tokens={GAPS} type="spacing" />
      </section>

      <section>
        <h2 class="docs-section-title">layout.target.* — accessibility</h2>
        <p class="docs-page-helper">
          input control の最小サイズ (button, link, etc.)。 device / context に応じて 3 段階。
        </p>
        <DimensionScale tokens={TARGETS} type="spacing" />
      </section>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* CSS */
.card {
  padding: var(--spacing-md);          /* 内側 — sibling scale */
  gap: var(--layout-gap-sibling);      /* alias 推奨 */
}
section + section {
  margin-top: var(--layout-gap-section); /* → margin.lg */
}

/* Swift */
.padding(CreoUITokens.spacingMd)       // Component 内側
.padding(.top, CreoUITokens.marginLg)  // Section 間

/* Rust (ratatui pad helper) */
creo_ui::ratatui::pad::md()  // → ~2 cell (8px/cell 仮定)`}</code>
        </pre>
      </section>
    </>
  )
}
