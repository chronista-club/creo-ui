/**
 * @chronista-club/creo-ui-editor-host — <EditorLayer> (Editor Mode の UI root)
 *
 * consumer は `<EditorHostProvider>` と一緒に配置:
 *   <EditorHostProvider>
 *     <App />
 *     <EditorLayer />
 *   </EditorHostProvider>
 *
 * Mode OFF では `visibility: hidden`。Mode ON で右上に floating inspector
 * パネル1枚 + selection outline を描画する (ミニマム版: 旧 4-region を廃し、
 * page を全面ブライトに保ち「対象を見ながら param を回す」に集中)。theme /
 * export は既定から外し (theme-editor.tsx / export-bar.tsx は残置)、後で
 * パネル内に畳み戻せる。token `--editor-mode-*` を consume する。
 */
import { For, Show, createSignal } from 'solid-js'
import type { JSX } from 'solid-js'
import { Portal } from 'solid-js/web'
import { FieldEditor } from './fields'
import { useEditorHover, useEditorMode, useEditorSelection } from './hooks'
import { messages, useT } from './i18n'
import { useEditorHost } from './provider'
import type { EditorField, EditorScope } from './types'

// ---------- Styles ----------

const layerRootStyle = (visible: boolean): JSX.CSSProperties => ({
  position: 'fixed',
  inset: '0',
  'pointer-events': 'none',
  'z-index': '9998',
  visibility: visible ? 'visible' : 'hidden',
})

// ミニマム版: 全画面 4-region を廃し、右端に full-height の inspector ドック1枚。
// content は下敷きのまま (D-6 非侵襲)、右上に固定して上端〜下端まで伸ばす。
const panelStyle: JSX.CSSProperties = {
  position: 'fixed',
  top: '0',
  right: '0',
  bottom: '0',
  width: '320px',
  'overflow-y': 'auto',
  display: 'flex',
  'flex-direction': 'column',
  gap: '10px',
  padding: '14px',
  background: 'var(--color-surface-surface)',
  'border-left': '1px solid var(--editor-mode-region-border)',
  'box-shadow': '-8px 0 32px oklch(0 0 0 / 0.25)',
  'pointer-events': 'auto',
  'z-index': '9999',
  'font-family': 'var(--typography-family-sans)',
}

const panelHeaderStyle: JSX.CSSProperties = {
  display: 'flex',
  'flex-direction': 'column',
  gap: '4px',
  'padding-bottom': '8px',
  'border-bottom': '1px solid var(--editor-mode-region-border)',
}

const panelTitleRowStyle: JSX.CSSProperties = {
  display: 'flex',
  'align-items': 'center',
  gap: '6px',
  'font-size': '11px',
  'font-weight': '700',
  color: 'var(--color-text-primary)',
}

const panelHintStyle: JSX.CSSProperties = {
  'font-size': '10px',
  color: 'var(--color-text-tertiary)',
  display: 'flex',
  'align-items': 'center',
  gap: '5px',
  'flex-wrap': 'wrap',
}

const selectionRowStyle: JSX.CSSProperties = {
  display: 'flex',
  'align-items': 'center',
  gap: '8px',
  'font-size': '11px',
  color: 'var(--editor-mode-axis-future)',
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
  'flex-shrink': '0',
  padding: '2px 8px',
  'font-size': '10px',
  background: 'transparent',
  color: 'var(--editor-mode-axis-future)',
  border: '1px solid var(--editor-mode-axis-future)',
  'border-radius': '4px',
  cursor: 'pointer',
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

  // Portal で document.body 直下に mount し、祖先 (.docs-main の perspective 等) が
  // 作る containing block から脱出する。これで position:fixed が viewport 基準に戻り、
  // パネルが window 右端に貼り付く (fixed が本来効くべき挙動)。
  return (
    <Portal>
      <div data-editor-layer style={layerRootStyle(mode() === 'on')}>
        <Show when={mode() === 'on'}>
          {/* Selection / hover outline (pointer-events: none)。対象がどこかを示す */}
          <Show when={!selection() && hover()}>
            {(h) => <Outline rect={h().rect} state="hover" />}
          </Show>
          <Show when={selection()}>{(s) => <Outline rect={s().rect} state="active" />}</Show>

          {/* ミニマム inspector パネル (右上 floating)。page は全面ブライトのまま */}
          <div style={panelStyle} data-editor-panel>
            <header style={panelHeaderStyle}>
              <div style={panelTitleRowStyle}>
                <span style={scopeDotStyle('var(--editor-mode-axis-future)')} />
                {t(messages.editorMode.label)} {t(messages.editorMode.on)}
              </div>
              <div style={panelHintStyle}>
                <kbd style={kbdInlineStyle}>Esc</kbd> {t(messages.editorMode.escapeToExit)} ·{' '}
                <kbd style={kbdInlineStyle}>Ctrl+Shift+E</kbd>{' '}
                {t(messages.editorMode.toggleShortcut)}
              </div>
              <Show
                when={selection()}
                fallback={<div style={panelHintStyle}>{t(messages.editorMode.clickToSelect)}</div>}
              >
                {(s) => (
                  <div style={selectionRowStyle}>
                    <span
                      style={{
                        flex: '1',
                        'white-space': 'nowrap',
                        overflow: 'hidden',
                        'text-overflow': 'ellipsis',
                      }}
                    >
                      {t(messages.editorMode.selectedPrefix)}
                      {s().targetId}
                    </span>
                    <button
                      type="button"
                      onClick={() => host.clearSelection()}
                      style={clearButtonStyle}
                    >
                      {t(messages.toolPanel.showAllFields)}
                    </button>
                  </div>
                )}
              </Show>
            </header>

            {/* global fields (theme.mode 等、あれば) */}
            <For each={globalFields()}>{(field) => <FieldEditor field={field} />}</For>

            {/* tool fields を 3-scope で分割 (instance → component → token) */}
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
          </div>
        </Show>
      </div>
    </Portal>
  )
}
