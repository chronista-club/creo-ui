import { A } from '@solidjs/router'
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
} from 'creo-ui-editor-host'
import { Show, createSignal } from 'solid-js'

export default function Playground() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Lab</p>
        <h1>Playground — Live design surface</h1>
        <p class="docs-page-lead">
          <code>creo-ui-editor-host</code> の reference runtime を動かす実演 area。 Editor Mode を
          ON にして field を操作すると、 下の preview と <strong>token CSS variable</strong> がリアルタイム連動する。
          DevTools Console から <code>window.creoEditor</code> 経由で field を増やすことも可能。
          → <A href="/concepts/editor-mode">Editor Mode protocol</A> も参照。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">操作方法</h2>
        <ul class="docs-bullet-list">
          <li><kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle</li>
          <li>右下に出る floating button からも切替</li>
          <li>RIGHT panel の field を操作 → 下の preview が live 反映</li>
          <li>DevTools Console: <code>creoEditor.help()</code> で REPL コマンド一覧</li>
          <li>URL hash に share 形式で state encode、 別 tab で同 URL 開くと再現</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Live demo</h2>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              shortcut: ['ctrl+shift+e', 'meta+shift+e'],
              exposeConsole: true,
              localStorageNamespace: 'creo-ui-docs.playground',
            }}
          >
            <PlaygroundDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
        <p class="docs-page-helper">
          Playground は scope 局所化されているため、 Editor Mode 効果はこの section 内のみ。
          docs site の他 page には影響しない (provider context の境界)。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">この component の構成</h2>
        <pre class="docs-code">
          <code>{`import {
  EditorHostProvider,
  EditorLayer,
  bind,
  number,
  cssVarNumberTarget,
  signalTarget,
  select,
  boolean,
  string,
} from 'creo-ui-editor-host'
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
        <h2 class="docs-section-title">Live design surface 機能 (creo-ui-editor-host 0.4+)</h2>
        <ul class="docs-bullet-list">
          <li><strong>Console REPL</strong> — <code>window.creoEditor</code> で REPL、 sugar (slider / picker / chooser / flip)、 inspection (fields / values / describe)、 mode 制御</li>
          <li><strong>DOM auto-discover</strong> — 既知 prefix の CSS variable を scan して自動 bind</li>
          <li><strong>URL share</strong> — current state を hash に encode、 別 tab で再現</li>
          <li><strong>Cross-tab sync</strong> — BroadcastChannel で複数 tab の field 値を同期</li>
          <li><strong>Export to CSS patch</strong> — 変更分を CSS / JSON で書き出し</li>
        </ul>
      </section>
    </>
  )
}

function PlaygroundDemo() {
  // Solid signals for ephemeral state (visible in render)
  const [elevation, setElevation] = createSignal<'flat' | 'raised' | 'floating'>('raised')
  const [showLabel, setShowLabel] = createSignal(true)
  const [title, setTitle] = createSignal('Hello, Creo UI')

  // CSS variable bindings (live token effect)
  bind({
    id: 'demo.cardRadius',
    control: number({ variant: 'slider' }),
    target: cssVarNumberTarget('--demo-card-radius', {
      min: 0,
      max: 32,
      step: 1,
      unit: 'px',
    }),
    initial: 12,
    semantic: 'tool',
    placement: { region: 'right', group: 'card', label: 'Card radius', order: 1 },
  })

  bind({
    id: 'demo.cardPadding',
    control: number({ variant: 'slider' }),
    target: cssVarNumberTarget('--demo-card-padding', {
      min: 8,
      max: 48,
      step: 2,
      unit: 'px',
    }),
    initial: 18,
    semantic: 'tool',
    placement: { region: 'right', group: 'card', label: 'Card padding', order: 2 },
  })

  // Signal-backed bindings (component-local state)
  bind({
    id: 'demo.elevation',
    control: select({ options: ['flat', 'raised', 'floating'] as const }),
    target: signalTarget('demo.elevation', elevation, setElevation),
    initial: 'raised',
    semantic: 'tool',
    placement: { region: 'right', group: 'card', label: 'Elevation', order: 3 },
  })

  bind({
    id: 'demo.showLabel',
    control: boolean({ variant: 'switch' }),
    target: signalTarget('demo.showLabel', showLabel, setShowLabel),
    initial: true,
    semantic: 'tool',
    placement: { region: 'right', group: 'card', label: 'Show label', order: 4 },
  })

  bind({
    id: 'demo.title',
    control: string({ variant: 'input' }),
    target: signalTarget('demo.title', title, setTitle),
    initial: 'Hello, Creo UI',
    semantic: 'content',
    placement: { region: 'right', group: 'content', label: 'Card title', order: 1 },
  })

  return (
    <div class="docs-playground-stage">
      <article
        class="docs-playground-card"
        data-elevation={elevation()}
        style={{
          'border-radius': 'var(--demo-card-radius, 12px)',
          padding: 'var(--demo-card-padding, 18px)',
        }}
      >
        <Show when={showLabel()}>
          <span class="docs-playground-label">PREVIEW CARD</span>
        </Show>
        <h3 class="docs-playground-title">{title() || 'Untitled'}</h3>
        <p class="docs-playground-body">
          このカードの radius / padding / elevation / title / label visibility を
          Editor Mode で操作してみてください (<kbd>Ctrl+Shift+E</kbd>)。
        </p>
        <div class="docs-playground-actions">
          <button class="creo-btn" data-variant="primary">Primary</button>
          <button class="creo-btn" data-variant="secondary">Secondary</button>
        </div>
      </article>
    </div>
  )
}
