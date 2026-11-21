import { type Component, createMemo, For, Show } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import styles from './CURail.module.css'
import { type RailDef, railById, railsByOrder, selectRailId } from './railRegistry'
import type { EdgeRegion } from './regions'

/** Rail を置ける edge。横軸 (起点 ⇄ ツール) の両端だけ — 縦の edge には置かない */
export type RailRegion = Extract<EdgeRegion, 'leftEdge' | 'rightEdge'>

interface CURailProps {
  /** app 供給の Rail registry (PL-3 — primitive は rail を hardcode しない) */
  registry: readonly RailDef[]
  /**
   * 現在 pathname — consumer が router から供給 (PL-4: route = 唯一の SSOT)。
   * router を持たない consumer は、自分の状態を pseudo-route (`/lanes/<addr>` 等) に
   * 写して渡してよい。その場合も click 由来の別 signal は持たない
   */
  pathname: string
  /** Rail icon click — consumer が navigate を実行する (router-agnostic) */
  onNavigate: (route: string) => void
  /** labelKey → 表示文字列。未指定なら labelKey をそのまま aria-label に使う */
  resolveLabel?: (labelKey: string) => string
  /**
   * どちらの edge に立つか (default: `'leftEdge'`)。`'rightEdge'` では column と peek の
   * 並び・境界線を左右反転し、peek が center 側に開く
   */
  region?: RailRegion
  /**
   * 開いた peek の幅。数値は px、文字列は CSS の長さとしてそのまま使う
   * (default: 240px)。resize と永続は consumer の仕事 — 決まった幅をここに渡す
   */
  peekWidth?: number | string
  /** consumer が peek を drag で resize している間 true。幅の transition を止める */
  resizing?: boolean
}

/**
 * CURail — Principal Layout の Rail System (left / right edge)
 * (docs/design/principal-layout.md §5)
 *
 * Rail column (アイコン縦列) + peek panel (選択中 Rail の中身)。`<CUEdgeShell>` の
 * `leftEdge` (起点) か `rightEdge` (ツール) に入れ、`region` を揃えて使う。
 *
 * 設計 (PL-3〜PL-5):
 * - registry は **app 供給** — `<CURail registry={APP_RAILS} />`。
 * - 選択中 Rail = route が唯一の SSOT。`selectRailId` (最長 prefix 一致) で導出し、
 *   click 由来の別 signal は持たない。icon click は consumer の navigate を呼ぶだけ。
 * - peek = collapsed (0) ⇄ expanded (既定 240px、`peekWidth` で変更可)。選択中 Rail が
 *   在れば expanded。
 *
 * router-agnostic: `@solidjs/router` 等を import せず、`pathname` / `onNavigate` を
 * prop で受ける。consumer 側が router を配線する。
 *
 * Origin: creo-memories doc 30 §6 / creo-web `RailSystem` の抽出。
 */
export const CURail: Component<CURailProps> = (props) => {
  const rails = createMemo(() => railsByOrder(props.registry))
  const selectedId = createMemo(() => selectRailId(props.pathname, props.registry))
  const selected = createMemo(() => railById(props.registry, selectedId()))
  // peek expand: 選択中 Rail が在れば expanded (PL-5)
  const expanded = createMemo(() => selected() !== undefined)

  const label = (rail: RailDef) =>
    props.resolveLabel ? props.resolveLabel(rail.labelKey) : rail.labelKey
  const peekWidth = () => {
    const w = props.peekWidth
    if (w === undefined) return undefined
    return typeof w === 'number' ? `${w}px` : w
  }

  return (
    <div
      class={styles.rail}
      data-region={props.region ?? 'leftEdge'}
      style={peekWidth() === undefined ? undefined : { '--cu-rail-peek-width': peekWidth() }}
    >
      <nav class={styles.column} aria-label="Rail">
        <For each={rails()}>
          {(rail) => (
            <button
              type="button"
              class={styles.icon}
              data-rail={rail.id}
              aria-label={label(rail)}
              aria-current={rail.id === selectedId() ? 'page' : undefined}
              onClick={() => props.onNavigate(rail.route)}
            >
              <Dynamic component={rail.icon} />
            </button>
          )}
        </For>
      </nav>
      <div
        class={styles.peek}
        data-expanded={expanded() ? 'true' : 'false'}
        data-resizing={props.resizing ? 'true' : undefined}
      >
        <Show when={selected()}>{(rail) => <Dynamic component={rail().peek} />}</Show>
      </div>
    </div>
  )
}
