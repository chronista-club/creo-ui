# Drawer

> Creo UI MVP component. 画面端から slide in する overlay (Dialog の side 版)。

## Purpose

- **detail panel** (list 選択時に右側から詳細 slide-in)
- **navigation** (mobile で hamburger → 左 nav slide)
- **filter / tool panel** (右側 or 左側 editor の補助)
- **settings drawer** (画面を離れずに設定変更)

Dialog は 中央 modal で強制的に focus を奪うが、Drawer は **画面の context を保ちつつ補助情報を出す**。

## Classes

| class | role |
|---|---|
| `.creo-drawer` | `<dialog>` base (native modal) |
| `.creo-drawer-header` | title + close button |
| `.creo-drawer-title` | title typography |
| `.creo-drawer-body` | scrollable content |
| `.creo-drawer-footer` | action buttons (optional) |

## Structure

native `<dialog>` + `showModal()` を使う (focus trap / Esc 自動):

```html
<dialog class="creo-drawer" data-placement="right" data-size="md" id="detail-drawer">
  <header class="creo-drawer-header">
    <h2 class="creo-drawer-title">詳細</h2>
    <button
      type="button"
      class="creo-btn"
      data-variant="ghost"
      data-size="sm"
      aria-label="閉じる"
      onclick="document.getElementById('detail-drawer').close()"
    >✕</button>
  </header>
  <div class="creo-drawer-body">
    <!-- 任意の content -->
    <p>選択した item の詳細...</p>
  </div>
  <footer class="creo-drawer-footer">
    <button class="creo-btn" data-variant="secondary">Cancel</button>
    <button class="creo-btn" data-variant="primary">Save</button>
  </footer>
</dialog>

<script>
  document.getElementById('detail-drawer').showModal()
</script>
```

## Props (on `.creo-drawer`)

| attr | 値 | default | 意味 |
|---|---|---|---|
| `data-placement` | `right` / `left` / `top` / `bottom` | `right` | slide in 方向 |
| `data-size` | `sm` / `md` / `lg` / `xl` | `md` | drawer の幅 (horizontal) / 高さ (vertical) |

## Token reference

| slot | token |
|---|---|
| backdrop | `rgba(0,0,0,0.4)` (`::backdrop`) |
| bg | `color.surface.surface` |
| border | `color.surface.border` 1px |
| shadow | `shadow.xl` (強めの lift) |
| width (sm/md/lg/xl) | 280 / 400 / 560 / 800 px (horizontal) |
| height (sm/md/lg/xl) | 40% / 50% / 65% / 80% viewport (vertical) |
| header/footer padding | `spacing.sm` × `spacing.md` |
| border separator | `color.surface.border` 1px |
| transition | 240ms cubic-bezier(0.16, 1, 0.3, 1) |

## Accessibility

- native `<dialog>` + `showModal()` で focus trap / Esc close 自動
- `aria-labelledby` で title と関連付け
- close button に `aria-label="閉じる"` 必須

## Do / Don't

### Do
- detail view / filter / settings で使う
- close button 必須 (Esc + outside click 補助)
- footer action は右寄せ (Dialog と同)

### Don't
- 短い confirmation は Dialog に (Drawer は幅広)
- content が無いのに drawer 出さない
- nested drawer は混乱 (1 段まで)

## Related

- [Dialog](./dialog.md) — 中央 modal、強制決定
- [Popover](./popover.md) — 小型 interactive overlay
