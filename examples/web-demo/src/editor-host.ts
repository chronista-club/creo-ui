/**
 * Editor Mode walking skeleton (仮実装).
 *
 * Creo UI の docs/design/editor-mode.md (D-1〜D-12) の protocol を実装。
 * Phase 2a で @creo/ui へ移管する前提の reference 実装。
 *
 * 実装範囲:
 *  - register / toggle / getValue / setValue / subscribe
 *  - Field 型: number / color / boolean / select / string / readonly-text
 *  - Ctrl+Shift+E / Esc で手動 toggle (D-7)
 *  - Selection (hover outline + click focus)
 *  - CSS 変数 bind
 *  - RIGHT region (selection 絞り込み or 全 tool fields)
 *
 * 未実装 (Phase 2a 以降):
 *  - LEFT / BOTTOM region の充実
 *  - MCP AI agent API
 *  - persistence (localStorage / user-scoped / per-project)
 *  - declarative hook (useEditorSelectable) — いまは data-editor-fields 属性
 */
import { type Accessor, createSignal } from 'solid-js'

export type EditorSemantic = 'global' | 'source' | 'tool' | 'utility'

export type EditorRole = 'dev' | 'user' | 'agent'

export type EditorPersistence = 'ephemeral' | 'localStorage' | 'user-scoped' | 'per-project'

export type EditorFieldType = 'number' | 'color' | 'string' | 'boolean' | 'select' | 'readonly-text'

export interface EditorField<T = unknown> {
  id: string
  label: string
  type: EditorFieldType
  semantic: EditorSemantic
  group?: string
  initial: T
  constraints?: {
    min?: number
    max?: number
    step?: number
    unit?: string
    options?: readonly string[]
  }
  role?: EditorRole
  persistence?: EditorPersistence
  order?: number
  /** CSS 変数を書き換える場合、変数名 (例: "--spacing-md") */
  cssVar?: string
}

export interface SelectionInfo {
  targetId: string
  /** この要素に bind されている field id 一覧 */
  fieldIds: string[]
  /** 描画用 — 選択 element の bounding rect */
  rect: DOMRect
}

const [mode, setMode] = createSignal<'on' | 'off'>('off')
const [fields, setFields] = createSignal<EditorField[]>([])
const [values, setValues] = createSignal<Record<string, unknown>>({})
const [selection, setSelection] = createSignal<SelectionInfo | null>(null)
const [hover, setHover] = createSignal<SelectionInfo | null>(null)

export const editorMode = {
  mode,
  isEnabled: () => mode() === 'on',
  enable: () => setMode('on'),
  disable: () => {
    setMode('off')
    setSelection(null)
    setHover(null)
  },
  toggle: () => {
    if (mode() === 'on') {
      setSelection(null)
      setHover(null)
      setMode('off')
    } else {
      setMode('on')
    }
  },
}

export function registerFields(newFields: EditorField[]): () => void {
  const ids = new Set(newFields.map((f) => f.id))
  setFields((prev) => [...prev, ...newFields])
  setValues((prev) => {
    const next = { ...prev }
    for (const f of newFields) {
      if (!(f.id in next)) {
        next[f.id] = f.initial
        applyCssVar(f, f.initial)
      }
    }
    return next
  })
  return () => {
    setFields((prev) => prev.filter((f) => !ids.has(f.id)))
  }
}

export function getField(id: string): EditorField | undefined {
  return fields().find((f) => f.id === id)
}

export function getValue<T>(id: string): T | undefined {
  return values()[id] as T | undefined
}

export function setValue<T>(id: string, v: T): void {
  const field = getField(id)
  if (!field) return
  setValues((prev) => ({ ...prev, [id]: v }))
  applyCssVar(field, v)
}

export function useFields(): Accessor<EditorField[]> {
  return fields
}

export function useValues(): Accessor<Record<string, unknown>> {
  return values
}

export function useSelection(): Accessor<SelectionInfo | null> {
  return selection
}

export function useHover(): Accessor<SelectionInfo | null> {
  return hover
}

export function clearSelection(): void {
  setSelection(null)
}

function applyCssVar<T>(field: EditorField<T>, value: T): void {
  if (!field.cssVar) return
  const unit = field.constraints?.unit ?? ''
  const formatted = typeof value === 'boolean' ? (value ? '1' : '0') : `${String(value)}${unit}`
  document.documentElement.style.setProperty(field.cssVar, formatted)
}

// --- Selection helpers ---

function parseFieldIds(el: Element): string[] | null {
  const raw = (el as HTMLElement).dataset?.editorFields
  if (!raw) return null
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function findSelectableAncestor(
  el: Element | null,
): { element: HTMLElement; fieldIds: string[] } | null {
  let cur: Element | null = el
  while (cur) {
    if ((cur as HTMLElement).dataset?.editorFields) {
      const ids = parseFieldIds(cur)
      if (ids && ids.length > 0) {
        return { element: cur as HTMLElement, fieldIds: ids }
      }
    }
    cur = cur.parentElement
  }
  return null
}

function isInsideEditorLayer(el: Element | null): boolean {
  let cur: Element | null = el
  while (cur) {
    if ((cur as HTMLElement).dataset?.editorLayer !== undefined) return true
    cur = cur.parentElement
  }
  return false
}

/**
 * D-7: 手動 toggle 専用 + D-6 を守るための selection handling を install する。
 */
export function installEditorLayerHandlers(): () => void {
  const keyHandler = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'e') {
      e.preventDefault()
      editorMode.toggle()
      return
    }
    if (e.key === 'Escape' && mode() === 'on') {
      if (selection()) {
        setSelection(null)
      } else {
        editorMode.disable()
      }
    }
  }

  const mouseOverHandler = (e: MouseEvent) => {
    if (mode() !== 'on') return
    const target = e.target as Element | null
    if (isInsideEditorLayer(target)) {
      setHover(null)
      return
    }
    const found = findSelectableAncestor(target)
    if (!found) {
      setHover(null)
      return
    }
    setHover({
      targetId: found.element.id || found.fieldIds.join(','),
      fieldIds: found.fieldIds,
      rect: found.element.getBoundingClientRect(),
    })
  }

  const clickHandler = (e: MouseEvent) => {
    if (mode() !== 'on') return
    const target = e.target as Element | null
    if (isInsideEditorLayer(target)) return
    const found = findSelectableAncestor(target)
    if (!found) {
      // 背景クリックで選択解除
      setSelection(null)
      return
    }
    e.preventDefault()
    e.stopPropagation()
    setSelection({
      targetId: found.element.id || found.fieldIds.join(','),
      fieldIds: found.fieldIds,
      rect: found.element.getBoundingClientRect(),
    })
  }

  // scroll / resize で rect が stale になるので再計算
  const rerectHandler = () => {
    const cur = selection()
    if (!cur) return
    const el = document.querySelector(`[data-editor-fields="${cur.fieldIds.join(',')}"]`)
    if (!el) return
    setSelection({ ...cur, rect: el.getBoundingClientRect() })
  }

  window.addEventListener('keydown', keyHandler)
  document.addEventListener('mouseover', mouseOverHandler)
  document.addEventListener('click', clickHandler, true) // capture で Content click を先に拾う
  window.addEventListener('scroll', rerectHandler, true)
  window.addEventListener('resize', rerectHandler)

  return () => {
    window.removeEventListener('keydown', keyHandler)
    document.removeEventListener('mouseover', mouseOverHandler)
    document.removeEventListener('click', clickHandler, true)
    window.removeEventListener('scroll', rerectHandler, true)
    window.removeEventListener('resize', rerectHandler)
  }
}
