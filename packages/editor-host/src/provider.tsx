/**
 * @chronista-club/creo-ui-editor-host — SolidJS provider + host context
 *
 * `<EditorHostProvider>` で app を wrap すると、配下で `useEditorHost()` /
 * `useEditorFields()` / `useEditorValue<T>()` / `useEditorSelectable()` が
 * 使える。provider 自身が shortcut + selection handler を install / teardown する。
 */
import { createContext, getOwner, onCleanup, onMount, useContext } from 'solid-js'
import type { JSX, ParentProps } from 'solid-js'
import { autoDiscover, autoDiscoverTweaks } from './auto-discover'
import { buildConsoleApi, installConsoleApi } from './console'
import { installCrossTabSync } from './cross-tab'
import { exportSnapshot } from './export'
import { createEditorHost } from './host'
import { installSelectionHandlers } from './selection'
import { installShortcut } from './shortcut'
import type { EditorHost, EditorHostConfig } from './types'
import { installUrlSync, shareUrl } from './url-sync'

const EditorHostContext = createContext<EditorHost>()

/**
 * dev 環境の runtime 近似。library build では `import.meta.env.DEV` が build 時に
 * 固定化されるため使えない — localhost 系 hostname を dev とみなす (EH-6)。
 */
function isLocalhostDev(): boolean {
  if (typeof location === 'undefined') return false
  return ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
}

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

    // F2b: private tweak var auto-discover (opt-in via config.discoverTweaks)。
    // 失敗しても後続の install (console 等) を巻き込まない (D-6 非侵襲)。
    if (props.config?.discoverTweaks) {
      try {
        autoDiscoverTweaks(host, owner)
      } catch (e) {
        console.warn('[editor-host] discoverTweaks failed:', e)
      }
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
    // 注意: `import.meta.env.DEV` は library build 時に false へ畳み込まれ、consumer の
    // dev/prod を反映できない (2026-07-12 に dist で `?? !1` になっているのを確認)。
    // そのため runtime の localhost 判定で dev を近似する。
    const exposeConsole = props.config?.exposeConsole ?? isLocalhostDev()
    if (exposeConsole) {
      const api = buildConsoleApi({
        host,
        owner,
        exportSnapshot,
        shareUrl: (h) => shareUrl(h, props.config?.urlSync),
        autoDiscover: (h, o, opts) => autoDiscover(h, o, opts),
        autoDiscoverTweaks: (h, o, opts) => autoDiscoverTweaks(h, o, opts),
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
