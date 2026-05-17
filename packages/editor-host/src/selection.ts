/**
 * @chronista-club/creoui-editor-host — selection handlers
 *
 * `data-editor-fields="id1,id2,..."` 属性を持つ要素を hover / click で検出し、
 * host の selection / hover state を更新する。選択中の要素は ResizeObserver
 * で rect を追従 (D-6 非侵襲原則 — Content 側 layout が変わっても outline が
 * ズレない)。
 *
 * 依存: document / window / ResizeObserver (browser のみ)。
 */
import type { EditorHost } from './types'

export interface SelectionHandlersOptions {
  host: EditorHost
}

/**
 * host に紐付く DOM event handler を install する。返り値を呼ぶと uninstall。
 * D-7 で Mode の toggle は別 (shortcut.ts)、ここは mode ON 中の selection のみ。
 */
export function installSelectionHandlers(opts: SelectionHandlersOptions): () => void {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return () => {}
  }

  const { host } = opts

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
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  function findSelectableAncestor(
    el: Element | null,
  ): { element: HTMLElement; fieldIds: string[] } | null {
    let cur: Element | null = el
    while (cur) {
      if ((cur as HTMLElement).dataset?.editorFields !== undefined) {
        const ids = parseFieldIds(cur)
        if (ids && ids.length > 0) {
          return { element: cur as HTMLElement, fieldIds: ids }
        }
      }
      cur = cur.parentElement
    }
    return null
  }

  function isInsideEditorLayer(el: Element | null): boolean {
    let cur: Element | null = el
    while (cur) {
      if ((cur as HTMLElement).dataset?.editorLayer !== undefined) return true
      cur = cur.parentElement
    }
    return false
  }

  function selectableIdOf(found: { element: HTMLElement; fieldIds: string[] }): string {
    return found.element.dataset.editorSelectableId ?? found.element.id ?? found.fieldIds.join(',')
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
    const found = findSelectableAncestor(target)
    if (!found) {
      host.setHover(null)
      return
    }
    host.setHover({
      targetId: selectableIdOf(found),
      fieldIds: found.fieldIds,
      rect: found.element.getBoundingClientRect(),
    })
  }

  const onClick = (e: MouseEvent): void => {
    if (host.mode() !== 'on') return
    const target = e.target as Element | null
    if (isInsideEditorLayer(target)) return
    const found = findSelectableAncestor(target)
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
      fieldIds: found.fieldIds,
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
