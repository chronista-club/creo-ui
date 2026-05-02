/**
 * One-Euro Filter — adaptive low-pass filter for noisy continuous input。
 *
 * Casiez, Roussel, Vogel (CHI 2012): "1€ Filter: A Simple Speed-based Low-pass
 * Filter for Noisy Input in Interactive Systems"。 hand-tracking / mouse / face
 * tracking smoothing の事実上の標準。
 *
 * 仕組み: 通常の low-pass は cutoff frequency が固定で、 「滑らか / 反応速い」
 * のトレードオフを抱える。 One-Euro は **速度に応じて cutoff を adaptive に
 * 上げ下げ** することで両得 — 停止時は強 smoothing (jitter 除去)、 高速時は弱
 * smoothing (lag 抑制)。
 *
 * 2 knob:
 * - `minCutoff` (Hz): 停止時の cutoff。 小さいほど smooth。 default 1.0
 * - `beta`: 速度に応じた cutoff の上げ幅。 大きいほど fast move 時に追従。 default 0.0
 *
 * 推奨初期値 (hand tracking): minCutoff=1.0, beta=0.0、 jitter 強い場合 minCutoff
 * を 0.5 に下げる、 lag 気になる場合 beta を 0.05 程度上げる。
 */

export class OneEuroFilter {
  private prev: number | null = null
  private prevDeriv = 0
  private prevTime: number | null = null

  constructor(
    private minCutoff = 1.0,
    private beta = 0.0,
    private dCutoff = 1.0,
  ) {}

  /** Filter a value at given timestamp (ms epoch or performance.now)。 */
  filter(value: number, timestamp: number): number {
    if (this.prev === null || this.prevTime === null) {
      this.prev = value
      this.prevTime = timestamp
      return value
    }
    const dt = (timestamp - this.prevTime) / 1000 // → seconds
    if (dt <= 0) return this.prev // guard against duplicate timestamps

    // Smooth the derivative (velocity estimate)
    const rawDeriv = (value - this.prev) / dt
    const dAlpha = this.smoothingFactor(this.dCutoff, dt)
    const smoothedDeriv = dAlpha * rawDeriv + (1 - dAlpha) * this.prevDeriv

    // Adaptive cutoff scales with velocity magnitude
    const cutoff = this.minCutoff + this.beta * Math.abs(smoothedDeriv)
    const alpha = this.smoothingFactor(cutoff, dt)
    const smoothed = alpha * value + (1 - alpha) * this.prev

    this.prev = smoothed
    this.prevDeriv = smoothedDeriv
    this.prevTime = timestamp
    return smoothed
  }

  /** Reset filter state — call when input stream restarts (e.g. webcam re-enabled)。 */
  reset(): void {
    this.prev = null
    this.prevDeriv = 0
    this.prevTime = null
  }

  /** RC low-pass smoothing factor: α = 1 / (1 + τ/dt) where τ = 1/(2π·cutoff)。 */
  private smoothingFactor(cutoff: number, dt: number): number {
    const tau = 1 / (2 * Math.PI * cutoff)
    return 1 / (1 + tau / dt)
  }
}

/** 3D point smoother — 3 個の OneEuroFilter を grouping。 */
export class Point3DSmoother {
  private fx: OneEuroFilter
  private fy: OneEuroFilter
  private fz: OneEuroFilter

  constructor(minCutoff = 1.0, beta = 0.0) {
    this.fx = new OneEuroFilter(minCutoff, beta)
    this.fy = new OneEuroFilter(minCutoff, beta)
    this.fz = new OneEuroFilter(minCutoff, beta)
  }

  filter(p: { x: number; y: number; z: number }, timestamp: number): {
    x: number
    y: number
    z: number
  } {
    return {
      x: this.fx.filter(p.x, timestamp),
      y: this.fy.filter(p.y, timestamp),
      z: this.fz.filter(p.z, timestamp),
    }
  }

  reset(): void {
    this.fx.reset()
    this.fy.reset()
    this.fz.reset()
  }
}

/** Smoothing options for vision input。 */
export interface SmoothingOptions {
  /** Enable smoothing — default true */
  enabled?: boolean
  /**
   * 停止時の cutoff frequency (Hz)。 default 1.0。
   * 小さいほど strong smoothing (jitter 除去だが lag 増)。
   * 微小ブレが気になる場合は 0.5、 reactive にしたい場合は 2.0+ 試す。
   */
  minCutoff?: number
  /**
   * 速度に応じた cutoff 増加量。 default 0.0 (uniform smoothing)。
   * fast move 時の lag が気になる場合は 0.01 〜 0.1 程度に上げる。
   */
  beta?: number
  /**
   * Sensitivity / range compression。 default 1.0 (no scaling)。
   * `out.x = 0.5 + (in.x - 0.5) * gain` で center 周辺に圧縮。
   * 0.7 ぐらいにすると腕の小さな振りで画面全域に届く。
   */
  gain?: number
}

/** Apply gain (range compression around center 0.5)。 */
export function applyGain(value: number, gain: number, center = 0.5): number {
  return center + (value - center) * gain
}
