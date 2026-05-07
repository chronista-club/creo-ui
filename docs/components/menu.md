# Menu (Dropdown)

> Creo UI MVP component. button click でopen、action list を表示する overlay menu。

## Purpose

header の profile menu、table row の `⋯` menu、toolbar action 等、**関連 action group を on-demand で表示**。native `<dialog popover>` または JS 制御。

## Classes

| class | role |
|---|---|
| `.creo-menu` | popover container (`<div popover="auto">` 推奨) |
| `.creo-menu-item` | 1 項目 (button / link / checkbox item) |
| `.creo-menu-separator` | 区切り線 (`<hr>` 推奨) |
| `.creo-menu-label` | group label (非 interactive、`<div role="presentation">`) |

## Structure (native `popover`)

modern browser の `popover` API を使うと JS ほぼ不要で close/dismiss が動く:

```html
<button
  type="button"
  class="creo-btn"
  data-variant="secondary"
  data-size="sm"
  popovertarget="profile-menu"
  popovertargetaction="toggle"
>
  ⚙️ Profile
</button>

<div class="creo-menu" id="profile-menu" popover="auto" role="menu">
  <div class="creo-menu-label">アカウント</div>
  <button class="creo-menu-item" type="button" role="menuitem">Settings</button>
  <button class="creo-menu-item" type="button" role="menuitem">Billing</button>
  <hr class="creo-menu-separator" />
  <button class="creo-menu-item" type="button" role="menuitem" data-variant="destructive">
    Sign out
  </button>
</div>
```

`popover="auto"` で outside click / Esc で自動 close、backdrop も透明に用意される。

## Props

### `.creo-menu` の `data-placement`

| 値 | 意味 |
|---|---|
| `bottom-start` (default) | 下、左寄せ |
| `bottom-end` | 下、右寄せ |
| `top-start` | 上、左寄せ |
| `top-end` | 上、右寄せ |

### `.creo-menu-item` の `data-variant`

| 値 | tone |
|---|---|
| `default` | text primary |
| `destructive` | error 色 hover + semantic-error text |

## Token reference

| slot | token |
|---|---|
| menu bg | `color.surface.surface` |
| menu border | `color.surface.border` 1px |
| menu radius | `radius.md` |
| menu shadow | `shadow.lg` |
| menu padding | `spacing.xs` |
| min-width | 180px |
| item padding | `spacing.xs` × `spacing.s` |
| item min-height | `layout.target.focus` |
| item text | `color.text.primary` |
| item hover bg | `color.surface.bg-subtle` |
| item hover (destructive) bg | `color.semantic-error` @ 12% |
| separator color | `color.surface.border` |

## Accessibility

- `role="menu"` + `role="menuitem"` (標準 ARIA pattern)
- keyboard: Arrow Up/Down で移動、Enter で activate、Esc で close (consumer JS 責務、native popover は Esc のみ handle)
- focus trap: popover API の backdrop が基本的な focus handling 提供、完全な menu pattern は JS で Arrow key navigation を追加

## Do / Don't

### Do
- 3-8 項目 (超えるなら Select / Autocomplete 検討)
- 類似 action を group (separator 挟む)
- destructive は最下部 + variant で色分け

### Don't
- menu 内に interactive form (input / select) を入れない (Popover 検討)
- nested menu を深くしない (1 階層まで推奨)

## Related

- [Button](./button.md) (trigger)
- [Dialog](./dialog.md) — 重要な決定は Menu ではなく Dialog
