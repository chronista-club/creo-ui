// iconify-icon Web Component を side-effect import して customElements.define() を実行。
// これが無いと <iconify-icon> は browser に未知の要素として無視される。
import 'iconify-icon'
import type { Component, JSX } from 'solid-js'
import type { IconName } from './types'

// SolidJS は標準 HTML 要素しか型を持たないので、 iconify-icon の attribute を module augmentation で declare。
declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': {
        icon: string
        width?: number | string
        height?: number | string
        flip?: 'horizontal' | 'vertical' | 'both'
        rotate?: number | string
        inline?: boolean
        mode?: 'mask' | 'background' | 'svg'
        style?: JSX.CSSProperties | string
        class?: string
        title?: string
      } & Pick<JSX.HTMLAttributes<HTMLElement>, 'id' | 'classList' | 'ref'>
    }
  }
}

export interface CreoIconProps {
  name: IconName
  size?: number | string
  color?: string
  class?: string
  style?: JSX.CSSProperties | string
  rotate?: 0 | 90 | 180 | 270
  flip?: 'horizontal' | 'vertical' | 'both'
  title?: string
}

// iconify-icon Web Component の thin wrapper。
// currentColor + 1em default で creoui token に追従させる layer。
export const CreoIcon: Component<CreoIconProps> = (props) => {
  const styleObj = (): JSX.CSSProperties | string | undefined => {
    if (typeof props.style === 'string') return props.style
    return {
      color: props.color ?? 'currentColor',
      ...((props.style as JSX.CSSProperties) ?? {}),
    }
  }

  return (
    <iconify-icon
      icon={props.name}
      width={props.size ?? '1em'}
      height={props.size ?? '1em'}
      class={props.class}
      style={styleObj()}
      rotate={props.rotate}
      flip={props.flip}
      title={props.title}
    />
  )
}
