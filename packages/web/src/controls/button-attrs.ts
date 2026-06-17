/**
 * cuButtonAttrs — CUButton の props → DOM 属性マッピング (純粋関数)
 *
 * CUButton は JSX 内でこの関数を呼び出し毎に評価し、 inline で属性に展開する。
 * 「即時 1 回計算で class 文字列を固める」アンチパターン (creo-memories handoff
 * mem_1Cc2DhGJESsC5FJUrLtX1T の bug) を避けるため、 component 側は派生値を
 * eager な const に握らず、 描画毎にこの関数経由で最新 props を反映する。
 *
 * data 属性方式: variant / size は `button.css` (.creo-btn[data-variant] 等) が
 * 解釈する。値を持つときだけ属性を出し、 未指定なら CSS の default (primary / m) に委ねる。
 */

export type CUButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type CUButtonSize = 's' | 'm' | 'l'

export interface CUButtonOptions {
  /** 視覚的強度。未指定は button.css の default (primary) */
  variant?: CUButtonVariant
  /** size tier。未指定は button.css の default (m) */
  size?: CUButtonSize
  /**
   * toggle button の押下状態。
   * - `true` → `aria-pressed="true"`
   * - `false` → `aria-pressed="false"` (toggle の off を a11y に明示)
   * - 未指定 → 属性自体を出さない (通常の非 toggle button)
   */
  pressed?: boolean
  /**
   * 処理中状態。`true` で spinner 表示 (`data-loading="true"`) + `aria-busy="true"`。
   * component 側は native `<button>` を `disabled` 強制、polymorphic/link は `aria-disabled` で
   * 操作を抑止する (button.css が label を隠して spinner を被せる)。
   */
  loading?: boolean
  /** consumer 追加 class。creo-btn の後ろに連結 (override せず追加) */
  class?: string
}

export interface CUButtonAttrs {
  class: string
  'data-variant': CUButtonVariant | undefined
  'data-size': CUButtonSize | undefined
  'aria-pressed': 'true' | 'false' | undefined
  'data-loading': 'true' | undefined
  'aria-busy': 'true' | undefined
}

export function cuButtonAttrs(opts: CUButtonOptions): CUButtonAttrs {
  return {
    class: opts.class ? `creo-btn ${opts.class}` : 'creo-btn',
    'data-variant': opts.variant,
    'data-size': opts.size,
    'aria-pressed': opts.pressed === undefined ? undefined : opts.pressed ? 'true' : 'false',
    'data-loading': opts.loading ? 'true' : undefined,
    'aria-busy': opts.loading ? 'true' : undefined,
  }
}
