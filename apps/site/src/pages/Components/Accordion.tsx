import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
  select,
  signalTarget,
  string,
  useEditorHost,
  useEditorMode,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { CUButton } from '@chronista-club/creo-ui/controls'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-variant',
    values: 'default (bordered) / subtle',
    def: 'default',
    meaning: 'bordered は 各 item border + radius、 subtle は border なしで minimal',
  },
  {
    attr: 'open (on <details>)',
    values: '(boolean attribute)',
    def: '—',
    meaning: 'native HTML、 初期 expand state',
  },
  {
    attr: 'name (on <details>)',
    values: '(string)',
    def: '—',
    meaning: '同 name の details で「1 つだけ open」 (exclusive accordion、 Chrome 120+)',
  },
] as const

const TOKENS = [
  { slot: 'border (bordered)', token: 'color.surface.border 1px' },
  { slot: 'border-radius', token: 'radius.m' },
  { slot: 'summary padding', token: 'spacing.s × spacing.m' },
  { slot: 'content padding', token: 'spacing.m × spacing.m' },
  { slot: 'chevron', token: '→ rotate 90deg on [open]、 transition motion.duration.fast' },
  { slot: 'background (open)', token: 'color.surface.surface' },
] as const

export default function Accordion() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.accordion-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Accordion</h1>
        <p class="docs-page-lead">
          collapsible content panels。 native <code>&lt;details&gt;</code> +{' '}
          <code>&lt;summary&gt;</code> で a11y / keyboard / animation を browser に任せる JS-zero
          実装。 <code>name</code> 属性 (Chrome 120+) で exclusive accordion (1 つだけ open) も
          native 対応。 chevron rotation は CSS-only。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground accordion の variant / exclusive / open state /
          title を即時編集できる。 Mode ON 中に playground accordion を click するとその instance に
          field が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <AccordionLivePreview />
          <div class="docs-preview-row-label">Default (bordered)</div>
          <div class="creo-accordion">
            <details class="creo-accordion-item" open>
              <summary class="creo-accordion-summary">
                <span class="creo-accordion-title">Frame system</span>
              </summary>
              <div class="creo-accordion-content">
                <p>
                  3D Frame system protocol — 名前付き spatial container + slot binding。 view
                  component が slot に bind され、 setFrame() で morph trigger。
                </p>
              </div>
            </details>
            <details class="creo-accordion-item">
              <summary class="creo-accordion-summary">
                <span class="creo-accordion-title">Editor Mode</span>
              </summary>
              <div class="creo-accordion-content">
                <p>
                  universal Editor Mode protocol — field 宣言 / 4 方向 layout / Content 非侵襲性 /
                  AI agent access。
                </p>
              </div>
            </details>
            <details class="creo-accordion-item">
              <summary class="creo-accordion-summary">
                <span class="creo-accordion-title">Vision input</span>
              </summary>
              <div class="creo-accordion-content">
                <p>
                  Webcam motion capture (MediaPipe) + on-device only。 Apple Vision Pro 思想 —
                  gesture は fluent input layer (keyboard/mouse の上に乗る、 primary 化しない)。
                </p>
              </div>
            </details>
          </div>

          <div class="docs-preview-row-label">Subtle variant</div>
          <div class="creo-accordion" data-variant="subtle">
            <details class="creo-accordion-item">
              <summary class="creo-accordion-summary">
                <span class="creo-accordion-title">FAQ 1</span>
              </summary>
              <div class="creo-accordion-content">
                <p>Subtle variant — border なしの minimal 表現、 dense info 群に。</p>
              </div>
            </details>
            <details class="creo-accordion-item">
              <summary class="creo-accordion-summary">
                <span class="creo-accordion-title">FAQ 2</span>
              </summary>
              <div class="creo-accordion-content">
                <p>長い content が下に展開、 click で toggle。</p>
              </div>
            </details>
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
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            native <code>&lt;details&gt;</code> + <code>&lt;summary&gt;</code> で keyboard / screen
            reader / open-close は all-browser 自動
          </li>
          <li>summary に icon 単独でなく必ず文字 title (識別性)</li>
          <li>
            exclusive (1 つだけ open) は <code>name</code> 属性 (Chrome 120+ / Safari TP)、 未対応
            browser は普通の accordion (graceful fallback)
          </li>
          <li>長 content (画面 80%+) は accordion でなく別 page / dialog 検討</li>
          <li>focus は summary、 content はその下、 Tab 順自然</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<div class="creo-accordion">
  <details class="creo-accordion-item" open>
    <summary class="creo-accordion-summary">
      <span class="creo-accordion-title">Frame system</span>
    </summary>
    <div class="creo-accordion-content">
      <p>3D Frame system protocol — ...</p>
    </div>
  </details>
  <details class="creo-accordion-item">
    <summary class="creo-accordion-summary">
      <span class="creo-accordion-title">Editor Mode</span>
    </summary>
    <div class="creo-accordion-content">
      ...
    </div>
  </details>
</div>

<!-- Exclusive (Chrome 120+: name attribute) -->
<div class="creo-accordion">
  <details name="faq" open><summary>...</summary>...</details>
  <details name="faq"><summary>...</summary>...</details>
  <details name="faq"><summary>...</summary>...</details>
</div>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type AccordionVariant = 'bordered' | 'subtle'

/**
 * Live preview の playground。editor-host の bind() で variant / exclusive / open state / title
 * を inspector panel に生やし、stage の accordion 自体を selectable にする (Mode ON で click →
 * その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function AccordionLivePreview() {
  const host = useEditorHost()
  const mode = useEditorMode()

  const [variant, setVariant] = createSignal<AccordionVariant>('bordered')
  const [exclusive, setExclusive] = createSignal(false)
  const [firstOpen, setFirstOpen] = createSignal(true)
  const [title, setTitle] = createSignal('Frame system')

  const binders = [
    bind({
      target: signalTarget('accordion.variant', variant, (v) => setVariant(v as AccordionVariant)),
      control: select(['bordered', 'subtle'] as const),
      placement: { semantic: 'tool', group: 'accordion', label: 'Variant', order: 1 },
    }),
    bind({
      target: signalTarget('accordion.exclusive', exclusive, setExclusive),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'accordion', label: 'Exclusive (name attr)', order: 2 },
    }),
    bind({
      target: signalTarget('accordion.firstOpen', firstOpen, setFirstOpen),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'accordion', label: 'First item open', order: 3 },
    }),
    bind({
      target: signalTarget('accordion.title', title, setTitle),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'First item title', order: 1 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'accordion-live-preview' })

  // exclusive ON → 同 name の details 群で「1 つだけ open」 (Chrome 120+ native)
  const groupName = () => (exclusive() ? 'accordion-playground' : undefined)

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        <div
          ref={selectable}
          class="creo-accordion"
          data-variant={variant()}
          style={{ width: '100%', 'max-width': '480px' }}
        >
          <details class="creo-accordion-item" name={groupName()} open={firstOpen()}>
            <summary class="creo-accordion-summary">
              <span class="creo-accordion-title">{title()}</span>
            </summary>
            <div class="creo-accordion-content">
              <p>
                3D Frame system protocol — 名前付き spatial container + slot binding。 setFrame() で
                morph trigger。
              </p>
            </div>
          </details>
          <details class="creo-accordion-item" name={groupName()}>
            <summary class="creo-accordion-summary">
              <span class="creo-accordion-title">Editor Mode</span>
            </summary>
            <div class="creo-accordion-content">
              <p>
                universal Editor Mode protocol — field 宣言 / 4 方向 layout / Content 非侵襲性。
              </p>
            </div>
          </details>
          <details class="creo-accordion-item" name={groupName()}>
            <summary class="creo-accordion-summary">
              <span class="creo-accordion-title">Vision input</span>
            </summary>
            <div class="creo-accordion-content">
              <p>Webcam motion capture + on-device only — gesture は fluent input layer。</p>
            </div>
          </details>
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
