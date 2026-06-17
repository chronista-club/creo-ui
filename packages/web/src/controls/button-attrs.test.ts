import { describe, expect, test } from 'bun:test'
import { cuButtonAttrs } from './button-attrs'

/**
 * cuButtonAttrs — CUButton の props → DOM 属性マッピングの純粋関数。
 *
 * 回帰テストの主眼 (creo-memories handoff mem_1Cc2DhGJESsC5FJUrLtX1T):
 * variant / size / pressed を「即時 1 回計算で固める」のではなく、render 毎に
 * props から属性を導出すること。CUButton は JSX 内で `data-variant={attrs().['data-variant']}`
 * のように inline で呼ぶため、この関数が呼び出し毎に最新 props を反映していれば
 * Solid の reactivity が成立する (例の buttonClass 非リアクティブ bug を構造的に回避)。
 */
describe('cuButtonAttrs', () => {
  test('デフォルト (props 無し) — creo-btn base のみ、 data-* / aria-pressed は出さない', () => {
    const a = cuButtonAttrs({})
    expect(a.class).toBe('creo-btn')
    expect(a['data-variant']).toBeUndefined()
    expect(a['data-size']).toBeUndefined()
    expect(a['aria-pressed']).toBeUndefined()
  })

  test('variant / size を指定すると data 属性に反映', () => {
    const a = cuButtonAttrs({ variant: 'ghost', size: 's' })
    expect(a['data-variant']).toBe('ghost')
    expect(a['data-size']).toBe('s')
  })

  test('destructive action 用の danger variant を受け付ける', () => {
    expect(cuButtonAttrs({ variant: 'danger' })['data-variant']).toBe('danger')
  })

  test('bordered な outline variant を受け付ける (secondary とは別 style)', () => {
    expect(cuButtonAttrs({ variant: 'outline' })['data-variant']).toBe('outline')
  })

  test('5 variant 全て (primary/secondary/outline/ghost/danger) が passthrough される', () => {
    for (const v of ['primary', 'secondary', 'outline', 'ghost', 'danger'] as const) {
      expect(cuButtonAttrs({ variant: v })['data-variant']).toBe(v)
    }
  })

  test('pressed=true → aria-pressed="true"', () => {
    expect(cuButtonAttrs({ pressed: true })['aria-pressed']).toBe('true')
  })

  test('pressed=false → aria-pressed="false" (toggle の off 状態を a11y に表現)', () => {
    expect(cuButtonAttrs({ pressed: false })['aria-pressed']).toBe('false')
  })

  test('pressed 未指定 → aria-pressed は出さない (toggle ではない通常 button)', () => {
    expect(cuButtonAttrs({})['aria-pressed']).toBeUndefined()
  })

  test('custom class は creo-btn の後ろに連結 (override ではなく追加)', () => {
    expect(cuButtonAttrs({ class: 'my-cta' }).class).toBe('creo-btn my-cta')
  })

  test('reactivity 回帰: 同じ呼び出しでも変えた props は毎回新しい属性を返す (固定化しない)', () => {
    // 即時 1 回計算 (const buttonClass = ...) だと variant 変化が固まる、 という
    // creo-memories の bug を関数レベルで固定: 引数が変われば出力も変わる契約。
    expect(cuButtonAttrs({ variant: 'primary' })['data-variant']).toBe('primary')
    expect(cuButtonAttrs({ variant: 'ghost' })['data-variant']).toBe('ghost')
  })
})
