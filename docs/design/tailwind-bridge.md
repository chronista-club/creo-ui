# Tailwind v4 bridge — `@theme` preset の export

**Status**: SPEC 議論中 (DESIGN / GUIDE は未着手)
**Scope**: `packages/web/src/tailwind.css` (新設)、`packages/web/package.json` の exports、`docs/migration/from-legacy-css.md`
**Related**: consumer feedback (creo-memories `mem_1CeYZRUDXaheY9uGqAM73N` #1〜#3)

---

## SPEC — 何を、なぜ

### Abstract

Tailwind v4 を使う consumer が `@import '@chronista-club/creo-ui/tailwind.css'` の 1 行で
creo-ui の色を Tailwind utility (`bg-surface` / `text-primary` 等) として使えるようにする。

### Motivation

**v4 で `@theme` の変数名がそのまま名前空間になった**ため、consumer が素朴に書くと循環する:

```css
/* consumer がやりがちな書き方 → 自己参照で色が死ぬ */
@theme inline { --color-surface: var(--color-surface); }
```

creo-ui は canonical 名 (`--color-surface-surface`) を持っているので、**creo-ui 側で
ブリッジを用意すれば罠が消える**。現状 anycreative.tech はこれを 19 行手書きしており、
Tailwind v4 で creo-ui を使う consumer 全員が同じものを書くことになる。

### 調査で確定した事実 (一次情報: tailwindcss 4.3.3 の `theme.css`)

**色は衝突しない。** Tailwind v4 の既定 `--color-*` は数値スケール (`--color-red-500` 等) と
`--color-black` / `--color-white` のみ。creo-ui が使いたい短縮名 (`primary` / `surface` /
`canvas` / `border` / `fg` / `muted` / `success` / `error` / `warning` / `info` / `accent`)
は**すべて空き**。

**衝突するのは radius / shadow / font-weight の 12 個だけ。** 「102 変数が名前空間」という
consumer feedback の数字は名前空間の占有数で、実際に Tailwind の既定値を塗り替えるのは:

| 出どころ | 塗り替える変数 | 影響 |
|---|---|---|
| **tokens.css** | `--radius-xs` (0.125→0.2188rem = 1.75×) / `--radius-xl` (0.75→1.3438rem = 1.79×) / `--shadow-xl` | 3 個。**5 tier の正式名なので改名不能** |
| **token-shim.css** | `--radius-sm/md/lg`、`--shadow-sm/md/lg`、`--font-weight-normal/medium/bold` | 9 個。移行用 alias 由来 |

なお plain `:root` の変数は **utility を増やさない** (v4 は `@theme` 宣言のみが utility を生む)。
起きるのは「同名変数の値を後勝ちで塗り替える」ことだけ。

### Scope

**In Scope**

- `@chronista-club/creo-ui/tailwind.css` を新規 export。中身は `@theme inline { … }` で
  canonical 名を参照する色の bridge
- `docs/migration/from-legacy-css.md` の Tailwind v4 節を実態に合わせて書き直す
  (現在「tokens.css が供給するので `@theme` は空でよい」と書いてあるが**誤り** —
  plain `:root` の変数は utility を生まない)
- **Tailwind v4 consumer は token-shim.css を import しない**ことをガイダンスとして明記
  (9/12 の衝突がこれで消える)
- tokens.css 由来の 3 個 (`--radius-xs` / `--radius-xl` / `--shadow-xl`) は改名できないため、
  README / docs に**衝突一覧を明示**し「素の Tailwind 値に戻したい場合は自分の `@theme` で
  再宣言 (後勝ち)」を案内する

**Out of Scope**

- creo-ui component (`.creo-*`) を Tailwind utility へ書き換えること。component は CSS-only の
  ままで、bridge は token の橋渡しに限る
- `--spacing-*` の bridge。v4 の spacing は `--spacing` 乗数方式で体系が異なる

**Open — owner 判断待ち**

- **bridge に radius / shadow を含めるか** (下記)

### 判断ポイント: bridge に radius / shadow を含めるか

実際に出荷される CSS で並べると差はこうなる。

**案 A — 色だけ**

```css
@theme inline {
  --color-primary:   var(--color-brand-primary);
  --color-surface:   var(--color-surface-surface);
  --color-canvas:    var(--color-surface-bg-base);
  --color-border:    var(--color-surface-border);
  --color-fg:        var(--color-text-primary);
  /* … 色のみ 20 行程度 */
}
```

`bg-surface` `text-primary` は creo-ui に揃うが、**`rounded-lg` は Tailwind 既定 (0.5rem) のまま**。
creo-ui の角丸は `.creo-card` 等の component 経由でのみ得られる。
→ **「utility は Tailwind の語彙、component は creo-ui の語彙」と役割を分ける**思想。

**案 B — radius / shadow も含める**

```css
@theme inline {
  /* 色 (案 A と同じ) … */
  --radius-sm: var(--radius-s);   /* rounded-sm = 4px */
  --radius-md: var(--radius-m);   /* rounded-md = 8px */
  --radius-lg: var(--radius-l);   /* rounded-lg = 17.5px ← 既定の 2.19× */
  --shadow-md: var(--shadow-m);
}
```

Tailwind utility だけで書いた画面も creo-ui の造形に揃う。ただし
**SSOT を改定するたび consumer の角丸が動く**ことを公式に引き受ける
(v0.29.0 の実測改定がそのまま流れる)。

**論点**: creo-ui の radius は `xs/s/m/l/xl` の 5 段、Tailwind は `xs/sm/md/lg/xl/2xl/3xl/4xl`
の 8 段で、**段数も刻みも設計が違う**。5 段を 8 段の器に流すと `rounded-2xl` 以上が
Tailwind 既定のまま取り残され、体系が混ざる。色は creo-ui 側が semantic 名を持つため
この問題が起きない。

### Requirements

- consumer は `@import` 1 行で色 utility を得られること
- bridge が **自己参照で循環しない**こと (canonical 名を参照する)
- token-shim.css と併用しても壊れないこと (両方 `:root` に同名を作るため、順序の影響を確認する)
- 既存 consumer (Tailwind を使わない creo-ui 利用者) に**一切影響しない**こと — 新規 export の追加のみ

---

## DESIGN — データ構造と実装方法

(SPEC 合意後に記入)

---

## GUIDE — 使い方

(DESIGN 後に記入)
