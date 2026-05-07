import { A } from '@solidjs/router'
import {
  EditorHostProvider,
  EditorLayer,
  bind,
  select,
  signalTarget,
  string,
} from 'creo-ui-editor-host'
import { type JSX, createSignal } from 'solid-js'

const PROPS = [
  {
    attr: 'data-size',
    values: 'sm / md / lg',
    def: 'md',
    meaning: 'dialog max-width (320 / 480 / 720 px)',
  },
  {
    attr: 'data-variant',
    values: 'default / destructive',
    def: 'default',
    meaning: 'destructive は title/actions に error 色 hint',
  },
] as const

const TOKENS = [
  { slot: 'backdrop', token: 'rgba(0,0,0,0.5) (::backdrop)' },
  { slot: 'dialog bg', token: 'color.surface.surface' },
  { slot: 'border', token: 'color.surface.border 1px' },
  { slot: 'border-radius', token: 'radius.l (22px)' },
  { slot: 'shadow', token: 'shadow.l' },
  { slot: 'max-width', token: '320 / 480 / 720 px (sm/md/lg)' },
  { slot: 'padding', token: 'spacing.m (body) / spacing.s spacing.m (header/footer)' },
  { slot: 'gap (footer actions)', token: 'layout.gap.tight' },
  { slot: 'title color (destructive)', token: 'color.semantic.error' },
] as const

export default function Dialog() {
  const [defaultDlg, setDefaultDlg] = createSignal<HTMLDialogElement | null>(null)
  const [destructiveDlg, setDestructiveDlg] = createSignal<HTMLDialogElement | null>(null)

  const openDefault: JSX.EventHandler<HTMLButtonElement, MouseEvent> = () => {
    defaultDlg()?.showModal()
  }
  const openDestructive: JSX.EventHandler<HTMLButtonElement, MouseEvent> = () => {
    destructiveDlg()?.showModal()
  }

  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>Dialog</h1>
        <p class="docs-page-lead">
          User の注意を一時的に hijack して重要な決定 (削除確認 / 重要な入力 / destructive action)
          を 取る overlay UI。 native <code>&lt;dialog&gt;</code> を採用し、{' '}
          <code>showModal()</code> で focus trap + backdrop + Esc close を browser に任せる。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview">
          <div class="docs-preview-row-label">Open as modal</div>
          <div class="docs-preview-grid">
            <button type="button" class="creo-btn" data-variant="primary" onClick={openDefault}>
              Open default
            </button>
            <button
              type="button"
              class="creo-btn"
              data-variant="secondary"
              onClick={openDestructive}
            >
              Open destructive
            </button>
          </div>
          <p class="docs-page-helper">
            modal は body 中央に出現、 backdrop / Esc / focus trap は browser native。 開いたら
            Cancel か primary action で close。
          </p>
        </div>
      </section>

      {/* Modals (rendered to portal automatically by browser) */}
      <dialog
        class="creo-dialog"
        data-size="md"
        ref={setDefaultDlg}
        aria-labelledby="dialog-default-title"
        aria-describedby="dialog-default-body"
      >
        <header class="creo-dialog-header">
          <h2 class="creo-dialog-title" id="dialog-default-title">
            削除の確認
          </h2>
          <button
            type="button"
            class="creo-btn"
            data-variant="ghost"
            data-size="sm"
            aria-label="閉じる"
            onClick={() => defaultDlg()?.close()}
          >
            ✕
          </button>
        </header>
        <div class="creo-dialog-body" id="dialog-default-body">
          <p>この項目を削除します。 この操作は取り消せません。</p>
        </div>
        <footer class="creo-dialog-footer">
          <button
            type="button"
            class="creo-btn"
            data-variant="secondary"
            autofocus
            onClick={() => defaultDlg()?.close()}
          >
            キャンセル
          </button>
          <button
            type="button"
            class="creo-btn"
            data-variant="primary"
            onClick={() => defaultDlg()?.close()}
          >
            削除
          </button>
        </footer>
      </dialog>

      <dialog class="creo-dialog" data-variant="destructive" ref={setDestructiveDlg}>
        <header class="creo-dialog-header">
          <h2 class="creo-dialog-title">全データを削除しますか?</h2>
        </header>
        <div class="creo-dialog-body">
          <p>全 memories / atlas / settings が完全に消去されます。 復旧不可。</p>
        </div>
        <footer class="creo-dialog-footer">
          <button
            type="button"
            class="creo-btn"
            data-variant="secondary"
            autofocus
            onClick={() => destructiveDlg()?.close()}
          >
            キャンセル
          </button>
          <button
            type="button"
            class="creo-btn"
            data-variant="primary"
            onClick={() => destructiveDlg()?.close()}
          >
            永久削除
          </button>
        </footer>
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
        <h2 class="docs-section-title">Accessibility</h2>
        <ul class="docs-bullet-list">
          <li>
            native <code>&lt;dialog&gt;</code> + <code>showModal()</code> で focus trap / Esc close
            / <code>role="dialog"</code> + <code>aria-modal="true"</code> が{' '}
            <strong>browser 自動</strong>
          </li>
          <li>
            title に <code>aria-labelledby</code>、 body 説明に <code>aria-describedby</code>{' '}
            を関連付け
          </li>
          <li>
            close button は <code>aria-label="閉じる"</code> 必須 (icon button の場合)
          </li>
          <li>
            destructive action は <code>autofocus</code> を <strong>cancel</strong> に置く
            (誤タップ防止)
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Do / Don't</h2>
        <div class="docs-do-dont">
          <div class="docs-do">
            <h3>Do</h3>
            <ul class="docs-bullet-list">
              <li>注意を引きたい時だけ使う (頻繁に出すと blocker)</li>
              <li>destructive はタイトルで主旨明確、 メッセージで結果明示</li>
              <li>body 内容は短く (3-4 行以内)</li>
              <li>Esc で cancel になる挙動を前提に</li>
            </ul>
          </div>
          <div class="docs-dont">
            <h3>Don't</h3>
            <ul class="docs-bullet-list">
              <li>dialog の中に別 dialog を入れない (stack 混乱)</li>
              <li>close ボタン無しで modal を出さない (逃げ道必須)</li>
              <li>dialog 内で重要な永続データを書かない (cancel で消える前提)</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Live editor (Editor Mode)</h2>
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) で Editor Mode toggle、 right panel から
          dialog の size / variant / title / body を即時編集 (
          <A href="/concepts/editor-mode">Editor Mode protocol</A> dogfood)。 inline 表示 (
          <code>&lt;dialog open&gt;</code>) で modal を出さずに見せる、 真の modal は上の Live
          preview section の Open ボタンで試せる。
        </p>
        <div class="docs-playground-frame">
          <EditorHostProvider
            config={{
              localStorageNamespace: 'creo-ui-docs.dialog-editor',
            }}
          >
            <DialogEditorDemo />
            <EditorLayer />
          </EditorHostProvider>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Code</h2>
        <pre class="docs-code">
          <code>{`<dialog class="creo-dialog" data-size="md" id="confirm-dlg">
  <header class="creo-dialog-header">
    <h2 class="creo-dialog-title">削除の確認</h2>
    <button type="button" class="creo-btn" data-variant="ghost" data-size="sm" aria-label="閉じる">✕</button>
  </header>
  <div class="creo-dialog-body">
    <p>この項目を削除します。 取り消せません。</p>
  </div>
  <footer class="creo-dialog-footer">
    <button type="button" class="creo-btn" data-variant="secondary" autofocus>キャンセル</button>
    <button type="button" class="creo-btn" data-variant="primary">削除</button>
  </footer>
</dialog>

<script>
  document.getElementById('confirm-dlg').showModal()
</script>`}</code>
        </pre>
        <p class="docs-page-helper">
          詳細 spec:{' '}
          <a
            href="https://github.com/chronista-club/creo-ui/blob/main/docs/components/dialog.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            docs/components/dialog.md ↗
          </a>
        </p>
      </section>
    </>
  )
}

type DialogSize = 'sm' | 'md' | 'lg'
type DialogVariant = 'default' | 'destructive'

function DialogEditorDemo() {
  const [size, setSize] = createSignal<DialogSize>('md')
  const [variant, setVariant] = createSignal<DialogVariant>('default')
  const [title, setTitle] = createSignal('削除の確認')
  const [body, setBody] = createSignal('この項目を削除します。 この操作は取り消せません。')

  bind({
    target: signalTarget('dialog.size', size, (v) => setSize(v as DialogSize)),
    control: select(['sm', 'md', 'lg'] as const),
    placement: { semantic: 'tool', group: 'dialog', label: 'Size', order: 1 },
  })
  bind({
    target: signalTarget('dialog.variant', variant, (v) => setVariant(v as DialogVariant)),
    control: select(['default', 'destructive'] as const),
    placement: { semantic: 'tool', group: 'dialog', label: 'Variant', order: 2 },
  })
  bind({
    target: signalTarget('dialog.title', title, setTitle),
    control: string('input'),
    placement: { semantic: 'tool', group: 'content', label: 'Title', order: 1 },
  })
  bind({
    target: signalTarget('dialog.body', body, setBody),
    control: string('textarea'),
    placement: { semantic: 'tool', group: 'content', label: 'Body', order: 2 },
  })

  return (
    <div class="docs-playground-stage">
      {/* inline 表示 (open attribute) — modal でなく直接 view */}
      <dialog
        class="creo-dialog"
        data-size={size()}
        data-variant={variant() === 'default' ? undefined : variant()}
        open
        style={{ position: 'static', margin: 0 }}
      >
        <header class="creo-dialog-header">
          <h2 class="creo-dialog-title">{title()}</h2>
        </header>
        <div class="creo-dialog-body">
          <p>{body()}</p>
        </div>
        <footer class="creo-dialog-footer">
          <button type="button" class="creo-btn" data-variant="secondary">
            キャンセル
          </button>
          <button type="button" class="creo-btn" data-variant="primary">
            {variant() === 'destructive' ? '永久削除' : 'OK'}
          </button>
        </footer>
      </dialog>
    </div>
  )
}
