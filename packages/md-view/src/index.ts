/**
 * creo-ui-md-view — public API
 *
 * Display-only Markdown component using the standard mdast ecosystem.
 */

export type { Nodes as MdNode, Root as MarkdownRoot } from 'mdast'
export { CreoMarkdown, type CreoMarkdownProps } from './component'
export {
  type MarkdownCodeProps,
  type MarkdownComponents,
  type MarkdownImageProps,
  type MarkdownLinkProps,
  type MarkdownRenderOptions,
  renderNode,
} from './render'
