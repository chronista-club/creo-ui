/**
 * @chronista-club/creo-ui-editor-host — <EditorLayer> (Editor Mode の UI root)
 *
 * consumer は `<EditorHostProvider>` と一緒に配置:
 *   <EditorHostProvider>
 *     <App />
 *     <EditorLayer />
 *   </EditorHostProvider>
 *
 * Mode OFF では `visibility: hidden`、Mode ON で 4 region + selection outline
 * を描画する。token `--editor-mode-*` を consume するので、creo-ui の
 * tokens.css が load されている前提。
 */
import { For, Show, createSignal } from 'solid-js'
import type { JSX } from 'solid-js'
import { ExportBar } from './export-bar'
import { FieldEditor, FieldEditorInline } from './fields'
import { useEditorHover, useEditorMode, useEditorSelection } from './hooks'
import { messages, useT } from './i18n'
import { useEditorHost } from './provider'
import { ThemeEditor } from './theme-editor'
import type { EditorField, EditorScope } from './types'

// ---------- Styles ----------

const layerRootStyle = (visible: boolean): JSX.CSSProperties => ({
  position: 'fixed',
  inset: '0',
  'pointer-events': 'none',
  'z-index': '9998',
  visibility: visible ? 'visible' : 'hidden',
})

const topRegionStyle: JSX.CSSProperties = {
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
  gap: '12px',
}

const rightRegionStyle: JSX.CSSProperties = {
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
}

const leftRegionStyle: JSX.CSSProperties = {
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
  'overflow-y': 'auto',
  'backdrop-filter': 'blur(8px)',
}

const bottomRegionStyle: JSX.CSSProperties = {
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
}

const rightHeadingStyle: JSX.CSSProperties = {
  margin: '0 0 var(--editor-mode-panel-group-gap) 0',
  'font-size': '11px',
  color: 'var(--editor-mode-axis-future)',
  'text-transform': 'uppercase',
  'letter-spacing': '0.08em',
  'font-weight': '700',
}

const kbdInlineStyle: JSX.CSSProperties = {
  display: 'inline-block',
  padding: '1px 5px',
  'font-family': 'var(--typography-family-sans)',
  'font-size': '10px',
  background: 'var(--color-surface-bg-subtle)',
  border: '1px solid var(--editor-mode-region-border)',
  'border-radius': '3px',
}

const emptyHintStyle: JSX.CSSProperties = {
  'font-size': '11px',
  color: 'var(--color-text-tertiary)',
  'font-style': 'italic',
  margin: '0',
}

const clearButtonStyle: JSX.CSSProperties = {
  'margin-top': 'var(--editor-mode-panel-group-gap)',
  padding: '6px 10px',
  'font-size': '11px',
  background: 'transparent',
  color: 'var(--editor-mode-axis-future)',
  border: '1px solid var(--editor-mode-axis-future)',
  'border-radius': '4px',
  cursor: 'pointer',
  width: '100%',
}

// ---------- Scope sections (D-13 3-scope: instance / component / token) ----------

const scopeSectionStyle = (accent: string): JSX.CSSProperties => ({
  'margin-bottom': 'var(--editor-mode-panel-group-gap)',
  padding: '8px',
  background: `color-mix(in oklch, ${accent} 7%, transparent)`,
  border: `1px solid color-mix(in oklch, ${accent} 25%, transparent)`,
  'border-radius': '6px',
})

const scopeTitleStyle = (accent: string, clickable: boolean): JSX.CSSProperties => ({
  display: 'flex',
  'align-items': 'center',
  gap: '6px',
  width: '100%',
  margin: '0 0 6px 0',
  padding: '0',
  background: 'none',
  border: 'none',
  'font-size': '10px',
  'font-weight': '700',
  'letter-spacing': '0.08em',
  'text-transform': 'uppercase',
  'text-align': 'left',
  color: accent,
  cursor: clickable ? 'pointer' : 'default',
})

const scopeDotStyle = (accent: string): JSX.CSSProperties => ({
  width: '6px',
  height: '6px',
  'border-radius': '999px',
  background: accent,
  'flex-shrink': '0',
})

const scopeGroupLabelStyle: JSX.CSSProperties = {
  margin: '6px 0 4px',
  'font-size': '10px',
  color: 'var(--color-text-tertiary)',
  'text-transform': 'uppercase',
  'letter-spacing': '0.05em',
}

/**
 * RIGHT panel の scope section。fields が空なら描画しない。
 * collapsible (Tokens 想定) は default 折りたたみで件数を表示。
 */
function ScopeSection(props: {
  title: string
  accent: string
  fields: EditorField[]
  collapsible?: boolean
}): JSX.Element {
  const [open, setOpen] = createSignal(!props.collapsible)
  const grouped = (): [string, EditorField[]][] => {
    const m = new Map<string, EditorField[]>()
    for (const f of props.fields) {
      const g = f.group ?? ''
      const list = m.get(g)
      if (list) list.push(f)
      else m.set(g, [f])
    }
    return [...m.entries()]
  }
  return (
    <Show when={props.fields.length > 0}>
      <section style={scopeSectionStyle(props.accent)}>
        <Show
          when={props.collapsible}
          fallback={
            <div style={scopeTitleStyle(props.accent, false)}>
              <span style={scopeDotStyle(props.accent)} />
              {props.title}
            </div>
          }
        >
          <button
            type="button"
            onClick={() => setOpen(!open())}
            style={scopeTitleStyle(props.accent, true)}
          >
            <span style={scopeDotStyle(props.accent)} />
            {props.title}
            <span style={{ 'margin-left': 'auto', 'font-weight': '400' }}>
              {open() ? '▾' : `▸ ${props.fields.length}`}
            </span>
          </button>
        </Show>
        <Show when={open()}>
          <For each={grouped()}>
            {([group, fields]) => (
              <>
                <Show when={group}>
                  <div style={scopeGroupLabelStyle}>{group}</div>
                </Show>
                <For each={fields}>{(field) => <FieldEditor field={field} />}</For>
              </>
            )}
          </For>
        </Show>
      </section>
    </Show>
  )
}

// ---------- Outline (selection / hover) ----------

function Outline(props: { rect: DOMRect; state: 'hover' | 'active' }): JSX.Element {
  const color = (): string =>
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

// ---------- EditorLayer ----------

export function EditorLayer(): JSX.Element {
  const host = useEditorHost()
  const mode = useEditorMode()
  const selection = useEditorSelection()
  const hover = useEditorHover()
  const t = useT()

  const globalFields = (): EditorField[] =>
    host
      .fields()
      .filter((f: EditorField) => f.semantic === 'global')
      .sort((a: EditorField, b: EditorField) => (a.order ?? 0) - (b.order ?? 0))

  const visibleToolFields = (): EditorField[] => {
    const sel = selection()
    const toolFields = host
      .fields()
      .filter((f: EditorField) => f.semantic === 'tool')
      .sort((a: EditorField, b: EditorField) => (a.order ?? 0) - (b.order ?? 0))
    if (!sel) return toolFields
    const idSet = new Set(sel.fieldIds)
    return toolFields.filter((f: EditorField) => idSet.has(f.id))
  }

  // D-13 3-scope: scope 未指定 (app 宣言 field) は 'instance' 扱い
  const scopeFields = (scope: EditorScope): EditorField[] =>
    visibleToolFields().filter((f: EditorField) => (f.scope ?? 'instance') === scope)

  return (
    <div data-editor-layer style={layerRootStyle(mode() === 'on')}>
      <Show when={mode() === 'on'}>
        {/* Selection outlines (pointer-events: none) */}
        <Show when={!selection() && hover()}>
          {(h) => <Outline rect={h().rect} state="hover" />}
        </Show>
        <Show when={selection()}>{(s) => <Outline rect={s().rect} state="active" />}</Show>

        {/* TOP region: 左に hint (selection 情報) / 右に global fields */}
        <div style={topRegionStyle}>
          <span style={{ flex: '1' }}>
            {t(messages.editorMode.label)} <strong>{t(messages.editorMode.on)}</strong> —{' '}
            <Show when={selection()} fallback={<span>{t(messages.editorMode.clickToSelect)}</span>}>
              {(s) => (
                <span style={{ color: 'var(--editor-mode-axis-future)' }}>
                  {t(messages.editorMode.selectedPrefix)}
                  {s().targetId}
                </span>
              )}
            </Show>{' '}
            · <kbd style={kbdInlineStyle}>Esc</kbd>{' '}
            <Show when={selection()} fallback={<span>{t(messages.editorMode.escapeToExit)}</span>}>
              <span>{t(messages.editorMode.escapeToDeselect)}</span>
            </Show>{' '}
            · <kbd style={kbdInlineStyle}>Ctrl+Shift+E</kbd> {t(messages.editorMode.toggleShortcut)}
          </span>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              'align-items': 'center',
              'padding-left': '12px',
            }}
          >
            <For each={globalFields()}>{(field) => <FieldEditorInline field={field} />}</For>
          </div>
        </div>

        {/* RIGHT region: tool fields を 3-scope (D-13) で分割表示。
            並びは射程の狭い順 = instance → component → token */}
        <div style={rightRegionStyle}>
          <h3 style={rightHeadingStyle}>{t(messages.toolPanel.heading)}</h3>
          <Show
            when={visibleToolFields().length > 0}
            fallback={<p style={emptyHintStyle}>{t(messages.toolPanel.noFieldsForSelection)}</p>}
          >
            <ScopeSection
              title={t(messages.toolPanel.scopeInstance)}
              accent="var(--editor-mode-axis-future)"
              fields={scopeFields('instance')}
            />
            <ScopeSection
              title={t(messages.toolPanel.scopeComponent)}
              accent="var(--color-brand-primary)"
              fields={scopeFields('component')}
            />
            <ScopeSection
              title={t(messages.toolPanel.scopeToken)}
              accent="var(--color-semantic-info)"
              fields={scopeFields('token')}
              collapsible
            />
          </Show>
          <Show when={selection()}>
            <button type="button" onClick={() => host.clearSelection()} style={clearButtonStyle}>
              {t(messages.toolPanel.showAllFields)}
            </button>
          </Show>
        </div>

        {/* LEFT region: ThemeEditor (semantic = source / 過去・参照) */}
        <div style={leftRegionStyle}>
          <ThemeEditor />
        </div>

        {/* BOTTOM region: utility — Export bar で現 editor state を clipboard に出力 */}
        <div style={bottomRegionStyle}>
          <ExportBar host={host} />
        </div>
      </Show>
    </div>
  )
}
