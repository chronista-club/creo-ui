# Timeline

> Creo UI MVP component. 時系列の activity / event / history を縦並びで表示。

## Purpose

- **activity feed** (user が何をしたか)
- **change log / audit trail**
- **project milestones / roadmap**
- **notifications history**

Stepper は **予定された工程** (未来志向)、Timeline は **起きたこと** (過去志向)。

## Classes

| class | role |
|---|---|
| `.creo-timeline` | `<ol>` wrapper |
| `.creo-timeline-item` | `<li>` |
| `.creo-timeline-marker` | 左端の dot / icon circle |
| `.creo-timeline-content` | right side の body |
| `.creo-timeline-title` | headline |
| `.creo-timeline-meta` | timestamp / actor (typography.body.caption) |
| `.creo-timeline-description` | 本文 (optional) |

## Structure

```html
<ol class="creo-timeline">
  <li class="creo-timeline-item" data-variant="success">
    <span class="creo-timeline-marker" aria-hidden="true">✓</span>
    <div class="creo-timeline-content">
      <span class="creo-timeline-title">Memory "X" を公開</span>
      <time class="creo-timeline-meta">2026-04-23 14:20 by Mako</time>
      <p class="creo-timeline-description">
        atlas "creo-ui" に公開され、team メンバーが subscribe 可能になりました。
      </p>
    </div>
  </li>

  <li class="creo-timeline-item">
    <span class="creo-timeline-marker" aria-hidden="true">📝</span>
    <div class="creo-timeline-content">
      <span class="creo-timeline-title">edit</span>
      <time class="creo-timeline-meta">2 hours ago</time>
    </div>
  </li>

  <li class="creo-timeline-item" data-variant="warning">
    <span class="creo-timeline-marker" aria-hidden="true">!</span>
    <div class="creo-timeline-content">
      <span class="creo-timeline-title">Auto-save が 失敗</span>
      <time class="creo-timeline-meta">yesterday</time>
    </div>
  </li>
</ol>
```

## Props

| attr on `.creo-timeline-item` | 値 | default | 意味 |
|---|---|---|---|
| `data-variant` | `default` / `success` / `warning` / `error` / `info` | `default` | marker 色 |

| attr on `.creo-timeline` | 値 | default | 意味 |
|---|---|---|---|
| `data-size` | `sm` / `md` | `md` | marker サイズ / gap |

## Token reference

| slot | token |
|---|---|
| marker size (md) | 32px |
| marker size (sm) | 24px |
| marker border-radius | `radius.full` |
| marker bg (default) | `color.surface.bg-subtle` |
| marker bg (variants) | `color.semantic.{variant}` |
| marker icon color | `color.text.primary` (default) / `color.surface.bg-base` (variants) |
| connector (vertical 線) | `color.surface.border` 2px |
| item gap | `spacing.md` |
| title font | `typography.size.md` + `weight.medium` |
| meta | `typography.body.caption` + `text.tertiary` |
| description | `typography.size.md` + `text.secondary` |

## Accessibility

- `<ol>` で時系列順序 semantic
- marker icon は `aria-hidden="true"` (意味は title に)
- timestamp は `<time datetime="...">` 推奨

## Do / Don't

### Do
- 時系列順 (降順 推奨: 新しい → 古い)
- variants で重要度 / 成否を視覚化
- 10 件超える時 "さらに読み込む" pattern

### Don't
- 予定された workflow には使わない (→ Stepper)
- description を長くしすぎない (scan 性下がる)

## Related

- [Stepper](./stepper.md) — 未来志向 (予定工程)
- [Accordion](./accordion.md) — 詳細折りたたみ
