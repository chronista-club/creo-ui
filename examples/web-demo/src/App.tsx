import { createEffect, createSignal, onCleanup, onMount } from 'solid-js'
import { editorMode, installEditorLayerHandlers, registerFields, useValues } from './editor-host'
import { EditorLayer } from './editor-layer'

export default function App() {
  // Local signals for non-CSS-var fields (App state の一部を Editor Mode から触る例)
  const [title, setTitle] = createSignal('Creo UI')
  const [density, setDensity] = createSignal<'compact' | 'normal' | 'spacious'>('normal')
  const [showFooter, setShowFooter] = createSignal(true)

  onMount(() => {
    const uninstall = installEditorLayerHandlers()

    const unregister = registerFields([
      // === Global field (TOP に出る、全体設定) ===
      {
        id: 'theme.mode',
        label: 'テーマ',
        type: 'select',
        semantic: 'global',
        initial: 'mint-dark',
        constraints: {
          options: [
            'mint-dark',
            'mint-light',
            'sora-dark',
            'sora-light',
            'contrast-dark',
            'contrast-light',
            'oldschool-dark',
            'oldschool-light',
          ],
        },
        role: 'user',
        order: -10,
        apply: (v) => {
          document.documentElement.setAttribute('data-theme', String(v))
        },
      },
      // === Token fields (CSS 変数 bind) ===
      {
        id: 'tokens.spacing.md',
        label: 'spacing.md',
        type: 'number',
        semantic: 'tool',
        group: 'Token',
        initial: 16,
        constraints: { min: 0, max: 48, step: 1, unit: 'px' },
        cssVar: '--spacing-md',
        role: 'dev',
        order: 0,
      },
      {
        id: 'tokens.radius.md',
        label: 'radius.md',
        type: 'number',
        semantic: 'tool',
        group: 'Token',
        initial: 8,
        constraints: { min: 0, max: 24, step: 1, unit: 'px' },
        cssVar: '--radius-md',
        role: 'dev',
        order: 1,
      },
      // === App state fields (signal bind 的に、setter 直接) ===
      {
        id: 'app.title',
        label: 'ページタイトル',
        type: 'string',
        semantic: 'tool',
        group: 'App',
        initial: title(),
        role: 'user',
        order: 10,
      },
      {
        id: 'app.density',
        label: 'レイアウト密度',
        type: 'select',
        semantic: 'tool',
        group: 'App',
        initial: density(),
        constraints: { options: ['compact', 'normal', 'spacious'] },
        role: 'user',
        order: 11,
      },
      {
        id: 'app.show-footer',
        label: 'フッター表示',
        type: 'boolean',
        semantic: 'tool',
        group: 'App',
        initial: showFooter(),
        role: 'user',
        order: 12,
      },
    ])

    // App state fields を values() → signal へ同期 (walking skeleton の手動 bind)
    const values = useValues()
    createEffect(() => {
      const v = values()
      const t = v['app.title']
      if (typeof t === 'string') setTitle(t)
      const d = v['app.density']
      if (d === 'compact' || d === 'normal' || d === 'spacious') setDensity(d)
      const f = v['app.show-footer']
      if (typeof f === 'boolean') setShowFooter(f)
    })

    onCleanup(() => {
      uninstall()
      unregister()
    })
  })

  const densityPadding = () =>
    density() === 'compact'
      ? 'var(--spacing-md)'
      : density() === 'spacious'
        ? 'var(--spacing-2xl)'
        : 'var(--spacing-xl)'

  return (
    <>
      <main
        style={{
          'max-width': '720px',
          margin: '0 auto',
          padding: densityPadding(),
          'font-family': 'var(--typography-family-sans)',
          transition: 'padding 120ms ease',
        }}
      >
        <h1
          style={{
            'font-size': 'var(--typography-size-3xl)',
            margin: '0 0 var(--spacing-md) 0',
            color: 'var(--color-brand-primary)',
            transition: 'color 120ms ease',
          }}
          data-editor-fields="app.title"
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
          Editor Mode の walking skeleton です。<kbd>Ctrl+Shift+E</kbd> で開き、
          <kbd>Esc</kbd> で閉じます。<strong>カード</strong> や <strong>見出し</strong>{' '}
          にホバーして選択 outline を確認、クリックで bind された field にフォーカス。TOP
          の「テーマ」セレクトで light / dark / auto を切り替えられます。
        </p>

        <section
          style={{
            display: 'grid',
            gap: 'var(--spacing-md)',
          }}
        >
          <Card
            title="カード 1 — 間隔"
            description="クリックして、右パネルの spacing.md を動かしてみてください。padding が即座に反応します。"
            fields="tokens.spacing.md"
          />
          <Card
            title="カード 2 — 角丸"
            description="クリックして radius.md を動かすと、layout をずらさずに角の丸みだけが変わります。"
            fields="tokens.radius.md"
          />
          <Card
            title="カード 3 — 両方"
            description="spacing.md と radius.md を同時に編集できます。"
            fields="tokens.spacing.md,tokens.radius.md"
          />
          <Card
            title="カード 4 — アプリ状態"
            description="ページタイトル / レイアウト密度 / フッター表示の on-off を編集できます。"
            fields="app.title,app.density,app.show-footer"
          />
        </section>

        {showFooter() && (
          <footer
            style={{
              'margin-top': 'var(--spacing-2xl)',
              'font-size': 'var(--typography-size-sm)',
              color: 'var(--color-text-tertiary)',
              'line-height': 'var(--typography-line-height-normal)',
            }}
          >
            モード:{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>
              {editorMode.isEnabled() ? 'ON' : 'OFF'}
            </strong>{' '}
            · レイアウト密度: <code>{density()}</code> · Mode toggle の前後で Content の layout
            は不変 (D-6 非侵襲)。
          </footer>
        )}
      </main>

      <EditorLayer />
    </>
  )
}

function Card(props: {
  title: string
  description: string
  fields: string
}) {
  return (
    <article
      data-editor-fields={props.fields}
      style={{
        padding: 'var(--spacing-md)',
        background: 'var(--color-surface-surface)',
        border: '1px solid var(--color-surface-border)',
        'border-radius': 'var(--radius-md)',
        'box-shadow': 'var(--shadow-sm)',
        transition: 'padding 100ms ease, border-radius 100ms ease',
        cursor: 'default',
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
