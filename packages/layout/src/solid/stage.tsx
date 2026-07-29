/**
 * PaneStage — resolved を DOM に写す reference 実装（LE-P1、action 層）。
 *
 * - **DOM 安定（LE-10）**: pane ごとの host div は一度だけ作られ、以後 reparent しない。
 *   配置は left/top/width/height（0..1 → %）の座標変更のみ。resolved に居ない pane も
 *   host は unmount せず面積 0 で保持する（xterm 等の再生成不可 content を守る契約）
 * - **契約**: `panes` の各要素は referentially stable に保つこと（`<For>` が参照で key するため、
 *   毎 render で PaneRef を作り直すと host が再生成され LE-10 が破れる）
 * - **motion なし**: 配置変更は即時反映（jump）。時間を持つのは driver（LE-P3）で、
 *   ここに transition を書かない — scrub は呼び手が interpolate 済みの resolved を渡す
 * - float は z-index = attention 順で tiled の上に重なり、`onFloatMove` があれば drag で
 *   ephemeral 移動できる（engine.moveFloat への配線は consumer）
 */

import type { JSX } from 'solid-js'
import { For, onCleanup } from 'solid-js'
import type { PaneRef, ResolvedMap, ResolvedPane } from '../types'

export interface FloatMovePosition {
  readonly x: number
  readonly y: number
}

export interface PaneStageProps {
  /** 表示する配置（engine の購読値、または interpolate 済みの中間 frame） */
  resolved: ResolvedMap
  /** 何が存在するか（consumer 供給、LE-11/12）。要素は referentially stable に */
  panes: readonly PaneRef[]
  /** pane の中身。pane ごとに一度だけ呼ばれる（host の中で生き続ける） */
  renderPane: (pane: PaneRef) => JSX.Element
  /** floating pane の drag 移動（省略 = drag 無効）。pos は左上 0..1 */
  onFloatMove?: (id: string, pos: FloatMovePosition) => void
  class?: string
}

/** resolved に居ない pane の描画（面積 0・不可視。host は保持する） */
const ABSENT: ResolvedPane = {
  rect: { x: 0, y: 0, w: 0, h: 0 },
  attention: 0,
  floating: false,
}

export function PaneStage(props: PaneStageProps): JSX.Element {
  let stageEl: HTMLDivElement | undefined

  // drag 中の listener を追跡し、途中 unmount でも必ず剥がす（listener leak 対策）
  let activeDragCleanup: (() => void) | null = null
  onCleanup(() => activeDragCleanup?.())

  const startFloatDrag = (pane: PaneRef, ev: PointerEvent) => {
    const onFloatMove = props.onFloatMove
    const current = props.resolved[pane.id]
    if (!onFloatMove || !current?.floating || !stageEl) return
    ev.preventDefault()
    const stageRect = stageEl.getBoundingClientRect()
    if (stageRect.width <= 0 || stageRect.height <= 0) return
    // 掴んだ点と pane 左上のずれを保存（掴んだ場所がそのまま持ち手になる）
    const grabDX = (ev.clientX - stageRect.left) / stageRect.width - current.rect.x
    const grabDY = (ev.clientY - stageRect.top) / stageRect.height - current.rect.y

    const move = (e: PointerEvent) => {
      onFloatMove(pane.id, {
        x: (e.clientX - stageRect.left) / stageRect.width - grabDX,
        y: (e.clientY - stageRect.top) / stageRect.height - grabDY,
      })
    }
    const stop = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', stop)
      activeDragCleanup = null
    }
    activeDragCleanup?.()
    activeDragCleanup = stop
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', stop)
  }

  const paneStyle = (id: string): JSX.CSSProperties => {
    const p = props.resolved[id] ?? ABSENT
    const visible = p.rect.w > 0 && p.rect.h > 0
    return {
      position: 'absolute',
      left: `${p.rect.x * 100}%`,
      top: `${p.rect.y * 100}%`,
      width: `${p.rect.w * 100}%`,
      height: `${p.rect.h * 100}%`,
      opacity: visible ? 1 : 0,
      overflow: 'hidden',
      // float は attention 順で手前（LE-18）。tiled は重ならないので auto でよい
      'z-index': p.floating ? String(100 + Math.round(p.attention * 100)) : 'auto',
      'pointer-events': visible ? 'auto' : 'none',
    }
  }

  return (
    <div
      ref={stageEl}
      class={props.class}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <For each={props.panes}>
        {(pane) => (
          <div
            data-pane-id={pane.id}
            data-floating={props.resolved[pane.id]?.floating ? 'true' : undefined}
            style={paneStyle(pane.id)}
            onPointerDown={(ev) => startFloatDrag(pane, ev)}
          >
            {props.renderPane(pane)}
          </div>
        )}
      </For>
    </div>
  )
}
