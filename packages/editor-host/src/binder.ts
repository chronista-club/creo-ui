/**
 * creo-ui-editor-host — Binder (Target × Control の conductor)
 *
 * `bind()` は Target (データ源) と Control (UI 操作体系) と Placement (配置
 * meta) を受け取り、以下を提供する:
 *
 *  - Accessor<T> として current value を reactive read
 *  - `.set(v)` で書き込み (host.values → target.set + signal mirror が同期)
 *  - `.target` / `.control` / `.placement` / `.id` の meta exposure
 *  - `.selectable()` で `data-editor-fields` を dataset に set する ref callback
 *
 * 内部は EditorHost の register を使うが、consumer からは見えない抽象。
 */
import { createSignal, onCleanup } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { Control } from './control'
import { useEditorHost } from './provider'
import type { Target } from './target'
import type {
  EditorField,
  EditorFieldConstraints,
  EditorFieldType,
  EditorPersistence,
  EditorRole,
  EditorSemantic,
} from './types'

export interface Placement {
  label: string
  semantic: EditorSemantic
  group?: string
  order?: number
  role?: EditorRole
  persistence?: EditorPersistence
}

export interface BindOptions<T> {
  target: Target<T>
  control: Control<T>
  placement: Placement
}

export interface Binder<T> extends Accessor<T> {
  set(value: T): void
  readonly id: string
  readonly target: Target<T>
  readonly control: Control<T>
  readonly placement: Placement
  /** ref callback: el.dataset.editorFields = this.id */
  selectable(): (el: HTMLElement) => void
}

/** Control.kind は EditorFieldType と互換 — 1:1 で mapping */
function controlKindToFieldType(kind: Control['kind']): EditorFieldType {
  return kind as EditorFieldType
}

/** Control から EditorField.constraints への projection */
function controlToConstraints(control: Control): EditorFieldConstraints | undefined {
  if (control.kind === 'number') {
    const { min, max, step, unit } = control
    if (min === undefined && max === undefined && step === undefined && unit === undefined) {
      return undefined
    }
    return { min, max, step, unit }
  }
  if (control.kind === 'select') {
    return { options: control.options }
  }
  return undefined
}

export function bind<T>(opts: BindOptions<T>): Binder<T> {
  const host = useEditorHost()
  const { target, control, placement } = opts

  // 初期値決定: target.get から読む (persistence 起源を尊重)、例外なら initial
  const initialValue = ((): T => {
    try {
      return target.get()
    } catch {
      return target.initial
    }
  })()

  const [sig, setSig] = createSignal<T>(initialValue)

  // target → signal: target が subscribe 提供するなら直接 hook
  let unsubTarget: (() => void) | undefined
  if (target.subscribe) {
    unsubTarget = target.subscribe((v) => setSig(() => v))
  }

  const field: EditorField<T> = {
    id: target.id,
    label: placement.label,
    type: controlKindToFieldType(control.kind),
    semantic: placement.semantic,
    group: placement.group,
    order: placement.order,
    role: placement.role,
    persistence: placement.persistence,
    initial: initialValue,
    constraints: controlToConstraints(control),
    // apply: host.setValue が呼ばれた時の chain — target 実体 write + signal mirror
    apply: (v: T) => {
      try {
        target.set(v)
      } catch {
        // target が write 失敗しても host.values は正 (D-6 非侵襲)
      }
      setSig(() => v)
    },
  }

  const unregister = host.register([field])

  onCleanup(() => {
    unregister()
    unsubTarget?.()
  })

  const binder = sig as Binder<T>
  binder.set = (v: T): void => {
    // 経路: binder.set → host.setValue → apply (target.set + signal mirror)
    host.setValue<T>(target.id, v)
  }
  Object.defineProperty(binder, 'id', { value: target.id, enumerable: true })
  Object.defineProperty(binder, 'target', { value: target, enumerable: true })
  Object.defineProperty(binder, 'control', { value: control, enumerable: true })
  Object.defineProperty(binder, 'placement', { value: placement, enumerable: true })
  binder.selectable = () => (el: HTMLElement) => {
    el.dataset.editorFields = target.id
  }

  return binder
}
