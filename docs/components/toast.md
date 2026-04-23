# Toast

> Creo UI MVP component. 画面端に 一時的に 表示される notification / status message。

## Purpose

**完了・失敗・警告** 等の短い feedback を、user の主要作業を blocked せず伝える。通常は 3-6 秒で自動消失、失敗系は persistent で user が閉じる。

## Classes

| class | role |
|---|---|
| `.creo-toast-region` | container (画面端に fix、toast stack 場所) |
| `.creo-toast` | 単体 toast (icon + text + optional action) |
| `.creo-toast-icon` | leading icon slot |
| `.creo-toast-content` | title + description |
| `.creo-toast-close` | close button (ghost、右端) |

## Structure

```html
<!-- Region (一度だけ配置、アプリの最外殻) -->
<div class="creo-toast-region" data-placement="top-right" role="region" aria-label="通知">

  <!-- 1 件ごとの toast -->
  <div class="creo-toast" data-variant="success" role="status">
    <span class="creo-toast-icon" aria-hidden="true">✓</span>
    <div class="creo-toast-content">
      <strong>保存しました</strong>
      <span>変更が永続化されました</span>
    </div>
    <button
      type="button"
      class="creo-toast-close"
      aria-label="閉じる"
      onclick="this.closest('.creo-toast').remove()"
    >✕</button>
  </div>

  <div class="creo-toast" data-variant="error" role="alert">
    <span class="creo-toast-icon" aria-hidden="true">⚠</span>
    <div class="creo-toast-content">
      <strong>保存に失敗</strong>
      <span>ネットワーク接続を確認してください</span>
    </div>
    <button type="button" class="creo-toast-close" aria-label="閉じる">✕</button>
  </div>

</div>
```

## Props

### `.creo-toast-region` の `data-placement`

| 値 | 意味 |
|---|---|
| `top-right` (default) | 右上 |
| `top-left` | 左上 |
| `top-center` | 上中央 |
| `bottom-right` | 右下 |
| `bottom-left` | 左下 |
| `bottom-center` | 下中央 |

### `.creo-toast` の `data-variant`

| 値 | tone |
|---|---|
| `default` (neutral) | surface |
| `success` | 緑 tint |
| `warning` | 橙 tint |
| `error` | 赤 tint |
| `info` | 青 tint |

## Token reference

| slot | token |
|---|---|
| region gap | `layout.gap.tight` |
| region padding | `spacing.md` |
| toast bg (default) | `color.surface.surface` |
| toast border | 1px (default) / 1.5px (variant) |
| toast padding | `spacing.sm` × `spacing.md` |
| border-radius | `radius.md` |
| shadow | `shadow.md` |
| icon size | `typography.title.card` (20px) |
| title | `typography.size.md` + `weight.semibold` |
| description | `typography.body.helper` (14px) |
| entrance | translate + fade 180ms |

## Accessibility

- region に `role="region"` + `aria-label`
- 成功系 toast は `role="status"` (polite、SR が中断しない)
- 失敗系 toast は `role="alert"` (assertive、即座に読む)
- close button に `aria-label="閉じる"`
- 自動消失するなら `setTimeout` は 6 秒以上推奨 (user が読む時間)
- `aria-live` は role で暗黙

## Do / Don't

### Do
- 短く (1-2 行)
- 成功/失敗の区別を色 + icon + role で明示
- 失敗系は persistent (close button 必須)

### Don't
- toast に重要な情報だけ入れない (消えて取り戻せない)
- 複数の対立 action を入れない (choice は Dialog へ)
- 長文 (3 行超) を入れない

## Related

- [Dialog](./dialog.md) — user action 必要な時
- [Badge](./badge.md) — 永続 status
