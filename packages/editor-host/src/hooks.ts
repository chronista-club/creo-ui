/**
 * creo-ui-editor-host — declarative hooks
 *
 * Component が自身の fields を declare して Editor Mode に登録 / 値を読む
 * SolidJS の流儀に沿った API。
 */
import { onCleanup, onMount } from 'solid-js'
import type { Accessor } from 'solid-js'
import { useEditorHost } from './provider'
import type { EditorField, EditorMode, SelectionInfo } from './types'

/**
 * Component の mount 時に fields を register、unmount で unregister。
 * 配列は初回評価時に固定 — 動的に変えたい場合は createMemo + createEffect を
 * 自前で組む。
 */
export function useEditorFields(fields: EditorField[]): void {
  const host = useEditorHost()
  onMount(() => {
    const unregister = host.register(fields)
    onCleanup(unregister)
  })
}

/**
 * 特定 field の value を Accessor として取得 (reactive)。T は呼び出し側で明示。
 *
 *   const spacing = useEditorValue<number>('tokens.spacing.md')
 *   <div style={{ padding: `${spacing() ?? 16}px` }} />
 */
export function useEditorValue<T>(id: string): Accessor<T | undefined> {
  const host = useEditorHost()
  return () => {
    // values() を call して reactive 依存を確立
    host.values()
    return host.getValue<T>(id)
  }
}

/**
 * Component を selection 可能にする ref callback。
 * SolidJS の `<div ref={useEditorSelectable({ fieldIds: [...] })}>` で使う。
 */
export function useEditorSelectable(props: {
  fieldIds: string[]
  /** 明示的な selectable id (省略時は fieldIds.join(',') が使われる) */
  id?: string
}): (el: HTMLElement) => void {
  return (el: HTMLElement): void => {
    el.dataset.editorFields = props.fieldIds.join(',')
    if (props.id) el.dataset.editorSelectableId = props.id
  }
}

/**
 * Editor Mode の on/off を Accessor で取得。
 */
export function useEditorMode(): Accessor<EditorMode> {
  const host = useEditorHost()
  return host.mode
}

/**
 * 現在の selection (selected element の info) を Accessor で取得。
 */
export function useEditorSelection(): Accessor<SelectionInfo | null> {
  const host = useEditorHost()
  return host.selection
}

/**
 * 現在の hover (hovered element の info) を Accessor で取得。
 */
export function useEditorHover(): Accessor<SelectionInfo | null> {
  const host = useEditorHost()
  return host.hover
}
