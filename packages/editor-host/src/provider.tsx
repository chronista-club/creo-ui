/**
 * creo-ui-editor-host — SolidJS provider + host context
 *
 * `<EditorHostProvider>` で app を wrap すると、配下で `useEditorHost()` /
 * `useEditorFields()` / `useEditorValue<T>()` / `useEditorSelectable()` が
 * 使える。provider 自身が shortcut + selection handler を install / teardown する。
 */
import { createContext, onCleanup, onMount, useContext } from 'solid-js'
import type { JSX, ParentProps } from 'solid-js'
import { createEditorHost } from './host'
import { installSelectionHandlers } from './selection'
import { installShortcut } from './shortcut'
import type { EditorHost, EditorHostConfig } from './types'

const EditorHostContext = createContext<EditorHost>()

export interface EditorHostProviderProps {
  config?: EditorHostConfig
  /**
   * 外部で作った host を使う (testing / multi-provider hierarchy 用)。
   * 指定時は config は無視される。
   */
  host?: EditorHost
}

export function EditorHostProvider(props: ParentProps<EditorHostProviderProps>): JSX.Element {
  const host = props.host ?? createEditorHost(props.config ?? {})

  onMount(() => {
    const uninstallShortcut = installShortcut({
      host,
      shortcut: props.config?.shortcut,
    })
    const uninstallSelection = installSelectionHandlers({ host })
    onCleanup(() => {
      uninstallShortcut()
      uninstallSelection()
    })
  })

  return <EditorHostContext.Provider value={host}>{props.children}</EditorHostContext.Provider>
}

/**
 * Editor host を取得。`<EditorHostProvider>` の外で呼ぶと throw。
 */
export function useEditorHost(): EditorHost {
  const host = useContext(EditorHostContext)
  if (!host) {
    throw new Error(
      'useEditorHost() must be called within <EditorHostProvider>. ' +
        'Wrap your app with <EditorHostProvider>...</EditorHostProvider>.',
    )
  }
  return host
}
