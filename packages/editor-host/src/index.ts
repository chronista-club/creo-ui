/**
 * creo-ui-editor-host — public API (Step 5 + Target × Control 分離)
 *
 * Consumer が import するのは bind() を中心とする high-level API。
 * EditorField / EditorHost / register / createEditorHost 等の低レベルは
 * internal に隠蔽 (package 内部でのみ使われる)。
 */

// ---------- Target (対象、データ源) ----------
export type { Target } from './target'
export {
  cssVarTarget,
  cssVarNumberTarget,
  signalTarget,
  localStorageTarget,
  ephemeralTarget,
  editorHostTarget,
} from './target'

// ---------- Control (UI 操作体系) ----------
export type {
  Control,
  NumberControl,
  ColorControl,
  BooleanControl,
  SelectControl,
  StringControl,
  ReadonlyTextControl,
  NumberVariant,
  ColorVariant,
  BooleanVariant,
  SelectVariant,
  StringVariant,
} from './control'
export { number, color, boolean, select, string, readonlyText } from './control'

// ---------- Binder (Target × Control conductor) ----------
export type { Binder, Placement, BindOptions } from './binder'
export { bind } from './binder'

// ---------- Provider + hooks ----------
export { EditorHostProvider, useEditorHost } from './provider'
export { useEditorMode, useEditorSelection, useEditorHover, useEditorSelectable } from './hooks'

// ---------- Public semantic types ----------
export type {
  EditorSemantic,
  EditorRole,
  EditorPersistence,
  EditorMode,
  SelectionInfo,
} from './types'

// ---------- UI components ----------
export { EditorLayer } from './layer'
export { ThemeEditor } from './theme-editor'

// ---------- Theme meta ----------
export {
  THEME_INFO,
  THEME_IDS,
  DEFAULT_THEME_ID,
  SWATCH_ROWS,
  type ThemeInfo,
  type ThemeId,
} from './theme-info'

// ---------- Live design surface (Step 6: F1-F5) ----------

// F1: Console REPL
export type { ConsoleApi } from './console'

// F2: DOM auto-discover
export {
  autoDiscover,
  scanCssVars,
  type AutoDiscoverOptions,
  type DiscoveredVar,
} from './auto-discover'

// F3: Export
export { exportSnapshot, type ExportFormat, type ExportOptions } from './export'

// F4: URL share
export {
  shareUrl,
  applyFromUrl,
  installUrlSync,
  type UrlSyncOptions,
} from './url-sync'

// F5: Cross-tab sync
export { installCrossTabSync, type CrossTabOptions } from './cross-tab'
