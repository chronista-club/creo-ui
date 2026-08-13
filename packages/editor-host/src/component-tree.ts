/**
 * @chronista-club/creo-ui-editor-host — Discovery の DOM ツリー (F2c)
 *
 * ページの実 DOM を歩き、creo-ui component の**インスタンス構造**をツリーにする。
 * Discovery panel はこれを Outliner 的に表示し、node を選ぶと drill-in する。
 *
 * 設計判断:
 * - **ツリーはナビゲーション、編集は component scope のまま** (D-13)。選んだ
 *   instance は outline の対象と fallback 解決の基準要素として使うだけで、
 *   ノブの書き込み先は `:root` (全 instance に効く)
 * - **非 creo 要素は畳んで素通しする** — `<div class="docs-grid">` のような
 *   ラッパは node にせず、その子の creo component を親 level へ引き上げる。
 *   ツリーに出るのは creo component だけ
 * - **同 component の sibling は 1 node に畳む** (`.creo-table-cell × 12`)。
 *   畳まないと Outliner の row などで行が爆発する。代表 = 最初の instance で、
 *   子ツリーも代表のものを見せる (編集は component scope なのでどれを選んでも
 *   同じノブに着地する)
 */
import type { KnobIndex } from './component-fields'
import { componentDisplayName, componentIdOfElement } from './component-id'

export interface ComponentTreeNode {
  /** component id ('btn' / 'card-header') */
  readonly componentId: string
  /** panel 表示名 ('.creo-btn') */
  readonly label: string
  /** 代表 instance (畳んだときは最初の 1 個) */
  readonly element: Element
  /** 同 level に居た同 component の instance 数 (1 = 単独) */
  readonly count: number
  /** この component が持つノブの数 */
  readonly knobCount: number
  readonly children: ComponentTreeNode[]
  /** ツリー内で一意の key (描画の identity 用) */
  readonly key: string
}

interface RawNode {
  componentId: string
  element: Element
  children: RawNode[]
}

/** DOM を歩いて creo component だけの生ツリーを作る (非 creo 要素は素通し) */
function collect(el: Element): RawNode[] {
  const out: RawNode[] = []
  for (const child of Array.from(el.children ?? [])) {
    // Editor 自身の UI (panel / outline) は Content ではないので出さない
    if ((child as HTMLElement).dataset?.editorLayer !== undefined) continue
    const componentId = componentIdOfElement(child)
    if (componentId) {
      out.push({ componentId, element: child, children: collect(child) })
    } else {
      out.push(...collect(child))
    }
  }
  return out
}

/** 同 level の同 component を畳み、表示用 node に仕上げる */
function finalize(nodes: RawNode[], index: KnobIndex, keyPrefix: string): ComponentTreeNode[] {
  // Map は挿入順を保つので、畳んだ後も「最初に現れた順」が維持される
  const grouped = new Map<string, { first: RawNode; count: number }>()
  for (const n of nodes) {
    const g = grouped.get(n.componentId)
    if (g) g.count++
    else grouped.set(n.componentId, { first: n, count: 1 })
  }
  return [...grouped.entries()].map(([componentId, g]) => {
    const key = keyPrefix ? `${keyPrefix}/${componentId}` : componentId
    return {
      componentId,
      label: componentDisplayName(componentId),
      element: g.first.element,
      count: g.count,
      knobCount: index.byComponent.get(componentId)?.length ?? 0,
      children: finalize(g.first.children, index, key),
      key,
    }
  })
}

/**
 * root 配下の creo-ui component ツリーを作る。
 * root 自身は含まない (通常 `document.body` を渡す)。
 */
export function buildComponentTree(root: Element, index: KnobIndex): ComponentTreeNode[] {
  return finalize(collect(root), index, '')
}
