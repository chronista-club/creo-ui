import { type JSX, createSignal } from 'solid-js'

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
    <>
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
        <div class="docs-component-preview">
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
    </>
  )
}
