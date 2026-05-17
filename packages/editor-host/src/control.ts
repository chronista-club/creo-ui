/**
 * creoui-editor-host — Control (UI 操作体系)
 *
 * "どう編集するか" の抽象。Target (データ源) と直交。kind で型を、variant で
 * UI widget の好みを表す。
 *
 * Built-in kinds: number / color / boolean / select / string / readonly-text
 *
 * consumer が独自 Control kind を追加したい場合は `Control<T>` に `'custom'`
 * 系の extension を作り、FieldEditor 側で `registerControlRenderer` で表示
 * (Phase 2 で拡張予定)。
 */

export type NumberVariant = 'slider' | 'input' | 'stepper'
export type ColorVariant = 'picker' | 'oklch-sliders' | 'palette'
export type BooleanVariant = 'switch' | 'checkbox'
export type SelectVariant = 'dropdown' | 'segmented'
export type StringVariant = 'input' | 'textarea'

export interface NumberControl {
  kind: 'number'
  min?: number
  max?: number
  step?: number
  unit?: string
  variant?: NumberVariant
}

export interface ColorControl {
  kind: 'color'
  variant?: ColorVariant
  palette?: readonly string[]
}

export interface BooleanControl {
  kind: 'boolean'
  variant?: BooleanVariant
}

export interface SelectControl {
  kind: 'select'
  options: readonly string[]
  variant?: SelectVariant
}

export interface StringControl {
  kind: 'string'
  variant?: StringVariant
}

export interface ReadonlyTextControl {
  kind: 'readonly-text'
}

// biome-ignore lint/suspicious/noExplicitAny: Control<T=any> default で異なる value type を bind に渡す自由度を確保
export type Control<_T = any> =
  | NumberControl
  | ColorControl
  | BooleanControl
  | SelectControl
  | StringControl
  | ReadonlyTextControl

// ---------- Factories ----------

export function number(opts: Omit<NumberControl, 'kind'> = {}): NumberControl {
  return { kind: 'number', ...opts }
}

export function color(opts: Omit<ColorControl, 'kind'> = {}): ColorControl {
  return { kind: 'color', ...opts }
}

export function boolean(opts: Omit<BooleanControl, 'kind'> = {}): BooleanControl {
  return { kind: 'boolean', ...opts }
}

export function select(options: readonly string[], variant?: SelectVariant): SelectControl {
  return { kind: 'select', options, variant }
}

export function string(variant?: StringVariant): StringControl {
  return { kind: 'string', variant }
}

export function readonlyText(): ReadonlyTextControl {
  return { kind: 'readonly-text' }
}
