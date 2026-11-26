import { Dynamic, type JSX, type ValidComponent } from '@solidjs/web'
import { type Component, createMemo, omit } from 'solid-js'
import { type CUButtonOptions, cuButtonAttrs } from './button-attrs'

export type { CUButtonSize, CUButtonVariant } from './button-attrs'

export interface CUButtonProps
  extends CUButtonOptions,
    Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'class' | 'type'> {
  /**
   * 描画する component を差し替える polymorphic prop。
   * 例: `as={A}` (solid-router) で client-side routing する link button。
   * 未指定なら `href` 有無で `<a>` / `<button>` に自動切替。
   */
  as?: ValidComponent
  /** 指定すると link button (`<a class="creo-btn">`)。`as` 未指定時のみ有効 */
  href?: string
  /** `<button>` 時の type。default は 'button' (暗黙の submit を防ぐ)。button 以外では無視 */
  type?: 'button' | 'submit' | 'reset'
  children?: JSX.Element
}

/**
 * CUButton — creo-ui の Button primitive (controls layer)
 *
 * `button.css` (.creo-btn + data-variant / data-size) を type-safe に wrap した薄い
 * SolidJS component。 描画先は `as` > `href` > `<button>` の優先で解決:
 * - default: `<button type="button">`
 * - `href`: `<a class="creo-btn">` (素の link button)
 * - `as={A}`: 任意 component (solid-router `A` 等で client-side routing する link button)
 *
 * 設計 (creo-memories handoff mem_1Cc2DhGJESsC5FJUrLtX1T / …9Bqc / …9Eth への回答):
 * - 属性は `createMemo(cuButtonAttrs)` で **描画毎に props から導出** (eager const 無し) →
 *   variant / size / pressed / loading を signal で変えても追従 (非リアクティブ bug を構造回避)。
 * - variant / size / loading は data 属性で表現 (CU* 規約、`cn` 文字列結合に非依存)。
 * - `loading`: native `<button>` は `disabled` 強制、 polymorphic/link は `aria-disabled` で
 *   操作抑止。 どちらも `aria-busy="true"` + `data-loading` で button.css が spinner を被せる。
 *
 * Usage:
 *   <CUButton variant="primary" loading={saving()}>Save</CUButton>
 *   <CUButton variant="ghost" pressed={fav()} onClick={toggle}>★</CUButton>
 *   <CUButton as={A} href="/sessions" variant="secondary">Sessions</CUButton>
 */
export const CUButton: Component<CUButtonProps> = (props) => {
  const rest = omit(
    props,
    'variant',
    'size',
    'pressed',
    'loading',
    'class',
    'as',
    'href',
    'type',
    'disabled',
    'children',
  )

  const attrs = createMemo(() => cuButtonAttrs(props))
  // native <button> = as も href も無いとき。disabled / type は native のみ有効。
  const isNativeButton = () => props.as == null && props.href == null
  const component = (): ValidComponent => props.as ?? (props.href != null ? 'a' : 'button')
  const inert = () => props.disabled === true || props.loading === true

  return (
    <Dynamic
      component={component()}
      class={attrs().class}
      data-variant={attrs()['data-variant']}
      data-size={attrs()['data-size']}
      data-loading={attrs()['data-loading']}
      aria-pressed={attrs()['aria-pressed']}
      aria-busy={attrs()['aria-busy']}
      href={props.href}
      type={isNativeButton() ? (props.type ?? 'button') : undefined}
      disabled={isNativeButton() ? inert() : undefined}
      aria-disabled={!isNativeButton() && inert() ? 'true' : undefined}
      {...rest}
    >
      {props.children}
    </Dynamic>
  )
}
