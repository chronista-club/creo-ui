# creoui

> Creo ecosystem のための Design System。単一の W3C Design Tokens (DTCG) から Web / Apple / Rust を横断する Visual Identity を配布する。

**Creo ID** が tenant identity (「誰の空間か」) を表すのに対し、**creoui** は Visual Identity (「どう見えるか」) を担う。両者は対の関係。

## ステータス

**Phase 2a (Editor Mode runtime) Shipped + design system stabilized**

- 2026-05-06: **v0.15.0 (web) / v0.5.0 (editor-host) / v0.1.1 (frame) / v0.4.0 (rust/swift) ship**。 7 round / 25 件 review fix で a11y reduced-motion 14 全 component 完全対応 + 5 新 token (scrim split / layout container / layout grid / typography icon)。
- 2026-04-26: Mode-based typography family token 6 種追加 ([`v0.14.0`](./CHANGELOG.md#v0140-2026-04-26--mode-based-typography-family))。
- 2026-04-21: Web パッケージを npmjs.com へ初回 publish ([`creoui@0.0.1`](https://www.npmjs.com/package/creoui))。

Linear Epic: [CREO-84 creoui Design System](https://linear.app/chronista/issue/CREO-84) — Phase ごとの子 Issue が紐付く。

### 次フェーズ — 2 axis hybrid governance

design system は内部 dogfood + multi-round review で stabilize 完了。 以降は **2 axis hybrid** で進化:

- **Concept / Architecture / Foundation 駆動 (creoui 側 proactive)**: Frame system protocol / Editor Mode 4 region / 8 theme palette / 5 tier convention / OKLCH adoption / DTCG SSOT 設計 等、 consumer が「現状の語彙で要求を articulate できない」 領域は **creoui 側で先に articulate** する責務。
- **Surface / API ergonomics / friction 駆動 (consumer feedback driven)**: 外部 consumer (creo-memories / fleetstage / vantage-point 等) で実導入する中で出てくる API friction / 新 token need / migration ハマり / a11y bug 等は consumer 観察から逆算。 報告 channel は [`docs/contributing.md`](./docs/contributing.md) 参照。

「concept か surface か」 は PR ごとに case-by-case 判断、 固定 rule よりも柔軟性優先。

Ecosystem split (Phase 2b/c/d、 Rust/Swift repo 切り出し) は **TS 安定化優先で後回し** (Phase 2 Deferred)。

## 対応 Platform

| Platform | Package | 配布先 | 出力 |
|----------|---------|--------|------|
| Web | `creoui` | [npmjs.com](https://www.npmjs.com/package/creoui) | CSS custom properties + JS 定数 |
| Apple (iOS 17+ / macOS 14+ / watchOS 10+ / tvOS 17+) | `Creoui` | SPM (GitHub repo 直接参照) | SwiftUI Color / CGFloat extensions |
| Rust | `creoui` | (Phase 2 で crates.io 予定、現状は git/path 参照) | `pub const` 定義 (Rgb 構造体 / f32 / &str) |

## Consumer 向け: 使い方

### Web (creo-memories, vantage-point 等)

```bash
bun add creoui
```

```ts
import 'creoui/tokens.css'
// .my-button { background: var(--color-brand-primary); padding: var(--spacing-md); }

// または JS 定数として
import { ColorBrandPrimary, SpacingMd } from 'creoui/tokens.js'
```

詳細は [`packages/web/README.md`](./packages/web/README.md)。

### Apple (SwiftUI)

```swift
dependencies: [
    .package(url: "https://github.com/chronista-club/creoui.git", from: "0.0.1"),
]

// target dependencies に .product(name: "Creoui", package: "creoui")
```

```swift
import Creoui
Text("Creo").foregroundColor(.colorBrandPrimary).padding(CreouiTokens.spacingMd)
```

詳細は [`packages/swift/README.md`](./packages/swift/README.md)。

### Rust

```toml
[dependencies]
creoui = { git = "https://github.com/chronista-club/creoui.git" }
```

```rust
use creoui::tokens;
let brand = tokens::COLOR_BRAND_PRIMARY; // Rgb { r: 115, g: 231, b: 170 }
```

詳細は [`packages/rust/README.md`](./packages/rust/README.md)。

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
  ├─ transforms/config.swift.js ──► packages/swift/Sources/Creoui/Generated/Tokens.swift
  └─ transforms/config.rust.js  ──► packages/rust/src/generated/tokens.rs
```

Token の SSOT は `tokens/` 配下の DTCG JSON のみ。各 platform の出力は build 成果物として生成する。

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

## creoui の 3 本柱

1. **視覚的定数の SSOT** — `tokens/**/*.json` (DTCG) → Style Dictionary → 3 platform 配布
2. **Editor Mode protocol** — 任意 app にユニバーサルな "Editor Mode" を規定 (schema owner)。詳細は [docs/design/editor-mode.md](./docs/design/editor-mode.md)
3. **Web reference runtime (`creoui-editor-host`)** — Editor Mode protocol の SolidJS 実装を `packages/editor-host/` に同梱 (EH-1、 Phase 2a Shipped)。consumer は `<EditorHostProvider>` + `<EditorLayer>` + `useEditorFields()` で即利用可能

Editor Mode は instance ではなく **mode** (universal state)。4 方向 semantic layout (TOP global / LEFT source / RIGHT tool / BOTTOM utility) + Content 非侵襲性 + AI agent access を protocol で規定。 **Web は本 repo の `packages/editor-host/` で reference 実装済**、 Swift / Rust の runtime 実装は consumer 側 (`Creoui`, `creoui` crate) で担う (Phase 3b 以降の予定)。

## Theme system (0.1.0+)

4 family × light/dark = **8 theme** を内蔵。`:root` default は **Mint Dark**:

| family | light | dark (★=default) | brand |
|---|---|---|---|
| Creo | `mint-light` | **`mint-dark`** ★ | mint green |
| 空 (Sora) | `sora-light` | `sora-dark` | sky blue |
| Contrast / Paradox | `contrast-light` | `contrast-dark` | purple × pink × cyan |
| Old School | `oldschool-light` | `oldschool-dark` | teal × orange |

切替は `[data-theme="{id}"]`。fleetstage 後方互換として `.dark` / `[data-theme="dark"]` = mint-dark、`[data-theme="light"]` = mint-light。system preference が light で `[data-theme]` 未指定なら mint-light に逆転。

token 値は **OKLCH** で保持 (`oklch(l c h / a)`)、modern browser が直接解釈。Swift/Rust は Mint Dark のみ hex/Rgb に変換して emit。

## Phase Roadmap

| Phase | 内容 | Status |
|-------|------|--------|
| 0 | Repo scaffold + CI skeleton | ✅ 完了 (CREO-85) |
| 1 | Token MVP + Web/SwiftUI/Rust 出力 + Editor Mode protocol schema + editor-mode tokens + **8-theme matrix** (0.1.0) | **進行中** (CREO-86) |
| 2 | `creoui` に `EditorHost` runtime 実装 + MCP AI agent 連携 + DevEditor migration + Swift/Rust の multi-theme | Planned |
| 3 | Figma sync (tokens.studio 連携) + theme authoring pipeline | Planned |

詳細は [Epic CREO-84](https://linear.app/chronista/issue/CREO-84) を参照。

## Ecosystem split (Phase 2 architectural pivot)

`chronista-club/creoui-design` を別 repo として切り出し、 design SSOT (tokens + Style Dictionary configs + design memo) を独立化する pivot を進行中。 言語別実装 (`creoui` (TS) / `creoui-swift` / `creoui-rs`) は **trace consumer** として release artifact を取り込む構造に。 Material Design 3 / Fluent 2 / Carbon Design 等の multi-platform design system 業界標準 pattern と一致。

| Phase | scope | Status |
|---|---|---|
| **Phase 1** | `creoui-design` 独立 repo + build pipeline + GitHub Releases artifact 配布 | ✅ verified ([v0.0.1](https://github.com/chronista-club/creoui-design/releases/tag/v0.0.1)) |
| **Phase 2a** | `creoui` で `creoui-design` release を consume する PoC + drift 検証 | ✅ verified (本 PR) |
| Phase 2b | `creoui-rs` 切り出し (`packages/rust` を git filter-repo) | **Deferred** (TS 安定化優先、 consumer feedback loop 後) |
| Phase 2c | `creoui-swift` 切り出し (`packages/swift` を git filter-repo) | **Deferred** (同上) |
| Phase 2d | `creoui` を TS-only に slim down (Swift/Rust + tokens/ + transforms 削除) | **Deferred** (2b/2c 完了後) |

### Phase 2a script — creoui-design release artifact の consume

```sh
bun run fetch:design                        # creoui-design v0.x.x の latest を取得
bun run fetch:design v0.0.1                 # 特定 tag を指定
CREO_UI_DESIGN_TAG=v0.0.1 bun run fetch:design  # env 経由

# `dist-creoui-design/{web,swift,rust,_source}/` に artifact + manifest.json
bun run build         # local Style Dictionary build
bun run diff:design   # local build vs release artifact の byte-level diff
```

**Phase 2a verified (2026-05-06)**: creoui の local Style Dictionary build と `creoui-design v0.0.1` release artifact が **5/5 file 全て byte-level 一致** (tokens.css / tokens.js / tokens.d.ts / Tokens.swift / tokens.rs)。 design SSOT split は consumer 視点で **drift 0**、 Phase 2b-d (impl repo 切り出し) の前提条件 confirmed。

## License

Apache-2.0 — [LICENSE](./LICENSE) を参照。
