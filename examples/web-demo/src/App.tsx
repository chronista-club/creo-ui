import {
  EditorHostProvider,
  EditorLayer,
  THEME_IDS,
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
import { CreoMarkdown } from 'creo-ui-md-view'
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

  // ---------- Tool fields: CSS token sliders ----------
  // (LEFT region の ThemeEditor panel は EditorLayer が内包して描画、App 側の追加不要)

  const spacingMd = bind({
    target: cssVarNumberTarget('tokens.spacing.m', '--spacing-m', 16, 'px'),
    control: number({ min: 0, max: 48, step: 1, unit: 'px', variant: 'slider' }),
    placement: { label: 'spacing.m', semantic: 'tool', group: 'Token', order: 0 },
  })
  const radiusM = bind({
    target: cssVarNumberTarget('tokens.radius.m', '--radius-m', 8, 'px'),
    control: number({ min: 0, max: 24, step: 1, unit: 'px', variant: 'slider' }),
    placement: { label: 'radius.m', semantic: 'tool', group: 'Token', order: 1 },
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
            'font-size': 'var(--typography-title-page)',
            margin: '0 0 var(--spacing-m) 0',
            color: 'var(--color-brand-primary)',
          }}
        >
          {title()}
        </h1>
        <p
          style={{
            'line-height': 'var(--typography-line-height-relaxed)',
            'font-size': 'var(--typography-body-lead)',
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
            gap: 'var(--layout-gap-sibling)',
            'margin-bottom': 'var(--layout-gap-section)',
          }}
        >
          <Card
            title="カード 1 — 間隔"
            description="spacing.m を動かすと padding が即反応。layout は押し退けられない (D-6 非侵襲)。"
            bindId={spacingMd.id}
          />
          <Card
            title="カード 2 — 角丸"
            description="radius.m を動かすと角の丸みだけが変わる。"
            bindId={radiusM.id}
          />
          <Card
            title="カード 3 — アプリ状態"
            description="ページタイトル / フッター表示を編集。"
            bindIds={[title.id, showFooter.id]}
          />
        </section>

        <aside
          style={{
            padding: 'var(--spacing-m)',
            background: 'var(--color-surface-bg-subtle)',
            border: '1px solid var(--color-surface-border)',
            'border-radius': 'var(--radius-m)',
            'font-size': 'var(--typography-body-helper)',
            'line-height': 'var(--typography-line-height-normal)',
          }}
        >
          <h3
            style={{
              margin: '0 0 var(--spacing-s) 0',
              'font-size': 'var(--typography-title-card)',
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
              padding: 'var(--spacing-s)',
              background: 'var(--color-surface-surface)',
              'border-radius': 'var(--radius-s)',
              overflow: 'auto',
              'font-family': 'var(--typography-family-mono)',
              'font-size': 'var(--typography-size-xs)',
            }}
          >
            {`// DevTools Console で実行:
creoEditor.slider('--spacing-l', 24, { min: 0, max: 64, unit: 'px' })
creoEditor.picker('--color-brand-primary', '#73e7aa')
creoEditor.autoDiscover()            // 既知 CSS 変数を一括 bind
creoEditor.export({ format: 'css-patch' })  // 変更分を CSS として取り出す
creoEditor.share()                    // URL に現 state を埋める
creoEditor.help()                     // 使い方一覧`}
          </pre>
        </aside>

        <section
          style={{
            'margin-top': 'var(--layout-gap-section)',
            padding: 'var(--spacing-m)',
            background: 'var(--color-surface-surface)',
            border: '1px solid var(--color-surface-border)',
            'border-radius': 'var(--radius-m)',
          }}
        >
          <h2
            style={{
              margin: '0 0 var(--spacing-m) 0',
              'font-size': 'var(--typography-title-section)',
              'font-weight': 'var(--typography-weight-semibold)',
            }}
          >
            Button component showcase
          </h2>
          <p
            style={{
              margin: '0 0 var(--spacing-m) 0',
              color: 'var(--color-text-secondary)',
              'font-size': 'var(--typography-body-helper)',
            }}
          >
            <code>.creo-btn</code> + <code>data-variant</code> / <code>data-size</code>.
            creo-ui-web@0.3.0 (予定) の最初の component。token 変更に全部追従するのを Editor Mode
            で確認できます。
          </p>
          <div
            style={{
              display: 'flex',
              gap: 'var(--layout-gap-sibling)',
              'flex-wrap': 'wrap',
              'align-items': 'center',
            }}
          >
            <button type="button" class="creo-btn" data-variant="primary">
              Primary
            </button>
            <button type="button" class="creo-btn" data-variant="secondary">
              Secondary
            </button>
            <button type="button" class="creo-btn" data-variant="ghost">
              Ghost
            </button>
            <button type="button" class="creo-btn" data-variant="primary" data-size="sm">
              Small
            </button>
            <button type="button" class="creo-btn" data-variant="primary" data-size="lg">
              Large
            </button>
            <button type="button" class="creo-btn" data-variant="ghost" aria-pressed="true">
              Toggle ON
            </button>
            <button type="button" class="creo-btn" data-variant="primary" disabled>
              Disabled
            </button>
          </div>
        </section>

        <section
          style={{
            'margin-top': 'var(--layout-gap-sibling)',
            padding: 'var(--spacing-m)',
            background: 'var(--color-surface-surface)',
            border: '1px solid var(--color-surface-border)',
            'border-radius': 'var(--radius-m)',
          }}
        >
          <h2
            style={{
              margin: '0 0 var(--spacing-m) 0',
              'font-size': 'var(--typography-title-section)',
              'font-weight': 'var(--typography-weight-semibold)',
            }}
          >
            Input component showcase
          </h2>
          <div
            style={{
              display: 'grid',
              gap: 'var(--spacing-s)',
              'max-width': '420px',
            }}
          >
            <label for="demo-email" style={{ 'font-size': 'var(--typography-body-helper)' }}>
              Email
            </label>
            <input id="demo-email" class="creo-input" type="email" placeholder="you@example.com" />
            <label for="demo-pw" style={{ 'font-size': 'var(--typography-body-helper)' }}>
              Password (filled, error state)
            </label>
            <input
              id="demo-pw"
              class="creo-input"
              type="password"
              data-variant="filled"
              data-state="error"
              aria-invalid="true"
              aria-describedby="demo-pw-err"
              value="短い"
            />
            <p id="demo-pw-err" class="creo-helper-text creo-helper-text--error">
              パスワードは 8 文字以上必要です
            </p>
            <label for="demo-name" style={{ 'font-size': 'var(--typography-body-helper)' }}>
              Name (sm)
            </label>
            <input
              id="demo-name"
              class="creo-input"
              type="text"
              data-size="sm"
              placeholder="Mako"
            />
          </div>
        </section>

        <MarkdownDemo />

        <Show when={showFooter()}>
          <footer
            style={{
              'margin-top': 'var(--margin-xl)',
              'font-size': 'var(--typography-size-s)',
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
    </>
  )
}

const SAMPLE_MD = `# Markdown showcase

**creo-ui-md-view** が *creo-views/md* (WASM mdast parser) を消費して描画している demo。
~~CDN の marked.js~~ ではなく、 自作 Rust crate の出力を SolidJS で render している。

## 構造

| Layer | 実装 | サイズ |
|---|---|---|
| parser | wooorm/markdown-rs (Rust) | 459 KB WASM |
| AST | ts-rs auto-gen | 27 型 |
| renderer | SolidJS (creo-ui-md-view) | 9.69 KB |

## リスト

- 通常 list item
- **強調** + *イタリック* + \`inline code\` + [link](https://github.com/chronista-club/creo-views)
  - ネストも OK

1. 順序 list 1
2. 順序 list 2

## Task list (GFM)

- [x] CommonMark + GFM
- [x] Frontmatter / Admonition / WikiLink (拡張)
- [ ] Mermaid SVG (Phase 0.2)

## Quote

> mdast = Markdown Abstract Syntax Tree。
> Rust が SSOT、 TypeScript が型安全に描画する。

## Code

\`\`\`ts
import { CreoMarkdown } from 'creo-ui-md-view'

const App = () => <CreoMarkdown text="# hi" />
\`\`\`

## Mermaid (placeholder until 0.2)

\`\`\`mermaid
graph TD
  A[parse] --> B[mdast]
  B --> C[render]
  C --> D[DOM]
\`\`\`

## Admonition

:::tip
Tip block — \`:::tip\` 拡張で paragraph と区別される。
:::

:::warning
Warning block — token 経由で色が brand から semantic に切替わる。
:::

## Wiki link

[[memory:1CYxbqacutvL4shGdsiA6u]] で creo-memories の memory を参照、 [[doc:editor-mode]] で内部 doc。

---

End.
`

function MarkdownDemo() {
  return (
    <section
      style={{
        'margin-top': 'var(--layout-gap-section)',
        padding: 'var(--spacing-m)',
        background: 'var(--color-surface-surface)',
        border: '1px solid var(--color-surface-border)',
        'border-radius': 'var(--radius-m)',
      }}
    >
      <h2
        style={{
          margin: '0 0 var(--spacing-m) 0',
          'font-size': 'var(--typography-title-section)',
          'font-weight': 'var(--typography-weight-semibold)',
        }}
      >
        Markdown showcase (creo-ui-md-view)
      </h2>
      <p
        style={{
          margin: '0 0 var(--spacing-m) 0',
          color: 'var(--color-text-secondary)',
          'font-size': 'var(--typography-body-helper)',
        }}
      >
        creo-views/md (Rust + WASM) からの mdast を SolidJS で render。 token
        切替に追従するか確認できる。
      </p>
      <CreoMarkdown text={SAMPLE_MD} />
    </section>
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
    <article class="creo-card" data-editor-fields={fieldsAttr()}>
      <h2
        style={{
          margin: '0 0 var(--spacing-s) 0',
          'font-size': 'var(--typography-title-card)',
          'font-weight': 'var(--typography-weight-semibold)',
        }}
      >
        {props.title}
      </h2>
      <p
        style={{
          margin: '0',
          color: 'var(--color-text-secondary)',
          'font-size': 'var(--typography-body-helper)',
          'line-height': 'var(--typography-line-height-normal)',
        }}
      >
        {props.description}
      </p>
    </article>
  )
}
