# Creo UI — Component Index

CSS クラス + data attribute で variant / size / state を表現する MVP component 群。
token SSOT (`creo-ui-web/tokens.css`) を必ず一緒に import すること。

## MVP (0.3.0+)

| Component | Spec | CSS | 主な variant |
|-----------|------|-----|-------------|
| Button | [button.md](./button.md) | `.creo-btn` | primary / secondary / ghost × sm / md / lg |
| Card | [card.md](./card.md) | `.creo-card` | default / elevated / outlined |
| Input | [input.md](./input.md) | `.creo-input` | bordered / filled × sm / md / lg |
| Header | [header.md](./header.md) | `.creo-header` | app / marketing |

## 0.4.0+ (2 追加)

| Component | Spec | CSS | 主な variant |
|-----------|------|-----|-------------|
| FormField (utility) | [form-field.md](./form-field.md) | `.creo-form-field` + `-label` + `-required` | wrapper-only、label+input+helper stack |
| Tabs | [tabs.md](./tabs.md) | `.creo-tabs` + `-list` + `-tab` + `-panel` | underline / pill × sm / md / lg |

## 0.5.0+ (6 追加)

| Component | Spec | CSS | 主な variant |
|-----------|------|-----|-------------|
| Dialog | [dialog.md](./dialog.md) | `.creo-dialog` + `-header/-title/-body/-footer` (native `<dialog>`) | sm / md / lg × default / destructive、backdrop blur |
| Checkbox | [form-controls.md](./form-controls.md) | `.creo-checkbox` + `-input` (accent-color brand) | native |
| Radio | [form-controls.md](./form-controls.md) | `.creo-radio` + `-input` (accent-color brand) | native |
| Switch | [form-controls.md](./form-controls.md) | `.creo-switch` + `-track/-thumb` (custom toggle) | 44×24 pill |
| Avatar | [avatar.md](./avatar.md) | `.creo-avatar` + `-image/-initials/-status` | circle / square × sm / md / lg / xl + 4 status |
| Badge | [badge.md](./badge.md) | `.creo-badge` | neutral / brand / success / warning / error / info × sm / md × pill / square |
| Segmented | [segmented.md](./segmented.md) | `.creo-segmented` + `-option` | button group / radio group × fit / full × sm / md / lg |

## 0.6.0+ (5 追加)

| Component | Spec | CSS | 主な variant |
|-----------|------|-----|-------------|
| Tooltip | [tooltip.md](./tooltip.md) | `.creo-tooltip` + `-content` (CSS-only、hover/focus) | 4 placement × default/inverse |
| Progress | [progress.md](./progress.md) | `.creo-progress` + `-fill` | sm/md/lg × brand/success/warning/error + indeterminate |
| Spinner | [progress.md](./progress.md) | `.creo-spinner` | sm/md/lg × brand/neutral、prefers-reduced-motion 対応 |
| Toast | [toast.md](./toast.md) | `.creo-toast-region` + `.creo-toast` + `-icon/-content/-close` | 6 placement × 5 variant (default/success/warning/error/info) |
| Menu | [menu.md](./menu.md) | `.creo-menu` + `-item/-separator/-label` (native popover) | default/destructive item |
| Accordion | [accordion.md](./accordion.md) | `.creo-accordion` + `-summary/-title/-content` (native details/summary) | bordered/subtle × open |

## 共通設計方針

### Framework agnostic (CSS + data attribute)

Web Components (custom elements) ではなく **CSS クラス + data attribute** を採用。
理由:
- React / Vue / Solid / 生 HTML どれでも使える
- JS runtime 不要、SSR/SSG で無コスト
- Editor Mode の `data-editor-fields` と自然に整合
- consumer は既存コンポーネントライブラリ (shadcn/ui, Radix 等) の上に乗せることも可能

### data-* 属性で variant / size を表現

```html
<button class="creo-btn" data-variant="primary" data-size="md">Click</button>
```

理由:
- HTML attribute なので DevTools / Editor Mode で可視 + 編集可能
- React/Vue は props → attributes が自然 (`<Button variant="primary">` → `<button data-variant="primary">`)
- BEM (`creo-btn--primary--md`) よりクラス連打が短い

### Token SSOT (DTCG) 経由のみ

component CSS 内で **hardcode の px / 色は禁止**。必ず `var(--...)` 経由。
これにより:
- consumer が theme 切替で全 component 追従
- Editor Mode で token を tune → 全 component が live 反映
- Swift / Rust 側も同じ token 値を見る (cross-platform 一貫性)

### 5-step size-feel rule に沿う

sm / md / lg の size variant は token の xs-xl の中から 3 段抜粋した慣習。
component ごとに sm/md/lg が何を参照するかは各 spec の Token reference 表を参照。

### Apple HIG 要素

- `layout.target.tap` (44pt) を min-height の default に
- `layout.target.focus` (32pt) を dense UI (sm variant) で使用
- `concentric()` helper (editor-host) で親子 radius を揃えやすく

## 新 component 追加手順

1. `docs/components/<name>.md` に spec を書く (Purpose / Anatomy / Props / Token reference / A11y / Do-Don't / 使用例)
2. `packages/web/src/components/<name>.css` に CSS を書く (全 token 経由、variant は data-*)
3. `bun run build:web` で bundler が自動的に `packages/web/dist/components.css` に concat
4. web-demo で showcase section を増やして visual check
5. commit 1 つ、`feat(components): <name> MVP`

## 将来 (0.7.0+ 候補)

- Table (dense data、sort / filter / pagination)
- Popover (interactive content)
- Command palette (⌘K)
- Combobox / Autocomplete
- Date / Time picker
- Drawer (side sheet)
- Stepper

## 関連

- [CREO-84](https://linear.app/chronista/issue/CREO-84) Epic
- [CREO-87](https://linear.app/chronista/issue/CREO-87) Phase 2 spec
- [CREO-88](https://linear.app/chronista/issue/CREO-88) Phase 3 Web impl
