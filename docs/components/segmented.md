# Segmented control

> creoui MVP component. 2-4 個の排他選択肢を横並びで表示する compact UI。

## Purpose

Tabs に似てるが意味が違う — Segmented control は **setting / filter / mode switch** 用 (例: "Day / Week / Month" / "List / Grid" / "Draft / Published")。Tabs は "view 切替 with tabpanel"、Segmented は "state 値の選択"。

## Classes

| class | role |
|---|---|
| `.creo-segmented` | wrapper (border + bg) |
| `.creo-segmented-option` | 各選択肢 (button or radio input) |

## Structure

推奨 2 パターン:

### A. Button group (即時 state 切替、JS 制御)

```html
<div class="creo-segmented" role="group" aria-label="View mode">
  <button class="creo-segmented-option" aria-pressed="true" type="button">List</button>
  <button class="creo-segmented-option" aria-pressed="false" type="button">Grid</button>
  <button class="creo-segmented-option" aria-pressed="false" type="button">Timeline</button>
</div>
```

### B. Radio group (form submission、aria で native 排他)

```html
<div class="creo-segmented" role="radiogroup" aria-label="Range">
  <label class="creo-segmented-option">
    <input type="radio" name="range" value="day" checked>
    <span>Day</span>
  </label>
  <label class="creo-segmented-option">
    <input type="radio" name="range" value="week">
    <span>Week</span>
  </label>
</div>
```

## Props

| attr on `.creo-segmented` | 値 | default | 意味 |
|---|---|---|---|
| `data-size` | `s` / `m` / `l` | `m` | height |
| `data-width` | `fit` / `full` | `fit` | 幅モード |

## Token reference

| slot | token |
|---|---|
| wrapper bg | `color.surface.bg-subtle` |
| wrapper border | `color.surface.border` 1px |
| wrapper padding | `spacing.xs` |
| wrapper border-radius | `radius.m` |
| option padding | `spacing.xs` × `spacing.m` |
| option border-radius | `radius.s` |
| option font-size (md) | `typography.size.m` |
| option text (default) | `color.text.secondary` |
| option text (hover) | `color.text.primary` |
| option text (active/pressed) | `color.brand.primary` |
| option bg (active) | `color.surface.surface` |
| active shadow | `shadow.s` (subtle lift) |
| transition | 150ms ease |

## Accessibility

- Button group: `role="group"` + `aria-pressed="true"` で active 表現
- Radio group: `role="radiogroup"` + `<input type="radio">` で native 排他 + Arrow key navigation (browser が自動)
- disabled: native `disabled` 属性

## Do / Don't

### Do
- 2-4 option (5+ は Select / Dropdown 検討)
- label は 1-2 単語
- 即時反映の UI (submit 無し)

### Don't
- Tabs の代わりに Segmented を使わない (Tabs は panel 付属、Segmented は値のみ)
- 5 option 以上を並べない
- 長い label を混ぜない (幅が不揃いで操作性低下)

## 関連

- [Tabs](./tabs.md) (view 切替 with panel)
- [Form controls Radio](./form-controls.md) (垂直 radio group)
