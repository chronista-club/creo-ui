/**
 * creo-ui — Outliner の tree 操作 (純関数)
 *
 * CUOutliner の keyboard grammar (Enter / Tab / ⌥↑ …) が呼ぶ木の書き換えを、
 * DOM も signal も知らない純関数として切り出したもの。 outliner の難しさは
 * 見た目ではなく「木のどこに挿し、 どこへ動かすか」に集中しているので、
 * そこだけを単体で検証できる形にしている。
 *
 * 規約:
 *   - すべて **immutable** — 引数の木は書き換えず、 新しい木を返す
 *     (SolidJS の signal にそのまま入れて差分検知を効かせるため)
 *   - 操作できない場合 (先頭行の indent 等) は **同一参照をそのまま返す**。
 *     呼び出し側は `next === prev` で「何も起きなかった」を判定できる
 */

export type OutlinerNode = {
  id: string
  text: string
  /** 子。 空配列と undefined は同義 (葉) */
  children?: OutlinerNode[]
  /** 畳んでいる = 子孫を表示しない */
  collapsed?: boolean
  /** 完了 (取り消し線 + 減光) */
  done?: boolean
  /** 右端 slot に出す文字列。 JSX を出したい場合は CUOutliner の renderMeta を使う */
  meta?: string
}

/** 画面に見えている 1 行 (畳まれた枝の子孫は含まない) */
export type FlatRow = {
  node: OutlinerNode
  /** 0 起点の深さ。 CSS の --outliner-depth にそのまま渡る */
  depth: number
  hasChildren: boolean
}

const kids = (node: OutlinerNode): OutlinerNode[] => node.children ?? []

/** 木を上から順に、 畳まれた枝を飛ばしながら 1 次元に並べる */
export function flattenVisible(nodes: OutlinerNode[], depth = 0): FlatRow[] {
  const rows: FlatRow[] = []
  for (const node of nodes) {
    const children = kids(node)
    rows.push({ node, depth, hasChildren: children.length > 0 })
    if (children.length > 0 && !node.collapsed) {
      rows.push(...flattenVisible(children, depth + 1))
    }
  }
  return rows
}

/** id までの index path。 見つからなければ null */
export function findPath(nodes: OutlinerNode[], id: string): number[] | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === id) return [i]
    const sub = findPath(kids(nodes[i]), id)
    if (sub) return [i, ...sub]
  }
  return null
}

/** path が指す親の子配列を取り出す (path の最後の index は使わない) */
function siblingsAt(nodes: OutlinerNode[], path: number[]): OutlinerNode[] {
  let list = nodes
  for (let i = 0; i < path.length - 1; i++) {
    list = kids(list[path[i]])
  }
  return list
}

/** path の位置の子配列を update で差し替えた新しい木を返す */
function replaceSiblings(
  nodes: OutlinerNode[],
  path: number[],
  update: (list: OutlinerNode[]) => OutlinerNode[],
): OutlinerNode[] {
  if (path.length === 1) return update(nodes)
  const [head, ...rest] = path
  return nodes.map((node, i) =>
    i === head ? { ...node, children: replaceSiblings(kids(node), rest, update) } : node,
  )
}

/** id の node を差し替える (children はそのまま持ち回る) */
export function updateNode(
  nodes: OutlinerNode[],
  id: string,
  patch: (node: OutlinerNode) => OutlinerNode,
): OutlinerNode[] {
  const path = findPath(nodes, id)
  if (!path) return nodes
  const index = path[path.length - 1]
  const current = siblingsAt(nodes, path)[index]
  const patched = patch(current)
  // patch が同じ node を返したら木ごと同一参照で返す (「変わっていない」を呼び出し側に伝える)
  if (patched === current) return nodes
  return replaceSiblings(nodes, path, (list) =>
    list.map((node, i) => (i === index ? patched : node)),
  )
}

export const setText = (nodes: OutlinerNode[], id: string, text: string): OutlinerNode[] =>
  updateNode(nodes, id, (node) => (node.text === text ? node : { ...node, text }))

export const toggleCollapsed = (nodes: OutlinerNode[], id: string): OutlinerNode[] =>
  updateNode(nodes, id, (node) => ({ ...node, collapsed: !node.collapsed }))

export const setDone = (nodes: OutlinerNode[], id: string, done: boolean): OutlinerNode[] =>
  updateNode(nodes, id, (node) => ({ ...node, done }))

/**
 * id の直後に同じ深さで新しい行を挿す (Enter)。
 * id が null / 見つからない場合は末尾 (root 直下) に足す — 空の outliner でも
 * 「まず 1 行書ける」ようにするため。
 */
export function insertSiblingAfter(
  nodes: OutlinerNode[],
  id: string | null,
  newNode: OutlinerNode,
): OutlinerNode[] {
  if (!id) return [...nodes, newNode]
  const path = findPath(nodes, id)
  if (!path) return [...nodes, newNode]
  const index = path[path.length - 1]
  return replaceSiblings(nodes, path, (list) => [
    ...list.slice(0, index + 1),
    newNode,
    ...list.slice(index + 1),
  ])
}

/**
 * 1 段深くする (Tab) — 直前の兄弟の末子になる。
 * 先頭の行は受け皿が無いので何もしない。 受け皿が畳まれていたら開く
 * (畳んだまま潜らせると、 打った行が画面から消えて迷子になるため)。
 */
export function indent(nodes: OutlinerNode[], id: string): OutlinerNode[] {
  const path = findPath(nodes, id)
  if (!path) return nodes
  const index = path[path.length - 1]
  if (index === 0) return nodes

  return replaceSiblings(nodes, path, (list) => {
    const moving = list[index]
    const host = list[index - 1]
    const next = [...list]
    next[index - 1] = {
      ...host,
      collapsed: false,
      children: [...kids(host), moving],
    }
    next.splice(index, 1)
    return next
  })
}

/**
 * 1 段浅くする (Shift+Tab) — 親の次の兄弟になる。 自分の子はそのまま連れて行く。
 * 後続の兄弟は元の親に残す (Notion 系の素直な挙動。 連れ出す方式は「動かしたつもりの
 * ない行まで動く」ので capture 用途では驚きが大きい)。
 */
export function outdent(nodes: OutlinerNode[], id: string): OutlinerNode[] {
  const path = findPath(nodes, id)
  if (!path || path.length < 2) return nodes

  const selfIndex = path[path.length - 1]
  const parentPath = path.slice(0, -1)
  const parentIndex = parentPath[parentPath.length - 1]
  const moving = siblingsAt(nodes, path)[selfIndex]

  // 1) 親から自分を抜く
  const detached = replaceSiblings(nodes, path, (list) => list.filter((_, i) => i !== selfIndex))
  // 2) 親の直後に自分を挿す
  return replaceSiblings(detached, parentPath, (list) => [
    ...list.slice(0, parentIndex + 1),
    moving,
    ...list.slice(parentIndex + 1),
  ])
}

/** 兄弟の中で 1 つ上と入れ替える (⌥↑)。 先頭なら何もしない (親をまたがない) */
export function moveUp(nodes: OutlinerNode[], id: string): OutlinerNode[] {
  const path = findPath(nodes, id)
  if (!path) return nodes
  const index = path[path.length - 1]
  if (index === 0) return nodes
  return replaceSiblings(nodes, path, (list) => {
    const next = [...list]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    return next
  })
}

/** 兄弟の中で 1 つ下と入れ替える (⌥↓)。 末尾なら何もしない */
export function moveDown(nodes: OutlinerNode[], id: string): OutlinerNode[] {
  const path = findPath(nodes, id)
  if (!path) return nodes
  const index = path[path.length - 1]
  const list = siblingsAt(nodes, path)
  if (index === list.length - 1) return nodes
  return replaceSiblings(nodes, path, (l) => {
    const next = [...l]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    return next
  })
}

/**
 * 空行を削る (Backspace)。 子を持つ行は消さない — 畳んでいる時に子ごと消えると
 * 取り返しがつかないため。 削れない場合は同一参照を返す。
 */
export function removeNode(nodes: OutlinerNode[], id: string): OutlinerNode[] {
  const path = findPath(nodes, id)
  if (!path) return nodes
  const index = path[path.length - 1]
  const target = siblingsAt(nodes, path)[index]
  if (kids(target).length > 0) return nodes
  return replaceSiblings(nodes, path, (list) => list.filter((_, i) => i !== index))
}

/** 見えている並びで 1 つ前の行の id (先頭なら null) */
export function prevVisibleId(nodes: OutlinerNode[], id: string): string | null {
  const rows = flattenVisible(nodes)
  const i = rows.findIndex((r) => r.node.id === id)
  return i > 0 ? rows[i - 1].node.id : null
}

/** 見えている並びで 1 つ後の行の id (末尾なら null) */
export function nextVisibleId(nodes: OutlinerNode[], id: string): string | null {
  const rows = flattenVisible(nodes)
  const i = rows.findIndex((r) => r.node.id === id)
  return i >= 0 && i < rows.length - 1 ? rows[i + 1].node.id : null
}

let idCounter = 0

/** 行 id の生成。 crypto があればそちら、 無ければ連番 (test / SSR 用の決定的 fallback) */
export function createNodeId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  idCounter += 1
  return `creo-outliner-${idCounter}`
}
