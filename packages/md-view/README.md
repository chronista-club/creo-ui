# creo-ui-md-view

Markdown の表示専用 SolidJS コンポーネント。既存の remark パーサーを内蔵し、
creo-ui のトークンで表示する。consumer は Rust / WASM / 隣接 repo を用意しなくてよい。

## Install

```sh
npm install creo-ui-md-view solid-js @chronista-club/creo-ui
```

このリポジトリ内の変更を公開前に使う場合は、ビルドした tarball をインストールする。
`@chronista-club/creo-ui` は標準トークン用。独自の同名 CSS 変数を供給する場合は省略できる。

```tsx
import { CreoMarkdown } from 'creo-ui-md-view'
import '@chronista-club/creo-ui/tokens.css'
import 'creo-ui-md-view/styles.css'

<CreoMarkdown text="# Hello\n\n**Markdown**" />
```

## Display extensions

`components` でリンク・画像・コードの描画を差し替える。parser や AST の指定は不要。
リンクと画像にはサニタイズ済みの HTML 属性、コードには文字列・言語・inline を渡す。
コードブロックの差し替えは `pre` を含む表示全体を担当する。

```tsx
<CreoMarkdown
  text={markdown}
  components={{
    a: props => <a {...props} onClick={() => console.log('link')} />,
    img: props => <img {...props} decoding="async" />,
    code: props => props.inline
      ? <code>{props.code}</code>
      : <pre data-language={props.language}>{props.code}</pre>,
  }}
/>
```

CommonMark、GFM の表・タスクリスト・取り消し線・自動リンク・脚注をサポートする。
YAML / TOML frontmatter は表示せず、`onAst` で標準 mdast の `yaml` / `toml` ノードとして参照できる。
frontmatter の内容を設定オブジェクトへ変換する処理は行わない。
Mermaid は通常の fenced code。図の renderer は必要なアプリが `components.code` で供給する。

## HTML policy

- 既定: HTML は文字として表示。Markdown 由来の URL もサニタイズする。
- `allowHtml`: HTML を解析し、`hast-util-sanitize` の標準スキーマでサニタイズして表示。
  script / event handler / 危険な URL をそのまま DOM に挿入しない。
- HTML と脚注の ID はビュー単位に prefix を付け、文書内の参照も追従させる。
- custom component が追加・変更した HTML や URL は consumer の責任。渡された属性を
  安全でない HTML 文字列へ戻す用途には使わない。

## API

| prop | 内容 |
|---|---|
| `text: string` | Markdown 本文。更新に追従 |
| `class?: string` | wrapper の追加 class |
| `loading?: JSX.Element` | 解析結果を待つ間の表示 |
| `fallback?: (error: string) => JSX.Element` | エラー時の表示 |
| `onAst?: (ast: MarkdownRoot) => void` | 解析後の標準 mdast。通常の表示では不要 |
| `allowHtml?: boolean` | サニタイズした HTML を表示。既定 false |
| `components?: MarkdownComponents` | `a` / `img` / `code` の表示差し替え |

`renderNode(node: MdNode, options?: MarkdownRenderOptions)` は標準 mdast を直接描画する入口。
通常は `CreoMarkdown` を使う。`MdNode` は `mdast.Nodes`、`MarkdownRoot` は `mdast.Root` の alias。

## 0.1 → 0.2 migration

- `<CreoMarkdown text={...} />`、CSS の import、既存の表示用 props は維持。
- Rust 由来の `Root` / `Heading` 等の AST は廃止。`onAst` と `renderNode` は
  標準 mdast の `root` / `heading` 等を使う。`children` や node 固有の型も mdast に従う。
- `:::tip` などの独自 admonition と `[[doc:...]]` / `[[memory:...]]` は解析しない。
  通常の引用 `> ...` とリンク `[label](url)` へ移行する。
- HTML の無条件表示は廃止。必要な箇所で `allowHtml` を指定する。
- Mermaid の「将来対応」placeholder は通常のコード表示に変更。
- `creo-views` の依存とビルド手順を削除してよい。md-view の新バージョンはこの PR では公開しない。

## Implementation and verification

[remark-parse](https://github.com/remarkjs/remark/tree/main/packages/remark-parse) と
[remark-gfm](https://github.com/remarkjs/remark-gfm) が構文解析、
[mdast-util-to-hast](https://github.com/syntax-tree/mdast-util-to-hast) が HTML 構造への変換、
[hast-util-sanitize](https://github.com/syntax-tree/hast-util-sanitize) がサニタイズを担当する。
creo-ui は Solid の表示とトークンを担当する。

`bun run test:components` が表示契約を、root で build 後の `bun run test:packages` が
配布 tarball の導入・型・CSS・browser build・lockfile 再導入を検査する。
