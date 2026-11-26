/**
 * @chronista-club/creo-ui-editor-host — core state
 *
 * Editor Mode protocol (docs/design/editor-mode.md D-1〜D-12) の reference
 * runtime 実装。SolidJS signal を内部で使うが、`EditorHost` interface 越しに
 * 公開されるのは Accessor / plain method のみなので consumer との契約は厚くない。
 */
import { createSignal } from 'solid-js'
import type {
  EditorField,
  EditorHost,
  EditorHostConfig,
  EditorMode,
  EditorRole,
  EditorSemantic,
  SelectionInfo,
} from './types'

// ---------- Persistence strategy ----------

const DEFAULT_NAMESPACE = '@chronista-club/creo-ui-editor-host'

function persistKey(namespace: string, id: string): string {
  return `${namespace}:field:${id}`
}

function readPersisted<T>(namespace: string, field: EditorField<T>): T | undefined {
  if (field.persistence !== 'localStorage') return undefined
  if (typeof localStorage === 'undefined') return undefined
  try {
    const raw = localStorage.getItem(persistKey(namespace, field.id))
    if (raw === null) return undefined
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

function writePersisted<T>(namespace: string, field: EditorField<T>, value: T): void {
  if (field.persistence !== 'localStorage') return
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(persistKey(namespace, field.id), JSON.stringify(value))
  } catch {
    // quota / serialization 失敗は silently 吸収 — Editor Mode が Content を
    // 壊さない (D-6) 原則に従う。
  }
}

// ---------- CSS 変数 bind ----------

function applyCssVar<T>(field: EditorField<T>, value: T): void {
  if (!field.cssVar) return
  if (typeof document === 'undefined') return
  const unit = field.constraints?.unit ?? ''
  const formatted = typeof value === 'boolean' ? (value ? '1' : '0') : `${String(value)}${unit}`
  document.documentElement.style.setProperty(field.cssVar, formatted)
}

// ---------- Factory ----------

export function createEditorHost(config: EditorHostConfig = {}): EditorHost {
  const namespace = config.localStorageNamespace ?? DEFAULT_NAMESPACE

  let currentMode: EditorMode = config.initialMode ?? 'off'
  let currentFields: EditorField[] = []
  let currentValues: Record<string, unknown> = {}
  let currentSelection: SelectionInfo | null = null

  const [mode, setMode] = createSignal<EditorMode>(currentMode, {
    ownedWrite: true,
  })
  const [fields, setFields] = createSignal<EditorField[]>(currentFields, { ownedWrite: true })
  const [values, setValues] = createSignal<Record<string, unknown>>(currentValues, {
    ownedWrite: true,
  })
  const [selection, setSelectionSignal] = createSignal<SelectionInfo | null>(currentSelection, {
    ownedWrite: true,
  })
  const [hover, setHoverSignal] = createSignal<SelectionInfo | null>(null, { ownedWrite: true })

  /** field id → value change listeners */
  const subscribers = new Map<string, Set<(value: unknown) => void>>()
  /** 全 field の change を一括で購読する listeners (cross-tab / history / FLIP で使用) */
  const anyChangeListeners = new Set<(id: string, value: unknown) => void>()
  /**
   * mode / fields / selection の変化を Solid owner 無しで購読する listeners (Link 等の
   * infra 用)。signal は provider の外からは追えないので、値が実際に変わった時だけ
   * plain callback で知らせる。
   */
  const modeListeners = new Set<(mode: EditorMode) => void>()
  const fieldsListeners = new Set<(fields: EditorField[]) => void>()
  const selectionListeners = new Set<(selection: SelectionInfo | null) => void>()

  function addListener<L>(set: Set<L>, listener: L): () => void {
    set.add(listener)
    return () => {
      set.delete(listener)
    }
  }

  function notifySubscribers(id: string, value: unknown): void {
    const set = subscribers.get(id)
    if (set) {
      for (const listener of set) listener(value)
    }
    for (const listener of anyChangeListeners) listener(id, value)
  }

  function getField(id: string): EditorField | undefined {
    return currentFields.find((f) => f.id === id)
  }

  function getValue<T>(id: string): T | undefined {
    return currentValues[id] as T | undefined
  }

  function setValue<T>(id: string, value: T, options?: { silent?: boolean }): void {
    const field = getField(id) as EditorField<T> | undefined
    if (!field) return
    currentValues = { ...currentValues, [id]: value }
    setValues(currentValues)
    applyCssVar(field, value)
    field.apply?.(value)
    writePersisted(namespace, field, value)
    if (!options?.silent) notifySubscribers(id, value)
  }

  function onAnyChange(listener: (id: string, value: unknown) => void): () => void {
    anyChangeListeners.add(listener)
    return () => {
      anyChangeListeners.delete(listener)
    }
  }

  function subscribe<T>(id: string, listener: (value: T) => void): () => void {
    // wrapper で unknown → T cast を 1 度に閉じ込める (listener 本体の型は保つ)
    const wrapped = (value: unknown): void => listener(value as T)
    let set = subscribers.get(id)
    if (!set) {
      set = new Set()
      subscribers.set(id, set)
    }
    set.add(wrapped)
    return () => {
      const s = subscribers.get(id)
      if (!s) return
      s.delete(wrapped)
      if (s.size === 0) subscribers.delete(id)
    }
  }

  function notifyFields(): void {
    const list = currentFields
    for (const listener of fieldsListeners) listener(list)
  }

  function register(newFields: EditorField[]): () => void {
    const ids = new Set(newFields.map((f) => f.id))

    const existing = new Set(currentFields.map((f) => f.id))
    const addition = newFields.filter((f) => !existing.has(f.id))
    const added = addition.length
    if (added > 0) {
      currentFields = [...currentFields, ...addition]
      setFields(currentFields)
    }

    const next = { ...currentValues }
    for (const field of newFields) {
      if (next[field.id] !== undefined) continue
      const persisted = readPersisted(namespace, field)
      const initial = persisted !== undefined ? persisted : field.initial
      next[field.id] = initial
      applyCssVar(field, initial)
      field.apply?.(initial)
    }
    currentValues = next
    setValues(currentValues)
    if (added > 0) notifyFields()

    return () => {
      const nextFields = currentFields.filter((f) => !ids.has(f.id))
      const removed = currentFields.length - nextFields.length
      if (removed > 0) {
        currentFields = nextFields
        setFields(currentFields)
        notifyFields()
      }
      // note: values / persisted entries は register-unregister で消さない
      // (再マウント時に保持したい)。完全削除が必要なら別 API (forget) を追加。
    }
  }

  // --- Selection ---

  function applySelection(info: SelectionInfo | null): void {
    if (info === currentSelection) return
    currentSelection = info
    setSelectionSignal(info)
    for (const listener of selectionListeners) listener(info)
  }

  function select(info: SelectionInfo | null): void {
    applySelection(info)
  }

  function clearSelection(): void {
    applySelection(null)
  }

  function setHover(info: SelectionInfo | null): void {
    setHoverSignal(info)
  }

  // --- Mode ---

  function applyMode(next: EditorMode): void {
    if (next === currentMode) return
    currentMode = next
    setMode(next)
    for (const listener of modeListeners) listener(next)
  }

  function enable(): void {
    applyMode('on')
  }

  function disable(): void {
    applyMode('off')
    // mode OFF で selection / hover も自動 clear (D-8: Layer 不可視、値は保持)
    applySelection(null)
    setHoverSignal(null)
  }

  function toggle(): void {
    if (currentMode === 'on') {
      disable()
    } else {
      enable()
    }
  }

  // --- MCP ---

  function listFields(filter?: { semantic?: EditorSemantic; role?: EditorRole }): EditorField[] {
    let list = currentFields
    if (filter?.semantic) list = list.filter((f) => f.semantic === filter.semantic)
    if (filter?.role) list = list.filter((f) => f.role === filter.role)
    return list
  }

  const host: EditorHost = {
    mode,
    enable,
    disable,
    toggle,
    namespace,

    register,
    getField,
    fields,

    getValue,
    setValue,
    values,
    subscribe,
    onAnyChange,

    selection,
    hover,
    select,
    clearSelection,
    setHover,

    onModeChange: (listener) => addListener(modeListeners, listener),
    onFieldsChange: (listener) => addListener(fieldsListeners, listener),
    onSelectionChange: (listener) => addListener(selectionListeners, listener),

    mcp: {
      listFields,
      getValue,
      setValue,
      mode: () => mode(),
      enable,
      disable,
    },
  }

  return host
}
