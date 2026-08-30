# 依存ライブラリの一括最新化 (2026-08)

**Status**: 前半・後半とも完了 (実機確認は owner 待ち)
**Scope**: 全 package の devDependencies、`.github/workflows/*.yml`、`.mise.toml`、`tsconfig.json` 群、`vite.config.ts` 群
**Related**: consumer feedback (creo-memories `mem_1CeYZRUDXaheY9uGqAM73N` §5)

---

## SPEC — 何を、なぜ

### Abstract

creo-ui の開発依存 13 種のうち **6 つが major 遅れ**になっている。これを一括で最新へ上げ、あわせて publish workflow の Node を EOL 版から Active LTS へ移す。

### Motivation

- **追従コストを溜めない。** TypeScript は 5.9 → 7、Vite は 5 → 8 と 3 major 離れており、放置するほど一度に踏む破壊的変更が増える
- **EOL の runtime で出荷している。** publish workflow 4 本が Node 20 を使っているが、Node 20 は 2026-03-24 の v20.20.2 を最後に更新停止 (EOL)
- consumer (anycreative.tech) が同じ更新を先に通しており、**踏む地雷が事前に判明している** (上記 memory §5)

### Scope

**In Scope** — 決定済み

対象 13 種すべてを最新へ。ただし **2 段階に切り分ける**。

**前半 — ビルド基盤とツールチェーン**

- **一括更新**。前半の中で段階分割はしない。creo-ui の consumer は version 指定で使っているため、更新中に不安定な中間状態を晒すリスクが低い
- **TypeScript 7** まで上げる (native port)
- **Node 24 (Krypton / Active LTS)** へ。26 は Current で LTS 化が 2026-10 のため見送る
- Vite 8 / vite-plugin-dts 5 / style-dictionary 5 / **Biome 2** / **@solidjs/router 1.0** / vite-plugin-solid / solid-js / happy-dom / iconify-icon
- **bun は mise 管理から外し brew 版 (1.4.0) を使う** — `.mise.toml` の `[tools]` を削除。以後 repo は bun の版を宣言せず、各自の brew に委ねる (CI は元々 `bun-version: latest` で pin していない)
- 付随修正: `__dirname` → `import.meta.dirname` (vite.config 7 箇所)、`baseUrl` 削除と `paths` 形式 (apps/site)、CSS side-effect import の型宣言 (apps/site)

**後半 — MediaPipe**

- `@mediapipe/tasks-vision` ^0.10 → 1.0.1、および `packages/vision/src/mediapipe.ts` の CDN URL (`tasks-vision@0.10/wasm`) 更新

切り分ける理由: 前半は「CI が通れば終わり」だが、後半は **WASM の CDN 参照 + カメラ実機確認**が絡み、失敗時の切り分けが別物になるため。

**Out of Scope**

- **Tailwind v4 bridge (`@theme` preset export)** — 同じ consumer feedback 由来だが、触るファイルも判断も独立しているため別タスク
- `docs/design/editor-mode.md` の Living Documentation 回収 — 別タスク
- 生成物 (tokens.css / Tokens.swift / tokens.rs) の**値の変更**。本タスクは値を 1 つも変えない

**注意が要る項目 (前半に含むが、想定される波及)**

- `@solidjs/router` 1.0 — apps/site の 58 ファイルで使用。ただし API 面は `A / Navigate / Route / Router / useLocation` の 5 つのみ
- `@biomejs/biome` 2 — `biome migrate` で config は自動変換されるが、**規則追加で新規 lint エラーが出る可能性**がある (現状 349 ファイル clean)。出た場合は本 PR 内で直す

### Requirements

- **token 生成物は完全一致**。`packages/web/dist/tokens.{css,js,d.ts}`、`components.css`、`packages/swift/.../Tokens.swift`、`packages/rust/.../tokens.rs` は Style Dictionary と自前 script が出すもので Vite を経由しないため、1 文字も変わってはいけない
- **`.d.ts` は型の意味が一致**。7 package が出荷する型。`vite-plugin-dts` は 4.5.4 → 5.0.3 で中身が `unplugin-dts` に置き換わっており、ここが本タスク最大の未知。整形の差は許容するが、型そのものが変わったら回帰
- **bundle (`.js`) は export surface が一致**。Vite 8 は Rolldown 化しており **chunk 名や出力形は変わって当然**。完全一致は求めず、export 名の集合が一致することを見る
- `typecheck` / `lint` / `test` / `build` / `check:drift` / `check:tweak-vars` が通ること
- CI 3 job (build / rust / swift) が green、publish workflow が Node 24 で動くこと

---

## DESIGN — データ構造と実装方法

### 版マトリクス

| package | 現在 | 目標 | 使用箇所 | 備考 |
|---|---|---|---|---|
| typescript | 5.9.3 | **7.0.2** | 全 9 | native port。`tsc` の挙動差に注意 |
| vite | 5.4.21 | **8.2.2** | 8 | Rolldown 化 |
| vite-plugin-dts | 4.5.4 | **5.0.3** | 7 | 中身が `unplugin-dts` 1.0.3 に置換。**最大の未知** |
| style-dictionary | 4.4.0 | **5.5.2** | root | 破壊的変更 3 点はいずれも非該当 (後述) |
| @biomejs/biome | 1.9.4 | **2.5.11** | root | `biome migrate` で config 変換 |
| @solidjs/router | 0.15.4 | **1.0.0** | apps/site | 使用 API は 5 つ |
| vite-plugin-solid | 2.11.12 | 2.11.14 | 8 | peer は vite ^9 まで対応済み |
| solid-js | 1.9.12 | 1.9.15 | 8 | patch |
| happy-dom / global-registrator | 20.9 | 20.12 | frame | minor |
| iconify-icon | 3.0.x | 3.0.2 | icons-web | patch |
| @vitejs/plugin-basic-ssl | 2.3.0 | 2.3.0 | apps/site | 変更なし |
| bun | mise 管理 (1.3 pin) | **mise から外す** | — | brew 版 1.4.0 を使う。`.mise.toml` の `[tools]` を削除し、`[tasks.*]` は残す |
| Node (`publish-*.yml` 4 本) | 20 (EOL) | **24** | CI | `npm publish` 認証用。build は bun |
| @mediapipe/tasks-vision | ^0.10 | **1.0.1** | vision, site | 後半で対応。peer は `^0.10.0 \|\| ^1.0.0` の両対応 (API 互換を確認済み) |

### 調査で判明している当たり判定

- **style-dictionary 5 の破壊的変更 3 点はいずれも当たらない** — ①参照構文オプション廃止 → creo-ui は標準 `{spacing.m}` のみ、②非 token leaf 参照禁止 → 36 参照すべて leaf token、③`hooks.formats` + `({ dictionary })` は v4 で移行済み。engines の `node >= 22` も **bun が実行するため CI に影響しない**
- **TS7 の露出は apps/site に限定** — `baseUrl` は apps/site の 1 箇所のみ、CSS side-effect import (TS2882) も apps/site の 5 件のみ。root tsconfig は `apps/*` を include していないため packages 側は無傷
- **`__dirname`** は vite.config 7 箇所

### 実装順序

1. **baseline 採取** — 更新前に `bun run build && bun run build:packages` し、7 package の `dist/` を `/tmp/creo-baseline/` へ退避する。**これを最初にやらないと後で比較できない**
2. **版の一括書き換え + `bun install`** — 上表のとおり
3. **build を通す** — SD5 / Vite 8 / dts 5 がここで落ちる。落ちたら原因ごとに個別 commit で対処
4. **typecheck を通す** (TS 7) — apps/site の `baseUrl` 削除、`paths` 形式、CSS の型宣言
5. **lint を通す** (Biome 2) — `biome migrate` を実行し、新規に出た規則違反を修正
6. **比較** — 下記の受け入れ判定
7. **CI / 環境設定** — `publish-*.yml` 4 本の Node を 24 へ、`.mise.toml` の `[tools]` を削除

### 検証方法

| 対象 | 判定 | 手段 |
|---|---|---|
| token 生成物 (Swift / Rust) | 完全一致 | git 管理下なので `git diff --stat packages/swift packages/rust` が空 |
| token 生成物 (web dist の tokens.*/components.css) | 完全一致 | baseline との `diff` |
| `.d.ts` × 7 package | 型の意味が一致 | baseline との `diff`。差分が出たら目視で型変化の有無を判断 |
| bundle `.js` | export surface 一致 | baseline と現行の `export` 名集合を比較 |
| 全体 | green | `typecheck` / `lint` / `bun test` / `check:drift` / `check:tweak-vars` / CI 3 job |

### 退避路

`vite-plugin-dts` 5.0.3 が Vite 8 で `.d.ts` を壊す場合、**dts だけ 4.5.4 に据え置く** (peer は `vite: ">=3"` なので組合せ自体は成立しうる)。それでも駄目なら Vite を 7 系に留める。**型が壊れた状態では出荷しない**ことを優先する。

---

### 後半 — MediaPipe で判明したこと

**使用 API は 1.0 でも互換だった。** `FilesetResolver` / `HandLandmarker` / `FaceLandmarker`
の 3 つと `forVisionTasks` / `createFromOptions` のシグネチャは 0.10 と変わらず。
そのため peer は `^0.10.0 || ^1.0.0` の**両対応**とし、0.10 のままの consumer を切らない。

**本当の危険は WASM の版ずれだった。** `DEFAULT_WASM_BASE` が
`@mediapipe/tasks-vision@0.10/wasm` と literal で固定されており、npm の JS だけ 1.0 に
上げると **JS 1.x × WASM 0.10** の食い違いが起きる。これは:

- 型検査を通る (URL はただの文字列)
- build を通る (CDN は build 時に触られない)
- baseline 比較も通る (生成物は変わらない)
- **実行時、カメラを起動した瞬間だけ壊れる**

本タスクで唯一、**機械的検証が原理的に効かない箇所**だった。

**対処**: tasks-vision は runtime に版を expose しない (`VERSION` export も
`./package.json` への exports も無い) ため動的導出はできない。代わりに
`packages/vision/src/mediapipe.ts` の `MEDIAPIPE_WASM_VERSION` を**版の SSOT** とし、
package.json の依存レンジとの整合を `scripts/check-mediapipe-version.mjs` が静的に照合する
(CI 実行)。検査が実際に失敗を検出することは、版をわざとズラして確認済み。

**残: 実機確認。** カメラを使う経路のため CI では検証できない。`/lab/vision` 系のページで
hand / face の検出が動くことを owner が実機で確認する。

### Biome 2 で off にした規則と理由

`biome migrate` 後、Biome 2 の新規則が既存コードに 30 件反応した。内訳と判断:

| 規則 | 件数 | 判断 |
|---|---|---|
| `complexity/noImportantStyles` | 5 | **off (恒久)** — 4 件は `@media (prefers-reduced-motion: reduce)` 内の `transform/transition: none !important`。カスケードを確実に断ち切る a11y 契約であり、`!important` が正しい |
| `style/noDescendingSpecificity` | 9 | **off (恒久)** — CSS の記述順を入れ替える修正になり視覚回帰のリスクがある。依存更新と無関係 |
| `a11y/useAriaPropsSupportedByRole` | 14 | **off (暫定)** — `role` の無い `<span>` に `aria-label` を付けており、**実際にスクリーンリーダーへ読まれていない本物のバグ**。別 PR で修正して off を外す |
| `a11y/useFocusableInteractive` | 1 | **off (暫定)** — 同上 (`CUOutliner`) |

暫定 off の 2 件は「Biome 2 が新たに見つけた本物の a11y バグ」であり、握り潰さず後続 PR で扱う。

---

## GUIDE — 使い方

### 開発環境の前提 (更新後)

| | 要件 | 備考 |
|---|---|---|
| bun | **Homebrew 版** (`brew install bun`) | mise 管理から外した。`.mise.toml` に `[tools]` は無い |
| Node | 24 以上を推奨 | ローカル build は bun が実行するため必須ではない。CI の publish のみ Node 24 |
| TypeScript | 7.0.2 | `@typescript/typescript6` を併置している (下記) |

既に mise 経由の bun 1.3 が入っている場合、shim が優先されることがある。`which bun` が
`~/.local/share/mise/shims/bun` を指していたら `mise uninstall bun` するか PATH を調整する。

### `@typescript/typescript6` が要る理由

**TypeScript 7 は JavaScript Compiler API を提供しない** (native port のため)。
`vite-plugin-dts` は内部の `unplugin-dts` 経由でこの API を使って `.d.ts` を生成するため、
TS 7 単体では以下で build が落ちる:

```
Error: [unplugin-dts] The installed "typescript" package does not provide the
JavaScript Compiler API (this happens with TypeScript 7+)
```

**対処**: `@typescript/typescript6` (6.0.2) を devDependency に併置する。TS 7 で型検査しつつ、
tooling には 6 系の JS API を渡すという Microsoft 公式の移行手段。`vite-plugin-dts` を使う
7 package と root に入れてある。**型生成する package を新設したら、これも一緒に入れること。**

**性格: 移行期の依存であり、恒久ではない。** 週間 DL は 449 万 (2026-08 時点) で
`vite-plugin-dts` の 414 万とほぼ同規模 — TS 7 へ移行した consumer の多くが同じ構成を取って
いる。ただし本 package は「6 系の JS API」を切り出したもので、TypeScript 本体と共に進化する
ものではない (2026-04 の初版から 6.0.2 まで修正のみ)。**本来の解決は tooling 側が TS 7 の
新インターフェースへ対応すること**であり、`unplugin-dts` が対応した時点でこの併置は外せる。
依存を次に見直すとき、まずここが不要になっていないか確認する。

### 生成物を検証する手順 (次に依存を上げるとき)

`packages/web/dist` は gitignore なので、**更新前に baseline を取らないと「変わっていないこと」を
証明できない**。

```bash
# ① 更新前に baseline を採取
bun run build && bun run build:packages
mkdir -p /tmp/creo-baseline
for p in web editor-host icons-web layout frame vision md-view; do
  cp -R packages/$p/dist /tmp/creo-baseline/$p
done

# ② 更新 → 再 build 後に照合
#   token 生成物: 完全一致
diff /tmp/creo-baseline/web/tokens.css packages/web/dist/tokens.css
git diff --stat packages/swift packages/rust     # 空であること
#   .d.ts: 並び順の差は許容。識別子の多重集合が一致すれば型は不変
```

### Troubleshooting

| 症状 | 原因と対処 |
|---|---|
| build が `does not provide the JavaScript Compiler API` で落ちる | `@typescript/typescript6` の入れ忘れ。該当 package の devDependency に追加 |
| `tsconfig.json(N,M): error TS5102: Option 'baseUrl' has been removed` | TS 7 で `baseUrl` は廃止。削除する。`paths` が `./` `../` 始まりの相対なら追加対応は不要 |
| カメラを起動すると MediaPipe が読み込みに失敗する | WASM と JS の版ずれの可能性。`bun run check:mediapipe` で整合を確認。consumer 側で版を固定したい場合は `createMediaPipeSource({ wasmBase })` で明示できる |
| root から `bun test` すると frame の DOM test が `document is not defined` で落ちる | **既存の性質で回帰ではない。** `packages/frame/bunfig.toml` の `preload` はその package を CWD にしたときのみ効く。`cd packages/frame && bun test` で 62 pass |
| `.js` の chunk 名が変わった | Vite 8 の Rolldown 化で正常。`exports` map から参照される public entry が一致していれば問題ない |

