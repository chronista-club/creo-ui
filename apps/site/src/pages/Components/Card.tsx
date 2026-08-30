import {
  bind,
  boolean,
  EditorHostProvider,
  EditorLayer,
  select,
  signalTarget,
  string,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { A } from '@solidjs/router'
import { createSignal } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'
import EditorModeToggle from '../../ui/EditorModeToggle'

const PROPS = [
  {
    attr: 'data-variant',
    values: 'default / elevated / outlined',
    def: 'default',
    meaning: '視覚的 lift / emphasis',
  },
  { attr: 'data-padding', values: 's / m / l', def: 'm', meaning: '内側余白の scale' },
  {
    attr: 'data-interactive',
    values: '"true"',
    def: '—',
    meaning: 'hover state を有効化 (button/link として使う場合)',
  },
] as const

const TOKENS = [
  { slot: 'background (default)', token: 'color.surface.surface' },
  { slot: 'background (elevated)', token: 'color.surface.surface + shadow.m' },
  { slot: 'background (outlined)', token: 'transparent + color.surface.border 1.5px' },
  { slot: 'padding', token: 'spacing.{s/m/l}' },
  { slot: 'border-radius', token: 'radius.m' },
  { slot: 'border (default)', token: 'color.surface.border 1px' },
  { slot: 'gap (title + body)', token: 'layout.gap.tight' },
] as const

export default function Card() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.card-editor',
      }}
    >
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
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground card の variant / padding / interactive / title /
          body を即時編集できる。 Mode ON 中に playground card を click するとその instance に field
          が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <CardLivePreview />
          <div class="docs-preview-row-label">Variants</div>
          <div class="docs-preview-grid docs-preview-grid--cards">
            <article class="creo-card" data-variant="default">
              <h4 style="margin: 0 0 8px 0; font-size: var(--typography-title-card); font-weight: var(--typography-weight-bold); line-height: var(--typography-line-height-tight);">
                Default
              </h4>
              <p style="margin: 0; font-size: var(--typography-size-s); color: var(--color-text-secondary);">
                surface bg + 1px border。 group content 用。
              </p>
            </article>
            <article class="creo-card" data-variant="elevated">
              <h4 style="margin: 0 0 8px 0; font-size: var(--typography-title-card); font-weight: var(--typography-weight-bold); line-height: var(--typography-line-height-tight);">
                Elevated
              </h4>
              <p style="margin: 0; font-size: var(--typography-size-s); color: var(--color-text-secondary);">
                + shadow.m で前面に浮く感。
              </p>
            </article>
            <article class="creo-card" data-variant="outlined">
              <h4 style="margin: 0 0 8px 0; font-size: var(--typography-title-card); font-weight: var(--typography-weight-bold); line-height: var(--typography-line-height-tight);">
                Outlined
              </h4>
              <p style="margin: 0; font-size: var(--typography-size-s); color: var(--color-text-secondary);">
                transparent bg + 1.5px border。 軽量 grouping。
              </p>
            </article>
          </div>
          <div class="docs-preview-row-label">Paddings</div>
          <div class="docs-preview-grid docs-preview-grid--cards">
            <article class="creo-card" data-padding="s">
              <code style="font-family: var(--typography-family-sans); font-size: var(--typography-size-xs);">
                data-padding="s"
              </code>
            </article>
            <article class="creo-card" data-padding="m">
              <code style="font-family: var(--typography-family-sans); font-size: var(--typography-size-xs);">
                data-padding="m"
              </code>
            </article>
            <article class="creo-card" data-padding="l">
              <code style="font-family: var(--typography-family-sans); font-size: var(--typography-size-xs);">
                data-padding="l"
              </code>
            </article>
          </div>
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
        <h2 class="docs-section-title">Do / Don't</h2>
        <div class="docs-do-dont">
          <div class="docs-do">
            <h3>Do</h3>
            <ul class="docs-bullet-list">
              <li>default を primary な group content に</li>
              <li>elevated を float / popover 様の前面 content に</li>
              <li>outlined を軽量 grouping (filter chip group 等) に</li>
              <li>padding を content 密度で選ぶ (dense → s、 hero → l)</li>
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
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<!-- Default -->
<article class="creo-card">
  <h3>Card title</h3>
  <p>説明文</p>
</article>

<!-- Elevated, l padding (hero) -->
<article class="creo-card" data-variant="elevated" data-padding="l">
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

      <EditorLayer />
    </EditorHostProvider>
  )
}

type CardVariant = 'default' | 'elevated' | 'outlined'
type CardPadding = 's' | 'm' | 'l'

/**
 * Live preview の playground。editor-host の bind() で variant / padding / interactive /
 * title / body を inspector panel に生やし、stage の card 自体を selectable にする (Mode ON で
 * click → その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function CardLivePreview() {
  const [variant, setVariant] = createSignal<CardVariant>('default')
  const [padding, setPadding] = createSignal<CardPadding>('m')
  const [interactive, setInteractive] = createSignal(false)
  const [title, setTitle] = createSignal('Card title')
  const [body, setBody] = createSignal(
    '説明文を ここに。 token-driven で radius / shadow / padding が一貫。',
  )

  const binders = [
    bind({
      target: signalTarget('card.variant', variant, (v) => setVariant(v as CardVariant)),
      control: select(['default', 'elevated', 'outlined'] as const),
      placement: { semantic: 'tool', group: 'card', label: 'Variant', order: 1 },
    }),
    bind({
      target: signalTarget('card.padding', padding, (v) => setPadding(v as CardPadding)),
      control: select(['s', 'm', 'l'] as const),
      placement: { semantic: 'tool', group: 'card', label: 'Padding', order: 2 },
    }),
    bind({
      target: signalTarget('card.interactive', interactive, setInteractive),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'card', label: 'Interactive (hover)', order: 3 },
    }),
    bind({
      target: signalTarget('card.title', title, setTitle),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Title', order: 1 },
    }),
    bind({
      target: signalTarget('card.body', body, setBody),
      control: string('textarea'),
      placement: { semantic: 'tool', group: 'content', label: 'Body', order: 2 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'card-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        <article
          ref={selectable}
          class="creo-card"
          data-variant={variant()}
          data-padding={padding()}
          data-interactive={interactive() ? 'true' : undefined}
        >
          <h3
            style={{
              margin: '0 0 8px 0',
              'font-size': 'var(--typography-title-card)',
              'font-weight': 'var(--typography-weight-bold)',
              'line-height': 'var(--typography-line-height-tight)',
            }}
          >
            {title()}
          </h3>
          <p
            style={{
              margin: 0,
              'font-size': 'var(--typography-size-s)',
              color: 'var(--color-text-secondary)',
            }}
          >
            {body()}
          </p>
        </article>
      </div>
      <EditorModeToggle />
    </>
  )
}
