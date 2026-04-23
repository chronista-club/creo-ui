# Table

> Creo UI MVP component. 密な 2 次元データの表示。sort / hover / selection のための visual scaffolding を提供 (state 管理は consumer 責務)。

## Purpose

rows × columns の **dense data listing**。Creo の aesthetic に合わせ、zebra より hairline divider、hover で行ハイライト、selection は radio/checkbox で明示、を基調とする。

## Classes

| class | role |
|---|---|
| `.creo-table` | `<table>` base style (border-collapse + radius) |
| `.creo-table-head` / `.creo-table-body` | `<thead>` / `<tbody>` の semantic wrapper |
| `.creo-table-row` | `<tr>` (hover / selected state) |
| `.creo-table-cell` | `<td>` / `<th>` (padding + typography) |
| `.creo-table-sortable` | sortable column (chevron icon + cursor) |

## Structure

```html
<table class="creo-table" data-size="md" data-variant="default">
  <thead class="creo-table-head">
    <tr class="creo-table-row">
      <th class="creo-table-cell creo-table-sortable" scope="col" aria-sort="ascending">
        Name
      </th>
      <th class="creo-table-cell creo-table-sortable" scope="col" aria-sort="none">Created</th>
      <th class="creo-table-cell" scope="col">Tags</th>
      <th class="creo-table-cell" scope="col" style="width: 80px"></th>
    </tr>
  </thead>
  <tbody class="creo-table-body">
    <tr class="creo-table-row" data-selected="true">
      <td class="creo-table-cell">Memory A</td>
      <td class="creo-table-cell">2026-04-22</td>
      <td class="creo-table-cell">
        <span class="creo-badge" data-variant="brand" data-size="sm">design</span>
      </td>
      <td class="creo-table-cell">
        <button class="creo-btn" data-variant="ghost" data-size="sm">⋯</button>
      </td>
    </tr>
    <tr class="creo-table-row">
      <td class="creo-table-cell">Memory B</td>
      <td class="creo-table-cell">2026-04-21</td>
      <td class="creo-table-cell">—</td>
      <td class="creo-table-cell">
        <button class="creo-btn" data-variant="ghost" data-size="sm">⋯</button>
      </td>
    </tr>
  </tbody>
</table>
```

## Props

| attr on `.creo-table` | 値 | default | 意味 |
|---|---|---|---|
| `data-size` | `sm` / `md` / `lg` | `md` | row の padding / font-size |
| `data-variant` | `default` / `striped` / `bordered` | `default` | zebra / outline 有無 |
| `data-sticky-head` | `true` | — | thead を sticky (scrollable container 前提) |

| attr on `.creo-table-row` | 値 | 意味 |
|---|---|---|
| `data-selected` | `true` | 選択状態 (brand tint) |
| `data-disabled` | `true` | disabled (opacity + cursor) |

| attr on `.creo-table-cell` | 値 | 意味 |
|---|---|---|
| `data-align` | `start` / `center` / `end` | text-align |

## Sort indicator

`<th>` に `creo-table-sortable` class + `aria-sort="ascending" | "descending" | "none"` を付ける。CSS で `::after` に chevron を絵柄で付与 (↕ / ▲ / ▼)。

## Token reference

| slot | token |
|---|---|
| border-collapse | separate (radius で丸めるため) |
| table border-radius | `radius.md` |
| table border | `color.surface.border` 1px |
| head bg | `color.surface.bg-subtle` |
| head text | `color.text.secondary` |
| head font-weight | `weight.medium` |
| head letter-spacing | `0.02em` |
| cell padding (md) | `spacing.sm` × `spacing.md` |
| row hover bg | `color.surface.bg-subtle` |
| row selected bg | `color.brand.primary-subtle` |
| divider | `color.surface.border-subtle` 1px |
| sort chevron color | `color.text.tertiary` |
| sort active color | `color.brand.primary` |

## Accessibility

- semantic `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<th>` / `<td>` — ARIA 追加不要
- column header に `scope="col"`、row header に `scope="row"`
- sortable は `aria-sort="ascending" | "descending" | "none"` を JS で toggle
- sticky head は focus flow に影響しない (`position: sticky` 推奨)
- 読み上げ: `<caption>` 有ると良い (spec 省略、consumer が追加可能)

## Do / Don't

### Do
- dense data (list / table of records) に使う
- action column は末尾に、button は `ghost` size sm で compact に
- 10 rows 超なら `data-sticky-head` + 縦 scroll container に入れる
- 50 rows 超は pagination / virtualization を consumer 側で

### Don't
- 2 column 以下の "key-value" 表示に table 使わない (<dl> or list)
- 複雑な formlayout に table を hacky に使わない (<div grid> 推奨)
- row 全体 clickable にするなら double-click / primary action の明示を

## Related

- [Badge](./badge.md) (tag cell)
- [Button](./button.md) (action column、ghost size sm)
- [Menu](./menu.md) (⋯ menu pattern)
- Pagination / Virtual list は **別 issue** (0.8.0+)
