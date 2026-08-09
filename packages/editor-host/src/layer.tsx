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
import { componentDisplayName, componentIdOfElement, componentSelector } from './component-id'
import type { ComponentTreeNode } from './component-tree'
import { FieldEditor } from './fields'
import { useEditorHover, useEditorMode, useEditorSelection } from './hooks'
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

const breadcrumbRowStyle: JSX.CSSProperties = {
  display: 'flex',
  'flex-wrap': 'wrap',
  gap: '4px',
}

const breadcrumbItemStyle: JSX.CSSProperties = {
  padding: '1px 6px',
  background: 'transparent',
  border: '1px solid var(--editor-mode-region-border)',
  'border-radius': '999px',
  'font-family': 'var(--typography-family-mono, monospace)',
  'font-size': '10px',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
}

// ---------- Discovery tree ----------

function TreeRow(props: {
  node: ComponentTreeNode
  depth: number
  onPick: (node: ComponentTreeNode) => void
  onHover: (node: ComponentTreeNode | null) => void
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
          onMouseEnter={() => props.onHover(props.node)}
          onFocus={() => props.onHover(props.node)}
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
                onHover={props.onHover}
                pickHint={props.pickHint}
              />
            )}
          </For>
        </ul>
      </Show>
    </li>
  )
}

// ---------- Outline (selection / siblings / hover) ----------

/**
 * 選択の実体は class なので、outline は 3 段で「効果範囲」を正直に見せる:
 * - active:  選択のアンカー instance (fallback 解決の基準。強い枠)
 * - sibling: 同 class の他 instance (ノブを回すとここも変わる。淡い枠)
 * - hover:   クリック/選択前のプレビュー (中間)
 */
function Outline(props: { rect: DOMRect; kind: 'active' | 'sibling' | 'hover' }): JSX.Element {
  const border = (): string =>
    props.kind === 'active'
      ? 'var(--editor-mode-selection-outline-width) solid var(--editor-mode-selection-outline-active)'
      : props.kind === 'hover'
        ? 'var(--editor-mode-selection-outline-width) solid var(--editor-mode-selection-outline-hover)'
        : '1px dashed var(--editor-mode-selection-outline-hover)'
  return (
    <div
      style={{
        position: 'absolute',
        left: `${props.rect.left - 2}px`,
        top: `${props.rect.top - 2}px`,
        width: `${props.rect.width + 4}px`,
        height: `${props.rect.height + 4}px`,
        'pointer-events': 'none',
        border: border(),
        opacity: props.kind === 'sibling' ? '0.55' : '1',
        'border-radius': '6px',
        'box-sizing': 'border-box',
        transition: 'all 80ms ease',
      }}
    />
  )
}

/** hover / 選択対象の class 名を rect の上に浮かべる小ラベル */
function OutlineLabel(props: { rect: DOMRect; text: string }): JSX.Element {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${Math.max(2, props.rect.left - 2)}px`,
        top: `${Math.max(2, props.rect.top - 20)}px`,
        padding: '1px 6px',
        background: 'var(--editor-mode-selection-outline-active)',
        color: 'var(--color-surface-bg, #fff)',
        'font-family': 'var(--typography-family-mono, monospace)',
        'font-size': '10px',
        'border-radius': '3px',
        'pointer-events': 'none',
        'white-space': 'nowrap',
      }}
    >
      {props.text}
    </div>
  )
}

/** element の祖先から creo component を集める (近い順)。breadcrumb 用 */
function ancestorComponents(el: Element): { componentId: string; element: Element }[] {
  const out: { componentId: string; element: Element }[] = []
  let cur = el.parentElement
  while (cur) {
    const componentId = componentIdOfElement(cur)
    if (componentId) out.push({ componentId, element: cur })
    cur = cur.parentElement
  }
  return out
}

/** 同 class の instance 数上限 — table-cell 等で outline が描画負荷にならないように */
const SIBLING_OUTLINE_MAX = 80

// ---------- EditorLayer ----------

export function EditorLayer(): JSX.Element {
  const host = useEditorHost()
  const mode = useEditorMode()
  const selection = useEditorSelection()
  const hover = useEditorHover()
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

  const syncRect = (): void => {
    const sel = host.selection()
    if (!sel?.element) return
    host.select({ ...sel, rect: sel.element.getBoundingClientRect() })
  }

  /** 要素を選択の実体として確定する共通経路 (tree pick / breadcrumb / ページ click 後段) */
  const selectElement = (element: Element, componentId: string): void => {
    if (!resolver) return
    // その instance の class からノブを引き、fallback もその instance で解決する
    const fieldIds = resolver.register(resolver.match(element), element)
    host.select({
      targetId: componentDisplayName(componentId),
      componentId,
      fieldIds,
      element,
      rect: element.getBoundingClientRect(),
    })
    // 画面外の instance を選んだときに「どこにあるか」が判らないので寄せる。
    // 明示的な選択操作に対する応答なので D-6 の非侵襲には抵触しない。
    element.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  const pick = (node: ComponentTreeNode): void => {
    selectElement(node.element, node.componentId)
  }

  /** tree の行 hover → ページ上の該当 instance に outline (双方向 hover の tree 側) */
  const hoverNode = (node: ComponentTreeNode | null): void => {
    if (!node) {
      host.setHover(null)
      return
    }
    host.setHover({
      targetId: node.label,
      fieldIds: [],
      componentId: node.componentId,
      element: node.element,
      rect: node.element.getBoundingClientRect(),
    })
  }

  // ---- Hybrid outline: 選択の実体は class なので、同 class の全 instance を淡く囲う ----
  //
  // 「囲っていないものが変わった」驚きを防ぐ (編集は component scope = 全 instance)。
  // rect は scroll / resize / 選択変更で引き直す。
  const [siblingRects, setSiblingRects] = createSignal<DOMRect[]>([])

  const syncSiblings = (): void => {
    const sel = host.selection()
    if (!sel?.componentId || typeof document === 'undefined') {
      setSiblingRects([])
      return
    }
    try {
      const all = document.querySelectorAll(componentSelector(sel.componentId))
      const rects: DOMRect[] = []
      for (const el of Array.from(all).slice(0, SIBLING_OUTLINE_MAX)) {
        if (el === sel.element) continue // アンカーは active outline が担当
        rects.push(el.getBoundingClientRect())
      }
      setSiblingRects(rects)
    } catch {
      setSiblingRects([])
    }
  }

  createEffect(() => {
    // 選択 (componentId) が変わったら sibling を引き直す
    void selection()?.componentId
    syncSiblings()
  })

  // ---- Detail: 選択中 component のノブ + 祖先への梯子 ----

  const detailFields = (): EditorField[] => {
    const sel = selection()
    if (!sel) return []
    const idSet = new Set(sel.fieldIds)
    return host
      .fields()
      .filter((f: EditorField) => idSet.has(f.id))
      .sort((a: EditorField, b: EditorField) => (a.order ?? 0) - (b.order ?? 0))
  }

  /** 選択アンカーの祖先 creo component (近い順)。detail の breadcrumb に出す */
  const ancestors = (): { componentId: string; element: Element }[] => {
    const el = selection()?.element
    return el ? ancestorComponents(el) : []
  }

  const back = (): void => {
    host.clearSelection()
  }

  // scroll / resize で outline がズレないよう rect を引き直す (anchor + siblings)
  const syncAll = (): void => {
    syncRect()
    syncSiblings()
  }
  createEffect(() => {
    if (mode() !== 'on') return
    window.addEventListener('scroll', syncAll, true)
    window.addEventListener('resize', syncAll)
    onCleanup(() => {
      window.removeEventListener('scroll', syncAll, true)
      window.removeEventListener('resize', syncAll)
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
          {/* 同 class の他 instance (淡)。「ノブを回すとここも変わる」の可視化 */}
          <For each={siblingRects()}>{(r) => <Outline rect={r} kind="sibling" />}</For>
          {/* 選択アンカー (強) + class 名ラベル */}
          <Show when={selection()}>
            {(s) => (
              <>
                <Outline rect={s().rect} kind="active" />
                <OutlineLabel rect={s().rect} text={s().targetId} />
              </>
            )}
          </Show>
          {/* hover プレビュー (選択前のみ)。何が選ばれるかを click 前に見せる */}
          <Show when={!selection() && hover()}>
            {(h) => (
              <>
                <Outline rect={h().rect} kind="hover" />
                <OutlineLabel rect={h().rect} text={h().targetId} />
              </>
            )}
          </Show>

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
                <kbd style={kbdInlineStyle}>Esc</kbd>{' '}
                {selection()
                  ? t(messages.editorMode.escapeToDeselect)
                  : t(messages.editorMode.escapeToExit)}{' '}
                · <kbd style={kbdInlineStyle}>Ctrl+Shift+E</kbd>{' '}
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
                      <ul style={listStyle} onMouseLeave={() => hoverNode(null)}>
                        <For each={tree()}>
                          {(node) => (
                            <TreeRow
                              node={node}
                              depth={0}
                              onPick={pick}
                              onHover={hoverNode}
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
                  {/* 祖先への梯子 — 入れ子の内側を選んだとき、親 component へ 1 click で上がる */}
                  <Show when={ancestors().length > 0}>
                    <div style={breadcrumbRowStyle}>
                      <For each={ancestors()}>
                        {(a) => (
                          <button
                            type="button"
                            style={breadcrumbItemStyle}
                            onClick={() => selectElement(a.element, a.componentId)}
                          >
                            ↑ {a.componentId}
                          </button>
                        )}
                      </For>
                    </div>
                  </Show>
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
