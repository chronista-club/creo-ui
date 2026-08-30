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
import { createSignal, For } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'
import EditorModeToggle from '../../ui/EditorModeToggle'

const PROPS = [
  {
    attr: 'data-variant',
    values: 'default / compact',
    def: 'default',
    meaning: 'compact は ellipsis 圧縮 (5+ pages を "1 … 7 8 9 … 100" 形式)',
  },
  {
    attr: 'data-size',
    values: 's / m / l',
    def: 'm',
    meaning: '5 tier convention、 table footer なら s、 mobile-first なら l (tap target)',
  },
  {
    attr: 'data-action (on .creo-pagination-item)',
    values: 'prev / next',
    def: '—',
    meaning: '矢印 button の意味、 chevron icon を render',
  },
  {
    attr: 'aria-current="page"',
    values: '"page"',
    def: '—',
    meaning: '現在 page item に必須、 visual + a11y で active state',
  },
  {
    attr: 'aria-label (on nav)',
    values: '"pagination"',
    def: '—',
    meaning: 'screen reader 認識用、 nav 要素に必須',
  },
] as const

const TOKENS = [
  { slot: 'item bg (default)', token: 'transparent' },
  { slot: 'item bg (hover)', token: 'color.surface.bg-subtle' },
  { slot: 'item bg (current)', token: 'color.brand.primary-subtle' },
  { slot: 'item color (default)', token: 'color.text.secondary' },
  { slot: 'item color (current)', token: 'color.brand.primary' },
  { slot: 'item size (s/m/l)', token: '32 / 40 / 44 px (l = tap target)' },
  { slot: 'gap', token: 'layout.gap.tight' },
  { slot: 'border-radius', token: 'radius.s' },
] as const

export default function Pagination() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.pagination-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Pagination</h1>
        <p class="docs-page-lead">
          page 群を行き来する numbered navigation。 native <code>&lt;nav&gt;</code> +{' '}
          <code>&lt;ol&gt;</code> + 順序付き list で a11y 確保、 <code>aria-current="page"</code>{' '}
          で現在 page を明示。 prev/next の chevron は <code>data-action</code> で示し、 ellipsis (
          <code>…</code>) で長 list を圧縮。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground pagination の variant / size / current page
          を即時編集できる。 Mode ON 中に playground pagination を click するとその instance に
          field が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <PaginationLivePreview />
          <div class="docs-preview-row-label">Default (full pages)</div>
          <nav class="creo-pagination" aria-label="pagination">
            <ol class="creo-pagination-list">
              <li>
                <button
                  type="button"
                  class="creo-pagination-item"
                  data-action="prev"
                  aria-label="previous page"
                >
                  ‹
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  1
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item" aria-current="page">
                  2
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  3
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  4
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  5
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="creo-pagination-item"
                  data-action="next"
                  aria-label="next page"
                >
                  ›
                </button>
              </li>
            </ol>
          </nav>

          <div class="docs-preview-row-label">Compact (with ellipsis)</div>
          <nav class="creo-pagination" data-variant="compact" aria-label="pagination compact">
            <ol class="creo-pagination-list">
              <li>
                <button
                  type="button"
                  class="creo-pagination-item"
                  data-action="prev"
                  aria-label="previous"
                >
                  ‹
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  1
                </button>
              </li>
              <li>
                <span class="creo-pagination-ellipsis" aria-hidden="true">
                  …
                </span>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  7
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item" aria-current="page">
                  8
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  9
                </button>
              </li>
              <li>
                <span class="creo-pagination-ellipsis" aria-hidden="true">
                  …
                </span>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  100
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="creo-pagination-item"
                  data-action="next"
                  aria-label="next"
                >
                  ›
                </button>
              </li>
            </ol>
          </nav>

          <div class="docs-preview-row-label">Sizes</div>
          <nav class="creo-pagination" data-size="s" aria-label="pagination s">
            <ol class="creo-pagination-list">
              <li>
                <button type="button" class="creo-pagination-item" aria-current="page">
                  1
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  2
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  3
                </button>
              </li>
            </ol>
          </nav>
          <nav class="creo-pagination" data-size="l" aria-label="pagination l">
            <ol class="creo-pagination-list">
              <li>
                <button type="button" class="creo-pagination-item" aria-current="page">
                  1
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  2
                </button>
              </li>
              <li>
                <button type="button" class="creo-pagination-item">
                  3
                </button>
              </li>
            </ol>
          </nav>
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
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            wrapper は <code>&lt;nav aria-label="pagination"&gt;</code>、 list は順序付き{' '}
            <code>&lt;ol&gt;</code>
          </li>
          <li>
            現在 page に <code>aria-current="page"</code>、 visual + screen reader 両方
          </li>
          <li>
            prev / next は icon-only なら <code>aria-label</code> 必須 (例:{' '}
            <code>aria-label="previous page"</code>)
          </li>
          <li>
            ellipsis は装飾、 <code>aria-hidden="true"</code> で screen reader 読み飛ばし
          </li>
          <li>tap target ≥ 44pt (l variant) を mobile-first で守る</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<nav class="creo-pagination" aria-label="pagination">
  <ol class="creo-pagination-list">
    <li>
      <button type="button" class="creo-pagination-item"
              data-action="prev" aria-label="previous">‹</button>
    </li>
    <li><button type="button" class="creo-pagination-item">1</button></li>
    <li><button type="button" class="creo-pagination-item"
                aria-current="page">2</button></li>
    <li><button type="button" class="creo-pagination-item">3</button></li>
    <li>
      <button type="button" class="creo-pagination-item"
              data-action="next" aria-label="next">›</button>
    </li>
  </ol>
</nav>

<!-- Compact with ellipsis -->
<nav class="creo-pagination" data-variant="compact" aria-label="pagination">
  <ol class="creo-pagination-list">
    <li><button class="creo-pagination-item">1</button></li>
    <li><span class="creo-pagination-ellipsis" aria-hidden>…</span></li>
    <li><button class="creo-pagination-item" aria-current="page">8</button></li>
    ...
  </ol>
</nav>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type PaginationVariant = 'default' | 'compact'
type PaginationSize = 's' | 'm' | 'l'

/**
 * Live preview の playground。editor-host の bind() で variant / size / current page を
 * inspector panel に生やし、stage の pagination 自体を selectable にする (Mode ON で click →
 * その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function PaginationLivePreview() {
  const [variant, setVariant] = createSignal<PaginationVariant>('default')
  const [size, setSize] = createSignal<PaginationSize>('m')
  const [current, setCurrent] = createSignal(3)
  const totalPages = 7

  const binders = [
    bind({
      target: signalTarget('pagination.variant', variant, (v) =>
        setVariant(v as PaginationVariant),
      ),
      control: select(['default', 'compact'] as const),
      placement: { semantic: 'tool', group: 'pagination', label: 'Variant', order: 1 },
    }),
    bind({
      target: signalTarget('pagination.size', size, (v) => setSize(v as PaginationSize)),
      control: select(['s', 'm', 'l'] as const),
      placement: { semantic: 'tool', group: 'pagination', label: 'Size', order: 2 },
    }),
    bind({
      target: signalTarget('pagination.current', current, setCurrent),
      control: number({ variant: 'slider' }),
      placement: { semantic: 'tool', group: 'pagination', label: 'Current page', order: 3 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'pagination-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="cu-row cu-center docs-playground-stage">
        <nav
          ref={selectable}
          class="creo-pagination"
          data-variant={variant() === 'default' ? undefined : variant()}
          data-size={size() === 'm' ? undefined : size()}
          aria-label="pagination editor demo"
        >
          <ol class="creo-pagination-list">
            <li>
              <button
                type="button"
                class="creo-pagination-item"
                data-action="prev"
                aria-label="previous page"
                disabled={current() <= 1}
                onClick={() => setCurrent(Math.max(1, current() - 1))}
              >
                ‹
              </button>
            </li>
            <For each={Array.from({ length: totalPages }, (_, i) => i + 1)}>
              {(p) => (
                <li>
                  <button
                    type="button"
                    class="creo-pagination-item"
                    aria-current={current() === p ? 'page' : undefined}
                    onClick={() => setCurrent(p)}
                  >
                    {p}
                  </button>
                </li>
              )}
            </For>
            <li>
              <button
                type="button"
                class="creo-pagination-item"
                data-action="next"
                aria-label="next page"
                disabled={current() >= totalPages}
                onClick={() => setCurrent(Math.min(totalPages, current() + 1))}
              >
                ›
              </button>
            </li>
          </ol>
        </nav>
      </div>
      <EditorModeToggle />
    </>
  )
}
