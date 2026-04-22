/**
 * creo-ui-editor-host — Export (F3)
 *
 * host.values() の現 snapshot を JSON / YAML / CSS / CSS-patch に serialize。
 * clipboard 操作はせず string のみ return (consumer が copy するかは任意)。
 */
import type { EditorField, EditorHost } from './types'

export type ExportFormat = 'json' | 'yaml' | 'css' | 'css-patch'

export interface ExportOptions {
  format?: ExportFormat
  /** true なら initial と異なる field のみ (css-patch は強制 true) */
  onlyChanged?: boolean
  /** json / yaml の indent (default 2) */
  indent?: number
}

interface Entry {
  field: EditorField
  value: unknown
  changed: boolean
}

function collectEntries(host: EditorHost, onlyChanged: boolean): Entry[] {
  const values = host.values()
  const entries: Entry[] = []
  for (const field of host.fields()) {
    const value = values[field.id]
    const changed = !valueEquals(value, field.initial)
    if (onlyChanged && !changed) continue
    entries.push({ field, value, changed })
  }
  return entries
}

function valueEquals(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}

export function exportSnapshot(host: EditorHost, opts: ExportOptions = {}): string {
  const format = opts.format ?? 'json'
  const indent = opts.indent ?? 2
  const onlyChanged = format === 'css-patch' ? true : (opts.onlyChanged ?? false)
  const entries = collectEntries(host, onlyChanged)

  switch (format) {
    case 'json':
      return toJson(entries, indent)
    case 'yaml':
      return toYaml(entries, indent)
    case 'css':
      return toCss(entries)
    case 'css-patch':
      return toCssPatch(entries)
  }
}

function toJson(entries: Entry[], indent: number): string {
  const out: Record<string, unknown> = {}
  for (const { field, value } of entries) {
    out[field.id] = value
  }
  return JSON.stringify(out, null, indent)
}

function toYaml(entries: Entry[], indent: number): string {
  // flat key-value のみ対応 (field id は dot-notation を保つ)
  const pad = ' '.repeat(indent)
  const lines: string[] = []
  for (const { field, value } of entries) {
    const key = yamlKey(field.id)
    const rendered = yamlScalar(value)
    if (rendered.includes('\n')) {
      lines.push(`${key}: |`)
      for (const line of rendered.split('\n')) lines.push(`${pad}${line}`)
    } else {
      lines.push(`${key}: ${rendered}`)
    }
  }
  return lines.join('\n')
}

function yamlKey(id: string): string {
  // dot-notation を安全に quote (yaml の key として単純な場合は quote 不要)
  if (/^[A-Za-z_][\w.\-]*$/.test(id)) return id
  return JSON.stringify(id)
}

function yamlScalar(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return '~'
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'string') {
    if (
      /[:#\n\t"']/.test(value) ||
      value.trim() !== value ||
      /^(true|false|null|~|-?\d)/.test(value)
    ) {
      return JSON.stringify(value)
    }
    return value
  }
  // object / array / symbol / function 等は JSON fallback (dep なし)
  try {
    return JSON.stringify(value)
  } catch {
    return '"<unserializable>"'
  }
}

function toCss(entries: Entry[]): string {
  const lines: string[] = [':root {']
  let emitted = 0
  for (const { field, value } of entries) {
    const rule = cssRule(field, value)
    if (rule) {
      lines.push(`  ${rule}`)
      emitted++
    } else {
      lines.push(`  /* ${field.id}: ${cssSkipReason(field)} */`)
    }
  }
  lines.push('}')
  if (emitted === 0) lines.push('/* no cssVar-bound fields to export */')
  return lines.join('\n')
}

function toCssPatch(entries: Entry[]): string {
  if (entries.length === 0) return '/* no changes */'
  return toCss(entries)
}

function cssRule(field: EditorField, value: unknown): string | null {
  if (!field.cssVar) return null
  const unit = field.constraints?.unit ?? ''
  let formatted: string
  if (typeof value === 'boolean') formatted = value ? '1' : '0'
  else if (typeof value === 'number') formatted = `${value}${unit}`
  else formatted = String(value)
  return `${field.cssVar}: ${formatted};`
}

function cssSkipReason(field: EditorField): string {
  if (!field.cssVar) return 'no cssVar binding'
  return 'skipped'
}

export const __test__ = { collectEntries, valueEquals, yamlKey, yamlScalar, cssRule }
