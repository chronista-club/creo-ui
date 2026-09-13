import { CreoMarkdown } from 'creo-ui-md-view'

const SAMPLE_MD = `# Markdown showcase

文章・表・引用・コードを **creo-ui のトークン**に沿って表示します。

## 表とリスト

| 機能 | 表示 |
| :--- | ---: |
| CommonMark | 対応 |
| GFM の表・タスクリスト | 対応 |

- [x] 読みやすい文字組み
- [x] アプリごとの描画差し替え
- [ ] このあと読むこと

> 表示するだけなら、Markdown の文字列を渡すだけです。

[使い始める](/getting-started) · ~~取り消し線~~ · \`inline code\`

## Code

\`\`\`tsx
<CreoMarkdown text="# hello" />
\`\`\`

## 脚注

複数のビューを並べても脚注の参照先は各ビュー内に収まります。[^note]

[^note]: これは脚注です。
`

export default function Content() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Resources</p>
        <h1>Markdown viewer</h1>
        <p class="docs-page-lead">
          <code>creo-ui-md-view</code> は Markdown の表示専用コンポーネントです。
          文字列を渡すだけで表示でき、リンク・画像・コードの描画はアプリに合わせて差し替えられます。
        </p>
      </header>
      <section>
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-component-preview docs-component-preview--md">
          <CreoMarkdown text={SAMPLE_MD} />
        </div>
        <p class="docs-page-helper">
          テーマを切り替えると、Markdown の文字・背景・罫線も追従します。
        </p>
      </section>
      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`import { CreoMarkdown } from 'creo-ui-md-view'
import '@chronista-club/creo-ui/tokens.css'
import 'creo-ui-md-view/styles.css'

<CreoMarkdown text="# hello" />

// code は inline の場合も呼ばれます。
<CreoMarkdown
  text={markdown}
  components={{
    code: (props) => props.inline
      ? <code>{props.code}</code>
      : <pre data-language={props.language}>{props.code}</pre>,
  }}
/>`}</code>
        </pre>
      </section>
      <section>
        <h2 class="docs-section-title">HTML と拡張</h2>
        <p class="docs-page-helper">
          HTML は既定で文字として表示します。<code>allowHtml</code> を指定すると、 サニタイズ後の
          HTML を表示します。Mermaid は通常のコードブロックとして表示され、 図にしたい場合は{' '}
          <code>components.code</code> で描画を渡せます。 独自 WikiLink・admonition
          記法は通常のリンク・引用へ移行してください。
        </p>
      </section>
    </>
  )
}
