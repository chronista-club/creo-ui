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
  /** 列幅 lock（LE-21）が 1 つ付く確率 */
  lockRatio?: number
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

  // 列幅 lock（LE-21）も確率で混ぜ、property test の網に入れる。
  // 1〜2 箇所 × 値域 0.1..0.9 で、複数 lock・過剰 lock（Σ > 1）の分岐も踏む
  const lockRatio = opts.lockRatio ?? 0.3
  const members = columns.flatMap((c) => c.panes)
  if (members.length > 0 && rand() < lockRatio) {
    const locks: Record<string, number> = {}
    const n = 1 + Math.floor(rand() * 2)
    for (let i = 0; i < n; i++) {
      const target = members[Math.floor(rand() * members.length)] as string
      locks[target] = 0.1 + rand() * 0.8
    }
    return { structure: { columns }, attention, locks }
  }

  return { structure: { columns }, attention }
}
