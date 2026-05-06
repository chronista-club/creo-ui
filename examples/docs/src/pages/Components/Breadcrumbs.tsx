import { A } from '@solidjs/router'
import { EditorHostProvider, EditorLayer, bind, select, signalTarget } from 'creo-ui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-size',
    values: 'sm / md / lg',
    def: 'md',
    meaning: '5-step rule、 dense header なら sm、 hero page なら lg',
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
  { slot: 'font-size', token: 'typography.size.{sm/md/lg}' },
] as const

export default function Breadcrumbs() {
  return (
    <>
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
        <div class="docs-component-preview">
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
          <nav class="creo-breadcrumbs" data-size="sm" aria-label="breadcrumb sm">
            <ol class="creo-breadcrumbs-list">
              <li class="creo-breadcrumbs-item">
                <a class="creo-breadcrumbs-link" href="#h">
                  Home
                </a>
              </li>
              <li class="creo-breadcrumbs-item" aria-current="page">
                Page (sm)
              </li>
            </ol>
          </nav>
          <nav class="creo-breadcrumbs" data-size="lg" aria-label="breadcrumb lg">
            <ol class="creo-breadcrumbs-list">
              <li class="creo-breadcrumbs-item">
                <a class="creo-breadcrumbs-link" href="#h">
                  Home
                </a>
              </li>
              <li class="creo-breadcrumbs-item" aria-current="page">
                Page (lg)
              </li>
            </ol>
          </nav>
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
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> で size / separator を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creo-ui-docs.breadcrumbs-editor',
            }}
          >
            <BreadcrumbsEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
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
    </>
  )
}

type BreadcrumbsSize = 'sm' | 'md' | 'lg'
type BreadcrumbsSeparator = 'default' | 'slash' | 'dot'

function BreadcrumbsEditorDemo() {
  const [size, setSize] = createSignal<BreadcrumbsSize>('md')
  const [separator, setSeparator] = createSignal<BreadcrumbsSeparator>('default')

  bind({
    target: signalTarget('breadcrumbs.size', size, (v) => setSize(v as BreadcrumbsSize)),
    control: select(['sm', 'md', 'lg'] as const),
    placement: { semantic: 'tool', group: 'breadcrumbs', label: 'Size', order: 1 },
  })
  bind({
    target: signalTarget('breadcrumbs.separator', separator, (v) =>
      setSeparator(v as BreadcrumbsSeparator),
    ),
    control: select(['default', 'slash', 'dot'] as const),
    placement: { semantic: 'tool', group: 'breadcrumbs', label: 'Separator', order: 2 },
  })

  return (
    <div class="docs-playground-stage">
      <nav
        class="creo-breadcrumbs"
        data-size={size() === 'md' ? undefined : size()}
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
  )
}
