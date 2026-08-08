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
 * ## 現在の構成 — Discovery tree + drill-in
 *
 * panel は 2 view を selection state で切り替える:
 *
 * - **tree view** (選択なし): ページの実 DOM から作った creo component の
 *   instance ツリー (Outliner 的)。非 creo 要素は素通し、同 component の
 *   sibling は `×N` に畳む
 * - **detail view** (選択あり): 選んだ component のノブが並ぶ。← で tree へ戻る
 *
 * ツリーはナビゲーションで、編集は component scope のまま (`:root` 書き込み =
 * 全 instance に効く)。選んだ instance は outline の対象と fallback 解決の
 * 基準要素として使う。ページ上の要素クリックも同じ selection state に載るので、
 * どちらの入口から入っても detail view に着地する。
 *
 * 旧 panel が持っていた 3-scope field 一覧 / ThemeEditor / ExportBar は **一旦外した**
 * (`theme-editor.tsx` / `export-bar.tsx` は残置)。段階的に組み直す。
 */
import { For, Show, createEffect, createSignal, onCleanup } from 'solid-js'
import type { JSX } from 'solid-js'
import { Portal } from 'solid-js/web'
import type { ComponentTreeNode } from './component-tree'
import { FieldEditor } from './fields'
import { useEditorMode, useEditorSelection } from './hooks'
import { messages, useT } from './i18n'
import { useComponentResolver, useEditorHost } from './provider'
import type { EditorField } from './types'

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

const listStyle: JSX.CSSProperties = {
  display: 'flex',
  'flex-direction': 'column',
  gap: '1px',
  margin: '0',
  padding: '0',
  'list-style': 'none',
}

const rowStyle = (depth: number): JSX.CSSProperties => ({
  display: 'flex',
  'align-items': 'center',
  gap: '2px',
  'padding-left': `${depth * 12}px`,
})

const twistyStyle: JSX.CSSProperties = {
  width: '14px',
  padding: '0',
  background: 'none',
  border: 'none',
  'font-size': '10px',
  color: 'var(--color-text-tertiary)',
  cursor: 'pointer',
  'flex-shrink': '0',
}

const rowLabelStyle: JSX.CSSProperties = {
  display: 'flex',
  'align-items': 'center',
  gap: '6px',
  flex: '1',
  'min-width': '0',
  padding: '3px 6px',
  background: 'transparent',
  border: 'none',
  'border-radius': '4px',
  'font-family': 'var(--typography-family-mono, monospace)',
  'font-size': '11px',
  'text-align': 'left',
  color: 'var(--color-text-primary)',
  cursor: 'pointer',
}

const countBadgeStyle: JSX.CSSProperties = {
  'font-size': '10px',
  color: 'var(--color-text-tertiary)',
}

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

const backButtonStyle: JSX.CSSProperties = {
  display: 'inline-flex',
  'align-items': 'center',
  gap: '4px',
  padding: '2px 8px',
  background: 'transparent',
  border: '1px solid var(--editor-mode-region-border)',
  'border-radius': '4px',
  'font-size': '10px',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
  'flex-shrink': '0',
}

const detailTitleStyle: JSX.CSSProperties = {
  'font-family': 'var(--typography-family-mono, monospace)',
  'font-size': '11px',
  'font-weight': '700',
  color: 'var(--color-brand-primary)',
  'white-space': 'nowrap',
  overflow: 'hidden',
  'text-overflow': 'ellipsis',
}

// ---------- Discovery tree ----------

function TreeRow(props: {
  node: ComponentTreeNode
  depth: number
  onPick: (node: ComponentTreeNode) => void
  pickHint: string
}): JSX.Element {
  const [open, setOpen] = createSignal(true)
  return (
    <li>
      <div style={rowStyle(props.depth)}>
        <Show
          when={props.node.children.length > 0}
          fallback={<span style={{ width: '14px', 'flex-shrink': '0' }} />}
        >
          <button
            type="button"
            style={twistyStyle}
            onClick={() => setOpen(!open())}
            aria-label={open() ? 'collapse' : 'expand'}
          >
            {open() ? '▾' : '▸'}
          </button>
        </Show>
        <button
          type="button"
          style={rowLabelStyle}
          onClick={() => props.onPick(props.node)}
          title={props.pickHint}
        >
          {props.node.label}
          <Show when={props.node.count > 1}>
            <span style={countBadgeStyle}>×{props.node.count}</span>
          </Show>
          <Show when={props.node.knobCount > 0}>
            <span style={knobCountStyle}>{props.node.knobCount}</span>
          </Show>
        </button>
      </div>
      <Show when={open() && props.node.children.length > 0}>
        <ul style={listStyle}>
          <For each={props.node.children}>
            {(child) => (
              <TreeRow
                node={child}
                depth={props.depth + 1}
                onPick={props.onPick}
                pickHint={props.pickHint}
              />
            )}
          </For>
        </ul>
      </Show>
    </li>
  )
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

  // ---- Discovery: ページの実 DOM から作る component ツリー ----
  //
  // resolver.tree() は副作用なしで、呼ぶたびに DOM を歩き直す。
  // 「Mode ON」と「detail から戻った」タイミングで取り直す — SPA の route 遷移や
  // 編集中の DOM 変化で顔ぶれが変わるので、開いた瞬間のツリーを固定しない。
  const [tree, setTree] = createSignal<ComponentTreeNode[]>([])
  const refresh = (): void => {
    setTree(resolver ? resolver.tree() : [])
  }

  createEffect(() => {
    if (mode() === 'on' && !selection()) refresh()
  })

  /** 選択中の代表要素。outline の rect 追従に使う */
  let pickedEl: Element | null = null

  const syncRect = (): void => {
    const sel = host.selection()
    if (!sel || !pickedEl) return
    host.select({ ...sel, rect: pickedEl.getBoundingClientRect() })
  }

  const pick = (node: ComponentTreeNode): void => {
    if (!resolver) return
    // その instance の class からノブを引き、fallback もその instance で解決する
    const fieldIds = resolver.register(resolver.match(node.element), node.element)
    pickedEl = node.element
    host.select({
      targetId: node.label,
      componentId: node.componentId,
      fieldIds,
      rect: node.element.getBoundingClientRect(),
    })
    // 画面外の instance を選んだときに「どこにあるか」が判らないので寄せる。
    // 明示的な選択操作に対する応答なので D-6 の非侵襲には抵触しない。
    node.element.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  // ---- Detail: 選択中 component のノブ ----

  const detailFields = (): EditorField[] => {
    const sel = selection()
    if (!sel) return []
    const idSet = new Set(sel.fieldIds)
    return host
      .fields()
      .filter((f: EditorField) => idSet.has(f.id))
      .sort((a: EditorField, b: EditorField) => (a.order ?? 0) - (b.order ?? 0))
  }

  const back = (): void => {
    pickedEl = null
    host.clearSelection()
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

            <Show
              when={selection()}
              fallback={
                <section style={sectionStyle}>
                  <div style={sectionTitleStyle}>
                    <span style={dotStyle('var(--color-brand-primary)')} />
                    {t(messages.discovery.title)}
                  </div>
                  <Show
                    when={resolver}
                    fallback={<p style={emptyHintStyle}>{t(messages.discovery.disabled)}</p>}
                  >
                    <Show
                      when={tree().length > 0}
                      fallback={<p style={emptyHintStyle}>{t(messages.discovery.empty)}</p>}
                    >
                      <ul style={listStyle}>
                        <For each={tree()}>
                          {(node) => (
                            <TreeRow
                              node={node}
                              depth={0}
                              onPick={pick}
                              pickHint={t(messages.discovery.pickHint)}
                            />
                          )}
                        </For>
                      </ul>
                    </Show>
                  </Show>
                </section>
              }
            >
              {(sel) => (
                <section style={sectionStyle}>
                  <div style={{ display: 'flex', 'align-items': 'center', gap: '8px' }}>
                    <button type="button" style={backButtonStyle} onClick={back}>
                      ← {t(messages.discovery.back)}
                    </button>
                    <span style={detailTitleStyle}>{sel().targetId}</span>
                  </div>
                  <Show
                    when={detailFields().length > 0}
                    fallback={
                      <p style={emptyHintStyle}>{t(messages.toolPanel.noKnobsForComponent)}</p>
                    }
                  >
                    <For each={detailFields()}>{(field) => <FieldEditor field={field} />}</For>
                  </Show>
                </section>
              )}
            </Show>
          </div>
        </Show>
      </div>
    </Portal>
  )
}
