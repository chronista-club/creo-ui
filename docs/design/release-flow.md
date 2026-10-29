# Release flow — 「main にマージ = リリース」の固定化

2026-07-30 制定 (owner 裁定)。v0.27.0 の release cut (2026-07-29) の実績と反省から、
release の流れを不変条件として固定する。

## 背景 / Why

creo-ui は Creo ecosystem の全 app (VP / creo-memories / fleetstage / gfp-app …) が
依存する基盤ライブラリで、release の再現性はエコシステム全体の信頼性に直結する。

v0.27.0 までの運用には 3 つの脆さがあった:

1. **手順が属人的** — bump / CHANGELOG / tag の型が Claude session の個人 memory に
   しか存在せず、session や人が変わると再現しない
2. **tag が手動** — 忘れ・打ち間違い・「どの package に打つか」の判断ミスが構造的に
   可能 (実際に layout-v0.3.0 の tag 欠落が発生していた)
3. **mid-cycle 出荷** — editor-host 0.6.0 / layout 0.3.0 が nightly 上の commit への
   直接 tag で出荷され、「main = release branch」の原則と実態が乖離した

## 不変条件

1. **npm / crates.io への全出荷は main を経由する**。nightly 上の commit に直接 tag を
   打つ mid-cycle 出荷は廃止 (2026-07-30)。速く出したいときは release cut を小さく
   回す — cut のコストはこの固定化で十分に低い
2. **bump = 出荷の意思表示**。nightly 上の release prep PR で version を上げることが
   「この package を出荷する」という指示書になる。出荷しない package は触らない
3. **tag は version から機械導出される**。人間は tag を打たない —
   main への push 時に `release-tag.yml` が manifest version と既存 tag / registry を
   突き合わせ、不足分だけを tag + publish する
4. **失敗は roll-forward**。npm も tag も実質 immutable なので、間違えたら patch bump
   で前進する。unpublish はしない

## フロー

```
[owner トリガー]  ← cadence は定めない。「いつ切るか」は owner の判断
  │
  ├─ ① 切り分け      main..nightly の package 別 diff → bump 判断表 (skill 参照)
  ├─ ② release prep   nightly 上で bump + CHANGELOG stamp (PR → CI → squash)
  ├─ ③ release PR     nightly → main、**merge commit** ← 人間の最後の関所
  │                    merge した瞬間に以降は自動
  ├─ ④ release-tag.yml (main push で発火)
  │      tag 導出 → 無ければ作成 → registry に無ければ publish を dispatch
  ├─ ⑤ publish workflows (workflow_dispatch 経由) → npm / crates.io
  └─ ⑥ 検証 + site 配信 + 記録 (skill 参照)
```

## 責務の 3 層

| 層 | 持ち物 | 役割 |
|---|---|---|
| CLAUDE.md | 原則 1 段落 + pointer | 憲法。詳細は持たない |
| `.claude/skills/release/` | 手順 / 判断表 / recovery | 実行知識。Claude と人間の共通手順書 |
| `.github/workflows/release-tag.yml` | tag 導出 + publish dispatch | 機械の保証。判断を持たない |

「判断が要る部分」(何を bump するか、CHANGELOG に何を書くか) は skill に、
「判断が要らない部分」(tag 導出、publish 発火) は workflow に置く。

## 設計上の制約と対応

### GITHUB_TOKEN の tag push は workflow を発火しない

GitHub の再帰防止仕様により、Actions 内から `GITHUB_TOKEN` で push した tag は
`on: push: tags` の workflow を発火しない。素朴な「auto-tag → 既存 publish が発火」は
成立しないため、`release-tag.yml` は tag 作成後に **`workflow_dispatch` で publish を
直接呼ぶ**。既存の publish workflow 5 本はすべて `workflow_dispatch` を備えているので
変更不要。PAT や deploy key の導入 (token 管理の増加) も回避できる。

### 冪等性と self-healing

`release-tag.yml` は「tag が無ければ作る」「registry に無ければ dispatch する」の
2 段判定で、何度走っても不足分だけを埋める。release と無関係の main push (hotfix 等)
では何もしない。publish が一度失敗した release も、次の main push で registry 欠落を
検出して自動で再 dispatch される。

### publish の認証は npm Trusted Publishing (OIDC) — token を持たない (2026-10-30)

npm は 2025-09 の供給網攻撃 (Shai-Hulud) を受けて token publish を締める方針を出した: classic
token の非推奨化、granular token の短命化、**2FA bypass の廃止**。2FA bypass の無い token で CI から
`npm publish` すると `EOTP` (one-time password 要求) で止まる (editor-host 0.9.0 が 10-05 から 4 回、
0.10.0 が 10-30 に落ちた原因。bypass 付きの token に替えた 10-30 06:28 JST の再実行は通り、0.10.0 は
token 経路で npm に出た)。bypass 付き token には寿命があり、bypass そのものも廃止予定なので、token に
依らない OIDC へ切替える。**切替後の最初の publish の前に Trusted Publisher の登録が要る** (未登録は `E404`)。

対応: npm publish workflow 4 本 (web / editor-host / layout / icons-web) を OIDC に切替。

- workflow: `permissions: id-token: write` を足し、`NODE_AUTH_TOKEN` を外す。npm ≥ 11.5.1
  (Node 24 同梱で満たす)
- npmjs.com: package ごとに Trusted Publisher を登録 — GitHub Actions / organization
  `chronista-club` / repository `creo-ui` / workflow file 名 (`publish-<pkg>.yml`) /
  environment 空 / `npm publish` を許可。**登録は owner の作業**。登録後 2 日以内に初回
  publish を通さないと期限切れになり再登録が要る。未登録のまま dispatch すると `E404`
- provenance は public repo + OIDC で自動付与される。`package.json` の `repository.url` が
  この repo と一致していないと publish が落ちる (4 package とも一致済み)
- `release-tag.yml` の `--ref <tag>` dispatch は **tag 時点の workflow file** を使う。workflow
  側の修正は tag ref の再実行では効かないので、recovery は skill の手順 (main から dispatch)

### crates.io の存在照会には User-Agent が要る (2026-10-30)

crates.io API は User-Agent 無しの request を 403 で断る。`release-tag.yml` の `crates_has` が
`curl -sf` だけで照会していたため常に「無い」と判定し、既公開の rust 0.9.0 に publish を
dispatch して `already exists` で落ちていた (main push のたびに失敗 run が 1 本増える)。
`-A` を付けて 200 を返させる。

### 導入時の整合 (2026-07-30)

- layout-v0.3.0 の tag 欠落を backfill (publish workflow を一時 disable して
  該当 commit に tag → enable — tag push での二重 publish を防ぐ手順)
- icons-web の「npm 未公開」疑いは誤報と判明 (照会した package 名の誤り。正しくは
  `@chronista-club/creo-ui-icons-web` で 0.0.1 公開済み)

## 採らなかった選択肢

- **時間ベースの定期 cut (週次等)** — 変更ゼロの週に空リリースを生む。creo-ui の
  規模では owner トリガーで十分
- **PAT による tag push で既存 publish を発火** — token 管理が増える。dispatch 直呼びで
  同じ結果が得られる
- **tag 手動の維持** — 「merge 後にもう一拍」の余地と引き換えに tag 忘れの構造を残す。
  人間の関所は release PR の review に一本化した

## 関連

- 手順: [.claude/skills/release/SKILL.md](../../.claude/skills/release/SKILL.md)
- ブランチ運用: CLAUDE.md「ブランチ運用」節
- 実績記録: creo-memories (atlas `creoui`)
