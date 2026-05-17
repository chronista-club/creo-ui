# creoui

creoui の Web 向け Design Token + Component 配布パッケージ。

Creo ecosystem (creo-memories / vantage-point / fleetstage 他) の Web app に、 共通の **色 / 余白 / typography / radius / shadow** を **CSS custom properties** + **JavaScript 定数** + **28 個の class-based component CSS** として提供。

単一の W3C Design Tokens (DTCG) から style-dictionary v4 で生成され、 どの consumer から読み込んでも Creo の **視覚的一貫性** が保たれる (Apple SPM / Rust crate も同 token SSOT から派生)。

## Install

```bash
bun add creoui
# or
npm install creoui
# or
pnpm add creoui
```

## Quick start (3 行)

```ts
import 'creoui/tokens.css'      // CSS variable + 8 theme + reduced-motion guard
import 'creoui/components.css'  // 28 component (button / input / dialog / drawer 等)

document.documentElement.dataset.theme = 'mint-dark'  // optional、 default は mint-dark
```

これで `:root` に **350+ CSS 変数** + 28 component class が usable に。

## Token catalog — 5 tier convention (v0.17.0 token / v0.18.0 attribute、 完全統一)

すべての dimension scale token + component attribute は **`xs / s / m / l / xl` の 5 tier** に統一。 `sm/md/lg` Tailwind 流命名は **完全廃止** (廃止 history は [`docs/migration/v0.14-to-v0.18.md`](https://github.com/chronista-club/creoui/blob/main/docs/migration/v0.14-to-v0.18.md))。

### Dimension scale (5 tier)

| Category | Keys | 例 |
|---|---|---|
| `spacing.*` | `xs / s / m / l / xl` (4/8/18/24/32 px) | sibling 間 gap、 card 内側 padding |
| `margin.*` | `xs / s / m / l / xl` (8/16/18/40/64 px) | block 間 rhythm、 section break |
| `radius.*` | `none / xs / s / m / l / xl / full` | 4/8/15/22/28 px + special |
| `shadow.*` | `none / s / m / l / xl` | elevation (cards / popovers / modals) |
| `typography.size.*` | `xs / s / m / l / xl` (12/14/16/18/20 px) | body text |
| `typography.display.*` | `xs / s / m / l / xl` (24/32/44/56/72 px) | hero / heading |
| `typography.icon.*` | `xs / s / m / l / xl` (16/24/40/64/96 px) | icon font-size |

### Layout primitives (v0.15+)

| Token | Keys | 用途 |
|---|---|---|
| `layout.container.*` | `xs / s / m / l / xl` (480/640/768/1024/1280 px) | page max-width |
| `layout.grid.col-min-*` | `xs / s / m / l / xl` (120/160/220/280/320 px) | auto-fit grid minmax |
| `layout.gap.*` | `tight / sibling / section / page` (semantic alias) | gap between elements |
| `layout.target.*` | `tap / focus / hit` (44/32/24 px) | a11y minimum size |

### Color (8 theme + semantic)

| Token | Keys |
|---|---|
| `color.brand.*` | `primary / primary-hover / secondary / accent` |
| `color.semantic.*` | `success / warning / error / info` |
| `color.surface.*` | `bg / bg-subtle / fg / fg-subtle / scrim / scrim-modal` |
| `color.text.*` | `primary / secondary / tertiary / brand / link` |
| `color.themes.*` | 8 theme palettes (`mint-light` / `mint-dark` / `sora-*` / `contrast-*` / `oldschool-*`) |

theme 切替は `[data-theme="<id>"]` attribute で。 詳細は [`docs/design/theme-system.md`](https://github.com/chronista-club/creoui/blob/main/docs/design/theme-system.md)。

### Typography family (v0.14+ mode-based)

| Token | Default | 用途 |
|---|---|---|
| `family.app` | JetBrainsMono Nerd Font + PlemolJP | App UI chrome (sidebar / button / dialog) |
| `family.read` | PlemolJP | 読み専用 (memory view / chat history / canvas) |
| `family.editor` | iA Writer Duo | textarea / Markdown editor |
| `family.editor-mono` | iA Writer Mono | 純粋 mono 派 |
| `family.editor-quattro` | iA Writer Quattro | semi-proportional 派 |
| `family.terminal` | family.app と同 stack (意味的に別) | xterm.js |

加えて `family.{sans, mono, mono-{legible,retro,corporate,display}, display, icon}` の 8 traditional category が back compat で残置。

## Usage 例

### CSS で 5 tier convention の token を使う

```css
.my-card {
  /* spacing は xs / s / m / l / xl */
  padding: var(--spacing-m);
  gap: var(--spacing-s);

  /* radius も 5 tier (+ none / full) */
  border-radius: var(--radius-m);

  /* shadow も 5 tier (+ none) */
  box-shadow: var(--shadow-s);

  /* typography size も 5 tier */
  font-size: var(--typography-size-m);
  font-family: var(--typography-family-app);
  color: var(--color-text-primary);
  background: var(--color-surface-bg);
}

.my-hero {
  font-size: var(--typography-display-l);
  font-weight: var(--typography-weight-semibold);
}
```

### JS 定数として参照

```ts
import { ColorBrandPrimary, SpacingM, RadiusS } from 'creoui/tokens.js'

// Build time に値を埋め込みたい場合
console.log(ColorBrandPrimary)  // 'oklch(...)'
console.log(SpacingM)             // '18px'
```

camelCase identifier (`SpacingM` 等) も 5 tier convention に揃う。 完全な型定義は同梱の `tokens.d.ts`。

### Component class で 28 component を使う

```html
<!-- Button -->
<button class="creo-btn" data-variant="primary">Save</button>
<button class="creo-btn" data-variant="ghost" data-size="s">Cancel</button>

<!-- Card with composition -->
<article class="creo-card" data-padding="m">
  <h2>Title</h2>
  <p>...</p>
</article>

<!-- Layout primitives (v0.15+) -->
<div class="creo-container" data-size="m">
  <div class="creo-grid" data-cols="3" data-gap="m">
    <article class="creo-card" data-padding="m">A</article>
    <article class="creo-card" data-padding="m">B</article>
    <article class="creo-card" data-padding="m">C</article>
  </div>
</div>
```

28 component の完全 catalog は [docs site](https://creoui.in) (WIP) または [`docs/components/`](https://github.com/chronista-club/creoui/tree/main/docs/components) を参照。

> **note**: v0.18 で `data-size` / `data-padding` / `data-elevation` attribute も 5 tier 統一 (`s/m/l`)。 token と attribute の **convention drift は完全解消**。

## A11y — `prefers-reduced-motion` 完全対応 (v0.15+)

14 全 component が `@media (prefers-reduced-motion: reduce)` で transition / transform / animation を停止。 **consumer 側の追加作業なしで** WCAG 2.1 SC 2.3.3 (Animation from Interactions) + SC 2.3.1 (Three Flashes) 準拠。 switch thumb slide / button press / table sort indicator 等の spatial transform もすべて停止する。

## 別 platform 向けパッケージ

同じ token SSOT から:

| Platform | Package |
|---|---|
| Apple (iOS 17+ / macOS 14+ / watchOS 10+ / tvOS 17+) | SPM: `https://github.com/chronista-club/creoui` (target `Creoui`) |
| Rust | crates.io: `creoui` (Phase 2 で publish 予定、 現状 git/path 参照) |

## Migration

過去 release からの upgrade は [`docs/migration/v0.14-to-v0.18.md`](https://github.com/chronista-club/creoui/blob/main/docs/migration/v0.14-to-v0.18.md) を参照。 v0.17 以降は **5 tier convention 安定保証** (sm/md/lg 由来の rename はこれ以上発生しない設計)。

## License

[Apache-2.0](https://github.com/chronista-club/creoui/blob/main/LICENSE)
