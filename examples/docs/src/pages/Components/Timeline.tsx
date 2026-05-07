import { A } from '@solidjs/router'
import {
  EditorHostProvider,
  EditorLayer,
  bind,
  select,
  signalTarget,
  string,
} from 'creo-ui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-size',
    values: 'sm / md / lg',
    def: 'md',
    meaning: 'marker + connector + spacing scale',
  },
  {
    attr: 'data-variant (on item)',
    values: 'success / warning / error / info / (default)',
    def: '—',
    meaning: 'item marker の semantic 色 hint',
  },
] as const

const TOKENS = [
  { slot: 'connector (line)', token: 'color.surface.border 2px' },
  { slot: 'marker (default)', token: 'color.surface.bg-subtle + border' },
  { slot: 'marker (semantic)', token: 'color.semantic.{success/warning/error/info}' },
  { slot: 'item gap (vertical)', token: 'spacing.m' },
  { slot: 'title', token: 'color.text.primary、 typography.weight.semibold' },
  { slot: 'description', token: 'color.text.secondary' },
  { slot: 'meta (timestamp)', token: 'color.text.tertiary、 typography.size.sm' },
] as const

export default function Timeline() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Timeline</h1>
        <p class="docs-page-lead">
          時系列の activity feed / history view。 vertical layout で marker + connector + content の
          3 要素を持つ item を順に並べる。 native <code>&lt;ol&gt;</code> + 順序付き list で a11y、
          marker は CSS で描画 (markup の <code>::before</code> pseudo)。 5 variant marker (default
          + 4 semantic) で event 種別を色で hint。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Default activity feed</div>
          <ol class="creo-timeline">
            <li class="creo-timeline-item" data-variant="success">
              <div class="creo-timeline-marker" aria-hidden="true" />
              <div class="creo-timeline-content">
                <div class="creo-timeline-title">PR #18 merged</div>
                <div class="creo-timeline-description">
                  Navigation 4 components の docs page 化 (Tabs / Breadcrumbs / Menu / Pagination)。
                </div>
                <div class="creo-timeline-meta">2 minutes ago</div>
              </div>
            </li>
            <li class="creo-timeline-item" data-variant="info">
              <div class="creo-timeline-marker" aria-hidden="true" />
              <div class="creo-timeline-content">
                <div class="creo-timeline-title">creo-ui-design v0.0.1 released</div>
                <div class="creo-timeline-description">
                  Design SSOT split 試行 verified、 6 artifacts attached to GitHub Releases。
                </div>
                <div class="creo-timeline-meta">today</div>
              </div>
            </li>
            <li class="creo-timeline-item" data-variant="warning">
              <div class="creo-timeline-marker" aria-hidden="true" />
              <div class="creo-timeline-content">
                <div class="creo-timeline-title">CI red 連続 3 回</div>
                <div class="creo-timeline-description">
                  PR #9 spacing rename leftover が表面化、 PR #11 で 4 layer 清算。
                </div>
                <div class="creo-timeline-meta">yesterday</div>
              </div>
            </li>
            <li class="creo-timeline-item">
              <div class="creo-timeline-marker" aria-hidden="true" />
              <div class="creo-timeline-content">
                <div class="creo-timeline-title">Repository created</div>
                <div class="creo-timeline-description">
                  Initial commit — design system token + Style Dictionary v4 setup。
                </div>
                <div class="creo-timeline-meta">2026-04 (1 month ago)</div>
              </div>
            </li>
          </ol>

          <div class="docs-preview-row-label">Compact (data-size="sm")</div>
          <ol class="creo-timeline" data-size="sm">
            <li class="creo-timeline-item" data-variant="success">
              <div class="creo-timeline-marker" aria-hidden="true" />
              <div class="creo-timeline-content">
                <div class="creo-timeline-title">Deploy succeeded</div>
                <div class="creo-timeline-meta">just now</div>
              </div>
            </li>
            <li class="creo-timeline-item" data-variant="error">
              <div class="creo-timeline-marker" aria-hidden="true" />
              <div class="creo-timeline-content">
                <div class="creo-timeline-title">Build failed</div>
                <div class="creo-timeline-meta">3 minutes ago</div>
              </div>
            </li>
          </ol>
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
            wrapper は <code>&lt;ol&gt;</code> (順序付き list = 時系列意義あり)、 各 item は{' '}
            <code>&lt;li&gt;</code>
          </li>
          <li>
            marker は装飾なので <code>aria-hidden="true"</code>、 状態は title / description で text
            伝達
          </li>
          <li>color だけで variant を伝えない (success/error 等の意味は文字でも明記)</li>
          <li>
            timestamp は <code>&lt;time datetime="..."&gt;</code> で structured (machine- readable)
          </li>
          <li>item 数 50+ なら virtualize 検討、 全 render は重い</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> で size / item variant / item title を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creo-ui-docs.timeline-editor',
            }}
          >
            <TimelineEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<ol class="creo-timeline">
  <li class="creo-timeline-item" data-variant="success">
    <div class="creo-timeline-marker" aria-hidden="true"></div>
    <div class="creo-timeline-content">
      <div class="creo-timeline-title">Deployed to production</div>
      <div class="creo-timeline-description">
        v0.14.0 published to npmjs.com
      </div>
      <div class="creo-timeline-meta">
        <time datetime="2026-05-06T15:00">2 minutes ago</time>
      </div>
    </div>
  </li>
  <li class="creo-timeline-item" data-variant="error">
    ...
  </li>
</ol>

<!-- Compact -->
<ol class="creo-timeline" data-size="sm">
  ...
</ol>`}</code>
        </pre>
      </section>
    </>
  )
}

type TimelineSize = 'sm' | 'md' | 'lg'
type TimelineItemVariant = 'default' | 'success' | 'warning' | 'error' | 'info'

function TimelineEditorDemo() {
  const [size, setSize] = createSignal<TimelineSize>('md')
  const [itemVariant, setItemVariant] = createSignal<TimelineItemVariant>('success')
  const [itemTitle, setItemTitle] = createSignal('PR merged')

  bind({
    target: signalTarget('timeline.size', size, (v) => setSize(v as TimelineSize)),
    control: select(['sm', 'md', 'lg'] as const),
    placement: { semantic: 'tool', group: 'timeline', label: 'Size', order: 1 },
  })
  bind({
    target: signalTarget('timeline.itemVariant', itemVariant, (v) =>
      setItemVariant(v as TimelineItemVariant),
    ),
    control: select(['default', 'success', 'warning', 'error', 'info'] as const),
    placement: { semantic: 'tool', group: 'item', label: 'Item variant', order: 1 },
  })
  bind({
    target: signalTarget('timeline.itemTitle', itemTitle, setItemTitle),
    control: string('input'),
    placement: { semantic: 'tool', group: 'item', label: 'Item title', order: 2 },
  })

  return (
    <div class="docs-playground-stage">
      <ol class="creo-timeline" data-size={size() === 'md' ? undefined : size()}>
        <li
          class="creo-timeline-item"
          data-variant={itemVariant() === 'default' ? undefined : itemVariant()}
        >
          <div class="creo-timeline-marker" aria-hidden="true" />
          <div class="creo-timeline-content">
            <div class="creo-timeline-title">{itemTitle()}</div>
            <div class="creo-timeline-description">この item の variant + title を編集中</div>
            <div class="creo-timeline-meta">just now</div>
          </div>
        </li>
        <li class="creo-timeline-item">
          <div class="creo-timeline-marker" aria-hidden="true" />
          <div class="creo-timeline-content">
            <div class="creo-timeline-title">Repository created</div>
            <div class="creo-timeline-meta">2026-04</div>
          </div>
        </li>
      </ol>
    </div>
  )
}
