# Input

> Creo UI MVP component. single-line text field (native `<input>`)。

## Purpose

user から最小単位の文字列 / 数値を受け取る atomic input。form の主役。Creo aesthetic では "輪郭の柔らかさ + focus 時のはっきりした意思" を両立させる。

## Anatomy

```
┌─────────────────────────────┐
│  value text                 │  ← padding: spacing.s (vertical) × spacing.m (horizontal)
└─────────────────────────────┘
  ↑
  min-height: layout-target-focus (32px、pointer device) or layout-target-tap (44px、touch)
  border-radius: radius-sm
  font-size: typography-size-md
```

## Props (data attributes / native HTML)

| attr | 値 | default | 意味 |
|---|---|---|---|
| `type` | `text` / `email` / `password` / `number` / `search` / `url` / `tel` | `text` | native HTML input type |
| `data-variant` | `bordered` / `filled` | `bordered` | 視覚的 emphasis |
| `data-size` | `sm` / `md` / `lg` | `md` | 5-step rule 中央 |
| `data-state` | `default` / `error` | `default` | validation state 明示 (aria-invalid と連動) |
| `disabled` / `readonly` / `required` | (boolean) | — | 通常 HTML 属性 |
| `placeholder` | string | — | 通常 HTML 属性 |

## Token reference (DTCG)

| slot | token |
|---|---|
| background (bordered) | `color.surface.surface` |
| background (filled) | `color.surface.surface-muted` |
| border (default) | `color.surface.border` 1px |
| border (focus) | `color.brand.primary` 2px |
| border (error) | `color.semantic.error` 1.5px |
| text | `color.text.primary` |
| placeholder | `color.text.tertiary` |
| font-size (md) | `typography.size.md` |
| font-size (sm) | `typography.size.sm` |
| font-size (lg) | `typography.size.lg` |
| padding (md) | `spacing.s` × `spacing.m` |
| border-radius | `radius.sm` (md), `radius.xs` (sm), `radius.md` (lg) |
| min-height | `layout.target.focus` (sm) / `layout.target.tap` (md/lg) |
| transition | 120ms ease (border-color, background-color, box-shadow) |

## Accessibility

- `<input>` element を使う (見た目だけの `<div contenteditable>` 避ける)
- 必ず `<label for="id">` を関連付ける (implicit でも explicit でも可)
- `required` は native 属性 + 視覚的表示 (label に `*` 等) セット
- error state は `aria-invalid="true"` + `aria-describedby="error-msg"` で error メッセージを関連付ける
- placeholder を label 代わりに使わない (focus 時に消えて context が失われる)
- autocomplete 属性を適切に (`autocomplete="email"`, `"current-password"` 等)

## Do / Don't

### Do
- label をセットで提供
- error state は visual + aria を両方 set
- placeholder は "補足的な例" (`"例: user@example.com"`) に留める
- 数値入力は `type="number"` + `inputmode="numeric"` を併用

### Don't
- label 省略
- error state を色だけで示さない (色覚多様性、`aria-invalid` + icon 併用)
- hardcode px / 色
- size を `--spacing-xs` 等で padding 縮めすぎない (tap target 守る)

## 使用例

```html
<!-- Basic bordered -->
<label for="email">Email</label>
<input id="email" class="creo-input" type="email" placeholder="you@example.com">

<!-- Filled, large -->
<input class="creo-input" type="text" data-variant="filled" data-size="lg">

<!-- Error state -->
<input
  class="creo-input"
  type="text"
  data-state="error"
  aria-invalid="true"
  aria-describedby="pw-err"
>
<p id="pw-err" class="creo-helper-text creo-helper-text--error">パスワードが短すぎます</p>

<!-- Disabled -->
<input class="creo-input" type="text" disabled value="編集できません">
```

## Editor Mode 連携

Input click で `data-variant` / `data-size` / `data-state` chooser が登場。error state の色 (color.semantic.error) の color picker も出せるので色覚チェックもリアルタイム可能。

## 依存 token

- `color.surface.*` / `color.text.*` / `color.brand.primary` / `color.semantic.error`
- `typography.size.*`
- `spacing.*` / `layout.target.*`
- `radius.xs/sm/md`

## 関連

- [Button](./button.md) (form submit)
- [Card](./card.md) (form container)
