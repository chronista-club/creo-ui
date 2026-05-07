# Form controls: Checkbox / Radio / Switch

> Creo UI MVP form primitives。native HTML `<input>` を Creo token で整えた minimal styling。

## Purpose

form 内の boolean / 選択肢入力。native `<input>` + `accent-color` で最小化し、switch (native 非対応) のみ custom styling。

## Classes

| class | role |
|---|---|
| `.creo-checkbox` / `.creo-radio` | label wrapper (horizontal inline、gap: layout-gap-tight) |
| `.creo-switch` | switch wrapper (track + thumb + label) |
| `.creo-checkbox-input` / `.creo-radio-input` / `.creo-switch-input` | native input (accent-color set) |

## Usage (HTML)

```html
<!-- Checkbox -->
<label class="creo-checkbox">
  <input type="checkbox" class="creo-checkbox-input" checked>
  <span>Email 通知を受け取る</span>
</label>

<!-- Radio group -->
<fieldset>
  <legend class="creo-form-field-label">テーマ</legend>
  <label class="creo-radio">
    <input type="radio" name="theme" value="mint-dark" class="creo-radio-input" checked>
    <span>Mint Dark</span>
  </label>
  <label class="creo-radio">
    <input type="radio" name="theme" value="sora-dark" class="creo-radio-input">
    <span>Sora Dark</span>
  </label>
</fieldset>

<!-- Switch (toggle style checkbox) -->
<label class="creo-switch">
  <input type="checkbox" class="creo-switch-input" checked>
  <span class="creo-switch-track" aria-hidden="true">
    <span class="creo-switch-thumb"></span>
  </span>
  <span>Editor Mode</span>
</label>
```

## Token reference

| slot | token |
|---|---|
| accent-color (checkbox/radio) | `color.brand.primary` |
| gap (wrapper) | `layout.gap.tight` |
| font-size (label) | `typography.size.m` |
| switch track (off) | `color.surface.bg-subtle` |
| switch track (on) | `color.brand.primary` |
| switch thumb | `color.surface.surface` |
| switch size | `44×24` (md、`layout.target.tap` 幅) |
| focus ring | `color.brand.primary` 2px offset |
| disabled opacity | 0.5 |

## Accessibility

- `<input type="checkbox">` / `<input type="radio">` は native で ARIA 完備
- label を必ず `<label>` で wrap (click target 拡大 + semantic 関連付け)
- switch は native `<input type="checkbox">` + role="switch" を input に付与推奨 (一部 screen reader で "checkbox" ではなく "switch" と読む)
- keyboard: Space でトグル、Arrow で radio group 移動 (native 挙動)
- disabled は native attribute

## Do / Don't

### Do
- Checkbox = 複数選択可、Radio = 排他選択、Switch = 即時トグル (設定系)
- Radio は fieldset + legend でグループ化
- Switch は on/off の label を明記 (片方だけの label は曖昧)

### Don't
- Checkbox と Switch の使い分けを曖昧にしない (Checkbox = form 提出時に反映、Switch = 即時反映)
- hardcode 色 (accent-color を token に)

## 関連

- [FormField](./form-field.md) (label + control 束ね)
- [Button](./button.md) (form submit)
