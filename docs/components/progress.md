# Progress / Spinner

> Creo UI MVP components. 処理の進行状況を視覚的に示す 2 形式。

## Purpose

- **Progress bar**: 進捗が **数値化可能** (50% 完了 / 3/10 step 等) な場合の横バー
- **Spinner**: 進捗が **数値化不可** (fetch / compute 時間不明) な場合の回転アニメ

## Classes

| class | role |
|---|---|
| `.creo-progress` | horizontal bar wrapper |
| `.creo-progress-fill` | fill 要素 (width で進捗表現) |
| `.creo-spinner` | rotating circular indicator |

## Progress bar

### Usage

```html
<!-- Determinate (具体的な % が分かる) -->
<div class="creo-progress" role="progressbar" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100">
  <div class="creo-progress-fill" style="width: 60%"></div>
</div>

<!-- Indeterminate (進捗不明、アニメで流す) -->
<div class="creo-progress" role="progressbar" aria-label="読込中" data-indeterminate="true">
  <div class="creo-progress-fill"></div>
</div>

<!-- Variant (success / error) -->
<div class="creo-progress" data-variant="success" role="progressbar" aria-valuenow="100">
  <div class="creo-progress-fill" style="width: 100%"></div>
</div>
```

### Props

| attr | 値 | default |
|---|---|---|
| `data-size` | `s` / `m` / `l` | `m` |
| `data-variant` | `brand` / `success` / `warning` / `error` | `brand` |
| `data-indeterminate` | `true` | — |

### Token reference

| slot | token |
|---|---|
| track bg | `color.surface.bg-subtle` |
| fill (brand) | `color.brand.primary` |
| fill (success/warning/error) | `color.semantic.*` |
| height (sm) | 4px |
| height (md) | 8px |
| height (lg) | 12px |
| border-radius | `radius.full` |
| transition | width 240ms cubic-bezier |

## Spinner

### Usage

```html
<span class="creo-spinner" role="status" aria-label="読込中">
  <span class="visually-hidden">Loading</span>
</span>

<!-- sizes -->
<span class="creo-spinner" data-size="s"></span>
<span class="creo-spinner" data-size="l"></span>
```

### Props

| attr | 値 | default |
|---|---|---|
| `data-size` | `s` / `m` / `l` | `m` |
| `data-variant` | `brand` / `neutral` | `brand` |

### Token reference

| slot | token |
|---|---|
| diameter (sm) | 16px |
| diameter (md) | 24px |
| diameter (lg) | 40px |
| track color | `color.surface.bg-subtle` |
| arc color (brand) | `color.brand.primary` |
| arc color (neutral) | `color.text.secondary` |
| thickness | 2px (s/m) / 3px (lg) |
| rotation | 900ms linear infinite |

## Accessibility

- Progress: `role="progressbar"` + `aria-valuenow/valuemin/valuemax` (determinate) / `aria-label` (indeterminate)
- Spinner: `role="status"` + `aria-label`、中に visually-hidden text で screen reader 配慮
- indeterminate アニメは `prefers-reduced-motion: reduce` で静止 (将来 CSS 追加予定)

## Do / Don't

### Do
- 数値が出せるなら Progress (進捗感が伝わる)、出せないなら Spinner
- 1 秒以上かかる操作に必ず表示 (user 心配を減らす)

### Don't
- Progress を永遠に 90% で止めない (進捗詐称)
- Spinner を複数同時に出さない (どれを待ってるか混乱)
- 短い (100ms 未満) 操作に出さない (ちらつく)

## Related

- [Button](./button.md) (submit 中の spinner 内蔵パターン)
