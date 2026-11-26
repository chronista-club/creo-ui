import { useHref } from '@solidjs/router'
import type { JSX } from '@solidjs/web'
import { type Component, omit } from 'solid-js'

export interface AProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  end?: boolean
}

export const A: Component<AProps> = (props) => {
  const rest = omit(props, 'href', 'end', 'children')
  const resolved = useHref(() =>
    props.href.startsWith('/') ? `/creo-ui${props.href === '/' ? '' : props.href}` : props.href,
  )
  return (
    <a href={resolved() || '/creo-ui/'} {...rest}>
      {props.children}
    </a>
  )
}
