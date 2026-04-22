# creo-ui-editor-host

Creo UI — Editor Mode reference runtime for SolidJS. Target × Control 分離設計で **データ源と UI 操作体系を直交化**、`bind()` 1 本で field を宣言する high-level API。

[docs/design/editor-mode.md](https://github.com/chronista-club/creo-ui/blob/main/docs/design/editor-mode.md) (D-1〜D-12) の protocol を実装。

## インストール

```bash
bun add creo-ui-editor-host creo-ui-web solid-js
```

Peer: `solid-js ^1.9.0`。`creo-ui-web/tokens.css` を app で import しておくと、Editor Layer が `--editor-mode-*` / `--color-*` token を consume する。

## Quick start

```tsx
import { createSignal } from 'solid-js'
import 'creo-ui-web/tokens.css'
import {
  bind,
  cssVarNumberTarget,
  signalTarget,
  editorHostTarget,
  number,
  color,
  select,
  EditorHostProvider,
  EditorLayer,
  useEditorHost,
  useEditorSelectable,
} from 'creo-ui-editor-host'

export default function App() {
  return (
    <EditorHostProvider>
      <Main />
      <EditorLayer />
    </EditorHostProvider>
  )
}

function Main() {
  // (1) CSS 変数を slider で編集 (Target: cssVarNumber × Control: number slider)
  const spacing = bind({
    target: cssVarNumberTarget('tokens.spacing.md', '--spacing-md', 16, 'px'),
    control: number({ min: 0, max: 48, step: 1, unit: 'px', variant: 'slider' }),
    placement: { label: 'spacing.md', semantic: 'tool', order: 0 },
  })

  // (2) 自前 signal を color picker で編集
  const [bg, setBg] = createSignal('#73e7aa')
  const cardBg = bind({
    target: signalTarget('card.bg', bg, setBg),
    control: color({ variant: 'picker' }),
    placement: { label: 'BG', semantic: 'tool', order: 1 },
  })

  // (3) theme mode を segmented control で切替
  const host = useEditorHost()
  const theme = bind({
    target: editorHostTarget('theme.mode', host, 'mint-dark'),
    control: select(
      ['mint-dark', 'mint-light', 'sora-dark', 'sora-light',
       'contrast-dark', 'contrast-light', 'oldschool-dark', 'oldschool-light'],
      'dropdown',
    ),
    placement: { label: 'テーマ', semantic: 'global', order: -10 },
  })

  return (
    <article
      ref={useEditorSelectable({ binders: [spacing, cardBg] })}
      style={{ padding: `${spacing()}px`, background: cardBg() }}
    >
      <p>spacing = {spacing()}px, bg = {cardBg()}, theme = {theme()}</p>
    </article>
  )
}
```

`Ctrl+Shift+E` で Editor Mode ON、TOP に `theme` select、LEFT に ThemeEditor (active theme の swatch)、RIGHT に `spacing` slider と `bg` color picker が自動で現れる。

## コンセプト: Target × Control の 2 軸

| 軸 | 責務 | factory 例 |
|----|------|-----------|
| **Target** (データ源) | "何をどこから read/write" | `cssVarTarget` / `cssVarNumberTarget` / `signalTarget` / `localStorageTarget` / `ephemeralTarget` / `editorHostTarget` |
| **Control** (UI 操作体系) | "どう編集するか (widget)" | `number` / `color` / `boolean` / `select` / `string` / `readonlyText` |

直交なので、7 × 6 = **42 種の編集体験** を factory 組み合わせだけで作れる。新 Target source (GraphQL / SurrealDB / WebSocket) や新 Control widget (oklch-sliders / gradient stops / bezier) は既存を touch せず追加可能。

```
bind({ target: T, control: C, placement: P })
       └───data───┘└───UI───┘ └──配置──┘
```

## 4 方向 semantic layout (D-2 / D-3)

| Region | Semantic | 用途 |
|--------|----------|------|
| **TOP** | `global` | 全体設定 / 視線の起点 (theme select / shortcut hint) |
| **LEFT** | `source` | 時系列過去 / 参照 (ThemeEditor) |
| **RIGHT** | `tool` | 時系列未来 / ツール (field slider / picker panel) |
| **BOTTOM** | `utility` | ローカル utility (batch / AI chat — Phase 2 で充実) |

Placement `semantic` で field がどの region に出るか決まる。

## Content 非侵襲 (D-6)

Editor Layer は Content layer の座標・可視性を奪わない:

- `pointer-events: none` baseline、4 region のみ `auto`
- Mode OFF で `visibility: hidden` (Content は 100% 通常動作)
- 4 region は `color-mix(in oklch, ...)` で半透明 + `backdrop-filter: blur(...)`
- Mode ON/OFF で Content の DOM / layout / scroll 位置は不変

## Manual toggle のみ (D-7)

- `Ctrl+Shift+E` — Mode 切替 (configurable via `config.shortcut`)
- `Escape` — selection 解除 → Mode OFF の 2 段階退出
- `host.toggle()` / `host.mcp.enable()` — programmatic

自動 ON (hover 等) は存在しない。

## AI agent ready (D-10)

`useEditorHost().mcp` に `listFields` / `getValue` / `setValue` / `mode` / `enable` / `disable` を expose。Phase 2b の `creo-ui-editor-host-mcp` (予定) がこれを stdio MCP server として公開、Claude 等から直接 field を操作できる。

```tsx
const host = useEditorHost()
host.mcp.setValue('tokens.spacing.md', 24)  // 外部から書換、chain が走る
```

## API Reference

### `<EditorHostProvider config?>`

```tsx
<EditorHostProvider config={{
  shortcut: { ctrl: true, shift: true, key: 'e' },
  localStorageNamespace: 'my-app',
  initialMode: 'off',
}}>
  {children}
</EditorHostProvider>
```

### Target factories

| Factory | 説明 |
|---------|------|
| `cssVarTarget(id, cssVar, initial)` | CSS custom property を string で read/write |
| `cssVarNumberTarget(id, cssVar, initial, unit='px')` | CSS 変数を number + unit で書く (slider と相性◎) |
| `signalTarget(id, accessor, setter)` | SolidJS signal に直結 |
| `localStorageTarget(id, initial, namespace?)` | localStorage に JSON 永続化 |
| `ephemeralTarget(id, initial)` | in-memory + subscribe 対応 |
| `editorHostTarget(id, host, initial)` | host.values に直結 (mcp / subscribe 全部委譲) |

Custom Target は `Target<T>` を満たせば OK:
```ts
interface Target<T> {
  id: string; initial: T
  get(): T; set(value: T): void
  subscribe?(listener: (value: T) => void): () => void
}
```

### Control factories

| Factory | Variant | Kind |
|---------|---------|------|
| `number(opts?)` | `'slider' \| 'input' \| 'stepper'` | number |
| `color(opts?)` | `'picker' \| 'oklch-sliders' \| 'palette'` | color |
| `boolean(opts?)` | `'switch' \| 'checkbox'` | boolean |
| `select(options, variant?)` | `'dropdown' \| 'segmented'` | select |
| `string(variant?)` | `'input' \| 'textarea'` | string |
| `readonlyText()` | — | readonly-text |

### `bind({ target, control, placement })` → `Binder<T>`

```ts
interface Binder<T> extends Accessor<T> {
  set(value: T): void              // host 経由の 2-way sync で書き込み
  readonly id: string
  readonly target: Target<T>
  readonly control: Control<T>
  readonly placement: Placement
  selectable(): (el: HTMLElement) => void  // ref callback
}
```

Accessor として読み、`.set()` で書き、`.selectable()` で selection ref を取る。

### Hooks

| Hook | 用途 |
|------|------|
| `useEditorHost()` | host 直接取得 |
| `useEditorMode()` | `Accessor<'on' \| 'off'>` |
| `useEditorSelection()` | `Accessor<SelectionInfo \| null>` |
| `useEditorHover()` | `Accessor<SelectionInfo \| null>` |
| `useEditorSelectable({ binders, id? })` | `ref={...}` 用 callback。binder 配列から `data-editor-fields` を set |

### Theme meta

8 theme (4 family × light/dark) の公式 meta は `creo-ui-web@0.1.0` に同梱。consumer は `THEME_INFO[themeId]` で取得。

```tsx
import { THEME_INFO, THEME_IDS, DEFAULT_THEME_ID, SWATCH_ROWS } from 'creo-ui-editor-host'
```

## ファイル構成

```
src/
├── index.ts              public API
├── types.ts              internal: EditorField / EditorHost / SelectionInfo
├── host.ts               internal: createEditorHost() core state
├── host.test.ts          19 cases (core)
├── selection.ts          internal: DOM hover/click + ResizeObserver
├── shortcut.ts           internal: Ctrl+Shift+E handler
├── provider.tsx          <EditorHostProvider> + useEditorHost()
├── hooks.ts              public hooks (useEditorMode / Selectable 等)
├── target.ts             ⭐ Target interface + 6 factory
├── target.test.ts        8 cases
├── control.ts            ⭐ Control types + 6 factory
├── control.test.ts       5 cases
├── binder.ts             ⭐ bind() conductor
├── fields.tsx            internal: FieldEditor (Control kind で分岐)
├── theme-editor.tsx      ThemeEditor (LEFT region 実装)
├── theme-info.ts         8 theme meta + SWATCH_ROWS
└── layer.tsx             <EditorLayer> 4 region overlay root
```

## Roadmap

- ✅ Step 1-4: core state / handlers / UI / README
- ✅ Step 5: Target × Control 分離 + `bind()`
- ⏳ Step 6: `editor-host-v0.1.0` publish + examples/web-demo を consumer に rewrite
- 📋 M4: MCP server (`editor_mode_*` stdio tool)
- 📋 M5: Swift runtime (SwiftUI + NSAppearance)
- 📋 M6: Custom Control plugin (oklch-sliders / gradient / spline)

## License

Apache-2.0 — [LICENSE](https://github.com/chronista-club/creo-ui/blob/main/LICENSE)
