import { CUButton } from '@chronista-club/creo-ui/controls'
import {
  bind,
  boolean,
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
          {/* .creo-accordion は details 1 つ = 1 disclosure に付ける (container ではない)。
              margin-bottom で間隔、border/radius/elevation で 1 件の外枠が付く。 */}
          <details class="creo-accordion" open>
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
          <details class="creo-accordion">
            <summary class="creo-accordion-summary">
              <span class="creo-accordion-title">Editor Mode</span>
            </summary>
            <div class="creo-accordion-content">
              <p>
                universal Editor Mode protocol — field 宣言 / 4 方向 layout / Content 非侵襲性 / AI
                agent access。
              </p>
            </div>
          </details>
          <details class="creo-accordion">
            <summary class="creo-accordion-summary">
              <span class="creo-accordion-title">Vision input</span>
            </summary>
            <div class="creo-accordion-content">
              <p>
                Webcam motion capture (MediaPipe) + on-device only。 Apple Vision Pro 思想 — gesture
                は fluent input layer (keyboard/mouse の上に乗る、 primary 化しない)。
              </p>
            </div>
          </details>

          <div class="docs-preview-row-label">Subtle variant</div>
          <details class="creo-accordion" data-variant="subtle">
            <summary class="creo-accordion-summary">
              <span class="creo-accordion-title">FAQ 1</span>
            </summary>
            <div class="creo-accordion-content">
              <p>Subtle variant — border なしの minimal 表現、 dense info 群に。</p>
            </div>
          </details>
          <details class="creo-accordion" data-variant="subtle">
            <summary class="creo-accordion-summary">
              <span class="creo-accordion-title">FAQ 2</span>
            </summary>
            <div class="creo-accordion-content">
              <p>長い content が下に展開、 click で toggle。</p>
            </div>
          </details>
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
          <code>{`<!-- .creo-accordion は details 1 つ = 1 disclosure に付ける。
     複数並べるときは container で包まず、そのまま並べる
     (margin-bottom が間隔を作る)。 -->
<details class="creo-accordion" open>
  <summary class="creo-accordion-summary">
    <span class="creo-accordion-title">Frame system</span>
  </summary>
  <div class="creo-accordion-content">
    <p>3D Frame system protocol — ...</p>
  </div>
</details>
<details class="creo-accordion">
  <summary class="creo-accordion-summary">
    <span class="creo-accordion-title">Editor Mode</span>
  </summary>
  <div class="creo-accordion-content">
    ...
  </div>
</details>

<!-- subtle variant は各 details に付ける -->
<details class="creo-accordion" data-variant="subtle">...</details>

<!-- Exclusive (Chrome 120+: name attribute) -->
<details class="creo-accordion" name="faq" open><summary>...</summary>...</details>
<details class="creo-accordion" name="faq"><summary>...</summary>...</details>
<details class="creo-accordion" name="faq"><summary>...</summary>...</details>`}</code>
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
      <div class="cu-row cu-center docs-playground-stage">
        {/* container は selection の ref と幅制約だけを持つ。 .creo-accordion は
            各 details 側 (= 1 disclosure) に付ける。 */}
        <div ref={selectable} style={{ width: '100%', 'max-width': '480px' }}>
          <details
            class="creo-accordion"
            data-variant={variant()}
            name={groupName()}
            open={firstOpen()}
          >
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
          <details class="creo-accordion" data-variant={variant()} name={groupName()}>
            <summary class="creo-accordion-summary">
              <span class="creo-accordion-title">Editor Mode</span>
            </summary>
            <div class="creo-accordion-content">
              <p>
                universal Editor Mode protocol — field 宣言 / 4 方向 layout / Content 非侵襲性。
              </p>
            </div>
          </details>
          <details class="creo-accordion" data-variant={variant()} name={groupName()}>
            <summary class="creo-accordion-summary">
              <span class="creo-accordion-title">Vision input</span>
            </summary>
            <div class="creo-accordion-content">
              <p>Webcam motion capture + on-device only — gesture は fluent input layer。</p>
            </div>
          </details>
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
