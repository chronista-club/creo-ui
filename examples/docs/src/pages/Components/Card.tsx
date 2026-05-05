import { A } from '@solidjs/router'
import {
  EditorHostProvider,
  EditorLayer,
  bind,
  boolean,
  select,
  signalTarget,
  string,
} from 'creo-ui-editor-host'
import { createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-variant',
    values: 'default / elevated / outlined',
    def: 'default',
    meaning: '視覚的 lift / emphasis',
  },
  { attr: 'data-padding', values: 'sm / md / lg', def: 'md', meaning: '内側余白の scale' },
  {
    attr: 'data-interactive',
    values: '"true"',
    def: '—',
    meaning: 'hover state を有効化 (button/link として使う場合)',
  },
] as const

const TOKENS = [
  { slot: 'background (default)', token: 'color.surface.surface' },
  { slot: 'background (elevated)', token: 'color.surface.surface + shadow.md' },
  { slot: 'background (outlined)', token: 'transparent + color.surface.border 1.5px' },
  { slot: 'padding', token: 'spacing.{sm/md/lg}' },
  { slot: 'border-radius', token: 'radius.md' },
  { slot: 'border (default)', token: 'color.surface.border 1px' },
  { slot: 'gap (title + body)', token: 'layout.gap.tight' },
] as const

export default function Card() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Card</h1>
        <p class="docs-page-lead">
          関連したコンテンツを視覚的に束ねる container。 Creo aesthetic "柔らかく気持ちいい"
          を最も体現する element — radius / shadow / padding で息遣いを表現する。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Variants</div>
          <div class="docs-preview-grid docs-preview-grid--cards">
            <article class="creo-card" data-variant="default">
              <h4 style="margin: 0 0 8px 0; font-size: var(--typography-size-base); font-weight: var(--typography-weight-bold);">
                Default
              </h4>
              <p style="margin: 0; font-size: var(--typography-size-sm); color: var(--color-text-secondary);">
                surface bg + 1px border。 group content 用。
              </p>
            </article>
            <article class="creo-card" data-variant="elevated">
              <h4 style="margin: 0 0 8px 0; font-size: var(--typography-size-base); font-weight: var(--typography-weight-bold);">
                Elevated
              </h4>
              <p style="margin: 0; font-size: var(--typography-size-sm); color: var(--color-text-secondary);">
                + shadow.md で前面に浮く感。
              </p>
            </article>
            <article class="creo-card" data-variant="outlined">
              <h4 style="margin: 0 0 8px 0; font-size: var(--typography-size-base); font-weight: var(--typography-weight-bold);">
                Outlined
              </h4>
              <p style="margin: 0; font-size: var(--typography-size-sm); color: var(--color-text-secondary);">
                transparent bg + 1.5px border。 軽量 grouping。
              </p>
            </article>
          </div>
          <div class="docs-preview-row-label">Paddings</div>
          <div class="docs-preview-grid docs-preview-grid--cards">
            <article class="creo-card" data-padding="sm">
              <code style="font-family: var(--typography-family-mono); font-size: var(--typography-size-xs);">
                data-padding="sm"
              </code>
            </article>
            <article class="creo-card" data-padding="md">
              <code style="font-family: var(--typography-family-mono); font-size: var(--typography-size-xs);">
                data-padding="md"
              </code>
            </article>
            <article class="creo-card" data-padding="lg">
              <code style="font-family: var(--typography-family-mono); font-size: var(--typography-size-xs);">
                data-padding="lg"
              </code>
            </article>
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
        <h2 class="docs-section-title">Do / Don't</h2>
        <div class="docs-do-dont">
          <div class="docs-do">
            <h3>Do</h3>
            <ul class="docs-bullet-list">
              <li>default を primary な group content に</li>
              <li>elevated を float / popover 様の前面 content に</li>
              <li>outlined を軽量 grouping (filter chip group 等) に</li>
              <li>padding を content 密度で選ぶ (dense → sm、 hero → lg)</li>
            </ul>
          </div>
          <div class="docs-dont">
            <h3>Don't</h3>
            <ul class="docs-bullet-list">
              <li>elevated を同面で複数並べない (奥行きが崩れる)</li>
              <li>card の中に card を深く入れ子にしない (concentric radius 破綻)</li>
              <li>
                card 自体を <code>role="button"</code> にしない (内部 nested interactive を)
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle、 right panel から
          card の variant / padding / interactive / title / body を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              shortcut: ['ctrl+shift+e', 'meta+shift+e'],
              exposeConsole: true,
              localStorageNamespace: 'creo-ui-docs.card-editor',
            }}
          >
            <CardEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Default -->
<article class="creo-card">
  <h3>Card title</h3>
  <p>説明文</p>
</article>

<!-- Elevated, lg padding (hero) -->
<article class="creo-card" data-variant="elevated" data-padding="lg">
  <h2>Feature</h2>
  <p>...</p>
</article>

<!-- Outlined, interactive -->
<article class="creo-card" data-variant="outlined" data-interactive="true">
  <a href="#">Open ticket</a>
</article>`}</code>
        </pre>
        <p class="docs-page-helper">
          詳細 spec:{' '}
          <a
            href="https://github.com/chronista-club/creo-ui/blob/main/docs/components/card.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/components/card.md ↗
          </a>
        </p>
      </section>
    </>
  )
}

function CardEditorDemo() {
  const [variant, setVariant] = createSignal<'default' | 'elevated' | 'outlined'>('default')
  const [padding, setPadding] = createSignal<'sm' | 'md' | 'lg'>('md')
  const [interactive, setInteractive] = createSignal(false)
  const [title, setTitle] = createSignal('Card title')
  const [body, setBody] = createSignal(
    '説明文を ここに。 token-driven で radius / shadow / padding が一貫。',
  )

  bind({
    id: 'card.variant',
    control: select({ options: ['default', 'elevated', 'outlined'] as const }),
    target: signalTarget('card.variant', variant, setVariant),
    initial: 'default',
    semantic: 'tool',
    placement: { region: 'right', group: 'card', label: 'Variant', order: 1 },
  })
  bind({
    id: 'card.padding',
    control: select({ options: ['sm', 'md', 'lg'] as const }),
    target: signalTarget('card.padding', padding, setPadding),
    initial: 'md',
    semantic: 'tool',
    placement: { region: 'right', group: 'card', label: 'Padding', order: 2 },
  })
  bind({
    id: 'card.interactive',
    control: boolean({ variant: 'switch' }),
    target: signalTarget('card.interactive', interactive, setInteractive),
    initial: false,
    semantic: 'tool',
    placement: { region: 'right', group: 'card', label: 'Interactive (hover)', order: 3 },
  })
  bind({
    id: 'card.title',
    control: string({ variant: 'input' }),
    target: signalTarget('card.title', title, setTitle),
    initial: 'Card title',
    semantic: 'content',
    placement: { region: 'right', group: 'content', label: 'Title', order: 1 },
  })
  bind({
    id: 'card.body',
    control: string({ variant: 'textarea' }),
    target: signalTarget('card.body', body, setBody),
    initial: '説明文を ここに。 token-driven で radius / shadow / padding が一貫。',
    semantic: 'content',
    placement: { region: 'right', group: 'content', label: 'Body', order: 2 },
  })

  return (
    <div class="docs-playground-stage">
      <article
        class="creo-card"
        data-variant={variant()}
        data-padding={padding()}
        data-interactive={interactive() ? 'true' : undefined}
      >
        <h3
          style={{
            margin: '0 0 8px 0',
            'font-size': 'var(--typography-size-base)',
            'font-weight': 'var(--typography-weight-bold)',
          }}
        >
          {title()}
        </h3>
        <p
          style={{
            margin: 0,
            'font-size': 'var(--typography-size-sm)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {body()}
        </p>
      </article>
    </div>
  )
}
