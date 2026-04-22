/**
 * creo-ui-editor-host — public hooks
 *
 * Step 5 で Target × Control + bind() が正式 API になり、field 直接登録用の
 * hook (`useEditorFields` / `useEditorValue`) は削除された。consumer は
 * `bind()` 経由で binder を作り、それを accessor として使う。
 *
 * ここで提供するのは:
 *  - `useEditorSelectable({ binders })` — binder 配列から selectable ref
 *  - `useEditorMode()` / `useEditorSelection()` / `useEditorHover()` — state 監視
 */
import type { Accessor } from 'solid-js'
import { useEditorHost } from './provider'
import type { EditorMode, SelectionInfo } from './types'

/** binder 配列から `data-editor-fields` dataset を set する ref callback を作る */
export function useEditorSelectable(props: {
  binders?: readonly { id: string }[]
  /** 明示 selectable id (省略時は fieldIds.join(',') が dataset に入る) */
  id?: string
}): (el: HTMLElement) => void {
  return (el: HTMLElement): void => {
    const ids = props.binders?.map((b) => b.id) ?? []
    if (ids.length > 0) el.dataset.editorFields = ids.join(',')
    if (props.id) el.dataset.editorSelectableId = props.id
  }
}

export function useEditorMode(): Accessor<EditorMode> {
  const host = useEditorHost()
  return host.mode
}

export function useEditorSelection(): Accessor<SelectionInfo | null> {
  const host = useEditorHost()
  return host.selection
}

export function useEditorHover(): Accessor<SelectionInfo | null> {
  const host = useEditorHost()
  return host.hover
}
