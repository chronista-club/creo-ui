# Badge

> creoui MVP component. 状態 / 数値 / カテゴリの小さな pill 表示。

## Purpose

Item の **status / count / tag** を視覚的 accent として pill 形状で表現。icon と組み合わせたり、Avatar の横に付けたり。

## Props

| attr on `.creo-badge` | 値 | default | 意味 |
|---|---|---|---|
| `data-variant` | `neutral` / `success` / `warning` / `error` / `info` / `brand` | `neutral` | 色 tone |
| `data-size` | `s` / `m` | `m` | height |
| `data-shape` | `pill` / `square` | `pill` | 形 |

## Token reference

| slot (variant) | background | text |
|---|---|---|
| neutral | `color.surface.bg-subtle` | `color.text.secondary` |
| brand | `color.brand.primary-subtle` | `color.brand.primary` |
| success | `color.semantic-success` 20% | `color.semantic-success` |
| warning | `color.semantic-warning` 20% | `color.semantic-warning` |
| error | `color.semantic-error` 20% | `color.semantic-error` |
| info | `color.semantic-info` 20% | `color.semantic-info` |

## その他 token

| slot | token |
|---|---|
| font-size (sm) | `typography.size.xs` |
| font-size (md) | `typography.size.s` |
| padding horizontal | `spacing.xs` |
| padding vertical | 2px |
| border-radius (pill) | `radius.full` |
| border-radius (square) | `radius.xs` |
| line-height | 1 |

## 使用例

```html
<span class="creo-badge" data-variant="success">Active</span>
<span class="creo-badge" data-variant="error">Failed</span>
<span class="creo-badge" data-variant="brand">New</span>
<span class="creo-badge" data-variant="neutral" data-size="s">12</span>

<!-- Inline with text -->
<h3>Settings <span class="creo-badge" data-variant="info" data-size="s">Beta</span></h3>

<!-- Count (numeric) -->
<button class="creo-btn" data-variant="ghost">
  通知 <span class="creo-badge" data-variant="error" data-size="s">3</span>
</button>
```

## Accessibility

- status を色だけで示さない (変種が色+文字両方なら OK)
- count (数値) の badge は `aria-label` で文脈を補足 (例: `aria-label="3 件の未読通知"`)
- inline badge は周囲 text と semantic が明確なら追加 aria 不要

## Related

- [Avatar](./avatar.md) + `.creo-avatar-status` (persistent status dot、badge ではない)
