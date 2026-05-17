# Empty state

> creoui MVP component. 一覧 / 検索結果 / inbox が **空** の時に出す centering placeholder。

## Purpose

"何も無い" を **welcoming に伝える** (エラーではなく starting point として)。typical use:
- list が空 (最初の item 作成 CTA)
- 検索 hit 無し (query 変更誘導)
- inbox 空 (Inbox zero feel)

## Classes

| class | role |
|---|---|
| `.creo-empty-state` | centered column wrapper |
| `.creo-empty-state-icon` | large illustrative icon |
| `.creo-empty-state-title` | short headline |
| `.creo-empty-state-description` | 1-2 sentence guide |
| `.creo-empty-state-actions` | CTA button 群 |

## Structure

```html
<div class="creo-empty-state" data-size="m">
  <div class="creo-empty-state-icon" aria-hidden="true">📂</div>
  <h3 class="creo-empty-state-title">プロジェクトがありません</h3>
  <p class="creo-empty-state-description">
    最初のプロジェクトを作って、アイデアを形にし始めましょう。
  </p>
  <div class="creo-empty-state-actions">
    <button class="creo-btn" data-variant="primary">新規プロジェクト</button>
    <button class="creo-btn" data-variant="ghost">テンプレートを見る</button>
  </div>
</div>

<!-- Search no-results (small) -->
<div class="creo-empty-state" data-size="s">
  <div class="creo-empty-state-icon" aria-hidden="true">🔍</div>
  <h3 class="creo-empty-state-title">ヒットなし</h3>
  <p class="creo-empty-state-description">
    別のキーワードで検索してみてください
  </p>
</div>
```

## Props

| attr | 値 | default | 意味 |
|---|---|---|---|
| `data-size` | `s` / `m` / `l` | `m` | overall size / padding (5 tier convention with spacing) |

## Token reference

| slot | token |
|---|---|
| wrapper padding (m) | `spacing.xl` |
| wrapper padding (s) | `spacing.m` |
| wrapper padding (l) | `spacing.xl` × 2 vertical |
| icon size (m / default) | `typography.icon.l` = 64px |
| icon size (s) | `typography.icon.m` = 40px |
| icon size (l) | `typography.icon.xl` = 96px |
| icon color | `color.text.tertiary` |
| title | `typography.title.subsection` (24px、lg は title.section 32) |
| description | `typography.size.m` + `color.text.secondary` |
| actions gap | `layout.gap.tight` |
| text-align | center |
| max-width (description) | 440px |

## Accessibility

- icon は `aria-hidden="true"` (装飾、意味は title に)
- headline は semantic heading (`<h2>` / `<h3>` context に応じて)
- decorative illustration の代わりに icon / emoji でも OK

## Do / Don't

### Do
- 空が **negative ではなく starting point** と示す text
- primary action (CTA) を明示
- 短く positive に

### Don't
- 空を "error / failed" と表現しない (user 不安)
- 長文 / 技術的詳細を入れない
- error state の代わりに empty-state 使わない (error は Alert)

## Related

- [Alert](./alert.md) — error state
- [Skeleton](./skeleton.md) — loading state (ではない、empty は fetch 完了後)
- [Button](./button.md) — CTA
