/**
 * testkit — property test 用の決定的乱数と Layout 生成器。
 *
 * fast-check 等の依存を足さず、seeded LCG で決定的に回す（失敗 seed が再現可能）。
 * ここは test 補助であり public API ではない（index.ts から export しない）。
 */

import type { Layout } from './types'

/** 決定的 LCG。同じ seed → 同じ列 */
export function lcg(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

export interface RandomLayoutOptions {
  maxColumns?: number
  maxPanesPerColumn?: number
  maxFloats?: number
  /** pane が非表示（raw 0）になる確率 */
  hiddenRatio?: number
}

/** ランダムな Layout（構造 + 場）。id は p0.. / f0.. で衝突しない */
export function randomLayout(rand: () => number, opts: RandomLayoutOptions = {}): Layout {
  const maxColumns = opts.maxColumns ?? 4
  const maxPanes = opts.maxPanesPerColumn ?? 3
  const maxFloats = opts.maxFloats ?? 2
  const hiddenRatio = opts.hiddenRatio ?? 0.25

  const columns: { panes: string[] }[] = []
  const attention: Record<string, number> = {}
  let serial = 0

  const nColumns = 1 + Math.floor(rand() * maxColumns)
  for (let c = 0; c < nColumns; c++) {
    const nPanes = 1 + Math.floor(rand() * maxPanes)
    const panes: string[] = []
    for (let p = 0; p < nPanes; p++) {
      const id = `p${serial++}`
      panes.push(id)
      attention[id] = rand() < hiddenRatio ? 0 : 0.05 + rand() * 0.95
    }
    columns.push({ panes })
  }

  const nFloats = Math.floor(rand() * (maxFloats + 1))
  for (let f = 0; f < nFloats; f++) {
    attention[`f${f}`] = 0.05 + rand() * 0.95
  }

  return { structure: { columns }, attention }
}
