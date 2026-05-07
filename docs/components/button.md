# Button

> Creo UI MVP component. CSS クラス + data attribute で variant / size / state を表現。
> Framework agnostic (React / Vue / Solid / 生 HTML で動く)。

## Purpose

user intent を起動するための atomic action trigger。typography と color token が最も目立つ形で出る "digital handshake" 的な UI element。

## Anatomy

```
┌─────────────────────────┐
│ [icon?] Label [icon?]   │  ← padding: layout-gap-sibling (tight)
└─────────────────────────┘
 ↑
 min-height: layout-target-tap (44pt Apple HIG) — 誤タップ防止
 border-radius: radius-sm (8px、柔らかい Creo 感)
```

## Props (data attributes)

| attr | 値 | default | 意味 |
|---|---|---|---|
| `data-variant` | `primary` / `secondary` / `ghost` | `primary` | 視覚的強度 |
| `data-size` | `sm` / `md` / `lg` | `md` | 5-step rule 中央の md が標準 |
| `disabled` | (boolean) | — | 通常の HTML 属性、pointer-events: none + opacity |
| `aria-pressed` | `"true"` / `"false"` | — | toggle-button 用、視覚的に active state |

## Token reference (DTCG)

| slot | token |
|---|---|
| background (primary) | `color.brand.primary` / hover → `color.brand.primary-hover` |
| background (secondary) | `color.surface.surface` + `color.surface.border` 1px |
| background (ghost) | `transparent` + hover `color.surface.surface-muted` |
| label color | `color.text.primary` (inverse on primary: `color.surface.bg-base`) |
| font-size | `typography.size.md` (sm variant は `size.sm`、lg は `size.lg`) |
| font-weight | `typography.weight.medium` |
| padding horizontal | `spacing.m` (sm: `spacing.s`、lg: `spacing.l`) |
| padding vertical | `spacing.xs` (sm) / `spacing.s` (md) / `spacing.m` (lg) |
| gap (icon + label) | `layout.gap.tight` |
| border-radius | `radius.sm` |
| min-height | `layout.target.tap` (md/lg) / `layout.target.focus` (sm) |
| focus ring | `color.brand.primary`, outline 2px, offset 2px |
| transition | 120ms ease (background, transform) |

## Accessibility

- semantic: `<button>` element を使う (`<a>` で見た目だけ真似しない)
- keyboard: `Tab` でフォーカス、`Enter` / `Space` で activate (ネイティブ挙動)
- `:focus-visible` で focus ring を出す (pointer click では出さない)
- disabled: `disabled` 属性 (aria-disabled ではなく真の disabled を優先)
- toggle button: `aria-pressed="true" | "false"` を付与
- minimum tap size: md / lg variant は自動的に 44pt 以上 (Apple HIG)

## Do / Don't

### Do
- primary は **page 内で最大 1 つ** (明確な次アクション)
- secondary は **代替アクション** (キャンセル、戻る)
- ghost は **密度の高い UI** (toolbar、inline action)
- 44pt tap target を守る (モバイル対応の最低ライン)

### Don't
- primary を乱発しない (視覚的 hierarchy が崩れる)
- ghost を primary 的に使わない (起動の強度が弱い)
- button を link 代わりに使わない (別 resource へ navigate するなら `<a>`)
- hardcode の px / 色を書かない (必ず token 経由)

## 使用例 (HTML)

```html
<!-- Primary, default size -->
<button class="creo-btn" data-variant="primary">保存</button>

<!-- Secondary, small -->
<button class="creo-btn" data-variant="secondary" data-size="sm">キャンセル</button>

<!-- Ghost, large, toggle -->
<button class="creo-btn" data-variant="ghost" data-size="lg" aria-pressed="true">
  Editor Mode ON
</button>

<!-- Disabled -->
<button class="creo-btn" data-variant="primary" disabled>Saving…</button>
```

## Editor Mode 連携

Editor Mode ON で Button を click すると RIGHT region に以下 field が登場 (web-demo 実装例):

- `data-variant` chooser (`primary` / `secondary` / `ghost`)
- `data-size` chooser (`sm` / `md` / `lg`)
- `aria-pressed` flip (toggle)

concentric helper で inner icon の radius を button radius に合わせる recipe も提供予定。

## Figma

TBD (CREO-87 受け入れ条件で別タスク)。

## 依存 token カテゴリ

- `color.brand.*` / `color.surface.*` / `color.text.*`
- `spacing.*` / `layout.gap.*` / `layout.target.*`
- `typography.size.*` / `typography.weight.*`
- `radius.*`

## 関連

- [CREO-84](https://linear.app/chronista/issue/CREO-84) (Epic)
- [CREO-87](https://linear.app/chronista/issue/CREO-87) (Phase 2 spec)
- [CREO-88](https://linear.app/chronista/issue/CREO-88) (Phase 3 Web impl)
