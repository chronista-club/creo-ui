/**
 * creo-ui-editor-host — protocol types
 *
 * `docs/design/editor-mode.md` (D-1〜D-12) で規定された Editor Mode protocol を
 * TypeScript の型として具現化する。これらの型は framework 非依存 — SolidJS 固有の
 * accessor / signal は `./host.ts` 以降で個別に露出する。
 */
import type { Accessor } from 'solid-js'

// ---------- Semantic axes ----------

/** 4 方向 region の semantic (D-2 / D-3) */
export type EditorSemantic = 'global' | 'source' | 'tool' | 'utility'

/** field の想定利用者 */
export type EditorRole = 'dev' | 'user' | 'agent'

/** 永続化戦略 (D-4) */
export type EditorPersistence = 'ephemeral' | 'localStorage' | 'user-scoped' | 'per-project'

// ---------- Field definition ----------

export type EditorFieldType = 'number' | 'color' | 'string' | 'boolean' | 'select' | 'readonly-text'

export interface EditorFieldConstraints {
  min?: number
  max?: number
  step?: number
  unit?: string
  options?: readonly string[]
}

// biome-ignore lint/suspicious/noExplicitAny: default any で異なる T を同配列に入れる variance 緩和 — consumer は明示型で安全
export interface EditorField<T = any> {
  /** unique id、例: "tokens.spacing.md" */
  id: string
  /** UI 表示名 */
  label: string
  type: EditorFieldType
  semantic: EditorSemantic
  /** 同 semantic 内でのグループ分け */
  group?: string
  initial: T
  constraints?: EditorFieldConstraints
  role?: EditorRole
  persistence?: EditorPersistence
  /** 同 region 内での並び順 hint (省略時は宣言順) */
  order?: number
  /** CSS 変数を書き換える場合、変数名 (例: "--spacing-md") */
  cssVar?: string
  /** cssVar 以外の副作用を宣言的に扱う (document attribute / signal / API call 等) */
  apply?: (value: T) => void
}

// ---------- Selection ----------

export interface SelectionInfo {
  /** 選択中の要素識別子 (data-editor-selectable-id / data-editor-fields 文字列 / 独自 id) */
  targetId: string
  /** 要素に bind されている field id 一覧 */
  fieldIds: string[]
  /** 描画用の bounding rect (ResizeObserver / scroll / resize で更新) */
  rect: DOMRect
}

// ---------- Mode ----------

export type EditorMode = 'on' | 'off'

// ---------- Host configuration ----------

export interface EditorShortcut {
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  meta?: boolean
  key: string
}

export interface EditorHostConfig {
  /**
   * Mode toggle の shortcut (default: Ctrl+Shift+E)
   */
  shortcut?: EditorShortcut

  /**
   * persistence: 'localStorage' の field 保存先 key prefix。
   * 複数 app が同じ origin で動くときに衝突を避ける。
   * default: "creo-ui-editor-host"
   */
  localStorageNamespace?: string

  /**
   * Editor Mode の初期状態。default: 'off'。D-7 は手動 toggle のみなので
   * URL hash / querystring 等で start-on に切替える用途向け。
   */
  initialMode?: EditorMode

  /**
   * window に console REPL API (creoEditor) を expose する。
   * default: `import.meta.env.DEV` (Vite 環境で dev 時 true、 production build 時 false)。
   * EH-6 (CLAUDE.md): production で expose したい場合は明示的に `true` を、
   * dev でも expose したくない場合は `false` を渡す。
   */
  exposeConsole?: boolean

  /**
   * Console REPL の global 名。default: "creoEditor"。
   */
  consoleName?: string

  /**
   * URL hash に editor state を同期する (autoApply: load 時に hash → values)。
   * default: { autoApply: false, autoSync: false, key: 'creo' }。
   */
  urlSync?: {
    autoApply?: boolean
    autoSync?: boolean
    key?: string
    onlyChanged?: boolean
  }

  /**
   * BroadcastChannel で複数 tab 間の values を同期する。
   * default: false。enabled 時は channel 名は `creo-ui-editor-host:{namespace}`。
   */
  crossTab?: boolean

  /**
   * cross-tab の custom channel 名 (default: namespace ベース)。
   */
  crossTabChannel?: string
}

// ---------- MCP-ready subset ----------

/**
 * AI agent / MCP server 経由で host を操作するための minimal API。
 * `EditorHost.mcp` に expose される。外部から setValue / getValue /
 * listFields ができれば、Claude 等が field を操作できる (D-10)。
 */
export interface EditorHostMcpApi {
  listFields(filter?: { semantic?: EditorSemantic; role?: EditorRole }): EditorField[]
  getValue<T>(id: string): T | undefined
  setValue<T>(id: string, value: T): void
  mode(): EditorMode
  enable(): void
  disable(): void
}

// ---------- Host interface ----------

/**
 * Creo UI Editor Mode host の public interface。
 * SolidJS の `Accessor<T>` を公開するので SolidJS に特化するが、内部 core state
 * 自体は framework 非依存 — 将来 React adapter を作る際も同じ semantics を維持する。
 */
export interface EditorHost {
  // --- Mode ---
  readonly mode: Accessor<EditorMode>
  enable(): void
  disable(): void
  toggle(): void

  // --- Field registration ---
  /**
   * fields を register する。返り値を呼ぶと unregister される。
   * SolidJS の component 内で `onCleanup(host.register(...))` パターン推奨。
   */
  register(fields: EditorField[]): () => void
  getField(id: string): EditorField | undefined
  readonly fields: Accessor<EditorField[]>

  // --- Value read/write ---
  getValue<T>(id: string): T | undefined
  /**
   * field の値を更新。chain: values() update → cssVar → apply → persist → subscribers
   * 通知 → anyChange 通知。options.silent=true なら subscribers / anyChange を skip
   * (cross-tab 受信側で loop 回避に使用)。
   */
  setValue<T>(id: string, value: T, options?: { silent?: boolean }): void
  readonly values: Accessor<Record<string, unknown>>
  /**
   * 特定 field の value 変更を購読。unregister 関数を返す。
   */
  subscribe<T>(id: string, listener: (value: T) => void): () => void
  /**
   * 全 field の変更を一括購読する (cross-tab / history / FLIP 等の infra 用)。
   */
  onAnyChange(listener: (id: string, value: unknown) => void): () => void

  // --- Selection ---
  readonly selection: Accessor<SelectionInfo | null>
  readonly hover: Accessor<SelectionInfo | null>
  select(info: SelectionInfo | null): void
  clearSelection(): void
  /** (internal) hover state を update。selection handler から呼ぶ */
  setHover(info: SelectionInfo | null): void

  // --- MCP ---
  readonly mcp: EditorHostMcpApi
}
