# creo-ui-editor-host

Creo UI — Editor Mode reference runtime for SolidJS.

**Status**: Phase 2a, pre-release (`0.0.0`).

[docs/design/editor-mode.md](https://github.com/chronista-club/creo-ui/blob/main/docs/design/editor-mode.md) (D-1〜D-12) で規定された Editor Mode protocol を実装する SolidJS runtime。

`<EditorHostProvider>` + `<EditorLayer>` を app root に置けば、Ctrl+Shift+E で Mode ON / 4 方向 semantic layout (TOP global / LEFT source / RIGHT tool / BOTTOM utility) / selection / Content 非侵襲 overlay が即動作する。

## インストール

```bash
bun add creo-ui-editor-host creo-ui-web solid-js
```

Peer dep: `solid-js ^1.9.0`。`creo-ui-web` の `tokens.css` を app で import しておくと、Editor Layer が `--editor-mode-*` / `--color-*` の token を consume する。

## Quick start

```tsx
import { onMount } from 'solid-js'
import 'creo-ui-web/tokens.css'
import {
  EditorHostProvider,
  EditorLayer,
  useEditorFields,
  useEditorSelectable,
  useEditorValue,
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
  useEditorFields([
    // TOP (global) — theme 切替
    {
      id: 'theme.mode',
      label: 'テーマ',
      type: 'select',
      semantic: 'global',
      initial: 'mint-dark',
      constraints: {
        options: [
          'mint-dark', 'mint-light',
          'sora-dark', 'sora-light',
          'contrast-dark', 'contrast-light',
          'oldschool-dark', 'oldschool-light',
        ],
      },
      apply: (v) => document.documentElement.setAttribute('data-theme', String(v)),
    },
    // RIGHT (tool) — token slider
    {
      id: 'tokens.spacing.md',
      label: 'spacing.md',
      type: 'number',
      semantic: 'tool',
      initial: 16,
      constraints: { min: 0, max: 48, step: 1, unit: 'px' },
      cssVar: '--spacing-md',
    },
  ])

  const spacing = useEditorValue<number>('tokens.spacing.md')
  const ref = useEditorSelectable({ fieldIds: ['tokens.spacing.md'] })

  return (
    <article
      ref={ref}
      style={{ padding: `${spacing() ?? 16}px`, 'max-width': '720px', margin: '0 auto' }}
    >
      <h1>Hello Creo</h1>
      <p>
        Press <kbd>Ctrl+Shift+E</kbd> で Editor Mode ON。card を click で selection、
        右の slider で spacing を live 編集。
      </p>
    </article>
  )
}
```

## Core concepts

### Editor Mode

**ユニバーサルな state** (`'on'` / `'off'`)。OFF では Editor Layer は完全に不可視、Content は 100% そのまま。ON で 4 region overlay が現れる。

### 4 semantic regions (docs/design/editor-mode.md D-2 / D-3)

| Region | Semantic | 意味 | 用途 |
|--------|----------|------|------|
| TOP | `global` | 全体設定 / 視線の起点 | theme select、mode hint |
| LEFT | `source` | 時系列過去 / 参照 | ThemeEditor (active theme の swatch) |
| RIGHT | `tool` | 時系列未来 / ツール | field slider / picker panel |
| BOTTOM | `utility` | ローカル utility | batch / AI chat (Phase 2) |

### Content 非侵襲 (D-6)

Editor Layer は Content の座標・可視性を奪わない:
- `pointer-events: none` を baseline、4 region だけ `auto`
- `visibility: hidden` で OFF 時は完全透過
- 4 region の background は `color-mix(...)` で半透明、`backdrop-filter: blur(...)` で Content を薄く透かす

### Manual toggle のみ (D-7)

Mode の自動 ON は禁止。`Ctrl+Shift+E` / `Escape` / `host.toggle()` / MCP agent から明示的に切替。

### AI agent ready (D-10)

`host.mcp` に `listFields` / `getValue` / `setValue` / `mode` / `enable` / `disable` を expose。Phase 2b の `creo-ui-editor-host-mcp` (予定) がこの subset を stdio MCP server として公開し、Claude 等から直接 field を操作可能になる。

## API

### Provider

```tsx
<EditorHostProvider config={{ shortcut?, localStorageNamespace?, initialMode? }}>
  {children}
</EditorHostProvider>
```

- `config.shortcut`: 既定 `{ ctrl: true, shift: true, key: 'e' }`
- `config.localStorageNamespace`: 既定 `'creo-ui-editor-host'` (persistence: 'localStorage' field の key prefix)
- `config.initialMode`: 既定 `'off'`
- `host` prop で外部作成 host を差し込み可 (testing 用)

### Hooks

| Hook | 戻り値 | 用途 |
|------|--------|------|
| `useEditorHost()` | `EditorHost` | host object 直接取得 |
| `useEditorFields(fields)` | `void` | mount で register、unmount で unregister |
| `useEditorValue<T>(id)` | `Accessor<T \| undefined>` | 特定 field の reactive 値 |
| `useEditorSelectable({ fieldIds, id? })` | `(el) => void` | `ref={...}` で要素を selectable に |
| `useEditorMode()` | `Accessor<'on' \| 'off'>` | Mode の reactive state |
| `useEditorSelection()` | `Accessor<SelectionInfo \| null>` | 選択中要素の info |
| `useEditorHover()` | `Accessor<SelectionInfo \| null>` | hover 中要素の info |

### Field definition

```ts
interface EditorField<T = any> {
  id: string               // 一意、例 "tokens.spacing.md"
  label: string            // UI 表示名
  type: 'number' | 'color' | 'string' | 'boolean' | 'select' | 'readonly-text'
  semantic: 'global' | 'source' | 'tool' | 'utility'
  initial: T               // 初期値 (persistence で上書き可能)
  constraints?: { min, max, step, unit, options }
  group?: string           // 同 semantic 内での見出し
  role?: 'dev' | 'user' | 'agent'  // 想定利用者
  persistence?: 'ephemeral' | 'localStorage' | 'user-scoped' | 'per-project'
  order?: number           // 同 region 内での sort hint
  cssVar?: string          // CSS 変数に書き戻す (例 "--spacing-md")
  apply?: (value: T) => void  // cssVar 以外の副作用 (DOM attribute / API call)
}
```

### Low-level (provider を使わない場合)

```ts
const host = createEditorHost({ localStorageNamespace: 'my-app' })
const uninstallShortcut = installShortcut({ host })
const uninstallSelection = installSelectionHandlers({ host })
// ... teardown: uninstallShortcut(); uninstallSelection()
```

## ファイル構成

```
packages/editor-host/
├── package.json
├── tsconfig.json
├── README.md
└── src/
    ├── index.ts        public API
    ├── types.ts        EditorField / EditorHost / SelectionInfo / ...
    ├── host.ts         createEditorHost() core state
    ├── host.test.ts    19 cases (bun test)
    ├── selection.ts    DOM hover/click + ResizeObserver
    ├── shortcut.ts     Ctrl+Shift+E / Esc handler
    ├── provider.tsx    <EditorHostProvider> + useEditorHost()
    ├── hooks.ts        useEditorFields / useEditorValue / ...
    ├── fields.tsx      FieldEditor (6 type) + FieldEditorInline
    ├── theme-editor.tsx ThemeEditor (LEFT region)
    ├── theme-info.ts   8 theme meta + SWATCH_ROWS
    └── layer.tsx       <EditorLayer> 4 region overlay root
```

## Roadmap

| Milestone | 状態 |
|-----------|------|
| Step 1: core state + protocol types | ✅ |
| Step 2: selection + shortcut + provider + hooks | ✅ |
| Step 3: 4 region UI + FieldEditor + ThemeEditor | ✅ |
| Step 4: README + CLAUDE.md 更新 | ✅ |
| Step 5: examples/web-demo を consumer として rewrite | 未着手 |
| Step 6: `editor-host-v0.1.0` tag → npm publish | 未着手 |
| M4: `editor-host-mcp` (Phase 2b MCP server) | 計画中 |
| M5: Swift runtime (Phase 2c) | 計画中 |
| M6: ThemeEditor interactive (OKLCH picker + AI theme authoring) | 計画中 |

## License

Apache-2.0 — [LICENSE](https://github.com/chronista-club/creo-ui/blob/main/LICENSE)
