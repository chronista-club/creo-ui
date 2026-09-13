/**
 * <CreoMarkdown> — SolidJS Markdown renderer.
 *
 * Parses Markdown with remark, then renders sanitized HTML nodes as Solid JSX.
 * On parse error, shows fallback (default: inline error message).
 */

import type { Root } from 'mdast'
import { type Component, createResource, type JSX, Show } from 'solid-js'
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
  const [ast] = createResource(
    () => props.text,
    async (text) => {
      const tree = parseMarkdown(text)
      props.onAst?.(tree)
      return tree
    },
  )
  return (
    <div class={`creo-md ${props.class ?? ''}`.trim()}>
      <Show
        when={ast.state === 'ready'}
        fallback={
          <Show when={ast.error} fallback={props.loading ?? null}>
            {props.fallback?.(String(ast.error)) ?? (
              <div class="creo-md-error" role="alert">
                Markdown parse error: {String(ast.error)}
              </div>
            )}
          </Show>
        }
      >
        {renderNode(ast() as Root, props)}
      </Show>
    </div>
  )
}
