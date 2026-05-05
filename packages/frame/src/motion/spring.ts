/**
 * Spring physics — Hooke's law による damped harmonic oscillator simulation。
 *
 * Web Animations API の `linear(...)` syntax (Chrome 113+ / Safari 17+) を使って
 * spring を任意 keyframe 列で表現。 cubic-bezier では表現できない overshoot
 * (bouncy) を表現可能。
 *
 * https://en.wikipedia.org/wiki/Damped_oscillator
 */

export interface SpringOptions {
  /** Stiffness (spring 定数 k)、 default 280 */
  stiffness?: number
  /** Damping (粘性定数 c)、 default 20 */
  damping?: number
  /** Mass (質量 m)、 default 1 */
  mass?: number
  /** Initial velocity v0、 default 0 */
  initialVelocity?: number
  /** 安定とみなす閾値 (|x - 1| < precision)、 default 0.001 */
  precision?: number
  /** Sample 数 (linear() に出す keyframe 数)、 default 60 */
  samples?: number
}

/**
 * Spring を Web Animations API の `linear(...)` easing 文字列に変換。
 *
 * @example
 * const easing = springEasing({ stiffness: 280, damping: 20 })
 * el.animate([...], { duration: 400, easing })
 */
export function springEasing(options: SpringOptions = {}): string {
  const k = options.stiffness ?? 280
  const c = options.damping ?? 20
  const m = options.mass ?? 1
  const v0 = options.initialVelocity ?? 0
  const precision = options.precision ?? 0.001
  const samples = options.samples ?? 60

  const positionAt = positionFn(k, c, m, v0)
  const settleTime = findSettleTime(positionAt, precision)

  // Sample positionAt から linear() の keyframe 列を作る
  // linear() syntax: linear(0, 0.1, 0.3, ..., 1) — 等間隔 sample
  const points: number[] = []
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * settleTime
    points.push(positionAt(t))
  }

  // 最終値は 1 に丸める (overshoot 残存対策)
  points[points.length - 1] = 1

  return `linear(${points.map((p) => p.toFixed(4)).join(', ')})`
}

/**
 * Spring から position(t) (∈ [0, 1] 近傍) を返す関数を構築。
 *
 * 解析解:
 *   - underdamped (ζ < 1):  x(t) = 1 - e^(-ζω_n t) (cos(ω_d t) + (...)/ω_d sin(ω_d t))
 *   - critically/over (ζ ≥ 1):  x(t) = 1 - e^(-ω_n t) (1 + ω_n t)  (critical の近似形)
 */
function positionFn(k: number, c: number, m: number, v0: number): (t: number) => number {
  const omegaN = Math.sqrt(k / m) // 自然角周波数
  const zeta = c / (2 * Math.sqrt(k * m)) // 減衰比

  if (zeta < 1) {
    // underdamped — 振動あり
    const omegaD = omegaN * Math.sqrt(1 - zeta * zeta)
    return (t: number) => {
      const e = Math.exp(-zeta * omegaN * t)
      const cosTerm = Math.cos(omegaD * t)
      const sinTerm = ((zeta * omegaN + v0) / omegaD) * Math.sin(omegaD * t)
      return 1 - e * (cosTerm + sinTerm)
    }
  }

  // critically-damped or overdamped (近似)
  return (t: number) => {
    const e = Math.exp(-omegaN * t)
    return 1 - e * (1 + omegaN * t)
  }
}

/**
 * |x(t) - 1| < precision を満たす最小 t を二分探索 + 連続性確認で求める。
 *
 * 上限 10 秒で打ち切り (それ以上は spring パラメータが極端、 lib 異常値返却で気付く)。
 */
function findSettleTime(position: (t: number) => number, precision: number): number {
  const maxTime = 10
  const dt = 1 / 120 // 120 FPS sample

  for (let t = 0; t <= maxTime; t += dt) {
    const x = position(t)
    if (Math.abs(x - 1) < precision) {
      // 安定確認 — 100ms 後も precision 内に居るか check
      const stillStable = Math.abs(position(t + 0.1) - 1) < precision
      if (stillStable) return t
    }
  }
  return 1.5 // fallback
}
