# Tailwind v4 との関係 — bridge を作らない判断

**Status**: 決定 (2026-08-30)
**Scope**: 判断の記録。実装物なし
**Related**: consumer feedback (creo-memories `mem_1CeYZRUDXaheY9uGqAM73N`)

---

## 決定

**Tailwind v4 向けの `@theme` bridge は作らない。**

consumer (anycreative.tech) から「`@chronista-club/creo-ui/tailwind.css` を export してほしい」
という要望があり設計を進めたが、検討の結果**作らない**と判断した。

## Why — bridge を作ること自体が coupling を生む

creo-ui は Tailwind に**依存していない** (依存ゼロ、公式 site も plain CSS で 64 ページ)。
しかし bridge を出荷すると、それは公開 API になり、以後 creo-ui は

- Tailwind の名前空間 (`--color-*` / `--radius-*` / `--shadow-*`) を追い続ける
- Tailwind の 8 段 scale に自分の 5 tier を合わせる圧力を受ける
- Tailwind の version 更新に追随する義務を負う

実際、検討中に **creo-ui の radius 値と 5 tier convention を Tailwind の都合で変更する案**が
複数出た (8 段への拡張 / 対応表の作り直し / 名前空間の消去)。いずれも creo-ui 側の設計を
Tailwind に譲る形だった。

**UI ライブラリが別の UI ライブラリに引っ張られる構図**を避けるのが owner 方針
(→ creo-memories `creo-ui-as-independent-gui-library`)。bridge はその構図を作る装置なので採らない。

## 調査で分かったこと (将来の判断材料)

### 衝突の実態は 3 変数

「102 変数が Tailwind の名前空間」という consumer 指摘は**占有数**であって実害数ではない。
Tailwind v4 では `@theme` 宣言のみが utility を生み、plain `:root` の変数は utility を増やさない。
起きるのは**同名変数の値の上書き**だけ。

| 出どころ | 実際に Tailwind 既定を塗り替える |
|---|---|
| tokens.css (canonical) | `--radius-xs` / `--radius-xl` / `--shadow-xl` の **3 個** |
| token-shim.css | `--radius-sm/md/lg`、`--shadow-sm/md/lg`、`--font-weight-*` の 9 個 |

**色は衝突しない。** Tailwind の既定 `--color-*` は数値スケールと `black`/`white` のみで、
creo-ui が使う semantic 名 (`primary` / `surface` / `border` / `fg` …) は全部空き。

v0.17 の 5 tier 統一 (`sm/md/lg` 廃止 → `s/m/l`) が、結果的に Tailwind の名前空間をほぼ
避けていた。残る衝突は名前が共通の `xs` / `xl` だけ。

### consumer 側の上書きでは解決しない (構造問題)

`--radius-xs` は creo-ui の **14 component (badge / input / menu / select / toast …) が参照する
最頻値**。consumer が Tailwind を戻そうと `@theme { --radius-xs: 0.125rem }` と書くと、
**creo-ui の component も一緒に変わる**。1 本の変数を component と utility が共有しているため、
片方を直すともう片方が壊れる。**値の問題ではなく所有権の問題。**

### 梯子の逆転 (shim 無しでも起きる)

```
rounded-xl  = 21.5px (creo-ui)
rounded-2xl = 16px   (Tailwind 既定)  ← 大きくしたつもりが小さくなる
```

creo-ui が 5 段、Tailwind が 8 段で体系が違うことの帰結。5 段を名前で被せる限り必ず起きる。

## 当面の扱い

Tailwind v4 consumer には**ドキュメントで案内する**に留める (実装ゼロ、coupling なし)。
ただし現時点で困っている consumer はいない (anycreative.tech は `theme.css` の後勝ち定義で
到達しておらず、更新も急ぎではないと owner 確認済み 2026-08-30) ため、**着手は保留**。

案内する内容:
- Tailwind v4 では `token-shim.css` を import しない (衝突 9/12 が消える)
- 残る `rounded-xs` / `rounded-xl` は creo-ui の値になる。Tailwind の値が必要なら
  consumer 側の `@theme` で再宣言する (ただし creo-ui component にも及ぶ点に注意)
- `docs/migration/from-legacy-css.md` の「tokens.css が供給するので `@theme` は空でよい」は
  **誤り**。plain `:root` の変数は utility を生まないため、修正が必要

## 本筋

この件で浮かんだ本題は **creo-ui を独立した GUI ライブラリにするか**。
consumer が creo-ui だけで済めば、そもそも他の UI ライブラリと共存する必要がない。
唯一の実務的な空白は **utility 層** (`flex` / `gap` / 余白の組み立て語彙) で、
anycreative.tech の実測では Tailwind 利用 832 箇所のうち**約 160 箇所**がここに対応する。
残り約 7 割は token への 1 対 1 機械置換で済む。

→ utility 層を持つかは別途 SPEC (未着手)。
