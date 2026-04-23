# Dialog

> Creo UI MVP component. 注意を要求する overlay (modal / confirmation / form)。native `<dialog>` element を採用。

## Purpose

user の注意を一時的に hijack して、重要な決定 (削除確認 / 重要な入力 / destructive action) を取る overlay UI。native `<dialog>` 要素を wrap し、`showModal()` で focus trap + backdrop + escape key close を browser に任せる。

## Anatomy

```
┌──────────────── backdrop ────────────────┐
│                                           │
│    ┌─────────────────────────┐           │
│    │  [title]        [close] │  ← header (title: title-subsection、close: ghost btn sm)
│    ├─────────────────────────┤
│    │                         │  ← body (spacing.md padding)
│    │  message / form         │
│    │                         │
│    ├─────────────────────────┤
│    │   [cancel] [confirm]    │  ← footer (actions、right-aligned、gap: layout-gap-tight)
│    └─────────────────────────┘
│                                           │
└───────────────────────────────────────────┘
```

## Classes

| class | role |
|---|---|
| `.creo-dialog` | native `<dialog>` base style (radius / padding / shadow / backdrop) |
| `.creo-dialog-header` | title + close button の row |
| `.creo-dialog-title` | title typography (typography.title.subsection) |
| `.creo-dialog-body` | body content area |
| `.creo-dialog-footer` | action buttons row (right-aligned) |

## Props (data attributes on `.creo-dialog`)

| attr | 値 | default | 意味 |
|---|---|---|---|
| `data-size` | `sm` / `md` / `lg` | `md` | dialog width |
| `data-variant` | `default` / `destructive` | `default` | destructive は title/actions に error 色 hint |

## Token reference

| slot | token |
|---|---|
| backdrop | `rgba(0,0,0,0.5)` (`::backdrop`) |
| dialog bg | `color.surface.surface` |
| border | `color.surface.border` 1px |
| border-radius | `radius.lg` (22px、少し大きめで柔らかい存在感) |
| shadow | `shadow.lg` (elevated 強調) |
| max-width (sm) | `320px` |
| max-width (md) | `480px` |
| max-width (lg) | `720px` |
| body padding | `spacing.md` |
| header/footer padding | `spacing.sm` `spacing.md` |
| border-top (footer) | `color.surface.border` 1px |
| gap (footer actions) | `layout.gap.tight` |
| title color (destructive) | `color.semantic.error` |

## Accessibility

- native `<dialog>` + `dialog.showModal()` で focus trap / Esc キー close / ARIA role="dialog" + aria-modal="true" が **browser 側で自動**
- title に `aria-labelledby` 設定 (通常 `.creo-dialog-title` の id を指定)
- body 説明に `aria-describedby` 設定 (任意)
- close button は `aria-label="閉じる"` が必須 (icon button の場合)
- destructive action は `autofocus` を confirm ではなく **cancel** に置く (誤タップ防止)

## Do / Don't

### Do
- 注意を引きたい時だけ使う (頻繁に出すと blocker)
- destructive はタイトルで主旨を明確に、メッセージで結果を明示
- body コンテンツは短く (3-4 行以内)
- Esc で cancel になる挙動を前提にする

### Don't
- dialog の中に別 dialog を入れない (stack 混乱)
- close ボタン無しで modal を出さない (逃げ道必須)
- dialog 内で重要な永続データを書かない (cancel で消える前提)

## 使用例 (HTML)

```html
<dialog class="creo-dialog" data-size="md" id="confirm-dlg">
  <header class="creo-dialog-header">
    <h2 class="creo-dialog-title" id="confirm-dlg-title">削除の確認</h2>
    <button
      type="button"
      class="creo-btn"
      data-variant="ghost"
      data-size="sm"
      aria-label="閉じる"
      onclick="document.getElementById('confirm-dlg').close()"
    >✕</button>
  </header>
  <div class="creo-dialog-body">
    <p>この項目を削除します。この操作は取り消せません。</p>
  </div>
  <footer class="creo-dialog-footer">
    <button type="button" class="creo-btn" data-variant="secondary" autofocus>キャンセル</button>
    <button type="button" class="creo-btn" data-variant="primary">削除</button>
  </footer>
</dialog>

<script>
  document.getElementById('confirm-dlg').showModal()
</script>
```

## 使用例 (destructive variant)

```html
<dialog class="creo-dialog" data-variant="destructive">
  <header class="creo-dialog-header">
    <h2 class="creo-dialog-title">全データを削除しますか?</h2>
  </header>
  <div class="creo-dialog-body">
    <p>全 memories / atlas / settings が完全に消去されます。復旧不可。</p>
  </div>
  <footer class="creo-dialog-footer">
    <button type="button" class="creo-btn" data-variant="secondary" autofocus>キャンセル</button>
    <button type="button" class="creo-btn" data-variant="primary">永久削除</button>
  </footer>
</dialog>
```

## 関連

- [Button](./button.md) (dialog actions)
- [Card](./card.md) (inline confirmation は card で、重要度低めに)
