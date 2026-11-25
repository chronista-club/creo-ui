import { type Component, createMemo, For, type JSX, Show } from 'solid-js'
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
  /**
   * 選択中 Rail が在っても peek を開閉する外側の指示 (default: `true`)。
   * `false` の間は選択中 Rail の `aria-current="page"` を保ったまま peek だけ畳む (slim)
   */
  peekOpen?: boolean
  /**
   * `true` のとき、peek が開いている間は全 Rail の peek を mount したまま選択外を `hidden` で隠す。
   * Rail を行き来しても下書きや展開状態を失いたくない consumer (VP 等) 向け (default: `false`)
   */
  keepPeeksMounted?: boolean
  /** Rail column の中央 slot (上起点 Rail と下端の間に挟む要素 — slim badge 列等) */
  columnCenter?: JSX.Element
  /** Rail column の下端 slot (下起点 Rail の直上に置く要素 — status dot 等) */
  columnBottom?: JSX.Element
  /** peek の下端 slot (どの Rail を選んでも peek 下端に残る共通帯 — machine 帯等) */
  peekFooter?: JSX.Element
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
 *   在り、かつ `peekOpen` (既定 true) なら expanded。
 *
 * router-agnostic: `@solidjs/router` 等を import せず、`pathname` / `onNavigate` を
 * prop で受ける。consumer 側が router を配線する。
 *
 * Origin: creo-memories doc 30 §6 / creo-web `RailSystem` の抽出。
 */
export const CURail: Component<CURailProps> = (props) => {
  const rails = createMemo(() => railsByOrder(props.registry))
  const topRails = createMemo(() => rails().filter((r) => (r.anchor ?? 'top') === 'top'))
  const bottomRails = createMemo(() => rails().filter((r) => r.anchor === 'bottom'))
  const selectedId = createMemo(() => selectRailId(props.pathname, props.registry))
  const selected = createMemo(() => railById(props.registry, selectedId()))
  const peekOpen = () => props.peekOpen ?? true
  // peek expand: 選択中 Rail が在り、かつ peekOpen (既定 true) のとき expanded (PL-5)
  const expanded = createMemo(() => peekOpen() && selected() !== undefined)

  const label = (rail: RailDef) =>
    props.resolveLabel ? props.resolveLabel(rail.labelKey) : rail.labelKey
  const peekWidth = () => {
    const w = props.peekWidth
    if (w === undefined) return undefined
    return typeof w === 'number' ? `${w}px` : w
  }

  const RailButton = (p: { rail: RailDef }) => (
    <button
      type="button"
      class={styles.icon}
      data-rail={p.rail.id}
      aria-label={label(p.rail)}
      title={label(p.rail)}
      aria-current={p.rail.id === selectedId() ? 'page' : undefined}
      onClick={() => props.onNavigate(p.rail.route)}
    >
      <Dynamic component={p.rail.icon} />
    </button>
  )

  return (
    <div
      class={styles.rail}
      data-region={props.region ?? 'leftEdge'}
      style={peekWidth() === undefined ? undefined : { '--cu-rail-peek-width': peekWidth() }}
    >
      <nav class={styles.column} aria-label="Rail">
        <div class={`${styles.anchorTop} anchor-top`}>
          <For each={topRails()}>{(rail) => <RailButton rail={rail} />}</For>
        </div>
        <Show
          when={
            props.columnCenter !== undefined ||
            bottomRails().length > 0 ||
            props.columnBottom !== undefined
          }
        >
          <div class={`${styles.anchorCenter} anchor-center`}>{props.columnCenter}</div>
        </Show>
        <Show when={bottomRails().length > 0 || props.columnBottom !== undefined}>
          <div class={`${styles.anchorBottom} anchor-bottom`}>
            {props.columnBottom}
            <For each={bottomRails()}>{(rail) => <RailButton rail={rail} />}</For>
          </div>
        </Show>
      </nav>
      <div
        class={styles.peek}
        data-expanded={expanded() ? 'true' : 'false'}
        data-resizing={props.resizing ? 'true' : undefined}
      >
        <Show when={peekOpen()}>
          <Show
            when={props.keepPeeksMounted}
            fallback={
              <Show when={selected()}>{(rail) => <Dynamic component={rail().peek} />}</Show>
            }
          >
            <For each={rails()}>
              {(rail) => (
                <section
                  class={styles.peekBody}
                  data-peek={rail.id}
                  hidden={rail.id !== selectedId()}
                >
                  <Dynamic component={rail.peek} />
                </section>
              )}
            </For>
          </Show>
          {props.peekFooter}
        </Show>
      </div>
    </div>
  )
}
