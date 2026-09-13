/** Markdown syntax is owned by remark; creo-ui owns display. */
import remarkFrontmatter from 'remark-frontmatter'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkFrontmatter, ['yaml', 'toml'])

export function parseMarkdown(text: string) {
  return parser.parse(text)
}
