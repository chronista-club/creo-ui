# Changelog

本ファイルは Creo UI の version 別変更履歴を記録する。
package 別 version (web / swift / rust / editor-host) は独立に bump される — 該当 package の `package.json` / `Package.swift` / `Cargo.toml` を SSOT とする。

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
