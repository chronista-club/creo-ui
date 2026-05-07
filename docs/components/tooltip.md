# Tooltip

> Creo UI MVP component. hover / focus で小さな補足文を表示する overlay。

## Purpose

要素の意味 / keyboard shortcut / error reason 等の **補足情報** を hover / focus 時に非侵襲的に表示。常時表示では煩雑な情報を on-demand に。

## Classes

| class | role |
|---|---|
| `.creo-tooltip` | wrapper (position: relative、hover 起点) |
| `.creo-tooltip-content` | 実際の tooltip 本体 (absolute positioned、default hidden) |

## Structure

CSS だけで hover / focus 起動、JS 無しで動作 (アクセシブルな wrapper + sibling selector pattern):

```html
<span class="creo-tooltip">
  <button class="creo-btn" data-variant="ghost" data-size="sm" aria-describedby="tt-save">
    💾
  </button>
  <span class="creo-tooltip-content" role="tooltip" id="tt-save">
    Save (⌘S)
  </span>
</span>
```

focus-within または hover で `.creo-tooltip-content` が可視になる。

## Props (data attributes on `.creo-tooltip-content`)

| attr | 値 | default | 意味 |
|---|---|---|---|
| `data-placement` | `top` / `bottom` / `left` / `right` | `top` | 相対位置 |
| `data-variant` | `default` / `inverse` | `default` | 色 tone |

## Token reference

| slot | token |
|---|---|
| bg (default) | `color.surface.bg-emphasis` |
| bg (inverse) | `color.text.primary` |
| text (default) | `color.text.primary` |
| text (inverse) | `color.surface.bg-base` |
| padding | `spacing.xs` × `spacing.s` |
| font-size | `typography.body.caption` (12px) |
| border-radius | `radius.xs` |
| shadow | `shadow.m` |
| offset (from target) | `spacing.xs` |
| transition | 120ms ease (opacity + transform) |
| arrow size | `6px` (optional、:before で実装) |

## Accessibility

- `<button aria-describedby="tooltip-id">` + `<span id="tooltip-id" role="tooltip">` で関連付け必須
- pointer hover だけに頼らず、**keyboard focus でも出す** (:focus-within)
- 長い文章や interactive content は tooltip にしない (→ Popover を別途検討)
- touch device は hover が無いので tap で代替 (または最初から label に書く)

## Do / Don't

### Do
- 1-2 行の補足情報
- icon-only button の label 補足
- keyboard shortcut 表示

### Don't
- tooltip に interactive element (button / link) を入れない
- tooltip に必須情報を入れない (隠れてる情報が primary だと UX 崩壊)
- 長文を入れない (Popover / Dialog を検討)

## 使用例

```html
<!-- icon button + tooltip (最頻) -->
<span class="creo-tooltip">
  <button class="creo-btn" data-variant="ghost" aria-describedby="tt-1">⚙️</button>
  <span class="creo-tooltip-content" role="tooltip" id="tt-1" data-placement="bottom">
    Settings
  </span>
</span>

<!-- inverse variant -->
<span class="creo-tooltip">
  <a href="#" aria-describedby="tt-2">詳細</a>
  <span class="creo-tooltip-content" role="tooltip" id="tt-2" data-variant="inverse">
    外部リンクが開きます
  </span>
</span>
```

## Related

- 長い/interactive content → Popover (0.7.0+ 候補)
- 永続情報 → [Badge](./badge.md)
