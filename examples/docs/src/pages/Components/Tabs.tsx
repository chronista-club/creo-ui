import { A } from '@solidjs/router'
import { EditorHostProvider, EditorLayer, bind, select, signalTarget } from 'creo-ui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-variant',
    values: 'default (underline) / pill',
    def: 'default',
    meaning: 'visual style — underline (line on selected) / pill (filled on selected)',
  },
  {
    attr: 'data-size',
    values: 's / m / l',
    def: 'm',
    meaning: '5 tier convention、 dense UI なら sm、 hero なら lg',
  },
  {
    attr: 'role="tablist" / "tab" / "tabpanel"',
    values: 'WAI-ARIA',
    def: '—',
    meaning: 'a11y 必須、 group / button / panel に各々付与',
  },
  {
    attr: 'aria-selected',
    values: '"true" / "false"',
    def: '—',
    meaning: '選択状態、 1 group で true は 1 つだけ',
  },
] as const

const TOKENS = [
  { slot: 'tab text (inactive)', token: 'color.text.secondary' },
  { slot: 'tab text (active)', token: 'color.text.primary' },
  { slot: 'underline (active)', token: 'color.brand.primary' },
  { slot: 'pill bg (active)', token: 'color.brand.primary-subtle' },
  { slot: 'gap (tabs)', token: 'layout.gap.tight' },
  { slot: 'padding', token: 'spacing.{xs/s/m} × spacing.{s/m/l}' },
  { slot: 'transition', token: 'motion.duration.fast' },
] as const

export default function Tabs() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Tabs</h1>
        <p class="docs-page-lead">
          関連する複数 view を切り替える horizontal navigation。 WAI-ARIA tablist pattern に従い、{' '}
          <code>role="tablist"</code> + <code>role="tab"</code> + <code>aria-selected</code> +{' '}
          <code>aria-controls</code> + <code>role="tabpanel"</code> + <code>aria-labelledby</code>{' '}
          で screen reader 対応。 keyboard arrow navigation は別途 JS で実装 (本 CSS は visual
          のみ)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Default (underline)</div>
          <div class="creo-tabs">
            <div class="creo-tabs-list" role="tablist">
              <button
                type="button"
                class="creo-tabs-tab"
                role="tab"
                aria-selected="true"
                aria-controls="panel-1"
                id="tab-1"
              >
                Overview
              </button>
              <button
                type="button"
                class="creo-tabs-tab"
                role="tab"
                aria-selected="false"
                aria-controls="panel-2"
                id="tab-2"
              >
                Foundations
              </button>
              <button
                type="button"
                class="creo-tabs-tab"
                role="tab"
                aria-selected="false"
                aria-controls="panel-3"
                id="tab-3"
              >
                Components
              </button>
            </div>
            <div class="creo-tabs-panel" id="panel-1" role="tabpanel" aria-labelledby="tab-1">
              Overview panel content
            </div>
          </div>

          <div class="docs-preview-row-label">Pill variant</div>
          <div class="creo-tabs" data-variant="pill">
            <div class="creo-tabs-list" role="tablist">
              <button
                type="button"
                class="creo-tabs-tab"
                role="tab"
                aria-selected="true"
                aria-controls="pp-1"
                id="pt-1"
              >
                Day
              </button>
              <button
                type="button"
                class="creo-tabs-tab"
                role="tab"
                aria-selected="false"
                aria-controls="pp-2"
                id="pt-2"
              >
                Week
              </button>
              <button
                type="button"
                class="creo-tabs-tab"
                role="tab"
                aria-selected="false"
                aria-controls="pp-3"
                id="pt-3"
              >
                Month
              </button>
            </div>
          </div>

          <div class="docs-preview-row-label">Sizes</div>
          <div class="creo-tabs" data-size="s">
            <div class="creo-tabs-list" role="tablist">
              <button type="button" class="creo-tabs-tab" role="tab" aria-selected="true" id="sm-1">
                sm
              </button>
              <button
                type="button"
                class="creo-tabs-tab"
                role="tab"
                aria-selected="false"
                id="sm-2"
              >
                Compact
              </button>
            </div>
          </div>
          <div class="creo-tabs" data-size="l">
            <div class="creo-tabs-list" role="tablist">
              <button type="button" class="creo-tabs-tab" role="tab" aria-selected="true" id="lg-1">
                lg
              </button>
              <button
                type="button"
                class="creo-tabs-tab"
                role="tab"
                aria-selected="false"
                id="lg-2"
              >
                Hero
              </button>
            </div>
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
            list は <code>role="tablist"</code>、 各 tab は <code>role="tab"</code> +{' '}
            <code>aria-selected="true"</code>/<code>"false"</code>
          </li>
          <li>
            tab の <code>aria-controls</code> と panel の <code>id</code> を関連付け、 panel に{' '}
            <code>role="tabpanel"</code> + <code>aria-labelledby</code>
          </li>
          <li>keyboard arrow navigation (Left/Right or Up/Down) は別途 JS で実装が必要</li>
          <li>tab 数 ≤ 7 程度に抑える (それ以上は別 navigation pattern 検討)</li>
          <li>panel の中身は tab 切替で完全置換、 部分更新は別 pattern</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> で variant / size / selected tab を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creo-ui-docs.tabs-editor',
            }}
          >
            <TabsEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<div class="creo-tabs">
  <div class="creo-tabs-list" role="tablist">
    <button type="button" class="creo-tabs-tab" role="tab"
            aria-selected="true" aria-controls="p1" id="t1">
      Overview
    </button>
    <button type="button" class="creo-tabs-tab" role="tab"
            aria-selected="false" aria-controls="p2" id="t2">
      Settings
    </button>
  </div>
  <div class="creo-tabs-panel" id="p1" role="tabpanel" aria-labelledby="t1">
    ...
  </div>
</div>

<!-- Pill variant -->
<div class="creo-tabs" data-variant="pill" data-size="s">
  <div class="creo-tabs-list" role="tablist">
    ...
  </div>
</div>`}</code>
        </pre>
      </section>
    </>
  )
}

type TabsVariant = 'default' | 'pill'
type TabsSize = 's' | 'm' | 'l'
type TabsSelected = 'tab1' | 'tab2' | 'tab3'

function TabsEditorDemo() {
  const [variant, setVariant] = createSignal<TabsVariant>('default')
  const [size, setSize] = createSignal<TabsSize>('m')
  const [selected, setSelected] = createSignal<TabsSelected>('tab1')

  bind({
    target: signalTarget('tabs.variant', variant, (v) => setVariant(v as TabsVariant)),
    control: select(['default', 'pill'] as const),
    placement: { semantic: 'tool', group: 'tabs', label: 'Variant', order: 1 },
  })
  bind({
    target: signalTarget('tabs.size', size, (v) => setSize(v as TabsSize)),
    control: select(['s', 'm', 'l'] as const),
    placement: { semantic: 'tool', group: 'tabs', label: 'Size', order: 2 },
  })
  bind({
    target: signalTarget('tabs.selected', selected, (v) => setSelected(v as TabsSelected)),
    control: select(['tab1', 'tab2', 'tab3'] as const),
    placement: { semantic: 'tool', group: 'tabs', label: 'Selected', order: 3 },
  })

  return (
    <div class="docs-playground-stage">
      <div
        class="creo-tabs"
        data-variant={variant() === 'default' ? undefined : variant()}
        data-size={size() === 'm' ? undefined : size()}
      >
        <div class="creo-tabs-list" role="tablist">
          <button
            type="button"
            class="creo-tabs-tab"
            role="tab"
            aria-selected={selected() === 'tab1' ? 'true' : 'false'}
            onClick={() => setSelected('tab1')}
          >
            Overview
          </button>
          <button
            type="button"
            class="creo-tabs-tab"
            role="tab"
            aria-selected={selected() === 'tab2' ? 'true' : 'false'}
            onClick={() => setSelected('tab2')}
          >
            Foundations
          </button>
          <button
            type="button"
            class="creo-tabs-tab"
            role="tab"
            aria-selected={selected() === 'tab3' ? 'true' : 'false'}
            onClick={() => setSelected('tab3')}
          >
            Components
          </button>
        </div>
      </div>
    </div>
  )
}
