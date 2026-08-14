/**
 * @chronista-club/creo-ui-editor-host — FieldEditor dispatcher + per-type editors
 *
 * RIGHT region (panel) 向けは縦並び (`<FieldEditor>`)、TOP region (inline)
 * 向けは横並びコンパクト (`<FieldEditorInline>`) の 2 variants を提供。
 */
import { For, Show } from 'solid-js'
import type { JSX } from 'solid-js'
import { messages, useT } from './i18n'
import {
  OKLCH_C_MAX,
  type Oklch,
  type OklchChannel,
  formatOklch,
  oklchTrackGradient,
  parseOklch,
} from './oklch'
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

/* number ノブの 1 ライナー行: name | slider (66% 固定) | 値 | ↺。
   name は残り幅で ellipsis (全文は title tooltip)。gap を詰めて name に幅を返す */
const numberRowStyle: JSX.CSSProperties = {
  display: 'flex',
  gap: '6px',
  'align-items': 'center',
}

const labelEllipsisStyle: JSX.CSSProperties = {
  flex: '1 1 0',
  'min-width': '0',
  overflow: 'hidden',
  'text-overflow': 'ellipsis',
  'white-space': 'nowrap',
  'font-size': '11px',
  color: 'var(--editor-mode-panel-field-label)',
}

const monoValueStyle: JSX.CSSProperties = {
  color: 'var(--editor-mode-panel-field-value)',
  'font-size': '11px',
  'min-width': '52px',
  'text-align': 'right',
  'font-family': 'var(--typography-family-sans)',
}

/** 値の右の ↺ — SSOT 既定値へ戻す。既定のままの間は visibility hidden で列幅を保つ */
const resetButtonStyle: JSX.CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'var(--color-text-tertiary)',
  'font-size': '13px',
  'line-height': '1',
  padding: '2px',
  cursor: 'pointer',
  'flex-shrink': '0',
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
  'font-family': 'var(--typography-family-sans)',
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
  const t = useT()
  const initial = (): number | undefined =>
    typeof props.field.initial === 'number' ? props.field.initial : undefined
  const atDefault = (): boolean => initial() === undefined || props.value === initial()
  return (
    <div style={numberRowStyle}>
      <span style={labelEllipsisStyle} title={props.field.label}>
        {props.field.label}
      </span>
      <input
        type="range"
        min={props.field.constraints?.min ?? 0}
        max={props.field.constraints?.max ?? 100}
        step={props.field.constraints?.step ?? 1}
        value={props.value}
        onInput={(e) => props.onChange(Number(e.currentTarget.value))}
        style={{
          flex: '0 0 66%',
          'min-width': '0',
          'accent-color': 'var(--editor-mode-axis-future)',
        }}
      />
      <span style={{ ...monoValueStyle, 'min-width': '38px', 'font-size': '10px' }}>
        {props.value}
        {props.field.constraints?.unit ?? ''}
      </span>
      <button
        type="button"
        title={t(messages.discovery.reset)}
        aria-label={t(messages.discovery.reset)}
        onClick={() => {
          const v = initial()
          if (v !== undefined) props.onChange(v)
        }}
        style={{ ...resetButtonStyle, visibility: atDefault() ? 'hidden' : 'visible' }}
      >
        ↺
      </button>
    </div>
  )
}

/**
 * color field の dispatcher: OKLCH literal は OKLCH editor (L/C/H/A slider)、
 * それ以外 (hex 等) は native color input に fallback。
 */
function ColorEditor(props: {
  value: string
  onChange: (v: string) => void
}): JSX.Element {
  return (
    <Show when={parseOklch(props.value)} fallback={<HexColorEditor {...props} />}>
      {(parsed) => <OklchEditor parsed={parsed()} raw={props.value} onChange={props.onChange} />}
    </Show>
  )
}

function HexColorEditor(props: {
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

// ---------- OKLCH editor (Phase M6) ----------

/* input[type=range] の thumb は pseudo-element でしか style できないため、
   inline style ではなく 1 回だけ <style> を注入する */
const OKLCH_STYLE_ID = 'creo-eh-oklch-style'
const OKLCH_SLIDER_CSS = `
.creo-eh-oklch-range {
  -webkit-appearance: none;
  appearance: none;
  flex: 1;
  height: 12px;
  border-radius: 6px;
  border: 1px solid var(--editor-mode-region-border, rgba(128,128,128,0.4));
  margin: 0;
  cursor: pointer;
}
.creo-eh-oklch-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid rgba(0, 0, 0, 0.55);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
.creo-eh-oklch-range::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid rgba(0, 0, 0, 0.55);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
}
.creo-eh-oklch-range:focus-visible {
  outline: 2px solid var(--editor-mode-axis-future, #7cc);
  outline-offset: 2px;
}
`

function ensureOklchStyle(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(OKLCH_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = OKLCH_STYLE_ID
  style.textContent = OKLCH_SLIDER_CSS
  document.head.appendChild(style)
}

/** alpha track の下に敷く市松模様 (transparent の視認用) */
const CHECKER_BG =
  'repeating-conic-gradient(rgba(128,128,128,0.5) 0% 25%, rgba(220,220,220,0.5) 0% 50%) 0 0 / 8px 8px'

const oklchChannelLabelStyle: JSX.CSSProperties = {
  width: '12px',
  'flex-shrink': '0',
  'font-size': '10px',
  'font-weight': '700',
  color: 'var(--editor-mode-panel-field-label)',
}

const oklchValueStyle: JSX.CSSProperties = {
  ...monoValueStyle,
  'min-width': '44px',
  'font-size': '10px',
}

const CHANNELS: {
  key: OklchChannel
  label: string
  min: number
  max: number
  step: number
  display: (o: Oklch) => string
}[] = [
  { key: 'l', label: 'L', min: 0, max: 1, step: 0.005, display: (o) => o.l.toFixed(3) },
  { key: 'c', label: 'C', min: 0, max: OKLCH_C_MAX, step: 0.002, display: (o) => o.c.toFixed(3) },
  { key: 'h', label: 'H', min: 0, max: 360, step: 1, display: (o) => `${Math.round(o.h)}°` },
  { key: 'a', label: 'A', min: 0, max: 1, step: 0.01, display: (o) => o.a.toFixed(2) },
]

function OklchEditor(props: {
  parsed: Oklch
  raw: string
  onChange: (v: string) => void
}): JSX.Element {
  ensureOklchStyle()
  const update = (channel: OklchChannel, value: number): void =>
    props.onChange(formatOklch({ ...props.parsed, [channel]: value }))

  return (
    <div style={{ display: 'flex', 'flex-direction': 'column', gap: '5px' }}>
      {/* swatch + raw 値 */}
      <div style={rowStyle}>
        <span
          style={{
            width: '24px',
            height: '18px',
            'border-radius': '4px',
            border: '1px solid var(--editor-mode-region-border)',
            background: `linear-gradient(${props.raw}, ${props.raw}), ${CHECKER_BG}`,
            'flex-shrink': '0',
          }}
        />
        <span style={{ ...monoValueStyle, 'min-width': 'auto', flex: '1', 'text-align': 'left' }}>
          {props.raw}
        </span>
      </div>
      <For each={CHANNELS}>
        {(ch) => (
          <div style={rowStyle}>
            <span style={oklchChannelLabelStyle}>{ch.label}</span>
            <input
              type="range"
              class="creo-eh-oklch-range"
              min={ch.min}
              max={ch.max}
              step={ch.step}
              value={props.parsed[ch.key]}
              onInput={(e) => update(ch.key, Number(e.currentTarget.value))}
              style={{
                background:
                  ch.key === 'a'
                    ? `${oklchTrackGradient('a', props.parsed)}, ${CHECKER_BG}`
                    : oklchTrackGradient(ch.key, props.parsed),
              }}
            />
            <span style={oklchValueStyle}>{ch.display(props.parsed)}</span>
          </div>
        )}
      </For>
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
      {/* number は 1 ライナー (label 行内 ellipsis)。他 type は従来の label 行 + editor */}
      <Show when={props.field.type !== 'number'}>
        <span style={labelBlockStyle}>{props.field.label}</span>
      </Show>
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
                  'font-family': 'var(--typography-family-sans)',
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
