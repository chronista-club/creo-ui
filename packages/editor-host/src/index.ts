/**
 * creo-ui-editor-host — public API (Step 2)
 *
 * Step 2 時点で factory / types / provider / hooks / low-level handlers を export。
 * Step 3 で UI layer (EditorLayer / regions / fields / ThemeEditor) を追加する。
 */

export * from './types'
export { createEditorHost } from './host'
export { installSelectionHandlers } from './selection'
export { installShortcut } from './shortcut'
export { EditorHostProvider, useEditorHost } from './provider'
export {
  useEditorFields,
  useEditorValue,
  useEditorSelectable,
  useEditorMode,
  useEditorSelection,
  useEditorHover,
} from './hooks'
