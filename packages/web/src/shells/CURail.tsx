import { type Component, For, Show, createMemo } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import styles from './CURail.module.css'
import { type RailDef, railById, railsByOrder, selectRailId } from './railRegistry'

interface CURailProps {
  /** app 供給の Rail registry (PL-3 — primitive は rail を hardcode しない) */
  registry: readonly RailDef[]
  /** 現在 pathname — consumer が router から供給 (PL-4: route = 唯一の SSOT) */
  pathname: string
  /** Rail icon click — consumer が navigate を実行する (router-agnostic) */
  onNavigate: (route: string) => void
  /** labelKey → 表示文字列。未指定なら labelKey をそのまま aria-label に使う */
  resolveLabel?: (labelKey: string) => string
}

/**
 * CURail — Principal Layout left edge の Rail System
 * (docs/design/principal-layout.md §5)
 *
 * Rail column (アイコン縦列) + peek panel (選択中 Rail の中身)。`<CUEdgeShell>` の
 * `leftEdge` に入れて使う。
 *
 * 設計 (PL-3〜PL-5):
 * - registry は **app 供給** — `<CURail registry={APP_RAILS} />`。
 * - 選択中 Rail = route が唯一の SSOT。`selectRailId` (最長 prefix 一致) で導出し、
 *   click 由来の別 signal は持たない。icon click は consumer の navigate を呼ぶだけ。
 * - peek = collapsed (0) ⇄ expanded (240px)。選択中 Rail が在れば expanded。
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

  return (
    <div class={styles.rail} data-region="leftEdge">
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
      <div class={styles.peek} data-expanded={expanded() ? 'true' : 'false'}>
        <Show when={selected()}>{(rail) => <Dynamic component={rail().peek} />}</Show>
      </div>
    </div>
  )
}
