/**
 * @chronista-club/creoui-editor-host — FieldEditor dispatcher + per-type editors
 *
 * RIGHT region (panel) 向けは縦並び (`<FieldEditor>`)、TOP region (inline)
 * 向けは横並びコンパクト (`<FieldEditorInline>`) の 2 variants を提供。
 */
import { For } from 'solid-js'
import type { JSX } from 'solid-js'
import { useEditorHost } from './provider'
import type { EditorField } from './types'

// ---------- Styles ----------

const labelBlockStyle: JSX.CSSProperties = {
  display: 'block',
  'font-size': '11px',
  color: 'var(--editor-mode-panel-field-label)',
  'margin-bottom': '4px',
}

const labelInlineStyle: JSX.CSSProperties = {
  'font-size': '11px',
  color: 'var(--editor-mode-panel-field-label)',
  'white-space': 'nowrap',
}

const rowStyle: JSX.CSSProperties = {
  display: 'flex',
  gap: '8px',
  'align-items': 'center',
}

const monoValueStyle: JSX.CSSProperties = {
  color: 'var(--editor-mode-panel-field-value)',
  'font-size': '11px',
  'min-width': '52px',
  'text-align': 'right',
  'font-family': 'var(--typography-family-mono)',
}

const selectStyle: JSX.CSSProperties = {
  flex: '1',
  padding: '4px 6px',
  'font-size': '11px',
  'font-family': 'var(--typography-family-sans)',
  background: 'var(--color-surface-surface)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--editor-mode-region-border)',
  'border-radius': '4px',
}

const textInputStyle: JSX.CSSProperties = {
  ...selectStyle,
}

const readonlyTextStyle: JSX.CSSProperties = {
  padding: '6px 8px',
  background: 'var(--color-surface-bg-subtle)',
  border: '1px solid var(--editor-mode-region-border)',
  'border-radius': '4px',
  'font-family': 'var(--typography-family-mono)',
  'font-size': '11px',
  color: 'var(--color-text-secondary)',
  'white-space': 'pre-wrap',
}

// ---------- Per-type editors ----------

function NumberEditor(props: {
  field: EditorField
  value: number
  onChange: (v: number) => void
}): JSX.Element {
  return (
    <div style={rowStyle}>
      <input
        type="range"
        min={props.field.constraints?.min ?? 0}
        max={props.field.constraints?.max ?? 100}
        step={props.field.constraints?.step ?? 1}
        value={props.value}
        onInput={(e) => props.onChange(Number(e.currentTarget.value))}
        style={{ flex: '1', 'accent-color': 'var(--editor-mode-axis-future)' }}
      />
      <span style={monoValueStyle}>
        {props.value}
        {props.field.constraints?.unit ?? ''}
      </span>
    </div>
  )
}

function ColorEditor(props: {
  value: string
  onChange: (v: string) => void
}): JSX.Element {
  return (
    <div style={rowStyle}>
      <input
        type="color"
        value={props.value}
        onInput={(e) => props.onChange(e.currentTarget.value)}
        style={{
          width: '32px',
          height: '28px',
          border: '1px solid var(--editor-mode-region-border)',
          'border-radius': '4px',
          cursor: 'pointer',
          padding: '0',
          background: 'transparent',
        }}
      />
      <span
        style={{
          ...monoValueStyle,
          'min-width': 'auto',
          flex: '1',
          'text-align': 'left',
        }}
      >
        {props.value}
      </span>
    </div>
  )
}

function BooleanEditor(props: {
  value: boolean
  onChange: (v: boolean) => void
}): JSX.Element {
  return (
    <div style={rowStyle}>
      <input
        type="checkbox"
        checked={props.value}
        onInput={(e) => props.onChange(e.currentTarget.checked)}
        style={{
          width: '16px',
          height: '16px',
          'accent-color': 'var(--editor-mode-axis-future)',
          cursor: 'pointer',
        }}
      />
      <span style={{ ...monoValueStyle, 'min-width': 'auto', flex: '1', 'text-align': 'left' }}>
        {props.value ? 'on' : 'off'}
      </span>
    </div>
  )
}

function SelectEditor(props: {
  field: EditorField
  value: string
  onChange: (v: string) => void
}): JSX.Element {
  const options = props.field.constraints?.options ?? []
  return (
    <div style={rowStyle}>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.currentTarget.value)}
        style={selectStyle}
      >
        <For each={options}>{(opt) => <option value={opt}>{opt}</option>}</For>
      </select>
    </div>
  )
}

function StringEditor(props: {
  value: string
  onChange: (v: string) => void
}): JSX.Element {
  return (
    <div style={rowStyle}>
      <input
        type="text"
        value={props.value ?? ''}
        onInput={(e) => props.onChange(e.currentTarget.value)}
        style={textInputStyle}
      />
    </div>
  )
}

function ReadonlyTextEditor(props: { value: string }): JSX.Element {
  return <div style={readonlyTextStyle}>{props.value}</div>
}

// ---------- Dispatcher (縦並び、RIGHT region 向け) ----------

export function FieldEditor(props: { field: EditorField }): JSX.Element {
  const host = useEditorHost()
  const value = (): unknown => {
    host.values()
    return host.getValue(props.field.id)
  }
  const onChange = (v: unknown): void => host.setValue(props.field.id, v)

  return (
    <div style={{ 'margin-bottom': 'var(--editor-mode-panel-field-gap)' }}>
      <span style={labelBlockStyle}>{props.field.label}</span>
      {(() => {
        switch (props.field.type) {
          case 'number':
            return (
              <NumberEditor field={props.field} value={value() as number} onChange={onChange} />
            )
          case 'color':
            return <ColorEditor value={value() as string} onChange={onChange} />
          case 'boolean':
            return <BooleanEditor value={value() as boolean} onChange={onChange} />
          case 'select':
            return (
              <SelectEditor field={props.field} value={value() as string} onChange={onChange} />
            )
          case 'string':
            return <StringEditor value={value() as string} onChange={onChange} />
          case 'readonly-text':
            return <ReadonlyTextEditor value={String(value() ?? '')} />
        }
      })()}
    </div>
  )
}

// ---------- Inline variant (TOP region 向け、label + 小さな control を横並び) ----------

export function FieldEditorInline(props: { field: EditorField }): JSX.Element {
  const host = useEditorHost()
  const value = (): unknown => {
    host.values()
    return host.getValue(props.field.id)
  }
  const onChange = (v: unknown): void => host.setValue(props.field.id, v)

  return (
    <div style={{ display: 'flex', 'align-items': 'center', gap: '6px' }}>
      <span style={labelInlineStyle}>{props.field.label}:</span>
      {(() => {
        switch (props.field.type) {
          case 'select':
            return (
              <select
                value={value() as string}
                onChange={(e) => onChange(e.currentTarget.value)}
                style={{
                  padding: '2px 6px',
                  'font-size': '11px',
                  'font-family': 'var(--typography-family-sans)',
                  background: 'var(--color-surface-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--editor-mode-region-border)',
                  'border-radius': '3px',
                }}
              >
                <For each={props.field.constraints?.options ?? []}>
                  {(opt) => <option value={opt}>{opt}</option>}
                </For>
              </select>
            )
          case 'boolean':
            return (
              <input
                type="checkbox"
                checked={value() as boolean}
                onInput={(e) => onChange(e.currentTarget.checked)}
                style={{ 'accent-color': 'var(--editor-mode-axis-global)' }}
              />
            )
          default:
            return (
              <span
                style={{
                  'font-size': '11px',
                  'font-family': 'var(--typography-family-mono)',
                  color: 'var(--editor-mode-panel-field-value)',
                }}
              >
                {String(value() ?? '')}
              </span>
            )
        }
      })()}
    </div>
  )
}
