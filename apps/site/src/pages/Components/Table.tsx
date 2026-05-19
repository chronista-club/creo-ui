import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
  select,
  signalTarget,
} from '@chronista-club/creoui-editor-host'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-size',
    values: 's / m / l',
    def: 'm',
    meaning: 'cell padding を 5 tier convention で scale',
  },
  {
    attr: 'data-variant',
    values: 'striped',
    def: '—',
    meaning: '偶数 row に bg-subtle (大規模 data の row scan を補助)',
  },
  {
    attr: 'data-sticky-head',
    values: '"true"',
    def: '—',
    meaning: 'scroll 中も header 固定 (long table)',
  },
  {
    attr: 'data-align (on cell)',
    values: 'center / end',
    def: 'start',
    meaning: 'cell 内 text alignment、 数値 column は end が読みやすい',
  },
  {
    attr: 'aria-sort (on th)',
    values: 'ascending / descending / none',
    def: 'none',
    meaning: 'sortable column の状態、 screen reader が sort 状態を読む',
  },
] as const

const TOKENS = [
  { slot: 'header bg', token: 'color.surface.bg-subtle' },
  { slot: 'border', token: 'color.surface.border 1px' },
  { slot: 'striped row bg', token: 'color.surface.bg-subtle (50% opacity)' },
  { slot: 'cell padding (s/m/l)', token: 'spacing.{xs/s/m} × spacing.{s/m}' },
  { slot: 'font-size', token: 'typography.size.{s/m/l}' },
  { slot: 'header text', token: 'color.text.secondary、 typography.weight.semibold' },
] as const

export default function Table() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Table</h1>
        <p class="docs-page-lead">
          tabular data display。 native HTML <code>&lt;table&gt;</code> + semantic structure (thead
          / tbody / tr / td) を CSS class で装飾、 a11y は browser native。 sortable column は{' '}
          <code>aria-sort</code> + <code>scope="col"</code>、 sticky head は long-list で context
          保持。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Default</div>
          <table class="creo-table">
            <thead class="creo-table-head">
              <tr class="creo-table-row">
                <th class="creo-table-cell" scope="col">
                  Component
                </th>
                <th class="creo-table-cell" scope="col">
                  Status
                </th>
                <th class="creo-table-cell" scope="col" data-align="end">
                  Bindings
                </th>
              </tr>
            </thead>
            <tbody class="creo-table-body">
              <tr class="creo-table-row">
                <td class="creo-table-cell">Button</td>
                <td class="creo-table-cell">✅ Detail + dogfood</td>
                <td class="creo-table-cell" data-align="end">
                  4
                </td>
              </tr>
              <tr class="creo-table-row">
                <td class="creo-table-cell">Card</td>
                <td class="creo-table-cell">✅ Detail + dogfood</td>
                <td class="creo-table-cell" data-align="end">
                  5
                </td>
              </tr>
              <tr class="creo-table-row">
                <td class="creo-table-cell">Tabs</td>
                <td class="creo-table-cell">✅ Detail (no dogfood)</td>
                <td class="creo-table-cell" data-align="end">
                  —
                </td>
              </tr>
            </tbody>
          </table>

          <div class="docs-preview-row-label">Striped + sortable</div>
          <table class="creo-table" data-variant="striped">
            <thead class="creo-table-head">
              <tr class="creo-table-row">
                <th class="creo-table-cell" scope="col" aria-sort="ascending">
                  Name ▴
                </th>
                <th class="creo-table-cell" scope="col" aria-sort="none">
                  Type
                </th>
                <th class="creo-table-cell" scope="col" data-align="end" aria-sort="none">
                  Size
                </th>
              </tr>
            </thead>
            <tbody class="creo-table-body">
              <tr class="creo-table-row">
                <td class="creo-table-cell">avatar</td>
                <td class="creo-table-cell">component</td>
                <td class="creo-table-cell" data-align="end">
                  3.2 KB
                </td>
              </tr>
              <tr class="creo-table-row">
                <td class="creo-table-cell">badge</td>
                <td class="creo-table-cell">component</td>
                <td class="creo-table-cell" data-align="end">
                  1.4 KB
                </td>
              </tr>
              <tr class="creo-table-row">
                <td class="creo-table-cell">button</td>
                <td class="creo-table-cell">component</td>
                <td class="creo-table-cell" data-align="end">
                  4.8 KB
                </td>
              </tr>
            </tbody>
          </table>
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
            semantic structure (<code>&lt;table&gt;</code> / <code>&lt;thead&gt;</code> /{' '}
            <code>&lt;tbody&gt;</code> / <code>&lt;tr&gt;</code> / <code>&lt;th&gt;</code> /{' '}
            <code>&lt;td&gt;</code>) を必ず使用、 div で代替しない
          </li>
          <li>
            header cell に <code>scope="col"</code> (列見出し) or <code>scope="row"</code>{' '}
            (行見出し) を付与
          </li>
          <li>
            sortable は <code>aria-sort="ascending"|"descending"|"none"</code>、 sort button click
            で toggle
          </li>
          <li>
            caption が必要なら <code>&lt;caption&gt;</code> で table の意味を説明
          </li>
          <li>row count 100+ になる時は pagination + sticky head を併用、 scroll 距離を制限</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> で variant / size / sticky-head を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creoui-docs.table-editor',
            }}
          >
            <TableEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<table class="creo-table">
  <thead class="creo-table-head">
    <tr class="creo-table-row">
      <th class="creo-table-cell" scope="col">Name</th>
      <th class="creo-table-cell" scope="col" aria-sort="ascending">
        Date ▴
      </th>
      <th class="creo-table-cell" scope="col" data-align="end">Size</th>
    </tr>
  </thead>
  <tbody class="creo-table-body">
    <tr class="creo-table-row">
      <td class="creo-table-cell">avatar.tsx</td>
      <td class="creo-table-cell">2026-05-06</td>
      <td class="creo-table-cell" data-align="end">3.2 KB</td>
    </tr>
  </tbody>
</table>

<!-- Striped + sticky head + sm size -->
<table class="creo-table" data-variant="striped" data-sticky-head="true" data-size="s">
  ...
</table>`}</code>
        </pre>
      </section>
    </>
  )
}

type TableVariant = 'default' | 'striped'
type TableSize = 's' | 'm' | 'l'

function TableEditorDemo() {
  const [variant, setVariant] = createSignal<TableVariant>('default')
  const [size, setSize] = createSignal<TableSize>('m')
  const [stickyHead, setStickyHead] = createSignal(false)

  bind({
    target: signalTarget('table.variant', variant, (v) => setVariant(v as TableVariant)),
    control: select(['default', 'striped'] as const),
    placement: { semantic: 'tool', group: 'table', label: 'Variant', order: 1 },
  })
  bind({
    target: signalTarget('table.size', size, (v) => setSize(v as TableSize)),
    control: select(['s', 'm', 'l'] as const),
    placement: { semantic: 'tool', group: 'table', label: 'Size', order: 2 },
  })
  bind({
    target: signalTarget('table.sticky', stickyHead, setStickyHead),
    control: boolean({ variant: 'switch' }),
    placement: { semantic: 'tool', group: 'table', label: 'Sticky head', order: 3 },
  })

  return (
    <div class="docs-playground-stage">
      <table
        class="creo-table"
        data-variant={variant() === 'default' ? undefined : variant()}
        data-size={size() === 'm' ? undefined : size()}
        data-sticky-head={stickyHead() ? 'true' : undefined}
      >
        <thead class="creo-table-head">
          <tr class="creo-table-row">
            <th class="creo-table-cell" scope="col">
              Component
            </th>
            <th class="creo-table-cell" scope="col">
              Status
            </th>
            <th class="creo-table-cell" scope="col" data-align="end">
              Bindings
            </th>
          </tr>
        </thead>
        <tbody class="creo-table-body">
          <tr class="creo-table-row">
            <td class="creo-table-cell">Button</td>
            <td class="creo-table-cell">Detail + dogfood</td>
            <td class="creo-table-cell" data-align="end">
              4
            </td>
          </tr>
          <tr class="creo-table-row">
            <td class="creo-table-cell">Card</td>
            <td class="creo-table-cell">Detail + dogfood</td>
            <td class="creo-table-cell" data-align="end">
              5
            </td>
          </tr>
          <tr class="creo-table-row">
            <td class="creo-table-cell">Dialog</td>
            <td class="creo-table-cell">Detail + dogfood</td>
            <td class="creo-table-cell" data-align="end">
              4
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
