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
import { BRAND_COLOR_VARS, SURFACE_COLOR_VARS, createOklchColorControl } from './brand-color'
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
  // 調整ノブ (typography.size.* / color.brand.*): token の値を Editor で体感調整し、
  // 決まった値を tokens/ の SSOT へ焼くためのノブ。initial は各 SSOT 値と揃える
  // (このノブ自体がその改定のための道具)。値は localStorage に永続する (owner 要望
  // 2026-08-14) — demo 上で回した値が reload / 再訪でもそのまま残る。
  //
  // 書き込みは値ベースで判定する — SSOT 既定値なら removeProperty で token の
  // emit (rem / calc) に返し、既定以外だけ inline で書く。register 時の適用
  // (persisted or initial) がこの apply に乗るので、「未調整なら emit のまま
  // (browser の font 設定追従が生きる) / 調整済みなら mount で復元」が 1 本の
  // 条件で両立する。時間ベースの skip-first だと復元の一発まで捨ててしまう。
  const varApplyUnlessDefault =
    (cssVar: string, format: (v: number) => string, ssotDefault: number) =>
    (v: number): void => {
      if (typeof document === 'undefined') return
      const style = document.documentElement.style
      if (v === ssotDefault) style.removeProperty(cssVar)
      else style.setProperty(cssVar, format(v))
    }
  // typography は calc(<px> * var(--typography-scale, 1)) — 素の px だと emit の
  // calc を潰して scale スライダーが死ぬため、梯子 × 倍率が両立する形で書く
  const typographyPx = (v: number): string => `calc(${v}px * var(--typography-scale, 1))`
  const plainPx = (v: number): string => `${v}px`
  // brand / surface color (hue / chroma) — 実体は brand-color.ts。
  // それぞれの var 族 8 本を OKLCH のまま回す
  const brandColor = createOklchColorControl(BRAND_COLOR_VARS, '--color-brand-primary')
  const surfaceColor = createOklchColorControl(SURFACE_COLOR_VARS, '--color-surface-surface')

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
      constraints: { min: 0.8, max: 1.2, step: 0.01 },
      role: 'user',
      persistence: 'localStorage',
      cssVar: '--typography-scale',
      group: 'Global',
    },
    ...SIZE_LADDER.map(
      ([tier, px], i): EditorField => ({
        id: `typography.size.${tier}`,
        label: `size.${tier}`,
        type: 'number',
        semantic: 'global',
        scope: 'token',
        group: 'Font size',
        order: 10 + i,
        initial: px,
        constraints: { min: 8, max: 32, step: 0.5, unit: 'px' },
        role: 'user',
        persistence: 'localStorage',
        apply: varApplyUnlessDefault(`--typography-size-${tier}`, typographyPx, px),
      }),
    ),
    // brand color — hue は絶対値で見せて内部は差分適用 (brand-color.ts 参照)。
    // initial は現 theme の primary hue (mint = 160)
    {
      id: 'color.brand.hue',
      label: 'Brand hue',
      type: 'number',
      semantic: 'global',
      scope: 'token',
      group: 'Global',
      order: 20,
      initial: brandColor.baseHue,
      constraints: { min: 0, max: 360, step: 1, unit: '°' },
      role: 'user',
      persistence: 'localStorage',
      // 中立 (baseHue / ×1) の扱いは brand-color.ts の writeAll が持つので素通し
      apply: (v) => brandColor.setHue(v),
    },
    {
      id: 'color.brand.chroma',
      label: 'Brand chroma ×',
      type: 'number',
      semantic: 'global',
      scope: 'token',
      group: 'Global',
      order: 21,
      initial: 1,
      constraints: { min: 0, max: 2, step: 0.05 },
      role: 'user',
      persistence: 'localStorage',
      apply: (v) => brandColor.setChromaScale(v),
    },
    // surface color — 背景 / 面 / 罫線 / scrim の 8 var。作法は brand と同じ
    // (基準 = surface-surface の hue。mint-dark なら 260)
    {
      id: 'color.surface.hue',
      label: 'Surface hue',
      type: 'number',
      semantic: 'global',
      scope: 'token',
      group: 'Global',
      order: 22,
      initial: surfaceColor.baseHue,
      constraints: { min: 0, max: 360, step: 1, unit: '°' },
      role: 'user',
      persistence: 'localStorage',
      apply: (v) => surfaceColor.setHue(v),
    },
    {
      id: 'color.surface.chroma',
      label: 'Surface chroma ×',
      type: 'number',
      semantic: 'global',
      scope: 'token',
      group: 'Global',
      order: 23,
      initial: 1,
      constraints: { min: 0, max: 3, step: 0.05 },
      role: 'user',
      persistence: 'localStorage',
      apply: (v) => surfaceColor.setChromaScale(v),
    },
    // layout.gap.sibling — stacked 要素間の既定 gap。SSOT は {spacing.m} alias
    // (1.125rem = 18px @16px)。initial はその実値。既定のままなら emit の alias
    // (rem 追従) を保ち、動かしたら inline px で上書き (varApplyUnlessDefault)
    {
      id: 'layout.gap.sibling',
      label: 'layout.gap.sibling',
      type: 'number',
      semantic: 'global',
      scope: 'token',
      group: 'Global',
      order: 30,
      initial: 18,
      constraints: { min: 0, max: 48, step: 0.5, unit: 'px' },
      role: 'user',
      persistence: 'localStorage',
      apply: varApplyUnlessDefault('--layout-gap-sibling', plainPx, 18),
    },
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
