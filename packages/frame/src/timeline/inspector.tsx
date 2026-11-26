/**
 * <TimelineInspector> — Clip の木を時間軸として見せる (動画編集ソフトのタイムラインの形)。
 *
 * 1 行 = 1 clip。帯 = その clip が全体の t のどこで動くか (絶対区間)、帯の中の塗り = clip 自身の t。
 * 縦線 = いまの t。flattenClip / createTimeline の clips をそのまま描くだけで、状態は持たない。
 * onSeek を渡すと、時間軸の上をドラッグして t を動かせる。
 * onPlace を渡すと、帯をドラッグして親の置き場 (at) を直せる — 両端で伸び縮み、真ん中で平行移動。
 * 調整が親の時間軸に集まる。受け取った at は setPlacement で木に書き戻す。
 *
 * イベントは ref で要素に直接付ける (addEventListener)。Solid の onPointer* は document への委譲になり、
 * その登録がモジュールの読み込み時に走るので、DOM の無い環境 (SSR / test) で import だけで落ちる。
 *
 * 見た目は creo-ui の token (--color-* / --spacing-* / --typography-*) に乗る。token が無くても読める既定値つき。
 */

import type { JSX } from '@solidjs/web'
import { For } from 'solid-js'
import { type DragHandle, dragPlacement, type FlatClip, localT } from './clip'

export interface TimelineInspectorProps {
  clips: readonly FlatClip[]
  /** いまの t (0 → 1) */
  t: number
  /** 時間軸をドラッグしたとき。省くと見るだけ */
  onSeek?: (t: number) => void
  /** 帯をドラッグしたとき (key = 置き場、at = 親の t の上の新しい区間)。省くと帯は動かない */
  onPlace?: (key: string, at: [number, number]) => void
  /** 帯のドラッグの目盛り、default 0.01 */
  step?: number
  /** 名前の列の幅、default '140px' */
  labelWidth?: string
  class?: string
}

const BRAND = 'var(--color-brand-primary, #6b7cff)'

const S = {
  root: { display: 'grid', gap: '6px', 'user-select': 'none' },
  row: (labelWidth: string): JSX.CSSProperties => ({
    display: 'grid',
    'grid-template-columns': `${labelWidth} 1fr 48px`,
    'align-items': 'center',
    gap: 'var(--spacing-s, 8px)',
    'font-size': 'var(--typography-size-xs, 12px)',
  }),
  label: (depth: number): JSX.CSSProperties => ({
    'padding-inline-start': `${depth * 14}px`,
    color: 'var(--color-text-secondary, #888)',
    overflow: 'hidden',
    'text-overflow': 'ellipsis',
    'white-space': 'nowrap',
  }),
  track: {
    position: 'relative',
    height: '14px',
    background: 'var(--color-surface-bg-subtle, rgb(127 127 127 / 0.12))',
    'border-radius': '4px',
  },
  window: {
    position: 'absolute',
    top: '0',
    bottom: '0',
    background: `color-mix(in oklab, ${BRAND} 15%, transparent)`,
    border: `1px solid color-mix(in oklab, ${BRAND} 40%, transparent)`,
    'border-radius': '4px',
    overflow: 'hidden',
    'box-sizing': 'border-box',
  },
  fill: {
    height: '100%',
    background: `color-mix(in oklab, ${BRAND} 45%, transparent)`,
  },
  edge: {
    position: 'absolute',
    top: '0',
    bottom: '0',
    width: '6px',
    cursor: 'col-resize',
    background: `color-mix(in oklab, ${BRAND} 70%, transparent)`,
  },
  cursor: {
    position: 'absolute',
    top: '-3px',
    bottom: '-3px',
    width: '2px',
    'margin-inline-start': '-1px',
    background: 'var(--color-text-primary, currentColor)',
    'pointer-events': 'none',
  },
  value: {
    'text-align': 'end',
    'font-family': 'var(--typography-family-mono, monospace)',
  },
} satisfies Record<string, JSX.CSSProperties | ((...args: never[]) => JSX.CSSProperties)>

const pct = (v: number): string => `${v * 100}%`

interface BandDrag {
  key: string
  handle: DragHandle
  at: readonly [number, number]
  x: number
  /** 1 px が親の t のいくつに当たるか */
  perPx: number
}

/** 絶対区間を、親の区間に対する at に戻す */
const relativeAt = (c: FlatClip): [number, number] => {
  const len = c.parentEnd - c.parentStart
  if (len <= 0) return [0, 1]
  return [(c.start - c.parentStart) / len, (c.end - c.parentStart) / len]
}

export function TimelineInspector(props: TimelineInspectorProps): JSX.Element {
  // ドラッグ中の track (行をまたいでも、掴んだ track の幅で t を読む)
  let grabbed: HTMLElement | undefined
  let band: BandDrag | undefined

  const seekFrom = (e: PointerEvent, track: HTMLElement): void => {
    const r = track.getBoundingClientRect()
    if (r.width <= 0) return
    props.onSeek?.(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)))
  }

  const onDown = (e: PointerEvent): void => {
    if (!props.onSeek) return
    grabbed = e.currentTarget as HTMLElement
    grabbed.setPointerCapture?.(e.pointerId)
    seekFrom(e, grabbed)
  }
  const onMove = (e: PointerEvent): void => {
    if (band) {
      const at = dragPlacement(
        band.handle,
        band.at,
        (e.clientX - band.x) * band.perPx,
        props.step ?? 0.01,
      )
      props.onPlace?.(band.key, at)
      return
    }
    if (grabbed) seekFrom(e, grabbed)
  }
  const onUp = (): void => {
    grabbed = undefined
    band = undefined
  }

  /** 帯 (handle = 掴んだ所) のドラッグを始める。track の seek には渡さない。row はイベントの時点で読む (Index は行を使い回す) */
  const grabBand =
    (row: () => FlatClip, handle: DragHandle) =>
    (e: PointerEvent): void => {
      const c = row()
      if (!props.onPlace || c.depth === 0) return
      e.stopPropagation()
      const track = (e.currentTarget as HTMLElement).closest<HTMLElement>('[data-track]')
      const width = track?.getBoundingClientRect().width ?? 0
      const parentLen = c.parentEnd - c.parentStart
      if (!track || width <= 0 || parentLen <= 0) return
      band = { key: c.key, handle, at: relativeAt(c), x: e.clientX, perPx: 1 / width / parentLen }
      track.setPointerCapture?.(e.pointerId)
    }

  return (
    <div class={props.class} style={S.root} data-timeline-inspector="">
      {/* For keyed={false}: 置き直すたびに clips は作り直されるが、行の DOM は保つ (ドラッグ中の pointer capture を失わない) */}
      <For each={props.clips} keyed={false}>
        {(c) => {
          const local = (): number => localT(props.t, c().start, c().end)
          const movable = (): boolean => !!props.onPlace && c().depth > 0
          return (
            <div style={S.row(props.labelWidth ?? '140px')} data-clip={c().key}>
              <span style={S.label(c().depth)} title={c().clip.label ?? c().key}>
                {c().clip.label ?? c().key}
              </span>
              <div
                ref={(el) => {
                  el.addEventListener('pointerdown', onDown)
                  el.addEventListener('pointermove', onMove)
                  el.addEventListener('pointerup', onUp)
                  el.addEventListener('pointercancel', onUp)
                }}
                data-track=""
                style={{
                  ...S.track,
                  cursor: props.onSeek ? 'ew-resize' : 'default',
                }}
              >
                <div
                  ref={(el) => {
                    el.addEventListener('pointerdown', grabBand(c, 'move'))
                  }}
                  data-band=""
                  style={{
                    ...S.window,
                    left: pct(c().start),
                    width: pct(c().end - c().start),
                    cursor: movable() ? 'grab' : 'inherit',
                  }}
                >
                  <div style={{ ...S.fill, width: pct(local()) }} />
                  {movable() && (
                    <>
                      <div
                        ref={(el) => {
                          el.addEventListener('pointerdown', grabBand(c, 'start'))
                        }}
                        data-edge="start"
                        style={{ ...S.edge, left: '0' }}
                      />
                      <div
                        ref={(el) => {
                          el.addEventListener('pointerdown', grabBand(c, 'end'))
                        }}
                        data-edge="end"
                        style={{ ...S.edge, right: '0' }}
                      />
                    </>
                  )}
                </div>
                <div style={{ ...S.cursor, left: pct(props.t) }} />
              </div>
              <code style={S.value}>{local().toFixed(2)}</code>
            </div>
          )
        }}
      </For>
    </div>
  )
}
