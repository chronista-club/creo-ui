# Header

> Creo UI MVP component. app / marketing 用の page top shell。

## Purpose

page の最上部で "どこにいるか / 誰の製品か / 何ができるか" を 3 秒で伝える。app mode では compact で nav primary、marketing mode では breathable で CTA primary。

## Anatomy (app variant)

```
┌────────────────────────────────────────────────┐
│ [logo] ░░ [nav] ░░░░░░░░░░░░░░░░░ [actions] ░░ │  ← padding: spacing-sm × spacing-lg
└────────────────────────────────────────────────┘
  ↑                                              ↑
  logo slot                              actions slot (buttons / avatar)
```

## Anatomy (marketing variant)

```
┌────────────────────────────────────────────────┐
│                                                │  ← padding: spacing-md × spacing-xl
│  [logo]      [nav]              [actions]      │
│                                                │
└────────────────────────────────────────────────┘
  ↑
  taller, breathable (min-height: 72px+)
```

## Props (data attributes)

| attr | 値 | default | 意味 |
|---|---|---|---|
| `data-variant` | `app` / `marketing` | `app` | 密度 / tone |
| `data-sticky` | `"true"` | — | `position: sticky; top: 0` + backdrop |
| `data-elevation` | `none` / `sm` / `md` | `sm` | bottom border / shadow |

## Slots (class names)

| class | 役割 |
|---|---|
| `.creo-header-logo` | ロゴ + (optional) product name |
| `.creo-header-nav` | 主要ナビゲーションリンク |
| `.creo-header-actions` | user アクション (sign-in / avatar / settings / primary CTA) |

これら slot は flex 配置で自動調整。空 slot は無視される。

## Token reference

| slot | token |
|---|---|
| background (app) | `color.surface.surface` |
| background (marketing) | `color.surface.bg-base` (透明感あり) |
| border-bottom (elevation sm) | 1px `color.surface.border` |
| shadow (elevation md) | `shadow.sm` |
| padding vertical (app) | `spacing.sm` |
| padding vertical (marketing) | `spacing.md` |
| padding horizontal | `spacing.lg` |
| gap (slot 間) | `layout.gap.sibling` |
| nav link font-size | `typography.size.md` |
| nav link color (default) | `color.text.secondary` |
| nav link color (hover/active) | `color.text.primary` |
| transition | 120ms ease (background-color, box-shadow) |
| sticky backdrop | `backdrop-filter: blur(8px)` + bg 0.85 α |

## Accessibility

- semantic: `<header>` element
- nav は `<nav aria-label="Main navigation">` 等で役割明示
- sticky header は keyboard focus flow を切らない (position sticky は OK)
- app logo は link (`<a href="/">`)、alt text (`aria-label="ホームへ戻る"`)
- screen reader 向けの skip link (`<a href="#main">コンテンツへスキップ</a>`) を slot 外で

## Do / Don't

### Do
- app variant は 主要 app 画面 (dashboard / editor)
- marketing variant は top page / landing / documentation 入口
- elevation sm を default に (軽く視覚的区切り)
- sticky は長 scroll ページで value、短いページでは不要

### Don't
- 2 つの Header を同じ page に置かない (navigation duality)
- nav link を 7 つ以上並べない (hamburger or group を検討)
- app variant を marketing 文脈に使う (窮屈に見える)
- logo を `<img>` 単独にしない (`<a>` で必ずラップ)

## 使用例

```html
<!-- App header, sticky, sm elevation -->
<header class="creo-header" data-variant="app" data-sticky="true">
  <a href="/" class="creo-header-logo">
    <img src="/logo.svg" alt="Creo" width="24" height="24">
    <span>Creo</span>
  </a>
  <nav class="creo-header-nav" aria-label="Main">
    <a href="/memories">Memories</a>
    <a href="/projects">Projects</a>
    <a href="/settings">Settings</a>
  </nav>
  <div class="creo-header-actions">
    <button class="creo-btn" data-variant="ghost" data-size="sm">Sign out</button>
  </div>
</header>

<!-- Marketing header -->
<header class="creo-header" data-variant="marketing">
  <a href="/" class="creo-header-logo">Creo UI</a>
  <nav class="creo-header-nav">
    <a href="#features">Features</a>
    <a href="#pricing">Pricing</a>
  </nav>
  <div class="creo-header-actions">
    <button class="creo-btn" data-variant="ghost">Sign in</button>
    <button class="creo-btn" data-variant="primary">Get started</button>
  </div>
</header>
```

## Editor Mode 連携

Header click で `data-variant` / `data-sticky` / `data-elevation` chooser。slot 内部の要素 (ロゴ / nav link / button) は個別に selectable。

## 依存 token

- `color.surface.*` / `color.text.*`
- `spacing.*` / `layout.gap.*`
- `typography.size.md`
- `shadow.sm`
- Button component (actions slot で使用)

## 関連

- [Button](./button.md)
- [Card](./card.md)
- [Input](./input.md)
