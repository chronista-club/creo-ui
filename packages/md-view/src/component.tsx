/**
 * <CreoMarkdown> — SolidJS Markdown renderer.
 *
 * Parses Markdown with remark, then renders sanitized HTML nodes as Solid JSX.
 * On parse error, shows fallback (default: inline error message).
 */

import type { JSX } from '@solidjs/web'
import type { Root } from 'mdast'
import { type Component, createMemo, Errored, Loading } from 'solid-js'
import { parseMarkdown } from './parse'
import { type MarkdownRenderOptions, renderNode } from './render'

export interface CreoMarkdownProps extends MarkdownRenderOptions {
  /** Markdown text to render. */
  text: string
  /** Custom class name on the outer wrapper. */
  class?: string
  /** Element shown while parsing (default: nothing). */
  loading?: JSX.Element
  /** Render override on parse error. */
  fallback?: (err: string) => JSX.Element
  /** Lifecycle hook — receives the parsed AST (use for frontmatter access etc.). */
  onAst?: (ast: Root) => void
}

export const CreoMarkdown: Component<CreoMarkdownProps> = (props) => {
  const ast = createMemo(async () => {
    const tree = parseMarkdown(props.text)
    props.onAst?.(tree)
    return tree
  })
  return (
    <div class={`creo-md ${props.class ?? ''}`.trim()}>
      <Errored
        fallback={(err) => {
          const msg = err() instanceof Error ? (err() as Error).message : String(err())
          return (
            props.fallback?.(msg) ?? (
              <div class="creo-md-error" role="alert">
                Markdown parse error: {msg}
              </div>
            )
          )
        }}
      >
        <Loading fallback={props.loading ?? null}>{renderNode(ast(), props)}</Loading>
      </Errored>
    </div>
  )
}
