import {
  bind,
  boolean,
  color,
  cssVarNumberTarget,
  cssVarTarget,
  number,
  select,
  signalTarget,
  string,
} from '@chronista-club/creo-ui-editor-host'
import { A } from '@solidjs/router'
import { createSignal, Show } from 'solid-js'

export default function EditorLab() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Lab</p>
        <h1>Editor surface — Live design surface</h1>
        <p class="docs-page-lead">
          <code>@chronista-club/creo-ui-editor-host</code> の reference runtime を動かす実演 area。
          Editor Mode を ON にして field を操作すると、 下の preview と{' '}
          <strong>token CSS variable</strong> がリアルタイム連動する。 DevTools Console から{' '}
          <code>window.creoEditor</code> 経由で field を増やすことも可能。 →{' '}
          <A href="/concepts/editor-mode">Editor Mode protocol</A> も参照。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">操作方法</h2>
        <ul class="docs-bullet-list">
          <li>
            <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle
          </li>
          <li>右下に出る floating button からも切替</li>
          <li>RIGHT panel の field を操作 → 下の preview が live 反映</li>
          <li>
            DevTools Console: <code>creoEditor.help()</code> で REPL コマンド一覧
          </li>
          <li>URL hash に share 形式で state encode、 別 tab で同 URL 開くと再現</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live demo</h2>
        <div class="docs-playground-frame">
          <PlaygroundDemo />
        </div>
        <p class="docs-page-helper">
          Editor host は site 全体で 1 つ (App root の provider)。 この page の bind() も同じ host
          に載る。 docs site の他 page には影響しない (provider context の境界)。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">この component の構成</h2>
        <pre class="docs-code">
          <code>{`import {
  bind,
  number,
  cssVarNumberTarget,
  signalTarget,
  select,
  boolean,
  string,
} from '@chronista-club/creo-ui-editor-host'
import { createSignal } from 'solid-js'

function Demo() {
  // CSS variable に bind (live で全 consumer に反映)
  bind({
    id: 'demo.cardRadius',
    control: number({ variant: 'slider' }),
    target: cssVarNumberTarget('--demo-card-radius', { min: 0, max: 32, unit: 'px' }),
    initial: 12,
    semantic: 'tool',
  })

  // Solid signal に bind (component 内のみ)
  const [elevation, setElevation] = createSignal('raised')
  bind({
    id: 'demo.elevation',
    control: select({ options: ['flat', 'raised', 'floating'] as const }),
    target: signalTarget('demo.elevation', elevation, setElevation),
    initial: 'raised',
    semantic: 'tool',
  })

  return <article data-elevation={elevation()}>...</article>
}

// Provider で囲んで Layer を render
<EditorHostProvider config={{ exposeConsole: true }}>
  <Demo />
  <EditorLayer />
</EditorHostProvider>`}</code>
        </pre>
      </section>

      <section>
        <h2 class="docs-section-title">
          Live design surface 機能 (@chronista-club/creo-ui-editor-host 0.4+)
        </h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Console REPL</strong> — <code>window.creoEditor</code> で REPL、 sugar (slider /
            picker / chooser / flip)、 inspection (fields / values / describe)、 mode 制御
          </li>
          <li>
            <strong>DOM auto-discover</strong> — 既知 prefix の CSS variable を scan して自動 bind
          </li>
          <li>
            <strong>URL share</strong> — current state を hash に encode、 別 tab で再現
          </li>
          <li>
            <strong>Cross-tab sync</strong> — BroadcastChannel で複数 tab の field 値を同期
          </li>
          <li>
            <strong>Export to CSS patch</strong> — 変更分を CSS / JSON で書き出し
          </li>
        </ul>
      </section>
    </>
  )
}

type PlaygroundElevation = 'flat' | 'raised' | 'floating'

function PlaygroundDemo() {
  // Solid signals for ephemeral state (visible in render)
  const [elevation, setElevation] = createSignal<PlaygroundElevation>('raised')
  const [showLabel, setShowLabel] = createSignal(true)
  const [title, setTitle] = createSignal('Hello, creo-ui')

  // CSS variable bindings (live token effect)
  bind({
    target: cssVarNumberTarget('demo.cardRadius', '--demo-card-radius', 12, 'px'),
    control: number({ min: 0, max: 32, step: 1, unit: 'px', variant: 'slider' }),
    placement: { semantic: 'tool', group: 'card', label: 'Card radius', order: 1 },
  })

  bind({
    target: cssVarNumberTarget('demo.cardPadding', '--demo-card-padding', 18, 'px'),
    control: number({ min: 8, max: 48, step: 2, unit: 'px', variant: 'slider' }),
    placement: { semantic: 'tool', group: 'card', label: 'Card padding', order: 2 },
  })

  // OKLCH literal を initial に持つ color field → OKLCH editor (L/C/H/A slider) が出る
  bind({
    target: cssVarTarget('demo.cardAccent', '--demo-card-accent', 'oklch(0.75 0.12 160)'),
    control: color({ variant: 'picker' }),
    placement: { semantic: 'tool', group: 'card', label: 'Accent', order: 3 },
  })

  // Signal-backed bindings (component-local state)
  bind({
    target: signalTarget('demo.elevation', elevation, (v) =>
      setElevation(v as PlaygroundElevation),
    ),
    control: select(['flat', 'raised', 'floating'] as const),
    placement: { semantic: 'tool', group: 'card', label: 'Elevation', order: 4 },
  })

  bind({
    target: signalTarget('demo.showLabel', showLabel, setShowLabel),
    control: boolean({ variant: 'switch' }),
    placement: { semantic: 'tool', group: 'card', label: 'Show label', order: 5 },
  })

  bind({
    target: signalTarget('demo.title', title, setTitle),
    control: string('input'),
    placement: { semantic: 'tool', group: 'content', label: 'Card title', order: 1 },
  })

  return (
    <div class="docs-playground-stage">
      <article
        class="docs-playground-card"
        data-elevation={elevation()}
        style={{
          'border-radius': 'var(--demo-card-radius, 12px)',
          padding: 'var(--demo-card-padding, 18px)',
          'border-left': '3px solid var(--demo-card-accent, oklch(0.75 0.12 160))',
        }}
      >
        <Show when={showLabel()}>
          <span
            class="docs-playground-label"
            style={{ color: 'var(--demo-card-accent, oklch(0.75 0.12 160))' }}
          >
            PREVIEW CARD
          </span>
        </Show>
        <h3 class="docs-playground-title">{title() || 'Untitled'}</h3>
        <p class="docs-playground-body">
          このカードの radius / padding / elevation / title / label visibility を Editor Mode
          で操作してみてください (<kbd>Ctrl+Shift+E</kbd>)。
        </p>
        <div class="docs-playground-actions">
          <button type="button" class="creo-btn" data-variant="primary">
            Primary
          </button>
          <button type="button" class="creo-btn" data-variant="secondary">
            Secondary
          </button>
        </div>
      </article>
    </div>
  )
}
