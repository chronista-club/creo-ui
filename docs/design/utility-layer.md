# Utility 層 — creo-ui は「値の当て方」を持つべきか

**Status**: SPEC 合意 → 最小実装を trial 中 (2026-08-30)
**Scope**: `packages/web/src/utilities.css` (新設)、`packages/web/package.json` の exports、`scripts/build-web-components.mjs`
**Related**: [tailwind-interop.md](./tailwind-interop.md)、creo-memories `creo-ui-as-independent-gui-library`

---

## SPEC — 何を、なぜ

### Abstract

creo-ui は **「値」は完璧に持っているが「任意の要素への当て方」を持っていない**。
consumer がその空白を Tailwind で埋めている限り、creo-ui は独立した GUI ライブラリになれない。
utility 層を持つかどうかを決める。

### Motivation

owner 方針 (2026-08-30): **consumer は creo-ui だけで済むのが理想。**
追随先が 1 つで済み、「creo-ui + 任意の何か」という形で使える状態にしたい。
UI ライブラリが別の UI ライブラリに引っ張られる構図を避ける。

この方針を採ると、Tailwind が埋めている領域を creo-ui が持つ必要が出る。
どこが空白かは実測済み。

### 現状 — 3 層のうち 1 層だけが無い

| 層 | 提供物 | 状態 |
|---|---|---|
| **値** | `--spacing-*` / `--margin-*` / `--radius-*` / `--layout-gap-*` 等 240 変数 | ✅ 完備 |
| **component 内での適用** | `.creo-*` 40 種が自分で `padding: var(--spacing-s)` 等を持つ | ✅ 完備 |
| **任意の要素への適用** | — | ❌ **無い** |

3 行目を、creo-ui 公式 site は **手書き CSS 2,622 行** (うち spacing 系の宣言 211 箇所) で
埋めている。Tailwind ゼロで 64 ページが成立している**実在証明**ではあるが、
consumer に同じ量の手書きを求めるのは重い。

### 実測 — 空白の大きさ (anycreative.tech、2026-08-30)

Tailwind class の出現 832 / ユニーク 286。族別に見ると:

| 分類 | 箇所 | creo-ui での扱い |
|---|---|---|
| 色・サイズ・角丸・罫線 (`text-*` / `border-*` / `rounded-*`) | 約 7 割 | **token へ 1 対 1 で機械置換できる** |
| **`flex` / `items-center` / `gap-*` / 余白 (`mb` `px` `py` …)** | **約 160** | **← ここが空白** |
| 位置・寸法 (`relative` / `absolute` / `w-*` / `z-*`) | 残り | 汎用 CSS、token 不要 |

**最小の layout utility があれば、Tailwind 除去はほぼ機械作業になる。**

### 先に確かめるべきこと — creo-ui の語彙は意味ベースで揃っているか

utility を作る前に、**何を utility 名にするか**が creo-ui 自身の一貫性に関わる。
現状、token 族によって語彙の抽象度が違う:

| 族 | 大きさの語彙 | **意味の語彙** |
|---|---|---|
| spacing / margin | `xs/s/m/l/xl` | ✅ `--layout-gap-{tight,sibling,section,page}` |
| typography | `size-{xs..xl}` | ✅ `--typography-body-{default,lead,caption,helper,emphasis}` / `--typography-title-*` |
| layout | — | ✅ `--layout-container-*` / `--layout-target-{hit,tap,focus}` |
| **radius** | `none/xs/s/m/l/xl/full` | ❌ **無い** |
| **shadow** | `none/s/m/l/xl` | ❌ **無い** |

**spacing と typography は既に「意味で選ぶ語彙」を持っている。** `--layout-gap-sibling` は
「どのサイズか」ではなく「何と何の間か」で選ばせる設計で、数値を覚えずに済む。

一方 **radius / shadow は大きさの語彙しかない**。radius は
`docs/components/` 側に 4 axis の operational definition (形状語彙 × 適用 surface ×
柔らかさ × 用例) を書いて人間が読んで選ぶ形になっており、**token 側には出ていない**。

実装での使われ方を見ると、意味の階層は事実上存在する:

```
radius-full  (12 component)  avatar / button / badge / progress  → 丸いもの・ピル
radius-xs    (10)            badge / input / menu / toast        → 小さい inline 要素
radius-s      (8)            accordion / input / select / sidenav → control
radius-m      (5)            alert / card / popover              → 容器
radius-l      (2)            dialog / empty-state                → 上位 surface
```

**この非対称は utility の設計を直撃する。** spacing なら `.creo-gap-sibling` と意味で書けるが、
radius は `.creo-rounded-m` となり、Tailwind の `rounded-md` と同じ抽象度 (= 大きさ) に落ちる。
**creo-ui らしさは「意味で選べること」にあるので、そこが揃っていないと utility も揃わない。**

### Scope

**In Scope (この SPEC で決めること)**

- utility 層を持つか / 持たないか
- 持つなら **語彙の方針** — 意味ベース (`.creo-gap-sibling`) か大きさベース (`.cu-gap-m`) か、併用か
- 対象 property の範囲 — 実測から見て最小は `display:flex` 系 + `gap` + `padding` / `margin`
- **radius / shadow に意味別名を足すか** (utility の前提として)

**Out of Scope**

- Tailwind との bridge (作らないと決定済み → [tailwind-interop.md](./tailwind-interop.md))
- consumer 側 (anycreative.tech) の Tailwind 除去作業。creo-ui 側が整ってから
- 色の utility。`.creo-*` component が色を持つため優先度が低い

### 決定 (2026-08-30)

**unit を土台に、semantic は後から乗せる。** token が既にその構造 (`--layout-gap-sibling`
→ `var(--spacing-m)`) なので utility も揃える。unit だけあれば全部書けるが逆は成り立たない。

**「並べる」だけを utility にする。「余白」は持たない。**

実測 235 箇所の分布を見ると、ごく少数の utility が大半を占める
(`items-center` 26 / `flex` 28 — この 2 つで 23%)。一方 padding は 23 種 / margin は 16 種に
分散しており、utility 化すると一気に 39 class 増える。

余白を持たない理由:

1. **分散が大きく、持つと「大きく作る」ことになる** (owner 懸念: ここで大きく作るのは危険)
2. **padding の多くは component が持つべきもの。** `.creo-card` の内側余白は card が決めるべきで、
   consumer が `p-6` と書くのは本来 component 化の兆候
3. **CSS 1 行で済む。** `padding-bottom: var(--spacing-l)` は utility 無しでも書ける。
   creo-ui 公式 site は 211 箇所をこの形で書いている

対して「並べる」(`display:flex` / `align-items` / `gap`) は **HTML の構造に対応する指定**で、
CSS に切り出すと class を新設し続けることになる。ここだけ utility にする。

**持たないと決めるもの** (Tailwind の再実装を避ける線引き):
`relative` / `absolute` / `z-*` / `w-*` / `h-*` などの汎用 CSS、任意値記法
(`grid-cols-[5.5rem_2rem_1fr]`)、色 utility (component が持つため)。

### Open — 議論が要る

1. **そもそも持つべきか。** 持つと creo-ui の責務が 1 つ増える。CLAUDE.md の 3 本柱
   (token SSOT / Editor Mode protocol / Web reference runtime) は **Design System** としての
   定義で、GUI ライブラリとしての「組み立て語彙」は含まれていない。**自己定義の更新を伴う**
2. **語彙をどう決めるか。** 意味ベースは creo-ui らしいが、**任意の組み合わせに耐えるか**は別問題。
   `gap` は意味で選べても `padding-top だけ 4px` のような要求には意味語彙が無い
3. **radius / shadow の意味別名を先に整えるか。** utility の前提として揃える価値はあるが、
   token 追加 = SSOT 改定なので別タスクにもできる
4. **どこまでを creo-ui が持たないと決めるか。** `relative` / `z-index` / `w-full` のような
   汎用 CSS まで持つと Tailwind の再実装になる。**持たない線引き**を明示する必要がある

### Requirements (方向性が決まってから詰める)

- consumer が **creo-ui だけで一般的な画面を組める**こと
- 既存 consumer に影響しないこと (追加のみ、既存 class / token を変えない)
- creo-ui の 5 tier convention と意味語彙を壊さないこと
- **Tailwind の再実装にならないこと** — 持たない範囲を明示する

---

## DESIGN — データ構造と実装方法

### 提供する class (7 種、trial)

```css
.cu-row      { display: flex; }
.cu-col      { display: flex; flex-direction: column; }
.cu-center   { align-items: center; }
.cu-between  { justify-content: space-between; }
.creo-gap-{xs,s,m,l,xl}  { gap: var(--spacing-{xs,s,m,l,xl}); }
```

実測でこの 7 種が **flex 45 + align 48 + gap 33 = 126 箇所 / 235 (54%)** を埋める。

- `.cu-row` / `.cu-col` は `display:flex` を含む。`flex` + `flex-col` の 2 class を
  書かせるより、方向まで含めて 1 class にする方が誤りが少ない
- `.cu-center` は `align-items` のみ。`justify-content` は `.cu-between` で別に持つ
  (交差軸と主軸を混ぜない)
- gap は **unit 語彙** (`xs..xl`)。semantic (`.creo-gap-sibling`) は必要になってから足す

### 置き場 — `components/` には置かない

| | 理由 |
|---|---|
| **✗ `packages/web/src/components/`** | ① `scripts/build-web-components.mjs` が `components/*.css` を concat するため `components.css` に混ざる ② `scripts/check-tweak-vars.mjs` が同 dir を走査して `.creo-<name>` を **component class として登録**するので、utility が component と誤認される |
| **✓ `packages/web/src/utilities.css`** (単一ファイル) | component と別系統であることが構造で示せる。`check-tweak-vars` の走査対象外 |

export は `@chronista-club/creo-ui/utilities.css` を新設する (`package.json` の exports)。
**trial なので独立 import にする** — 使わない consumer に影響せず、撤回も容易。
定着したら `components.css` への同梱 (= 既定で使える) を検討する。

### prefix — component とは分ける (`cu-`)

| 層 | prefix | 例 |
|---|---|---|
| component (まとまった UI) | `.creo-*` | `.creo-card` |
| **utility (単一 property)** | **`.cu-*`** | `.cu-gap-m` |

**不統一ではなく、粒度の違いを prefix で表している。** 同じ prefix で並ぶと層の違いが
読み取れない。`CU` は既存規約 (SolidJS primitive の `CUButton` / `CUPageShell`、
`controls/index.ts` の「CU* 規約」) を CSS 側へ持ち込んだもので、新しい略称ではない。

`c-` は短すぎて consumer の既存 class と衝突しうるため採らない。
utility は markup に書く頻度が高いので短さが効く (31 字 → 25 字)。

### 命名の考え方

Tailwind の `flex items-center gap-4` に対して `.cu-row .cu-center .cu-gap-m`。
**数値ではなく creo-ui の 5 tier 語彙**を使う点が違い、token を変えれば追従する。

`.creo-stack` は既存の shell component (`CUStack`) が使っているため避けた。

---

## GUIDE — 使い方

### import

```js
import '@chronista-club/creo-ui/tokens.css'      // 1. 値 (必須)
import '@chronista-club/creo-ui/components.css'  // 2. component
import '@chronista-club/creo-ui/utilities.css'   // 3. utility (任意)
```

trial のため**独立 import**。使わない consumer には影響しない。

### 書き方

```html
<div class="cu-row cu-center cu-gap-s">
  <span class="creo-badge">New</span>
  <span>並べるのは utility、 見た目は component</span>
</div>
```

| class | 効果 |
|---|---|
| `.cu-row` | `display: flex` |
| `.cu-col` | `display: flex; flex-direction: column` |
| `.cu-center` | `align-items: center` (交差軸) |
| `.cu-between` | `justify-content: space-between` (主軸) |
| `.creo-gap-{xs,s,m,l,xl}` | `gap: var(--spacing-*)` |

### utility が持たないものは CSS で書く

utility は「並べる」だけを持つ。余白・位置・寸法は従来どおり token を参照する CSS を書く。

```css
/* 並びは utility に委譲し、 残りだけ書く */
.docs-preview-row {
  flex-wrap: wrap;
}
```
```html
<div class="cu-row cu-center cu-gap-m docs-preview-row">
```

これは creo-ui 公式 site での実適用例 (`apps/site/src/styles/docs.css`)。
元は `display:flex` / `flex-wrap` / `gap` / `align-items` の 4 宣言だったものが、
**utility に 3 つ渡して 1 宣言**になった。

### 迷ったときの判断

| 状況 | どうするか |
|---|---|
| 要素を横 / 縦に並べたい | utility (`.cu-row` / `.cu-col`) |
| 余白を付けたい | **CSS を書く** (`padding: var(--spacing-m)`)。同じ余白を繰り返すなら component 化の兆候 |
| 特定の UI を作りたい | component (`.creo-card` 等)。無ければ component として足す |
| `position` / `z-index` / 幅指定 | **素の CSS**。creo-ui は持たない |

### Troubleshooting

| 症状 | 原因と対処 |
|---|---|
| `.cu-gap-m` が効かない | `tokens.css` を読んでいるか確認 (`--spacing-m` が未定義だと `gap` が無効値になる) |
| `.cu-center` で主軸が揃わない | `.cu-center` は `align-items` (交差軸) のみ。主軸は `.cu-between` か CSS で `justify-content` を書く |
| utility が `components.css` に無い | 別ファイル。`utilities.css` を import する (component と別系統であることを構造で示すため意図的に分けている) |

### trial の評価軸

定着したら `components.css` への同梱 (= 既定で使える) を検討する。判断材料:

- site / consumer で実際に使われたか (使われない utility は削る)
- 7 種で足りたか、足りないなら**何が足りなかったか** (安易に増やさず、都度 SPEC に戻る)
- 「余白を持たない」判断が実運用で妥当だったか
