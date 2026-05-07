# Creo UI Documentation

Creo UI Design System の architecture / migration / component spec のソース。 Living Documentation 原則 — code と doc は常に同期。

## Status

**Phase 2a Shipped + design system stabilized (2026-05-07)**

- v0.17.0 (web、 BREAKING、 final) — 5 tier convention 完全統一 release
- v0.6.0 (rust) / v0.4.0 (swift) — 同期 BREAKING release
- creo-ui-editor-host @0.5.0 — public type re-exports + DEV-gated console
- Phase 2b/c/d (Rust/Swift repo 切り出し) は **Deferred** (consumer feedback 優先)

詳細は repo root [`README.md`](../README.md)、 release 履歴は [`CHANGELOG.md`](../CHANGELOG.md)。

## Document map

### 🚀 Consumer entry points

- [**Migration v0.14 → v0.17**](./migration/v0.14-to-v0.17.md) — 既存 consumer (creo-memories / vantage-point / fleetstage 等) の upgrade guide。 全 token rename diff + sed pattern + JS / Swift / Rust の同期 path
- [Migration from-legacy-css](./migration/from-legacy-css.md) — 旧 hand-rolled CSS から creo-ui-web への移行 (legacy consumer 用)
- [`tokens-spec.md`](./tokens-spec.md) — DTCG token 命名規則と JSON 構造の SSOT

### 🎨 Foundations (architecture)

- [`design/theme-system.md`](./design/theme-system.md) — 8 theme (4 family × light/dark)、 OKLCH-based palette、 `[data-theme]` 切替 protocol
- [`design/editor-mode.md`](./design/editor-mode.md) — Editor Mode protocol (D-1〜D-12)、 4 方向 semantic layout、 `creo-ui-editor-host` の SolidJS reference 実装に対応
- [`design/frame-system.md`](./design/frame-system.md) — 3D Frame system (P-1〜P-6)、 `creo-ui-frame` package の spec、 morph / FLIP / spring の motion engine
- [`design/stack-adr.md`](./design/stack-adr.md) — Architecture Decision Record (Solid 採用 / Bun monorepo / style-dictionary 4 等)
- [`design/immersive-field.md`](./design/immersive-field.md) — 物理メタファー (frame / depth / vision) の哲学
- [`design/vision-input.md`](./design/vision-input.md) / [`design/vision-cross-platform.md`](./design/vision-cross-platform.md) — Webcam motion + One-Euro Filter による hand gesture input

### 📦 Component spec (28 component)

[`components/`](./components/) 配下に各 component の class 構造 + data-attribute API + token reference + a11y note を mark down で。 dogfood site の `examples/docs/src/pages/Components/` と 1:1 対応 (markdown が canonical spec、 dogfood が visual reference)。

主要 component:
- [Button](./components/button.md) / [Input](./components/input.md) / [Dialog](./components/dialog.md) / [Drawer](./components/drawer.md)
- [Card](./components/card.md) / [Badge](./components/badge.md) / [Avatar](./components/avatar.md)
- [Tabs](./components/tabs.md) / [Menu](./components/menu.md) / [Popover](./components/popover.md) / [Tooltip](./components/tooltip.md)
- [Form-field](./components/form-field.md) / [Form-controls](./components/form-controls.md) / [Combobox](./components/combobox.md)
- [Header](./components/header.md) / [Pagination](./components/pagination.md) / [Stepper](./components/stepper.md)
- [Table](./components/table.md) / [Timeline](./components/timeline.md) / [Skeleton](./components/skeleton.md)
- [Toast](./components/toast.md) / [Alert](./components/alert.md) / [Empty-state](./components/empty-state.md)
- [Accordion](./components/accordion.md) / [Breadcrumbs](./components/breadcrumbs.md) / [Segmented](./components/segmented.md)
- [Progress](./components/progress.md) / [`README`](./components/README.md) (component catalog index)

### 🛠 Contribute

- [`contributing.md`](./contributing.md) — token 追加・変更 flow、 5 tier convention rule、 feedback channel (Linear)、 PR convention

## Living docs sync rule

3 文献が canonical な spec / state を持ちます:

| canonical source | role |
|---|---|
| `tokens/**/*.json` | DTCG SSOT — 全 platform token は ここから生成 |
| `docs/components/*.md` | component class API の canonical spec — implementation との drift は禁忌 |
| `docs/design/*.md` | architecture の Architectural Decision Record — 「なぜ」 が articulate |

dogfood (`examples/docs/`) は **viewer** で、 spec の役割は持たない (visual reference の SSOT は markdown / generated tokens)。

## 関連 link

- repo root [README.md](../README.md)
- [CHANGELOG.md](../CHANGELOG.md)
- Linear Epic [CREO-84 — Creo UI Design System](https://linear.app/chronista/issue/CREO-84)
- npm [creo-ui-web](https://www.npmjs.com/package/creo-ui-web) / [creo-ui-editor-host](https://www.npmjs.com/package/creo-ui-editor-host)
