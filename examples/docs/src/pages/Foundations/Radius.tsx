import { DimensionScale, type DimensionToken } from '../../ui/TokenList'

const RADII: readonly DimensionToken[] = [
  { name: 'radius.sm', cssVar: '--radius-sm', value: '4px', hint: 'Tag / Badge / Inline-code' },
  { name: 'radius.md', cssVar: '--radius-md', value: '8px', hint: 'Card / Input / Button' },
  { name: 'radius.lg', cssVar: '--radius-lg', value: '12px', hint: 'Dialog / Drawer / Sheet' },
  { name: 'radius.full', cssVar: '--radius-full', value: '9999px', hint: 'Pill / Avatar / Spinner' },
]

export default function Radius() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Radius</h1>
        <p class="docs-page-lead">
          4 段階の corner radius。 component サイズに比例して選ぶ慣習 — 小さい要素ほど小さい
          radius。 Apple HIG の concentric corner (親子同心円) も `concentric()` helper で合わせやすい。
        </p>
      </header>

      <DimensionScale tokens={RADII} type="radius" />

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* CSS */
.card { border-radius: var(--radius-md); }
.avatar { border-radius: var(--radius-full); }

/* concentric helper (creo-ui-editor-host) */
import { concentric } from 'creo-ui-editor-host'
const childRadius = concentric(parentRadius, parentPadding)`}</code>
        </pre>
      </section>
    </>
  )
}
