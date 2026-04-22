/**
 * Web components bundler.
 *
 * `packages/web/src/components/*.css` を concat して `packages/web/dist/components.css` に出力。
 * Style Dictionary (token 生成) の後に走らせる想定。`bun run build` に chained。
 *
 * 生成物は `creo-ui-web/components.css` として publish される (package.json の exports)。
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC_DIR = path.join(ROOT, 'packages/web/src/components')
const DIST_FILE = path.join(ROOT, 'packages/web/dist/components.css')

const entries = await fs.readdir(SRC_DIR, { withFileTypes: true })
const cssFiles = entries
  .filter((e) => e.isFile() && e.name.endsWith('.css'))
  .map((e) => e.name)
  .sort()

if (cssFiles.length === 0) {
  console.error('[build-web-components] no .css sources found in', SRC_DIR)
  process.exit(1)
}

const header = [
  '/**',
  ' * creo-ui-web — components.css',
  ' *',
  ' * Generated: concat of packages/web/src/components/*.css.',
  ' * Requires tokens.css to be imported first (CSS variables).',
  ' *',
  ` * Bundled files: ${cssFiles.join(', ')}`,
  ' */',
  '',
].join('\n')

const parts = []
for (const name of cssFiles) {
  const content = await fs.readFile(path.join(SRC_DIR, name), 'utf-8')
  parts.push(`/* ================ ${name} ================ */\n${content.trim()}\n`)
}

const output = `${header}\n${parts.join('\n')}\n`

await fs.mkdir(path.dirname(DIST_FILE), { recursive: true })
await fs.writeFile(DIST_FILE, output, 'utf-8')

console.log(
  `✓ components.css (${cssFiles.length} file${cssFiles.length === 1 ? '' : 's'}, ${output.length} chars) → ${path.relative(ROOT, DIST_FILE)}`,
)
