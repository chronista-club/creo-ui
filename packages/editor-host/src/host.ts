/**
 * creo-ui-editor-host — core state
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

const DEFAULT_NAMESPACE = 'creo-ui-editor-host'

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

  const [mode, setMode] = createSignal<EditorMode>(config.initialMode ?? 'off')
  const [fields, setFields] = createSignal<EditorField[]>([])
  const [values, setValues] = createSignal<Record<string, unknown>>({})
  const [selection, setSelectionSignal] = createSignal<SelectionInfo | null>(null)
  const [hover, setHoverSignal] = createSignal<SelectionInfo | null>(null)

  /** field id → value change listeners */
  const subscribers = new Map<string, Set<(value: unknown) => void>>()

  function notifySubscribers(id: string, value: unknown): void {
    const set = subscribers.get(id)
    if (!set) return
    for (const listener of set) listener(value)
  }

  function getField(id: string): EditorField | undefined {
    return fields().find((f) => f.id === id)
  }

  function getValue<T>(id: string): T | undefined {
    return values()[id] as T | undefined
  }

  function setValue<T>(id: string, value: T): void {
    const field = getField(id) as EditorField<T> | undefined
    if (!field) return
    setValues((prev) => ({ ...prev, [id]: value }))
    applyCssVar(field, value)
    field.apply?.(value)
    writePersisted(namespace, field, value)
    notifySubscribers(id, value)
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

  function register(newFields: EditorField[]): () => void {
    const ids = new Set(newFields.map((f) => f.id))

    setFields((prev) => {
      const existing = new Set(prev.map((f) => f.id))
      const addition = newFields.filter((f) => !existing.has(f.id))
      return [...prev, ...addition]
    })

    setValues((prev) => {
      const next = { ...prev }
      for (const field of newFields) {
        if (next[field.id] !== undefined) continue
        const persisted = readPersisted(namespace, field)
        const initial = persisted !== undefined ? persisted : field.initial
        next[field.id] = initial
        applyCssVar(field, initial)
        field.apply?.(initial)
      }
      return next
    })

    return () => {
      setFields((prev) => prev.filter((f) => !ids.has(f.id)))
      // note: values / persisted entries は register-unregister で消さない
      // (再マウント時に保持したい)。完全削除が必要なら別 API (forget) を追加。
    }
  }

  // --- Selection ---

  function select(info: SelectionInfo | null): void {
    setSelectionSignal(info)
  }

  function clearSelection(): void {
    setSelectionSignal(null)
  }

  function setHover(info: SelectionInfo | null): void {
    setHoverSignal(info)
  }

  // --- Mode ---

  function enable(): void {
    setMode('on')
  }

  function disable(): void {
    setMode('off')
    // mode OFF で selection / hover も自動 clear (D-8: Layer 不可視、値は保持)
    setSelectionSignal(null)
    setHoverSignal(null)
  }

  function toggle(): void {
    if (mode() === 'on') {
      disable()
    } else {
      enable()
    }
  }

  // --- MCP ---

  function listFields(filter?: { semantic?: EditorSemantic; role?: EditorRole }): EditorField[] {
    let list = fields()
    if (filter?.semantic) list = list.filter((f) => f.semantic === filter.semantic)
    if (filter?.role) list = list.filter((f) => f.role === filter.role)
    return list
  }

  const host: EditorHost = {
    mode,
    enable,
    disable,
    toggle,

    register,
    getField,
    fields,

    getValue,
    setValue,
    values,
    subscribe,

    selection,
    hover,
    select,
    clearSelection,
    setHover,

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
