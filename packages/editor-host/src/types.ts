/**
 * @chronista-club/creo-ui-editor-host — protocol types
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
  /** unique id、例: "tokens.spacing.m" */
  id: string
  /** UI 表示名 */
  label: string
  type: EditorFieldType
  semantic: EditorSemantic
  /** 編集の射程 (D-13 3-scope)。省略時は 'instance' 扱い (app 宣言 field) */
  scope?: EditorScope
  /** 同 semantic 内でのグループ分け */
  group?: string
  initial: T
  constraints?: EditorFieldConstraints
  role?: EditorRole
  persistence?: EditorPersistence
  /** 同 region 内での並び順 hint (省略時は宣言順) */
  order?: number
  /** CSS 変数を書き換える場合、変数名 (例: "--spacing-m") */
  cssVar?: string
  /** cssVar 以外の副作用を宣言的に扱う (document attribute / signal / API call 等) */
  apply?: (value: T) => void
}

// ---------- Selection ----------

export interface SelectionInfo {
  /** 選択中の要素識別子 (data-editor-selectable-id / .creo-* class / 独自 id) */
  targetId: string
  /** 要素に bind されている field id 一覧 */
  fieldIds: string[]
  /**
   * creo-ui component 名 (`.creo-error-boundary` → 'error-boundary')。F2c の
   * 逆引き経路で解決される。明示 bind だけの要素では undefined。
   */
  componentId?: string
  /**
   * 選択のアンカー要素。選択の実体は class (component) で、element は
   * 「どの instance を基準に見ているか」— outline の強調・rect 追従・
   * 祖先 breadcrumb の起点に使う。
   */
  element?: Element
  /** 描画用の bounding rect (ResizeObserver / scroll / resize で更新) */
  rect: DOMRect
}

// ---------- Mode ----------

export type EditorMode = 'on' | 'off'

// ---------- Scope (D-13 / 3-scope model) ----------

/**
 * 編集の射程。panel はこれを構造として表示する (2026-07-12 設計議論で確定):
 * - 'token':     design system 全体 (:root の --spacing-* 等) — autoDiscover (F2)
 * - 'component': 当該 component の全 instance (:root の --_badge-* 等) — tweak var (F2b)
 * - 'instance':  選択中 / app 宣言の 1 要素分 (signal 等) — 手動 bind (default)
 */
export type EditorScope = 'token' | 'component' | 'instance'

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
   * default: "@chronista-club/creo-ui-editor-host"
   */
  localStorageNamespace?: string

  /**
   * Editor Mode の初期状態。default: 'off'。D-7 は手動 toggle のみなので
   * URL hash / querystring 等で start-on に切替える用途向け。
   */
  initialMode?: EditorMode

  /**
   * window に console REPL API (creoEditor) を expose する。
   * default: localhost 判定 (hostname が localhost / 127.0.0.1 / [::1] なら true)。
   * library build では `import.meta.env.DEV` が build 時に固定化され consumer の
   * dev/prod を反映できないため、runtime の hostname heuristic で dev を近似する。
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
   * mount 時に CSSOM を scan して private tweak var (`--_component-knob`) を
   * 自動 bind する (F2b)。component CSS 側の規約
   * `var(--_badge-pad-x, <SSOT fallback>)` だけで panel にノブが生える。
   * default: false。
   *
   * 注意: これは **eager** 経路 — 画面に居る component のノブを mount 時に
   * まとめて register するので、その分の初期値が `:root` に書き込まれる。
   * 「選んだ component のノブだけ出す」なら `discoverComponents` (F2c) を使う。
   */
  discoverTweaks?: boolean

  /**
   * 選択駆動の component field 解決 (F2c)。**default: true**。
   *
   * CSSOM の tweak var を index 化し、Editor Mode 中に creo-ui component を
   * クリックすると `el.matches()` の逆引きでヒットしたノブだけを lazy に
   * register する。`data-editor-fields` の事前仕込みが不要になる。
   * index 構築は初回選択時まで遅延され、mount 時の DOM 書き込みはゼロ。
   */
  discoverComponents?: boolean

  /**
   * BroadcastChannel で複数 tab 間の values を同期する。
   * default: false。enabled 時は channel 名は `@chronista-club/creo-ui-editor-host:{namespace}`。
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
 * creo-ui Editor Mode host の public interface。
 * SolidJS の `Accessor<T>` を公開するので SolidJS に特化するが、内部 core state
 * 自体は framework 非依存 — 将来 React adapter を作る際も同じ semantics を維持する。
 */
export interface EditorHost {
  // --- Mode ---
  readonly mode: Accessor<EditorMode>
  enable(): void
  disable(): void
  toggle(): void

  /** localStorage 永続化の key prefix (config.localStorageNamespace 由来)。
   *  Layer 側の UI state (panel 位置等) も同 namespace 配下に保存する。 */
  readonly namespace: string

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
