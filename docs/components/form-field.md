# FormField

> Creo UI utility component. label + input + helper-text を bundle する minimal wrapper。

## Purpose

form field 1 単位 (label / input / 補助文) を垂直 stack で揃えるのは form UI の頻出パターン。component ではなく **class utility** として provide する (structure は consumer が組む、CSS は Creo が担う)。

## Anatomy

```
┌──────────────┐
│ label        │  ← label-helper: body.helper サイズ
│ ┌──────────┐ │
│ │  input   │ │  ← spacing.xs で label と繋げる
│ └──────────┘ │
│ helper text  │  ← spacing.xs で input と繋げる、body.caption サイズ
└──────────────┘
  ↑
  form-field wrapper: display: grid; gap: spacing.xs
```

## Classes

| class | role |
|---|---|
| `.creo-form-field` | wrapper (grid + gap: spacing.xs) |
| `.creo-form-field-label` | label (font-size: body.helper + weight.medium) |
| `.creo-helper-text` | 補助文 (既 Input 由来、body.caption + text.tertiary) |
| `.creo-helper-text--error` | error 色 variant |
| `.creo-form-field-required::after` | required マーク `*` 付与 (label に付ける modifier) |

## Token reference

| slot | token |
|---|---|
| wrapper gap | `spacing.xs` |
| label font-size | `typography.body.helper` (14px) |
| label weight | `typography.weight.medium` |
| label color | `color.text.primary` |
| helper font-size | `typography.body.caption` (12px) |
| helper color (default) | `color.text.tertiary` |
| helper color (error) | `color.semantic.error` |
| required * color | `color.semantic.error` |

## 使用例

```html
<!-- Basic -->
<div class="creo-form-field">
  <label class="creo-form-field-label" for="email">Email</label>
  <input class="creo-input" id="email" type="email" required>
  <p class="creo-helper-text">login に使います</p>
</div>

<!-- Required + error -->
<div class="creo-form-field">
  <label
    class="creo-form-field-label creo-form-field-required"
    for="pw"
  >
    Password
  </label>
  <input
    class="creo-input"
    id="pw"
    type="password"
    data-state="error"
    aria-invalid="true"
    aria-describedby="pw-err"
  >
  <p class="creo-helper-text creo-helper-text--error" id="pw-err">
    8 文字以上必要です
  </p>
</div>

<!-- form の group -->
<form>
  <div class="creo-form-field">...</div>
  <div class="creo-form-field" style="margin-top: var(--spacing-md)">...</div>
</form>
```

## Accessibility

- `<label for="id">` を `<input id="id">` に関連付ける
- helper-text は `aria-describedby="helper-id"` で input に link
- error state は helper-text に id を振って、input の `aria-describedby` に設定
- required は visual (`*`) + `required` attribute + 必要なら `aria-required="true"` (native `required` が優先)

## Related

- [Input](./input.md) — form-field の中心
- [Button](./button.md) — form submit
