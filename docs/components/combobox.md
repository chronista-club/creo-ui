# Combobox (native `<input> + <datalist>`)

> Creo UI MVP component. input + 候補 list の組合せ。native `<input list="...">` + `<datalist>` で JS 最小。

## Purpose

user が自由入力しつつ、候補からも選べる pattern。tag 入力 / search suggestion / email domain autocomplete 等で頻出。

## Structure

HTML native の `<datalist>` を使うと、browser が autocomplete dropdown を自動表示:

```html
<label class="creo-form-field-label" for="tag-input">Tag</label>
<input
  class="creo-input creo-combobox"
  list="tags-list"
  id="tag-input"
  type="text"
  placeholder="Type or pick a tag"
  autocomplete="off"
>
<datalist id="tags-list">
  <option value="design"></option>
  <option value="engineering"></option>
  <option value="ops"></option>
  <option value="product"></option>
</datalist>
```

- user タイプ時、browser は `<datalist>` 内 `<option>` から **substring match で suggestion** を表示
- user は typed 値 (自由入力) も option (確定選択) も取れる
- ARIA role は native (`<input>` が自動で `combobox` behavior)

## Props

Native `<input>` の属性がそのまま使える:
- `list="datalist-id"` で候補 link
- `placeholder` / `required` / `pattern` 等
- `.creo-input` の全 variant (bordered/filled × s/m/l × error state) が適用可能

`.creo-combobox` は `<input>` に追加する modifier class。右端に chevron icon を自動付与する visual cue。

## Token reference

`.creo-input` と同じ token を使用。追加で:

| slot | token |
|---|---|
| chevron icon | `▾` (CSS content)、`color.text.tertiary` |
| chevron position | right: `spacing.s`、vertical center |
| padding-right (for chevron room) | `spacing.xl` |

## Accessibility

- native `<input list>` は **自動で combobox ARIA** を提供 (role="combobox" 自動)
- `<label for="id">` 必須
- 長い list はあくまで autocomplete 補助 (Select よりも自由入力優先のケース向き)

## Native datalist の制約

- Safari / mobile で styling がほぼできない (browser 側 UI)
- カスタム rich dropdown が欲しいなら 別途 JS combobox (0.12.0+ 候補) を consumer で実装
- value + label 分離ができない (option の `value` のみ)

## Do / Don't

### Do
- 候補が 5-30 件の free-form 入力
- suggestion + free text 両方許容する use case

### Don't
- 固定選択肢のみなら Select (`<select>`) 推奨
- rich dropdown 必要なら consumer JS combobox
- label の分離 (display ≠ value) が必要なら datalist では不可

## 使用例: email domain autocomplete

```html
<div class="creo-form-field">
  <label class="creo-form-field-label" for="email">Email</label>
  <input
    class="creo-input creo-combobox"
    list="email-domains"
    id="email"
    type="email"
    placeholder="you@..."
  >
  <datalist id="email-domains">
    <option value="@gmail.com"></option>
    <option value="@icloud.com"></option>
    <option value="@chronista.club"></option>
  </datalist>
</div>
```

## Related

- [Input](./input.md) (base input styling)
- [FormField](./form-field.md) (label + helper 束ね)
- Future: rich JS combobox (0.12.0+ 候補)
