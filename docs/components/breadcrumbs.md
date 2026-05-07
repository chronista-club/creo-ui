# Breadcrumbs

> Creo UI MVP component. 階層ナビゲーションのための trail UI。

## Purpose

深い階層の現在地を示し、上位 context に一気に戻れる。File tree / Atlas / project hierarchy で頻出。

## Classes

| class | role |
|---|---|
| `.creo-breadcrumbs` | `<nav>` wrapper |
| `.creo-breadcrumbs-list` | `<ol>` list |
| `.creo-breadcrumbs-item` | `<li>` item |
| `.creo-breadcrumbs-link` | `<a>` link (hover + active) |
| `.creo-breadcrumbs-separator` | separator (→ / › / / 等、::after で挿入) |

## Structure

semantic HTML + ARIA 標準:

```html
<nav class="creo-breadcrumbs" aria-label="Breadcrumb">
  <ol class="creo-breadcrumbs-list">
    <li class="creo-breadcrumbs-item">
      <a class="creo-breadcrumbs-link" href="/">Home</a>
    </li>
    <li class="creo-breadcrumbs-item">
      <a class="creo-breadcrumbs-link" href="/projects">Projects</a>
    </li>
    <li class="creo-breadcrumbs-item">
      <a class="creo-breadcrumbs-link" href="/projects/creo-ui">creo-ui</a>
    </li>
    <li class="creo-breadcrumbs-item" aria-current="page">
      <span class="creo-breadcrumbs-link">Overview</span>
    </li>
  </ol>
</nav>
```

## Props

| attr on `.creo-breadcrumbs` | 値 | default | 意味 |
|---|---|---|---|
| `data-size` | `sm` / `md` | `md` | text size |
| `data-separator` | `chevron` / `slash` / `dot` | `chevron` | 区切り symbol |

## Token reference

| slot | token |
|---|---|
| wrapper font-size (md) | `typography.size.s` |
| wrapper font-size (sm) | `typography.size.xs` |
| link (default) | `color.text.secondary` |
| link (hover) | `color.text.primary` |
| current page | `color.text.primary` + `weight.medium` |
| separator color | `color.text.tertiary` |
| separator margin | `spacing.xs` |
| link padding | `spacing.xs` × 0 |

## Accessibility

- `<nav aria-label="Breadcrumb">` で role 明示
- `<ol>` で順序 semantic
- 現在位置に `aria-current="page"` — 最後の item は link にしない (static text)

## Do / Don't

### Do
- 3 階層以上の深さで使う (2 階層なら不要)
- 必ず "現在位置" で終わる (最後は span、前段は a)
- truncate で長くなりすぎないよう (max-width + ellipsis)

### Don't
- wizard / step では使わない (→ Stepper)
- 現在位置を link にしない (a11y 誤誘導)
- 横 scroll 発生させない (responsive で短縮 `...` 推奨)

## Related

- [Header](./header.md) (breadcrumbs は header or page top)
- [Stepper] (0.9.0+ 候補) — 工程進行、breadcrumbs とは違う
