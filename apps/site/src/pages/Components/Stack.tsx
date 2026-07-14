import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
  select,
  signalTarget,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import EditorModeToggle from '../../ui/EditorModeToggle'

const PROPS = [
  {
    attr: 'data-direction',
    values: 'vertical (default) / horizontal',
    def: 'vertical',
    meaning: 'flex-direction、 column が default (top-to-bottom)',
  },
  {
    attr: 'data-gap',
    values: 'xs / s / m / l / xl',
    def: 'm',
    meaning: '5 tier convention、 子要素間の gap (token)',
  },
  {
    attr: 'data-align',
    values: 'start / center / end / stretch',
    def: '—',
    meaning: 'cross-axis alignment (vertical なら左右)',
  },
  {
    attr: 'data-justify',
    values: 'start / center / end / between / around',
    def: 'start',
    meaning: 'main-axis alignment (vertical なら上下)',
  },
  {
    attr: 'data-wrap',
    values: '"true"',
    def: '—',
    meaning: 'flex-wrap: wrap (overflow 折り返し)',
  },
] as const

const TOKENS = [
  { slot: 'gap (xs/s/m/l/xl)', token: 'spacing.{xs/s/m/l/xl}' },
  { slot: 'display', token: 'flex' },
  { slot: 'flex-direction', token: 'column (default) / row' },
] as const

export default function Stack() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.stack-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components — Layout</p>
        <h1>Stack</h1>
        <p class="docs-page-lead">
          子要素を一方向に並べる最小 layout primitive。 default vertical (column)、{' '}
          <code>data-direction="horizontal"</code> で row。 gap / align / justify は 5-step token
          (xs/s/m/l/xl)。 page level の section 並べ や form の field 列など form / dashboard /
          editor 全般に汎用。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground stack の direction / gap / align / justify / wrap
          を即時編集できる。 Mode ON 中に playground stack を click するとその instance に field
          が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <StackLivePreview />
          <div class="docs-preview-row-label">Vertical (default)</div>
          <div class="creo-stack" style={{ 'max-width': '320px' }}>
            <div class="creo-card">First</div>
            <div class="creo-card">Second</div>
            <div class="creo-card">Third</div>
          </div>

          <div class="docs-preview-row-label">Horizontal + gap "s"</div>
          <div class="creo-stack" data-direction="horizontal" data-gap="s">
            <button type="button" class="creo-btn" data-variant="primary">
              Save
            </button>
            <button type="button" class="creo-btn" data-variant="secondary">
              Cancel
            </button>
            <button type="button" class="creo-btn" data-variant="ghost">
              Help
            </button>
          </div>

          <div class="docs-preview-row-label">Horizontal + justify "between" (toolbar)</div>
          <div
            class="creo-stack"
            data-direction="horizontal"
            data-justify="between"
            style={{ 'min-width': '480px' }}
          >
            <strong>Title</strong>
            <button type="button" class="creo-btn" data-variant="ghost" data-size="s">
              Action
            </button>
          </div>

          <div class="docs-preview-row-label">Horizontal + wrap (chip group)</div>
          <div
            class="creo-stack"
            data-direction="horizontal"
            data-gap="xs"
            data-wrap="true"
            style={{ 'max-width': '320px' }}
          >
            <span class="creo-badge" data-variant="brand">
              creo-ui
            </span>
            <span class="creo-badge" data-variant="success">
              shipped
            </span>
            <span class="creo-badge" data-variant="info">
              v0.14
            </span>
            <span class="creo-badge" data-variant="warning">
              beta
            </span>
            <span class="creo-badge">design-system</span>
            <span class="creo-badge">multi-platform</span>
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
        <h2 class="docs-section-title">Stack vs Grid</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Stack</strong> — 1 axis に並べる、 簡潔、 flex base。 list / toolbar / form
          </li>
          <li>
            <strong>Grid</strong> — 2D layout、 column 数指定、 dashboard / image gallery
          </li>
          <li>「縦か横に並べたい」 なら Stack、 「行と列を持つ」 なら Grid</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Vertical (default) -->
<div class="creo-stack">
  <div>...</div>
  <div>...</div>
</div>

<!-- Horizontal toolbar -->
<div class="creo-stack" data-direction="horizontal" data-gap="s">
  <button class="creo-btn" data-variant="primary">Save</button>
  <button class="creo-btn" data-variant="secondary">Cancel</button>
</div>

<!-- Justified header -->
<div class="creo-stack" data-direction="horizontal" data-justify="between">
  <strong>Title</strong>
  <button class="creo-btn">Action</button>
</div>

<!-- Wrap (chip group) -->
<div class="creo-stack" data-direction="horizontal" data-gap="xs" data-wrap="true">
  <span class="creo-badge">a</span>
  <span class="creo-badge">b</span>
  ...
</div>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type StackDirection = 'vertical' | 'horizontal'
type StackGap = 'xs' | 's' | 'm' | 'l' | 'xl'
type StackAlign = 'start' | 'center' | 'end' | 'stretch'
type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around'

/**
 * Live preview の playground。editor-host の bind() で direction / gap / align / justify /
 * wrap を inspector panel に生やし、stage の stack 自体を selectable にする (Mode ON で
 * click → その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function StackLivePreview() {
  const [direction, setDirection] = createSignal<StackDirection>('vertical')
  const [gap, setGap] = createSignal<StackGap>('m')
  const [align, setAlign] = createSignal<StackAlign>('stretch')
  const [justify, setJustify] = createSignal<StackJustify>('start')
  const [wrap, setWrap] = createSignal(false)

  const binders = [
    bind({
      target: signalTarget('stack.direction', direction, (v) => setDirection(v as StackDirection)),
      control: select(['vertical', 'horizontal'] as const),
      placement: { semantic: 'tool', group: 'stack', label: 'Direction', order: 1 },
    }),
    bind({
      target: signalTarget('stack.gap', gap, (v) => setGap(v as StackGap)),
      control: select(['xs', 's', 'm', 'l', 'xl'] as const),
      placement: { semantic: 'tool', group: 'stack', label: 'Gap', order: 2 },
    }),
    bind({
      target: signalTarget('stack.align', align, (v) => setAlign(v as StackAlign)),
      control: select(['start', 'center', 'end', 'stretch'] as const),
      placement: { semantic: 'tool', group: 'stack', label: 'Align', order: 3 },
    }),
    bind({
      target: signalTarget('stack.justify', justify, (v) => setJustify(v as StackJustify)),
      control: select(['start', 'center', 'end', 'between', 'around'] as const),
      placement: { semantic: 'tool', group: 'stack', label: 'Justify', order: 4 },
    }),
    bind({
      target: signalTarget('stack.wrap', wrap, setWrap),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'stack', label: 'Wrap', order: 5 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'stack-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        {/* justify / align の効きを見せるため stage 内で幅・高さを確保 */}
        <div
          class="creo-stack"
          data-direction={direction()}
          data-gap={gap()}
          data-align={align()}
          data-justify={justify()}
          data-wrap={wrap() ? 'true' : undefined}
          style={{ width: '100%', 'max-width': '360px', 'min-height': '200px' }}
          ref={selectable}
        >
          <div class="creo-card">First</div>
          <div class="creo-card">Second</div>
          <div class="creo-card">Third</div>
        </div>
      </div>
      <EditorModeToggle />
    </>
  )
}
