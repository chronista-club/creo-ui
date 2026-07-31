# creo-ui

> Creo エコシステムのためのデザインシステムです。単一の W3C Design Tokens (DTCG) から、Web / Apple / Rust を横断するビジュアルアイデンティティを配布します。

**Creo ID** がテナントのアイデンティティ（「誰の空間か」）を表すのに対して、**creo-ui** はビジュアルアイデンティティ（「どう見えるか」）を担います。両者は対をなす関係です。

## ステータス

**Phase 2a (Editor Mode runtime) Shipped + design system stabilized**

- 2026-05-06: **v0.15.0 (web) / v0.5.0 (editor-host) / v0.1.1 (frame) / v0.4.0 (rust/swift) ship**。 7 round / 25 件 review fix で a11y reduced-motion 14 全 component 完全対応 + 5 新 token (scrim split / layout container / layout grid / typography icon)。
- 2026-04-26: Mode-based typography family token 6 種追加 ([`v0.14.0`](./CHANGELOG.md#v0140-2026-04-26--mode-based-typography-family))。
- 2026-04-21: Web パッケージを npmjs.com へ初回 publish ([`creo-ui@0.0.1`](https://www.npmjs.com/package/creo-ui))。

### 次フェーズ — 2 axis hybrid governance

デザインシステムは、内部のドッグフーディングと複数ラウンドのレビューを経て安定化しました。以降は **2 軸ハイブリッド** で進化していきます:

- **Concept / Architecture / Foundation 駆動 (creo-ui 側で先回り)**: Frame system protocol / Editor Mode 4 region / 8 theme palette / 5 tier convention / OKLCH adoption / DTCG SSOT 設計 など、 コンシューマーが「現状の語彙で要求を言語化できない」領域は、 **creo-ui 側で先に言語化する** 責務を担います。
- **Surface / API ergonomics / friction 駆動 (consumer feedback driven)**: 外部コンシューマー (creo-memories / fleetstage / vantage-point 等) で実導入する中で出てくる API friction / 新しい token need / migration のハマり / a11y bug などは、コンシューマーの観察から逆算します。 報告チャネルは [`docs/contributing.md`](./docs/contributing.md) を参照してください。

「concept か surface か」は PR ごとにケースバイケースで判断します。固定的なルールよりも柔軟性を優先します。

Ecosystem split (Phase 2b/c/d、 Rust/Swift repo 切り出し) は **TS 安定化を優先して後回し** にしています (Phase 2 Deferred)。

## 対応 Platform

**Support Tier** = 約束の強さの段階 (品質の格ではない)。**Tier 1** は新機能の起点、**Tier 2** は正式サポートだが追従は実消費者駆動 — 保証の詳細・昇格条件・新規参入の入口は [docs/design/support-tiers.md](./docs/design/support-tiers.md) を参照。

| Platform | Tier | Package | 配布先 | 出力 |
|----------|------|---------|--------|------|
| Web (SolidJS) | 1 | `@chronista-club/creo-ui` | [npmjs.com](https://www.npmjs.com/package/@chronista-club/creo-ui) | CSS custom properties + JS 定数 + SolidJS shells/controls |
| Apple (iOS 17+ / macOS 14+ / watchOS 10+ / tvOS 17+) | 1 | `CreoUI` | SPM (GitHub repo 直接参照) | SwiftUI Color / CreoTheme / .creoText() / CGFloat extensions |
| Rust | 1 | `creo-ui` | [crates.io](https://crates.io/crates/creo-ui) | `pub const` 定義 (Rgb 構造体 / f32 / &str) |
| Svelte | 2 | `@chronista-club/creo-ui-svelte` (予定) | 未リリース — 現状は CSS 層 (`tokens.css` / `components.css`) をそのまま利用 | 薄い wrapper (props → class / data 属性)。実消費者駆動で抽出 (初回候補: fleetstage の Podman Desktop 拡張) |

## Consumer 向け: 使い方

### Web (creo-memories, vantage-point 等)

```bash
bun add @chronista-club/creo-ui
```

```ts
import '@chronista-club/creo-ui/tokens.css'
// .my-button { background: var(--color-brand-primary); padding: var(--spacing-m); }

// または JS 定数として
import { ColorThemesMintDarkBrandPrimary, SpacingM } from '@chronista-club/creo-ui/tokens.js'
```

詳細は [`packages/web/README.md`](./packages/web/README.md) を参照してください。

### Apple (SwiftUI)

```swift
dependencies: [
    .package(url: "https://github.com/chronista-club/creo-ui.git", from: "0.0.1"),
]

// target dependencies に .product(name: "CreoUI", package: "creo-ui")
```

```swift
import CreoUI
Text("Creo").foregroundColor(.colorBrandPrimary).padding(CreoUITokens.spacingMd)
```

詳細は [`packages/swift/README.md`](./packages/swift/README.md) を参照してください。

### Rust

```toml
[dependencies]
creo-ui = { git = "https://github.com/chronista-club/creo-ui.git" }
```

```rust
use creo-ui::tokens;
let brand = tokens::COLOR_BRAND_PRIMARY; // Rgb { r: 115, g: 231, b: 170 }
```

詳細は [`packages/rust/README.md`](./packages/rust/README.md) を参照してください。

## Consumer (想定)

- [Creo Memories](https://github.com/chronista-club/creo-memories) - Web + (将来) Apple クライアント
- [Vantage Point](https://github.com/chronista-club/vantage-point) - Web + Rust
- Creo Portal (予定) - Web
- Fleetstage (予定) - Web

## アーキテクチャ

```
tokens/**/*.json  (W3C DTCG SSOT)
       │
       ▼
Style Dictionary
  ├─ transforms/config.web.js   ──► packages/web/dist/tokens.css (+ tokens.js / .d.ts)
  ├─ transforms/config.swift.js ──► packages/swift/Sources/CreoUI/Generated/Tokens.swift
  └─ transforms/config.rust.js  ──► packages/rust/src/generated/tokens.rs
```

Token の SSOT は `tokens/` 配下の DTCG JSON のみです。各プラットフォームの出力は build 成果物として生成されます。

## 開発

```bash
bun install        # 依存関係のインストール
bun run build      # 全 platform 向けに token を transform
bun run typecheck  # TS 型チェック
bun run lint       # Biome lint
```

Swift / Rust の build は各 package 側で:

```bash
# Rust
cd packages/rust && cargo build && cargo test

# Swift
cd packages/swift && swift build && swift test
```

## creo-ui の 3 本柱

1. **視覚的定数の SSOT** — `tokens/**/*.json` (DTCG) → Style Dictionary → 3 platform 配布
2. **Editor Mode protocol** — 任意 app にユニバーサルな "Editor Mode" を規定 (schema owner)。詳細は [docs/design/editor-mode.md](./docs/design/editor-mode.md)
3. **Web reference runtime (`@chronista-club/creo-ui-editor-host`)** — Editor Mode protocol の SolidJS 実装を `packages/editor-host/` に同梱 (EH-1、 Phase 2a Shipped)。コンシューマーは `<EditorHostProvider>` + `<EditorLayer>` + `useEditorFields()` ですぐに利用できます

Editor Mode は instance ではなく **mode** (universal state) です。4 方向の semantic layout (TOP global / LEFT source / RIGHT tool / BOTTOM utility) + Content 非侵襲性 + AI agent access を protocol で規定します。 **Web は本 repo の `packages/editor-host/` で reference 実装済み**で、 Swift / Rust の runtime 実装はコンシューマー側 (`CreoUI`, `creo-ui` crate) で担います (Phase 3b 以降の予定)。

## Theme system (0.1.0+)

4 family × light/dark = **8 theme** を内蔵しています。`:root` default は **Mint Dark** です:

| family | light | dark (★=default) | brand |
|---|---|---|---|
| Creo | `mint-light` | **`mint-dark`** ★ | mint green |
| 空 (Sora) | `sora-light` | `sora-dark` | sky blue |
| Contrast / Paradox | `contrast-light` | `contrast-dark` | purple × pink × cyan |
| Old School | `oldschool-light` | `oldschool-dark` | teal × orange |

切替は `[data-theme="{id}"]` で行います。fleetstage 後方互換として `.dark` / `[data-theme="dark"]` = mint-dark、`[data-theme="light"]` = mint-light。system preference が light で `[data-theme]` 未指定の場合は mint-light に逆転します。

token 値は **OKLCH** で保持し (`oklch(l c h / a)`)、modern browser が直接解釈します。Swift/Rust は Mint Dark のみ hex/Rgb に変換して emit します。

## Phase Roadmap

| Phase | 内容 | Status |
|-------|------|--------|
| 0 | Repo scaffold + CI skeleton | ✅ 完了 |
| 1 | Token MVP + Web/SwiftUI/Rust 出力 + Editor Mode protocol schema + editor-mode tokens + **8-theme matrix** (0.1.0) | **進行中** |
| 2 | `creo-ui` に `EditorHost` runtime 実装 + MCP AI agent 連携 + DevEditor migration + Swift/Rust の multi-theme | Planned |
| 3 | Figma sync (tokens.studio 連携) + theme authoring pipeline | Planned |

## Ecosystem split (Phase 2 architectural pivot)

`chronista-club/creo-ui-design` を別 repo として切り出し、design SSOT (tokens + Style Dictionary configs + design memo) を独立化する方針転換を進めています。 言語別実装 (`creo-ui` (TS) / `creo-ui-swift` / `creo-ui-rs`) は **trace consumer** として release artifact を取り込む構造になります。 Material Design 3 / Fluent 2 / Carbon Design などの multi-platform デザインシステムの業界標準パターンと一致します。

| Phase | scope | Status |
|---|---|---|
| **Phase 1** | `creo-ui-design` 独立 repo + build pipeline + GitHub Releases artifact 配布 | ✅ verified ([v0.0.1](https://github.com/chronista-club/creo-ui-design/releases/tag/v0.0.1)) |
| **Phase 2a** | `creo-ui` で `creo-ui-design` release を consume する PoC + drift 検証 | ✅ verified (本 PR) |
| Phase 2b | `creo-ui-rs` 切り出し (`packages/rust` を git filter-repo) | **Deferred** (TS 安定化優先、 consumer feedback loop 後) |
| Phase 2c | `creo-ui-swift` 切り出し (`packages/swift` を git filter-repo) | **Deferred** (同上) |
| Phase 2d | `creo-ui` を TS-only に slim down (Swift/Rust + tokens/ + transforms 削除) | **Deferred** (2b/2c 完了後) |

### Phase 2a script — creo-ui-design release artifact の consume

```sh
bun run fetch:design                        # creo-ui-design v0.x.x の latest を取得
bun run fetch:design v0.0.1                 # 特定 tag を指定
CREO_UI_DESIGN_TAG=v0.0.1 bun run fetch:design  # env 経由

# `dist-creo-ui-design/{web,swift,rust,_source}/` に artifact + manifest.json
bun run build         # local Style Dictionary build
bun run diff:design   # local build vs release artifact の byte-level diff
```

**Phase 2a verified (2026-05-06)**: creo-ui の local Style Dictionary build と `creo-ui-design v0.0.1` release artifact が **5/5 file すべて byte-level 一致** しました (tokens.css / tokens.js / tokens.d.ts / Tokens.swift / tokens.rs)。 design SSOT split はコンシューマー視点で **drift 0** で、 Phase 2b-d (impl repo 切り出し) の前提条件が confirmed です。

## License

Apache-2.0 — [LICENSE](./LICENSE) を参照してください。
