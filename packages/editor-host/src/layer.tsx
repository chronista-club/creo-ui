/**
 * @chronista-club/creo-ui-editor-host — <EditorLayer> (Editor Mode の UI root)
 *
 * consumer は `<EditorHostProvider>` と一緒に配置:
 *   <EditorHostProvider>
 *     <App />
 *     <EditorLayer />
 *   </EditorHostProvider>
 *
 * Mode OFF では `visibility: hidden`。Mode ON で floating panel 1 枚 +
 * selection outline を描画する (D-6 非侵襲 — Content の layout は一切変えない)。
 *
 * ## 現在の構成
 *
 * panel は **Discovery section 1 つだけ**。「このページに居る creo-ui component を
 * 並べ、1 つ選ぶ」が今できることの全部。選ぶと対象に outline が付き、その component
 * のノブが host に register される (値を回す UI は次段)。
 *
 * 旧 panel が持っていた 3-scope field 一覧 / ThemeEditor / ExportBar は **一旦外した**
 * (`theme-editor.tsx` / `export-bar.tsx` は残置)。段階的に組み直す。
 */
import { For, Show, createEffect, createSignal, onCleanup } from 'solid-js'
import type { JSX } from 'solid-js'
import { Portal } from 'solid-js/web'
import type { ComponentEntry } from './component-fields'
import { useEditorMode, useEditorSelection } from './hooks'
import { messages, useT } from './i18n'
import { useComponentResolver, useEditorHost } from './provider'

// ---------- Styles ----------

const layerRootStyle = (visible: boolean): JSX.CSSProperties => ({
  position: 'fixed',
  inset: '0',
  'pointer-events': 'none',
  'z-index': '9998',
  visibility: visible ? 'visible' : 'hidden',
})

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

const kbdInlineStyle: JSX.CSSProperties = {
  display: 'inline-block',
  padding: '1px 5px',
  'font-family': 'var(--typography-family-sans)',
  'font-size': '10px',
  background: 'var(--color-surface-bg-subtle)',
  border: '1px solid var(--editor-mode-region-border)',
  'border-radius': '3px',
}

const dotStyle = (accent: string): JSX.CSSProperties => ({
  width: '6px',
  height: '6px',
  'border-radius': '999px',
  background: accent,
  'flex-shrink': '0',
})

// ---------- Discovery section ----------

const sectionStyle: JSX.CSSProperties = {
  display: 'flex',
  'flex-direction': 'column',
  gap: '6px',
}

const sectionTitleStyle: JSX.CSSProperties = {
  display: 'flex',
  'align-items': 'center',
  gap: '6px',
  'font-size': '10px',
  'font-weight': '700',
  'letter-spacing': '0.08em',
  'text-transform': 'uppercase',
  color: 'var(--color-brand-primary)',
}

const countStyle: JSX.CSSProperties = {
  'margin-left': 'auto',
  'font-weight': '400',
  color: 'var(--color-text-tertiary)',
}

const listStyle: JSX.CSSProperties = {
  display: 'flex',
  'flex-direction': 'column',
  gap: '2px',
  margin: '0',
  padding: '0',
  'list-style': 'none',
}

const itemStyle = (active: boolean): JSX.CSSProperties => ({
  display: 'flex',
  'align-items': 'center',
  gap: '8px',
  width: '100%',
  padding: '5px 8px',
  background: active ? 'var(--color-brand-primary-subtle)' : 'transparent',
  border: '1px solid',
  'border-color': active ? 'var(--color-brand-primary)' : 'transparent',
  'border-radius': '5px',
  'font-family': 'var(--typography-family-mono, monospace)',
  'font-size': '11px',
  'text-align': 'left',
  color: active ? 'var(--text-brand-readable)' : 'var(--color-text-primary)',
  cursor: 'pointer',
})

const knobCountStyle: JSX.CSSProperties = {
  'margin-left': 'auto',
  'font-size': '10px',
  color: 'var(--color-text-tertiary)',
  'font-variant-numeric': 'tabular-nums',
}

const emptyHintStyle: JSX.CSSProperties = {
  'font-size': '11px',
  color: 'var(--color-text-tertiary)',
  'font-style': 'italic',
  margin: '0',
}

// ---------- Outline (selection) ----------

function Outline(props: { rect: DOMRect }): JSX.Element {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${props.rect.left - 2}px`,
        top: `${props.rect.top - 2}px`,
        width: `${props.rect.width + 4}px`,
        height: `${props.rect.height + 4}px`,
        'pointer-events': 'none',
        border:
          'var(--editor-mode-selection-outline-width) solid var(--editor-mode-selection-outline-active)',
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
  const resolver = useComponentResolver()
  const t = useT()

  // ---- Discovery: このページに居る component ----
  //
  // resolver.components() は副作用なしで、毎回 DOM presence を引き直す。
  // signal に積んで「Mode ON になったとき」と「選択したとき」に取り直す —
  // SPA の route 遷移で顔ぶれが変わるので、開いた瞬間の一覧を固定しない。
  const [entries, setEntries] = createSignal<ComponentEntry[]>([])
  const refresh = (): void => {
    setEntries(resolver ? resolver.components() : [])
  }

  createEffect(() => {
    if (mode() === 'on') refresh()
  })

  /** 選択中の代表要素。outline の rect 追従に使う */
  let pickedEl: Element | null = null

  const syncRect = (): void => {
    const sel = host.selection()
    if (!sel || !pickedEl) return
    host.select({ ...sel, rect: pickedEl.getBoundingClientRect() })
  }

  const pick = (entry: ComponentEntry): void => {
    if (!resolver) return
    const picked = resolver.selectComponent(entry.id)
    if (!picked) return
    pickedEl = picked.element
    const rect = picked.element?.getBoundingClientRect() ?? new DOMRect()
    host.select({
      targetId: entry.label,
      componentId: picked.componentId,
      fieldIds: picked.fieldIds,
      rect,
    })
    // 画面外の component を選んだときに「どこにあるか」が判らないので寄せる。
    // 明示的な選択操作に対する応答なので D-6 の非侵襲には抵触しない。
    picked.element?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  // scroll / resize で outline がズレないよう rect を引き直す
  createEffect(() => {
    if (mode() !== 'on') return
    window.addEventListener('scroll', syncRect, true)
    window.addEventListener('resize', syncRect)
    onCleanup(() => {
      window.removeEventListener('scroll', syncRect, true)
      window.removeEventListener('resize', syncRect)
    })
  })

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

  onCleanup(() => stopDrag?.())

  const panelPosStyle = (): JSX.CSSProperties => {
    const p = pos()
    return p
      ? { left: `${p.x}px`, top: `${p.y}px` }
      : { top: 'var(--editor-mode-dock-top, 12px)', right: '12px' }
  }

  // Portal で document.body 直下に mount し、祖先 (.docs-main の perspective 等) が
  // 作る containing block から脱出する。これで position:fixed が viewport 基準に戻り、
  // ドラッグ座標も viewport と一致する。
  return (
    <Portal>
      <div data-editor-layer style={layerRootStyle(mode() === 'on')}>
        <Show when={mode() === 'on'}>
          <Show when={selection()}>{(s) => <Outline rect={s().rect} />}</Show>

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
                <span style={dotStyle('var(--editor-mode-axis-future)')} />
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
            </header>

            <section style={sectionStyle}>
              <div style={sectionTitleStyle}>
                <span style={dotStyle('var(--color-brand-primary)')} />
                {t(messages.discovery.title)}
                <span style={countStyle}>{entries().length}</span>
              </div>

              <Show
                when={resolver}
                fallback={<p style={emptyHintStyle}>{t(messages.discovery.disabled)}</p>}
              >
                <Show
                  when={entries().length > 0}
                  fallback={<p style={emptyHintStyle}>{t(messages.discovery.empty)}</p>}
                >
                  <ul style={listStyle}>
                    <For each={entries()}>
                      {(entry) => (
                        <li>
                          <button
                            type="button"
                            style={itemStyle(selection()?.componentId === entry.id)}
                            onClick={() => pick(entry)}
                            title={t(messages.discovery.pickHint)}
                          >
                            {entry.label}
                            <span style={knobCountStyle}>{entry.knobCount}</span>
                          </button>
                        </li>
                      )}
                    </For>
                  </ul>
                </Show>
              </Show>
            </section>
          </div>
        </Show>
      </div>
    </Portal>
  )
}
