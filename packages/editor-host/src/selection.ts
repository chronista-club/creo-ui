/**
 * @chronista-club/creo-ui-editor-host — selection handlers
 *
 * hover / click で「今どの要素を編集対象にしているか」を決め、host の selection /
 * hover state を更新する。選択中の要素は ResizeObserver で rect を追従
 * (D-6 非侵襲原則 — Content 側 layout が変わっても outline がズレない)。
 *
 * ## 選択対象の決め方 (F2c で 2 経路に)
 *
 *  1. **明示 bind** — `data-editor-fields="id1,id2"` を持つ要素 (従来からの経路)
 *  2. **class 由来** — `resolver` が渡されていれば、要素の `creo-*` class から
 *     その component のノブを引く。**事前の仕込みが要らない**ので、creo-ui
 *     component はそのままクリックするだけで編集できる
 *
 * 祖先方向へ辿り、1 が見つかればそれを優先。無ければ knob を持つ最も内側の要素。
 * どちらも無い場合は「creo-ui component ではあるがノブが無い」要素を fallback に
 * 返す (選択はできるが panel は空 — 何を選んだかは判る)。
 *
 * 依存: document / window / ResizeObserver (browser のみ)。
 */
import type { ComponentFieldResolver, ComponentKnob } from './component-fields'
import { componentDisplayName } from './component-id'
import type { EditorHost } from './types'

export interface SelectionHandlersOptions {
  host: EditorHost
  /** F2c: data-editor-fields 無しでも component を選択可能にする逆引き resolver */
  resolver?: ComponentFieldResolver
  /**
   * 選択の scope (config.selectionRoot 由来)。省略時は document.body。
   * root の外は選択対象にせず、click も奪わない (chrome は普通に操作できる)。
   */
  root?: () => Element | null
}

interface Found {
  element: HTMLElement
  /** 明示 bind の field id (`data-editor-fields`)。無ければ null */
  explicitIds: string[] | null
  /** 逆引きでヒットした knob (この時点では **未 register**) */
  knobs: ComponentKnob[]
  componentId: string | null
}

/**
 * host に紐付く DOM event handler を install する。返り値を呼ぶと uninstall。
 * D-7 で Mode の toggle は別 (shortcut.ts)、ここは mode ON 中の selection のみ。
 */
export function installSelectionHandlers(opts: SelectionHandlersOptions): () => void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return () => {}
  }

  const { host, resolver } = opts

  /** 選択の scope。config.selectionRoot 未指定なら body 全体 */
  const scopeRoot = (): Element | null => (opts.root ? opts.root() : document.body)

  let observedElement: Element | null = null
  const resizeObserver =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => {
          reRect()
        })
      : null

  function parseFieldIds(el: Element): string[] | null {
    const raw = (el as HTMLElement).dataset?.editorFields
    if (!raw) return null
    const ids = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    return ids.length > 0 ? ids : null
  }

  /**
   * 祖先方向へ辿って編集対象を決める。
   * 明示 bind > 逆引きヒット > component ではあるがノブ無し、の優先順。
   */
  function findSelectable(el: Element | null): Found | null {
    // root の外は選択対象にしない (fail-closed: root 指定があるのに見つからない
    // ときも null)。祖先 walk も root で止め、chrome 側の creo component を拾わない
    const root = scopeRoot()
    if (!root || !el || !root.contains(el)) return null

    let cur: Element | null = el
    let emptyComponent: Found | null = null

    while (cur && cur !== root.parentElement) {
      const explicitIds = parseFieldIds(cur)
      if (explicitIds) {
        return {
          element: cur as HTMLElement,
          explicitIds,
          knobs: [],
          componentId: resolver?.componentIdOf(cur) ?? null,
        }
      }

      if (resolver) {
        const knobs = resolver.match(cur)
        if (knobs.length > 0) {
          return {
            element: cur as HTMLElement,
            explicitIds: null,
            knobs,
            componentId: resolver.componentIdOf(cur),
          }
        }
        // ノブが無くても creo-ui component なら「選べる」— さらに外側にノブを持つ
        // 親が居ればそちらを優先するので、fallback として最も内側だけ覚えておく
        if (!emptyComponent) {
          const componentId = resolver.componentIdOf(cur)
          if (componentId) {
            emptyComponent = {
              element: cur as HTMLElement,
              explicitIds: null,
              knobs: [],
              componentId,
            }
          }
        }
      }

      cur = cur.parentElement
    }
    return emptyComponent
  }

  function isInsideEditorLayer(el: Element | null): boolean {
    let cur: Element | null = el
    while (cur) {
      if ((cur as HTMLElement).dataset?.editorLayer !== undefined) return true
      cur = cur.parentElement
    }
    return false
  }

  /** panel ヘッダに出す「何を選んでいるか」の表示名 */
  function selectableIdOf(found: Found): string {
    const el = found.element
    const explicit = el.dataset.editorSelectableId
    if (explicit) return explicit
    if (found.componentId) return componentDisplayName(found.componentId)
    if (el.id) return `#${el.id}`
    if (found.explicitIds && found.explicitIds.length > 0) return found.explicitIds.join(',')
    return el.tagName.toLowerCase()
  }

  /** hover 表示用 — register せず id だけ数える (副作用なし) */
  function previewFieldIds(found: Found): string[] {
    return found.explicitIds ?? found.knobs.map((k) => k.id)
  }

  /**
   * click 確定用 — 逆引き分をここで初めて host に register する。
   * fallback を **選択要素の computed style** で解決させるため element を渡す。
   */
  function commitFieldIds(found: Found): string[] {
    if (found.explicitIds) return found.explicitIds
    if (!resolver || found.knobs.length === 0) return []
    return resolver.register(found.knobs, found.element)
  }

  function updateObserved(el: Element | null): void {
    if (observedElement === el) return
    if (observedElement && resizeObserver) resizeObserver.unobserve(observedElement)
    observedElement = el
    if (el && resizeObserver) resizeObserver.observe(el)
  }

  function reRect(): void {
    const sel = host.selection()
    if (!sel || !observedElement) return
    host.select({ ...sel, rect: observedElement.getBoundingClientRect() })
  }

  const onMouseOver = (e: MouseEvent): void => {
    if (host.mode() !== 'on') return
    const target = e.target as Element | null
    if (isInsideEditorLayer(target)) {
      host.setHover(null)
      return
    }
    const found = findSelectable(target)
    if (!found) {
      host.setHover(null)
      return
    }
    host.setHover({
      targetId: selectableIdOf(found),
      fieldIds: previewFieldIds(found),
      componentId: found.componentId ?? undefined,
      element: found.element,
      rect: found.element.getBoundingClientRect(),
    })
  }

  const onClick = (e: MouseEvent): void => {
    if (host.mode() !== 'on') return
    const target = e.target as Element | null
    if (isInsideEditorLayer(target)) return
    const found = findSelectable(target)
    if (!found) {
      // 背景クリック = 選択解除
      host.clearSelection()
      updateObserved(null)
      return
    }
    // D-6: selection 中は Content の click を奪う (link 誤作動を防ぐ)
    e.preventDefault()
    e.stopPropagation()
    host.select({
      targetId: selectableIdOf(found),
      fieldIds: commitFieldIds(found),
      componentId: found.componentId ?? undefined,
      element: found.element,
      rect: found.element.getBoundingClientRect(),
    })
    updateObserved(found.element)
  }

  const onRerect = (): void => reRect()

  document.addEventListener('mouseover', onMouseOver)
  document.addEventListener('click', onClick, true) // capture で Content click を先取り
  window.addEventListener('scroll', onRerect, true)
  window.addEventListener('resize', onRerect)

  return () => {
    document.removeEventListener('mouseover', onMouseOver)
    document.removeEventListener('click', onClick, true)
    window.removeEventListener('scroll', onRerect, true)
    window.removeEventListener('resize', onRerect)
    if (observedElement && resizeObserver) resizeObserver.unobserve(observedElement)
    resizeObserver?.disconnect()
  }
}
