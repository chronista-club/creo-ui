# Popover

> Creo UI MVP component. 小さな interactive overlay (Menu より自由、Dialog より軽い)。

## Purpose

Menu よりリッチ (input / button 複数可)、Dialog より軽い (backdrop なし、頻度高い) 用途:
- user action の確認 ("Are you sure?" 小型プロンプト)
- inline edit (cell 編集、nickname 変更)
- context-rich tooltip (link preview、details)

## Structure (native popover)

`popover="auto"` で outside click / Esc close を browser に任せる:

```html
<button
  type="button"
  class="creo-btn"
  data-variant="ghost"
  popovertarget="user-preview"
>
  @mako
</button>

<div class="creo-popover" id="user-preview" popover="auto" role="dialog" aria-labelledby="up-title">
  <header class="creo-popover-header">
    <h3 class="creo-popover-title" id="up-title">Mako</h3>
  </header>
  <div class="creo-popover-body">
    <p>Chronista メンバー · creo-ui メンテナ</p>
    <p>Lane: creo-ui/main</p>
  </div>
  <footer class="creo-popover-footer">
    <button class="creo-btn" data-variant="secondary" data-size="sm">DM</button>
    <button class="creo-btn" data-variant="primary" data-size="sm">Follow</button>
  </footer>
</div>
```

## Classes

| class | role |
|---|---|
| `.creo-popover` | popover root (native `<div popover="auto">`) |
| `.creo-popover-header` | optional header (title) |
| `.creo-popover-title` | title text (typography.title.card) |
| `.creo-popover-body` | main content |
| `.creo-popover-footer` | action row (right-aligned buttons) |

## Props

| attr | 値 | default | 意味 |
|---|---|---|---|
| `data-size` | `sm` / `md` / `lg` | `md` | max-width |
| `data-variant` | `default` / `muted` | `default` | background tone |

## Token reference

| slot | token |
|---|---|
| bg | `color.surface.surface` |
| bg (muted) | `color.surface.bg-subtle` |
| border | `color.surface.border` 1px |
| border-radius | `radius.m` |
| shadow | `shadow.l` |
| padding (md) | `spacing.m` |
| width (sm/md/lg) | 240 / 320 / 480 px |
| header border-bottom | `color.surface.border` 1px |
| footer border-top | `color.surface.border` 1px |
| footer gap | `layout.gap.tight` |

## Accessibility

- `role="dialog"` + `aria-labelledby="id"` 推奨 (interactive content があるため)
- `popover="auto"` で Esc / outside click が browser native に処理
- focus 制御: opening 時に最初の focusable に auto-focus (browser 依存、consumer JS 補完可)

## Do / Don't

### Do
- 短い interactive content (1-3 actions + summary)
- inline edit / quick preview / confirmation
- tooltip で足りない情報量

### Don't
- Dialog 相当の重要決定には使わない (Dialog の modal が適切)
- 長い form は drawer / page に
- tooltip 相当 (static 補足) は Tooltip を使う

## Related

- [Tooltip](./tooltip.md) — 静的補足
- [Dialog](./dialog.md) — 重要決定 (modal)
- [Menu](./menu.md) — action list のみ
