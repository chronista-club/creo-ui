/**
 * @chronista-club/creo-ui-editor-host — 選択駆動の component field 解決 (F2c)
 *
 * ## 何を解くか
 *
 * F2b (`autoDiscoverTweaks`) までは「mount 時に画面上の tweak var を全部 register
 * する」eager 方式だった。これには 2 つの弱点がある:
 *
 *  1. **panel が渋滞する** — 画面に居る component 全部のノブが一度に並ぶ
 *  2. **値が焼き付く** — `host.register()` は登録時に初期値を `:root` へ書くので、
 *     register した分だけ `<html>` の inline style に解決済み値が固定される
 *
 * F2c は逆にする。mount 時は **index を作るだけ** (DOM 書き込みゼロ)、
 * 選択された要素に `el.matches()` でヒットした knob だけを lazy に register する。
 * これで「先に仕込んでおく」必要が消え、**creo-ui component をクリックすれば
 * その component のノブが出る**。
 *
 * ## なぜ selector 逆引きか
 *
 * class 名から `--_<name>-*` を引く規約ベースだと、`--_eb-*` ↔ `.creo-error-boundary`、
 * `--_seg-opt-*` ↔ `.creo-segmented` のような略記のズレでマッピング表が必要になる。
 * CSSOM は「その var がどの selector の rule で使われているか」を既に知っているので、
 * `el.matches(selector)` で引けば **実際に効いている var だけ**が命名に依らず出る。
 */
import type { Owner } from 'solid-js'
import {
  type RawTweakVar,
  bindDiscoveredVar,
  resolveTweakVar,
  scanRawTweakVars,
  tweakPlacement,
  tweakVarToId,
} from './auto-discover'
import {
  componentClassIdsOf,
  componentIdFromSelectors,
  componentIdOfElement,
  matchesSelector,
  normalizeSelectorForMatch,
  subjectComponentIds,
} from './selector-utils'
import type { EditorHost, EditorSemantic } from './types'

/** 逆引き index の 1 entry (tweak var 1 個 = panel のノブ 1 個) */
export interface ComponentKnob {
  /** field id ('btn.pad.x') — 永続化 key でもあるので cssVar 由来のまま保つ */
  readonly id: string
  /** '--_btn-pad-x' */
  readonly cssVar: string
  /** panel の group 表示名。selector 由来 ('.creo-error-boundary' → 'error-boundary') */
  readonly component: string | null
  /** panel の field 表示名 ('Pad X') */
  readonly label: string
  /** `el.matches()` に渡せる形へ正規化済みの selector 群 */
  readonly matchers: readonly string[]
  /**
   * matcher の subject が creo class のとき、その id 群。null なら class では
   * 絞れない (逆引きで常に総当たり対象)。候補の事前絞り込みに使う。
   */
  readonly subjects: string[] | null
  /**
   * 未解決の元データ。fallback の解決は **選択された要素に対して** 行う必要が
   * あるので (`--_btn-pad-y` の fallback `var(--_btn-size-pad-y)` は `.creo-btn`
   * 上でしか読めない)、index 構築時点では生の文字列のまま持つ。
   */
  readonly source: RawTweakVar
}

/**
 * 逆引き index。mouseover ごとに全 knob へ `el.matches()` を撃つと DOM 階層 ×
 * knob 数で膨らむので、**subject の class 名で候補を先に絞る**。
 * `.creo-btn` の要素なら btn 配下の数個だけを試せばよい。
 */
export interface KnobIndex {
  /** component id → その id を subject に持つ knob */
  readonly byComponent: Map<string, ComponentKnob[]>
  /** class で絞れない knob (総当たり対象。通常は空) */
  readonly unindexed: ComponentKnob[]
  /** 宣言順の全 knob (order 決定に使う) */
  readonly all: ComponentKnob[]
}

export interface ComponentFieldResolverOptions {
  host: EditorHost
  /** provider の getOwner()。lazy register 時の SolidJS context を維持する */
  owner: Owner | null
  /** tweak var の prefix (default: '--_') */
  prefix?: string
  /** 配置 (default: 'tool') */
  semantic?: EditorSemantic
  /** field.order の start (default: 500) */
  orderStart?: number
}

export interface ComponentFieldResolver {
  /** el に効く knob を返す (副作用なし — hover の逐次呼び出しでも安全) */
  match(el: Element): ComponentKnob[]
  /**
   * knob を host に register し、field になった id を返す。
   * `scope` に選択要素を渡すと fallback をその要素の computed style で解決する。
   */
  register(knobs: readonly ComponentKnob[], scope?: Element): string[]
  /** el の component 名。class 由来 → match した selector 由来 の順で決める */
  componentIdOf(el: Element, matched?: readonly ComponentKnob[]): string | null
  /** 逆引き index を今すぐ構築する (通常は初回 match で lazy に構築される) */
  warm(): void
  /** index 内の knob 一覧 (debug / console REPL 用) */
  knobs(): readonly ComponentKnob[]
}

/** `scanRawTweakVars` の結果を逆引き可能な knob へ変換する (pure、解決はしない) */
export function toComponentKnobs(
  discovered: readonly RawTweakVar[],
  prefix = '--_',
): ComponentKnob[] {
  const knobs: ComponentKnob[] = []
  for (const d of discovered) {
    const selectors = d.selectors ?? []
    // selector が 1 つも取れない var (@media 直下の宣言等) は逆引きできない。
    // eager 経路 (F2b) では拾えるので、ここで落としても情報は失われない。
    const matchers = selectors.map(normalizeSelectorForMatch).filter((s): s is string => s !== null)
    if (matchers.length === 0) continue
    const { group, label } = tweakPlacement(d.cssVar, prefix, selectors)
    // subject が 1 つでも絞れなければ knob 全体を総当たり側へ (取りこぼしを作らない)
    let subjects: string[] | null = []
    for (const m of matchers) {
      const ids = subjectComponentIds(m)
      if (!ids) {
        subjects = null
        break
      }
      subjects.push(...ids)
    }
    knobs.push({
      id: tweakVarToId(d.cssVar, prefix),
      cssVar: d.cssVar,
      component: componentIdFromSelectors(selectors) ?? group,
      label,
      matchers,
      subjects,
      source: d,
    })
  }
  return knobs
}

/** knob 配列を subject class で索引化する (pure) */
export function buildKnobIndex(knobs: readonly ComponentKnob[]): KnobIndex {
  const byComponent = new Map<string, ComponentKnob[]>()
  const unindexed: ComponentKnob[] = []
  for (const knob of knobs) {
    if (!knob.subjects || knob.subjects.length === 0) {
      unindexed.push(knob)
      continue
    }
    for (const id of new Set(knob.subjects)) {
      const list = byComponent.get(id)
      if (list) list.push(knob)
      else byComponent.set(id, [knob])
    }
  }
  return { byComponent, unindexed, all: [...knobs] }
}

/** el にヒットする knob を返す (pure — index を引数で受ける) */
export function matchKnobs(el: Element, index: KnobIndex): ComponentKnob[] {
  const candidates = new Set<ComponentKnob>(index.unindexed)
  for (const id of componentClassIdsOf(el)) {
    const list = index.byComponent.get(id)
    if (list) for (const k of list) candidates.add(k)
  }
  if (candidates.size === 0) return []
  // 宣言順を保って返す (panel の並びが CSS の記述順と一致する)
  return index.all.filter(
    (k) => candidates.has(k) && k.matchers.some((m) => matchesSelector(el, m)),
  )
}

export function createComponentFieldResolver(
  opts: ComponentFieldResolverOptions,
): ComponentFieldResolver {
  const { host, owner } = opts
  const prefix = opts.prefix ?? '--_'
  const semantic = opts.semantic ?? 'tool'
  const orderStart = opts.orderStart ?? 500

  let index: KnobIndex | null = null
  /** index 構築時の stylesheet 数。dev の HMR で増減したら作り直す */
  let indexedSheetCount = -1
  /** register 済み field id。host.getField でも判るが、bind 失敗分も覚えて再試行を防ぐ */
  const registered = new Set<string>()

  const sheetCount = (): number =>
    typeof document === 'undefined' ? 0 : document.styleSheets.length

  function ensureIndex(): KnobIndex {
    const count = sheetCount()
    // stylesheet が差し替わった (HMR / 遅延 import) なら index は陳腐化している
    if (index && indexedSheetCount === count) return index
    try {
      index = buildKnobIndex(toComponentKnobs(scanRawTweakVars(prefix), prefix))
    } catch (e) {
      // cross-origin stylesheet 等で scan が転んでも Content を巻き込まない (D-6)
      console.warn('[editor-host] component field scan failed:', e)
      index = { byComponent: new Map(), unindexed: [], all: [] }
    }
    indexedSheetCount = count
    return index
  }

  function match(el: Element): ComponentKnob[] {
    return matchKnobs(el, ensureIndex())
  }

  /**
   * knob を host に register し、**実際に field になった** id だけを返す。
   *
   * fallback の解決は `scope` (= 選択された要素) に対して行う。`--_btn-pad-y` の
   * fallback である `var(--_btn-size-pad-y)` は `.creo-btn` 上でしか読めないので、
   * ここを `:root` でやると btn のノブが丸ごと消える。
   */
  function register(knobs: readonly ComponentKnob[], scope?: Element): string[] {
    const ids: string[] = []
    const { all } = ensureIndex()
    for (const knob of knobs) {
      if (registered.has(knob.id)) {
        // 解決に失敗した knob は field を持たないので id を返してはいけない
        if (host.getField(knob.id)) ids.push(knob.id)
        continue
      }
      registered.add(knob.id)
      if (host.getField(knob.id)) {
        ids.push(knob.id) // 他経路 (F2 / F2b / 手動 bind) が先に登録済み
        continue
      }
      const resolved = resolveTweakVar(knob.source, scope, prefix)
      if (!resolved) continue // fallback が解決できない = ノブにできない
      const binder = bindDiscoveredVar(host, owner, resolved, {
        label: knob.label,
        group: knob.component ?? undefined,
        semantic,
        // index 内の位置を order にすると、同 component のノブが宣言順に並ぶ
        order: orderStart + all.indexOf(knob),
        scope: 'component',
        skipSentinel: true,
      })
      if (binder) ids.push(knob.id)
    }
    return ids
  }

  function componentIdOf(el: Element, matched?: readonly ComponentKnob[]): string | null {
    const fromClass = componentIdOfElement(el)
    if (fromClass) return fromClass
    if (!matched || matched.length === 0) return null
    return componentIdFromSelectors(matched.flatMap((k) => k.source.selectors ?? []))
  }

  return {
    match,
    register,
    componentIdOf,
    warm: () => {
      ensureIndex()
    },
    knobs: () => ensureIndex().all,
  }
}
