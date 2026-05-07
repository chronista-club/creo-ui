# Avatar

> Creo UI MVP component. ユーザー / 主体 / アイテムの視覚表現。image or initials fallback。

## Purpose

user / account / project 等の visual identity を **小さな円形 (または rounded square) に凝縮** する token。list / header / comment thread で頻出。

## Classes

| class | role |
|---|---|
| `.creo-avatar` | wrapper (circle / square 選択可) |
| `.creo-avatar-image` | `<img>` 要素 (optional、fallback 用に initials span と併存可) |
| `.creo-avatar-initials` | 画像なし時の 1-2 文字 fallback |
| `.creo-avatar-status` | 右下の status dot (online/busy/offline 等) |

## Props

| attr on `.creo-avatar` | 値 | default | 意味 |
|---|---|---|---|
| `data-size` | `sm` / `md` / `lg` / `xl` | `md` | diameter |
| `data-shape` | `circle` / `square` | `circle` | 形 |

## Token reference

| slot | token |
|---|---|
| diameter (sm) | `24px` |
| diameter (md) | `32px` |
| diameter (lg) | `44px` (= tap target) |
| diameter (xl) | `64px` |
| bg (initials fallback) | `color.brand.primary-subtle` |
| color (initials) | `color.text.primary` |
| font-size (initials md) | `typography.size.s` |
| border (square variant) | `radius.s` |
| status dot size | `25% of diameter` |
| status dot border | `color.surface.surface` 2px (背景との区切り) |

## 使用例

```html
<!-- Image -->
<span class="creo-avatar">
  <img class="creo-avatar-image" src="/mako.jpg" alt="Mako" />
</span>

<!-- Initials fallback -->
<span class="creo-avatar">
  <span class="creo-avatar-initials" aria-label="Mako">M</span>
</span>

<!-- With status dot (online) -->
<span class="creo-avatar" data-size="lg">
  <img class="creo-avatar-image" src="..." alt="User">
  <span class="creo-avatar-status" data-status="online" aria-hidden="true"></span>
</span>

<!-- Square, xl -->
<span class="creo-avatar" data-shape="square" data-size="xl">
  <img class="creo-avatar-image" src="...">
</span>
```

## Accessibility

- `<img>` には必ず `alt` 属性
- initials fallback は `aria-label` で name を暗黙化 (M だけでは読まない)
- status dot は装飾なので `aria-hidden="true"`、状態は別途 text で伝える (e.g., `<span class="visually-hidden">オンライン</span>`)

## Related

- [Badge](./badge.md) — number/status 的な counter は Badge
