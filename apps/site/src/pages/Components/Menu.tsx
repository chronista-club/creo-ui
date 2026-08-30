import {
  bind,
  boolean,
  EditorHostProvider,
  EditorLayer,
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
    attr: 'popover',
    values: '(boolean attribute)',
    def: '—',
    meaning: 'native HTML Popover API、 browser 自動で focus / outside-click / Esc 処理',
  },
  {
    attr: 'popovertarget',
    values: '(menu id)',
    def: '—',
    meaning: 'trigger button 側、 開閉対象 menu の id を指定',
  },
  {
    attr: 'data-variant (on .creo-menu-item)',
    values: 'destructive',
    def: '—',
    meaning: '危険な action (削除等) は error 色 hint',
  },
] as const

const TOKENS = [
  { slot: 'background', token: 'color.surface.surface + shadow.l' },
  { slot: 'border', token: 'color.surface.border 1px' },
  { slot: 'border-radius', token: 'radius.m' },
  { slot: 'item padding', token: 'spacing.xs × spacing.s' },
  { slot: 'item hover bg', token: 'color.surface.bg-subtle' },
  { slot: 'item destructive', token: 'color.semantic.error' },
  { slot: 'separator', token: 'color.surface.border 1px' },
  { slot: 'min-width', token: '180px (適切な readability)' },
] as const

export default function Menu() {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.menu-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Menu (Dropdown)</h1>
        <p class="docs-page-lead">
          context-specific action を集約する dropdown menu。 native HTML Popover API (Chrome 114+ /
          Safari 17+ / Firefox 125+) を base に、 focus trap / outside-click / Esc close を{' '}
          <strong>browser に任せる</strong> JS-light 実装。 trigger button + popover container +
          items の 3 part 構成。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground menu の section label / separator / destructive
          item / item label を即時編集できる。 Mode ON 中に playground menu を click するとその
          instance に field が絞られる (selection)。{' '}
          <A href="/concepts/editor-mode">Editor Mode protocol</A> の dogfood。
        </p>
        <div class="docs-component-preview">
          <MenuLivePreview />
          <div class="docs-preview-row-label">Basic menu</div>
          <div class="cu-row cu-gap-s cu-center docs-preview-grid">
            <button type="button" class="creo-btn" data-variant="ghost" popovertarget="menu-basic">
              ⋯ Actions
            </button>
            <div class="creo-menu" id="menu-basic" popover>
              <div class="creo-menu-label">Edit</div>
              <button type="button" class="creo-menu-item">
                Rename
              </button>
              <button type="button" class="creo-menu-item">
                Duplicate
              </button>
              <button type="button" class="creo-menu-item">
                Move to…
              </button>
              <hr class="creo-menu-separator" />
              <div class="creo-menu-label">Danger</div>
              <button type="button" class="creo-menu-item" data-variant="destructive">
                Delete
              </button>
            </div>
          </div>
          <p class="docs-page-helper">
            ↑ button を click すると popover として open。 Esc / 外 click で close (browser
            native)。
          </p>
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
        <h2 class="docs-section-title">Menu vs Popover vs Dialog</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Menu</strong> — list of action items、 click で 1 つを選んで実行 + close
          </li>
          <li>
            <strong>Popover</strong> — small inline content、 form input や config 等の{' '}
            <strong>interactive UI</strong> を内包
          </li>
          <li>
            <strong>Dialog</strong> — modal で user 注意を hijack、 重要な決定 (削除確認等)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            native <code>popover</code> attribute → browser 自動で focus 移動 / Esc close /
            outside-click close
          </li>
          <li>
            trigger button に <code>popovertarget="{'<menu-id>'}"</code>、 menu 側に <code>id</code>{' '}
            + <code>popover</code> 属性
          </li>
          <li>arrow navigation は browser 標準では未提供、 必要なら別途 JS</li>
          <li>
            destructive item は <code>color.semantic.error</code> + 文字 hint (色 only NG)
          </li>
          <li>
            icon-only trigger は <code>aria-label</code> 必須
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<button type="button" class="creo-btn" popovertarget="menu1">
  ⋯ Actions
</button>

<div class="creo-menu" id="menu1" popover>
  <div class="creo-menu-label">Edit</div>
  <button type="button" class="creo-menu-item">Rename</button>
  <button type="button" class="creo-menu-item">Duplicate</button>
  <hr class="creo-menu-separator" />
  <button type="button" class="creo-menu-item" data-variant="destructive">
    Delete
  </button>
</div>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

/**
 * Live preview の playground。editor-host の bind() で section label / separator /
 * destructive item / item label を inspector panel に生やし、stage の menu 自体を
 * selectable にする (Mode ON で click → その instance に field が絞られる)。
 * provider はページ root の 1 枚を共有。
 */
function MenuLivePreview() {
  const [showLabels, setShowLabels] = createSignal(true)
  const [separator, setSeparator] = createSignal(true)
  const [destructive, setDestructive] = createSignal(true)
  const [itemLabel, setItemLabel] = createSignal('Rename')

  const binders = [
    bind({
      target: signalTarget('menu.showLabels', showLabels, setShowLabels),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'menu', label: 'Section labels', order: 1 },
    }),
    bind({
      target: signalTarget('menu.separator', separator, setSeparator),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'menu', label: 'Separator', order: 2 },
    }),
    bind({
      target: signalTarget('menu.destructive', destructive, setDestructive),
      control: boolean({ variant: 'switch' }),
      placement: { semantic: 'tool', group: 'menu', label: 'Destructive item', order: 3 },
    }),
    bind({
      target: signalTarget('menu.itemLabel', itemLabel, setItemLabel),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'First item label', order: 1 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'menu-live-preview' })

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="cu-row cu-center docs-playground-stage">
        {/* popover を使わない inline 表示 (position fallback を打ち消して flow 配置) */}
        <div class="creo-menu" style={{ position: 'static' }} ref={selectable}>
          <Show when={showLabels()}>
            <div class="creo-menu-label">Edit</div>
          </Show>
          <button type="button" class="creo-menu-item">
            {itemLabel()}
          </button>
          <button type="button" class="creo-menu-item">
            Duplicate
          </button>
          <button type="button" class="creo-menu-item">
            Move to…
          </button>
          <Show when={separator()}>
            <hr class="creo-menu-separator" />
          </Show>
          <Show when={destructive()}>
            <Show when={showLabels()}>
              <div class="creo-menu-label">Danger</div>
            </Show>
            <button type="button" class="creo-menu-item" data-variant="destructive">
              Delete
            </button>
          </Show>
        </div>
      </div>
      <EditorModeToggle />
    </>
  )
}
