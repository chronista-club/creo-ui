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
    attr: 'data-placement (on .creo-tooltip-content)',
    values: 'top / bottom / left / right',
    def: 'top',
    meaning: '出現方向、 親要素の各辺から popup',
  },
] as const

const TOKENS = [
  { slot: 'background', token: 'color.surface.bg-emphasis' },
  { slot: 'text color', token: 'color.text.primary' },
  { slot: 'padding', token: 'spacing.xs × spacing.s' },
  { slot: 'border-radius', token: 'radius.xs' },
  { slot: 'shadow', token: 'shadow.m' },
  { slot: 'font-size', token: 'typography.body.caption' },
  { slot: 'transition', token: '120ms ease (opacity + transform)' },
  { slot: 'max-width', token: '280px (line wrap 防止 + 適切な breakpoint)' },
] as const

export default function Tooltip() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.tooltip-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Tooltip</h1>
        <p class="docs-page-lead">
          hover / focus 時に補足情報を表示する CSS-only popover。 JS 不要、{' '}
          <code>.creo-tooltip</code> wrapper の <code>:hover</code> / <code>:focus-within</code> で{' '}
          <code>.creo-tooltip-content</code> が可視化。 4 placement (top / bottom / left / right) を{' '}
          <code>data-placement</code> で指定可能。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground tooltip の placement (4 方向) / content
          を即時編集できる。 Mode ON 中に playground tooltip を click するとその instance に field
          が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <TooltipLivePreview />
          <div class="docs-preview-row-label">Placements (hover / focus me)</div>
          <div class="docs-preview-grid">
            <span class="creo-tooltip">
              <button type="button" class="creo-btn" data-variant="secondary">
                Top (default)
              </button>
              <span class="creo-tooltip-content" role="tooltip">
                Tooltip text on top
              </span>
            </span>
            <span class="creo-tooltip">
              <button type="button" class="creo-btn" data-variant="secondary">
                Bottom
              </button>
              <span class="creo-tooltip-content" role="tooltip" data-placement="bottom">
                Bottom placement
              </span>
            </span>
            <span class="creo-tooltip">
              <button type="button" class="creo-btn" data-variant="secondary">
                Left
              </button>
              <span class="creo-tooltip-content" role="tooltip" data-placement="left">
                Left placement
              </span>
            </span>
            <span class="creo-tooltip">
              <button type="button" class="creo-btn" data-variant="secondary">
                Right
              </button>
              <span class="creo-tooltip-content" role="tooltip" data-placement="right">
                Right placement
              </span>
            </span>
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
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            content は <code>role="tooltip"</code> を持たせる (screen reader 認識)
          </li>
          <li>
            trigger は focusable element に (button / a / input)、 <code>:focus-within</code> で
            keyboard でも展開
          </li>
          <li>
            tooltip 内の情報は <strong>必須でない補足</strong> に限定 (隠れて見えない人もいる)
          </li>
          <li>
            長文は max-width 280px で line wrap、 それを超えるなら別 component (popover) を検討
          </li>
          <li>
            <code>prefers-reduced-motion</code> 時は transition 無効 (CSS で fallback)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Tooltip vs Popover</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Tooltip</strong> — hover/focus で出る補足、 <strong>非 interactive</strong>、
            短い text 1 行
          </li>
          <li>
            <strong>Popover</strong> — click で出る、 <strong>interactive</strong> (内部 button /
            link)、 多行 / form / actions
          </li>
          <li>「click したい中身」 があるなら popover、 「読むだけ」 なら tooltip</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<span class="creo-tooltip">
  <button type="button" class="creo-btn" data-variant="ghost">
    Save
  </button>
  <span class="creo-tooltip-content" role="tooltip">
    Save changes (Ctrl+S)
  </span>
</span>

<!-- placement override -->
<span class="creo-tooltip">
  <button type="button" class="creo-btn">Help</button>
  <span class="creo-tooltip-content" role="tooltip" data-placement="bottom">
    Show keyboard shortcuts
  </span>
</span>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

function TooltipLivePreview() {
  const [placement, setPlacement] = createSignal<TooltipPlacement>('top')
  const [content, setContent] = createSignal('Save changes (Ctrl+S)')

  const binders = [
    bind({
      target: signalTarget('tooltip.placement', placement, (v) =>
        setPlacement(v as TooltipPlacement),
      ),
      control: select(['top', 'bottom', 'left', 'right'] as const),
      placement: { semantic: 'tool', group: 'tooltip', label: 'Placement', order: 1 },
    }),
    bind({
      target: signalTarget('tooltip.content', content, setContent),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Tooltip text', order: 1 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'tooltip-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div
        class="docs-playground-stage"
        style={{ 'min-height': '120px', 'align-items': 'center', 'justify-content': 'center' }}
      >
        <span ref={selectable} class="creo-tooltip">
          <button type="button" class="creo-btn" data-variant="secondary">
            Hover / focus me
          </button>
          <span
            class="creo-tooltip-content"
            role="tooltip"
            data-placement={placement() === 'top' ? undefined : placement()}
          >
            {content()}
          </span>
        </span>
      </div>
      <EditorModeToggle />
    </>
  )
}
