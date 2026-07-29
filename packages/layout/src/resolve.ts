/**
 * resolve — normalize の再帰適用（LE-6）。純 calculation、DOM を知らない。
 *
 * 「兄弟集合内で場を正規化する」1 つの演算の再帰適用:
 *   レベル 1（row）  : 列の実効 attention（max 集約）を正規化 → 幅
 *   レベル 2（column）: pane の attention を正規化 → 高さ
 *
 * - attention = 0 は正規化から除外（0 = 非表示、LE-3 の 2 規則の 1 つ目）
 * - 非表示の所属 pane は所属位置で面積 0 の rect（morph の収束先）
 * - floating（構造非所属 × attention > 0）は tiled の正規化に参加せず中央に浮く（LE-18）
 * - taper: attention → 面積の知覚写像（既定 = 恒等。曲線は token / dogfood で決める）
 * - viewport 引数なしの純形（content negotiation 延期に伴う、LE-8）
 */

import { memberIds } from './structure'
import type { Layout, ResolvedMap, ResolvedPane } from './types'

export interface ResolveOptions {
  /** 知覚テーパー。taper(x) > 0 for x > 0 を要求（0 の扱いは resolve が持つ） */
  taper?: (raw: number) => number
}

const identity = (n: number): number => n

export function resolve(layout: Layout, options: ResolveOptions = {}): ResolvedMap {
  const taper = options.taper ?? identity
  const att = layout.attention

  /**
   * 実効 attention: 0 は 0 のまま（taper は正値にのみ適用）。
   * 非有限（NaN / Infinity）は 0 = 非表示に倒す — 壊れた値は「何も描かない」に落とし、
   * xCursor 経由で兄弟の座標を汚染させない（MCP propose 等、gesture を経ない入力経路がある）
   */
  const eff = (id: string): number => {
    const raw = att[id] ?? 0
    if (!Number.isFinite(raw) || raw <= 0) return 0
    const tapered = taper(raw)
    return Number.isFinite(tapered) && tapered > 0 ? tapered : 0
  }

  const members = new Set(memberIds(layout.structure))

  // share の分母 = 全可視 pane（tiled + floating）の実効値合計。非可視は eff = 0 で自然に落ちる
  let globalSum = 0
  for (const id of Object.keys(att)) {
    globalSum += eff(id)
  }

  // 列の実効 attention（max 集約 — 列の幅はその列で一番見たいものが決める、OQ-1）
  const colEffs = layout.structure.columns.map((col) =>
    col.panes.reduce((m, p) => Math.max(m, eff(p)), 0),
  )

  // 列幅 lock（LE-21）: 列内 pane の lock の最大値。可視列にのみ効く（不可視・非所属は休眠）
  const locks = layout.locks ?? {}
  const colLocks = layout.structure.columns.map((col, ci) => {
    if ((colEffs[ci] ?? 0) <= 0) return 0
    return col.panes.reduce((m, p) => {
      const v = locks[p] ?? 0
      return Number.isFinite(v) && v > 0 ? Math.max(m, Math.min(v, 1)) : m
    }, 0)
  })
  const lockSumRaw = colLocks.reduce((s, v) => s + v, 0)
  const unlockedEffSum = colEffs.reduce((s, v, ci) => ((colLocks[ci] ?? 0) > 0 ? s : s + v), 0)
  // 幅和 = 1 を常に保つ: 過剰 lock は比例縮小（unlocked は 0 幅まで潰れうる）、
  // locked しか可視で無ければ正規化して埋める
  const lockScale =
    lockSumRaw <= 0 ? 0 : unlockedEffSum > 0 ? Math.min(1, 1 / lockSumRaw) : 1 / lockSumRaw
  const remaining = Math.max(0, 1 - lockSumRaw * lockScale)

  const out: Record<string, ResolvedPane> = {}

  // tiled 層
  let xCursor = 0
  layout.structure.columns.forEach((col, ci) => {
    const colEff = colEffs[ci] ?? 0
    const visible = colEff > 0
    const colLock = (colLocks[ci] ?? 0) * lockScale
    const colW = !visible
      ? 0
      : colLock > 0
        ? colLock
        : unlockedEffSum > 0
          ? remaining * (colEff / unlockedEffSum)
          : 0
    const colX = xCursor
    const sumH = col.panes.reduce((s, p) => s + eff(p), 0)
    let yCursor = 0
    for (const p of col.panes) {
      const e = eff(p)
      if (e > 0 && sumH > 0) {
        const h = e / sumH
        out[p] = {
          rect: { x: colX, y: yCursor, w: colW, h },
          attention: globalSum > 0 ? e / globalSum : 0,
          floating: false,
        }
        yCursor += h
      } else {
        // 非表示: 所属位置で面積 0 に収束（LE-3 / interpolate の収束先）
        out[p] = {
          rect: { x: colX, y: yCursor, w: visible ? colW : 0, h: 0 },
          attention: 0,
          floating: false,
        }
      }
    }
    xCursor += colW
  })

  // floating 層（構造非所属 × attention > 0。非所属 × 0 = 外なので emit しない）
  for (const id of Object.keys(att)) {
    if (members.has(id)) continue
    const e = eff(id)
    if (e <= 0) continue
    const share = globalSum > 0 ? e / globalSum : 0
    const size = Math.min(1, share)
    out[id] = {
      rect: { x: (1 - size) / 2, y: (1 - size) / 2, w: size, h: size },
      attention: share,
      floating: true,
    }
  }

  return out
}
