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
import { type ClassOverrides, createClassOverrides } from './class-overrides'
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

/** 脱出ハッチ (class の任意 property override)。provider が 1 個生成して配る */
const ClassOverridesContext = createContext<ClassOverrides>()

/**
 * class override 管理を取得。`<EditorLayer>` の「他の property」section が使う。
 * provider 外では undefined。
 */
export function useClassOverrides(): ClassOverrides | undefined {
  return useContext(ClassOverridesContext)
}

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

  // 脱出ハッチ (class override)。値はセッション限り — provider が畳まれたら
  // 注入 stylesheet ごと破棄する (梯子ノブと同じ「調整セッション用」の哲学)
  const classOverrides = createClassOverrides()
  onCleanup(() => classOverrides.dispose())

  // --- framework 標準の global fields (D-5) ---
  //
  // typography.scale: 「文字だけの全体伸縮」。web の token emit が
  // `calc(<rem> * var(--typography-scale, 1))` を焼き込んでいるので、この 1 変数で
  // size / display / icon (+ title / body alias) が追従する。spacing / radius は
  // 対象外 (layout 密度は density mode の管轄)。persistence: localStorage —
  // 老眼設定のような「その人の既定」を reload 越しに保つ。
  //
  // 梯子ノブ (typography.size.* / radius.*): token の 5 段梯子を Editor で体感調整し、
  // 決まった値を tokens/ の SSOT へ焼くための一時ノブなので persistence は敢えて無し。
  // initial は各 SSOT 値と揃える (このノブ自体がその改定のための道具)。
  //
  // 書き込みは lazy — register 時の initial 適用では :root に書かない。ノブを
  // 触っていないのに inline 値で token の emit (rem / calc) を潰すと、browser の
  // font 設定追従 (rem) が provider の mount だけで死ぬため。動かして初めて書く。
  const lazyVarApply = (cssVar: string, format: (v: number) => string) => {
    let first = true
    return (v: number): void => {
      if (first) {
        // host.register() が initial を 1 度だけ適用する — それは skip
        first = false
        return
      }
      if (typeof document === 'undefined') return
      document.documentElement.style.setProperty(cssVar, format(v))
    }
  }
  // typography は calc(<px> * var(--typography-scale, 1)) — 素の px だと emit の
  // calc を潰して scale スライダーが死ぬため、梯子 × 倍率が両立する形で書く
  const typographyPx = (v: number): string => `calc(${v}px * var(--typography-scale, 1))`
  const plainPx = (v: number): string => `${v}px`

  const SIZE_LADDER = [
    ['xs', 13],
    ['s', 15],
    ['m', 17],
    ['l', 18.5],
    ['xl', 20.5],
  ] as const
  const RADIUS_LADDER = [
    ['xs', 3.5],
    ['s', 4],
    ['m', 8],
    ['l', 17.5],
    ['xl', 21.5],
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
        apply: lazyVarApply(`--typography-size-${tier}`, typographyPx),
      }),
    ),
    // radius の 5 段梯子。none (0) / full (9999 sentinel) は対象外
    ...RADIUS_LADDER.map(
      ([tier, px], i): EditorField => ({
        id: `radius.${tier}`,
        label: `radius.${tier}`,
        type: 'number',
        semantic: 'global',
        scope: 'token',
        group: 'Radius scale',
        order: 20 + i,
        initial: px,
        constraints: { min: 0, max: 48, step: 0.5, unit: 'px' },
        role: 'user',
        apply: lazyVarApply(`--radius-${tier}`, plainPx),
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
        <ClassOverridesContext.Provider value={classOverrides}>
          {props.children}
        </ClassOverridesContext.Provider>
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
