# Creo UI

> Creo ecosystem のための Design System。単一の W3C Design Tokens (DTCG) から Web / Apple / Rust を横断する Visual Identity を配布する。

**Creo ID** が tenant identity (「誰の空間か」) を表すのに対し、**Creo UI** は Visual Identity (「どう見えるか」) を担う。両者は対の関係。

## ステータス

**Phase 0 (Scaffold) — 2026-04-20 開始**

Linear Epic: [CREO-84 Creo UI Design System](https://linear.app/chronista/issue/CREO-84)
Phase 0 Issue: [CREO-85 repo bootstrap](https://linear.app/chronista/issue/CREO-85)

## 対応 Platform

| Platform | Package | 出力 |
|----------|---------|------|
| Web | `@creo/ui-web` | CSS custom properties + (Phase 2〜) Web Components |
| Apple (iOS / macOS / watchOS / tvOS) | `CreoUI` (SPM) | SwiftUI Color / CGFloat extensions |
| Rust | `creo-ui` (crate) | `pub const` 定義 + (Phase 2〜) helper traits |

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
| 0 | Repo scaffold + CI skeleton | **In Progress** (CREO-85) |
| 1 | Token MVP (creo-memories から抽出) + Web CSS 出力 | CREO-86 |
| 2 | SwiftUI / Rust 出力 + example consumer | Planned |
| 3 | Web Components (Shadow DOM) | Planned |
| 4 | Theme 切替 (light / dark / high-contrast) | Planned |
| 5 | Figma sync (tokens.studio 連携) | Planned |

詳細は [Epic CREO-84](https://linear.app/chronista/issue/CREO-84) を参照。

## License

Apache-2.0 — [LICENSE](./LICENSE) を参照。
