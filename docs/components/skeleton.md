# Skeleton loader

> Creo UI MVP component. data fetch 中の **placeholder** (shape だけ出して文字は伏せる loading)。

## Purpose

content が loading 中に **空白 / Spinner より構造が想像できる** placeholder を出すことで、user に "何が来るか" の期待値を与える。fetch 時間を体感的に短く感じさせる UX 効果。

## Classes

| class | role |
|---|---|
| `.creo-skeleton` | shape + shimmer animation を適用する span/div |

## Props

| attr | 値 | default | 意味 |
|---|---|---|---|
| `data-shape` | `text` / `rect` / `circle` | `rect` | 形 |
| `data-size` | `sm` / `md` / `lg` | `md` | 高さ / 太さ (text / circle) |

## Structure

```html
<!-- Text lines -->
<div>
  <span class="creo-skeleton" data-shape="text" style="width: 60%"></span>
  <span class="creo-skeleton" data-shape="text" style="width: 80%"></span>
  <span class="creo-skeleton" data-shape="text" style="width: 40%"></span>
</div>

<!-- Avatar + text (card style) -->
<div style="display:flex; gap: var(--spacing-s); align-items: center">
  <span class="creo-skeleton" data-shape="circle" data-size="lg"></span>
  <div style="flex:1">
    <span class="creo-skeleton" data-shape="text" style="width: 50%"></span>
    <span class="creo-skeleton" data-shape="text" style="width: 80%"></span>
  </div>
</div>

<!-- Rectangle (image placeholder) -->
<span class="creo-skeleton" data-shape="rect" style="width: 200px; height: 120px"></span>
```

## Token reference

| slot | token |
|---|---|
| bg (base) | `color.surface.bg-subtle` |
| bg (shimmer) | `color.surface.bg-emphasis` |
| border-radius (rect) | `radius.sm` |
| border-radius (text) | `radius.xs` |
| text height (sm/md/lg) | 12px / 16px / 20px |
| circle diameter (sm/md/lg) | 24px / 40px / 64px |
| shimmer duration | 1.4s linear infinite |

## Accessibility

- `aria-hidden="true"` 推奨 (content ではなく loading 表示)
- 親 container に `role="status" aria-busy="true"` を付けると screen reader に "loading" を伝えられる
- `prefers-reduced-motion: reduce` で shimmer 無効化

## Do / Don't

### Do
- 500ms 以上 loading 続く時
- 具体的な shape が分かる layout (list / card grid)
- Spinner より "construction preview" 感で user 体感改善

### Don't
- ごく短い (<300ms) loading に使うと ちらつき
- skeleton の数が実 item と違う (誤解を生む)
- 動きを嫌う user 向け設定 (reduced-motion) を無視

## Related

- [Spinner](./progress.md) — 進捗不明時、coarse な loading
- [Progress](./progress.md) — 進捗数値化可能時
