import {
  bind,
  EditorHostProvider,
  EditorLayer,
  number,
  select,
  signalTarget,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'
import EditorModeToggle from '../../ui/EditorModeToggle'

const PROPS = [
  {
    attr: 'data-shape',
    values: 'text / circle / rect',
    def: 'rect',
    meaning: 'placeholder の形 — text (1 行)、 circle (avatar / icon)、 rect (image / card)',
  },
  {
    attr: 'data-size (with text shape)',
    values: 's / l',
    def: 'm',
    meaning: 'text の高さ scale (s = 12px、 m = 16px、 l = 20px 等)',
  },
] as const

const TOKENS = [
  { slot: 'background', token: 'color.surface.bg-subtle' },
  { slot: 'shimmer gradient', token: 'linear-gradient with color.surface.bg-subtle stops' },
  { slot: 'animation', token: 'shimmer 1.4s ease-in-out infinite' },
  { slot: 'border-radius (text/rect)', token: 'radius.xs' },
  { slot: 'border-radius (circle)', token: 'radius.full' },
  { slot: 'reduced-motion', token: 'animation: none (a11y 配慮)' },
] as const

export default function Skeleton() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.skeleton-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Skeleton</h1>
        <p class="docs-page-lead">
          loading 中の content shape placeholder。 spinner と異なり{' '}
          <strong>最終 layout の 形を hint</strong> することで perceived performance が向上 (user は
          "何が来るか" 視覚的に予測できる)。 3 shape (text / circle / rect) を組み合わせて article
          preview / avatar list / image card 等を作る。 <code>prefers-reduced-motion: reduce</code>{' '}
          で shimmer 停止。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground skeleton の shape / width / height
          を即時編集できる。 Mode ON 中に playground skeleton を click するとその instance に field
          が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <SkeletonLivePreview />
          <div class="docs-preview-row-label">Shapes</div>
          <div
            class="creo-col creo-gap-s docs-preview-stack"
            style={{ width: '320px', gap: 'var(--spacing-s)' }}
          >
            <span class="creo-skeleton" data-shape="text" data-size="l" />
            <span class="creo-skeleton" data-shape="text" />
            <span class="creo-skeleton" data-shape="text" data-size="s" />
            <div style={{ display: 'flex', gap: 'var(--spacing-s)', 'align-items': 'center' }}>
              <span
                class="creo-skeleton"
                data-shape="circle"
                style={{ width: '44px', height: '44px' }}
              />
              <div style={{ flex: 1 }}>
                <span class="creo-skeleton" data-shape="text" />
                <span class="creo-skeleton" data-shape="text" data-size="s" />
              </div>
            </div>
            <span
              class="creo-skeleton"
              data-shape="rect"
              style={{ width: '100%', height: '120px' }}
            />
          </div>

          <div class="docs-preview-row-label">Card placeholder (composite example)</div>
          <article
            class="creo-card"
            style={{
              width: '320px',
              display: 'flex',
              'flex-direction': 'column',
              gap: 'var(--spacing-s)',
            }}
          >
            <span
              class="creo-skeleton"
              data-shape="rect"
              style={{ width: '100%', height: '160px' }}
            />
            <span class="creo-skeleton" data-shape="text" data-size="l" />
            <span class="creo-skeleton" data-shape="text" />
            <span class="creo-skeleton" data-shape="text" />
            <span class="creo-skeleton" data-shape="text" data-size="s" style={{ width: '40%' }} />
          </article>
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
        <h2 class="docs-section-title">Skeleton vs Spinner</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Skeleton</strong> — content shape を hint、 perceived performance 高、 数百 ms
            以上の load (block render 系) 向け
          </li>
          <li>
            <strong>Spinner</strong> — content 形が予測できない / 短い load (button click feedback
            等) 向け
          </li>
          <li>"何が来るか分かっている" なら skeleton、 "とりあえず処理中" なら spinner</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            container に <code>aria-busy="true"</code> を付与、 完了したら removed (screen reader が
            "loading" を読む)
          </li>
          <li>
            skeleton 自体は装飾、 <code>aria-hidden="true"</code> でも OK (text 内容 0 なので)
          </li>
          <li>
            <code>prefers-reduced-motion: reduce</code> で shimmer animation 停止 (CSS で 自動
            fallback)
          </li>
          <li>load 完了で skeleton → real content に置換、 layout shift を防ぐため形を一致</li>
          <li>長期 load (5 秒+) は skeleton + cancel button + retry など progressive UI を</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Text lines -->
<span class="creo-skeleton" data-shape="text"></span>
<span class="creo-skeleton" data-shape="text" data-size="s"></span>

<!-- Circle (avatar) -->
<span class="creo-skeleton" data-shape="circle" style="width: 44px; height: 44px"></span>

<!-- Rect (image) -->
<span class="creo-skeleton" data-shape="rect" style="width: 100%; height: 160px"></span>

<!-- Card placeholder (composite) -->
<article class="creo-card" aria-busy="true">
  <span class="creo-skeleton" data-shape="rect" style="height: 160px"></span>
  <span class="creo-skeleton" data-shape="text" data-size="l"></span>
  <span class="creo-skeleton" data-shape="text"></span>
  <span class="creo-skeleton" data-shape="text" style="width: 40%"></span>
</article>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type SkeletonShape = 'text' | 'circle' | 'rect'

/**
 * Live preview の playground。editor-host の bind() で shape / width / height を
 * inspector panel に生やし、stage の skeleton 自体を selectable にする (Mode ON で click →
 * その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function SkeletonLivePreview() {
  const [shape, setShape] = createSignal<SkeletonShape>('rect')
  const [width, setWidth] = createSignal(280)
  const [height, setHeight] = createSignal(80)

  const binders = [
    bind({
      target: signalTarget('skeleton.shape', shape, (v) => setShape(v as SkeletonShape)),
      control: select(['text', 'circle', 'rect'] as const),
      placement: { semantic: 'tool', group: 'skeleton', label: 'Shape', order: 1 },
    }),
    bind({
      target: signalTarget('skeleton.width', width, setWidth),
      control: number({ variant: 'slider' }),
      placement: { semantic: 'tool', group: 'skeleton', label: 'Width (px)', order: 2 },
    }),
    bind({
      target: signalTarget('skeleton.height', height, setHeight),
      control: number({ variant: 'slider' }),
      placement: { semantic: 'tool', group: 'skeleton', label: 'Height (px)', order: 3 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'skeleton-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        <span
          ref={selectable}
          class="creo-skeleton"
          data-shape={shape() === 'rect' ? undefined : shape()}
          style={{ width: `${width()}px`, height: `${height()}px` }}
          aria-hidden="true"
        />
      </div>
      <EditorModeToggle />
    </>
  )
}
