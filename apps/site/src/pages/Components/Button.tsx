import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
  cssVarNumberTarget,
  number,
  select,
  signalTarget,
  string,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { CUButton } from '@chronista-club/creo-ui/controls'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import EditorModeToggle from '../../ui/EditorModeToggle'

const PROPS = [
  {
    attr: 'data-variant',
    values: 'primary / secondary / outline / ghost / danger',
    def: 'primary',
    meaning: '視覚的強度 (danger = destructive action)',
  },
  {
    attr: 'data-size',
    values: 's / m / l',
    def: 'm',
    meaning: '5 tier convention 中央の m が標準',
  },
  {
    attr: 'disabled',
    values: '(boolean)',
    def: '—',
    meaning: 'native HTML、 pointer-events: none + opacity',
  },
  {
    attr: 'aria-pressed',
    values: '"true" / "false"',
    def: '—',
    meaning: 'toggle button 用、 active state 視覚化',
  },
] as const

const TOKENS = [
  { slot: 'background (primary)', token: 'color.brand.primary' },
  { slot: 'background (secondary)', token: 'color.surface.surface + color.surface.border' },
  { slot: 'background (ghost)', token: 'transparent + hover color.surface.bg-subtle' },
  { slot: 'label color', token: 'color.text.primary (inverse on primary: color.surface.bg-base)' },
  { slot: 'font-size', token: 'typography.size.{s/m/l}' },
  { slot: 'padding', token: 'spacing.{xs/s/m} × spacing.{s/m/l}' },
  { slot: 'gap (icon + label)', token: 'layout.gap.tight' },
  { slot: 'border-radius', token: 'radius.full (pill — 両サイド半円)' },
  { slot: 'min-height', token: 'layout.target.tap (m/l) / focus (s)' },
] as const

export default function Button() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.button-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Button</h1>
        <p class="docs-page-lead">
          User intent を起動する atomic action trigger。 typography と color token
          が最も目立つ形で出る "digital handshake" 的 element。 native <code>&lt;button&gt;</code>{' '}
          を CSS class で装飾、 pointer / keyboard / a11y は browser に任せる。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground button の variant / size / label / state
          を即時編集できる。 Padding X/Y と corner radius は <code>.creo-btn</code> 全体に効く
          component scope (radius 未設定時の default は半円 = <code>radius.full</code> の pill)。{' '}
          Mode ON 中に playground button を click するとその instance に field が絞られる
          (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> も参照。
        </p>
        <div class="docs-component-preview">
          <ButtonLivePreview />
          <div class="docs-preview-row-label">Variants × Sizes</div>
          <div class="docs-preview-grid">
            <button type="button" class="creo-btn" data-variant="primary" data-size="s">
              Primary s
            </button>
            <button type="button" class="creo-btn" data-variant="primary" data-size="m">
              Primary m
            </button>
            <button type="button" class="creo-btn" data-variant="primary" data-size="l">
              Primary l
            </button>
            <button type="button" class="creo-btn" data-variant="secondary" data-size="s">
              Secondary s
            </button>
            <button type="button" class="creo-btn" data-variant="secondary" data-size="m">
              Secondary m
            </button>
            <button type="button" class="creo-btn" data-variant="secondary" data-size="l">
              Secondary l
            </button>
            <button type="button" class="creo-btn" data-variant="ghost" data-size="s">
              Ghost s
            </button>
            <button type="button" class="creo-btn" data-variant="ghost" data-size="m">
              Ghost m
            </button>
            <button type="button" class="creo-btn" data-variant="ghost" data-size="l">
              Ghost l
            </button>
            <button type="button" class="creo-btn" data-variant="outline" data-size="s">
              Outline s
            </button>
            <button type="button" class="creo-btn" data-variant="outline" data-size="m">
              Outline m
            </button>
            <button type="button" class="creo-btn" data-variant="outline" data-size="l">
              Outline l
            </button>
            <button type="button" class="creo-btn" data-variant="danger" data-size="s">
              Danger s
            </button>
            <button type="button" class="creo-btn" data-variant="danger" data-size="m">
              Danger m
            </button>
            <button type="button" class="creo-btn" data-variant="danger" data-size="l">
              Danger l
            </button>
          </div>
          <div class="docs-preview-row-label">States</div>
          <div class="docs-preview-grid">
            <button type="button" class="creo-btn" data-variant="primary" disabled>
              Disabled
            </button>
            <button type="button" class="creo-btn" data-variant="ghost" aria-pressed="true">
              Toggle ON
            </button>
            <button type="button" class="creo-btn" data-variant="ghost" aria-pressed="false">
              Toggle OFF
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">
          SolidJS API — <code>creo-ui/controls</code>
        </h2>
        <p class="docs-page-lead">
          素の <code>&lt;button class="creo-btn"&gt;</code> を type-safe に wrap した{' '}
          <code>&lt;CUButton&gt;</code> primitive。 <code>variant</code> / <code>size</code> /{' '}
          <code>pressed</code> / <code>loading</code> を <strong>signal で動的に</strong>変えても
          class / data 属性が追従する (eager な class 計算を持たず、 描画毎に props から導出)。{' '}
          描画先は <code>as</code> &gt; <code>href</code> &gt; <code>&lt;button&gt;</code>{' '}
          の優先で解決 (<code>as={'{A}'}</code> で solid-router の client-side routing link button
          に)。
        </p>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Reactive variant (signal 追従の実証)</div>
          <CUButtonReactiveDemo />
        </div>
        <pre class="docs-code">
          <code>{`import { CUButton } from '@chronista-club/creo-ui/controls'

// variant を signal で切替 → 即座に追従 (再描画で固まらない)
const [primary, setPrimary] = createSignal(true)
<CUButton
  variant={primary() ? 'primary' : 'ghost'}
  onClick={() => setPrimary((v) => !v)}
>
  Toggle variant
</CUButton>

// toggle (aria-pressed) / loading (spinner + disabled + aria-busy)
<CUButton variant="ghost" pressed={on()} onClick={toggle}>★</CUButton>
<CUButton variant="primary" loading={saving()}>Save</CUButton>

// link button: href = 素の <a> / as={A} = solid-router で client-side routing
<CUButton href="/docs" variant="secondary">Docs</CUButton>
<CUButton as={A} href="/sessions" variant="ghost">Sessions</CUButton>`}</code>
        </pre>
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
            semantic: <code>&lt;button&gt;</code> element を使う (<code>&lt;a&gt;</code>{' '}
            で見た目だけ真似しない)
          </li>
          <li>keyboard: Tab でフォーカス、 Enter / Space で activate (native 挙動)</li>
          <li>
            <code>:focus-visible</code> で focus ring を出す (pointer click では出さない)
          </li>
          <li>
            disabled: <code>disabled</code> 属性 (aria-disabled より真の disabled を優先)
          </li>
          <li>
            toggle: <code>aria-pressed="true" | "false"</code> を付与
          </li>
          <li>min tap size: md / lg は自動的に 44pt 以上 (Apple HIG)</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Do / Don't</h2>
        <div class="docs-do-dont">
          <div class="docs-do">
            <h3>Do</h3>
            <ul class="docs-bullet-list">
              <li>
                primary は page 内で <strong>最大 1 つ</strong> (明確な次アクション)
              </li>
              <li>secondary は代替アクション (キャンセル、 戻る)</li>
              <li>ghost は密度の高い UI (toolbar、 inline action)</li>
              <li>44pt tap target を守る</li>
            </ul>
          </div>
          <div class="docs-dont">
            <h3>Don't</h3>
            <ul class="docs-bullet-list">
              <li>primary を乱発しない (視覚的 hierarchy が崩れる)</li>
              <li>ghost を primary 的に使わない (起動の強度が弱い)</li>
              <li>
                button を link 代わりに使わない (別 resource へなら <code>&lt;a&gt;</code>)
              </li>
              <li>hardcode の px / 色を書かない</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Primary -->
<button type="button" class="creo-btn" data-variant="primary">保存</button>

<!-- Secondary, small -->
<button type="button" class="creo-btn" data-variant="secondary" data-size="s">キャンセル</button>

<!-- Ghost, large, toggle -->
<button type="button" class="creo-btn" data-variant="ghost" data-size="l" aria-pressed="true">
  Editor Mode ON
</button>

<!-- Disabled -->
<button type="button" class="creo-btn" data-variant="primary" disabled>Saving…</button>`}</code>
        </pre>
        <p class="docs-page-helper">
          詳細 spec:{' '}
          <a
            href="https://github.com/chronista-club/creo-ui/blob/main/docs/components/button.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/components/button.md ↗
          </a>
        </p>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type ButtonSize = 's' | 'm' | 'l'

function CUButtonReactiveDemo() {
  const [primary, setPrimary] = createSignal(true)
  const [pressed, setPressed] = createSignal(false)
  const [loading, setLoading] = createSignal(false)

  // loading demo: click → 1.5s spinner → 復帰
  const runLoading = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <div class="docs-preview-grid">
      <CUButton variant={primary() ? 'primary' : 'ghost'} onClick={() => setPrimary((v) => !v)}>
        variant: {primary() ? 'primary' : 'ghost'} (click)
      </CUButton>
      <CUButton variant="ghost" pressed={pressed()} onClick={() => setPressed((v) => !v)}>
        toggle: {pressed() ? 'ON' : 'OFF'}
      </CUButton>
      <CUButton variant="primary" loading={loading()} onClick={runLoading}>
        {loading() ? 'Generating…' : 'loading (click)'}
      </CUButton>
      <CUButton as={A} href="/concepts/editor-mode" variant="secondary">
        router link (as={'{A}'})
      </CUButton>
    </div>
  )
}

/**
 * Live preview の playground。editor-host の bind() で variant / size / state / label を
 * inspector panel に生やし、stage の button 自体を selectable にする (Mode ON で click →
 * その instance に field が絞られる)。corner radius だけは instance prop ではなく
 * --radius-s token への bind (token scope)。provider はページ root の 1 枚を共有。
 */
function ButtonLivePreview() {
  const [variant, setVariant] = createSignal<ButtonVariant>('primary')
  const [size, setSize] = createSignal<ButtonSize>('m')
  const [disabled, setDisabled] = createSignal(false)
  const [loading, setLoading] = createSignal(false)
  const [label, setLabel] = createSignal('Click me')

  const binders = [
    bind({
      target: signalTarget('btn.variant', variant, (v) => setVariant(v as ButtonVariant)),
      control: select(['primary', 'secondary', 'outline', 'ghost', 'danger'] as const),
      placement: { semantic: 'tool', group: 'button', label: 'Variant', order: 1 },
    }),
    bind({
      target: signalTarget('btn.size', size, (v) => setSize(v as ButtonSize)),
      control: select(['s', 'm', 'l'] as const),
      placement: { semantic: 'tool', group: 'button', label: 'Size', order: 2 },
    }),
    bind({
      target: signalTarget('btn.disabled', disabled, setDisabled),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'button', label: 'Disabled', order: 3 },
    }),
    bind({
      target: signalTarget('btn.loading', loading, setLoading),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'button', label: 'Loading', order: 4 },
    }),
    bind({
      target: signalTarget('btn.label', label, setLabel),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Button label', order: 1 },
    }),
    // padding は button.css の private tweak var --_btn-pad-{x,y} へ (D-13 component scope)。
    // 未設定なら size 別の spacing token default、設定すると全 .creo-btn instance が追従する。
    bind({
      target: cssVarNumberTarget('btn.padX', '--_btn-pad-x', 18, 'px'),
      control: number({ min: 4, max: 40, step: 1, unit: 'px', variant: 'slider' }),
      placement: {
        semantic: 'tool',
        group: 'padding',
        label: 'Padding X (--_btn-pad-x)',
        order: 1,
        scope: 'component',
      },
    }),
    bind({
      target: cssVarNumberTarget('btn.padY', '--_btn-pad-y', 8, 'px'),
      control: number({ min: 2, max: 24, step: 1, unit: 'px', variant: 'slider' }),
      placement: {
        semantic: 'tool',
        group: 'padding',
        label: 'Padding Y (--_btn-pad-y)',
        order: 2,
        scope: 'component',
      },
    }),
    // corner radius の default は半円 (radius.full の pill)。--_btn-radius は固定 px への
    // override 用 tweak var で、slider を触ったときだけ pill から離れる (D-13 component scope)。
    bind({
      target: cssVarNumberTarget('btn.radius', '--_btn-radius', 22, 'px'),
      control: number({ min: 0, max: 30, step: 1, unit: 'px', variant: 'slider' }),
      placement: {
        semantic: 'tool',
        group: 'radius',
        label: 'Corner radius (--_btn-radius)',
        order: 1,
        scope: 'component',
      },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'button-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        <CUButton
          ref={selectable}
          variant={variant()}
          size={size()}
          disabled={disabled()}
          loading={loading()}
        >
          {label()}
        </CUButton>
      </div>
      <EditorModeToggle />
    </>
  )
}
