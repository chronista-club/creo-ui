/**
 * <CreoMarkdown> — SolidJS Markdown renderer.
 *
 * Async parses text with creo-views/md (WASM), then renders mdast → JSX.
 * On parse error, shows fallback (default: inline error message).
 */

import { type MdNode, parse } from 'creo-views/md'
import { type Component, type JSX, Show, createResource } from 'solid-js'
import { renderNode } from './render'

export interface CreoMarkdownProps {
  /** Markdown text to render. */
  text: string
  /** Custom class name on the outer wrapper. */
  class?: string
  /** Element shown while parsing (default: nothing). */
  loading?: JSX.Element
  /** Render override on parse error. */
  fallback?: (err: string) => JSX.Element
  /** Lifecycle hook — receives the parsed AST (use for frontmatter access etc.). */
  onAst?: (ast: MdNode) => void
}

export const CreoMarkdown: Component<CreoMarkdownProps> = (props) => {
  const [ast] = createResource(
    () => props.text,
    async (text) => {
      const tree = await parse(text)
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
        {renderNode(ast() as MdNode)}
      </Show>
    </div>
  )
}
