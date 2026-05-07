# Accordion / Disclosure

> Creo UI MVP component. native `<details>` + `<summary>` で expandable/collapsible な group。

## Purpose

長い情報を **section に分けて折りたたみ**、user が必要な時だけ開く。FAQ / setting panel / advanced options 等で頻出。

## Classes

| class | role |
|---|---|
| `.creo-accordion` | `<details>` wrapper |
| `.creo-accordion-summary` | `<summary>` 内側 (title + chevron) |
| `.creo-accordion-title` | title span |
| `.creo-accordion-content` | expanded body (summary 以降の sibling content) |

## Structure (native details/summary)

```html
<details class="creo-accordion">
  <summary class="creo-accordion-summary">
    <span class="creo-accordion-title">Advanced options</span>
  </summary>
  <div class="creo-accordion-content">
    <p>ここに詳細設定が入る</p>
    <!-- 任意の内部 component (FormField / Input / Button 等) -->
  </div>
</details>

<!-- Open by default -->
<details class="creo-accordion" open>
  <summary class="creo-accordion-summary">
    <span class="creo-accordion-title">常に開いた状態</span>
  </summary>
  <div class="creo-accordion-content">...</div>
</details>
```

## Props

| attr on `.creo-accordion` | 値 | default | 意味 |
|---|---|---|---|
| `data-variant` | `default` / `bordered` / `subtle` | `default` | outline の強度 |
| `open` | boolean (native) | — | 最初から展開 |

## Token reference

| slot | token |
|---|---|
| wrapper bg (bordered) | `color.surface.surface` |
| wrapper border | `color.surface.border` 1px |
| wrapper padding | `spacing.s` × `spacing.m` |
| border-radius | `radius.s` |
| summary min-height | `layout.target.tap` |
| title font-size | `typography.size.m` |
| title weight | `typography.weight.medium` |
| chevron | `▸` rotate 90° when open |
| content padding-top | `spacing.s` |
| transition | 180ms ease |

## Accessibility

- `<details>` / `<summary>` は **native で ARIA 完備** (Tab focus / Enter-Space で toggle / aria-expanded 自動)
- 追加 aria 不要、ただし `<summary>` 内に heading 階層を意識して
- group (複数の details を単一行に束ねる) で排他にしたい場合は JS で click handler 追加 (`name=` 属性は新し目、対応限定)

## Do / Don't

### Do
- long form / FAQ / advanced settings で活用
- 各 section は独立して完結する情報
- `open` attribute で初期状態を意図的に

### Don't
- critical 情報を default 閉じない (accordion 内に隠れた primary info はユーザー見逃す)
- 深い入れ子 (3 段以上) にしない
- chrome text (メニュー等の navigation) として使わない

## 使用例: FAQ

```html
<section>
  <details class="creo-accordion">
    <summary class="creo-accordion-summary">
      <span class="creo-accordion-title">What is Creo UI?</span>
    </summary>
    <div class="creo-accordion-content">
      <p>Design system shared across Web / Swift / Rust...</p>
    </div>
  </details>

  <details class="creo-accordion">
    <summary class="creo-accordion-summary">
      <span class="creo-accordion-title">How to install?</span>
    </summary>
    <div class="creo-accordion-content">
      <pre><code>bun add creo-ui-web</code></pre>
    </div>
  </details>
</section>
```

## Related

- [Tabs](./tabs.md) — 排他的な view 切替
- [Dialog](./dialog.md) — 重要情報は overlay で前面に
