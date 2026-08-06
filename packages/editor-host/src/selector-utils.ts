/**
 * @chronista-club/creo-ui-editor-host — selector utilities (F2c)
 *
 * CSSOM の `selectorText` と実 DOM 要素を突き合わせるための helper 群。
 * DOM に触るのは `matchesSelector` / `componentIdOfElement` だけで、残りは
 * 純粋な文字列処理なので単体でテストできる。
 *
 * F2c (選択駆動の component field 解決) はこの逆引きの上に成り立つ:
 * 「この要素に **実際に効いている** CSS rule はどれか」を DOM に問い合わせるので、
 * `--_eb-*` ↔ `.creo-error-boundary` のような **var 名と class 名のズレ**を
 * 命名規約なしで吸収できる。
 */

/** creo-ui component の class prefix 規約 (`.creo-btn` / `.creo-card` ...) */
export const COMPONENT_CLASS_PREFIX = 'creo-'

/**
 * 構造に関係しない state 疑似クラス / 疑似要素。
 *
 * CSSOM の selectorText をそのまま `el.matches()` に渡すと `.creo-btn:hover` は
 * 「今まさに hover 中でなければ」false になり、hover 時だけ使われるノブを永久に
 * 拾えない。そこで state だけを剥がす。
 *
 * 逆に `:not()` / `:nth-child()` / `[data-variant="x"]` は **残す** — その variant
 * が付いた要素にだけノブが出るのが正しい挙動なので、剥がしてはいけない。
 */
const STATE_PSEUDO_RE =
  /::?(?:hover|focus-visible|focus-within|focus|active|visited|link|target-within|target|disabled|enabled|checked|indeterminate|placeholder-shown|placeholder|read-only|read-write|user-invalid|user-valid|invalid|valid|in-range|out-of-range|required|optional|default|popover-open|open|autofill|modal|fullscreen|picture-in-picture|before|after|backdrop|marker|selection|first-line|first-letter|file-selector-button|part|slotted|-webkit-[a-z-]+|-moz-[a-z-]+)(?![\w-])(?:\([^()]*\))?/g

/** BEM modifier を落とす: `btn--primary` → `btn` */
function stripModifier(name: string): string {
  const i = name.indexOf('--')
  return i === -1 ? name : name.slice(0, i)
}

/**
 * selector list を depth 0 の comma で分割する。
 * `:is(a, b)` / `[attr="x,y"]` の内側の comma は分割しない。
 */
export function splitSelectorList(selectorText: string): string[] {
  const parts: string[] = []
  let depth = 0
  let quote: string | null = null
  let start = 0

  for (let i = 0; i < selectorText.length; i++) {
    const ch = selectorText[i]
    if (quote) {
      if (ch === quote && selectorText[i - 1] !== '\\') quote = null
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
    } else if (ch === '(' || ch === '[') {
      depth++
    } else if (ch === ')' || ch === ']') {
      depth--
    } else if (ch === ',' && depth === 0) {
      parts.push(selectorText.slice(start, i).trim())
      start = i + 1
    }
  }
  parts.push(selectorText.slice(start).trim())
  return parts.filter(Boolean)
}

/** 1 part から state 疑似を剥がす。剥がした結果が selector として無効なら null */
function stripStatePseudos(part: string): string | null {
  const stripped = part.replace(STATE_PSEUDO_RE, '').trim()
  if (!stripped) return null
  // combinator だけが残った (`> ` 等) / 属性の残骸のみ、は selector として無効
  if (/^[>+~]/.test(stripped)) return null
  return stripped
}

/**
 * `selectorText` を `el.matches()` に渡せる形へ正規化する。
 * 各 part から state 疑似を剥がし、無効化した part は落とす。
 * 全 part が落ちたら null (= 逆引きの対象にしない)。
 */
export function normalizeSelectorForMatch(selectorText: string): string | null {
  const parts = splitSelectorList(selectorText)
    .map(stripStatePseudos)
    .filter((p): p is string => p !== null)
  return parts.length > 0 ? parts.join(', ') : null
}

const COMPONENT_CLASS_RE = /\.creo-([a-zA-Z0-9_-]+)/g

/**
 * 単一の複合 selector (comma を含まない) から creo-ui component 名を取る。
 * 複数あれば **subject 側 (最後)** を採る: `.creo-card > .creo-card-header:hover` → `card-header`
 */
function componentIdFromSimpleSelector(selector: string): string | null {
  let last: string | null = null
  for (const m of selector.matchAll(COMPONENT_CLASS_RE)) {
    last = m[1]
  }
  if (!last) return null
  const base = stripModifier(last)
  return base || null
}

/**
 * selector から creo-ui component 名を取る。
 *
 * comma list (`.creo-checkbox, .creo-radio`) は **part ごとに** subject を見て
 * 先頭の part を代表とする。list 全体で「最後の .creo-*」を採ると
 * `.creo-checkbox, .creo-radio` が radio になってしまう。
 */
export function componentIdFromSelector(selector: string): string | null {
  for (const part of splitSelectorList(selector)) {
    const id = componentIdFromSimpleSelector(part)
    if (id) return id
  }
  return null
}

/**
 * selector 群から代表 component 名を決める。
 *
 * 出現数の多い順 → 同数なら **最初に現れたもの**。`.creo-btn, .creo-btn--sm` なら
 * base の `btn` が数で勝ち、`.creo-checkbox, .creo-radio` のような共有 rule では
 * 記述順の先頭 (checkbox) を代表にする — Map は挿入順を保つので sort が安定なら
 * それがそのまま tie-break になる。
 */
export function componentIdFromSelectors(selectors: readonly string[]): string | null {
  const counts = new Map<string, number>()
  // comma list は part に割ってから数える (`.creo-btn, .creo-btn--sm` を 2 票にする)
  for (const sel of selectors.flatMap(splitSelectorList)) {
    const id = componentIdFromSimpleSelector(sel)
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1)
  }
  if (counts.size === 0) return null
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return ranked[0][0]
}

/**
 * 要素の class から creo-ui component 名を取る。
 * `creo-btn creo-btn--primary` → `btn` (modifier を落とし、最短 = base を採る)
 */
export function componentIdOfElement(el: Element): string | null {
  const list = el.classList
  if (!list) return null
  const candidates: string[] = []
  for (const cls of Array.from(list)) {
    if (!cls.startsWith(COMPONENT_CLASS_PREFIX)) continue
    const name = stripModifier(cls.slice(COMPONENT_CLASS_PREFIX.length))
    if (name) candidates.push(name)
  }
  if (candidates.length === 0) return null
  return candidates.sort((a, b) => a.length - b.length || a.localeCompare(b))[0]
}

/**
 * 要素が持つ creo-ui component class を **全部** 返す (modifier は落とす)。
 * `creo-btn creo-btn--primary creo-icon` → ['btn', 'btn', 'icon']
 * 逆引き index の候補絞り込みに使う。
 */
export function componentClassIdsOf(el: Element): string[] {
  const list = el.classList
  if (!list) return []
  const ids: string[] = []
  for (const cls of Array.from(list)) {
    if (!cls.startsWith(COMPONENT_CLASS_PREFIX)) continue
    const name = stripModifier(cls.slice(COMPONENT_CLASS_PREFIX.length))
    if (name) ids.push(name)
  }
  return ids
}

/**
 * selector の **subject (最右の compound)** が creo class なら、その id を part ごとに
 * 集めて返す。`.creo-checkbox, .creo-radio` → ['checkbox', 'radio']。
 *
 * 1 part でも creo class で絞れないもの (`main > section` 等) は **null** を返す —
 * その knob は class では候補を絞れないので、逆引きでは総当たり側に置く。
 */
export function subjectComponentIds(selector: string): string[] | null {
  const parts = splitSelectorList(selector)
  if (parts.length === 0) return null
  const ids: string[] = []
  for (const part of parts) {
    // subject = 最後の combinator (空白 / > / + / ~) より右側の compound
    const subject =
      part
        .split(/[\s>+~]+/)
        .filter(Boolean)
        .pop() ?? ''
    const id = componentIdFromSimpleSelector(subject)
    if (!id) return null
    ids.push(id)
  }
  return ids.length > 0 ? ids : null
}

/** `el.matches()` の安全版。不正 selector は false (fail-closed) */
export function matchesSelector(el: Element, selector: string): boolean {
  try {
    return el.matches(selector)
  } catch {
    return false
  }
}

/** component 名を panel 表示用の label にする: `error-boundary` → `.creo-error-boundary` */
export function componentDisplayName(componentId: string): string {
  return `.${COMPONENT_CLASS_PREFIX}${componentId}`
}

export const __test__ = {
  stripModifier,
  stripStatePseudos,
}
