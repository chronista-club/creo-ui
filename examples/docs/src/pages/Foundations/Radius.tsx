import { A } from '@solidjs/router'
import { DimensionScale, type DimensionToken } from '../../ui/TokenList'

const RADII: readonly DimensionToken[] = [
  { name: 'radius.none', cssVar: '--radius-none', value: '0px', hint: 'Explicit reset (special)' },
  { name: 'radius.xs', cssVar: '--radius-xs', value: '4px', hint: 'Chip / Tag' },
  { name: 'radius.sm', cssVar: '--radius-sm', value: '8px', hint: 'Button / Input' },
  { name: 'radius.md', cssVar: '--radius-md', value: '15px', hint: 'Card / Popover (default)' },
  { name: 'radius.lg', cssVar: '--radius-lg', value: '22px', hint: 'Modal / Drawer' },
  { name: 'radius.xl', cssVar: '--radius-xl', value: '28px', hint: 'Hero surface' },
  {
    name: 'radius.full',
    cssVar: '--radius-full',
    value: '9999px',
    hint: 'Pill / Avatar (special)',
  },
]

export default function Radius() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Radius</h1>
        <p class="docs-page-lead">
          7 step (xs / sm / md / lg / xl の <strong>5 step rule</strong> + <code>none</code> /{' '}
          <code>full</code> の 2 special)。 親子の radius は <strong>concentric corner</strong> (子
          = 親 - 親 padding) で揃える慣習 — Apple HIG 由来。 詳細は{' '}
          <A href="/foundations/principles">Principles</A> 原則 4。
        </p>
      </header>

      <DimensionScale tokens={RADII} type="radius" />

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* CSS */
.card { border-radius: var(--radius-md); }     /* 15px */
.avatar { border-radius: var(--radius-full); } /* pill */

/* concentric helper (creo-ui-editor-host) */
import { concentric } from 'creo-ui-editor-host'
const childRadius = concentric(parentRadius, parentPadding)
// e.g. parent radius=15, parent padding=8 → child radius=7`}</code>
        </pre>
      </section>
    </>
  )
}
