/**
 * @chronista-club/creo-ui-editor-host — component id (F2c)
 *
 * creo-ui の component には **既に id がある** — class `.creo-<id>` がそれ。
 * tweak var の命名規約はその id をそのまま名乗る:
 *
 *   --_<component>__<knob>      例: --_error-boundary__pad-x
 *
 * `__` があるおかげで component と knob の境界が一意に決まる。区切りが無いと
 * `--_accordion-content-pad-x` を `accordion` と読むか `accordion-content` と
 * 読むかが原理的に決まらない (最長一致は「今たまたま当たっている」だけで、
 * `.creo-btn-pad` のような class が増えた瞬間に解釈が静かに変わる)。
 *
 * この規約があるので、component の抽出は **文字列 split 1 回**で済む。
 * CSSOM の selectorText を解析する必要がなく、`@media` / `:is()` / state 疑似 /
 * cross-origin stylesheet といった落とし穴が最初から存在しない。
 * 規約は `scripts/check-tweak-vars.mjs` が CI で守る。
 */

/** creo-ui component の class prefix 規約 (`.creo-btn` / `.creo-card` ...) */
export const COMPONENT_CLASS_PREFIX = 'creo-'

/** tweak var の component / knob 区切り */
export const TWEAK_SEPARATOR = '__'

/** BEM modifier を落とす: `btn--primary` → `btn` */
function stripModifier(name: string): string {
  const i = name.indexOf('--')
  return i === -1 ? name : name.slice(0, i)
}

/**
 * 要素が持つ creo-ui component id を **全部** 返す (modifier は落とす)。
 * `creo-btn creo-btn--primary creo-icon` → `['btn', 'icon']`
 */
export function componentClassIdsOf(el: Element): string[] {
  const list = el.classList
  if (!list) return []
  const ids = new Set<string>()
  for (const cls of Array.from(list)) {
    if (!cls.startsWith(COMPONENT_CLASS_PREFIX)) continue
    const name = stripModifier(cls.slice(COMPONENT_CLASS_PREFIX.length))
    if (name) ids.add(name)
  }
  return [...ids]
}

/**
 * 要素の代表 component id。`creo-btn creo-btn--primary` → `btn`
 * 複数あるときは最短 (= base component) を採る。
 */
export function componentIdOfElement(el: Element): string | null {
  const ids = componentClassIdsOf(el)
  if (ids.length === 0) return null
  return ids.sort((a, b) => a.length - b.length || a.localeCompare(b))[0]
}

/** component id → class selector (`error-boundary` → `.creo-error-boundary`) */
export function componentSelector(componentId: string): string {
  return `.${COMPONENT_CLASS_PREFIX}${componentId}`
}

/** panel 表示名。selector と同形だが「見せる文字列」としての用途 */
export function componentDisplayName(componentId: string): string {
  return componentSelector(componentId)
}

export interface TweakVarName {
  /** `.creo-<component>` の component 部 */
  component: string
  /** knob 部 (`pad-x` / `size-min-h`) */
  knob: string
}

/**
 * `--_error-boundary__pad-x` → `{ component: 'error-boundary', knob: 'pad-x' }`
 *
 * 規約に合わない名前は null。CI (`check:tweak-vars`) が弾いているので通常は
 * 起きないが、consumer 側の CSS が混ざる可能性があるので runtime でも防御する。
 */
export function parseTweakVarName(cssVar: string, prefix = '--_'): TweakVarName | null {
  if (!cssVar.startsWith(prefix)) return null
  const body = cssVar.slice(prefix.length)
  const parts = body.split(TWEAK_SEPARATOR)
  if (parts.length !== 2) return null
  const [component, knob] = parts
  if (!component || !knob) return null
  return { component, knob }
}

/** knob 名を panel の label に: `pad-x` → `Pad X` */
export function knobLabel(knob: string): string {
  return knob
    .split('-')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export const __test__ = { stripModifier }
