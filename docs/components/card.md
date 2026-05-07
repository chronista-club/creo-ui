# Card

> Creo UI MVP component. 関連したコンテンツを視覚的に束ねる container。

## Purpose

関連情報を 1 つの視覚単位として提示する "concept boundary"。Creo aesthetic "柔らかく気持ちいい" を最も体現するのが card — radius / shadow / padding で息遣いを表現する。

## Anatomy

```
┌───────────────────────┐
│                       │  ← padding: spacing.m (default)
│  [title]              │
│  [description / slot] │
│                       │
└───────────────────────┘
  ↑
  radius: radius-md (15px、Creo soft feel)
  background: color-surface-surface
  border: color-surface-border 1px (variant で可変)
```

## Props (data attributes)

| attr | 値 | default | 意味 |
|---|---|---|---|
| `data-variant` | `default` / `elevated` / `outlined` | `default` | 視覚的 lift / emphasis |
| `data-padding` | `sm` / `md` / `lg` | `md` | 内側余白の scale |
| `data-interactive` | `"true"` | — | hover state を有効化 (button/link として使う場合) |

## Token reference (DTCG)

| slot | token |
|---|---|
| background (default) | `color.surface.surface` |
| background (elevated) | `color.surface.surface` + `shadow.md` |
| background (outlined) | `transparent` + `color.surface.border` 1.5px |
| padding (sm) | `spacing.s` |
| padding (md) | `spacing.m` |
| padding (lg) | `spacing.l` |
| border-radius | `radius.md` |
| border (default) | `color.surface.border` 1px |
| gap (title + body) | `layout.gap.tight` |
| transition | 150ms ease (background, shadow, transform) |

## Accessibility

- semantic: content の意味に応じて `<article>` / `<section>` / `<div>` を選ぶ (見た目の card ≠ 必ず article)
- interactive: `data-interactive="true"` 付ける場合は内部に `<button>` / `<a>` を置く、card 自体を button にしない
- keyboard: 内部フォーカス可能要素の `:focus-visible` を尊重
- `role="button"` を card 自体に付けない — ネスト interactive を使う

## Do / Don't

### Do
- default variant を primary な group content に
- elevated を float / modal / popover 様の "前面に浮く" content に
- outlined を軽量な grouping (filter chip group, table row highlight 等) に
- padding を content 密度で選ぶ (dense list → sm、hero feature → lg)

### Don't
- 複数の elevated を同じ面で並べない (shadow が重なって奥行きが崩れる)
- Card の中に Card を深く入れ子にしない (concentric radius で破綻)
- padding を hardcode しない (必ず token)
- interactive card の中に外側 click もさせようとしない (nested interactive の accessibility 崩壊)

## 使用例 (HTML)

```html
<!-- Default -->
<article class="creo-card">
  <h3>Card title</h3>
  <p>説明文</p>
</article>

<!-- Elevated, lg padding (hero) -->
<article class="creo-card" data-variant="elevated" data-padding="lg">
  <h2>Feature</h2>
  <p>...</p>
</article>

<!-- Outlined, interactive (hover) -->
<article class="creo-card" data-variant="outlined" data-interactive="true">
  <a href="#">Open ticket</a>
</article>
```

## Editor Mode 連携

Card click で RIGHT region に `data-variant` chooser / `data-padding` chooser が登場。concentric helper で内部の Button radius が Card radius - padding で自動追従する recipe を将来提供。

## 依存 token

- `color.surface.*`
- `shadow.md`
- `spacing.s/md/lg` + `layout.gap.tight`
- `radius.md`

## 関連

- [Button](./button.md) (card 内 primary action)
- [CREO-87 / CREO-88](https://linear.app/chronista/issue/CREO-87)
