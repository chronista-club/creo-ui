# Button

> creo-ui MVP component. CSS クラス + data attribute で variant / size / state を表現。
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
| `data-variant` | `primary` / `secondary` / `outline` / `ghost` / `danger` | `primary` | 視覚的強度 (下表参照) |
| `data-size` | `s` / `m` / `l` | `m` | 5 tier convention 中央の md が標準 |
| `disabled` | (boolean) | — | 通常の HTML 属性、pointer-events: none + opacity |
| `aria-pressed` | `"true"` / `"false"` | — | toggle-button 用、視覚的に active state |

### Variant の識別子 (各 variant は identity を 1 つだけ持つ)

強度 ladder は primary > secondary > outline > ghost。secondary と outline は
「fill か border か」の分業で、同じ identity を共有しない:

| variant | identity | rest の見た目 |
|---|---|---|
| `primary` | brand fill + glow | chroma-boosted solid + subtle glow |
| `secondary` | **fill** (border 無し) | `--surface-veil-2` の tonal pill |
| `outline` | **border** (fill 無し) | transparent + `color.surface.border`、hover で border が brand に灯る |
| `ghost` | 無 (hover で現れる) | transparent、hover で `--surface-veil-1` |
| `danger` | semantic-error fill | destructive action 専用 |

secondary の fill が veil (相対値) なのは、絶対 token だと bg-subtle の面 (card /
panel) 上で fill が消え、outline と見分けられなくなるため。

## Token reference (DTCG)

| slot | token |
|---|---|
| background (primary) | `--fill-brand` (chroma boost 導出) / hover → `--fill-brand-hover` |
| background (secondary) | `--surface-veil-2` / hover → `--surface-veil-3` (border 無し) |
| background (outline) | `transparent` + `color.surface.border` 1px / hover bg `--surface-veil-1` |
| background (ghost) | `transparent` / hover → `--surface-veil-1` |
| label color | `color.text.primary` (primary / danger 上は `--on-fill-*` の auto on-color) |
| font-size | `typography.size.m` (sm variant は `size.sm`、lg は `size.lg`) |
| font-weight | `typography.weight.medium` |
| padding horizontal | `spacing.m` (sm: `spacing.s`、lg: `spacing.l`) |
| padding vertical | `spacing.xs` (sm) / `spacing.s` (md) / `spacing.m` (lg) |
| gap (icon + label) | `layout.gap.tight` |
| border-radius | `radius.s` |
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
<button class="creo-btn" data-variant="secondary" data-size="s">キャンセル</button>

<!-- Ghost, large, toggle -->
<button class="creo-btn" data-variant="ghost" data-size="l" aria-pressed="true">
  Editor Mode ON
</button>

<!-- Disabled -->
<button class="creo-btn" data-variant="primary" disabled>Saving…</button>
```

## Editor Mode 連携

Editor Mode ON で Button を click すると RIGHT region に以下 field が登場 (web-demo 実装例):

- `data-variant` chooser (`primary` / `secondary` / `ghost`)
- `data-size` chooser (`s` / `m` / `l`)
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

- [component catalog](./README.md)
