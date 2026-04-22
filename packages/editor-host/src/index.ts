/**
 * creo-ui-editor-host — public API
 *
 * consumer 向けの import 入口。creo-ui-web の tokens.css を import していれば
 * `<EditorHostProvider>` + `<EditorLayer>` + `useEditorFields()` だけで
 * Editor Mode の 4 region UI が立ち上がる。
 */

// Types
export * from './types'

// Factory + low-level handlers
export { createEditorHost } from './host'
export { installSelectionHandlers } from './selection'
export { installShortcut } from './shortcut'

// SolidJS provider + hooks
export { EditorHostProvider, useEditorHost } from './provider'
export {
  useEditorFields,
  useEditorValue,
  useEditorSelectable,
  useEditorMode,
  useEditorSelection,
  useEditorHover,
} from './hooks'

// UI components
export { EditorLayer } from './layer'
export { FieldEditor, FieldEditorInline } from './fields'
export { ThemeEditor } from './theme-editor'

// Theme meta (for custom consumer UI)
export {
  THEME_INFO,
  THEME_IDS,
  DEFAULT_THEME_ID,
  SWATCH_ROWS,
  type ThemeInfo,
  type ThemeId,
} from './theme-info'
