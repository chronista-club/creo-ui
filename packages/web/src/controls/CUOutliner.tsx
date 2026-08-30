import { type Component, createMemo, createSignal, For, type JSX, splitProps } from 'solid-js'
import {
  createNodeId,
  type FlatRow,
  flattenVisible,
  indent,
  insertSiblingAfter,
  moveDown,
  moveUp,
  nextVisibleId,
  type OutlinerNode,
  outdent,
  prevVisibleId,
  removeNode,
  setText,
  toggleCollapsed,
} from './outliner-tree'

export type { FlatRow, OutlinerNode } from './outliner-tree'

export type CUOutlinerVariant = 'plain' | 'card'

export interface CUOutlinerProps
  extends Omit<JSX.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  /** controlled — 指定すると木の所有権は consumer 側。 onChange と対で使う */
  nodes?: OutlinerNode[]
  /** uncontrolled の初期値。 nodes 未指定のときだけ効く */
  defaultNodes?: OutlinerNode[]
  /** 木が変わるたびに呼ばれる (controlled / uncontrolled どちらでも発火) */
  onChange?: (nodes: OutlinerNode[]) => void
  /** 行の見た目。 'card' は Item を面として立てる */
  variant?: CUOutlinerVariant
  /** インデントの縦ガイド線を出す */
  guides?: boolean
  /** 空行の placeholder */
  placeholder?: string
  /** 右端 slot。 未指定なら node.meta を文字列として出す */
  renderMeta?: (node: OutlinerNode) => JSX.Element
  /** 末尾の「＋ 追加」を出す (default: true) */
  showAdd?: boolean
  /** 「＋ 追加」の文言 */
  addLabel?: string
}

/**
 * CUOutliner — creo-ui の Outliner primitive (controls layer)
 *
 * `outliner.css` (.creo-outliner + data-variant / --outliner-depth) を wrap し、
 * 「思い立った時に足せる」ための keyboard grammar を載せた SolidJS component。
 *
 *   Enter      同じ深さに新しい行
 *   Tab        1 段深く / Shift+Tab  1 段浅く
 *   ↑ ↓        行間を移動
 *   ⌥↑ ⌥↓      行ごと上下に入れ替え
 *   Backspace  空行を削って上へ (子を持つ行は消さない)
 *   ▸ click    折りたたみ
 *
 * 設計:
 * - 木の書き換えは `outliner-tree.ts` の純関数に委譲し、 ここは「入力 → 操作 →
 *   focus 移動」の配線だけを持つ。 操作が成立しなかった時 (先頭行の Tab 等) は
 *   純関数が同一参照を返すので、 `next === prev` で focus 移動を抑止できる。
 * - controlled / uncontrolled 両対応。 `nodes` を渡せば consumer が所有権を持ち、
 *   渡さなければ内部 signal が持つ (どちらでも onChange は発火する)。
 * - DOM は flat + `role="tree"` / `aria-level`。 深さは inline の `--outliner-depth`
 *   で CSS に渡す (outliner.css 参照)。
 *
 * 既知の a11y 課題 (2026-08-30、Biome 2 の useFocusableInteractive が検出):
 *   `role="treeitem"` を持つ行 `<div>` は focusable でない。 実際に focus を受けるのは
 *   行内の `<input>` で、 keyboard 操作 (Tab / 矢印 / Enter) もそこに実装されている。
 *   **div に tabindex を足す修正は誤り** — Tab が行と input で 2 回止まり操作性が落ちる。
 *   正しくは WAI-ARIA tree pattern に沿って role と focus の所在を一致させる必要があるが、
 *   input の暗黙 role (textbox) と treeitem の両立は設計判断を伴うため別途扱う。
 *   それまで biome.json で `a11y/useFocusableInteractive` を off にしている。
 *
 * Usage:
 *   <CUOutliner defaultNodes={[{ id: '1', text: '思いついたこと' }]} onChange={save} />
 *   <CUOutliner nodes={nodes()} onChange={setNodes} variant="card" guides />
 */
export const CUOutliner: Component<CUOutlinerProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'nodes',
    'defaultNodes',
    'onChange',
    'variant',
    'guides',
    'placeholder',
    'renderMeta',
    'showAdd',
    'addLabel',
    'class',
  ])

  const [internal, setInternal] = createSignal<OutlinerNode[]>(local.defaultNodes ?? [])
  // controlled なら props、 uncontrolled なら内部 signal。 props.nodes の有無で毎回判定するので
  // 途中で controlled に切り替わっても追従する。
  const nodes = (): OutlinerNode[] => local.nodes ?? internal()
  const rows = createMemo<FlatRow[]>(() => flattenVisible(nodes()))

  /** 木を差し替える。 同一参照 (= 操作が成立しなかった) なら false を返す */
  const commit = (next: OutlinerNode[]): boolean => {
    if (next === nodes()) return false
    if (local.nodes === undefined) setInternal(next)
    local.onChange?.(next)
    return true
  }

  /** 行の input に focus を移す。 描画の後に走らせる必要があるので queueMicrotask 越し */
  const focusRow = (id: string, caret: 'start' | 'end' = 'end') => {
    queueMicrotask(() => {
      const el = document.querySelector<HTMLInputElement>(
        `[data-creo-outliner-row="${CSS.escape(id)}"] .creo-outliner-text`,
      )
      if (!el) return
      el.focus()
      const pos = caret === 'start' ? 0 : el.value.length
      el.setSelectionRange(pos, pos)
    })
  }

  const onKeyDown = (event: KeyboardEvent, row: FlatRow) => {
    const id = row.node.id
    const meta = event.altKey || event.metaKey

    switch (event.key) {
      case 'Enter': {
        event.preventDefault()
        const created: OutlinerNode = { id: createNodeId(), text: '' }
        if (commit(insertSiblingAfter(nodes(), id, created))) focusRow(created.id)
        return
      }
      case 'Tab': {
        event.preventDefault()
        commit(event.shiftKey ? outdent(nodes(), id) : indent(nodes(), id))
        // 木が変わっても同じ行を触り続けたいので focus は戻す (深さだけが変わる)
        focusRow(id)
        return
      }
      case 'ArrowUp': {
        if (meta) {
          event.preventDefault()
          if (commit(moveUp(nodes(), id))) focusRow(id)
          return
        }
        const prev = prevVisibleId(nodes(), id)
        if (prev) {
          event.preventDefault()
          focusRow(prev)
        }
        return
      }
      case 'ArrowDown': {
        if (meta) {
          event.preventDefault()
          if (commit(moveDown(nodes(), id))) focusRow(id)
          return
        }
        const next = nextVisibleId(nodes(), id)
        if (next) {
          event.preventDefault()
          focusRow(next)
        }
        return
      }
      case 'Backspace': {
        // 文字が残っている / caret が先頭でない間は通常の削除に任せる
        const input = event.currentTarget as HTMLInputElement
        if (input.value !== '' || input.selectionStart !== 0) return
        const prev = prevVisibleId(nodes(), id)
        if (commit(removeNode(nodes(), id))) {
          event.preventDefault()
          if (prev) focusRow(prev)
        }
        return
      }
    }
  }

  const appendRow = () => {
    const created: OutlinerNode = { id: createNodeId(), text: '' }
    const last = rows().at(-1)?.node.id ?? null
    if (commit(insertSiblingAfter(nodes(), last, created))) focusRow(created.id)
  }

  return (
    <div
      class={local.class ? `creo-outliner ${local.class}` : 'creo-outliner'}
      data-variant={local.variant}
      data-guides={local.guides ? '' : undefined}
      role="tree"
      {...rest}
    >
      <For each={rows()}>
        {(row) => (
          <div
            class="creo-outliner-row"
            data-creo-outliner-row={row.node.id}
            data-collapsed={row.node.collapsed ? '' : undefined}
            data-done={row.node.done ? '' : undefined}
            style={{ '--outliner-depth': String(row.depth) }}
            role="treeitem"
            aria-level={row.depth + 1}
            aria-expanded={row.hasChildren ? !row.node.collapsed : undefined}
          >
            <button
              type="button"
              class="creo-outliner-twisty"
              data-placeholder={row.hasChildren ? undefined : ''}
              tabindex={row.hasChildren ? 0 : -1}
              aria-label={row.node.collapsed ? '開く' : '折りたたむ'}
              onClick={() => commit(toggleCollapsed(nodes(), row.node.id))}
            >
              ›
            </button>

            <span class="creo-outliner-bullet" aria-hidden="true">
              •
            </span>

            <input
              class="creo-outliner-text"
              value={row.node.text}
              placeholder={local.placeholder ?? '思いついたことを書く'}
              onInput={(e) => commit(setText(nodes(), row.node.id, e.currentTarget.value))}
              onKeyDown={(e) => onKeyDown(e, row)}
            />

            {local.renderMeta ? (
              <span class="creo-outliner-meta">{local.renderMeta(row.node)}</span>
            ) : (
              row.node.meta && <span class="creo-outliner-meta">{row.node.meta}</span>
            )}
          </div>
        )}
      </For>

      {local.showAdd !== false && (
        <button type="button" class="creo-outliner-add" onClick={appendRow}>
          ＋ {local.addLabel ?? '追加'}
        </button>
      )}
    </div>
  )
}
