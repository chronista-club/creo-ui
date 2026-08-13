/**
 * @chronista-club/creo-ui-editor-host — component 単位の field 解決 (F2c)
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
 * そして何より、選択は `data-editor-fields` を手で仕込んだ要素にしか効かなかった。
 *
 * F2c は **命名規約 `--_<component>__<knob>` を唯一の根拠**にする。var 名を `__` で
 * split すれば component が確定するので、
 *
 *  - panel に「今のページに居る component」の一覧を出せる (picker)
 *  - id を選ぶ / 要素をクリックする、どちらからでも同じ経路で解決できる
 *  - 選ばれた component のノブ **だけ** を lazy に register できる
 *
 * component ↔ class は 1:1 (`btn` ↔ `.creo-btn`) なので、DOM 側の判定も
 * `el.classList` を見るだけで済む — `el.matches()` も selectorText の解析も要らない。
 */
import type { Owner } from 'solid-js'
import {
  type RawTweakVar,
  bindDiscoveredVar,
  resolveTweakVar,
  scanRawTweakVars,
} from './auto-discover'
import {
  componentClassIdsOf,
  componentDisplayName,
  componentIdOfElement,
  componentSelector,
  knobLabel,
  parseTweakVarName,
} from './component-id'
import type { EditorHost, EditorSemantic } from './types'

/** panel のノブ 1 個 */
export interface ComponentKnob {
  /** field id ('btn.pad.x') — 永続化 key でもある */
  readonly id: string
  /** '--_btn__pad-x' */
  readonly cssVar: string
  /** 所属 component id ('btn' / 'error-boundary') */
  readonly component: string
  /** panel の表示名 ('Pad X') */
  readonly label: string
  /**
   * 未解決の元データ。fallback の解決は **対象要素に対して** 行う必要がある
   * (`--_btn__pad-y` の fallback `var(--_btn__size-pad-y)` は `.creo-btn` 上でしか
   * 読めない)、index 構築時点では生の文字列のまま持つ。
   */
  readonly source: RawTweakVar
}

/** component id → その component のノブ。規約 split で作るので曖昧さが無い */
export interface KnobIndex {
  readonly byComponent: Map<string, ComponentKnob[]>
  /** 宣言順の全 knob (order 決定に使う) */
  readonly all: ComponentKnob[]
}

/** panel の component picker に出す 1 行分 */
export interface ComponentEntry {
  /** component id ('btn' / 'error-boundary') */
  readonly id: string
  /** panel 表示名 ('.creo-btn') */
  readonly label: string
  /** その component が持つノブの数 */
  readonly knobCount: number
  /** 現 DOM にその component が居るか */
  readonly present: boolean
}

/** component を選んだ結果。panel から `host.select()` に渡せる形 */
export interface ComponentSelection {
  readonly componentId: string
  /** register 済みの field id */
  readonly fieldIds: string[]
  /** 代表要素 (画面に居れば outline を出せる)。居なければ null */
  readonly element: Element | null
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
  /**
   * 逆引き index に載っている component を列挙する (副作用なし)。
   * default は **現 DOM に居るものだけ** — 画面に無い component のノブを回しても
   * 変化が見えないので、既定では picker に出さない。
   */
  components(opts?: { presentOnly?: boolean }): ComponentEntry[]
  /**
   * component id を指定して選択する (panel の picker 用)。
   * 画面上の代表要素を 1 つ引き当て、その要素で fallback を解決して register する。
   */
  selectComponent(id: string): ComponentSelection | null
  /** el が属する component のノブを返す (副作用なし — hover でも安全) */
  match(el: Element): ComponentKnob[]
  /** knob を host に register し、field になった id を返す */
  register(knobs: readonly ComponentKnob[], scope?: Element): string[]
  /** el の component id (class 由来) */
  componentIdOf(el: Element): string | null
  /** index を今すぐ構築する (通常は初回アクセスで lazy に構築される) */
  warm(): void
  /** index 内の knob 一覧 (debug / console REPL 用) */
  knobs(): readonly ComponentKnob[]
}

/** '--_btn__pad-x' → 'btn.pad.x' (field id は dot notation で揃える) */
function knobFieldId(component: string, knob: string): string {
  return `${component}.${knob}`.replace(/-/g, '.')
}

/** raw な tweak var 参照を、規約 split で component 付きの knob へ変換する (pure) */
export function toComponentKnobs(
  discovered: readonly RawTweakVar[],
  prefix = '--_',
): ComponentKnob[] {
  const knobs: ComponentKnob[] = []
  for (const d of discovered) {
    const parsed = parseTweakVarName(d.cssVar, prefix)
    // 規約に合わない var は無視する (CI が弾いているので通常は起きない)
    if (!parsed) continue
    knobs.push({
      id: knobFieldId(parsed.component, parsed.knob),
      cssVar: d.cssVar,
      component: parsed.component,
      label: knobLabel(parsed.knob),
      source: d,
    })
  }
  return knobs
}

/** knob 配列を component id で索引化する (pure) */
export function buildKnobIndex(knobs: readonly ComponentKnob[]): KnobIndex {
  const byComponent = new Map<string, ComponentKnob[]>()
  for (const knob of knobs) {
    const list = byComponent.get(knob.component)
    if (list) list.push(knob)
    else byComponent.set(knob.component, [knob])
  }
  return { byComponent, all: [...knobs] }
}

/**
 * el に効く knob を返す (pure)。
 * el が持つ `creo-*` class を index に引くだけ — selector 照合は要らない。
 */
export function matchKnobs(el: Element, index: KnobIndex): ComponentKnob[] {
  const out: ComponentKnob[] = []
  for (const id of componentClassIdsOf(el)) {
    const list = index.byComponent.get(id)
    if (list) out.push(...list)
  }
  return out
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
  /** register 済み field id (bind 失敗分も覚えて再試行を防ぐ) */
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
      index = { byComponent: new Map(), all: [] }
    }
    indexedSheetCount = count
    return index
  }

  /** component が現 DOM に居るか (class を引くだけ) */
  function findRepresentative(componentId: string): Element | null {
    if (typeof document === 'undefined') return null
    try {
      return document.querySelector(componentSelector(componentId))
    } catch {
      return null
    }
  }

  function components(opts?: { presentOnly?: boolean }): ComponentEntry[] {
    const presentOnly = opts?.presentOnly ?? true
    const entries: ComponentEntry[] = []
    for (const [id, knobs] of ensureIndex().byComponent) {
      const present = findRepresentative(id) !== null
      if (presentOnly && !present) continue
      entries.push({ id, label: componentDisplayName(id), knobCount: knobs.length, present })
    }
    return entries.sort((a, b) => a.id.localeCompare(b.id))
  }

  /**
   * knob を register し、**実際に field になった** id だけを返す。
   *
   * fallback の解決は `scope` (= 対象要素) に対して行う。`--_btn__pad-y` の fallback
   * `var(--_btn__size-pad-y)` は `.creo-btn` 上でしか読めないので、ここを `:root` で
   * やると btn のノブが丸ごと消える。
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
      const resolved = resolveTweakVar(knob.source, knob.id, scope, prefix)
      if (!resolved) continue // fallback が解決できない = ノブにできない
      const binder = bindDiscoveredVar(host, owner, resolved, {
        label: knob.label,
        group: knob.component,
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

  function selectComponent(id: string): ComponentSelection | null {
    const knobs = ensureIndex().byComponent.get(id)
    if (!knobs || knobs.length === 0) return null
    const element = findRepresentative(id)
    // 画面に居ればその要素で解決する (variant 込みの実値が取れる)。
    // 居なければ :root 基準 — token 由来の fallback だけは解決できる
    return { componentId: id, fieldIds: register(knobs, element ?? undefined), element }
  }

  return {
    components,
    selectComponent,
    match: (el) => matchKnobs(el, ensureIndex()),
    register,
    componentIdOf: componentIdOfElement,
    warm: () => {
      ensureIndex()
    },
    knobs: () => ensureIndex().all,
  }
}
