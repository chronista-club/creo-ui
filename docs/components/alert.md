# Alert

> Creo UI MVP component. inline で status / notice を持続表示する component (Toast とは違う)。

## Purpose

Toast は **一時的** (数秒で消える)、Alert は **持続的 inline** (ページ閉じるまで、または user dismiss まで)。form validation summary / banner / policy notice 等で使う。

## Classes

| class | role |
|---|---|
| `.creo-alert` | wrapper (icon + content + optional close) |
| `.creo-alert-icon` | leading icon slot |
| `.creo-alert-content` | title + description |
| `.creo-alert-close` | optional dismiss button |

## Structure

```html
<!-- Info alert (non-dismissible) -->
<div class="creo-alert" data-variant="info" role="status">
  <span class="creo-alert-icon" aria-hidden="true">ℹ</span>
  <div class="creo-alert-content">
    <strong>New Feature</strong>
    <span>Editor Mode がプロジェクト設定から切替可能になりました</span>
  </div>
</div>

<!-- Error with dismiss -->
<div class="creo-alert" data-variant="error" role="alert">
  <span class="creo-alert-icon" aria-hidden="true">⚠</span>
  <div class="creo-alert-content">
    <strong>保存失敗</strong>
    <span>ネットワーク接続を確認してください</span>
  </div>
  <button class="creo-alert-close" type="button" aria-label="閉じる">✕</button>
</div>

<!-- Success banner (top of page) -->
<div class="creo-alert" data-variant="success" data-variant-style="banner">
  <span class="creo-alert-icon" aria-hidden="true">✓</span>
  <div class="creo-alert-content">
    <strong>Account verified</strong>
  </div>
</div>
```

## Props

| attr | 値 | default | 意味 |
|---|---|---|---|
| `data-variant` | `info` / `success` / `warning` / `error` | `info` | tone |
| `data-variant-style` | `default` / `subtle` / `banner` | `default` | 背景の強度 (default: variant 色 tint、subtle: border 強調、banner: full-width no-radius) |

## Token reference

| slot | token |
|---|---|
| bg (default info) | `color.semantic.info` @ 15% |
| bg (subtle) | `color.surface.surface` + border 1.5px variant 色 |
| bg (banner) | variant tint + no border-radius |
| icon color | `color.semantic.{variant}` |
| border-radius (default) | `radius.md` |
| border-radius (banner) | 0 |
| padding | `spacing.s` × `spacing.m` |
| gap | `spacing.s` |
| title | `typography.size.md` + `weight.semibold` |
| description | `typography.body.helper` |

## Accessibility

- `role="status"` (info/success、polite) / `role="alert"` (warning/error、assertive)
- icon は `aria-hidden="true"` 装飾
- close button に `aria-label="閉じる"` 必須
- dismiss 後の focus 戻し先は consumer JS (Alert を出した trigger 要素)

## Do / Don't

### Do
- 持続的な状態通知 (Toast は瞬間的)
- form 全体 summary (field 個別 error は input の aria-describedby)
- banner 的に page top で global notice

### Don't
- 短時間で消える feedback に使わない (→ Toast)
- Alert 内に form / long interaction を入れない (Dialog / Drawer)
- error state を色だけで示さない (icon + text 必須)

## Related

- [Toast](./toast.md) — 瞬間的通知
- [FormField helper-text](./form-field.md) — field 単位 error
