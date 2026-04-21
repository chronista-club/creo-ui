# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクトの本質

**Creo UI は Creo ecosystem の Design System。** 単一の W3C DTCG トークン (`tokens/**/*.json`) から、Web / Apple / Rust の 3 プラットフォーム向け成果物を **Style Dictionary v4 で生成** するリポジトリ。ロジックや UI コンポーネントは持たず、**「視覚的定数の配布」だけが責務**。

Linear Epic: [CREO-84](https://linear.app/chronista/issue/CREO-84) / Phase は README.md に記載。

## コマンド

パッケージマネージャは **Bun**（npm / pnpm / yarn ではない）。

```bash
bun install            # 依存関係のインストール
bun run build          # 全 platform の token を再生成 (web + swift + rust)
bun run build:web      # Web だけ
bun run build:swift    # Swift だけ
bun run build:rust     # Rust だけ
bun run typecheck      # tsc --noEmit
bun run lint           # Biome check
bun run format         # Biome check --write (自動修正)

# Rust (packages/rust で実行)
cargo build && cargo test

# Swift (packages/swift で実行)
swift build && swift test
```

**重要**: `style-dictionary` の config path (`tokens/**`, `packages/*/dist/`) はすべて **repo root 相対**。したがって `bun run build*` は **必ず repo root で実行する**。`packages/web/` 内の `bun run build` も `../../transforms/config.web.js` を使って root 相対を維持している（publish workflow もこの前提）。

## アーキテクチャ

```
tokens/**/*.json  (W3C DTCG SSOT — 唯一の真実)
       │
       ▼
Style Dictionary v4  +  transforms/config.{web,swift,rust}.js
       │
       ├─► packages/web/dist/tokens.{css,js,d.ts}       (gitignore, npm publish 成果物)
       ├─► packages/swift/Sources/CreoUI/Generated/Tokens.swift  (git commit 対象)
       └─► packages/rust/src/generated/tokens.rs        (git commit 対象)
```

### 3 層構造

1. **tokens/** — DTCG JSON。category (color / spacing / typography / radius / shadow) ごとにファイル分割。`$value` / `$type` / `$description` を持つ 3 階層までの dot-notation (例: `color.brand.primary`)。
2. **transforms/** — Style Dictionary config。Web は標準 transformGroup を使うが、**Swift と Rust は custom format を hand-roll**（`swift/creo-ui`, `rust/creo-ui`）。標準の iOS transform は UIKit 指向で SwiftUI 用ではないのが理由。
3. **packages/*** — Bun workspace (`packages/*`)。各 platform の consumer 向け entry point。

### generated ファイルの commit ポリシー（非対称に注意）

`.gitignore` で明示されている通り:

- **Swift/Rust の generated はコミット対象**。`cargo build` や `swift build` はこれらがある前提で動くので、`bun run build` を走らせていない環境 (GitHub Actions の rust/swift job もここには含まれる) でも即ビルド可能である必要がある。
- **Web の dist/ は gitignore**。npm publish workflow でのみ生成され、npmjs.com の `creo-ui-web` (unscoped) として配布される。

**したがって `tokens/` を編集した PR は、Swift/Rust の generated も一緒に commit する必要がある。** `bun run build` を忘れると Swift/Rust の出力が古いまま取り残される。

### custom format のフォーマット仕様

| Platform | 命名 | Color | Dimension | FontWeight/Number | その他 |
|----------|------|-------|-----------|-------------------|--------|
| Swift | camelCase (`colorBrandPrimary`) | `Color(red: ...)` in `extension Color` | `CGFloat` in `enum CreoUITokens` | `Double` in `CreoUITokens` | `String` in `CreoUITokens` |
| Rust | SCREAMING_SNAKE (`COLOR_BRAND_PRIMARY`) | `Rgb { r, g, b }` (u8 構造体) | `f32` (px) | `f32` | `&'static str` |

- Rust の generated は `include!()` で `src/lib.rs` の `pub mod tokens` に取り込まれる設計 (`CREO-86` で確立)。したがって custom format には inner attribute (`#![...]`) や inner doc (`//!`) を入れてはいけない — `include!` 先はモジュールの途中なので parse error になる。この制約は `transforms/config.rust.js` のコメントにも明記されている。
- Rust ident は先頭が数字だと invalid なので `sanitizeIdent` で `_` prefix。Swift も同様。
- Style Dictionary の token 衝突警告を抑えるために、`transforms: ['name/camel']` (Swift) / `['name/constant']` (Rust) を当てて `token.name` がユニークになるようにしている（実際の ident は path ベースで上書き生成するが、内部警告回避のため）。

## Token 追加・変更フロー

1. **`tokens/<category>/<file>.json` を編集**（SSOT）。DTCG 準拠を維持、3 階層まで、semantic は brand を直接参照せず alias レイヤを置く。
2. `bun run build` で全 platform 出力を再生成。
3. `bun run typecheck && bun run lint` を通す。
4. **`packages/swift/Sources/CreoUI/Generated/Tokens.swift` と `packages/rust/src/generated/tokens.rs` の diff を必ず commit**（忘れると consumer の build が stale token を使う）。
5. Web dist は commit しない（gitignore）。

## 設定と規約

- **TypeScript**: strict mode、`moduleResolution: bundler`、`noEmit: true` (`tsc --noEmit` での型チェック専用)。`include` は `packages/*/src/**/*.ts` と `transforms/**/*.js`。
- **Biome 1.9**: single quote、no semicolons (as-needed)、trailing commas all、indent 2 space、line width 100。`*.md` は無視。
- **Rust**: edition `2024`、`rust-version = "1.94"`（mise の `[tools].rust` と一致）、`#![forbid(unsafe_code)]`。
- **Swift**: multi-platform (iOS 17+ / macOS 14+ / watchOS 10+ / tvOS 17+)、tools-version 5.9。UIKit ではなく SwiftUI `Color` を使う（cross-platform のため）。
- **コミット/PR の言語**: 日本語。ブランチは Linear 生成の `mako/{team-key}-XX-...`。Issue 管理は Linear (GitHub Issues は無効化済)。

## CI (`.github/workflows/ci.yml`)

3 ジョブが並走:

- **build** (ubuntu): `bun install → typecheck → lint → build` (全 platform token 再生成)。Phase 0 時点では generated diff チェックはスキップ。
- **rust** (ubuntu): `cargo build && cargo test` を `packages/rust` で。Rust 1.94 (ci.yml の toolchain も Cargo.toml も 1.94 で揃える)。
- **swift** (macos-14): `swift build && swift test` を `packages/swift` で。

`publish-web.yml` は `web-v*` tag push で npmjs.com へ `creo-ui-web` を publish (要 `NPM_TOKEN` secret)。root で `bun run build:web` を実行してから `packages/web/` で `npm publish` する 2 段構え（path が root 相対のため）。

## やってはいけない

- 生成物 (`packages/web/dist/`, `packages/swift/Sources/CreoUI/Generated/`, `packages/rust/src/generated/`) を手編集する。編集すべきは `tokens/` のみ。
- `tokens/` の変更だけコミットして generated の更新を忘れる (Swift/Rust が古い値のまま残る)。
- `style-dictionary build` を `packages/*/` の CWD で実行する (path が root 相対なので壊れる)。
- `rust-version` と mise の Rust バージョンをズラす (CLAUDE.md の global 方針)。
- Rust generated に inner attribute / inner doc を足す (`include!` 先では構文エラー)。
