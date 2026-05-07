# Stepper

> Creo UI MVP component. 多段プロセス (onboarding / checkout / wizard) の進行状況を視覚化。

## Purpose

"今どの step にいて、次は何か、どれだけ残ってるか" を user に明示。Tabs が平行な view 切替、Breadcrumbs が nav history、Stepper は **順序性のある工程**。

## Classes

| class | role |
|---|---|
| `.creo-stepper` | `<ol>` wrapper |
| `.creo-stepper-item` | `<li>` step 単位 |
| `.creo-stepper-marker` | 番号 / icon circle |
| `.creo-stepper-label` | step 名 (title) |
| `.creo-stepper-description` | 補足 (optional) |

## Structure (horizontal)

```html
<ol class="creo-stepper" data-orientation="horizontal">
  <li class="creo-stepper-item" data-status="completed">
    <span class="creo-stepper-marker" aria-hidden="true">✓</span>
    <span class="creo-stepper-label">Account</span>
    <span class="creo-stepper-description">Basic info</span>
  </li>
  <li class="creo-stepper-item" data-status="current" aria-current="step">
    <span class="creo-stepper-marker" aria-hidden="true">2</span>
    <span class="creo-stepper-label">Profile</span>
    <span class="creo-stepper-description">Name / avatar</span>
  </li>
  <li class="creo-stepper-item" data-status="pending">
    <span class="creo-stepper-marker" aria-hidden="true">3</span>
    <span class="creo-stepper-label">Done</span>
  </li>
</ol>
```

## Props

| attr on `.creo-stepper` | 値 | default | 意味 |
|---|---|---|---|
| `data-orientation` | `horizontal` / `vertical` | `horizontal` | 配置軸 |
| `data-size` | `sm` / `md` | `md` | marker サイズ |

| attr on `.creo-stepper-item` | 値 | 意味 |
|---|---|---|
| `data-status` | `completed` / `current` / `pending` / `error` | state |
| `aria-current="step"` | — | 現 step を screen reader に伝える |

## Token reference

| slot (status) | marker bg | marker text | connector |
|---|---|---|---|
| completed | `color.brand.primary` | `color.surface.bg-base` | `color.brand.primary` |
| current | `color.brand.primary` | `color.surface.bg-base` + `shadow.s` | `color.surface.border` |
| pending | `color.surface.bg-subtle` | `color.text.tertiary` | `color.surface.border` |
| error | `color.semantic.error` | `color.surface.bg-base` | `color.surface.border` |

| その他 slot | token |
|---|---|
| marker size (md) | 32px (layout.target.focus) |
| marker size (sm) | 24px |
| marker border-radius | `radius.full` |
| label font (md) | `typography.size.m` + `weight.medium` |
| description | `typography.body.helper` + `text.secondary` |
| connector height (horizontal) | 2px |
| connector width (vertical) | 2px |

## Accessibility

- `<ol>` で順序 semantic
- `aria-current="step"` で現在地
- marker の icon / 番号は `aria-hidden` (text として label に重複しないよう)
- 長い step list は scroll 可能化 (`overflow-x: auto` 推奨、consumer で)

## Do / Don't

### Do
- 3-6 step が理想
- 各 step label は 1-2 単語
- horizontal は 進行方向左→右、vertical は top→bottom

### Don't
- step 数が 7+ なら progress bar 検討 (stepper は密度過剰)
- description を長文にしない (小さく補助的に)
- 戻れない前提で描画しない (completed は click で戻れる pattern が多い)

## Related

- [Tabs](./tabs.md) (順序なし view 切替)
- [Breadcrumbs](./breadcrumbs.md) (nav history)
- [Progress](./progress.md) (数値化可能な単調 progress)
