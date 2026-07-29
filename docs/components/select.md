# Select

native `<select>` の styled wrapper。単一選択の dropdown を `.creo-input` と同じ
form field の声で提供します。dropdown の中身 (option list) は browser native —
keyboard 操作 / a11y / mobile の picker UI は OS に任せます。

site header の theme switcher で先行していた「wrapper + 自前 arrow」の形を
component 化したものです (それまで select は `.creo-input` の見た目を流用していた)。

## Purpose

- form / toolbar での **単一選択** (theme 切替、locale、sort order、filter 等)
- 選択肢が固定リストで、検索が不要な規模 (目安 ~15 件)
- 検索付きが欲しいなら [Combobox](./combobox.md)、action list なら [Menu](./menu.md)

## Anatomy

```html
<span class="creo-select">
  <select class="creo-select-input">
    <option value="mint-dark">Creo (dark)</option>
    <option value="mint-light">Creo (light)</option>
  </select>
</span>
```

- `.creo-select` — wrapper。arrow (::after) の描画基準 + size 変数の持ち主。
  `<select>` は replaced element で pseudo-element を持てないため、checkbox /
  radio と同じ 2 要素構成
- `.creo-select-input` — native `<select>` 本体。`appearance: none` で native arrow
  を消し、見た目は input.css と同語彙 (surface + border + radius)

## Props (data attributes — wrapper 側に付ける)

| attr | 値 | default | 意味 |
|---|---|---|---|
| `data-variant` | `bordered` / `filled` | `bordered` | filled = borderless の recessed well (input と同語彙) |
| `data-size` | `s` / `m` / `l` | `m` | 5 tier convention 中央の m が標準 |
| `data-width` | `fit` / `full` | `fit` | fit = 内容幅 (toolbar 向き) / full = 全幅 (form 向き、segmented と同語彙) |
| `data-state` | `error` | — | error 枠。`<select aria-invalid="true">` でも同じ表現 |
| `disabled` | (boolean、select 側) | — | native。wrapper の arrow も `:has()` で減光 |

## Token reference (DTCG)

| slot | token |
|---|---|
| background | `color.surface.surface` / filled は `--surface-veil-1` + `--elevation-well` |
| border | `color.surface.border` 1px / error は `color.semantic.error` 1.5px |
| arrow | `color.text.tertiary` (hover で `text.secondary`) |
| padding | `spacing.{xs/s/m}` × `spacing.{s/m/l}` + arrow の逃げ 14px |
| min-height | `layout.target.tap` (m) / `focus` (s) / tap×1.15 (l) — density scale 追従 |
| radius | `radius.{xs/s/m}` |
| focus | `_focus.css` policy (`.creo-select-input` が :where list に登録済み) |

## Accessibility

- semantic: native `<select>` を使う (listbox の再発明をしない)
- label: `<label>` で包むか `aria-label` / `aria-labelledby` を必ず付ける
- keyboard: ↑↓ / typeahead / Enter — すべて browser native
- error: `aria-invalid="true"` を select 側に付ける (見た目も連動)
- focus ring: keyboard-only (`:focus-visible`)、mouse focus は border 色変化のみ

## Do / Don't

### Do
- toolbar の compact な切替は `data-size="s"` (header の theme switcher が実例)
- form 内では `data-width="full"` + FormField で label / helper を積む
- 選択肢の並びは意味順 (頻度順・アルファベット順など、意図を持って)

### Don't
- `multiple` / `size` 属性の listbox 表示に使わない (この CSS は単一行 dropdown 前提)
- option が数十件を超えるなら Combobox (検索付き) を検討
- 「選ぶと即座に危険な操作が走る」用途に使わない (それは Menu + 確認 dialog の領分)

## 使用例

```html
<!-- toolbar (header の theme switcher) -->
<label>
  <span class="visually-hidden">Theme</span>
  <span class="creo-select" data-size="s">
    <select class="creo-select-input">…</select>
  </span>
</label>

<!-- form -->
<div class="creo-form-field">
  <label class="creo-form-field-label" for="tz">Timezone</label>
  <span class="creo-select" data-width="full">
    <select class="creo-select-input" id="tz">…</select>
  </span>
</div>

<!-- error -->
<span class="creo-select" data-width="full">
  <select class="creo-select-input" aria-invalid="true">…</select>
</span>
```

## 関連

- [Input](./input.md) — 同じ form field 語彙 (variant / size / state)
- [Combobox](./combobox.md) — 検索付き選択
- [Menu](./menu.md) — action list (選択の永続化ではなく実行)
