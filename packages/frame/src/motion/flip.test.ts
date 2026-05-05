/**
 * FLIP technique の DOM 介在 test (happy-dom)。
 *
 * el.animate を spy として置換、 keyframes / options の組み立てが正しいか
 * + reduced-motion / no-op detection の short-circuit が機能するか確認。
 * happy-dom の真の playback には依存しない (FLIP の本質は invert + animate
 * 呼び出し、 visual rendering は browser に委ねる)。
 */

import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { flip, measureRect } from './flip'
import { _resetReducedMotionCache } from './reduced-motion'

interface AnimateCall {
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null
  options: KeyframeAnimationOptions | number | undefined
}

/** el.animate を spy に置換、 呼び出し引数を返す helper */
function spyAnimate(el: HTMLElement): { calls: AnimateCall[] } {
  const calls: AnimateCall[] = []
  el.animate = ((
    keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
    options?: KeyframeAnimationOptions | number,
  ) => {
    calls.push({ keyframes, options })
    return { finished: Promise.resolve() } as Animation
  }) as HTMLElement['animate']
  return { calls }
}

describe('measureRect', () => {
  it('returns a DOMRect-like object', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const rect = measureRect(el)
    expect(rect).toBeDefined()
    expect(typeof rect.left).toBe('number')
    expect(typeof rect.top).toBe('number')
  })
})

describe('flip — basic invert + animate', () => {
  beforeEach(() => {
    _resetReducedMotionCache()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('calls animate with translate keyframe matching dx/dy', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const { calls } = spyAnimate(el)

    // happy-dom の real getBoundingClientRect は 0 を返すので、 prev に
    // 偏差を持たせて dx/dy が計算されることを確認
    const prev = { left: 100, top: 50, width: 50, height: 50 } as DOMRect
    const result = flip(el, prev)

    expect(result).not.toBeNull()
    expect(calls.length).toBe(1)
    const keyframes = calls[0]!.keyframes as Keyframe[]
    // first keyframe は inverted transform、 second は identity
    expect(String(keyframes[0]!.transform)).toContain('translate(100px, 50px)')
    expect(String(keyframes[1]!.transform)).toContain('translate(0, 0)')
  })

  it('uses provided duration / easing', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const { calls } = spyAnimate(el)

    const prev = { left: 200, top: 0, width: 100, height: 100 } as DOMRect
    flip(el, prev, { duration: 400, easing: 'in-out' })

    const opts = calls[0]!.options as KeyframeAnimationOptions
    expect(opts.duration).toBe(400)
    expect(String(opts.easing)).toBe('cubic-bezier(0.4, 0, 0.2, 1)')
  })

  it('defaults to duration 220 + spring easing', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const { calls } = spyAnimate(el)

    flip(el, { left: 10, top: 0, width: 50, height: 50 } as DOMRect)

    const opts = calls[0]!.options as KeyframeAnimationOptions
    expect(opts.duration).toBe(220)
    expect(String(opts.easing)).toBe('cubic-bezier(0.2, 0.8, 0.2, 1)')
  })

  it('passes raw cubic-bezier easing through unchanged', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const { calls } = spyAnimate(el)

    const customEasing = 'cubic-bezier(0.123, 0.456, 0.789, 1)'
    flip(el, { left: 10, top: 0, width: 50, height: 50 } as DOMRect, {
      easing: customEasing,
    })

    const opts = calls[0]!.options as KeyframeAnimationOptions
    expect(opts.easing).toBe(customEasing)
  })

  it('returns null and does NOT call animate for no-op (rect identical)', () => {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const { calls } = spyAnimate(el)

    // happy-dom default rect は 0 / 0 / 0 / 0、 prev も同じだと no-op
    const prev = { left: 0, top: 0, width: 0, height: 0 } as DOMRect
    // width 0 は scale 計算で除算 guard が動くので、 ここでは width 持たせる
    const prevSame = { left: 0, top: 0, width: 100, height: 100 } as DOMRect
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => prevSame,
      configurable: true,
    })
    const result = flip(el, prevSame)

    expect(result).toBeNull()
    expect(calls.length).toBe(0)
  })
})

describe('flip — reduced-motion short-circuit', () => {
  beforeEach(() => {
    _resetReducedMotionCache()
  })

  afterEach(() => {
    _resetReducedMotionCache()
    document.body.innerHTML = ''
  })

  it('returns null when prefers-reduced-motion: reduce', () => {
    // matchMedia を mock して reduce を返す
    const originalMM = window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      value: (query: string) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }),
      configurable: true,
    })

    const el = document.createElement('div')
    document.body.appendChild(el)
    const { calls } = spyAnimate(el)

    const result = flip(el, { left: 100, top: 0, width: 50, height: 50 } as DOMRect)

    expect(result).toBeNull()
    expect(calls.length).toBe(0)

    // restore
    Object.defineProperty(window, 'matchMedia', {
      value: originalMM,
      configurable: true,
    })
  })
})
