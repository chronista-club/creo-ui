/**
 * @chronista-club/creoui-editor-host — SolidJS provider + host context
 *
 * `<EditorHostProvider>` で app を wrap すると、配下で `useEditorHost()` /
 * `useEditorFields()` / `useEditorValue<T>()` / `useEditorSelectable()` が
 * 使える。provider 自身が shortcut + selection handler を install / teardown する。
 */
import { createContext, getOwner, onCleanup, onMount, useContext } from 'solid-js'
import type { JSX, ParentProps } from 'solid-js'
import { autoDiscover } from './auto-discover'
import { buildConsoleApi, installConsoleApi } from './console'
import { installCrossTabSync } from './cross-tab'
import { exportSnapshot } from './export'
import { createEditorHost } from './host'
import { installSelectionHandlers } from './selection'
import { installShortcut } from './shortcut'
import type { EditorHost, EditorHostConfig } from './types'
import { installUrlSync, shareUrl } from './url-sync'

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
    const owner = getOwner()
    const uninstallers: Array<() => void> = []

    uninstallers.push(installShortcut({ host, shortcut: props.config?.shortcut }))
    uninstallers.push(installSelectionHandlers({ host }))

    // F4: URL sync (opt-in via config.urlSync)
    if (props.config?.urlSync) {
      uninstallers.push(installUrlSync(host, props.config.urlSync))
    }

    // F5: Cross-tab sync (opt-in via config.crossTab)
    if (props.config?.crossTab) {
      uninstallers.push(
        installCrossTabSync(host, {
          namespace: props.config.localStorageNamespace,
          channel: props.config.crossTabChannel,
        }),
      )
    }

    // F1: Console REPL — CLAUDE.md EH-6: dev 自動 expose / production は config で opt-out。
    // default は import.meta.env.DEV (Vite 環境で DEV 時 true、 production build 時 false)。
    // production で意図的に expose したい場合は `config.exposeConsole: true` を明示。
    const exposeConsole =
      props.config?.exposeConsole ?? Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV)
    if (exposeConsole) {
      const api = buildConsoleApi({
        host,
        owner,
        exportSnapshot,
        shareUrl: (h) => shareUrl(h, props.config?.urlSync),
        autoDiscover: (h, o, opts) => autoDiscover(h, o, opts),
      })
      const consoleName = props.config?.consoleName ?? 'creoEditor'
      uninstallers.push(installConsoleApi(api, consoleName))
    }

    onCleanup(() => {
      for (const un of uninstallers.reverse()) un()
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
