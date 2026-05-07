# Contributing to Creo UI

Creo UI は consumer-driven feedback loop で improve します。 token 追加 / component spec 修正 / bug report は歓迎、 ただし以下の原則と flow を守ってください。

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
