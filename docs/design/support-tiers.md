# Support Tiers — platform 対応の段階設計

**Status**: Active (2026-07-31 owner 裁定で導入)
**Scope**: 配布 platform / framework の対応方針 (packages/**、release-tag.yml、CLAUDE.md 規約)
**Related**: [release-flow.md](./release-flow.md)、`packages/web/README.md` の「安定性 (public API)」節、creo-memories `mem_1CdaFhpv7H7r3bfkXP5eD2` (裁定)

---

## 1. なぜ tier か (Why)

fleetstage の Podman Desktop 拡張 (Phase 2 webview = Svelte) を契機に、「対応する」という一語に**強さの異なる 2 つの約束**が混ざっていることが顕在化した:

1. **新機能を第一日から出す**約束 — 新 component / 新 token / 新 modifier がその platform に同日で届く
2. **存在するものを壊さず保守する**約束 — bug fix、breaking 追従、semver + migration の運用

全 platform に (1) を約束すると、maintainer の重心 (「token + modifier が本体、runtime 拡充はしない」 — ladyland consumer feedback #9 への応答で確認済み) が崩れる。逆に (2) しか約束しないなら「正式対応」を名乗れない。**約束の強さを暗黙にせず、明示的な段階 (tier) として設計する**のが本文書。

先行例は Rust の [target tier policy](https://doc.rust-lang.org/rustc/platform-support.html) (Tier 1 = guaranteed to work / Tier 2 = guaranteed to build)。creo-ui は「新機能の起点かどうか」と「何に依存してよいか」を軸に翻案する。

## 2. 定義

| Tier | 一言 | 現在の割当 |
|---|---|---|
| **Tier 1** | 共に進む — 新機能はここから出る | Web (SolidJS) / Apple (Swift) / Rust |
| **Tier 2** | 正式だが後追い — 保守は約束、追従は実消費者駆動 | Svelte |
| **対象外** | 約束しない (consumer 側の自由) | React / Vue / その他 |

### 軸ごとの保証

| 軸 | Tier 1 | Tier 2 |
|---|---|---|
| 新機能・新 component の起点 | ✅ 第一日 | 追従は実消費者駆動 (遅延しうる) |
| bug fix / breaking 追従 | ✅ | ✅ (正式サポートの中身) |
| breaking 時の migration doc + CHANGELOG 太字 | 必須 | 必須 |
| release 経路 | release-tag.yml (bump = 出荷) | 同左 (package 成立後) |
| CI gate | merge gate (build / rust / swift job) | package 成立後に build job を CI へ追加 |
| **依存してよい層** | 全層 | **CSS 層 public API + tokens.js のみ** (下記 ST-3) |

## 3. 設計原則 (ST-1 〜 ST-6)

| # | 原則 | 内容 |
|---|---|---|
| **ST-1** | **Tier は約束の強さであり、品質の格ではない** | Tier 2 が「二流」なのではない。出荷物の品質基準 (lint / test / semver) は全 tier 同一。違うのは「新機能がいつ届くか」の約束だけ |
| **ST-2** | **新 platform は Tier 2 から入る** | Tier 1 直行はしない。入口条件 = **実消費者 1 つの実需 + owner 裁定**。仮需要 (「あると便利そう」) では入れない — icons-web (VP の file: 依存 → npm 化) / ladyland AV semantic (consumer 発明 → 逆輸入) と同じ消費者駆動の経路 |
| **ST-3** | **Tier 2 の土台は CSS 層 public API** | `components.css` の class 名 / data 属性 / CSS variable 名 + `tokens.js` 定数 (保証の定義は web README「安定性」節)。SolidJS runtime 層 (shells / controls / editor-host / md-view / icons-web の component) には依存しない。wrapper は **props → class / data 属性変換の薄層に限る** — これが Tier 2 の追従コストを下げ、約束を守れる形にする |
| **ST-4** | **昇格 (2→1) は owner 裁定、目安を明文化** | 目安: 実消費者 2+ / wrapper の component カバレッジが十分 / maintainer が新機能の同日出荷をコミットできること。自動昇格はしない |
| **ST-5** | **消費者が消えた Tier 2 は棚上げを検討** | 実消費者ゼロが 2 release cycle 続いたら deprecate を検討。削除より先に告知 (roll-forward 原則と同じで、突然消さない) |
| **ST-6** | **token の「5 tier」とは別概念** | size scale (xs/s/m/l/xl) の「5 tier convention」と語が衝突する。曖昧になる文脈では **Support Tier** と呼んで区別する |

## 4. 現在の割当と根拠

- **Web (SolidJS) — Tier 1**: reference runtime の本籍 (EH-1/EH-2)。新 component は CSS-only + SolidJS primitive の 2 段で最初にここに出る
- **Apple (Swift) — Tier 1**: token + CreoTheme + `.creoText()`。consumer feedback (VP / ladyland) 駆動で第一線
- **Rust — Tier 1**: token (crates.io `creo-ui`) + ratatui / egui interop
- **Svelte — Tier 2** (2026-07-31 裁定): 初回消費者 = fleetstage Podman Desktop 拡張 Phase 2 webview。進め方:
  1. Phase 2 をまず素の creo CSS class で書く (新パッケージ不要 — CSS 層は public API なのでこれ自体が正規の使い方)
  2. 繰り返す wrapper パターン (目安 3 つ) が見えたら `packages/svelte` に抽出 → `@chronista-club/creo-ui-svelte`
  3. release-tag.yml に `release_one svelte` block + `publish-svelte.yml` を追加して自動 release に乗せる (icons-web #86 と同型、~2 ファイル)

## 5. 運用

- **割当の変更 (新規参入 / 昇格 / 棚上げ) は owner 裁定** + 本文書の更新 + CLAUDE.md / README 要約の sync を**同一 PR** で行う
- consumer 向けの一覧表示は README の「対応 Platform」表が SSOT (Tier 列)
- CLAUDE.md の「やってはいけない」の runtime 規約は本文書の実装ルール — 矛盾したら本文書が勝ち、CLAUDE.md を直す

## 6. Open questions / Roadmap

- Svelte wrapper の抽出タイミング (ST-2 の実需カウントは fleetstage Phase 2 の進行次第)
- 公式 site (doc.anycreative.tech) への tier 表の掲載 — `@chronista-club/creo-ui-svelte` リリース時に Getting Started と合わせて
- Tier 2 の drift 検知 — wrapper が components.css に追従できているかの機械照合 (`check:drift` の wrapper 版) は package 成立後に検討
