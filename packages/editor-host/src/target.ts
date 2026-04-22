/**
 * creo-ui-editor-host — Target (対象、データ源)
 *
 * "何をどこから read/write するか" の抽象。UI 操作体系 (Control) と直交。
 * Target factory を組み合わせて `bind()` で binder を作る。
 *
 * Built-in factories:
 *  - cssVarTarget        CSS 変数 (document.documentElement.style)
 *  - cssVarNumberTarget  CSS 変数 number (unit 付き)
 *  - signalTarget        SolidJS signal (Accessor + setter)
 *  - localStorageTarget  永続化のみ
 *  - ephemeralTarget     in-memory + subscribe
 *  - editorHostTarget    EditorHost.values に直結
 *
 * consumer は `Target<T>` interface を満たす任意の factory を追加できる
 * (remote / GraphQL / SurrealDB / WebSocket 等、plugin 性)。
 */
import type { Accessor } from 'solid-js'
import type { EditorHost } from './types'

export interface Target<T> {
  readonly id: string
  readonly initial: T
  get(): T
  set(value: T): void
  /** 値変化の subscribe (optional、持てば 2-way sync が効率化) */
  subscribe?(listener: (value: T) => void): () => void
}

// ---------- CSS variable ----------

/** CSS custom property に setProperty。string をそのまま read/write */
export function cssVarTarget(id: string, cssVar: string, initial: string): Target<string> {
  return {
    id,
    initial,
    get: () => {
      if (typeof document === 'undefined') return initial
      const raw = document.documentElement.style.getPropertyValue(cssVar).trim()
      return raw || initial
    },
    set: (v) => {
      if (typeof document === 'undefined') return
      document.documentElement.style.setProperty(cssVar, v)
    },
  }
}

/** CSS custom property に number を unit 付きで書き込む */
export function cssVarNumberTarget(
  id: string,
  cssVar: string,
  initial: number,
  unit = 'px',
): Target<number> {
  return {
    id,
    initial,
    get: () => {
      if (typeof document === 'undefined') return initial
      const raw = document.documentElement.style.getPropertyValue(cssVar).trim()
      if (!raw) return initial
      const n = Number.parseFloat(raw)
      return Number.isFinite(n) ? n : initial
    },
    set: (v) => {
      if (typeof document === 'undefined') return
      document.documentElement.style.setProperty(cssVar, `${v}${unit}`)
    },
  }
}

// ---------- SolidJS signal ----------

/** SolidJS accessor + setter に接続 */
export function signalTarget<T>(
  id: string,
  accessor: Accessor<T>,
  setter: (value: T) => void,
): Target<T> {
  return {
    id,
    initial: accessor(),
    get: () => accessor(),
    set: (v) => setter(v),
  }
}

// ---------- localStorage ----------

/**
 * localStorage に JSON 永続化する target。SSR safe (localStorage 無ければ
 * メモリに fallback)。
 */
export function localStorageTarget<T>(
  id: string,
  initial: T,
  namespace = 'creo-ui-editor-host',
): Target<T> {
  const key = `${namespace}:target:${id}`
  let fallback = initial

  const read = (): T => {
    if (typeof localStorage === 'undefined') return fallback
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  const write = (v: T): void => {
    fallback = v
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(v))
    } catch {
      // quota / serialization 失敗 — D-6 非侵襲原則で silent
    }
  }

  return {
    id,
    initial,
    get: read,
    set: write,
  }
}

// ---------- ephemeral (in-memory) ----------

/** In-memory に値を保持、subscribe 対応 */
export function ephemeralTarget<T>(id: string, initial: T): Target<T> {
  let value = initial
  const listeners = new Set<(v: T) => void>()

  return {
    id,
    initial,
    get: () => value,
    set: (v) => {
      if (Object.is(value, v)) return
      value = v
      for (const listener of listeners) listener(v)
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

// ---------- editorHost ----------

/** EditorHost.values に直結 (persistence / subscribe も host に委譲) */
export function editorHostTarget<T>(id: string, host: EditorHost, initial: T): Target<T> {
  return {
    id,
    initial,
    get: () => {
      const v = host.getValue<T>(id)
      return v === undefined ? initial : v
    },
    set: (v) => host.setValue<T>(id, v),
    subscribe: (listener) => host.subscribe<T>(id, listener),
  }
}
