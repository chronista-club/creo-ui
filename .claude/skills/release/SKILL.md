---
name: release
description: creo-ui の release cut を実行する。owner のトリガーで開始し、nightly での bump → main への promote までを案内する (tag / publish は main merge 後に release-tag.yml が自動実行)。「release cut しよう」「リリースして」で invoke。
---

# creo-ui release cut

owner (mako) のトリガーで開始する。cadence の定めは無い — 「いつ切るか」は owner の判断。

設計と不変条件は [docs/design/release-flow.md](../../../docs/design/release-flow.md) を参照。
要点: **全出荷は main 経由** (nightly 直 tag は禁止) / **bump = 出荷の意思表示** /
**tag は機械導出** (main merge 後に `release-tag.yml` が自動で tag + publish dispatch) /
**失敗は roll-forward** (patch bump で前進、unpublish しない)。

## 手順

### ① 出荷対象の切り分け

```bash
git fetch origin
git log --oneline main..origin/nightly          # 未 release commit の一覧
git diff --stat main..origin/nightly -- packages/web packages/editor-host \
  packages/layout packages/icons-web packages/rust
```

判断表 — 「変わった package ≠ bump する package」:

| package | bump する条件 | 備考 |
|---|---|---|
| web (`@chronista-club/creo-ui`) | `packages/web` に実変更 | 主力。ほぼ毎回 |
| editor-host | `src` に実変更 **かつ** 出荷意図 | UX 刷新でも意図が無ければ据え置き可 |
| layout / icons-web | 同上 | |
| rust | generated の**値**が変わったとき | comment だけなら republish 不要 |
| swift | (publish 経路なし — generated の commit のみ) | |
| frame | **publish workflow が無い** | bump しても出荷されない |

bump しない package は version を触らない — `release-tag.yml` は「version が変わって
tag が無いもの」だけを出荷するので、**bump そのものが出荷の指示書**になる。

### ② nightly で bump + CHANGELOG (release prep PR)

```bash
git switch -c mako/release-<pkg>-<ver> origin/nightly
# version 行だけを置換 (json 全体の再整形をしない — biome の format が壊れる)
sed -i '' 's|"version": "X.Y.Z",|"version": "X.Y+1.0",|' packages/web/package.json
```

CHANGELOG.md の先頭に `## vX.Y.0 (YYYY-MM-DD) — <一言>` を追加:
- 冒頭に「> **web \`X.Y.0\`** を release。<他 package の据え置き理由>」
- PR 番号付きで変更を章立て (breaking / 視覚変更は **太字で明示** + migration)
- 内部構造の変更 (grid 列数など) で consumer の custom CSS に影響しうるものは注意書き

`typecheck` / `lint` を通し、`release: creo-ui <pkg> vX.Y.0 — <一言>` で commit →
**base=nightly の PR → CI 緑 → squash merge**。

### ③ release PR (nightly → main) — 人間の最後の関所

```bash
gh pr create --base main --head nightly --title "release: nightly → main (<pkg> vX.Y.0)"
```

- body に出荷対象と据え置き理由を明記 (①の判断表の結論)
- CI 緑を確認して **必ず merge commit** (`gh pr merge --merge`) — squash しない
- **merge した瞬間に publish まで自動で走る**。迷いがあるなら merge しない

### ④ 自動実行の見届け (merge 後)

`release-tag.yml` が main push で発火し、tag 作成 + publish dispatch まで行う:

```bash
gh run list --workflow release-tag.yml --limit 1     # auto-tag の成否
gh run list --workflow publish-web.yml --limit 1     # dispatch された publish
npm view @chronista-club/creo-ui version             # registry 反映
```

### ⑤ site 配信

`deploy-site.yml` が main push で発火するが、**CLOUDFLARE_API_TOKEN /
CLOUDFLARE_ACCOUNT_ID secrets が未登録の間は fail する** (owner の登録待ち)。
その場合は local fallback:

```bash
bun run site:deploy        # 要 wrangler OAuth (bunx wrangler whoami で確認)
# 検証: 配信 CSS に新規変更が載っているか
curl -s https://doc.anycreative.tech/creo-ui/ | grep -oE 'assets/[^"]+\.css'
```

### ⑥ 記録

- creo-memories に release の work log (`atlasId: creoui` — hyphen 無しに注意)
- demo stage を更新するなら `bun run site:up`

## Recovery

- **publish が失敗した** (npm token 切れ等): tag は残っているので、原因解消後に
  `gh workflow run publish-<pkg>.yml --ref <tag>` で再実行。あるいは次の main push
  で release-tag.yml が registry 欠落を検出して自動再 dispatch する (self-healing)
- **間違った内容を出荷した**: unpublish しない。修正を nightly に積み、patch bump
  して次の cut で前進 (roll-forward)
- **tag だけ欠落** (歴史的な手動運用の名残): 該当 workflow を `gh workflow disable`
  してから正しい commit に tag を push し、`gh workflow enable` で戻す
  (tag push での二重 publish 発火を防ぐ)

## やってはいけない

- nightly 上の commit に直接 tag を打って出荷する (mid-cycle 出荷は 2026-07-30 に廃止)
- release PR を squash merge する (main の履歴が nightly と分岐する)
- 手動で `web-v*` 等の tag を打つ (release-tag.yml の管轄。上の Recovery の場合を除く)
- npm unpublish (roll-forward が原則)
