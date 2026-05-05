/**
 * morphFrame coordinator の sanity check (bun test)。
 *
 * Pure path のみ test (empty input / prev 不在 slot skip)。 DOM / animate 介在
 * の本格 test は B-ε で happy-dom 導入時に拡充予定。
 */

import { describe, expect, it } from 'bun:test'
import { measureSlots, morphFrame } from './morph'

/** getBoundingClientRect / animate を持つ最小 mock。 animate は呼ばれてはいけない */
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
    // mockElement.animate throws — ここで呼ばれたら test 失敗
    const elements = new Map<string, HTMLElement>([
      ['hero', mockElement()],
      ['sidebar', mockElement()],
    ])
    const prevRects = new Map<string, DOMRect>() // 全 slot の prev rect 不在
    const result = await morphFrame(elements, prevRects)
    expect(result).toEqual([])
  })

  it('handles partial prev rect coverage (animate not called for missing keys)', async () => {
    // 'sidebar' に prev rect 無し → そちらは skip。 'hero' は prev rect ありだが
    // newRect も同 (mockElement の rect 同じ) なので flip() の no-op detection で
    // animate も呼ばれず null 返却 — 結果 animations 配列は空
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
