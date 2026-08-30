import {
  bind,
  EditorHostProvider,
  EditorLayer,
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
    attr: 'data-size',
    values: 's / m / l',
    def: 'm',
    meaning: '5 tier convention、 dense header なら s、 hero page なら l',
  },
  {
    attr: 'data-separator',
    values: 'default (chevron) / slash / dot',
    def: 'default',
    meaning: 'item 間の分隔記号 — chevron "›" / slash "/" / dot "·"',
  },
  {
    attr: 'aria-label="breadcrumb"',
    values: '(string)',
    def: '—',
    meaning: 'nav 要素に必須、 screen reader 認識用',
  },
  {
    attr: 'aria-current="page"',
    values: '"page"',
    def: '—',
    meaning: '現在 page 項目に必須、 link でなく text として render',
  },
] as const

const TOKENS = [
  { slot: 'text (link)', token: 'color.text.secondary' },
  { slot: 'text (current page)', token: 'color.text.primary' },
  { slot: 'separator color', token: 'color.text.tertiary' },
  { slot: 'gap (item + separator)', token: 'layout.gap.tight' },
  { slot: 'font-size', token: 'typography.size.{s/m/l}' },
] as const

export default function Breadcrumbs() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.breadcrumbs-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Breadcrumbs</h1>
        <p class="docs-page-lead">
          階層 navigation の trail。 user の現在位置を context で示す + 上位 page への即時 jump
          を提供。 native HTML <code>&lt;nav&gt;</code> + <code>&lt;ol&gt;</code> + 順序付き list で
          a11y 自動、 separator は <code>::after</code> pseudo で挿入 (markup 不要)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground breadcrumbs の size / separator
          を即時編集できる。 Mode ON 中に playground breadcrumbs を click するとその instance に
          field が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <BreadcrumbsLivePreview />
          <div class="docs-preview-row-label">Default (chevron separator)</div>
          <nav class="creo-breadcrumbs" aria-label="breadcrumb">
            <ol class="creo-breadcrumbs-list">
              <li class="creo-breadcrumbs-item">
                <a class="creo-breadcrumbs-link" href="#home">
                  Home
                </a>
              </li>
              <li class="creo-breadcrumbs-item">
                <a class="creo-breadcrumbs-link" href="#foundations">
                  Foundations
                </a>
              </li>
              <li class="creo-breadcrumbs-item" aria-current="page">
                Color
              </li>
            </ol>
          </nav>

          <div class="docs-preview-row-label">Slash separator</div>
          <nav class="creo-breadcrumbs" data-separator="slash" aria-label="breadcrumb">
            <ol class="creo-breadcrumbs-list">
              <li class="creo-breadcrumbs-item">
                <a class="creo-breadcrumbs-link" href="#docs">
                  docs
                </a>
              </li>
              <li class="creo-breadcrumbs-item">
                <a class="creo-breadcrumbs-link" href="#components">
                  components
                </a>
              </li>
              <li class="creo-breadcrumbs-item" aria-current="page">
                breadcrumbs
              </li>
            </ol>
          </nav>

          <div class="docs-preview-row-label">Dot separator</div>
          <nav class="creo-breadcrumbs" data-separator="dot" aria-label="breadcrumb">
            <ol class="creo-breadcrumbs-list">
              <li class="creo-breadcrumbs-item">
                <a class="creo-breadcrumbs-link" href="#a">
                  Workspace
                </a>
              </li>
              <li class="creo-breadcrumbs-item">
                <a class="creo-breadcrumbs-link" href="#b">
                  Project
                </a>
              </li>
              <li class="creo-breadcrumbs-item" aria-current="page">
                README.md
              </li>
            </ol>
          </nav>

          <div class="docs-preview-row-label">Sizes</div>
          <nav class="creo-breadcrumbs" data-size="s" aria-label="breadcrumb s">
            <ol class="creo-breadcrumbs-list">
              <li class="creo-breadcrumbs-item">
                <a class="creo-breadcrumbs-link" href="#h">
                  Home
                </a>
              </li>
              <li class="creo-breadcrumbs-item" aria-current="page">
                Page (s)
              </li>
            </ol>
          </nav>
          <nav class="creo-breadcrumbs" data-size="l" aria-label="breadcrumb l">
            <ol class="creo-breadcrumbs-list">
              <li class="creo-breadcrumbs-item">
                <a class="creo-breadcrumbs-link" href="#h">
                  Home
                </a>
              </li>
              <li class="creo-breadcrumbs-item" aria-current="page">
                Page (l)
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
            wrapper は <code>&lt;nav aria-label="breadcrumb"&gt;</code>、 list は{' '}
            <code>&lt;ol&gt;</code> (順序付き = 階層意義あり)
          </li>
          <li>
            現在 page は <code>aria-current="page"</code>、 link でなく <code>span</code>/text で
            render
          </li>
          <li>
            separator は <code>::after</code> CSS、 markup 不要 (screen reader 読み飛ばし)
          </li>
          <li>長い path は中略可能だが、 user の方向感を失わせない bound を保つ</li>
          <li>3-5 hop が理想、 7+ hop ある page は IA 再考の signal</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<nav class="creo-breadcrumbs" aria-label="breadcrumb">
  <ol class="creo-breadcrumbs-list">
    <li class="creo-breadcrumbs-item">
      <a class="creo-breadcrumbs-link" href="/">Home</a>
    </li>
    <li class="creo-breadcrumbs-item">
      <a class="creo-breadcrumbs-link" href="/foundations">Foundations</a>
    </li>
    <li class="creo-breadcrumbs-item" aria-current="page">Color</li>
  </ol>
</nav>

<!-- Slash separator -->
<nav class="creo-breadcrumbs" data-separator="slash" aria-label="breadcrumb">
  ...
</nav>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type BreadcrumbsSize = 's' | 'm' | 'l'
type BreadcrumbsSeparator = 'default' | 'slash' | 'dot'

/**
 * Live preview の playground。editor-host の bind() で size / separator を
 * inspector panel に生やし、stage の breadcrumbs 自体を selectable にする (Mode ON で click →
 * その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function BreadcrumbsLivePreview() {
  const [size, setSize] = createSignal<BreadcrumbsSize>('m')
  const [separator, setSeparator] = createSignal<BreadcrumbsSeparator>('default')

  const binders = [
    bind({
      target: signalTarget('breadcrumbs.size', size, (v) => setSize(v as BreadcrumbsSize)),
      control: select(['s', 'm', 'l'] as const),
      placement: { semantic: 'tool', group: 'breadcrumbs', label: 'Size', order: 1 },
    }),
    bind({
      target: signalTarget('breadcrumbs.separator', separator, (v) =>
        setSeparator(v as BreadcrumbsSeparator),
      ),
      control: select(['default', 'slash', 'dot'] as const),
      placement: { semantic: 'tool', group: 'breadcrumbs', label: 'Separator', order: 2 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'breadcrumbs-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="cu-row cu-center docs-playground-stage">
        <nav
          ref={selectable}
          class="creo-breadcrumbs"
          data-size={size() === 'm' ? undefined : size()}
          data-separator={separator() === 'default' ? undefined : separator()}
          aria-label="breadcrumb editor demo"
        >
          <ol class="creo-breadcrumbs-list">
            <li class="creo-breadcrumbs-item">
              <a class="creo-breadcrumbs-link" href="#home">
                Home
              </a>
            </li>
            <li class="creo-breadcrumbs-item">
              <a class="creo-breadcrumbs-link" href="#components">
                Components
              </a>
            </li>
            <li class="creo-breadcrumbs-item" aria-current="page">
              Breadcrumbs
            </li>
          </ol>
        </nav>
      </div>
      <EditorModeToggle />
    </>
  )
}
