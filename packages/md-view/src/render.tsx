/** Standard mdast → sanitized HTML tree → Solid components. */
import type { Element, Nodes as HtmlNode } from 'hast'
import { raw } from 'hast-util-raw'
import { defaultSchema, sanitize } from 'hast-util-sanitize'
import type { Nodes as MdNode } from 'mdast'
import { toHast } from 'mdast-util-to-hast'
import { find, html } from 'property-information'
import { type Component, createUniqueId, For, type JSX } from 'solid-js'
import { Dynamic } from 'solid-js/web'

export type MarkdownLinkProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement>
export type MarkdownImageProps = JSX.ImgHTMLAttributes<HTMLImageElement>
export interface MarkdownCodeProps {
  code: string
  language?: string
  inline: boolean
}
export interface MarkdownComponents {
  a?: Component<MarkdownLinkProps>
  img?: Component<MarkdownImageProps>
  /** Replaces the whole code block (including pre), or the inline code element. */
  code?: Component<MarkdownCodeProps>
}
export interface MarkdownRenderOptions {
  /** Parse embedded HTML, then sanitize it. Default: display HTML as text. */
  allowHtml?: boolean
  components?: MarkdownComponents
}

function properties(node: Element): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(node.properties)) {
    const info = find(html, key)
    result[info.attribute] = Array.isArray(value)
      ? value.join(info.commaSeparated ? ', ' : ' ')
      : value
  }
  return result
}

function renderHtml(node: HtmlNode, options: MarkdownRenderOptions, inline = true): JSX.Element {
  if (node.type === 'text') return node.value
  if (node.type === 'root')
    return <For each={node.children}>{(child) => renderHtml(child, options)}</For>
  if (node.type !== 'element') return null
  const attrs = properties(node)
  const children = () => <For each={node.children}>{(child) => renderHtml(child, options)}</For>
  if (
    node.tagName === 'pre' &&
    node.children.length === 1 &&
    node.children[0].type === 'element' &&
    node.children[0].tagName === 'code'
  ) {
    return renderHtml(node.children[0], options, false)
  }
  if (node.tagName === 'code') {
    const language = node.properties.className?.toString().match(/(?:^|[, ])language-([^, ]+)/)?.[1]
    const code = node.children.map((child) => (child.type === 'text' ? child.value : '')).join('')
    if (options.components?.code)
      return (
        <Dynamic
          component={options.components.code}
          code={code}
          language={language}
          inline={inline}
        />
      )
    return inline ? (
      <code class="creo-md-inline-code">{code}</code>
    ) : (
      <pre class="creo-md-code">
        <code data-lang={language}>{code}</code>
      </pre>
    )
  }
  if (node.tagName === 'a' && options.components?.a)
    return (
      <Dynamic component={options.components.a} {...attrs}>
        {children()}
      </Dynamic>
    )
  if (node.tagName === 'img') {
    return <Dynamic component={options.components?.img ?? 'img'} {...attrs} loading="lazy" />
  }
  if (node.tagName === 'table') attrs.class = 'creo-md-table'
  if (node.tagName === 'li' && node.properties.className?.toString().includes('task-list-item')) {
    const checked = node.children.some(
      (child) => child.type === 'element' && child.tagName === 'input' && child.properties.checked,
    )
    attrs.class = `creo-md-task${checked ? ' checked' : ''}`
  }
  return (
    <Dynamic component={node.tagName as keyof JSX.IntrinsicElements} {...attrs}>
      {children()}
    </Dynamic>
  )
}

/** Render standard mdast. Custom components receive sanitized attributes. */
export function renderNode(node: MdNode, options: MarkdownRenderOptions = {}): JSX.Element {
  const prefix = `creo-md-${createUniqueId()}-`
  const html = toHast(node, {
    clobberPrefix: '',
    allowDangerousHtml: options.allowHtml,
    handlers: options.allowHtml
      ? undefined
      : { html: (_state, element) => ({ type: 'text', value: element.value }) },
  })
  const tree = sanitize(options.allowHtml ? raw(html) : html, {
    ...defaultSchema,
    clobberPrefix: prefix,
  })
  // Scope IDs to this viewer, keeping fragment and accessibility references in sync.
  const elements: Element[] = []
  const collect = (current: HtmlNode) => {
    if (current.type === 'element') elements.push(current)
    if ('children' in current) current.children.forEach(collect)
  }
  collect(tree)
  const ids = new Set(elements.map((element) => element.properties.id).filter(Boolean))
  for (const element of elements) {
    const href = element.properties.href
    if (typeof href === 'string' && href.startsWith('#') && ids.has(prefix + href.slice(1))) {
      element.properties.href = `#${prefix}${href.slice(1)}`
    }
    for (const key of ['ariaDescribedBy', 'ariaLabelledBy', 'headers', 'htmlFor']) {
      const references = element.properties[key]
      if (Array.isArray(references))
        element.properties[key] = references.map((id) => (ids.has(prefix + id) ? prefix + id : id))
    }
  }
  return renderHtml(tree, options)
}
