/**
 * morphFrame coordinator の sanity check (bun test + happy-dom)。
 *
 * Pure path (empty input / prev 不在 slot skip) と DOM 介在 path
 * (real document.createElement + animate spy) の両方を網羅。
 */

import { afterEach, describe, expect, it } from 'bun:test'
import { measureSlots, morphFrame } from './morph'

/** getBoundingClientRect / animate を持つ最小 mock (no-DOM tests 用) */
function mockElement(rect: Partial<DOMRect> = {}): HTMLElement {
  const r: DOMRect = {
    x: 0,
    y: 0,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 100,
    height: 100,
    toJSON: () => r,
    ...rect,
  } as DOMRect
  return {
    getBoundingClientRect: () => r,
    animate: () => {
      throw new Error('animate should not be called in pure-path tests')
    },
  } as unknown as HTMLElement
}

/** real document.createElement + animate spy + 任意 rect override */
function realElement(rect?: Partial<DOMRect>): {
  el: HTMLElement
  getCalls: () => number
} {
  const el = document.createElement('div')
  document.body.appendChild(el)
  if (rect) {
    const r: DOMRect = {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON: () => r,
      ...rect,
    } as DOMRect
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => r,
      configurable: true,
    })
  }
  let calls = 0
  el.animate = (() => {
    calls += 1
    return { finished: Promise.resolve() } as Animation
  }) as HTMLElement['animate']
  return { el, getCalls: () => calls }
}

describe('measureSlots', () => {
  it('returns empty Map for empty input', () => {
    const result = measureSlots(new Map())
    expect(result.size).toBe(0)
  })

  it('returns Map with same keys as input', () => {
    const input = new Map<string, HTMLElement>([
      ['hero', mockElement()],
      ['sidebar', mockElement()],
      ['main', mockElement()],
    ])
    const result = measureSlots(input)
    expect([...result.keys()].sort()).toEqual(['hero', 'main', 'sidebar'])
  })

  it('captures rect dimensions per element', () => {
    const input = new Map<string, HTMLElement>([
      ['a', mockElement({ left: 10, top: 20, width: 30, height: 40 })],
    ])
    const result = measureSlots(input)
    const rect = result.get('a')
    expect(rect?.left).toBe(10)
    expect(rect?.top).toBe(20)
    expect(rect?.width).toBe(30)
    expect(rect?.height).toBe(40)
  })
})

describe('morphFrame (pure paths)', () => {
  it('resolves to empty array for empty inputs', async () => {
    const result = await morphFrame(new Map(), new Map())
    expect(result).toEqual([])
  })

  it('skips slots without prev rect (no animate call)', async () => {
    const elements = new Map<string, HTMLElement>([
      ['hero', mockElement()],
      ['sidebar', mockElement()],
    ])
    const prevRects = new Map<string, DOMRect>()
    const result = await morphFrame(elements, prevRects)
    expect(result).toEqual([])
  })

  it('handles partial prev rect coverage (animate not called for missing keys)', async () => {
    const elements = new Map<string, HTMLElement>([
      ['hero', mockElement({ left: 0, top: 0, width: 100, height: 100 })],
      ['sidebar', mockElement()],
    ])
    const prevRects = new Map<string, DOMRect>([
      ['hero', { left: 0, top: 0, width: 100, height: 100 } as DOMRect],
    ])
    const result = await morphFrame(elements, prevRects)
    expect(result).toEqual([])
  })
})

describe('morphFrame (DOM-based)', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('animates each slot when rect changes', async () => {
    const a = realElement({ width: 100, height: 100 })
    const b = realElement({ width: 100, height: 100 })
    const elements = new Map<string, HTMLElement>([
      ['hero', a.el],
      ['main', b.el],
    ])
    const prevRects = new Map<string, DOMRect>([
      ['hero', { left: 100, top: 0, width: 100, height: 100 } as DOMRect],
      ['main', { left: 0, top: 200, width: 100, height: 100 } as DOMRect],
    ])
    const result = await morphFrame(elements, prevRects)
    expect(result.length).toBe(2)
    expect(a.getCalls()).toBe(1)
    expect(b.getCalls()).toBe(1)
  })

  it('returns Animation array whose .finished all resolve', async () => {
    const a = realElement({ width: 50, height: 50 })
    const elements = new Map<string, HTMLElement>([['hero', a.el]])
    const prevRects = new Map<string, DOMRect>([
      ['hero', { left: 30, top: 0, width: 50, height: 50 } as DOMRect],
    ])
    const animations = await morphFrame(elements, prevRects)
    expect(animations.length).toBe(1)
    await expect(animations[0]!.finished).resolves.toBeUndefined()
  })

  it('skips slot with no rect change (no-op detection on flip)', async () => {
    const a = realElement({ left: 0, top: 0, width: 100, height: 100 })
    const elements = new Map<string, HTMLElement>([['hero', a.el]])
    const prevRects = new Map<string, DOMRect>([
      ['hero', { left: 0, top: 0, width: 100, height: 100 } as DOMRect],
    ])
    const result = await morphFrame(elements, prevRects)
    expect(result.length).toBe(0)
    expect(a.getCalls()).toBe(0)
  })

  it('partial: animates only slots with movement, skips no-op', async () => {
    const moved = realElement({ width: 50, height: 50 })
    const still = realElement({ left: 0, top: 0, width: 80, height: 80 })
    const elements = new Map<string, HTMLElement>([
      ['hero', moved.el],
      ['sidebar', still.el],
    ])
    const prevRects = new Map<string, DOMRect>([
      ['hero', { left: 200, top: 0, width: 50, height: 50 } as DOMRect],
      ['sidebar', { left: 0, top: 0, width: 80, height: 80 } as DOMRect],
    ])
    const result = await morphFrame(elements, prevRects)
    expect(result.length).toBe(1)
    expect(moved.getCalls()).toBe(1)
    expect(still.getCalls()).toBe(0)
  })
})

describe('morphFrame — cancel / rejection graceful skip', () => {
  /** finished が reject (cancel 相当) する mock animation を返す element */
  function elementWithCancelledAnimate(rect: Partial<DOMRect>): HTMLElement {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const r: DOMRect = {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON: () => r,
      ...rect,
    } as DOMRect
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => r,
      configurable: true,
    })
    el.animate = (() => {
      // 仕様: animation.cancel() で finished は AbortError で reject。
      // mock では DOMException 相当を Promise.reject で再現。
      const finished = Promise.reject(new DOMException('Animation cancelled', 'AbortError'))
      // unhandled rejection を出さないため事前 catch (test スイッチで surface しない)
      finished.catch(() => {})
      return { finished } as Animation
    }) as HTMLElement['animate']
    return el
  }

  /** 正常完走する mock (finished が即 resolve) */
  function elementWithFulfilledAnimate(rect: Partial<DOMRect>): HTMLElement {
    const el = document.createElement('div')
    document.body.appendChild(el)
    const r: DOMRect = {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      toJSON: () => r,
      ...rect,
    } as DOMRect
    Object.defineProperty(el, 'getBoundingClientRect', {
      value: () => r,
      configurable: true,
    })
    el.animate = (() => ({ finished: Promise.resolve() }) as Animation) as HTMLElement['animate']
    return el
  }

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('does NOT throw when an animation rejects (cancelled)', async () => {
    const cancelled = elementWithCancelledAnimate({ width: 50, height: 50 })
    const elements = new Map<string, HTMLElement>([['cancelled', cancelled]])
    const prevRects = new Map<string, DOMRect>([
      ['cancelled', { left: 200, top: 0, width: 50, height: 50 } as DOMRect],
    ])
    // 期待: throw せずに resolve、 結果は cancel された animation を除いた空配列
    const result = await morphFrame(elements, prevRects)
    expect(result).toEqual([])
  })

  it('mixed cancel + fulfilled: returns only the fulfilled animations', async () => {
    const cancelled = elementWithCancelledAnimate({ width: 50, height: 50 })
    const fulfilled = elementWithFulfilledAnimate({ width: 50, height: 50 })
    const elements = new Map<string, HTMLElement>([
      ['cancelled', cancelled],
      ['fulfilled', fulfilled],
    ])
    const prevRects = new Map<string, DOMRect>([
      ['cancelled', { left: 200, top: 0, width: 50, height: 50 } as DOMRect],
      ['fulfilled', { left: 100, top: 0, width: 50, height: 50 } as DOMRect],
    ])
    const result = await morphFrame(elements, prevRects)
    // 1 件 (fulfilled のみ) が返る
    expect(result.length).toBe(1)
  })
})
