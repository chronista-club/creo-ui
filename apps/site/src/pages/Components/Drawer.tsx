import {
  EditorHostProvider,
  EditorLayer,
  bind,
  select,
  signalTarget,
  string,
  useEditorHost,
  useEditorMode,
  useEditorSelectable,
} from '@chronista-club/creo-ui-editor-host'
import { CUButton } from '@chronista-club/creo-ui/controls'
import { A } from '@solidjs/router'
import { type JSX, createSignal } from 'solid-js'
import { PropsTable, TokensTable } from '../../ui/DocsTables'

const PROPS = [
  {
    attr: 'data-placement',
    values: 'right (default) / left / top / bottom',
    def: 'right',
    meaning: 'drawer の出現方向、 desktop = side、 mobile = bottom が慣習',
  },
  {
    attr: 'data-size',
    values: 's / m / l / xl',
    def: 'm',
    meaning: 'drawer 寸法 (320 / 480 / 640 / 800 px)',
  },
] as const

const TOKENS = [
  { slot: 'backdrop', token: 'rgba(0,0,0,0.5) (::backdrop)' },
  { slot: 'background', token: 'color.surface.surface' },
  { slot: 'border', token: 'color.surface.border 1px (反対側)' },
  { slot: 'shadow', token: 'shadow.l' },
  { slot: 'header padding', token: 'spacing.s × spacing.m' },
  { slot: 'body padding', token: 'spacing.m' },
  { slot: 'animation', token: 'transform translate ± duration.normal' },
] as const

export default function Drawer() {
  const [rightDrawer, setRightDrawer] = createSignal<HTMLDialogElement | null>(null)
  const [bottomDrawer, setBottomDrawer] = createSignal<HTMLDialogElement | null>(null)

  const openRight: JSX.EventHandler<HTMLButtonElement, MouseEvent> = () => {
    rightDrawer()?.showModal()
  }
  const openBottom: JSX.EventHandler<HTMLButtonElement, MouseEvent> = () => {
    bottomDrawer()?.showModal()
  }

  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-docs.drawer-editor',
      }}
    >
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Drawer</h1>
        <p class="docs-page-lead">
          画面端から slide-in する panel — sidebar 拡張 / detail view / mobile menu / form editor
          等。 native <code>&lt;dialog&gt;</code> + <code>showModal()</code> で focus trap /
          backdrop / Esc を browser 自動、 Drawer 固有の placement 4 方向 + animation を CSS で。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か下の toggle で Editor Mode ON →
          floating inspector panel から playground drawer の placement / size / title / body
          を即時編集できる。 playground は inline 表示 (<code>&lt;dialog open&gt;</code>) で modal
          を出さずに見せる — 真の modal は下の Open ボタンで試せる。 Mode ON 中に playground drawer
          を click するとその instance に field が絞られる (selection)。{' '}
          <A href="/concepts/editor-mode">Editor Mode protocol</A> の dogfood。
        </p>
        <div class="docs-component-preview">
          <DrawerLivePreview />
          <div class="docs-preview-row-label">Open drawer (modal)</div>
          <div class="docs-preview-grid">
            <button type="button" class="creo-btn" data-variant="primary" onClick={openRight}>
              Right drawer
            </button>
            <button type="button" class="creo-btn" data-variant="secondary" onClick={openBottom}>
              Bottom drawer
            </button>
          </div>
        </div>
      </section>

      {/* Modal drawers (portal automatic) */}
      <dialog
        class="creo-drawer"
        data-placement="right"
        data-size="m"
        ref={setRightDrawer}
        aria-labelledby="drawer-right-title"
        aria-describedby="drawer-right-body"
      >
        <header class="creo-drawer-header">
          <h2 class="creo-drawer-title" id="drawer-right-title">
            Settings
          </h2>
          <button
            type="button"
            class="creo-btn"
            data-variant="ghost"
            data-size="s"
            aria-label="閉じる"
            onClick={() => rightDrawer()?.close()}
          >
            ✕
          </button>
        </header>
        <div class="creo-drawer-body" id="drawer-right-body">
          <p>Right drawer (default placement、 size md = 480px)。</p>
          <p>backdrop / Esc / focus trap は browser native。</p>
        </div>
        <footer class="creo-drawer-footer">
          <button
            type="button"
            class="creo-btn"
            data-variant="secondary"
            onClick={() => rightDrawer()?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            class="creo-btn"
            data-variant="primary"
            onClick={() => rightDrawer()?.close()}
          >
            Save
          </button>
        </footer>
      </dialog>

      <dialog
        class="creo-drawer"
        data-placement="bottom"
        data-size="l"
        ref={setBottomDrawer}
        aria-labelledby="drawer-bottom-title"
      >
        <header class="creo-drawer-header">
          <h2 class="creo-drawer-title" id="drawer-bottom-title">
            Mobile menu
          </h2>
          <button
            type="button"
            class="creo-btn"
            data-variant="ghost"
            data-size="s"
            aria-label="閉じる"
            onClick={() => bottomDrawer()?.close()}
          >
            ✕
          </button>
        </header>
        <div class="creo-drawer-body">
          <p>Bottom drawer (mobile-friendly placement、 size lg = 640px の vertical 分)。</p>
          <p>thumb-friendly tap area + sheet 形式が iOS / Android 慣習。</p>
        </div>
      </dialog>

      <section>
        <h2 class="docs-section-title">Props</h2>
        <PropsTable rows={PROPS} />
      </section>

      <section>
        <h2 class="docs-section-title">Token reference</h2>
        <TokensTable rows={TOKENS} />
      </section>

      <section>
        <h2 class="docs-section-title">Drawer vs Dialog vs Popover</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>Drawer</strong> — slide-in side panel、 多 content / form / settings、 modal
          </li>
          <li>
            <strong>Dialog</strong> — center modal、 短い決定 (削除確認等)
          </li>
          <li>
            <strong>Popover</strong> — non-modal、 inline 補足 / preview
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            native <code>&lt;dialog&gt;</code> + <code>showModal()</code> → focus trap / Esc /{' '}
            <code>role="dialog"</code> + <code>aria-modal="true"</code> 自動
          </li>
          <li>
            title に <code>aria-labelledby</code>、 body 説明に <code>aria-describedby</code>
          </li>
          <li>
            close button は <code>aria-label="閉じる"</code> 必須 (icon-only)
          </li>
          <li>mobile 推奨 placement = bottom (thumb-friendly、 OS sheet 慣習)</li>
          <li>長 form 内では Cancel + Save を footer に固定 (sticky)、 scroll で隠れさせない</li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<button type="button" class="creo-btn" onclick="rightDrawer.showModal()">
  Open
</button>

<dialog class="creo-drawer" data-placement="right" data-size="m" id="rightDrawer">
  <header class="creo-drawer-header">
    <h2 class="creo-drawer-title">Settings</h2>
    <button type="button" class="creo-btn" data-variant="ghost"
            aria-label="閉じる" onclick="this.closest('dialog').close()">
      ✕
    </button>
  </header>
  <div class="creo-drawer-body">
    ...
  </div>
  <footer class="creo-drawer-footer">
    ...
  </footer>
</dialog>

<!-- Bottom drawer (mobile-friendly) -->
<dialog class="creo-drawer" data-placement="bottom" data-size="l">
  ...
</dialog>`}</code>
        </pre>
      </section>

      <EditorLayer />
    </EditorHostProvider>
  )
}

type DrawerPlacement = 'right' | 'left' | 'top' | 'bottom'
type DrawerSize = 's' | 'm' | 'l' | 'xl'

/**
 * Live preview の playground。editor-host の bind() で placement / size / title / body を
 * inspector panel に生やし、stage の drawer 自体を selectable にする (Mode ON で click →
 * その instance に field が絞られる)。overlay component なので portal / showModal() は使わず
 * inline 表示 (<dialog open> + position: static override) で stage に置く。placement 切替で
 * border 側と entrance animation が変わる。provider はページ root の 1 枚を共有。
 */
function DrawerLivePreview() {
  const host = useEditorHost()
  const mode = useEditorMode()

  const [placement, setPlacement] = createSignal<DrawerPlacement>('right')
  const [size, setSize] = createSignal<DrawerSize>('m')
  const [title, setTitle] = createSignal('Settings')
  const [body, setBody] = createSignal(
    'placement / size を inspector panel から切替 — border 側と entrance animation が追従する。',
  )

  const binders = [
    bind({
      target: signalTarget('drawer.placement', placement, (v) =>
        setPlacement(v as DrawerPlacement),
      ),
      control: select(['right', 'left', 'top', 'bottom'] as const),
      placement: { semantic: 'tool', group: 'drawer', label: 'Placement', order: 1 },
    }),
    bind({
      target: signalTarget('drawer.size', size, (v) => setSize(v as DrawerSize)),
      control: select(['s', 'm', 'l', 'xl'] as const),
      placement: { semantic: 'tool', group: 'drawer', label: 'Size', order: 2 },
    }),
    bind({
      target: signalTarget('drawer.title', title, setTitle),
      control: string('input'),
      placement: { semantic: 'tool', group: 'content', label: 'Title', order: 1 },
    }),
    bind({
      target: signalTarget('drawer.body', body, setBody),
      control: string('textarea'),
      placement: { semantic: 'tool', group: 'content', label: 'Body', order: 2 },
    }),
  ]

  const selectable = useEditorSelectable({ binders, id: 'drawer-live-preview' })

  const vertical = () => placement() === 'top' || placement() === 'bottom'

  return (
    <>
      <div class="docs-preview-row-label">Playground (Editor Mode)</div>
      <div class="docs-playground-stage">
        {/* inline 表示 (open attribute + position: static override) — modal でなく直接 view。
            width は right/left の data-size に追従、 height は stage 用に固定 */}
        <dialog
          ref={selectable}
          class="creo-drawer"
          data-placement={placement()}
          data-size={size()}
          open
          style={{
            position: 'static',
            margin: '0',
            'max-width': '100%',
            width: vertical() ? '100%' : undefined,
            height: '240px',
          }}
        >
          <header class="creo-drawer-header">
            <h2 class="creo-drawer-title">{title()}</h2>
          </header>
          <div class="creo-drawer-body">
            <p>{body()}</p>
          </div>
          <footer class="creo-drawer-footer">
            <button type="button" class="creo-btn" data-variant="secondary">
              Cancel
            </button>
            <button type="button" class="creo-btn" data-variant="primary">
              Save
            </button>
          </footer>
        </dialog>
      </div>
      <div class="docs-preview-grid">
        <CUButton variant="ghost" size="s" pressed={mode() === 'on'} onClick={() => host.toggle()}>
          Editor Mode: {mode() === 'on' ? 'ON' : 'OFF'}
        </CUButton>
      </div>
    </>
  )
}
