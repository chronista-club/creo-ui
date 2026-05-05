# Creo UI

> Creo ecosystem のための Design System。単一の W3C Design Tokens (DTCG) から Web / Apple / Rust を横断する Visual Identity を配布する。

**Creo ID** が tenant identity (「誰の空間か」) を表すのに対し、**Creo UI** は Visual Identity (「どう見えるか」) を担う。両者は対の関係。

## ステータス

**Phase 1 (Token MVP) — 進行中**

- 2026-04-21: Web パッケージを npmjs.com へ初回 publish ([`creo-ui-web@0.0.1`](https://www.npmjs.com/package/creo-ui-web))
- Phase 0 (Repo Scaffold + CI skeleton) 完了

Linear Epic: [CREO-84 Creo UI Design System](https://linear.app/chronista/issue/CREO-84) — Phase ごとの子 Issue が紐付く。

## 対応 Platform

| Platform | Package | 配布先 | 出力 |
|----------|---------|--------|------|
| Web | `creo-ui-web` | [npmjs.com](https://www.npmjs.com/package/creo-ui-web) | CSS custom properties + JS 定数 |
| Apple (iOS 17+ / macOS 14+ / watchOS 10+ / tvOS 17+) | `CreoUI` | SPM (GitHub repo 直接参照) | SwiftUI Color / CGFloat extensions |
| Rust | `creo-ui` | (Phase 2 で crates.io 予定、現状は git/path 参照) | `pub const` 定義 (Rgb 構造体 / f32 / &str) |

## Consumer 向け: 使い方

### Web (creo-memories, vantage-point 等)

```bash
bun add creo-ui-web
```

```ts
import 'creo-ui-web/tokens.css'
// .my-button { background: var(--color-brand-primary); padding: var(--spacing-md); }

// または JS 定数として
import { ColorBrandPrimary, SpacingMd } from 'creo-ui-web/tokens.js'
```

詳細は [`packages/web/README.md`](./packages/web/README.md)。

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

詳細は [`packages/swift/README.md`](./packages/swift/README.md)。

### Rust

```toml
[dependencies]
creo-ui = { git = "https://github.com/chronista-club/creo-ui.git" }
```

```rust
use creo_ui::tokens;
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
  ├─ transforms/config.swift.js ──► packages/swift/Sources/CreoUI/Generated/Tokens.swift
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

## Creo UI の 2 本柱

1. **視覚的定数の SSOT** — `tokens/**/*.json` (DTCG) → Style Dictionary → 3 platform 配布
2. **Editor Mode protocol** — 任意 app にユニバーサルな "Editor Mode" を規定 (schema owner)。詳細は [docs/design/editor-mode.md](./docs/design/editor-mode.md)

Editor Mode は instance ではなく **mode** (universal state)。4 方向 semantic layout (TOP global / LEFT source / RIGHT tool / BOTTOM utility) + Content 非侵襲性 + AI agent access を protocol で規定し、runtime 実装は consumer (`@creo/ui`, `CreoUI`, `creo-ui` crate) 側が担う。

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
| 2 | `@creo/ui` に `EditorHost` runtime 実装 + MCP AI agent 連携 + DevEditor migration + Swift/Rust の multi-theme | Planned |
| 3 | Figma sync (tokens.studio 連携) + theme authoring pipeline | Planned |

詳細は [Epic CREO-84](https://linear.app/chronista/issue/CREO-84) を参照。

## Ecosystem split (Phase 2 architectural pivot)

`chronista-club/creo-ui-design` を別 repo として切り出し、 design SSOT (tokens + Style Dictionary configs + design memo) を独立化する pivot を進行中。 言語別実装 (`creo-ui` (TS) / `creo-ui-swift` / `creo-ui-rs`) は **trace consumer** として release artifact を取り込む構造に。 Material Design 3 / Fluent 2 / Carbon Design 等の multi-platform design system 業界標準 pattern と一致。

| Phase | scope | Status |
|---|---|---|
| **Phase 1** | `creo-ui-design` 独立 repo + build pipeline + GitHub Releases artifact 配布 | ✅ verified ([v0.0.1](https://github.com/chronista-club/creo-ui-design/releases/tag/v0.0.1)) |
| **Phase 2a** | `creo-ui` で `creo-ui-design` release を consume する PoC + drift 検証 | ✅ verified (本 PR) |
| Phase 2b | `creo-ui-rs` 切り出し (`packages/rust` を git filter-repo) | Planned |
| Phase 2c | `creo-ui-swift` 切り出し (`packages/swift` を git filter-repo) | Planned |
| Phase 2d | `creo-ui` を TS-only に slim down (Swift/Rust + tokens/ + transforms 削除) | Planned (2b/2c 完了後) |

### Phase 2a script — creo-ui-design release artifact の consume

```sh
bun run fetch:design                        # creo-ui-design v0.x.x の latest を取得
bun run fetch:design v0.0.1                 # 特定 tag を指定
CREO_UI_DESIGN_TAG=v0.0.1 bun run fetch:design  # env 経由

# `dist-creo-ui-design/{web,swift,rust,_source}/` に artifact + manifest.json
bun run build         # local Style Dictionary build
bun run diff:design   # local build vs release artifact の byte-level diff
```

**Phase 2a verified (2026-05-06)**: creo-ui の local Style Dictionary build と `creo-ui-design v0.0.1` release artifact が **5/5 file 全て byte-level 一致** (tokens.css / tokens.js / tokens.d.ts / Tokens.swift / tokens.rs)。 design SSOT split は consumer 視点で **drift 0**、 Phase 2b-d (impl repo 切り出し) の前提条件 confirmed。

## License

Apache-2.0 — [LICENSE](./LICENSE) を参照。
