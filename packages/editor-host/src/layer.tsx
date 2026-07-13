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
import { For, Show, createSignal, onCleanup } from 'solid-js'
import type { JSX } from 'solid-js'
import { Portal } from 'solid-js/web'
import { ExportBar } from './export-bar'
import { FieldEditor } from './fields'
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

// ミニマム版: 全画面 4-region を廃し、右端に full-height の inspector ドック1枚。
// content は下敷きのまま (D-6 非侵襲)、右上に固定して上端〜下端まで伸ばす。
// ドラッグ移動できる floating card。位置座標 (left/top) は JSX 側で pos() から与える。
// 未ドラッグ時は右上 default (top=--editor-mode-dock-top / right=12px)。
const panelBaseStyle: JSX.CSSProperties = {
  position: 'fixed',
  width: 'var(--editor-mode-dock-width, 300px)',
  'max-height': 'calc(100dvh - var(--editor-mode-dock-top, 0px) - 24px)',
  'overflow-y': 'auto',
  display: 'flex',
  'flex-direction': 'column',
  gap: '10px',
  padding: '14px',
  background: 'var(--color-surface-surface)',
  border: '1px solid var(--editor-mode-region-border)',
  'border-radius': '12px',
  'box-shadow': '0 12px 40px oklch(0 0 0 / 0.35)',
  'pointer-events': 'auto',
  'z-index': '9999',
  'font-family': 'var(--typography-family-sans)',
}

// ドラッグハンドル (ヘッダ title 行)。掴んで panel を移動する。
const dragHandleStyle = (dragging: boolean): JSX.CSSProperties => ({
  display: 'flex',
  'align-items': 'center',
  gap: '6px',
  'font-size': '11px',
  'font-weight': '700',
  color: 'var(--color-text-primary)',
  cursor: dragging ? 'grabbing' : 'grab',
  'touch-action': 'none',
  'user-select': 'none',
})

const gripStyle: JSX.CSSProperties = {
  'margin-left': 'auto',
  'font-size': '12px',
  'letter-spacing': '-1px',
  color: 'var(--color-text-tertiary)',
}

const panelHeaderStyle: JSX.CSSProperties = {
  display: 'flex',
  'flex-direction': 'column',
  gap: '4px',
  'padding-bottom': '8px',
  'border-bottom': '1px solid var(--editor-mode-region-border)',
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

// ---------- Collapsible sub-section (theme / export の畳み戻し用) ----------

const subSectionStyle: JSX.CSSProperties = {
  'border-top': '1px solid var(--editor-mode-region-border)',
  'padding-top': '10px',
}

const subSectionTitleStyle: JSX.CSSProperties = {
  display: 'flex',
  'align-items': 'center',
  gap: '6px',
  width: '100%',
  padding: '0',
  background: 'none',
  border: 'none',
  'font-size': '10px',
  'font-weight': '700',
  'letter-spacing': '0.08em',
  'text-transform': 'uppercase',
  'text-align': 'left',
  color: 'var(--color-text-tertiary)',
  cursor: 'pointer',
}

/** 任意 children を折りたたむ二次 section (theme / export 用、default 閉)。 */
function CollapsibleSection(props: {
  title: string
  defaultOpen?: boolean
  children: JSX.Element
}): JSX.Element {
  const [open, setOpen] = createSignal(props.defaultOpen ?? false)
  return (
    <section style={subSectionStyle}>
      <button type="button" onClick={() => setOpen(!open())} style={subSectionTitleStyle}>
        {props.title}
        <span style={{ 'margin-left': 'auto', 'font-weight': '400' }}>{open() ? '▾' : '▸'}</span>
      </button>
      <Show when={open()}>
        <div style={{ 'margin-top': '8px' }}>{props.children}</div>
      </Show>
    </section>
  )
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

  // ---- ドラッグ移動 (位置は localStorage 永続化) ----
  // pos = null なら右上 default 配置、掴んで動かすと {x,y} (viewport 座標) に切替。
  let panelRef: HTMLDivElement | undefined
  const posKey = `${host.namespace}:layer:panel-pos`
  const readSavedPos = (): { x: number; y: number } | null => {
    if (typeof localStorage === 'undefined') return null
    try {
      const raw = localStorage.getItem(posKey)
      if (!raw) return null
      const p = JSON.parse(raw)
      return typeof p?.x === 'number' && typeof p?.y === 'number' ? { x: p.x, y: p.y } : null
    } catch {
      return null
    }
  }
  const [pos, setPos] = createSignal<{ x: number; y: number } | null>(readSavedPos())
  const [dragging, setDragging] = createSignal(false)

  const savePos = (p: { x: number; y: number }): void => {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(posKey, JSON.stringify(p))
    } catch {
      // quota / serialization 失敗は D-6 非侵襲で silent
    }
  }

  // 復元位置が (リサイズ後・別解像度などで) 画面外なら viewport 内へ引き戻す。
  // panel の ref callback から queueMicrotask で呼ぶ (mode off→on の再 mount 毎に効く)。
  // onMount だと初回 mode=off で panelRef 未定義 → 早期 return し二度と走らないため不可。
  const clampToViewport = (): void => {
    const p = pos()
    if (!p || !panelRef) return
    const maxX = Math.max(0, window.innerWidth - panelRef.offsetWidth)
    const maxY = Math.max(0, window.innerHeight - panelRef.offsetHeight)
    const x = Math.min(Math.max(0, p.x), maxX)
    const y = Math.min(Math.max(0, p.y), maxY)
    if (x !== p.x || y !== p.y) {
      setPos({ x, y })
      savePos({ x, y })
    }
  }

  // drag 中の listener を確実に解除するための cleanup ref。pointerup 前に component が
  // unmount (Esc で mode off → Show 破棄 / page 遷移) しても window listener を leak しない。
  let stopDrag: (() => void) | null = null

  const onHandleDown = (e: PointerEvent): void => {
    if (!panelRef || e.button !== 0) return
    e.preventDefault()
    const rect = panelRef.getBoundingClientRect()
    const offX = e.clientX - rect.left
    const offY = e.clientY - rect.top
    setDragging(true)
    const clamp = (v: number, max: number): number => Math.min(Math.max(0, v), Math.max(0, max))
    const move = (ev: PointerEvent): void => {
      const w = panelRef?.offsetWidth ?? 0
      const h = panelRef?.offsetHeight ?? 0
      setPos({
        x: clamp(ev.clientX - offX, window.innerWidth - w),
        y: clamp(ev.clientY - offY, window.innerHeight - h),
      })
    }
    const up = (): void => {
      setDragging(false)
      const p = pos()
      if (p) savePos(p)
      stopDrag?.()
    }
    stopDrag = (): void => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      stopDrag = null
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  // component unmount 時に drag が進行中なら listener を解除 (#1 leak fix)
  onCleanup(() => stopDrag?.())

  const panelPosStyle = (): JSX.CSSProperties => {
    const p = pos()
    return p
      ? { left: `${p.x}px`, top: `${p.y}px` }
      : { top: 'var(--editor-mode-dock-top, 12px)', right: '12px' }
  }

  // Portal で document.body 直下に mount し、祖先 (.docs-main の perspective 等) が
  // 作る containing block から脱出する。これで position:fixed が viewport 基準に戻り、
  // ドラッグ座標も viewport と一致する (fixed が本来効くべき挙動)。
  return (
    <Portal>
      <div data-editor-layer style={layerRootStyle(mode() === 'on')}>
        <Show when={mode() === 'on'}>
          {/* Selection / hover outline (pointer-events: none)。対象がどこかを示す */}
          <Show when={!selection() && hover()}>
            {(h) => <Outline rect={h().rect} state="hover" />}
          </Show>
          <Show when={selection()}>{(s) => <Outline rect={s().rect} state="active" />}</Show>

          {/* ドラッグ移動できる floating inspector パネル。page は全面ブライトのまま。
              ref callback は mode off→on の再 mount 毎に発火 → 画面外復帰を効かせる */}
          <div
            ref={(el) => {
              panelRef = el
              if (typeof queueMicrotask !== 'undefined') queueMicrotask(clampToViewport)
            }}
            style={{ ...panelBaseStyle, ...panelPosStyle() }}
            data-editor-panel
          >
            <header style={panelHeaderStyle}>
              <div style={dragHandleStyle(dragging())} onPointerDown={onHandleDown}>
                <span style={scopeDotStyle('var(--editor-mode-axis-future)')} />
                {t(messages.editorMode.label)} {t(messages.editorMode.on)}
                <span style={gripStyle} aria-hidden="true">
                  ⠿
                </span>
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

            {/* 二次 UI: theme swatch と export を折りたたみで復活 (既定は閉) */}
            <CollapsibleSection title="Theme">
              <ThemeEditor />
            </CollapsibleSection>
            <CollapsibleSection title="Export">
              <ExportBar host={host} />
            </CollapsibleSection>
          </div>
        </Show>
      </div>
    </Portal>
  )
}
