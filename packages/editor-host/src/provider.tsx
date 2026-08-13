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
import { type ComponentFieldResolver, createComponentFieldResolver } from './component-fields'
import { buildConsoleApi, installConsoleApi } from './console'
import { installCrossTabSync } from './cross-tab'
import { exportSnapshot } from './export'
import { createEditorHost } from './host'
import { installSelectionHandlers } from './selection'
import { installShortcut } from './shortcut'
import type { EditorField, EditorHost, EditorHostConfig } from './types'
import { installUrlSync, shareUrl } from './url-sync'

const EditorHostContext = createContext<EditorHost>()

/** F2c resolver。`discoverComponents: false` のときは undefined */
const ComponentResolverContext = createContext<ComponentFieldResolver | undefined>()

/**
 * component field resolver を取得。`discoverComponents: false` なら undefined。
 * `<EditorLayer>` の discovery section が component 一覧を引くのに使う。
 */
export function useComponentResolver(): ComponentFieldResolver | undefined {
  return useContext(ComponentResolverContext)
}

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

  // F2c: component field resolver。selection handler と <EditorLayer> の discovery
  // が同じ index を共有する必要があるので、component 本体で作って context で配る。
  // index の構築は初回アクセスまで遅延するので、ここでの生成コストは実質ゼロ。
  const ownerAtSetup = getOwner()

  // 選択 / Discovery の scope (config.selectionRoot)。selector は評価を遅延させる
  // (route 遷移で要素が差し替わっても毎回引き直す)
  const selectionRoot = (): Element | null => {
    if (typeof document === 'undefined') return null
    const cfg = props.config?.selectionRoot
    if (!cfg) return document.body
    if (typeof cfg === 'string') return document.querySelector(cfg)
    return cfg()
  }

  const resolver =
    props.config?.discoverComponents === false
      ? undefined
      : createComponentFieldResolver({ host, owner: ownerAtSetup, root: selectionRoot })

  // --- framework 標準の global fields (D-5) ---
  //
  // typography.scale: 「文字だけの全体伸縮」。web の token emit が
  // `calc(<rem> * var(--typography-scale, 1))` を焼き込んでいるので、この 1 変数で
  // size / display / icon (+ title / body alias) が追従する。spacing / radius は
  // 対象外 (layout 密度は density mode の管轄)。persistence: localStorage —
  // 老眼設定のような「その人の既定」を reload 越しに保つ。
  //
  // typography.size.*: Size scale の梯子ノブ (xs–xl)。「default が小さい」等を
  // Editor で体感調整し、決まった値を tokens/ の SSOT へ焼くための一時ノブなので
  // persistence は敢えて無し。書き込みは calc(<px> * var(--typography-scale, 1)) —
  // 素の px を inline に書くと emit の calc を潰して scale スライダーが死ぬため、
  // 梯子 × 倍率が両立する形で :root へ書く。initial は tokens/typography/size.json
  // の SSOT 値と揃える (このノブ自体がその改定のための道具)。
  const sizePxApply =
    (cssVar: string) =>
    (v: number): void => {
      if (typeof document === 'undefined') return
      document.documentElement.style.setProperty(
        cssVar,
        `calc(${v}px * var(--typography-scale, 1))`,
      )
    }
  const SIZE_LADDER = [
    ['xs', 13],
    ['s', 15],
    ['m', 17],
    ['l', 18.5],
    ['xl', 20.5],
  ] as const
  const frameworkFields: EditorField[] = [
    {
      id: 'typography.scale',
      label: 'Typography scale',
      type: 'number',
      semantic: 'global',
      scope: 'token',
      order: 0,
      initial: 1,
      constraints: { min: 1, max: 2, step: 0.05 },
      role: 'user',
      persistence: 'localStorage',
      cssVar: '--typography-scale',
    },
    ...SIZE_LADDER.map(
      ([tier, px], i): EditorField => ({
        id: `typography.size.${tier}`,
        label: `size.${tier}`,
        type: 'number',
        semantic: 'global',
        scope: 'token',
        group: 'Size scale',
        order: 10 + i,
        initial: px,
        constraints: { min: 8, max: 32, step: 0.5, unit: 'px' },
        role: 'user',
        apply: sizePxApply(`--typography-size-${tier}`),
      }),
    ),
  ]
  const unregisterFramework = host.register(frameworkFields)
  onCleanup(unregisterFramework)

  onMount(() => {
    const owner = getOwner()
    const uninstallers: Array<() => void> = []

    uninstallers.push(installShortcut({ host, shortcut: props.config?.shortcut }))
    uninstallers.push(installSelectionHandlers({ host, resolver, root: selectionRoot }))

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

  return (
    <EditorHostContext.Provider value={host}>
      <ComponentResolverContext.Provider value={resolver}>
        {props.children}
      </ComponentResolverContext.Provider>
    </EditorHostContext.Provider>
  )
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
