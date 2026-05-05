import { A } from '@solidjs/router'
import { CreoMarkdown } from 'creo-ui-md-view'

const SAMPLE_MD = `# Markdown showcase

**creo-ui-md-view** が *creo-views/md* (WASM mdast parser) を消費して描画している demo。
~~CDN の marked.js~~ ではなく、 自作 Rust crate の出力を SolidJS で render している。

## 構造

| Layer | 実装 | サイズ |
|---|---|---|
| parser | wooorm/markdown-rs (Rust) | ~459 KB WASM |
| AST | ts-rs auto-gen | 27 型 |
| renderer | SolidJS (creo-ui-md-view) | ~9.7 KB |

## リスト

- 通常 list item
- **強調** + *イタリック* + \`inline code\` + [link](https://github.com/chronista-club/creo-views)
  - ネストも OK

1. 順序 list 1
2. 順序 list 2

## Task list (GFM)

- [x] CommonMark + GFM
- [x] Frontmatter / Admonition / WikiLink (拡張)
- [ ] Mermaid SVG (Phase 0.2 予定、 stub あり)

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

export default function Content() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Resources</p>
        <h1>Content (Markdown)</h1>
        <p class="docs-page-lead">
          <code>creo-ui-md-view</code> が{' '}
          <a
            href="https://github.com/chronista-club/creo-views"
            target="_blank"
            rel="noopener noreferrer"
          >
            <code>creo-views/md</code>
          </a>{' '}
          (WASM-backed mdast parser) を消費して描画する SolidJS renderer。{' '}
          <strong>Rust が AST の SSOT</strong>、 TypeScript が型安全に描画。 docs site 自身もこの
          component を dogfood 可能 (将来 docs/design/ MD を render に乗せる)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Pipeline</h2>
        <pre class="docs-code">
          <code>{`Markdown text
   │
   ▼
[creo-md (Rust)]            wooorm/markdown-rs + 拡張 (Frontmatter/Admonition/WikiLink)
   │  parse()
   ▼
mdast (AST)                 ts-rs 経由で TS 型 auto-gen (27 型)
   │
   ▼
[creo-ui-md-view (Solid)]   <CreoMarkdown text={...} />
   │  renderNode (22 node type 対応)
   ▼
DOM (token-aware)           creo-ui-web tokens.css に追従`}</code>
        </pre>
      </section>

      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview docs-component-preview--md">
          <CreoMarkdown text={SAMPLE_MD} />
        </div>
        <p class="docs-page-helper">
          theme switcher (Header 右上) で 8 theme 切替 → markdown も含めて全体が連動する。 Mermaid
          block は Phase 0.2 で SVG render 予定 (<A href="/concepts/frame-system">Frame system</A>{' '}
          の spatial canvas 拡張で描画)。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`import { CreoMarkdown } from 'creo-ui-md-view'
import 'creo-ui-md-view/styles.css'

export const App = () => (
  <CreoMarkdown
    text="# hello\\n\\n**markdown**"
    onAst={(ast) => {
      // frontmatter / 全 mdast tree を consumer 側で受け取れる lifecycle hook
      console.log(ast)
    }}
    fallback={(err) => <div>parse error: {err}</div>}
  />
)`}</code>
        </pre>
      </section>

      <section>
        <h2 class="docs-section-title">対応 node</h2>
        <p class="docs-page-helper">
          22 node type を網羅 — CommonMark + GFM + 3 拡張 (Frontmatter / Admonition / WikiLink)。
          詳細は{' '}
          <a
            href="https://github.com/chronista-club/creo-ui/blob/main/packages/md-view/README.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            creo-ui-md-view/README.md
          </a>{' '}
          参照。
        </p>
      </section>
    </>
  )
}
