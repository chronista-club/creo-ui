# Changelog

本ファイルは Creo UI の version 別変更履歴を記録する。
package 別 version (web / swift / rust / editor-host) は独立に bump される — 該当 package の `package.json` / `Package.swift` / `Cargo.toml` を SSOT とする。

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
