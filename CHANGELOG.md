# Changelog

本ファイルは creoui の version 別変更履歴を記録する。
package 別 version (web / swift / rust / editor-host) は独立に bump される — 該当 package の `package.json` / `Package.swift` / `Cargo.toml` を SSOT とする。

## v0.22.0 (2026-05-20) — web、Principal Layout P-3 Z 軸 layer add-on

Principal Layout primitive に **Z 軸 layer add-on** を追加 ([#50](https://github.com/chronista-club/creoui/pull/50))。creo-memories doc 29 §4 / doc 30 §6.6 の多層 Atlas (認知境界の積層) を、creoui/shells の **opt-in add-on** として実装。

PL-6 通り primitive の core surface には出していない — `<CreoEdgeShell>` / `<CreoRail>` は本 add-on を一切参照せず、Z 軸を使う consumer (creo-web) だけが import する。

| 追加 export (`creoui/shells`) | 役割 |
|---|---|
| `createLayerStore()` | `LayerId` (`atlasId \| undefined`、undefined = ルート層) を SSOT に持つ Z 位置 store |
| `createLayerUrlSync(store, { readParam, writeParam })` | URL `?layer` の双方向同期。router-agnostic — param accessor を consumer 供給 |
| `parseLayerParam` / `layerToParam` / `layerEqualsParam` | pure logic。無限ループ収束を `layerEqualsParam` ガードで保証 |

additive のみ — 既存 export (`<CreoEdgeShell>` / `<CreoRail>` / `railRegistry` / `regions` / tokens / components.css) は 100% backward compat。

## v0.21.0 (2026-05-19) — web、Principal Layout primitive (Edge Ring + Rail)

`creoui/shells` に **Principal Layout** primitive を追加 ([#48](https://github.com/chronista-club/creoui/pull/48))。creo-memories doc 29/30 の 3x3 Frame / Rail UX を共有 primitive 化したもの (fleetstage handoff が起点)。設計は [docs/design/principal-layout.md](./docs/design/principal-layout.md)。

additive のみ — 既存 export (`CreoPageShell` / `CreoFacetGrid` / tokens / components.css) は 100% backward compat。

| 追加 export (`creoui/shells`) | 役割 |
|---|---|
| `<CreoEdgeShell>` | 4 edge + center の Edge Ring (2D 基盤フレーム) |
| `<CreoRail>` | Rail column + peek (collapsed⇄expanded)、router-agnostic |
| `railRegistry` | `RailDef` + pure logic (`selectRailId` / `railsByOrder` / `railById`) |
| `regions` | 位置語彙 type (`EdgeRegion` / `CornerRegion` / `Region`) |

Rail registry は consumer 供給 (特定 App の rail を hardcode しない)。Rail 選択 = route が唯一の SSOT。

## creoui rename (2026-05-17) — web v0.20.1 / editor-host v0.5.1

デザインシステムの正式名を `creoui` に統一 ([#41](https://github.com/chronista-club/creoui/pull/41))。`Creo UI` / `creo-ui` / `CreoUI` の散在を廃し、`creoui` を naming SSOT とする。

npm package を rename publish (機能変更なし、patch bump):

| 旧 | 新 |
|---|---|
| `creo-ui-web@0.20.0` | `creoui@0.20.1` |
| `creo-ui-editor-host@0.5.0` | `@chronista-club/creoui-editor-host@0.5.1` |

editor-host が scoped なのは npm の類似名ガード回避（unscoped `creoui-editor-host` は既存 `creo-ui-editor-host` に似すぎて E403）。旧 package は `npm deprecate` で新名へ誘導。Swift module `CreoUI` → `Creoui`、Rust crate `creo-ui` → `creoui`、CSS `creo-icon` → `creoui-icon`、GitHub repo も `creoui` に統一。

## v0.20.0 (2026-05-10) — Phase 2-3 完走 (web、 a11y baseline + 4 family identity polish + opt-in articulate)

Purple Haze design system benchmark report の **Top 1-7 finding を Phase 2-3 全 7 完走** で解消。 v0.18-v0.19 の token / attribute layer 統一 (final) を土台に、 component / foundation layer の **a11y baseline + identity polish + opt-in articulate** を additive で追加。 BREAKING なし、 既存 component / token / attribute は 100% backward compat。

並行で発見された **critical CSS parser bug** (6 日間 silent regression、 全 token resolve 失敗) も同 release で fix。

### Phase 2-3 完走 sequence

| # | PR | finding score | 内容 |
|---|---|---|---|
| 1/7 | #33 focus-ring | ★★★★★ | a11y baseline + Sophisticated layered (WCAG AA + AAA × 8 theme) |
| 2/7 | #34 motion mapping | ★★★★★ | base (5×5) → 11 use-case × 4 axis SSOT alias、 18 component sync |
| 3/7 | #35 state polish | ★★★★ | Skeleton / EmptyState に 4 family identity 追加、 ErrorBoundary 新設 |
| 4/7 | #36 concentric corner | (foundations docs only) | Apple HIG / visionOS 26 spec articulate |
| 5/7 | #37 density mode | ★★★ | 4 mode と直交する第 5 axis (comfortable / default / compact / cozy) |
| 6/7 | #38 iconography | ★★ | 2 system articulate (creo-icon CSS + Iconify SVG) + 4 axis docs |
| 7/7 | #39 kinetic-typography | ★★ | display 限定 dynamic effects (read / editor mode 侵食防止) |

### 追加 — focus-ring (Phase 2-3 #1, ★★★★★)

WCAG 2.4.7 (AA) + 2.4.11 (AAA) を 8 theme 全部で達成。 Apple HIG visionOS 26 concentric layer + Linear "気付かれない polish" hybrid:

- outer 2px solid + inner 4px halo (offset 2px) を `:focus-visible` policy で 19 interactive element に articulate
- `tokens/focus-ring.json` (4 scaffold token: `width` / `offset` / `halo-width` / `style`)
- 8 theme で family hue × luminance 調整 (mint / sora / contrast / oldschool × dark / light)、 全 theme で AAA contrast 確保
- 10 component CSS sweep (hardcode focus rule 削除 → policy 委譲)
- reduced-motion 環境でも ring 自体は表示 (a11y 最優先)、 transition のみ無効化

### 追加 — motion mapping (Phase 2-3 #2, ★★★★★)

base token (5 duration × 5 easing) の主観的組み合わせから **11 use-case × 4 axis SSOT mapping** に articulate。 Material 3 distance-based motion を Creo brand (mint + spring) で reinterpret:

- `tokens/motion/mapping.json` 22 token (use-case × duration|easing alias、 base への参照のみで base を変えれば全 mapping 自動追従)
- 11 use-case: hover / press / toggle / focus-ring / dropdown / modal-enter / modal-exit / page-transition / frame-morph / skeleton-shimmer / progress-indeterminate
- 18 component CSS sync (hardcode duration / easing 削除 → mapping bind)
- 例外 articulate: skeleton / progress の cycle 1.4s は keyframes 専用 (mapping lazy 480ms より長く end-less perception 表現)、 easing のみ mapping 参照

### 追加 — state polish (Phase 2-3 #3, ★★★★)

Skeleton / EmptyState を「neutral surface のみ」 から「4 family identity を whisper で articulate」 に shift。 ErrorBoundary を新 primitive として追加 (loading / empty / error の 3 set 完成):

- **Skeleton**: shimmer peak (50%) に brand-primary-subtle を 60% mix、 4 family theme で identity 表現
- **EmptyState**: subtle radial gradient (brand-primary-subtle 30%) + brand-secondary icon (mint=violet / sora=cyan / contrast=magenta / oldschool=amber) + radius-l で modal-tier surface
- **ErrorBoundary** (新): semantic-error-subtle (70%) + brand-primary-subtle (30%) dual layer、 s/m/l 3 size、 `role="alert"` + `aria-live="assertive"`、 retry / reload / report CTA articulate

### 追加 — density mode (Phase 2-3 #5, ★★★)

4 mode (Typography axis) と直交する **第 5 axis** で同 mode 内の「呼吸量」 を切替可能に:

- `tokens/density.json` 4 density × 3 scale (padding / gap / min-height):
  - comfortable: 1.25 / 1.25 / 1.1 (reading / hero / onboarding)
  - default: 1 / 1 / 1 (base、 backward compat)
  - compact: 0.85 / 0.85 / 0.95 (data table / dashboard、 tap >= 44 維持)
  - cozy: 0.7 / 0.7 / 0.85 (terminal / log viewer、 max info-density)
- `_density.css` で `data-density="..."` を ancestor articulate → CSS variable cascade で内部 component に伝播
- button / input / card に `calc(base * scale)` で適用 (default scale 1 で attribute 無し時は backward compat 完全)

### 追加 — iconography 2 system (Phase 2-3 #6, ★★)

「inline か hero か」 judgement framework articulate:

- **`creo-icon` CSS class 新設**: Nerd Font glyph (~10k)、 mono color、 inline / dense (5 size × 7 semantic variant、 `font-feature-settings` で ligature 無効化 → emoji 色維持)
- **`<Icon>` (creo-ui-icons-web)**: Iconify SVG 9 set、 multi-color、 hero / illustration (既存)
- 2 system 並走で「inline は creo-icon、 hero は Icon」 の judgement basis を articulate

### 追加 — kinetic typography (Phase 2-3 #7, ★★)

2026 dynamic typography trend を **display 限定** で articulate、 read / editor mode の typography stability は厳格保護 (long-form reading の subjective fatigue 防止):

- `_kinetic.css` 3 utility (opt-in):
  - `.creo-kinetic-hero` — `:hover` で letter-spacing / font-weight / slnt 変動 (Variable font、 fallback 対応)
  - `.creo-kinetic-gradient` — brand primary → secondary linear-gradient + `background-clip: text` (static)
  - `.creo-kinetic-reveal` — page load の opacity + translateY animation、 `data-delay` (1/2/3) で staggered
- transition は motion-mapping (frame-morph / modal-enter) bind、 hardcode 禁止
- prefers-reduced-motion で hero / reveal は base 固定 (gradient 維持)
- avoid path articulate: read / editor / terminal mode 侵食禁止、 app mode は controlled (button hover 等限定)

### 追加 — Foundations docs

新 page 6 件 articulate (4 axis × n operational definition + 5 rubric category + Live preview):

- `/foundations/focus-ring`
- `/foundations/motion`
- `/foundations/concentric-corner` (Apple HIG / visionOS 26 spec、 docs only)
- `/foundations/density`
- `/foundations/iconography`
- `/foundations/kinetic-typography`

これで **14 foundations page 揃い** (Principles + Color + Typography + Theming + Spacing + Radius + Shadow + Focus Ring + Motion + Concentric Corner + Density + Iconography + Kinetic Typography)、 Phase 2-3 完走で foundation layer の articulate 完成。

### Bug fix — Chrome CSS parser 閾値回避 (#27)

v0.18 で `:root` block prop 数が 169 に到達、 Chrome の CSS parser が **150+ で block 全体を silently drop** する閾値で **6 日間 silent regression** が進行 (token resolve 全失敗、 全要素 browser default 16px / padding 0 / margin 0 で表示)。

- binary search で localized (line 11-95 / 96-179 を split inject すると両方 parse OK、 169 一括は fail = chrome parser 自体が drop)
- Style Dictionary `transforms/config.web.js` を `commonByCategory` (Map<category, lines[]>) で token.path[0] (= category) ごとに group、 `:root` を **category 別 12 block** に split emit:
  - color / depth / editor-mode / frame / layout / margin / motion / radius / shadow / spacing: 2-22 props
  - typography (最大): 46 props
  - default theme (mint-dark): ~42 props
- 副次 fix: docs.css の stale token 名 sweep (size-base / size-2xl / size-3xl / spacing-2xl) + semantic alias (`title-page` / `body-default` / `layout-gap-section`) 採用 (原則 03 dogfood)
- **Living rule articulate**: 1 `:root` block あたり 50 props 以下 (`mem_1CatH9CfXPpG3Pogx2nZjM` Atlas: Creo UI)

### Stability commitment

v0.18 で「5 tier convention 完全統一の最終 release」 と articulate した stability は **継続**。 v0.20 は全 additive、 既存 token / component / attribute は touch なし。 Phase 2-3 完走で foundation layer の articulate framework が揃ったため、 以降は **新 capability の articulate 追加** または **identity polish 深化** が主軸。

### 関連

- Purple Haze report agentId: `abb25a554fccfedce`
- Phase 2-3 sequence: PR #33 → #34 → #35 → #36 → #37 → #38 → #39 (全 7 完走)
- Foundations docs: 14 page 揃い

---

## v0.19.0 (2026-05-09) — Shells primitives 抽出 (web、 additive、 retroactive entry)

Creo Memories Layered Surface Phase 1 (CREO-160) で確立した layout pattern を **`creo-ui-web/shells` subpath** に primitive 化。 Phase B (CREO-84) の最初の shells release。 Backward compat 完全、 既存 token / component / attribute touch なし。

> **note**: 本 entry は v0.19.0 publish 時に書き漏れていたため v0.20.0 release 時に retroactive で追加。 npm 上の v0.19.0 とは内容一致。

### 追加 — shells subpath exports

新 subpath: `creo-ui-web/shells` (TypeScript / SolidJS):

| primitive | 役割 | bundle |
|---|---|---|
| `<CreoFacetGrid>` | 6 facet narrow form の grid layout (intrinsic top + extrinsic main + sub) | gzip 0.62 kB (JS) |
| `<CreoPageShell>` | max-width 920px wrapper + entrance animation (page fade in) | gzip 0.39 kB (CSS) |

合計 **1 KB 未満** で entrance animation + responsive grid を提供。

### Tree-shaking

`exports` field の subpath 構造で `creo-ui-web/shells` だけ import すれば components.css / tokens.css は引き込まれない。 single library + subpath の design で:

- consumer は `^0.19.0` 1 entry で全 capability access
- modular import で kitchen sink 化を回避
- internal は `src/shells/` `src/components/` で organization 維持

### Consumer

Creo Memories `apps/creo-web` で初 dogfood (creo-memories PR #391)、 net **-22 行** (重複 CSS が primitive へ吸収、 `.memoryPage` + `@keyframes pageFadeIn` + 920px / 480px 重複の 4 ブロック削除)。

### 関連

- Layered Surface Phase 1 vision: `mem_1Cak5rxTFWvLNxjSRiQ1Ak` (Creo Memories Atlas)
- Phase B PR-1 / PR-2 / PR-3 sequence (creo-ui PR #25 #26 + creo-memories PR #391)
- Linear: CREO-84 Phase B (In Progress)

---

## v0.18.0 (2026-05-07) — Component attribute も 5 tier 完全統一 (web、 BREAKING、 attribute layer final)

v0.17.0 で **token layer** の 5 tier convention 完全統一を達成、 v0.18.0 で **component attribute layer** も同 convention に揃え、 ecosystem 全層 (token + CSS var + JS const + Swift identifier + Rust const + HTML attribute) で convention drift が完全解消した状態に到達。

### BREAKING (web 0.18.0)

17 component の HTML attribute を sm/md/lg → s/m/l に rename:

| component | attribute | v0.17.0 → | v0.18.0 |
|---|---|---|---|
| Button / Input / Dialog / Popover / Tabs / Table / Pagination / Skeleton / Progress / Spinner | `data-size` | `sm/md/lg` | `s/m/l` |
| Drawer / Avatar | `data-size` | `sm/md/lg/xl` | `s/m/l/xl` |
| Badge / Breadcrumbs / Stepper / Timeline | `data-size` | `sm/md` | `s/m` |
| Card | `data-padding` | `sm/md/lg` | `s/m/l` |
| Header | `data-elevation` | `sm/md` | `s/m` (`none` 据置) |

`data-variant` / `data-placement` / `data-shape` / `data-cols` / `data-state` 等 5 tier 命名以外の attribute は touch なし。

### Migration

```diff
- <button class="creo-btn" data-size="md">              → <button class="creo-btn" data-size="m">
- <article class="creo-card" data-padding="lg">         → <article class="creo-card" data-padding="l">
- <header class="creo-header" data-elevation="sm">      → <header class="creo-header" data-elevation="s">
```

bulk sd pattern + 完全 table は [`docs/migration/v0.14-to-v0.18.md`](docs/migration/v0.14-to-v0.18.md) 参照。

### token-shim.css extend (legacy CSS variable alias 完備)

v0.18 で `packages/web/dist/token-shim.css` の legacy alias を extend、 v0.16-v0.17 で rename した token (margin / radius / shadow / typography.size / typography.display) も `--margin-md` → `--margin-m` 等の CSS variable alias を網羅。 consumer は `import 'creo-ui-web/token-shim.css'` で **CSS variable 層は段階移行** 可能。 ただし **HTML attribute は shim で吸収不可**、 markup 書換が必要。

### Stability commitment

v0.18 が **5 tier convention 完全統一 (token + attribute) の最終 release**。 「sm/md/lg」 由来の breaking rename は **これ以上発生しない予定**。 以降の breaking change は新 capability 追加時のみ。

---

## v0.17.0 (2026-05-06) — 5 tier convention 完全統一 (web、 BREAKING、 token layer final)

v0.16.0 で部分統一 (spacing / container / grid / icon を `xs/s/m/l/xl`)、 残 token (margin / radius / shadow / typography.size / typography.display) は `xs/sm/md/lg/xl` で violation 残存していたのを v0.17.0 で **完全統一**。 これで Creo UI の全 dimension scale token が `xs/s/m/l/xl` (5 tier) で揃う。

### BREAKING (web 0.17.0)

| token | v0.16.0 → | v0.17.0 |
|---|---|---|
| `--margin-{sm,md,lg}` | (4 tier 違反) | `--margin-{s,m,l}` |
| `--radius-{sm,md,lg}` (+ `none/full`) | (4 tier 違反) | `--radius-{s,m,l}` (+ `none/full`) |
| `--shadow-{sm,md,lg}` (+ `none`) | (4 tier 違反) | `--shadow-{s,m,l}` (+ `none`) |
| `--typography-size-{sm,md,lg}` | (4 tier 違反) | `--typography-size-{s,m,l}` |
| `--typography-display-{sm,md,lg}` | (4 tier 違反) | `--typography-display-{s,m,l}` |

### Migration

```css
/* before (v0.16.0) — DO NOT USE, removed */
margin: var(--margin-md);
border-radius: var(--radius-lg);
box-shadow: var(--shadow-sm);
font-size: var(--typography-size-md);

/* after (v0.17.0) */
margin: var(--margin-m);
border-radius: var(--radius-l);
box-shadow: var(--shadow-s);
font-size: var(--typography-size-m);
```

JS:

```ts
// before (v0.16.0) — removed
import { MarginMd, RadiusLg, ShadowSm, TypographySizeMd } from 'creo-ui-web/tokens.js'

// after (v0.17.0)
import { MarginM, RadiusL, ShadowS, TypographySizeM } from 'creo-ui-web/tokens.js'
```

### Notes (web 0.17.0)
- 値 (= dimension の物理値) は据置、 名前のみ変更。
- `none` / `full` (radius / shadow) と `xs` / `xl` 4 corner は touch なし、 v0.16.0 と意味的に一致。
- ecosystem 全層 (token JSON + CSS components + dogfood docs site + Swift / Rust generated + creo-ui-editor-host jsdoc/test) を 1 commit で sync 完了。 Container 等 Round 1 で先行 rename 済の token は touch なし。

### 後始末
- `examples/docs/src/pages/Foundations/{Spacing,Principles}.tsx` で v0.16 暫定の「margin は historical に sm/md/lg のまま、 後で 5 tier 統一予定」 注記を **削除** (= 統一完了で historical state 解消)。

---

## v0.6.0 (2026-05-06) — 5 tier 完全統一 (rust + swift、 BREAKING)

web v0.17.0 と sync。 Rust const + Swift identifier 両方が rename:

```rust
// before — removed
creo_ui::MARGIN_MD
creo_ui::RADIUS_LG
creo_ui::SHADOW_SM
creo_ui::TYPOGRAPHY_SIZE_MD

// after
creo_ui::MARGIN_M
creo_ui::RADIUS_L
creo_ui::SHADOW_S
creo_ui::TYPOGRAPHY_SIZE_M
```

```swift
// before — removed
CreoUITokens.marginMd
CreoUITokens.radiusLg
Color.shadowSm

// after
CreoUITokens.marginM
CreoUITokens.radiusL
Color.shadowS
```

v0.5.0 (rust) は publish 直後本 session で本問題発覚、 production consumer ゼロ。 v0.6.0 が crates.io / SwiftPM の最初の 5 tier 完全統一 release。

---

## v0.16.0 (2026-05-06) — 5 tier sizing convention 統一 (web、 BREAKING、 partial)

### BREAKING (web 0.16.0)

v0.15.0 で追加した container / grid / icon token + data-size attribute が **Tailwind 流 sm/md/lg/xl の 4 段階** で書かれていたが、 commit `98a5804` (`refactor(spacing): rename sm/md/lg → s/m/l (5 tier 統一)`) で確立された **既存 spacing convention `xs/s/m/l/xl` (5 段階)** に違反していた (PR #24 Round 1 の認識ミス)。

v0.16.0 で **token name + dogfood の data-size attribute 両層** を 5 tier convention に揃える:

#### Token rename + 値拡張

| token | v0.15.0 | v0.16.0 |
|---|---|---|
| `--layout-container-*` | `sm/md/lg/xl` (4 値) | `xs/s/m/l/xl` (5 値、 xs=480 追加) |
| `--layout-grid-col-min-*` | `sm/md/lg` (3 値) | `xs/s/m/l/xl` (5 値、 xs=120 + l=280 + xl=320 追加) |
| `--typography-icon-*` | `md/lg/xl` (3 値) | `xs/s/m/l/xl` (5 値、 xs=16 + s=24 追加) |

#### Migration (consumer side)

```css
/* before (v0.15.0) — DO NOT USE, removed */
max-width: var(--layout-container-md);
font-size: var(--typography-icon-lg);

/* after (v0.16.0) */
max-width: var(--layout-container-m);
font-size: var(--typography-icon-l);
```

```html
<!-- before -->
<div class="creo-container" data-size="md">
<div class="creo-grid" data-cols="auto-md">
<div class="creo-empty-state" data-size="lg">

<!-- after -->
<div class="creo-container" data-size="m">
<div class="creo-grid" data-cols="auto-m">
<div class="creo-empty-state" data-size="l">
```

実 consumer は v0.15.0 install しないまま v0.16.0 直行を推奨 (v0.15.0 は publish 直後 30 分で本問題発覚、 実 production consumer ゼロ)。

### Notes (web 0.16.0)
- `data-padding="s"` / `"l"` は元から convention 準拠で touch なし。 `data-padding="m"` は default 値で attribute 不要。
- empty-state の `data-size` attribute も `s/m/l` (3 段階) に rename。 button / input 等他 component の `data-size` (sm/md/lg) は **別 axis** で本 release 範囲外 (将来別 PR で 5 tier 統一する場合は consumer-breaking change として明示)。
- Swift / Rust generated にも 5 tier rename + 値拡張が伝播。

---

## v0.5.0 (2026-05-06) — New tokens additive (rust + swift)

5 新 token (web v0.16.0 の 5 tier rename と sync):
- `COLOR_SURFACE_SCRIM` / `COLOR_SURFACE_SCRIM_MODAL`
- `LAYOUT_CONTAINER_{XS,S,M,L,XL}` (5 tier、 v0.4.0 の sm/md/lg/xl 4 tier から rename + xs 追加)
- `LAYOUT_GRID_COL_MIN_{XS,S,M,L,XL}` (5 tier、 v0.4.0 の 3 tier から拡張)
- `TYPOGRAPHY_ICON_{XS,S,M,L,XL}` (5 tier、 v0.4.0 の 3 tier から拡張)

const 名 BREAKING (Rust / Swift consumer の `LAYOUT_CONTAINER_SM` 等は無くなる、 `_S` に rename 必要)。 v0.4.0 は publish 直後 (30 分以内) で実 consumer ゼロ、 v0.5.0 直行推奨。

OKLCH alpha (0.4 / 0.5) は依然 opaque RGB に変換 (Phase 3 で alpha 対応検討)。

---

## v0.15.0 (2026-05-06) — A11y reduced-motion full coverage + 5 new tokens (web)

### Added (web 0.15.0)
- **Surface scrim tokens** (modal / drawer backdrop の semantic split):
  - `--color-surface-scrim` (40% black) — drawer / side sheet
  - `--color-surface-scrim-modal` (50% black) — dialog (中央 modal、 強い注意)
- **Layout container tokens** (`--layout-container-{sm,md,lg,xl}` = 640/768/1024/1280px) — page-level max-width SSOT
- **Layout grid tokens** (`--layout-grid-col-min-{sm,md,lg}` = 160/220/320px) — auto-fit grid minmax
- **Typography icon tokens** (`--typography-icon-{md,lg,xl}` = 40/64/96px) — empty-state / illustration icon size

### Changed (web 0.15.0)
- **A11y `prefers-reduced-motion: reduce` guard を 14 全 component に完全適用** — dialog / drawer / tooltip / skeleton (元から or Round 3) + button / card / breadcrumbs / pagination / form-controls / input / header / menu / stepper / segmented / tabs / table (本 PR で追加)。 WCAG 2.1 SC 2.3.3 (Animation from Interactions) + SC 2.3.1 準拠。 spatial transform (switch thumb slide / button press / table sort indicator 等) も全停止。
- `container.css` の `data-size="full"` を `100vw` → `100%` に修正 (scrollbar gutter で水平 scroll する bug fix)。
- `dialog.css::backdrop` の `rgba(0, 0, 0, 0.5)` を `var(--color-surface-scrim-modal)` に置換 (Token SSOT 原則 6 violation の解消)。
- `drawer.css::backdrop` の `rgba(0, 0, 0, 0.4)` を `var(--color-surface-scrim)` に置換。

### Notes (web 0.15.0)
- 全 token additive、 既存 var 名変更なし。 consumer は単純 upgrade で 5 新 token + 14 component の reduced-motion 対応を取得。
- Swift / Rust generated にも新 token が伝播 (creo-ui-swift / creo-ui Rust crate も同 PR で bump)。

---

## v0.5.0 (2026-05-06) — Public type exports + DEV-gated console (editor-host)

### Added (editor-host 0.5.0)
- Public type re-exports (consumer が config / host を annotate 可能に):
  - `EditorHostConfig` — `<EditorHostProvider>` の config prop 型
  - `EditorShortcut` — `config.shortcut` の型 (`{ ctrl?, shift?, alt?, meta?, key }`)
  - `EditorHost` — `useEditorHost()` 戻り値
  - `EditorHostMcpApi` — `host.mcp` の AI agent 向け subset
  - `EditorField` / `EditorFieldType` / `EditorFieldConstraints` — field 宣言用

### Changed (editor-host 0.5.0、 behavior change — consumer 確認必要)
- **`config.exposeConsole` の default を `import.meta.env.DEV` に変更** (CLAUDE.md EH-6 規定への準拠)。 これまで production build でも `window.creoEditor` が expose されていたが、 production では default `false`、 dev (Vite) では default `true`。 production で意図的に expose したい consumer は明示的に `config={{ exposeConsole: true }}` を渡す。
- `morphFrame()` (frame package、 別 bump 0.1.1) の cancel 挙動 contract 変更も併せて参照。

### Notes (editor-host 0.5.0)
- `provider.tsx` の DEV gating は `Boolean(import.meta.env?.DEV)` で defensive cast、 Vite 以外の consumer 環境でも `undefined → false` で **安全 fail (production 扱い)** する。
- Vite consumer は `vite/client` types を tsconfig に含めると completion が効く。

---

## v0.1.1 (2026-05-06) — morphFrame cancel graceful skip + JSDoc (frame)

### Fixed (frame 0.1.1)
- **`morphFrame()` が cancel された animation で全体 throw しない** — 内部実装を `Promise.all` から `Promise.allSettled` に変更。 1 個の `animation.cancel()` (B-γ で in-flight setFrame 上書き / Provider unmount race 等) で全体 reject していた挙動を、 cancel された animation のみ skip し完走 animation のみ返す挙動に修正。 caller は try/catch なしで `await morphFrame(...)` 可能。

### Documented (frame 0.1.1)
- `morph.ts` JSDoc に **Cancel / unmount 時の挙動 contract** を明記 (cancel された animation は graceful skip、 fulfilled animation のみ結果に含む)。
- `spring.ts` JSDoc に過減衰近似の精度限界を明記 (damping ≥ 1 で physically-correct な hyperbolic 解と分岐していない件、 視覚的影響最小だが将来の精度向上 path として明示)。

### Test (frame 0.1.1)
- `morph.test.ts` に cancel / rejection graceful skip test 2 件追加 (single cancel / mixed cancel + fulfilled)。

---

## v0.4.0 (2026-05-06) — New tokens additive (rust + swift)

### Added (rust 0.4.0 / swift 0.4.0)
- 5 新 token (web v0.15.0 の token 追加と sync):
  - `COLOR_SURFACE_SCRIM` / `COLOR_SURFACE_SCRIM_MODAL`
  - `LAYOUT_CONTAINER_{SM,MD,LG,XL}`
  - `LAYOUT_GRID_COL_MIN_{SM,MD,LG}`
  - `TYPOGRAPHY_ICON_{MD,LG,XL}`
- Swift: 同等の `Color.colorSurfaceScrim` 等 + `CreoUITokens.layoutContainerMd` 等の CGFloat extension。

### Notes (rust 0.4.0 / swift 0.4.0)
- OKLCH alpha (0.4 / 0.5) は Swift / Rust の現 custom format で **opaque RGB に変換** される (alpha drop)。 Phase 3 で alpha 対応検討、 現状は限界として CHANGELOG に明記。
- Web は OKLCH literal で emit、 modern browser が直接解釈。

---

## v0.14.0 (2026-04-26) — Mode-based Typography Family

### Added (web)
- **Mode-based typography family tokens** (6 keys):
  - `--typography-family-app` — App UI chrome (sidebar / button / dialog / tab)。JetBrainsMono Nerd Font Mono + PlemolJP fallback。
  - `--typography-family-read` — 読み専用表示 (memory view / chat history / canvas markdown)。PlemolJP 主軸、CJK 完全等幅統一。
  - `--typography-family-editor` (default) — textarea / Markdown editor / chat input。iA Writer Duo Nerd Font Mono の Duospace。
  - `--typography-family-editor-mono` — 純粋 mono 派 (iA Writer Mono)。
  - `--typography-family-editor-quattro` — semi-proportional 派 (iA Writer Quattro、長文散文)。
  - `--typography-family-terminal` — xterm.js 用 (app と同じ stack だが意味的に分離)。
- 同等の Swift token: `Color.typographyFamilyApp` 等 — `packages/swift/Sources/CreoUI/Generated/Tokens.swift`
- 同等の Rust token: `TYPOGRAPHY_FAMILY_APP` 等 — `packages/rust/src/generated/tokens.rs`

### Notes
- 既存の `sans / mono / mono-{legible,retro,corporate,display} / display / icon` token は **back compat で残置**。consumer は段階的に mode-based に移行可。
- フォント WOFF2 bundle は本 version では **同梱しない** (Phase F2 で別 PR)。当面は consumer (VP 等) 側で system install or 個別 bundle が必要。
- ライセンス: 採用 font は全て **OFL 1.1** (JetBrains Mono Nerd Font / iA Writer Mono/Duo/Quattro / PlemolJP) — 将来 bundle 時は `THIRD_PARTY_NOTICES.md` で表記予定。

### 設計起点
- 「書く時は writer 思想 (iA Writer)、読む時は和文重視 (PlemolJP)、UI は dev tool 感 (JetBrainsMono)」を font swap で UX に乗せる。
- VP (vantage-point) の AI native dev environment コンセプトに合わせ、monospace UI で「IDE / terminal で work する場」感を最大化。

### Phase 計画
- **F1 (本 PR)**: token 追加 + version bump 0.14.0 + CHANGELOG (token-only)
- **F2**: `packages/web/dist/fonts/` に WOFF2 bundle + `@font-face` CSS + LICENSE 通知
- **F3**: iA Writer Mono / Quattro 素 OFL 追加 (editor catalog option)
- **F4**: `packages/editor-host/` で mode 切替 runtime UI
- **F5**: VP 側 (vantage-point installer) で creo-ui v0.14+ + WOFF2 同梱
