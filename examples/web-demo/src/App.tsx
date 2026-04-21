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
      {
        id: 'tokens.color.brand.primary',
        label: 'color.brand.primary',
        type: 'color',
        semantic: 'tool',
        group: 'Token',
        initial: '#73e7aa',
        cssVar: '--color-brand-primary',
        role: 'dev',
        order: 2,
      },
      // === App state fields (signal bind 的に、setter 直接) ===
      {
        id: 'app.title',
        label: 'Page title',
        type: 'string',
        semantic: 'tool',
        group: 'App',
        initial: title(),
        role: 'user',
        order: 10,
      },
      {
        id: 'app.density',
        label: 'Layout density',
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
        label: 'Show footer',
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
          data-editor-fields="tokens.color.brand.primary,app.title"
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
          Walking skeleton for Editor Mode. Press <kbd>Ctrl+Shift+E</kbd> to open, <kbd>Esc</kbd> to
          close. Hover any <strong>Card</strong> or <strong>headline</strong> to see the selection
          outline, click to focus its bound fields.
        </p>

        <section
          style={{
            display: 'grid',
            gap: 'var(--spacing-md)',
          }}
        >
          <Card
            title="Card 1 — spacing"
            description="Click me, then drag spacing.md in the right panel. Watch padding react live."
            fields="tokens.spacing.md"
          />
          <Card
            title="Card 2 — radius"
            description="Click me, then drag radius.md. Corners round without any layout shift."
            fields="tokens.radius.md"
          />
          <Card
            title="Card 3 — both"
            description="Click me to edit spacing.md and radius.md together."
            fields="tokens.spacing.md,tokens.radius.md"
          />
          <Card
            title="Card 4 — app state"
            description="Click me to edit page title, density, and footer visibility."
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
            Mode:{' '}
            <strong style={{ color: 'var(--color-text-primary)' }}>
              {editorMode.isEnabled() ? 'ON' : 'OFF'}
            </strong>{' '}
            · Layout density: <code>{density()}</code> · Content layout is preserved across mode
            toggles (D-6 non-invasive).
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
