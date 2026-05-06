import { A } from '@solidjs/router'
import { EditorHostProvider, EditorLayer, bind, select, signalTarget } from 'creo-ui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-orientation',
    values: 'horizontal / vertical',
    def: 'horizontal',
    meaning: 'step の並び方向、 horizontal は wizard、 vertical は 詳細工程',
  },
  {
    attr: 'data-state (on item)',
    values: 'completed / current / pending / error',
    def: 'pending',
    meaning: 'item の進行状態、 marker + connector に色 hint',
  },
] as const

const TOKENS = [
  { slot: 'marker (pending)', token: 'color.surface.bg-subtle + border' },
  { slot: 'marker (current)', token: 'color.brand.primary + ring' },
  { slot: 'marker (completed)', token: 'color.brand.primary' },
  { slot: 'marker (error)', token: 'color.semantic.error' },
  { slot: 'connector (between completed)', token: 'color.brand.primary' },
  { slot: 'connector (rest)', token: 'color.surface.border' },
  { slot: 'label', token: 'color.text.primary' },
  { slot: 'description', token: 'color.text.secondary' },
] as const

export default function Stepper() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Stepper</h1>
        <p class="docs-page-lead">
          多 step process の進行状況 indicator。 wizard form / multi-stage upload / onboarding flow
          の 進捗 visualization。 horizontal (浅い flow) と vertical (深い process) の 2
          orientation、 各 step は 4 state (completed / current / pending / error) を持ち、 marker +
          connector の色で進行を示す。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Horizontal (default)</div>
          <ol class="creo-stepper">
            <li class="creo-stepper-item" data-state="completed">
              <span class="creo-stepper-marker" aria-hidden="true">
                ✓
              </span>
              <div>
                <div class="creo-stepper-label">Account</div>
                <div class="creo-stepper-description">Email verified</div>
              </div>
            </li>
            <li class="creo-stepper-item" data-state="completed">
              <span class="creo-stepper-marker" aria-hidden="true">
                ✓
              </span>
              <div>
                <div class="creo-stepper-label">Profile</div>
                <div class="creo-stepper-description">Filled</div>
              </div>
            </li>
            <li class="creo-stepper-item" data-state="current" aria-current="step">
              <span class="creo-stepper-marker" aria-hidden="true">
                3
              </span>
              <div>
                <div class="creo-stepper-label">Payment</div>
                <div class="creo-stepper-description">In progress</div>
              </div>
            </li>
            <li class="creo-stepper-item" data-state="pending">
              <span class="creo-stepper-marker" aria-hidden="true">
                4
              </span>
              <div>
                <div class="creo-stepper-label">Confirm</div>
                <div class="creo-stepper-description">—</div>
              </div>
            </li>
          </ol>

          <div class="docs-preview-row-label">Vertical (with error step)</div>
          <ol class="creo-stepper" data-orientation="vertical">
            <li class="creo-stepper-item" data-state="completed">
              <span class="creo-stepper-marker" aria-hidden="true">
                ✓
              </span>
              <div>
                <div class="creo-stepper-label">Upload file</div>
                <div class="creo-stepper-description">avatar.png (3.2 KB)</div>
              </div>
            </li>
            <li class="creo-stepper-item" data-state="error">
              <span class="creo-stepper-marker" aria-hidden="true">
                ✕
              </span>
              <div>
                <div class="creo-stepper-label">Process image</div>
                <div class="creo-stepper-description">Failed: dimensions exceed 2048×2048</div>
              </div>
            </li>
            <li class="creo-stepper-item" data-state="pending">
              <span class="creo-stepper-marker" aria-hidden="true">
                3
              </span>
              <div>
                <div class="creo-stepper-label">Save profile</div>
                <div class="creo-stepper-description">—</div>
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
            wrapper は <code>&lt;ol&gt;</code>、 順序付き list で 進行性を semantic に表す
          </li>
          <li>
            current step に <code>aria-current="step"</code>、 screen reader が現位置を読む
          </li>
          <li>
            marker は <code>aria-hidden</code>、 状態は label + description で伝達
          </li>
          <li>error state は色 only でなく ✕ icon + 文字説明併用</li>
          <li>step 数 ≤ 5 が理想、 7+ なら deeper hierarchy or progress bar 検討</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> で orientation / current step を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creo-ui-docs.stepper-editor',
            }}
          >
            <StepperEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<ol class="creo-stepper">
  <li class="creo-stepper-item" data-state="completed">
    <span class="creo-stepper-marker" aria-hidden="true">✓</span>
    <div>
      <div class="creo-stepper-label">Account</div>
      <div class="creo-stepper-description">Email verified</div>
    </div>
  </li>
  <li class="creo-stepper-item" data-state="current" aria-current="step">
    <span class="creo-stepper-marker" aria-hidden="true">2</span>
    <div>
      <div class="creo-stepper-label">Profile</div>
    </div>
  </li>
  <li class="creo-stepper-item" data-state="pending">
    <span class="creo-stepper-marker" aria-hidden="true">3</span>
    <div>
      <div class="creo-stepper-label">Confirm</div>
    </div>
  </li>
</ol>

<!-- Vertical -->
<ol class="creo-stepper" data-orientation="vertical">
  ...
</ol>`}</code>
        </pre>
      </section>
    </>
  )
}

type StepperOrientation = 'horizontal' | 'vertical'
type StepperCurrent = '1' | '2' | '3' | '4'

function StepperEditorDemo() {
  const [orientation, setOrientation] = createSignal<StepperOrientation>('horizontal')
  const [current, setCurrent] = createSignal<StepperCurrent>('2')

  bind({
    target: signalTarget('stepper.orientation', orientation, (v) =>
      setOrientation(v as StepperOrientation),
    ),
    control: select(['horizontal', 'vertical'] as const),
    placement: { semantic: 'tool', group: 'stepper', label: 'Orientation', order: 1 },
  })
  bind({
    target: signalTarget('stepper.current', current, (v) => setCurrent(v as StepperCurrent)),
    control: select(['1', '2', '3', '4'] as const),
    placement: { semantic: 'tool', group: 'stepper', label: 'Current step', order: 2 },
  })

  const stateOf = (n: number): 'completed' | 'current' | 'pending' => {
    const c = Number(current())
    if (n < c) return 'completed'
    if (n === c) return 'current'
    return 'pending'
  }
  const markerOf = (n: number): string => {
    if (stateOf(n) === 'completed') return '✓'
    return String(n)
  }

  return (
    <div class="docs-playground-stage">
      <ol
        class="creo-stepper"
        data-orientation={orientation() === 'horizontal' ? undefined : orientation()}
      >
        <li class="creo-stepper-item" data-state={stateOf(1)}>
          <span class="creo-stepper-marker" aria-hidden="true">
            {markerOf(1)}
          </span>
          <div>
            <div class="creo-stepper-label">Account</div>
          </div>
        </li>
        <li class="creo-stepper-item" data-state={stateOf(2)}>
          <span class="creo-stepper-marker" aria-hidden="true">
            {markerOf(2)}
          </span>
          <div>
            <div class="creo-stepper-label">Profile</div>
          </div>
        </li>
        <li class="creo-stepper-item" data-state={stateOf(3)}>
          <span class="creo-stepper-marker" aria-hidden="true">
            {markerOf(3)}
          </span>
          <div>
            <div class="creo-stepper-label">Payment</div>
          </div>
        </li>
        <li class="creo-stepper-item" data-state={stateOf(4)}>
          <span class="creo-stepper-marker" aria-hidden="true">
            {markerOf(4)}
          </span>
          <div>
            <div class="creo-stepper-label">Confirm</div>
          </div>
        </li>
      </ol>
    </div>
  )
}
