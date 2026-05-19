# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクトの本質

**creoui は Creo ecosystem の Design System。** 責務は **3 本柱**:

1. **視覚的定数の SSOT** — `tokens/**/*.json` (W3C DTCG) から Web / Apple / Rust の 3 プラットフォーム向け成果物を **Style Dictionary v4 で生成**
2. **Editor Mode protocol の schema owner** — 各 app にユニバーサルな "Editor Mode" UI 状態を規定。field 宣言 / 4 方向 semantic layout (TOP global / LEFT source / RIGHT tool / BOTTOM utility) / Content 非侵襲性 / AI agent access を **schema + TS 型として定義** ([docs/design/editor-mode.md](./docs/design/editor-mode.md))
3. **Web reference runtime (`@chronista-club/creoui-editor-host`)** — Editor Mode protocol の SolidJS 実装を `packages/editor-host/` に持つ (EH-1)。consumer は `<EditorHostProvider>` + `<EditorLayer>` + `useEditorFields()` で即利用可能。Swift / Rust は引き続き consumer 側 (Phase 2c)

設計詳細は [docs/design/editor-mode.md](./docs/design/editor-mode.md) および [docs/design/theme-system.md](./docs/design/theme-system.md)。

### Theme system (0.1.0+)

4 family × light/dark = 8 theme を同梱 (creo-memories preset 由来):

| family | light id | dark id | brand hue |
|---|---|---|---|
| Creo (mint) | `mint-light` | **`mint-dark`** ★ default | 160 |
| 空 (Sora) | `sora-light` | `sora-dark` | 230 |
| Contrast / Paradox | `contrast-light` | `contrast-dark` | 270 (+335, +195) |
| Old School | `oldschool-light` | `oldschool-dark` | 145 + 55 |

★ = `:root` default。切替は `[data-theme="{id}"]`、fleetstage 互換 alias として `.dark` / `[data-theme="dark"]` = mint-dark、`[data-theme="light"]` = mint-light。system preference light で `:root:not([data-theme])` は mint-light に逆転。

token 値は **OKLCH** で保持 (`oklch(l c h [/ a])`)、Web は literal で emit し modern browser が解釈。Swift/Rust は build 時に hex / Rgb に変換 (Mint Dark のみ)。

Linear Epic: [CREO-84](https://linear.app/chronista/issue/CREO-84) / Phase は README.md に記載。

## コマンド

パッケージマネージャは **Bun**（npm / pnpm / yarn ではない）。

```bash
bun install            # 依存関係のインストール
bun run build          # 全 platform の token を再生成 (web + swift + rust)
bun run build:web      # Web だけ
bun run build:swift    # Swift だけ
bun run build:rust     # Rust だけ
bun run typecheck      # tsc --noEmit (root + editor-host + web など全パッケージ)
bun run lint           # Biome check
bun run format         # Biome check --write (自動修正)
bun run dev            # apps/site (creoui 公式 site = live showcase + docs) を vite で起動
bun run gen:themes     # creo-memories preset から 8 theme JSON を再生成
bun run test:colors    # transforms/color-utils.js のテストを実行 (50 cases)
bun test packages/editor-host/src/host.test.ts  # editor-host core state のテスト (19 cases)

# demo stage (local Mac で apps/site を podman 配信)
bun run site:build     # build:web + build:packages + apps/site を順にビルド → apps/site/dist
bun run site:up        # site:build → image build → 起動 (http://localhost:8080)
bun run site:down      # 停止・削除

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
       ├─► packages/swift/Sources/Creoui/Generated/Tokens.swift  (git commit 対象)
       └─► packages/rust/src/generated/tokens.rs        (git commit 対象)
```

### 3 層構造

1. **tokens/** — DTCG JSON。category (color / spacing / typography / radius / shadow) ごとにファイル分割。`$value` / `$type` / `$description` を持つ 3 階層までの dot-notation (例: `color.brand.primary`)。
2. **transforms/** — Style Dictionary config。Web は標準 transformGroup を使うが、**Swift と Rust は custom format を hand-roll**（`swift/creoui`, `rust/creoui`）。標準の iOS transform は UIKit 指向で SwiftUI 用ではないのが理由。
3. **packages/*** — Bun workspace (`packages/*`)。各 platform の consumer 向け entry point。

### generated ファイルの commit ポリシー（非対称に注意）

`.gitignore` で明示されている通り:

- **Swift/Rust の generated はコミット対象**。`cargo build` や `swift build` はこれらがある前提で動くので、`bun run build` を走らせていない環境 (GitHub Actions の rust/swift job もここには含まれる) でも即ビルド可能である必要がある。
- **Web の dist/ は gitignore**。npm publish workflow でのみ生成され、npmjs.com の `creoui` (unscoped) として配布される。

**したがって `tokens/` を編集した PR は、Swift/Rust の generated も一緒に commit する必要がある。** `bun run build` を忘れると Swift/Rust の出力が古いまま取り残される。

### custom format のフォーマット仕様

| Platform | 命名 | Color | Dimension | FontWeight/Number | その他 |
|----------|------|-------|-----------|-------------------|--------|
| Swift | camelCase (`colorBrandPrimary`) | `Color(red: ...)` in `extension Color` | `CGFloat` in `enum CreouiTokens` | `Double` in `CreouiTokens` | `String` in `CreouiTokens` |
| Rust | SCREAMING_SNAKE (`COLOR_BRAND_PRIMARY`) | `Rgb { r, g, b }` (u8 構造体) | `f32` (px) | `f32` | `&'static str` |

- Rust の generated は `include!()` で `src/lib.rs` の `pub mod tokens` に取り込まれる設計 (`CREO-86` で確立)。したがって custom format には inner attribute (`#![...]`) や inner doc (`//!`) を入れてはいけない — `include!` 先はモジュールの途中なので parse error になる。この制約は `transforms/config.rust.js` のコメントにも明記されている。
- Rust ident は先頭が数字だと invalid なので `sanitizeIdent` で `_` prefix。Swift も同様。
- Style Dictionary の token 衝突警告を抑えるために、`transforms: ['name/camel']` (Swift) / `['name/constant']` (Rust) を当てて `token.name` がユニークになるようにしている（実際の ident は path ベースで上書き生成するが、内部警告回避のため）。

## Token 追加・変更フロー

1. **`tokens/<category>/<file>.json` を編集**（SSOT）。DTCG 準拠を維持、3 階層まで。
2. `bun run build` で全 platform 出力を再生成。
3. `bun run typecheck && bun run lint` を通す。
4. **`packages/swift/Sources/Creoui/Generated/Tokens.swift` と `packages/rust/src/generated/tokens.rs` の diff を必ず commit**（忘れると consumer の build が stale token を使う）。
5. Web dist は commit しない（gitignore）。

### Theme (8 preset) の再生成

creo-memories 側 preset を更新したら:

```bash
bun run gen:themes   # → tokens/color/themes/*.json 8 ファイルを上書き
bun run build        # 全 platform に反映
```

`scripts/generate-themes.mjs` が creo-memories の `packages/creoui/src/palette/presets/*.ts` を直接 import し、OKLCH object を DTCG JSON に変換する。path 形式は `color.themes.{theme-id}.{brand,semantic,surface,text,shadow,gradient}.*` で、Web custom format が themes segment を除いて `--color-{...}` variable 名を emit する (旧 0.0.4 までの var 名と互換)。

## 設定と規約

- **TypeScript**: strict mode、`moduleResolution: bundler`、`noEmit: true` (`tsc --noEmit` での型チェック専用)。`include` は `packages/*/src/**/*.ts` と `transforms/**/*.js`。
- **Biome 1.9**: single quote、no semicolons (as-needed)、trailing commas all、indent 2 space、line width 100。`*.md` は無視。
- **Rust**: edition `2024`、`rust-version = "1.95"`（mise の `[tools].rust = "1.95.0"` と一致）、`#![forbid(unsafe_code)]`。
- **Swift**: multi-platform (iOS 17+ / macOS 14+ / watchOS 10+ / tvOS 17+)、tools-version 5.9。UIKit ではなく SwiftUI `Color` を使う（cross-platform のため）。
- **コミット/PR の言語**: 日本語。ブランチは Linear 生成の `mako/{team-key}-XX-...`。Issue 管理は Linear (GitHub Issues は無効化済)。

## CI (`.github/workflows/ci.yml`)

3 ジョブが並走:

- **build** (ubuntu): `bun install → typecheck → lint → build` (全 platform token 再生成)。Phase 0 時点では generated diff チェックはスキップ。
- **rust** (ubuntu): `cargo build && cargo test` を `packages/rust` で。Rust 1.95 (ci.yml の toolchain も Cargo.toml も 1.95 で揃える、 mise の `[tools].rust` と SSOT)。
- **swift** (macos-14): `swift build && swift test` を `packages/swift` で。

`publish-web.yml` は `web-v*` tag push で npmjs.com へ `creoui` を publish (要 `NPM_TOKEN` secret)。root で `bun run build:web` を実行してから `packages/web/` で `npm publish` する 2 段構え（path が root 相対のため）。

## やってはいけない

- 生成物 (`packages/web/dist/`, `packages/swift/Sources/Creoui/Generated/`, `packages/rust/src/generated/`) を手編集する。編集すべきは `tokens/` のみ。
- `tokens/` の変更だけコミットして generated の更新を忘れる (Swift/Rust が古い値のまま残る)。
- `style-dictionary build` を `packages/*/` の CWD で実行する (path が root 相対なので壊れる)。
- `rust-version` と mise の Rust バージョンをズラす (CLAUDE.md の global 方針)。
- Rust generated に inner attribute / inner doc を足す (`include!` 先では構文エラー)。
- Editor Mode を **instance 名** (Studio / DevEditor / etc) で呼ぶ。Editor は **universal mode**、instance 化しない (`docs/design/editor-mode.md` D-1)。
- Content Layer を Editor Mode が **押し退ける / layout 変える** 設計にする。非侵襲性 (D-6) は最上位原則。
- Swift / Rust / 他 framework (React 等) の **runtime 実装を本リポジトリに書く**。Web runtime は `packages/editor-host` に限り reference 実装として保持 (EH-1 / EH-2)、他 platform は consumer 側または将来別 package で。
- `packages/editor-host/` を **SolidJS 以外の framework 対応で抽象化する**。SolidJS 一本で進める方針 (EH-2)。物理分離を急がない。
- `creo-memories/packages/creoui` の DevEditor を直接触る。参考に留め、 **migration は creo-memories lead の判断** (EH-4)。
- 専用 MCP server (`editor-host-mcp`) を実装する。**claude-in-chrome + `window.creoEditor` で代替可能** (EH-5)。Phase 2b は recipes / AI pair design docs に scope 縮小。
- Console REPL (`window.creoEditor`) を production で無条件に expose する。**dev 自動 expose / production は config で opt-out** (`exposeConsole: false`) が規定 (EH-6)。
