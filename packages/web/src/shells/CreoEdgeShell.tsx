import { type Component, type JSX, Show } from 'solid-js'
import styles from './CreoEdgeShell.module.css'

interface CreoEdgeShellProps {
  /** center = 主要活動拠点 (route 内容、principal-layout.md §2) */
  children: JSX.Element
  /** left edge = 起点。Rail System (<CreoRail>) を入れる枠 */
  leftEdge?: JSX.Element
  /** right edge = ツール (center の活動支援) */
  rightEdge?: JSX.Element
  /** up edge = global / cross-layer */
  upEdge?: JSX.Element
  /** down edge = local / in-layer */
  downEdge?: JSX.Element
  /** outer container にマージする class */
  class?: string
}

/**
 * CreoEdgeShell — Principal Layout の Edge Ring (docs/design/principal-layout.md §2)
 *
 * 4 edge (left/right/up/down) が center を囲む 2D 基盤フレーム。center は consumer の
 * route component、各 edge は consumer 供給 (left edge には `<CreoRail>` を入れる)。
 *
 * 設計 (PL-2 / PL-8):
 * - region は位置語彙 (`data-region`) で名づける。「sidebar」等の語は出さない。
 * - 中身が無い edge は **DOM を描かない** (`<Show>`) — grid track が auto で 0 に
 *   畳まれ center が驚き最小に保たれる。
 * - Edge Ring は `overflow:hidden` の rigid grid に **しない** — region は home を
 *   与えるだけで、要素は寸法自由・region を越えてよい (羅針盤であって格子でない)。
 *
 * ```tsx
 * <CreoEdgeShell leftEdge={<CreoRail registry={rails} .../>}>
 *   <RouteOutlet />
 * </CreoEdgeShell>
 * ```
 *
 * Origin: creo-memories doc 30 §4 "Edge Ring" / creo-web `EdgeFrame` の抽出。
 */
export const CreoEdgeShell: Component<CreoEdgeShellProps> = (props) => (
  <div class={`${styles.edgeShell}${props.class ? ` ${props.class}` : ''}`}>
    <Show when={props.upEdge}>
      <div class={styles.upEdge} data-region="upEdge">
        {props.upEdge}
      </div>
    </Show>
    <Show when={props.leftEdge}>
      <div class={styles.leftEdge} data-region="leftEdge">
        {props.leftEdge}
      </div>
    </Show>
    <div class={styles.center} data-region="center">
      {props.children}
    </div>
    <Show when={props.rightEdge}>
      <div class={styles.rightEdge} data-region="rightEdge">
        {props.rightEdge}
      </div>
    </Show>
    <Show when={props.downEdge}>
      <div class={styles.downEdge} data-region="downEdge">
        {props.downEdge}
      </div>
    </Show>
  </div>
)
