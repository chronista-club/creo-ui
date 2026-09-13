# 02. 単独導入と Markdown の表示専用化

> **Status**: Draft
> **Related**: `mem_1Cf1aYkR2EcfhbdmQxpVSx`（R02）

## 決定

2026-09-14: ユーザーは独自 Rust / WASM parser を育てる方向を採らず、既存 parser を
内蔵した Markdown の表示専用コンポーネントとして整える方針を承認した。
creo-views の独立公開・同梱・機能隔離は行わない。

`md-view` は remark-parse / remark-gfm / remark-frontmatter を使う。
標準 mdast を mdast-util-to-hast で HTML の木に変換し、hast-util-sanitize を通してから
Solid の要素として描画する。HTML を許可した場合だけ hast-util-raw で HTML を解析する。
独自 Markdown 構文・AST の変換層は作らない。

`text` だけで表示でき、consumer は `components.a` / `img` / `code` で表示を差し替えられる。
HTML の既定は文字表示。`allowHtml` はサニタイズを省略する設定ではない。
ID と文書内参照はビュー単位に分離する。Markdown の書き手は custom component のコードを指定できない。

## 互換性

md-view は 0.2.0 とする。`text` / `class` / `loading` / `fallback` / CSS import は維持。
`onAst` と `renderNode` は Rust 由来の PascalCase AST から標準 mdast へ移行する。
独自 WikiLink / admonition は通常のリンク・引用へ移行。Mermaid は通常のコード表示と
consumer の code renderer で扱う。詳細は [md-view README](../../packages/md-view/README.md)。

この PR は npm 公開やサイトの deploy を実行しない。旧 creo-views repo も変更しない。

## 配布検査

```sh
bun install --frozen-lockfile
bun run build
bun run build:packages
bun run test:packages
```

`scripts/check-package-install.mjs` は公開対象の各 package を `npm pack --ignore-scripts` し、
tarball 内の全 exports のファイル存在を調べる。ビルド不足を pack 時の自動生成で隠さない。
新しい一時ディレクトリでその tarball を npm install し、公開 JS / 型 / CSS を import する
最小 app を typecheck / Vite build する。Markdown の CSS が参照するトークンの実在も検査する。repo の source alias や sibling は使わない。
次に同じ package-lock.json を別の空ディレクトリに渡して npm ci / typecheck / build し、
lockfile が変化していないことを検査する。成功・失敗時とも一時ディレクトリをログに残す。

root の Bun lockfile は CI の frozen install で検査する。consumer の npm lockfile は
tarball の整合性と再導入を検査するもので、将来の全ての依存更新を固定するものではない。
公開済み npm バージョンの検査、実ブラウザの視覚・アクセシビリティ検査とは区別する。

## 開発と CI

全 workflow から sibling checkout と Markdown 用の Rust / wasm-pack 準備を削除する。
Rust token package の CI は別の責務として維持する。site の md-view 型スタブは削除し、
他の workspace package と同様に実際の source で型を検査する。
site の紹介と migration guide も現行 API に揃える。

## 検証の経緯

- 変更前の tarball consumer は `creo-views/md` 不在で型検査に失敗。
- 標準 mdast の描画 fixture は既存 renderer で見出しが出ず失敗。
- 2 つの viewer の脚注は ID が重複し失敗。ビューごとの ID と参照の分離で修正。
- 実ブラウザの確認で古い typography / spacing token による見出し・余白の欠落を検出。配布 CSS の token 参照検査を追加して修正。
- 表示契約・安全な HTML の扱い・custom renderer・配布検査を PR CI に含める。

## 後続

R04 の HTML / URL 方針、R18 の renderer 拡張の一部をこの移行で先行して実装する。
両 TODO は全受け入れ条件を別途照合してから閉じる。任意 schema / arbitrary parser plugin の
公開 API は、具体的な consumer 要件が出るまで追加しない。
