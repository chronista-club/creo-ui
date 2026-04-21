/**
 * Color utilities for Creo UI build tooling.
 *
 * OKLCH / sRGB / hex 間の変換と WCAG 計算ヘルパーをまとめる。pure JS、
 * external dep なし。transforms/config.{swift,rust}.js の custom format と
 * scripts/generate-themes.mjs から利用。将来 Phase 2 で packages/web に
 * TS 型付きで再 export する予定。
 *
 * References:
 *   - Björn Ottosson, "A perceptual color space for image processing" (2020)
 *   - W3C WCAG 2.1 §1.4.3 relative luminance & contrast ratio
 */

// ---------- OKLCH / Oklab ----------

/**
 * OKLCH string ("oklch(L C H)" / "oklch(L C H / A)") → { l, c, h, a? }
 * 無効な場合 null を返す。
 */
export function parseOklch(str) {
  if (typeof str !== 'string') return null
  const m = str.match(
    /^\s*oklch\(\s*([-\d.]+(?:e-?\d+)?)\s+([-\d.]+(?:e-?\d+)?)\s+([-\d.]+(?:e-?\d+)?)(?:\s*\/\s*([-\d.]+(?:e-?\d+)?))?\s*\)\s*$/i,
  )
  if (!m) return null
  const result = {
    l: Number.parseFloat(m[1]),
    c: Number.parseFloat(m[2]),
    h: Number.parseFloat(m[3]),
  }
  if (m[4] !== undefined) result.a = Number.parseFloat(m[4])
  return result
}

/** OKLCH → Oklab (同じ空間、ch→ab 変換) */
export function oklchToOklab({ l, c, h }) {
  const hRad = (h * Math.PI) / 180
  return {
    L: l,
    a_: c * Math.cos(hRad),
    b_: c * Math.sin(hRad),
  }
}

/**
 * Oklab → Linear sRGB (Björn Ottosson の逆変換行列)。
 * 返り値は sRGB 空間の [r, g, b]、0-1 範囲の外になり得る (out of gamut)。
 */
export function oklabToLinearSrgb({ L, a_, b_ }) {
  const l_ = L + 0.3963377774 * a_ + 0.2158037573 * b_
  const m_ = L - 0.1055613458 * a_ - 0.0638541728 * b_
  const s_ = L - 0.0894841775 * a_ - 1.291485548 * b_
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

/** Linear sRGB → sRGB (gamma エンコード、0-1 にクランプ) */
export function linearToSrgb(x) {
  const clamped = x <= 0 ? 0 : x >= 1 ? 1 : x
  return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055
}

/** 0-1 float を hex byte (2 桁小文字 16 進) に変換 */
function toByte(x) {
  return Math.round(Math.max(0, Math.min(1, x)) * 255)
    .toString(16)
    .padStart(2, '0')
}

/**
 * OKLCH object → "#rrggbb" (alpha があれば "#rrggbbaa")。
 * gamut 外は sRGB にクランプする (正確な gamut mapping は将来課題)。
 */
export function oklchToHex({ l, c, h, a }) {
  const { L, a_, b_ } = oklchToOklab({ l, c, h })
  const [lr, lg, lb] = oklabToLinearSrgb({ L, a_, b_ })
  const r = linearToSrgb(lr)
  const g = linearToSrgb(lg)
  const b = linearToSrgb(lb)
  const hex = `#${toByte(r)}${toByte(g)}${toByte(b)}`
  if (a !== undefined && a < 1) return hex + toByte(a)
  return hex
}

/** OKLCH string → hex。parse 失敗時は Error を throw */
export function oklchStringToHex(str) {
  const parsed = parseOklch(str)
  if (!parsed) throw new Error(`Invalid OKLCH string: ${JSON.stringify(str)}`)
  return oklchToHex(parsed)
}

/** OKLCH object → [r, g, b] 0-255 */
export function oklchToRgb255({ l, c, h, a }) {
  const [hexR, hexG, hexB] = hexToRgb255(oklchToHex({ l, c, h, a }))
  return [hexR, hexG, hexB]
}

// ---------- Hex / RGB ----------

/** "#rrggbb" or "#rgb" → [r, g, b] 0-255 (alpha は無視) */
export function hexToRgb255(hex) {
  const h = String(hex).replace('#', '')
  const expanded =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h.slice(0, 6)
  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ]
}

/** "#rrggbb" or "#rgb" → [r, g, b] 0-1 (custom format の Swift float に便利) */
export function hexToRgb01(hex) {
  return hexToRgb255(hex).map((v) => v / 255)
}

// ---------- WCAG ----------

/** sRGB [r, g, b] 0-255 → relative luminance 0-1 (WCAG 2.1 §1.4.3) */
export function relativeLuminance([r, g, b]) {
  const linearize = (channel) => {
    const x = channel / 255
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
}

/**
 * 2 色の contrast ratio (WCAG 2.1)。
 * 引数は sRGB [0-255] の配列。1-21 の範囲を返す。
 */
export function contrastRatio(colorA, colorB) {
  const la = relativeLuminance(colorA)
  const lb = relativeLuminance(colorB)
  const bright = Math.max(la, lb)
  const dark = Math.min(la, lb)
  return (bright + 0.05) / (dark + 0.05)
}

/**
 * WCAG compliance level from contrast ratio.
 *   AAA (enhanced normal)        >= 7
 *   AA  (normal)                 >= 4.5
 *   AAlarge (large text / AA+3)  >= 3
 *   それ以下は "fail"
 */
export function wcagLevel(ratio) {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  if (ratio >= 3) return 'AAlarge'
  return 'fail'
}

/** 2 つの OKLCH string 間の contrast ratio (便利 wrapper) */
export function oklchStringContrastRatio(a, b) {
  const rgbA = hexToRgb255(oklchStringToHex(a))
  const rgbB = hexToRgb255(oklchStringToHex(b))
  return contrastRatio(rgbA, rgbB)
}

// ---------- Mixing (Phase 3 theme interpolation 向け) ----------

/**
 * OKLCH 空間で 2 色を補間する (t=0 なら a、t=1 なら b)。
 * 色相は shortest-path で補間。
 */
export function mixOklch(a, b, t) {
  const clamp = Math.max(0, Math.min(1, t))
  // Hue を最短距離で interpolate
  let h1 = a.h
  let h2 = b.h
  const diff = h2 - h1
  if (diff > 180) h1 += 360
  else if (diff < -180) h2 += 360
  return {
    l: a.l + (b.l - a.l) * clamp,
    c: a.c + (b.c - a.c) * clamp,
    h: (h1 + (h2 - h1) * clamp + 360) % 360,
    a: a.a !== undefined && b.a !== undefined ? a.a + (b.a - a.a) * clamp : undefined,
  }
}
