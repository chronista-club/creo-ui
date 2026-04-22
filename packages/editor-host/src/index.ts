/**
 * creo-ui-editor-host — public API (Step 1: core only)
 *
 * 現 段階では core state (createEditorHost) と protocol types のみを export。
 * Step 2 以降で selection handler / shortcut / provider / UI layer を追加する。
 */

export * from './types'
export { createEditorHost } from './host'
