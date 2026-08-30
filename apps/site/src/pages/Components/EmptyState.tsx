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
import { createSignal, Show } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'
import EditorModeToggle from '../../ui/EditorModeToggle'

const PROPS = [
  {
    attr: 'data-size',
    values: 's / m / l',
    def: 'm',
    meaning: 'icon + text scale (compact list = s、 main page = m、 hero = l、 5 tier convention)',
  },
] as const

const TOKENS = [
  { slot: 'icon size (s/m/l)', token: 'typography.icon.{m/l/xl} = 40 / 64 / 96 px' },
  { slot: 'icon color', token: 'color.text.tertiary' },
  { slot: 'title', token: 'color.text.primary、 weight.semibold' },
  { slot: 'description', token: 'color.text.secondary' },
  { slot: 'gap (icon → title → desc → actions)', token: 'spacing.s' },
  { slot: 'padding (page-level)', token: 'spacing.xl × spacing.m' },
  { slot: 'max-width', token: '480px (text wrap)' },
] as const

export default function EmptyState() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.empty-state-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Empty state</h1>
        <p class="docs-page-lead">
          data 不在 / 検索結果 0 / 初回 onboarding 等の "何もない状態" を意味あるものに変える UI。
          icon + title + description + action(s) の 4 part 構成。 user に「何が起きたか」 +
          「次に何ができるか」 を一目で示す、 dead-end でなく opportunity に。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground empty state の size / actions / icon / title /
          description を即時編集できる。 Mode ON 中に playground を click するとその instance に
          field が絞られる (selection)。 <A href="/concepts/editor-mode">Editor Mode protocol</A> の
          dogfood。
        </p>
        <div class="docs-component-preview">
          <EmptyStateLivePreview />
          <div class="docs-preview-row-label">First-time / no items yet</div>
          <div class="creo-empty-state">
            <div class="creo-empty-state-icon" aria-hidden="true">
              📁
            </div>
            <h3 class="creo-empty-state-title">No projects yet</h3>
            <p class="creo-empty-state-description">
              最初の project を作って始めましょう。 token / component / docs を一元管理できます。
            </p>
            <div class="creo-empty-state-actions">
              <button type="button" class="creo-btn" data-variant="primary">
                Create project
              </button>
              <button type="button" class="creo-btn" data-variant="ghost">
                Read docs
              </button>
            </div>
          </div>

          <div class="docs-preview-row-label">Search no results</div>
          <div class="creo-empty-state" data-size="s">
            <div class="creo-empty-state-icon" aria-hidden="true">
              🔍
            </div>
            <h3 class="creo-empty-state-title">No results for "xyz"</h3>
            <p class="creo-empty-state-description">
              別の keyword で再検索するか、 filter を緩めてください。
            </p>
            <div class="creo-empty-state-actions">
              <button type="button" class="creo-btn" data-variant="secondary" data-size="s">
                Clear filters
              </button>
            </div>
          </div>

          <div class="docs-preview-row-label">Hero / page-level</div>
          <div class="creo-empty-state" data-size="l">
            <div class="creo-empty-state-icon" aria-hidden="true">
              ✨
            </div>
            <h3 class="creo-empty-state-title">Welcome to creo-ui</h3>
            <p class="creo-empty-state-description">
              token-driven な multi-platform design system。 まず Foundations から見るか、 直接
              Components catalog を探索できます。
            </p>
            <div class="creo-empty-state-actions">
              <button type="button" class="creo-btn" data-variant="primary">
                Get started
              </button>
              <button type="button" class="creo-btn" data-variant="secondary">
                Components
              </button>
            </div>
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
        <h2 class="docs-section-title">3 use cases</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>First-time</strong> — まだ何もない、 onboarding を兼ねる "Create" CTA
          </li>
          <li>
            <strong>Search no result</strong> — 検索 hit 0、 "Clear filters" or "再検索" を促す
          </li>
          <li>
            <strong>Error / unauthorized</strong> — 接続失敗 / 権限なし、 retry or contact CTA
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            icon は <code>aria-hidden="true"</code>、 状態は title + description で text 伝達
          </li>
          <li>
            title は <code>&lt;h3&gt;</code> 等の heading で document hierarchy 維持
          </li>
          <li>action は最大 2 button (primary + secondary)、 多すぎる選択肢は decision fatigue</li>
          <li>"何もない" の state は user の current intent を理解した提案文を提示</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<div class="creo-empty-state">
  <div class="creo-empty-state-icon" aria-hidden="true">📁</div>
  <h3 class="creo-empty-state-title">No projects yet</h3>
  <p class="creo-empty-state-description">
    最初の project を作って始めましょう。
  </p>
  <div class="creo-empty-state-actions">
    <button type="button" class="creo-btn" data-variant="primary">
      Create project
    </button>
    <button type="button" class="creo-btn" data-variant="ghost">
      Read docs
    </button>
  </div>
</div>

<!-- Compact (s) for inline empty -->
<div class="creo-empty-state" data-size="s">
  ...
</div>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type EmptyStateSize = 's' | 'm' | 'l'

/**
 * Live preview の playground。editor-host の bind() で size / actions / icon / title /
 * description を inspector panel に生やし、stage の empty state 自体を selectable にする
 * (Mode ON で click → その instance に field が絞られる)。provider はページ root の 1 枚を共有。
 */
function EmptyStateLivePreview() {
  const [size, setSize] = createSignal<EmptyStateSize>('m')
  const [showActions, setShowActions] = createSignal(true)
  const [icon, setIcon] = createSignal('📁')
  const [title, setTitle] = createSignal('No projects yet')
  const [description, setDescription] = createSignal(
    '最初の project を作って始めましょう。 token / component / docs を一元管理できます。',
  )

  const binders = [
    bind({
      target: signalTarget('empty-state.size', size, (v) => setSize(v as EmptyStateSize)),
      control: select(['s', 'm', 'l'] as const),
      placement: { semantic: 'tool', group: 'empty-state', label: 'Size', order: 1 },
    }),
    bind({
      target: signalTarget('empty-state.actions', showActions, setShowActions),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'empty-state', label: 'Show actions', order: 2 },
    }),
    bind({
      target: signalTarget('empty-state.icon', icon, setIcon),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Icon', order: 1 },
    }),
    bind({
      target: signalTarget('empty-state.title', title, setTitle),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Title', order: 2 },
    }),
    bind({
      target: signalTarget('empty-state.description', description, setDescription),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Description', order: 3 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'empty-state-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        <div ref={selectable} class="creo-empty-state" data-size={size()}>
          <div class="creo-empty-state-icon" aria-hidden="true">
            {icon()}
          </div>
          <h3 class="creo-empty-state-title">{title()}</h3>
          <p class="creo-empty-state-description">{description()}</p>
          <Show when={showActions()}>
            <div class="creo-empty-state-actions">
              <button type="button" class="creo-btn" data-variant="primary">
                Create project
              </button>
              <button type="button" class="creo-btn" data-variant="ghost">
                Read docs
              </button>
            </div>
          </Show>
        </div>
      </div>
      <EditorModeToggle />
    </>
  )
}
