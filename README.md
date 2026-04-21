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

## Phase Roadmap

| Phase | 内容 | Status |
|-------|------|--------|
| 0 | Repo scaffold + CI skeleton | ✅ 完了 (CREO-85) |
| 1 | Token MVP (creo-memories から抽出) + Web CSS 出力 + SwiftUI / Rust 出力 | **進行中** (CREO-86) |
| 2 | Example consumer + crates.io publish + Web Components (Shadow DOM) | Planned |
| 3 | Theme 切替 (light / dark / high-contrast) | Planned |
| 4 | Figma sync (tokens.studio 連携) | Planned |

詳細は [Epic CREO-84](https://linear.app/chronista/issue/CREO-84) を参照。

## License

Apache-2.0 — [LICENSE](./LICENSE) を参照。
