# Contributing to Creo UI

Creo UI は **2 axis hybrid governance** で進化します:

- **Concept / Architecture / Foundation** (Frame system / Editor Mode protocol / Theme palette / 5 tier convention / Token SSOT 設計 等) は **creo-ui 側 proactive** に drive — consumer が「現状の語彙で要求を articulate できない」 領域は本 repo で先に concept を起こす責務。
- **Surface friction / API ergonomics / new component need / edge case** は **consumer feedback driven** — 外部 consumer (creo-memories / fleetstage / vantage-point 等) の実使用から friction を逆算。

「concept 駆動 or surface 駆動」 は PR ごとに articulate、 固定 rule よりも case-by-case 判断を優先。 token 追加 / component spec 修正 / bug report どれも歓迎、 ただし以下の原則と flow を守ってください。

## 設計原則 — 5 tier convention strict (v0.17+)

すべての dimension scale token (`spacing` / `margin` / `radius` / `shadow` / `typography.size` / `typography.display` / `layout.container` / `layout.grid.col-min` / `typography.icon`) は:

```
xs  /  s  /  m  /  l  /  xl
```

**5 tier convention に従う**。 `sm` / `md` / `lg` 命名は **完全廃止** (v0.17 で final unification 済)。 例外:
- `radius.none` / `radius.full` (special semantic、 5 tier outside)
- `shadow.none` (同上)

新 token を追加するときは:
- 5 tier convention に従うか、 5 tier outside の **special semantic** であることを明示する。
- 値 (`$value`) を 5 tier 内で **single 系列** で連続させる (= 中央 `m` から放射)、 random な値の集合にしない。
- DTCG `$description` を必ず書く (用途 + どの component で使うか)。

詳細は dogfood site の **Foundations / Principles** page (`/foundations/principles`) と [`design/stack-adr.md`](./design/stack-adr.md) 参照。

## Token 追加・変更 flow

1. **SSOT は `tokens/**/*.json`** のみ。 platform 別 generated 出力 (`packages/web/dist/`, `packages/swift/Sources/CreoUI/Generated/`, `packages/rust/src/generated/`) を直接編集してはいけない。
2. **Issue は Linear** で起票:
   - team: **Creo Memories**
   - label: **`ui-design-system`** (creo-ui 専用)
   - priority: **必ず設定** (None 不可、 Urgent / High / Medium / Low)
   - assignee: **必ず指定** (default は self)
3. branch naming は Linear 生成の `mako/{team-key}-XX-...`、 もしくは memory slug ベースの `mako/{slug}` 形式。
4. `tokens/<category>/<file>.json` を編集。 DTCG 準拠を維持、 3 階層まで dot-notation。
5. **`bun run build` で全 platform 出力を再生成**。 Swift / Rust の generated は **commit 対象** (consumer は generated 前提で build する)、 Web の `packages/web/dist/` は **gitignore** (npm publish workflow が再生成)。
6. `bun run typecheck && bun run lint && bun test` を通す。
7. PR description に Linear Issue URL + memory ID (creo-memories) を記載。
8. Breaking change (既存 token の rename / 削除) は **必ず** [`CHANGELOG.md`](../CHANGELOG.md) に migration 記載 + [`docs/migration/v0.X-to-v0.Y.md`](./migration/) を新設、 consumer 視点で migration steps を articulate する。
9. dogfood (`examples/docs/`) との drift が出た場合は同 PR で sync (5 tier 表記 / version literal / sample code 全部)。

## Token rename sweep checklist (大規模 rename 時の必須確認)

token name 変更 (例: v0.17 で `sm/md/lg` → `s/m/l`) は **ecosystem 全層に波及** する。 以下の checklist で全 layer を漏らさず sweep する。 generated 出力だけ再生成して 「OK」 と思うと **CI fail を 26 時間放置する事故** が起きる (実例は本 section 末尾参照)。

### Layer A: SSOT (source of truth)

- [ ] `tokens/**/*.json` を編集 (token name + value + $description)
- [ ] tokens 内 cross-reference (`{margin.lg}` 等) も同 rename

### Layer B: Generated outputs (build で再生成、 commit 必要)

- [ ] `bun run build` 実行
- [ ] `packages/swift/Sources/CreoUI/Generated/Tokens.swift` 更新確認
- [ ] `packages/rust/src/generated/tokens.rs` 更新確認
- (Web の `packages/web/dist/` は gitignore、 publish workflow で再生成)

### Layer C: Generated を参照する non-generated code (sweep 必須、 漏れやすい)

「generated を import / use する code」 は build で更新されない、 **手動 sweep 必須**:

- [ ] `packages/web/src/components/*.css` — `var(--*)` 参照
- [ ] `packages/swift/Sources/CreoUI/Components/*.swift` — `CreoUITokens.*` 参照 (**production code**)
- [ ] `packages/swift/Tests/**/*.swift` — `CreoUITokens.*` 参照 (**test code**)
- [ ] `packages/rust/src/lib.rs` 等 non-generated rust — `tokens::*` 参照 (test assert を含む)
- [ ] `packages/editor-host/src/*` — jsdoc + test 内 literal
- [ ] `packages/frame/src/*` — 同上

### Layer D: Documentation (Living docs sync、 原則 07)

- [ ] `packages/{web,swift,rust,editor-host,frame,...}/README.md` — npm / SPM / crates.io 表示の consumer 入口
- [ ] `docs/components/*.md` — component spec
- [ ] `docs/design/*.md` — ADR
- [ ] `docs/migration/*.md` — migration guide
- [ ] `docs/contributing.md` — 自身も sweep 対象 (例 / sample が古い token を参照する)

### Layer E: Dogfood

- [ ] `examples/docs/src/**/*.tsx` — token reference + visible labels (button text 等の sample)
- [ ] `examples/web-demo/src/**/*.tsx` — walking skeleton

### Verify (local)

- [ ] `bun run typecheck` pass
- [ ] `bun run lint` / `bun run format` clean
- [ ] `cd examples/docs && bun x tsc --noEmit` 0 errors
- [ ] `bun test packages/editor-host/src` pass
- [ ] `cd packages/frame && bun run test` pass
- [ ] `cd packages/rust && cargo build` pass (mise rustc 1.95 必須、 local env が古いと skip しがち)
- [ ] `cd packages/swift && swift build && swift test` pass (macOS のみ、 Linux 環境では skip)

### Verify (CI、 必須)

- [ ] `gh run list --workflow ci.yml --limit 1` で CI 3 job 全 green 確認
- [ ] **Swift build / Rust build は local で skip しがち** — CI fail を能動的に watch すること

### Why this checklist exists (実例)

v0.17 5 tier rename (commit `942d5eb`、 2026-05-06) で **Layer C (Swift Components / Rust lib.rs / Swift Tests) と Layer D (Swift / Rust README) の sweep が漏れ**、 CI fail を **26 時間 / 9 commit 連続放置** する事故が発生。

漏れ原因:
- Sweep mental model: 「generated は build で再生成、 generated 以外は touch しない」
- 落とし穴: **「generated を参照する non-generated code」** が sweep 範囲に入らなかった (Swift Components の production code、 Rust lib.rs の test assert)
- Local rustc 1.94 vs Cargo.toml 1.95 mismatch で local cargo build skip → CI verify に依存していたが CI fail 通知を能動 watch していなかった

修復: 4 commit (`8ac9376` / `ebfda42` / `3ca61eb` 等) で全 layer sweep + green 化。 本 checklist はこの経験から articulate。

## Living doc 原則

`tokens/`、 `packages/`、 `docs/` の **3 SSOT** は同期義務:

- `tokens/` を変えたら `packages/web/src/components/*.css` の `var(--...)` ref も sync。
- token を rename したら `docs/components/*.md` の token reference 表も sync。
- 設計判断を変えたら `docs/design/*.md` の ADR も update (新 ADR 追加 or 既存 modify)。

「page と token reality は同期する」 が鉄則 (sweep 漏れの literal が consumer を hallucinate に誘導することの防止)。

## Feedback channel

実 consumer (creo-memories / vantage-point / fleetstage / others) からの feedback は loop の駆動源です。 報告 path:

| 種類 | 出し方 |
|---|---|
| **Bug** (`var(--...)` が解決しない / build が壊れる / type が不足) | Linear Creo Memories team / `ui-design-system:bug` label。 再現コード or v0.16/0.17 比較を含めて |
| **API friction** (こう書きたいのに書けない、 token が足りない) | Linear `ui-design-system:friction` label。 use case / 期待 API / 現状の workaround を記載 |
| **Migration question** (v0.14→v0.18 で何かハマる) | Linear `ui-design-system:migration` label、 もしくは [`docs/migration/v0.14-to-v0.18.md`](./migration/v0.14-to-v0.18.md) に PR で patch |
| **Design opinion** (5 tier より N tier、 命名 alternative 等) | Linear `ui-design-system:design-debate` label。 trade-off を articulate、 council / second opinion ベースで議論 |

> **GitHub Issues は無効化されています**。 PR / discussions は GitHub で OK、 issue tracking は Linear に集約。

## PR review convention

- **multi-round review with moody-blues**: 大きな PR は moody-blues (CI + 多角的 review) を回す。 round ごとに finding を closing comments で articulate、 consumer feedback で起こした issue は memory に link。
- **adversarial verification**: feature 追加は santa-method (2 reviewer 独立 review) で convergence。
- **commit message は日本語**、 BREAKING change は `fix!:` / `feat!:` prefix で明示。

## License

contributed 変更は [Apache-2.0](../LICENSE) でライセンスされる。
