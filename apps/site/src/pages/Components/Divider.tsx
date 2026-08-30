import { CUButton } from '@chronista-club/creo-ui/controls'
import {
  bind,
  EditorHostProvider,
  EditorLayer,
  select,
  signalTarget,
  useEditorHost,
  useEditorMode,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'

const PROPS = [
  {
    attr: 'data-orientation',
    values: 'horizontal (default) / vertical',
    def: 'horizontal',
    meaning: '線の方向、 vertical は inline-flex 等の同 row 内で使用',
  },
  {
    attr: 'data-thickness',
    values: 'thin (1px、 default) / thick (2px)',
    def: 'thin',
    meaning: '線の太さ、 強調したい場合 thick',
  },
  {
    attr: 'data-spacing',
    values: 'xs / s / m (default) / l / xl',
    def: 'm',
    meaning: 'spacing 5-step、 margin override',
  },
  {
    attr: 'data-variant',
    values: 'subtle',
    def: '—',
    meaning: 'low-emphasis (bg-subtle 色)、 軽い区切り',
  },
] as const

const TOKENS = [
  { slot: 'background (default)', token: 'color.surface.border' },
  { slot: 'background (subtle)', token: 'color.surface.bg-subtle' },
  { slot: 'thickness (thin/thick)', token: '1px / 2px' },
  { slot: 'margin (xs/s/m/l/xl)', token: 'spacing.{xs/s/m/l/xl}' },
] as const

export default function Divider() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.divider-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components — Layout</p>
        <h1>Divider</h1>
        <p class="docs-page-lead">
          区切り線 — section 間の視覚的境界。 native <code>&lt;hr&gt;</code> + class で a11y 自動
          (separator role)。 horizontal (default) / vertical、 thin / thick、 spacing 5-step、
          default / subtle variant。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground divider の orientation / thickness / spacing /
          variant を即時編集できる。 Mode ON 中に playground divider を click するとその instance に
          field が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <DividerLivePreview />
          <div class="docs-preview-row-label">Horizontal (default)</div>
          <div>
            <p>Section A の content</p>
            <hr class="creo-divider" />
            <p>Section B の content</p>
          </div>

          <div class="docs-preview-row-label">Thick + spacing "l"</div>
          <div>
            <p>Top section</p>
            <hr class="creo-divider" data-thickness="thick" data-spacing="l" />
            <p>Bottom section (大きな視覚分離)</p>
          </div>

          <div class="docs-preview-row-label">Subtle (low-emphasis)</div>
          <div>
            <p>line 1</p>
            <hr class="creo-divider" data-variant="subtle" data-spacing="s" />
            <p>line 2 (軽い区切り)</p>
          </div>

          <div class="docs-preview-row-label">Vertical (inline 内 separator)</div>
          <div
            style={{
              display: 'flex',
              'align-items': 'center',
              gap: 'var(--spacing-s)',
              height: '40px',
            }}
          >
            <span>Home</span>
            <hr class="creo-divider" data-orientation="vertical" data-spacing="xs" />
            <span>Docs</span>
            <hr class="creo-divider" data-orientation="vertical" data-spacing="xs" />
            <span>Components</span>
            <hr class="creo-divider" data-orientation="vertical" data-spacing="xs" />
            <span>Lab</span>
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
            native <code>&lt;hr&gt;</code> = <code>role="separator"</code> 自動、 screen reader が
            "separator" を読む
          </li>
          <li>
            vertical orientation でも <code>&lt;hr&gt;</code> 推奨 (semantic 維持)
          </li>
          <li>過度に divider を使わない (3-5 sections 以上は別 layout 検討)</li>
          <li>
            装飾目的のみなら <code>aria-hidden="true"</code> を付与
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Horizontal (default) -->
<hr class="creo-divider" />

<!-- Thick + larger spacing -->
<hr class="creo-divider" data-thickness="thick" data-spacing="l" />

<!-- Subtle (low-emphasis) -->
<hr class="creo-divider" data-variant="subtle" data-spacing="s" />

<!-- Vertical (inline) -->
<div style="display: flex; align-items: center; gap: 8px">
  <span>Home</span>
  <hr class="creo-divider" data-orientation="vertical" data-spacing="xs" />
  <span>Docs</span>
</div>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type DividerOrientation = 'horizontal' | 'vertical'
type DividerThickness = 'thin' | 'thick'
type DividerSpacing = 'xs' | 's' | 'm' | 'l' | 'xl'
type DividerVariant = 'default' | 'subtle'

/**
 * Live preview の playground。editor-host の bind() で orientation / thickness / spacing /
 * variant を inspector panel に生やし、stage の hr 自体を selectable にする (Mode ON で click →
 * その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function DividerLivePreview() {
  const host = useEditorHost()
  const mode = useEditorMode()

  const [orientation, setOrientation] = createSignal<DividerOrientation>('horizontal')
  const [thickness, setThickness] = createSignal<DividerThickness>('thin')
  const [spacing, setSpacing] = createSignal<DividerSpacing>('m')
  const [variant, setVariant] = createSignal<DividerVariant>('default')

  const binders = [
    bind({
      target: signalTarget('divider.orientation', orientation, (v) =>
        setOrientation(v as DividerOrientation),
      ),
      control: select(['horizontal', 'vertical'] as const),
      placement: { semantic: 'tool', group: 'divider', label: 'Orientation', order: 1 },
    }),
    bind({
      target: signalTarget('divider.thickness', thickness, (v) =>
        setThickness(v as DividerThickness),
      ),
      control: select(['thin', 'thick'] as const),
      placement: { semantic: 'tool', group: 'divider', label: 'Thickness', order: 2 },
    }),
    bind({
      target: signalTarget('divider.spacing', spacing, (v) => setSpacing(v as DividerSpacing)),
      control: select(['xs', 's', 'm', 'l', 'xl'] as const),
      placement: { semantic: 'tool', group: 'divider', label: 'Spacing', order: 3 },
    }),
    bind({
      target: signalTarget('divider.variant', variant, (v) => setVariant(v as DividerVariant)),
      control: select(['default', 'subtle'] as const),
      placement: { semantic: 'tool', group: 'divider', label: 'Variant', order: 4 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'divider-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        {/* orientation で flex 方向を切替 — hr element は作り直さず attribute のみ変える */}
        <div
          style={{
            display: 'flex',
            'flex-direction': orientation() === 'vertical' ? 'row' : 'column',
            'align-items': 'center',
            'justify-content': 'center',
            width: '100%',
            'max-width': '360px',
            'min-height': '64px',
          }}
        >
          <span>Section A</span>
          <hr
            ref={selectable}
            class="creo-divider"
            data-orientation={orientation()}
            data-thickness={thickness()}
            data-spacing={spacing()}
            data-variant={variant() === 'subtle' ? 'subtle' : undefined}
          />
          <span>Section B</span>
        </div>
      </div>
      <div class="docs-preview-grid">
        <CUButton variant="ghost" size="s" pressed={mode() === 'on'} onClick={() => host.toggle()}>
          Editor Mode: {mode() === 'on' ? 'ON' : 'OFF'}
        </CUButton>
      </div>
    </>
  )
}
