/**
 * interpolate — 唯一の遷移 primitive（LE-7）。
 *
 * 時間は protocol の外: t を与えるのは driver（time / hand / jump）。
 * reduced-motion は「jump driver の選択」に落ち、ここには分岐が無い。
 *
 * 端点に居ない pane は「相手側 rect の中心で面積 0」へ収束 — 消える動きも
 * 現れる動きも同じ規則（非表示 = 所属位置で 0 収束、と同じ幾何）。
 */

import type { Rect, ResolvedMap, ResolvedPane } from './types'

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/** rect の中心に面積 0 で潰した rect（欠員側の合成端点） */
function collapse(rect: Rect): Rect {
  return { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, w: 0, h: 0 }
}

function ghostOf(present: ResolvedPane): ResolvedPane {
  return { rect: collapse(present.rect), attention: 0, floating: present.floating }
}

export function interpolate(a: ResolvedMap, b: ResolvedMap, t: number): ResolvedMap {
  // NaN（duration 0 の time driver の 0/0 等）は jump（t = 1）に倒す —
  // Math.min/max は NaN を素通しするため明示ガードが要る
  const clamped = Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 1
  // 端点は正確に一致させる（property: interpolate(A, B, 0) = A / (…, 1) = B）
  if (clamped === 0) return a
  if (clamped === 1) return b

  const out: Record<string, ResolvedPane> = {}
  const ids = new Set([...Object.keys(a), ...Object.keys(b)])
  for (const id of ids) {
    const fromB = b[id]
    const fromA = a[id]
    const pa = fromA ?? ghostOf(fromB as ResolvedPane)
    const pb = fromB ?? ghostOf(fromA as ResolvedPane)
    out[id] = {
      rect: {
        x: lerp(pa.rect.x, pb.rect.x, clamped),
        y: lerp(pa.rect.y, pb.rect.y, clamped),
        w: lerp(pa.rect.w, pb.rect.w, clamped),
        h: lerp(pa.rect.h, pb.rect.h, clamped),
      },
      attention: lerp(pa.attention, pb.attention, clamped),
      floating: clamped < 0.5 ? pa.floating : pb.floating,
    }
  }
  return out
}
