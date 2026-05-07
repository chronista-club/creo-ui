# Pagination

> Creo UI MVP component. 長いリスト / Table の **ページ分割** navigation。

## Purpose

大量 data を n 件ずつ page 分割して navigate。Table と組み合わせてよく使う。

## Classes

| class | role |
|---|---|
| `.creo-pagination` | `<nav>` wrapper |
| `.creo-pagination-list` | ol (or ul) list |
| `.creo-pagination-item` | 各 button / link |
| `.creo-pagination-ellipsis` | `⋯` (省略) |

## Structure

```html
<nav class="creo-pagination" aria-label="Pagination">
  <button class="creo-pagination-item" data-action="prev" aria-label="前のページ">‹</button>
  <ol class="creo-pagination-list">
    <li>
      <button class="creo-pagination-item" aria-label="1 ページ">1</button>
    </li>
    <li>
      <button class="creo-pagination-item" aria-label="2 ページ" aria-current="page">2</button>
    </li>
    <li>
      <button class="creo-pagination-item" aria-label="3 ページ">3</button>
    </li>
    <li>
      <span class="creo-pagination-ellipsis" aria-hidden="true">⋯</span>
    </li>
    <li>
      <button class="creo-pagination-item" aria-label="42 ページ">42</button>
    </li>
  </ol>
  <button class="creo-pagination-item" data-action="next" aria-label="次のページ">›</button>
</nav>
```

## Props

| attr on `.creo-pagination` | 値 | default | 意味 |
|---|---|---|---|
| `data-size` | `s` / `m` / `l` | `m` | button size |
| `data-variant` | `default` / `compact` | `default` | compact は page 番号間の gap が詰め |

## Token reference

| slot | token |
|---|---|
| item (default) bg | `transparent` |
| item (active) bg | `color.brand.primary` |
| item (active) text | `color.surface.bg-base` |
| item text | `color.text.secondary` |
| item hover bg | `color.surface.bg-subtle` |
| item min-size (md) | `layout.target.focus` (32pt) |
| item min-size (sm) | 24px |
| item min-size (lg) | `layout.target.tap` (44pt) |
| border-radius | `radius.s` |
| gap | `spacing.xs` (default) / 0 (compact) |
| font-size (md) | `typography.size.m` |

## Accessibility

- `<nav aria-label="Pagination">`
- `<ol>` で順序 semantic (`<ul>` でも可、ただし順序が意味を持つので ol 推奨)
- prev/next button に `aria-label="前のページ"` / `"次のページ"`
- 現在 page に `aria-current="page"`
- ellipsis は `aria-hidden="true"` (装飾)

## Do / Don't

### Do
- 10 page 超える listing で
- 前後 button + 先頭/末尾 + 隣接 page 番号 + ellipsis の組合せ
- keyboard Tab で全 button に focus 可能

### Don't
- item 数が少ない (5 page 以下) 時に出さない — 全 page 番号列挙でよい
- infinity scroll の代替に無理に Pagination 使わない

## Related

- [Table](./table.md) — pagination のメイン consumer
- Virtual list (0.9.0+) — 無限大の dataset は scroll 化
