/**
 * @chronista-club/creoui-editor-host — keyboard shortcut handler
 *
 * D-7 (手動 toggle only): Ctrl+Shift+E (default) で Mode ON/OFF、Escape で
 * selection 解除 → mode OFF の 2 段階退出。
 */
import type { EditorHost, EditorShortcut } from './types'

const DEFAULT_SHORTCUT: EditorShortcut = { ctrl: true, shift: true, key: 'e' }

export interface ShortcutOptions {
  host: EditorHost
  shortcut?: EditorShortcut
}

export function installShortcut(opts: ShortcutOptions): () => void {
  if (typeof window === 'undefined') return () => {}
  const { host } = opts
  const shortcut = opts.shortcut ?? DEFAULT_SHORTCUT

  const matchesToggle = (e: KeyboardEvent): boolean => {
    if (!!shortcut.ctrl !== e.ctrlKey) return false
    if (!!shortcut.shift !== e.shiftKey) return false
    if (!!shortcut.alt !== e.altKey) return false
    if (!!shortcut.meta !== e.metaKey) return false
    return e.key.toLowerCase() === shortcut.key.toLowerCase()
  }

  const onKeyDown = (e: KeyboardEvent): void => {
    if (matchesToggle(e)) {
      e.preventDefault()
      host.toggle()
      return
    }
    if (e.key === 'Escape' && host.mode() === 'on') {
      // 2 段階退出: selection あれば解除、なければ mode OFF
      if (host.selection()) {
        host.clearSelection()
      } else {
        host.disable()
      }
    }
  }

  window.addEventListener('keydown', onKeyDown)
  return () => window.removeEventListener('keydown', onKeyDown)
}
