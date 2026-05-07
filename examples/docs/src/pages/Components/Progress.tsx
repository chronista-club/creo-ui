import { A } from '@solidjs/router'
import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
  number,
  select,
  signalTarget,
} from 'creo-ui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-size',
    values: 's / m / l',
    def: 'm',
    meaning: 'bar 高さ scale (4 / 6 / 10 px 等)',
  },
  {
    attr: 'data-variant',
    values: 'success / warning / error / (default brand)',
    def: 'default',
    meaning: 'fill の色 hint、 semantic 系で完了/警告/失敗 表現',
  },
  {
    attr: 'data-indeterminate',
    values: '"true"',
    def: '—',
    meaning: '進捗未知 (loading)、 fill が animated stripe で循環',
  },
  {
    attr: 'role / aria-valuenow / aria-valuemin / aria-valuemax',
    values: 'WAI-ARIA progressbar',
    def: '—',
    meaning: 'a11y 必須、 screen reader が現値を読む (例: 60%)',
  },
] as const

const TOKENS = [
  { slot: 'track bg', token: 'color.surface.bg-subtle' },
  { slot: 'fill (default)', token: 'color.brand.primary' },
  { slot: 'fill (semantic)', token: 'color.semantic.{success/warning/error}' },
  { slot: 'height (s/m/l)', token: '4 / 6 / 10 px' },
  { slot: 'border-radius', token: 'radius.full (pill)' },
  { slot: 'transition', token: 'motion.duration.normal' },
  { slot: 'spinner color', token: 'color.brand.primary (current variant)' },
] as const

export default function Progress() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Progress</h1>
        <p class="docs-page-lead">
          作業の進捗を visual 表示する indicator。 determinate (% 既知 — bar fill) と indeterminate
          (進捗未知 — animated stripe / spinner) の 2 mode。 WAI-ARIA <code>progressbar</code> role
          + <code>aria-valuenow</code>/<code>aria-valuemin</code>/<code>aria-valuemax</code> で
          screen reader 対応。 spinner は inline 用 small size。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Determinate (sizes)</div>
          <div
            class="creo-progress"
            data-size="s"
            role="progressbar"
            aria-valuenow={30}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div class="creo-progress-fill" style={{ width: '30%' }} />
          </div>
          <div
            class="creo-progress"
            role="progressbar"
            aria-valuenow={60}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div class="creo-progress-fill" style={{ width: '60%' }} />
          </div>
          <div
            class="creo-progress"
            data-size="l"
            role="progressbar"
            aria-valuenow={85}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div class="creo-progress-fill" style={{ width: '85%' }} />
          </div>

          <div class="docs-preview-row-label">Variants (semantic)</div>
          <div
            class="creo-progress"
            data-variant="success"
            role="progressbar"
            aria-valuenow={100}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div class="creo-progress-fill" style={{ width: '100%' }} />
          </div>
          <div
            class="creo-progress"
            data-variant="warning"
            role="progressbar"
            aria-valuenow={70}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div class="creo-progress-fill" style={{ width: '70%' }} />
          </div>
          <div
            class="creo-progress"
            data-variant="error"
            role="progressbar"
            aria-valuenow={40}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div class="creo-progress-fill" style={{ width: '40%' }} />
          </div>

          <div class="docs-preview-row-label">Indeterminate (loading)</div>
          <div
            class="creo-progress"
            data-indeterminate="true"
            role="progressbar"
            aria-label="Loading"
          >
            <div class="creo-progress-fill" />
          </div>

          <div class="docs-preview-row-label">Spinner (inline)</div>
          <div class="docs-preview-grid" style={{ 'align-items': 'center' }}>
            <span class="creo-spinner" role="progressbar" aria-label="Loading" />
            <span>Loading…</span>
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
            <code>role="progressbar"</code> 必須、 determinate なら <code>aria-valuenow</code> /{' '}
            <code>aria-valuemin</code> / <code>aria-valuemax</code>
          </li>
          <li>
            indeterminate なら <code>aria-label</code> で task 説明 (例:{' '}
            <code>aria-label="Loading file"</code>)
          </li>
          <li>
            <code>prefers-reduced-motion: reduce</code> で indeterminate animation を停止
          </li>
          <li>長期 task (5 秒+) は cancel ボタン併設 (user agency 確保)</li>
          <li>spinner は inline で text と並べる、 単独で flow を blocking しない</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> で variant / size / value (slider) / indeterminate を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creo-ui-docs.progress-editor',
            }}
          >
            <ProgressEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Determinate (60%) -->
<div class="creo-progress"
     role="progressbar"
     aria-valuenow="60"
     aria-valuemin="0"
     aria-valuemax="100">
  <div class="creo-progress-fill" style="width: 60%"></div>
</div>

<!-- Indeterminate -->
<div class="creo-progress" data-indeterminate="true"
     role="progressbar" aria-label="Loading">
  <div class="creo-progress-fill"></div>
</div>

<!-- Inline spinner -->
<span class="creo-spinner" role="progressbar" aria-label="Loading"></span>

<!-- Semantic variant + size -->
<div class="creo-progress" data-variant="success" data-size="l"
     role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100">
  <div class="creo-progress-fill" style="width: 100%"></div>
</div>`}</code>
        </pre>
      </section>
    </>
  )
}

type ProgressVariant = 'default' | 'success' | 'warning' | 'error'
type ProgressSize = 's' | 'm' | 'l'

function ProgressEditorDemo() {
  const [variant, setVariant] = createSignal<ProgressVariant>('default')
  const [size, setSize] = createSignal<ProgressSize>('m')
  const [value, setValue] = createSignal(60)
  const [indeterminate, setIndeterminate] = createSignal(false)

  bind({
    target: signalTarget('progress.variant', variant, (v) => setVariant(v as ProgressVariant)),
    control: select(['default', 'success', 'warning', 'error'] as const),
    placement: { semantic: 'tool', group: 'progress', label: 'Variant', order: 1 },
  })
  bind({
    target: signalTarget('progress.size', size, (v) => setSize(v as ProgressSize)),
    control: select(['s', 'm', 'l'] as const),
    placement: { semantic: 'tool', group: 'progress', label: 'Size', order: 2 },
  })
  bind({
    target: signalTarget('progress.value', value, setValue),
    control: number({ variant: 'slider' }),
    placement: { semantic: 'tool', group: 'progress', label: 'Value (%)', order: 3 },
  })
  bind({
    target: signalTarget('progress.indeterminate', indeterminate, setIndeterminate),
    control: boolean({ variant: 'switch' }),
    placement: { semantic: 'tool', group: 'progress', label: 'Indeterminate', order: 4 },
  })

  return (
    <div class="docs-playground-stage">
      <div
        class="creo-progress"
        data-variant={variant() === 'default' ? undefined : variant()}
        data-size={size() === 'm' ? undefined : size()}
        data-indeterminate={indeterminate() ? 'true' : undefined}
        role="progressbar"
        aria-label={indeterminate() ? 'Loading' : `${value()}%`}
        aria-valuenow={indeterminate() ? undefined : value()}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          class="creo-progress-fill"
          style={indeterminate() ? undefined : { width: `${value()}%` }}
        />
      </div>
    </div>
  )
}
