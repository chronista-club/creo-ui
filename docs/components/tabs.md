# Tabs

> Creo UI MVP component. 関連したビュー群を同一 context で切り替える navigation pattern。

## Purpose

1 つの画面上で **同じ対象を複数の視点で見る** (例: "Overview / Details / History")、または **narrow な navigation** (例: Settings sub-sections) に使う。page navigation (header nav) とは役割が違う — Tabs は "content area の中の切替"。

## Anatomy

```
┌────────────────────────────────┐
│  Tab1  │  Tab2  │  Tab3  │ ... │   ← .creo-tabs-list (button 列、border-bottom 1px)
├────────┴────────┴────────┴─────┤
│                                │
│  active tab panel              │   ← [role="tabpanel"] (content、outside wrapper)
│                                │
└────────────────────────────────┘
```

## Structure

ARIA pattern に準拠。`tablist` / `tab` / `tabpanel` の 3 role:

```html
<div class="creo-tabs">
  <div class="creo-tabs-list" role="tablist" aria-label="Views">
    <button
      class="creo-tabs-tab"
      role="tab"
      aria-selected="true"
      aria-controls="panel-overview"
      id="tab-overview"
    >
      Overview
    </button>
    <button
      class="creo-tabs-tab"
      role="tab"
      aria-selected="false"
      aria-controls="panel-details"
      id="tab-details"
    >
      Details
    </button>
  </div>

  <div
    class="creo-tabs-panel"
    role="tabpanel"
    id="panel-overview"
    aria-labelledby="tab-overview"
  >
    (Active panel content)
  </div>
  <div
    class="creo-tabs-panel"
    role="tabpanel"
    id="panel-details"
    aria-labelledby="tab-details"
    hidden
  >
    (Hidden panel)
  </div>
</div>
```

## Props (data attributes)

| attr on `.creo-tabs` | 値 | default | 意味 |
|---|---|---|---|
| `data-variant` | `underline` / `pill` | `underline` | active 表現のスタイル |
| `data-size` | `sm` / `md` / `lg` | `md` | tab button のサイズ |

active 判定は **`aria-selected="true"` が単一 SSOT** (JS で付け替える、CSS は a11y attribute を selector として読む)。

## Token reference

| slot | token |
|---|---|
| tablist border-bottom | `color.surface.border` 1px |
| tab text (default) | `color.text.secondary` |
| tab text (hover) | `color.text.primary` |
| tab text (active) | `color.brand.primary` (underline) / `color.surface.bg-base` (pill) |
| tab background (pill active) | `color.brand.primary` |
| tab padding | `spacing.sm` × `spacing.md` |
| tab gap | `spacing.xs` (pill のみ) |
| active underline color | `color.brand.primary` |
| underline thickness | 2px |
| min-height | `layout.target.focus` (sm) / `layout.target.tap` (md/lg) |
| transition | 150ms ease |

## Accessibility

- ARIA: `tablist` + `tab` + `tabpanel` の 3 role を全部付与
- `aria-selected` で active tab 表現 (JS で toggle)
- `aria-controls` で panel を link
- keyboard: Tab で tablist に入り、Arrow Left/Right で tab 移動、Home/End で 先頭/末尾 (consumer 実装、CSS 層では不扱い)
- active panel 以外は `hidden` 属性 (CSS `display: none` と両立)
- Arrow key navigation は **consumer の JS 責務** (creo-ui はあくまで CSS + a11y attribute pattern を提供)

## Do / Don't

### Do
- 3-6 tab くらいが使いやすい (超えると scroll / overflow 検討)
- tab 名は短く (1-2 単語)
- ARIA attribute を全部 set

### Don't
- tab を page navigation (header nav 等) の代わりに使わない
- tab をたくさん並べて scroll 横必須にしない (dropdown / accordion 検討)
- active を色だけで示さない (underline / pill で shape 変化も併用)

## 使用例 (SolidJS + editor-host consumer)

```tsx
function Tabs() {
  const [active, setActive] = createSignal('overview')
  return (
    <div class="creo-tabs">
      <div role="tablist" class="creo-tabs-list">
        <For each={['overview', 'details', 'history']}>
          {(id) => (
            <button
              class="creo-tabs-tab"
              role="tab"
              aria-selected={active() === id}
              aria-controls={`panel-${id}`}
              id={`tab-${id}`}
              onClick={() => setActive(id)}
            >
              {id}
            </button>
          )}
        </For>
      </div>
      <For each={['overview', 'details', 'history']}>
        {(id) => (
          <div
            class="creo-tabs-panel"
            role="tabpanel"
            id={`panel-${id}`}
            aria-labelledby={`tab-${id}`}
            hidden={active() !== id}
          >
            Content {id}
          </div>
        )}
      </For>
    </div>
  )
}
```

## Related

- [Header](./header.md) (page navigation は Header、view 切替は Tabs)
- [Button](./button.md) (tab button は button element、見た目だけ違う)
