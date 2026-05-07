# Changelog

本ファイルは Creo UI の version 別変更履歴を記録する。
package 別 version (web / swift / rust / editor-host) は独立に bump される — 該当 package の `package.json` / `Package.swift` / `Cargo.toml` を SSOT とする。

## v0.17.0 (2026-05-06) — 5 tier convention 完全統一 (web、 BREAKING、 final)

v0.16.0 で部分統一 (spacing / container / grid / icon を `xs/s/m/l/xl`)、 残 token (margin / radius / shadow / typography.size / typography.display) は `xs/sm/md/lg/xl` で violation 残存していたのを v0.17.0 で **完全統一**。 これで Creo UI の全 dimension scale token が `xs/s/m/l/xl` (5 tier) で揃う。

### BREAKING (web 0.17.0)

| token | v0.16.0 → | v0.17.0 |
|---|---|---|
| `--margin-{sm,md,lg}` | (4 tier 違反) | `--margin-{s,m,l}` |
| `--radius-{sm,md,lg}` (+ `none/full`) | (4 tier 違反) | `--radius-{s,m,l}` (+ `none/full`) |
| `--shadow-{sm,md,lg}` (+ `none`) | (4 tier 違反) | `--shadow-{s,m,l}` (+ `none`) |
| `--typography-size-{sm,md,lg}` | (4 tier 違反) | `--typography-size-{s,m,l}` |
| `--typography-display-{sm,md,lg}` | (4 tier 違反) | `--typography-display-{s,m,l}` |

### Migration

```css
/* before (v0.16.0) — DO NOT USE, removed */
margin: var(--margin-md);
border-radius: var(--radius-lg);
box-shadow: var(--shadow-sm);
font-size: var(--typography-size-md);

/* after (v0.17.0) */
margin: var(--margin-m);
border-radius: var(--radius-l);
box-shadow: var(--shadow-s);
font-size: var(--typography-size-m);
```

JS:

```ts
// before (v0.16.0) — removed
import { MarginMd, RadiusLg, ShadowSm, TypographySizeMd } from 'creo-ui-web/tokens.js'

// after (v0.17.0)
import { MarginM, RadiusL, ShadowS, TypographySizeM } from 'creo-ui-web/tokens.js'
```

### Notes (web 0.17.0)
- 値 (= dimension の物理値) は据置、 名前のみ変更。
- `none` / `full` (radius / shadow) と `xs` / `xl` 4 corner は touch なし、 v0.16.0 と意味的に一致。
- ecosystem 全層 (token JSON + CSS components + dogfood docs site + Swift / Rust generated + creo-ui-editor-host jsdoc/test) を 1 commit で sync 完了。 Container 等 Round 1 で先行 rename 済の token は touch なし。

### 後始末
- `examples/docs/src/pages/Foundations/{Spacing,Principles}.tsx` で v0.16 暫定の「margin は historical に sm/md/lg のまま、 後で 5 tier 統一予定」 注記を **削除** (= 統一完了で historical state 解消)。

---

## v0.6.0 (2026-05-06) — 5 tier 完全統一 (rust + swift、 BREAKING)

web v0.17.0 と sync。 Rust const + Swift identifier 両方が rename:

```rust
// before — removed
creo_ui::MARGIN_MD
creo_ui::RADIUS_LG
creo_ui::SHADOW_SM
creo_ui::TYPOGRAPHY_SIZE_MD

// after
creo_ui::MARGIN_M
creo_ui::RADIUS_L
creo_ui::SHADOW_S
creo_ui::TYPOGRAPHY_SIZE_M
```

```swift
// before — removed
CreoUITokens.marginMd
CreoUITokens.radiusLg
Color.shadowSm

// after
CreoUITokens.marginM
CreoUITokens.radiusL
Color.shadowS
```

v0.5.0 (rust) は publish 直後本 session で本問題発覚、 production consumer ゼロ。 v0.6.0 が crates.io / SwiftPM の最初の 5 tier 完全統一 release。

---

## v0.16.0 (2026-05-06) — 5 tier sizing convention 統一 (web、 BREAKING、 partial)

### BREAKING (web 0.16.0)

v0.15.0 で追加した container / grid / icon token + data-size attribute が **Tailwind 流 sm/md/lg/xl の 4 段階** で書かれていたが、 commit `98a5804` (`refactor(spacing): rename sm/md/lg → s/m/l (5 tier 統一)`) で確立された **既存 spacing convention `xs/s/m/l/xl` (5 段階)** に違反していた (PR #24 Round 1 の認識ミス)。

v0.16.0 で **token name + dogfood の data-size attribute 両層** を 5 tier convention に揃える:

#### Token rename + 値拡張

| token | v0.15.0 | v0.16.0 |
|---|---|---|
| `--layout-container-*` | `sm/md/lg/xl` (4 値) | `xs/s/m/l/xl` (5 値、 xs=480 追加) |
| `--layout-grid-col-min-*` | `sm/md/lg` (3 値) | `xs/s/m/l/xl` (5 値、 xs=120 + l=280 + xl=320 追加) |
| `--typography-icon-*` | `md/lg/xl` (3 値) | `xs/s/m/l/xl` (5 値、 xs=16 + s=24 追加) |

#### Migration (consumer side)

```css
/* before (v0.15.0) — DO NOT USE, removed */
max-width: var(--layout-container-md);
font-size: var(--typography-icon-lg);

/* after (v0.16.0) */
max-width: var(--layout-container-m);
font-size: var(--typography-icon-l);
```

```html
<!-- before -->
<div class="creo-container" data-size="md">
<div class="creo-grid" data-cols="auto-md">
<div class="creo-empty-state" data-size="lg">

<!-- after -->
<div class="creo-container" data-size="m">
<div class="creo-grid" data-cols="auto-m">
<div class="creo-empty-state" data-size="l">
```

実 consumer は v0.15.0 install しないまま v0.16.0 直行を推奨 (v0.15.0 は publish 直後 30 分で本問題発覚、 実 production consumer ゼロ)。

### Notes (web 0.16.0)
- `data-padding="s"` / `"l"` は元から convention 準拠で touch なし。 `data-padding="m"` は default 値で attribute 不要。
- empty-state の `data-size` attribute も `s/m/l` (3 段階) に rename。 button / input 等他 component の `data-size` (sm/md/lg) は **別 axis** で本 release 範囲外 (将来別 PR で 5 tier 統一する場合は consumer-breaking change として明示)。
- Swift / Rust generated にも 5 tier rename + 値拡張が伝播。

---

## v0.5.0 (2026-05-06) — New tokens additive (rust + swift)

5 新 token (web v0.16.0 の 5 tier rename と sync):
- `COLOR_SURFACE_SCRIM` / `COLOR_SURFACE_SCRIM_MODAL`
- `LAYOUT_CONTAINER_{XS,S,M,L,XL}` (5 tier、 v0.4.0 の sm/md/lg/xl 4 tier から rename + xs 追加)
- `LAYOUT_GRID_COL_MIN_{XS,S,M,L,XL}` (5 tier、 v0.4.0 の 3 tier から拡張)
- `TYPOGRAPHY_ICON_{XS,S,M,L,XL}` (5 tier、 v0.4.0 の 3 tier から拡張)

const 名 BREAKING (Rust / Swift consumer の `LAYOUT_CONTAINER_SM` 等は無くなる、 `_S` に rename 必要)。 v0.4.0 は publish 直後 (30 分以内) で実 consumer ゼロ、 v0.5.0 直行推奨。

OKLCH alpha (0.4 / 0.5) は依然 opaque RGB に変換 (Phase 3 で alpha 対応検討)。

---

## v0.15.0 (2026-05-06) — A11y reduced-motion full coverage + 5 new tokens (web)

### Added (web 0.15.0)
- **Surface scrim tokens** (modal / drawer backdrop の semantic split):
  - `--color-surface-scrim` (40% black) — drawer / side sheet
  - `--color-surface-scrim-modal` (50% black) — dialog (中央 modal、 強い注意)
- **Layout container tokens** (`--layout-container-{sm,md,lg,xl}` = 640/768/1024/1280px) — page-level max-width SSOT
- **Layout grid tokens** (`--layout-grid-col-min-{sm,md,lg}` = 160/220/320px) — auto-fit grid minmax
- **Typography icon tokens** (`--typography-icon-{md,lg,xl}` = 40/64/96px) — empty-state / illustration icon size

### Changed (web 0.15.0)
- **A11y `prefers-reduced-motion: reduce` guard を 14 全 component に完全適用** — dialog / drawer / tooltip / skeleton (元から or Round 3) + button / card / breadcrumbs / pagination / form-controls / input / header / menu / stepper / segmented / tabs / table (本 PR で追加)。 WCAG 2.1 SC 2.3.3 (Animation from Interactions) + SC 2.3.1 準拠。 spatial transform (switch thumb slide / button press / table sort indicator 等) も全停止。
- `container.css` の `data-size="full"` を `100vw` → `100%` に修正 (scrollbar gutter で水平 scroll する bug fix)。
- `dialog.css::backdrop` の `rgba(0, 0, 0, 0.5)` を `var(--color-surface-scrim-modal)` に置換 (Token SSOT 原則 6 violation の解消)。
- `drawer.css::backdrop` の `rgba(0, 0, 0, 0.4)` を `var(--color-surface-scrim)` に置換。

### Notes (web 0.15.0)
- 全 token additive、 既存 var 名変更なし。 consumer は単純 upgrade で 5 新 token + 14 component の reduced-motion 対応を取得。
- Swift / Rust generated にも新 token が伝播 (creo-ui-swift / creo-ui Rust crate も同 PR で bump)。

---

## v0.5.0 (2026-05-06) — Public type exports + DEV-gated console (editor-host)

### Added (editor-host 0.5.0)
- Public type re-exports (consumer が config / host を annotate 可能に):
  - `EditorHostConfig` — `<EditorHostProvider>` の config prop 型
  - `EditorShortcut` — `config.shortcut` の型 (`{ ctrl?, shift?, alt?, meta?, key }`)
  - `EditorHost` — `useEditorHost()` 戻り値
  - `EditorHostMcpApi` — `host.mcp` の AI agent 向け subset
  - `EditorField` / `EditorFieldType` / `EditorFieldConstraints` — field 宣言用

### Changed (editor-host 0.5.0、 behavior change — consumer 確認必要)
- **`config.exposeConsole` の default を `import.meta.env.DEV` に変更** (CLAUDE.md EH-6 規定への準拠)。 これまで production build でも `window.creoEditor` が expose されていたが、 production では default `false`、 dev (Vite) では default `true`。 production で意図的に expose したい consumer は明示的に `config={{ exposeConsole: true }}` を渡す。
- `morphFrame()` (frame package、 別 bump 0.1.1) の cancel 挙動 contract 変更も併せて参照。

### Notes (editor-host 0.5.0)
- `provider.tsx` の DEV gating は `Boolean(import.meta.env?.DEV)` で defensive cast、 Vite 以外の consumer 環境でも `undefined → false` で **安全 fail (production 扱い)** する。
- Vite consumer は `vite/client` types を tsconfig に含めると completion が効く。

---

## v0.1.1 (2026-05-06) — morphFrame cancel graceful skip + JSDoc (frame)

### Fixed (frame 0.1.1)
- **`morphFrame()` が cancel された animation で全体 throw しない** — 内部実装を `Promise.all` から `Promise.allSettled` に変更。 1 個の `animation.cancel()` (B-γ で in-flight setFrame 上書き / Provider unmount race 等) で全体 reject していた挙動を、 cancel された animation のみ skip し完走 animation のみ返す挙動に修正。 caller は try/catch なしで `await morphFrame(...)` 可能。

### Documented (frame 0.1.1)
- `morph.ts` JSDoc に **Cancel / unmount 時の挙動 contract** を明記 (cancel された animation は graceful skip、 fulfilled animation のみ結果に含む)。
- `spring.ts` JSDoc に過減衰近似の精度限界を明記 (damping ≥ 1 で physically-correct な hyperbolic 解と分岐していない件、 視覚的影響最小だが将来の精度向上 path として明示)。

### Test (frame 0.1.1)
- `morph.test.ts` に cancel / rejection graceful skip test 2 件追加 (single cancel / mixed cancel + fulfilled)。

---

## v0.4.0 (2026-05-06) — New tokens additive (rust + swift)

### Added (rust 0.4.0 / swift 0.4.0)
- 5 新 token (web v0.15.0 の token 追加と sync):
  - `COLOR_SURFACE_SCRIM` / `COLOR_SURFACE_SCRIM_MODAL`
  - `LAYOUT_CONTAINER_{SM,MD,LG,XL}`
  - `LAYOUT_GRID_COL_MIN_{SM,MD,LG}`
  - `TYPOGRAPHY_ICON_{MD,LG,XL}`
- Swift: 同等の `Color.colorSurfaceScrim` 等 + `CreoUITokens.layoutContainerMd` 等の CGFloat extension。

### Notes (rust 0.4.0 / swift 0.4.0)
- OKLCH alpha (0.4 / 0.5) は Swift / Rust の現 custom format で **opaque RGB に変換** される (alpha drop)。 Phase 3 で alpha 対応検討、 現状は限界として CHANGELOG に明記。
- Web は OKLCH literal で emit、 modern browser が直接解釈。

---

## v0.14.0 (2026-04-26) — Mode-based Typography Family

### Added (web)
- **Mode-based typography family tokens** (6 keys):
  - `--typography-family-app` — App UI chrome (sidebar / button / dialog / tab)。JetBrainsMono Nerd Font Mono + PlemolJP fallback。
  - `--typography-family-read` — 読み専用表示 (memory view / chat history / canvas markdown)。PlemolJP 主軸、CJK 完全等幅統一。
  - `--typography-family-editor` (default) — textarea / Markdown editor / chat input。iA Writer Duo Nerd Font Mono の Duospace。
  - `--typography-family-editor-mono` — 純粋 mono 派 (iA Writer Mono)。
  - `--typography-family-editor-quattro` — semi-proportional 派 (iA Writer Quattro、長文散文)。
  - `--typography-family-terminal` — xterm.js 用 (app と同じ stack だが意味的に分離)。
- 同等の Swift token: `Color.typographyFamilyApp` 等 — `packages/swift/Sources/CreoUI/Generated/Tokens.swift`
- 同等の Rust token: `TYPOGRAPHY_FAMILY_APP` 等 — `packages/rust/src/generated/tokens.rs`

### Notes
- 既存の `sans / mono / mono-{legible,retro,corporate,display} / display / icon` token は **back compat で残置**。consumer は段階的に mode-based に移行可。
- フォント WOFF2 bundle は本 version では **同梱しない** (Phase F2 で別 PR)。当面は consumer (VP 等) 側で system install or 個別 bundle が必要。
- ライセンス: 採用 font は全て **OFL 1.1** (JetBrains Mono Nerd Font / iA Writer Mono/Duo/Quattro / PlemolJP) — 将来 bundle 時は `THIRD_PARTY_NOTICES.md` で表記予定。

### 設計起点
- 「書く時は writer 思想 (iA Writer)、読む時は和文重視 (PlemolJP)、UI は dev tool 感 (JetBrainsMono)」を font swap で UX に乗せる。
- VP (vantage-point) の AI native dev environment コンセプトに合わせ、monospace UI で「IDE / terminal で work する場」感を最大化。

### Phase 計画
- **F1 (本 PR)**: token 追加 + version bump 0.14.0 + CHANGELOG (token-only)
- **F2**: `packages/web/dist/fonts/` に WOFF2 bundle + `@font-face` CSS + LICENSE 通知
- **F3**: iA Writer Mono / Quattro 素 OFL 追加 (editor catalog option)
- **F4**: `packages/editor-host/` で mode 切替 runtime UI
- **F5**: VP 側 (vantage-point installer) で creo-ui v0.14+ + WOFF2 同梱
