/**
 * Editor Layer overlay — walking skeleton 版 (Phase 1 scope)。
 *
 * - TOP: shortcut hint + selection indicator
 * - RIGHT: tool fields slider/picker panel (selection があれば絞り込み、なければ全 tool fields)
 * - LEFT / BOTTOM: スタブ (Phase 2a で実装)
 * - Selection outline (hover + active 2 state)
 */
import { For, Show } from 'solid-js'
import {
  type EditorField,
  clearSelection,
  editorMode,
  setValue,
  useFields,
  useHover,
  useSelection,
  useValues,
} from './editor-host'

export function EditorLayer() {
  const fields = useFields()
  const values = useValues()
  const selection = useSelection()
  const hover = useHover()

  const visibleToolFields = (): EditorField[] => {
    const sel = selection()
    const toolFields = fields()
      .filter((f) => f.semantic === 'tool')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    if (!sel) return toolFields
    const idSet = new Set(sel.fieldIds)
    return toolFields.filter((f) => idSet.has(f.id))
  }

  const globalFields = (): EditorField[] =>
    fields()
      .filter((f) => f.semantic === 'global')
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <div
      data-editor-layer
      style={{
        position: 'fixed',
        inset: '0',
        'pointer-events': 'none',
        'z-index': '9998',
        visibility: editorMode.isEnabled() ? 'visible' : 'hidden',
      }}
    >
      <Show when={editorMode.isEnabled()}>
        {/* Selection outlines (pointer-events: none で通過) */}
        <Show when={!selection() && hover()}>
          {(h) => <Outline rect={h().rect} state="hover" />}
        </Show>
        <Show when={selection()}>{(s) => <Outline rect={s().rect} state="active" />}</Show>

        {/* TOP region: 左に hint、右に global fields */}
        <div style={topRegionStyle()}>
          <span style={{ flex: '1' }}>
            Editor Mode <strong>ON</strong> —{' '}
            <Show when={selection()} fallback={<span>要素をクリックで選択</span>}>
              {(s) => (
                <span style={{ color: 'var(--editor-mode-axis-future)' }}>
                  選択中: {s().targetId}
                </span>
              )}
            </Show>{' '}
            · <kbd style={kbdInlineStyle}>Esc</kbd> で{' '}
            <Show when={selection()} fallback={<span>終了</span>}>
              <span>選択解除</span>
            </Show>{' '}
            · <kbd style={kbdInlineStyle}>Ctrl+Shift+E</kbd> で切替
          </span>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              'align-items': 'center',
              'padding-left': '12px',
            }}
          >
            <For each={globalFields()}>
              {(field) => (
                <GlobalFieldInline
                  field={field}
                  value={values()[field.id]}
                  onChange={(v) => setValue(field.id, v)}
                />
              )}
            </For>
          </div>
        </div>

        {/* RIGHT region */}
        <div style={rightRegionStyle()}>
          <h3 style={regionHeadingStyle('future')}>▶ ツール</h3>
          <Show
            when={visibleToolFields().length > 0}
            fallback={<p style={emptyHintStyle()}>この選択に紐付く field はありません。</p>}
          >
            <For each={visibleToolFields()}>
              {(field) => (
                <FieldEditor
                  field={field}
                  value={values()[field.id]}
                  onChange={(v) => setValue(field.id, v)}
                />
              )}
            </For>
          </Show>
          <Show when={selection()}>
            <button type="button" onClick={() => clearSelection()} style={clearButtonStyle()}>
              全 tool field を表示
            </button>
          </Show>
        </div>

        {/* LEFT region: ThemeEditor */}
        <div style={leftRegionStyle()}>
          <ThemeEditor />
        </div>

        {/* BOTTOM region (stub) */}
        <div style={bottomRegionStyle()}>
          <span style={{ 'font-size': '11px', color: 'var(--color-text-tertiary)' }}>
            🔧 ユーティリティ — Phase 2a で実装 (一括処理 / AI チャット など)
          </span>
        </div>
      </Show>
    </div>
  )
}

// --- ThemeEditor (LEFT region) ---

/**
 * 現在 active な theme の meta (名前・flavor) + 主要 color swatch grid。
 * semantic="source" (過去・元データ) の位置付けで、Editor の参照情報として使う。
 */
const THEME_INFO: Record<string, { name: string; flavor: string; family: string }> = {
  'mint-dark': {
    name: 'Mint Dark',
    family: 'Creo',
    flavor: 'Dark theme with mint green accent — Creo Design System default',
  },
  'mint-light': {
    name: 'Mint Light',
    family: 'Creo',
    flavor: 'Default light theme with mint green accent',
  },
  'sora-dark': {
    name: '空 (Sora) Dark',
    family: '空 (Sora)',
    flavor: 'Night sky-inspired dark theme',
  },
  'sora-light': {
    name: '空 (Sora)',
    family: '空 (Sora)',
    flavor: 'Sky-inspired light theme with sky blue accent',
  },
  'contrast-dark': {
    name: 'Paradox Dark',
    family: 'Contrast / Paradox',
    flavor: 'The paradox at nightfall — purple × pink × cyan が暗闇で際立つ',
  },
  'contrast-light': {
    name: 'Paradox Light',
    family: 'Contrast / Paradox',
    flavor: 'The paradox in daylight — 対立色が白の上で共存する矛盾',
  },
  'oldschool-dark': {
    name: 'Old School Dark',
    family: 'Old School',
    flavor: 'Retro natural dark theme — teal × orange',
  },
  'oldschool-light': {
    name: 'Old School',
    family: 'Old School',
    flavor: 'Retro natural light theme — teal × orange',
  },
}

const SWATCH_ROWS: { label: string; cssVar: string }[] = [
  { label: 'brand.primary', cssVar: '--color-brand-primary' },
  { label: 'brand.primary-hover', cssVar: '--color-brand-primary-hover' },
  { label: 'brand.primary-subtle', cssVar: '--color-brand-primary-subtle' },
  { label: 'brand.secondary', cssVar: '--color-brand-secondary' },
  { label: 'semantic.success', cssVar: '--color-semantic-success' },
  { label: 'semantic.warning', cssVar: '--color-semantic-warning' },
  { label: 'semantic.error', cssVar: '--color-semantic-error' },
  { label: 'semantic.info', cssVar: '--color-semantic-info' },
  { label: 'surface.bg-base', cssVar: '--color-surface-bg-base' },
  { label: 'surface.bg-subtle', cssVar: '--color-surface-bg-subtle' },
  { label: 'surface.surface', cssVar: '--color-surface-surface' },
  { label: 'surface.border', cssVar: '--color-surface-border' },
  { label: 'text.primary', cssVar: '--color-text-primary' },
  { label: 'text.secondary', cssVar: '--color-text-secondary' },
  { label: 'text.tertiary', cssVar: '--color-text-tertiary' },
]

function ThemeEditor() {
  const values = useValues()
  const themeId = () => String(values()['theme.mode'] ?? 'mint-dark')
  const info = () => THEME_INFO[themeId()] ?? THEME_INFO['mint-dark']

  return (
    <>
      <h3 style={regionHeadingStyle('past')}>◀ Theme</h3>

      <div
        style={{
          'margin-bottom': 'var(--editor-mode-panel-group-gap)',
          padding: '8px',
          background: 'var(--color-surface-bg-subtle)',
          border: '1px solid var(--editor-mode-region-border)',
          'border-radius': '4px',
        }}
      >
        <div
          style={{
            'font-size': '12px',
            'font-weight': '700',
            color: 'var(--color-text-primary)',
            'margin-bottom': '2px',
          }}
        >
          {info().name}
        </div>
        <div
          style={{
            'font-size': '10px',
            color: 'var(--color-text-tertiary)',
            'margin-bottom': '4px',
            'font-family': 'var(--typography-family-mono)',
          }}
        >
          family: {info().family}
        </div>
        <div
          style={{
            'font-size': '10px',
            color: 'var(--color-text-secondary)',
            'line-height': '1.4',
          }}
        >
          {info().flavor}
        </div>
      </div>

      <div
        style={{
          'font-size': '10px',
          color: 'var(--editor-mode-panel-field-label)',
          'text-transform': 'uppercase',
          'letter-spacing': '0.05em',
          'margin-bottom': '6px',
        }}
      >
        Swatches
      </div>
      <div
        style={{
          display: 'grid',
          'grid-template-columns': '1fr',
          gap: '3px',
        }}
      >
        <For each={SWATCH_ROWS}>
          {(row) => (
            <div
              style={{
                display: 'flex',
                'align-items': 'center',
                gap: '6px',
                'font-size': '10px',
                'font-family': 'var(--typography-family-mono)',
              }}
              title={`${row.label}\n${row.cssVar}`}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  'min-width': '14px',
                  'border-radius': '3px',
                  background: `var(${row.cssVar})`,
                  border: '1px solid var(--editor-mode-region-border)',
                }}
              />
              <span
                style={{
                  color: 'var(--color-text-secondary)',
                  'white-space': 'nowrap',
                  overflow: 'hidden',
                  'text-overflow': 'ellipsis',
                }}
              >
                {row.label}
              </span>
            </div>
          )}
        </For>
      </div>
    </>
  )
}

// --- Global field (TOP inline) ---

function GlobalFieldInline(props: {
  field: EditorField
  value: unknown
  onChange: (v: unknown) => void
}) {
  return (
    <div style={{ display: 'flex', 'align-items': 'center', gap: '6px' }}>
      <span
        style={{
          'font-size': '11px',
          color: 'var(--editor-mode-panel-field-label)',
          'white-space': 'nowrap',
        }}
      >
        {props.field.label}:
      </span>
      {(() => {
        switch (props.field.type) {
          case 'select':
            return (
              <select
                value={props.value as string}
                onChange={(e) => props.onChange(e.currentTarget.value)}
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
                checked={props.value as boolean}
                onInput={(e) => props.onChange(e.currentTarget.checked)}
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
                {String(props.value)}
              </span>
            )
        }
      })()}
    </div>
  )
}

// --- Field editors by type ---

function FieldEditor(props: {
  field: EditorField
  value: unknown
  onChange: (v: unknown) => void
}) {
  return (
    <div style={{ 'margin-bottom': 'var(--editor-mode-panel-field-gap)' }}>
      <span style={labelStyle()}>{props.field.label}</span>
      {(() => {
        switch (props.field.type) {
          case 'number':
            return (
              <NumberEditor
                field={props.field}
                value={props.value as number}
                onChange={props.onChange}
              />
            )
          case 'color':
            return (
              <ColorEditor
                field={props.field}
                value={props.value as string}
                onChange={props.onChange}
              />
            )
          case 'boolean':
            return (
              <BooleanEditor
                field={props.field}
                value={props.value as boolean}
                onChange={props.onChange}
              />
            )
          case 'select':
            return (
              <SelectEditor
                field={props.field}
                value={props.value as string}
                onChange={props.onChange}
              />
            )
          case 'string':
            return (
              <StringEditor
                field={props.field}
                value={props.value as string}
                onChange={props.onChange}
              />
            )
          case 'readonly-text':
            return <ReadonlyTextEditor value={String(props.value ?? '')} />
        }
      })()}
    </div>
  )
}

function NumberEditor(props: {
  field: EditorField
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div style={rowStyle()}>
      <input
        type="range"
        min={props.field.constraints?.min ?? 0}
        max={props.field.constraints?.max ?? 100}
        step={props.field.constraints?.step ?? 1}
        value={props.value}
        onInput={(e) => props.onChange(Number(e.currentTarget.value))}
        style={{ flex: '1', 'accent-color': 'var(--editor-mode-axis-future)' }}
      />
      <span style={valueStyle()}>
        {props.value}
        {props.field.constraints?.unit ?? ''}
      </span>
    </div>
  )
}

function ColorEditor(props: {
  field: EditorField
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={rowStyle()}>
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
          ...valueStyle(),
          'min-width': 'auto',
          flex: '1',
          'text-align': 'left',
          'font-family': 'var(--typography-family-mono)',
        }}
      >
        {props.value}
      </span>
    </div>
  )
}

function BooleanEditor(props: {
  field: EditorField
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div style={rowStyle()}>
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
      <span style={{ ...valueStyle(), 'min-width': 'auto', flex: '1', 'text-align': 'left' }}>
        {props.value ? 'on' : 'off'}
      </span>
    </div>
  )
}

function SelectEditor(props: {
  field: EditorField
  value: string
  onChange: (v: string) => void
}) {
  const options = props.field.constraints?.options ?? []
  return (
    <div style={rowStyle()}>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.currentTarget.value)}
        style={selectStyle()}
      >
        <For each={options}>{(opt) => <option value={opt}>{opt}</option>}</For>
      </select>
    </div>
  )
}

function StringEditor(props: {
  field: EditorField
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div style={rowStyle()}>
      <input
        type="text"
        value={props.value ?? ''}
        onInput={(e) => props.onChange(e.currentTarget.value)}
        style={textInputStyle()}
      />
    </div>
  )
}

function ReadonlyTextEditor(props: { value: string }) {
  return (
    <div
      style={{
        padding: '6px 8px',
        background: 'var(--color-surface-bg-subtle)',
        border: '1px solid var(--editor-mode-region-border)',
        'border-radius': '4px',
        'font-family': 'var(--typography-family-mono)',
        'font-size': '11px',
        color: 'var(--color-text-secondary)',
        'white-space': 'pre-wrap',
      }}
    >
      {props.value}
    </div>
  )
}

// --- Selection outline ---

function Outline(props: { rect: DOMRect; state: 'hover' | 'active' }) {
  const color = () =>
    props.state === 'active'
      ? 'var(--editor-mode-selection-outline-active)'
      : 'var(--editor-mode-selection-outline-hover)'
  return (
    <div
      style={{
        position: 'absolute',
        left: `${props.rect.left - 2}px`,
        top: `${props.rect.top - 2}px`,
        width: `${props.rect.width + 4}px`,
        height: `${props.rect.height + 4}px`,
        'pointer-events': 'none',
        border: `var(--editor-mode-selection-outline-width) solid ${color()}`,
        'border-radius': '6px',
        'box-sizing': 'border-box',
        transition: 'all 80ms ease',
      }}
    />
  )
}

// --- Styles ---

const topRegionStyle = (): Record<string, string> => ({
  position: 'absolute',
  top: '0',
  left: '0',
  right: '0',
  height: 'var(--editor-mode-region-top-height)',
  padding: '0 var(--editor-mode-region-padding)',
  display: 'flex',
  'align-items': 'center',
  'border-bottom': '2px solid var(--editor-mode-axis-global)',
  background:
    'color-mix(in oklch, var(--editor-mode-region-bg-color) calc(var(--editor-mode-region-bg-opacity) * 100%), transparent)',
  'pointer-events': 'auto',
  'font-size': '12px',
  color: 'var(--color-text-secondary)',
  'backdrop-filter': 'blur(8px)',
})

const rightRegionStyle = (): Record<string, string> => ({
  position: 'absolute',
  right: '0',
  top: 'var(--editor-mode-region-top-height)',
  bottom: 'var(--editor-mode-region-bottom-height)',
  width: 'var(--editor-mode-region-right-width)',
  padding: 'var(--editor-mode-region-padding)',
  'border-left': '2px solid var(--editor-mode-axis-future)',
  background:
    'color-mix(in oklch, var(--editor-mode-region-bg-color) calc(var(--editor-mode-region-bg-opacity) * 100%), transparent)',
  'pointer-events': 'auto',
  'overflow-y': 'auto',
  'backdrop-filter': 'blur(8px)',
})

const leftRegionStyle = (): Record<string, string> => ({
  position: 'absolute',
  left: '0',
  top: 'var(--editor-mode-region-top-height)',
  bottom: 'var(--editor-mode-region-bottom-height)',
  width: 'var(--editor-mode-region-left-width)',
  padding: 'var(--editor-mode-region-padding)',
  'border-right': '2px solid var(--editor-mode-axis-past)',
  background:
    'color-mix(in oklch, var(--editor-mode-region-bg-color) calc(var(--editor-mode-region-bg-opacity) * 100%), transparent)',
  'pointer-events': 'auto',
  'backdrop-filter': 'blur(8px)',
})

const bottomRegionStyle = (): Record<string, string> => ({
  position: 'absolute',
  left: '0',
  right: '0',
  bottom: '0',
  height: 'var(--editor-mode-region-bottom-height)',
  padding: '0 var(--editor-mode-region-padding)',
  display: 'flex',
  'align-items': 'center',
  'border-top': '2px solid var(--editor-mode-axis-utility)',
  background:
    'color-mix(in oklch, var(--editor-mode-region-bg-color) calc(var(--editor-mode-region-bg-opacity) * 100%), transparent)',
  'pointer-events': 'auto',
  'backdrop-filter': 'blur(8px)',
})

const regionHeadingStyle = (
  axis: 'future' | 'past' | 'global' | 'utility',
): Record<string, string> => ({
  margin: '0 0 var(--editor-mode-panel-group-gap) 0',
  'font-size': '11px',
  color: `var(--editor-mode-axis-${axis})`,
  'text-transform': 'uppercase',
  'letter-spacing': '0.08em',
  'font-weight': '700',
})

const labelStyle = (): Record<string, string> => ({
  display: 'block',
  'font-size': '11px',
  color: 'var(--editor-mode-panel-field-label)',
  'margin-bottom': '4px',
})

const rowStyle = (): Record<string, string> => ({
  display: 'flex',
  gap: '8px',
  'align-items': 'center',
})

const valueStyle = (): Record<string, string> => ({
  color: 'var(--editor-mode-panel-field-value)',
  'font-size': '11px',
  'min-width': '52px',
  'text-align': 'right',
  'font-family': 'var(--typography-family-mono)',
})

const selectStyle = (): Record<string, string> => ({
  flex: '1',
  padding: '4px 6px',
  'font-size': '11px',
  'font-family': 'var(--typography-family-sans)',
  background: 'var(--color-surface-surface)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--editor-mode-region-border)',
  'border-radius': '4px',
})

const textInputStyle = (): Record<string, string> => ({
  flex: '1',
  padding: '4px 6px',
  'font-size': '11px',
  'font-family': 'var(--typography-family-sans)',
  background: 'var(--color-surface-surface)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--editor-mode-region-border)',
  'border-radius': '4px',
})

const emptyHintStyle = (): Record<string, string> => ({
  'font-size': '11px',
  color: 'var(--color-text-tertiary)',
  'font-style': 'italic',
  margin: '0',
})

const clearButtonStyle = (): Record<string, string> => ({
  'margin-top': 'var(--editor-mode-panel-group-gap)',
  padding: '6px 10px',
  'font-size': '11px',
  background: 'transparent',
  color: 'var(--editor-mode-axis-future)',
  border: '1px solid var(--editor-mode-axis-future)',
  'border-radius': '4px',
  cursor: 'pointer',
  width: '100%',
})

const kbdInlineStyle: Record<string, string> = {
  display: 'inline-block',
  padding: '1px 5px',
  'font-family': 'var(--typography-family-mono)',
  'font-size': '10px',
  background: 'var(--color-surface-bg-subtle)',
  border: '1px solid var(--editor-mode-region-border)',
  'border-radius': '3px',
}
