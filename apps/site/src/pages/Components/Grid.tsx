import {
  EditorHostProvider,
  EditorLayer,
  bind,
  select,
  signalTarget,
  string,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'
import EditorModeToggle from '../../ui/EditorModeToggle'

const PROPS = [
  {
    attr: 'data-cols',
    values: '1 / 2 / 3 / 4 / 6 / 12 / auto-xs / auto-s / auto-m / auto-l / auto-xl',
    def: '12',
    meaning:
      'column 数。 auto-* は responsive (min-column-width 基準で auto-fit、 5 tier xs/s/m/l/xl)',
  },
  {
    attr: 'data-gap',
    values: 'xs / s / m / l / xl',
    def: 'm',
    meaning: '5 tier convention、 cell 間 gap (spacing token と同 tier)',
  },
] as const

const TOKENS = [
  { slot: 'gap (xs/s/m/l/xl)', token: 'spacing.{xs/s/m/l/xl}' },
  { slot: 'display', token: 'grid' },
  { slot: 'auto-xs/s/m/l/xl minmax', token: '120 / 160 / 220 / 280 / 320 px' },
] as const

export default function Grid() {
  const Cell = (text: string) => (
    <div
      class="creo-card"
      data-padding="s"
      style={{ 'text-align': 'center', 'font-family': 'var(--typography-family-sans)' }}
    >
      {text}
    </div>
  )

  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.grid-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components — Layout</p>
        <h1>Grid</h1>
        <p class="docs-page-lead">
          2D layout primitive (CSS Grid)。 column 数を <code>data-cols</code> で指定
          (1/2/3/4/6/12)、 または <code>auto-xs/s/m/l/xl</code> で responsive auto-fit (5 tier、
          spacing convention 整合)。 gap は 5-step token。 dashboard / image gallery / card list
          等。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground grid の columns / gap / cell 数 / cell text
          を即時編集できる。 Mode ON 中に playground を click するとその instance に field
          が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <GridLivePreview />
          <div class="docs-preview-row-label">3 columns</div>
          <div class="creo-grid" data-cols="3">
            {Cell('1')}
            {Cell('2')}
            {Cell('3')}
            {Cell('4')}
            {Cell('5')}
            {Cell('6')}
          </div>

          <div class="docs-preview-row-label">4 columns + gap "l"</div>
          <div class="creo-grid" data-cols="4" data-gap="l">
            {Cell('a')}
            {Cell('b')}
            {Cell('c')}
            {Cell('d')}
          </div>

          <div class="docs-preview-row-label">Auto-fit (min 220px、 responsive)</div>
          <div class="creo-grid" data-cols="auto-m">
            {Cell('auto 1')}
            {Cell('auto 2')}
            {Cell('auto 3')}
            {Cell('auto 4')}
            {Cell('auto 5')}
          </div>

          <div class="docs-preview-row-label">12 column (default、 reading 例)</div>
          <div class="creo-grid">
            <div class="creo-card" data-padding="s" style={{ 'grid-column': 'span 4' }}>
              span 4
            </div>
            <div class="creo-card" data-padding="s" style={{ 'grid-column': 'span 8' }}>
              span 8
            </div>
            <div class="creo-card" data-padding="s" style={{ 'grid-column': 'span 6' }}>
              span 6
            </div>
            <div class="creo-card" data-padding="s" style={{ 'grid-column': 'span 6' }}>
              span 6
            </div>
            <div class="creo-card" data-padding="s" style={{ 'grid-column': 'span 12' }}>
              span 12 (full)
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Props</h2>
        <PropsTable rows={PROPS} />
      </section>

      <section>
        <h2 class="docs-section-title">Token reference</h2>
        <TokensTable rows={TOKENS} />
      </section>

      <section>
        <h2 class="docs-section-title">Grid vs Stack</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Grid</strong> — 2D (行 × 列)、 column 数を制御、 cell が span を持つことも可
          </li>
          <li>
            <strong>Stack</strong> — 1D (縦 or 横)、 flex base、 list / toolbar
          </li>
          <li>
            <code>data-cols="auto-*"</code> は responsive (container 幅に応じて column 数自動、 5
            tier)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- 3 column -->
<div class="creo-grid" data-cols="3">
  <div>1</div><div>2</div><div>3</div>
  <div>4</div><div>5</div><div>6</div>
</div>

<!-- Auto-fit (responsive) -->
<div class="creo-grid" data-cols="auto-m">
  <article class="creo-card">a</article>
  <article class="creo-card">b</article>
  <article class="creo-card">c</article>
</div>

<!-- 12 column with span (CSS Grid 標準) -->
<div class="creo-grid">
  <div style="grid-column: span 4">sidebar</div>
  <div style="grid-column: span 8">main</div>
</div>

<!-- Tight gap -->
<div class="creo-grid" data-cols="6" data-gap="xs">
  ...
</div>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

const GRID_COLS = [
  '1',
  '2',
  '3',
  '4',
  '6',
  '12',
  'auto-xs',
  'auto-s',
  'auto-m',
  'auto-l',
  'auto-xl',
] as const
const GRID_GAPS = ['xs', 's', 'm', 'l', 'xl'] as const
const GRID_COUNTS = ['3', '4', '6', '8', '12'] as const

type GridCols = (typeof GRID_COLS)[number]
type GridGap = (typeof GRID_GAPS)[number]
type GridCount = (typeof GRID_COUNTS)[number]

/**
 * Live preview の playground。editor-host の bind() で columns / gap / cell 数 / cell text を
 * inspector panel に生やし、stage の grid 自体を selectable にする (Mode ON で click →
 * その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function GridLivePreview() {
  const [cols, setCols] = createSignal<GridCols>('3')
  const [gap, setGap] = createSignal<GridGap>('m')
  const [count, setCount] = createSignal<GridCount>('6')
  const [cellText, setCellText] = createSignal('Cell')

  const binders = [
    bind({
      target: signalTarget('grid.cols', cols, (v) => setCols(v as GridCols)),
      control: select(GRID_COLS),
      placement: { semantic: 'tool', group: 'grid', label: 'Columns', order: 1 },
    }),
    bind({
      target: signalTarget('grid.gap', gap, (v) => setGap(v as GridGap)),
      control: select(GRID_GAPS),
      placement: { semantic: 'tool', group: 'grid', label: 'Gap', order: 2 },
    }),
    bind({
      target: signalTarget('grid.count', count, (v) => setCount(v as GridCount)),
      control: select(GRID_COUNTS),
      placement: { semantic: 'tool', group: 'grid', label: 'Cells', order: 3 },
    }),
    bind({
      target: signalTarget('grid.cellText', cellText, setCellText),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Cell text', order: 1 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'grid-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        <div
          ref={selectable}
          class="creo-grid"
          data-cols={cols()}
          data-gap={gap()}
          style={{ width: '100%' }}
        >
          {Array.from({ length: Number(count()) }, (_, i) => (
            <div
              class="creo-card"
              data-padding="s"
              style={{ 'text-align': 'center', 'font-family': 'var(--typography-family-sans)' }}
            >
              {cellText()} {i + 1}
            </div>
          ))}
        </div>
      </div>
      <EditorModeToggle />
    </>
  )
}
