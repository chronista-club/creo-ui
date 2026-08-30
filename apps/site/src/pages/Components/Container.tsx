import { CUButton } from '@chronista-club/creo-ui/controls'
import {
  bind,
  EditorHostProvider,
  EditorLayer,
  select,
  signalTarget,
  string,
  useEditorHost,
  useEditorMode,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'

const PROPS = [
  {
    attr: 'data-size',
    values: 'xs (480) / s (640) / m (768) / l (1024) / xl (1280) / full',
    def: 'm',
    meaning:
      'max-width、 default m は reading-friendly、 full は max-width: 100% (5 tier convention with spacing)',
  },
  {
    attr: 'data-padding',
    values: 'none / s / m (default) / l',
    def: 'm',
    meaning: '左右の padding override、 mobile / desktop の breakpoint 補助',
  },
] as const

const TOKENS = [
  { slot: 'max-width (xs/s/m/l/xl)', token: '480 / 640 / 768 / 1024 / 1280 px' },
  { slot: 'padding (default)', token: 'spacing.m × spacing.m' },
  { slot: 'margin', token: 'auto auto (horizontal centering)' },
] as const

export default function Container() {
  const sample = (label: string, size?: string) => (
    <div
      class="creo-container"
      data-size={size}
      style={{
        'background-color': 'var(--color-surface-bg-subtle)',
        'min-height': '60px',
        display: 'flex',
        'align-items': 'center',
        'justify-content': 'center',
        'border-radius': 'var(--radius-m)',
        margin: 'var(--spacing-s) auto',
      }}
    >
      {label}
    </div>
  )

  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.container-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components — Layout</p>
        <h1>Container</h1>
        <p class="docs-page-lead">
          page-level content の max-width 制限 + horizontal centering + side padding。 5 size
          (xs/s/m/l/xl) + full、 default m (768px = reading-friendly)、 命名は spacing convention
          に揃え 5 tier 統一。 nested 可能 (small content を m container 内で s container
          に絞る等)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground container の size / padding / content
          を即時編集できる。 Mode ON 中に playground container を click するとその instance に field
          が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <ContainerLivePreview />
          <div class="docs-preview-row-label">
            5 sizes + full (visual outline で max-width を示す)
          </div>
          {sample('xs — 480px (extra-narrow / minimal modal)', 'xs')}
          {sample('s — 640px (form / narrow read)', 's')}
          {sample('m — 768px (default、 reading-friendly)', 'm')}
          {sample('l — 1024px (dashboard / table)', 'l')}
          {sample('xl — 1280px (hero / multi-column)', 'xl')}
          {sample('full — 100% (custom layout 内)', 'full')}
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
        <h2 class="docs-section-title">使い分けと層構造</h2>
        <ul class="docs-bullet-list">
          <li>
            page level — outer Container (xl) で全幅制限、 内部で細い Container (m / s) を nest
          </li>
          <li>article (long-read) — m container (768px、 行長 60-80 char)</li>
          <li>form (narrow) — s container (640px、 input が長すぎず短すぎず)</li>
          <li>xs (modal body / single-line CTA) は narrow Dialog 内側で更に絞る用途</li>
          <li>full — Container を弾いて全幅にしたい hero / image grid 等</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Default m (reading-friendly) -->
<main class="creo-container">
  <h1>Article</h1>
  <p>...</p>
</main>

<!-- Narrow form -->
<form class="creo-container" data-size="s">
  ...
</form>

<!-- Wide dashboard -->
<div class="creo-container" data-size="xl">
  ...
</div>

<!-- Nested (outer wide + inner narrow) -->
<div class="creo-container" data-size="xl">
  <header>...</header>
  <article class="creo-container" data-size="m">
    long-read article
  </article>
</div>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type ContainerSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'full'
type ContainerPadding = 'none' | 's' | 'm' | 'l'

/**
 * Live preview の playground。editor-host の bind() で size / padding / content を inspector
 * panel に生やし、stage の container 自体を selectable にする (Mode ON で click → その instance
 * に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function ContainerLivePreview() {
  const host = useEditorHost()
  const mode = useEditorMode()

  const [size, setSize] = createSignal<ContainerSize>('m')
  const [padding, setPadding] = createSignal<ContainerPadding>('m')
  const [label, setLabel] = createSignal('content — max-width で制限、 左右 padding が gutter')

  const binders = [
    bind({
      target: signalTarget('container.size', size, (v) => setSize(v as ContainerSize)),
      control: select(['xs', 's', 'm', 'l', 'xl', 'full'] as const),
      placement: { semantic: 'tool', group: 'container', label: 'Size', order: 1 },
    }),
    bind({
      target: signalTarget('container.padding', padding, (v) => setPadding(v as ContainerPadding)),
      control: select(['none', 's', 'm', 'l'] as const),
      placement: { semantic: 'tool', group: 'container', label: 'Padding', order: 2 },
    }),
    bind({
      target: signalTarget('container.label', label, setLabel),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Content text', order: 1 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'container-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="cu-row cu-center docs-playground-stage">
        {/* subtle bg = container の実 extent (max-width)、 内側 dashed box が padding を可視化 */}
        <div
          ref={selectable}
          class="creo-container"
          data-size={size()}
          data-padding={padding()}
          style={{
            'background-color': 'var(--color-surface-bg-subtle)',
            'border-radius': 'var(--radius-m)',
          }}
        >
          <div
            style={{
              'background-color': 'var(--color-surface-surface)',
              border: '1px dashed var(--color-surface-border)',
              'border-radius': 'var(--radius-s)',
              padding: 'var(--spacing-s)',
              margin: 'var(--spacing-s) 0',
              'text-align': 'center',
            }}
          >
            {label()}
          </div>
        </div>
      </div>
      <div class="cu-row cu-gap-s cu-center docs-preview-grid">
        <CUButton variant="ghost" size="s" pressed={mode() === 'on'} onClick={() => host.toggle()}>
          Editor Mode: {mode() === 'on' ? 'ON' : 'OFF'}
        </CUButton>
      </div>
    </>
  )
}
