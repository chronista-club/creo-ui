import { type Component, type JSX, Show, createMemo, splitProps } from 'solid-js'
import { type CUButtonOptions, cuButtonAttrs } from './button-attrs'

export type { CUButtonVariant, CUButtonSize } from './button-attrs'

export interface CUButtonProps
  extends CUButtonOptions,
    Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, 'class' | 'type'> {
  /** 指定すると `<a class="creo-btn">` (link button) として描画。未指定なら `<button>` */
  href?: string
  /** `<button>` 時の type。default は 'button' (暗黙の submit を防ぐ)。href 指定時は無視 */
  type?: 'button' | 'submit' | 'reset'
  children?: JSX.Element
}

/**
 * CUButton — creoui の Button primitive (controls layer)
 *
 * `button.css` (.creo-btn + data-variant / data-size) を type-safe に wrap した薄い
 * SolidJS component。 href を渡すと `<a>` polymorphic に切替わる (link button)。
 *
 * 設計 (creo-memories handoff mem_1Cc2DhGJESsC5FJUrLtX1T への回答):
 * - 属性は `createMemo(cuButtonAttrs)` で **描画毎に props から導出**。 component body で
 *   `const cls = ...` と即時 1 回計算しないため、 variant / size / pressed を signal で
 *   変えても class / data 属性が追従する (例の buttonClass 非リアクティブ bug を構造的に回避)。
 * - class 文字列結合 (cn) に依存せず、 variant / size は data 属性で表現 (CU* 規約)。
 *
 * Usage:
 *   <CUButton variant="primary">Save</CUButton>
 *   <CUButton variant="ghost" pressed={showFavoritesOnly()} onClick={toggle}>★</CUButton>
 *   <CUButton href="/docs" variant="secondary">Docs</CUButton>
 */
export const CUButton: Component<CUButtonProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'variant',
    'size',
    'pressed',
    'class',
    'href',
    'type',
    'children',
  ])

  const attrs = createMemo(() => cuButtonAttrs(local))

  return (
    <Show
      when={local.href != null}
      fallback={
        <button
          class={attrs().class}
          data-variant={attrs()['data-variant']}
          data-size={attrs()['data-size']}
          aria-pressed={attrs()['aria-pressed']}
          type={local.type ?? 'button'}
          {...rest}
        >
          {local.children}
        </button>
      }
    >
      <a
        class={attrs().class}
        data-variant={attrs()['data-variant']}
        data-size={attrs()['data-size']}
        aria-pressed={attrs()['aria-pressed']}
        href={local.href}
        {...(rest as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {local.children}
      </a>
    </Show>
  )
}
