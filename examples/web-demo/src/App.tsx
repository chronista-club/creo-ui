import {
  EditorHostProvider,
  EditorLayer,
  THEME_IDS,
  ThemeEditor,
  type ThemeId,
  bind,
  boolean,
  cssVarNumberTarget,
  ephemeralTarget,
  number,
  select,
  string,
  useEditorMode,
} from 'creo-ui-editor-host'
import { Show, createEffect } from 'solid-js'

export default function App() {
  return (
    <EditorHostProvider
      config={{
        urlSync: { autoSync: true, autoApply: true, onlyChanged: true },
        crossTab: true,
      }}
    >
      <Demo />
      <EditorLayer />
    </EditorHostProvider>
  )
}

function Demo() {
  // ---------- Global field: theme ----------
  const theme = bind<ThemeId>({
    target: ephemeralTarget<ThemeId>('theme.mode', 'mint-dark'),
    control: select(THEME_IDS as readonly string[], 'dropdown'),
    placement: { label: 'テーマ', semantic: 'global', order: -10 },
  })
  createEffect(() => {
    document.documentElement.setAttribute('data-theme', theme())
  })

  // ---------- Left: ThemeEditor panel (palette swatch) ----------
  // (ThemeEditor component は自身で LEFT region に描画、bind() 不要)

  // ---------- Tool fields: CSS token sliders ----------
  const spacingMd = bind({
    target: cssVarNumberTarget('tokens.spacing.md', '--spacing-md', 16, 'px'),
    control: number({ min: 0, max: 48, step: 1, unit: 'px', variant: 'slider' }),
    placement: { label: 'spacing.md', semantic: 'tool', group: 'Token', order: 0 },
  })
  const radiusMd = bind({
    target: cssVarNumberTarget('tokens.radius.md', '--radius-md', 8, 'px'),
    control: number({ min: 0, max: 24, step: 1, unit: 'px', variant: 'slider' }),
    placement: { label: 'radius.md', semantic: 'tool', group: 'Token', order: 1 },
  })

  // ---------- Tool fields: app state (signal 無しで ephemeral + Accessor) ----------
  const title = bind({
    target: ephemeralTarget('app.title', 'Creo UI'),
    control: string('input'),
    placement: { label: 'ページタイトル', semantic: 'tool', group: 'App', order: 10 },
  })
  const showFooter = bind({
    target: ephemeralTarget('app.show-footer', true),
    control: boolean({ variant: 'switch' }),
    placement: { label: 'フッター表示', semantic: 'tool', group: 'App', order: 12 },
  })

  const mode = useEditorMode()

  return (
    <>
      <main
        style={{
          'max-width': '720px',
          margin: '0 auto',
          padding: 'var(--spacing-xl)',
          'font-family': 'var(--typography-family-sans)',
        }}
      >
        <h1
          ref={title.selectable()}
          style={{
            'font-size': 'var(--typography-size-3xl)',
            margin: '0 0 var(--spacing-md) 0',
            color: 'var(--color-brand-primary)',
          }}
        >
          {title()}
        </h1>
        <p
          style={{
            'line-height': 'var(--typography-line-height-relaxed)',
            'font-size': 'var(--typography-size-base)',
            margin: '0 0 var(--spacing-xl) 0',
          }}
        >
          <strong>creo-ui-editor-host</strong> の live design surface demo。
          <kbd>Ctrl+Shift+E</kbd> で Editor Mode を開き、TOP のテーマ切替、RIGHT の slider、LEFT の
          ThemeEditor で design tokens をリアルタイム編集。
        </p>

        <section
          style={{
            display: 'grid',
            gap: 'var(--spacing-md)',
            'margin-bottom': 'var(--spacing-xl)',
          }}
        >
          <Card
            title="カード 1 — 間隔"
            description="spacing.md を動かすと padding が即反応。layout は押し退けられない (D-6 非侵襲)。"
            bindId={spacingMd.id}
          />
          <Card
            title="カード 2 — 角丸"
            description="radius.md を動かすと角の丸みだけが変わる。"
            bindId={radiusMd.id}
          />
          <Card
            title="カード 3 — アプリ状態"
            description="ページタイトル / フッター表示を編集。"
            bindIds={[title.id, showFooter.id]}
          />
        </section>

        <aside
          style={{
            padding: 'var(--spacing-md)',
            background: 'var(--color-surface-surface-muted)',
            border: '1px solid var(--color-surface-border)',
            'border-radius': 'var(--radius-md)',
            'font-size': 'var(--typography-size-sm)',
            'line-height': 'var(--typography-line-height-normal)',
          }}
        >
          <h3
            style={{
              margin: '0 0 var(--spacing-sm) 0',
              'font-size': 'var(--typography-size-base)',
              'font-weight': 'var(--typography-weight-semibold)',
            }}
          >
            DevTools Console から field を増やす (F1 Console REPL)
          </h3>
          <p style={{ margin: '0 0 var(--spacing-xs) 0' }}>
            DevTools の Console で以下を叩くと、RIGHT panel に slider が即生える。
          </p>
          <pre
            style={{
              margin: '0',
              padding: 'var(--spacing-sm)',
              background: 'var(--color-surface-surface)',
              'border-radius': 'var(--radius-sm)',
              overflow: 'auto',
              'font-family': 'var(--typography-family-mono)',
              'font-size': 'var(--typography-size-xs)',
            }}
          >
            {`// DevTools Console で実行:
creoEditor.slider('--spacing-lg', 24, { min: 0, max: 64, unit: 'px' })
creoEditor.picker('--color-brand-primary', '#73e7aa')
creoEditor.autoDiscover()            // 既知 CSS 変数を一括 bind
creoEditor.export({ format: 'css-patch' })  // 変更分を CSS として取り出す
creoEditor.share()                    // URL に現 state を埋める
creoEditor.help()                     // 使い方一覧`}
          </pre>
        </aside>

        <Show when={showFooter()}>
          <footer
            style={{
              'margin-top': 'var(--spacing-2xl)',
              'font-size': 'var(--typography-size-sm)',
              color: 'var(--color-text-tertiary)',
            }}
          >
            Editor Mode:{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>
              {mode() === 'on' ? 'ON' : 'OFF'}
            </strong>{' '}
            · URL sync / cross-tab sync 有効 · 2 tab で開いて slider 動かすと同期します
          </footer>
        </Show>
      </main>

      <ThemeEditor />
    </>
  )
}

function Card(props: {
  title: string
  description: string
  bindId?: string
  bindIds?: readonly string[]
}) {
  const fieldsAttr = () => (props.bindIds ? props.bindIds.join(',') : (props.bindId ?? ''))
  return (
    <article
      data-editor-fields={fieldsAttr()}
      style={{
        padding: 'var(--spacing-md)',
        background: 'var(--color-surface-surface)',
        border: '1px solid var(--color-surface-border)',
        'border-radius': 'var(--radius-md)',
        'box-shadow': 'var(--shadow-sm)',
        transition: 'padding 100ms ease, border-radius 100ms ease',
      }}
    >
      <h2
        style={{
          margin: '0 0 var(--spacing-sm) 0',
          'font-size': 'var(--typography-size-lg)',
          'font-weight': 'var(--typography-weight-semibold)',
        }}
      >
        {props.title}
      </h2>
      <p
        style={{
          margin: '0',
          color: 'var(--color-text-secondary)',
          'font-size': 'var(--typography-size-sm)',
          'line-height': 'var(--typography-line-height-normal)',
        }}
      >
        {props.description}
      </p>
    </article>
  )
}
