/**
 * creo-tokens-plugin — Vite dev plugin for live token write-back.
 *
 * editor-host の creoEditor.commitToTokens() から POST を受け、
 * 現 editor state を `tokens/<cat>/scale.json` の `$value` に反映する。
 *
 * dev 専用 (filesystem write が必要)。production build では中立 (apply フック無し)。
 *
 * MVP scope:
 *   - 対応 token key: `tokens.spacing.m`, `tokens.margin.{key}`, `tokens.radius.{key}`
 *     - 単一 file 構造 (`tokens/<cat>/scale.json`) の category に限定
 *   - 値は number (px 単位) を受けて `"{n}px"` として書き戻す
 *   - 書き戻し後、Vite は file watcher で `tokens.css` を rebuild (style-dictionary CLI 要走らせ直し)
 *     → 完全な HMR は別途 rebuild script 必要。現 MVP は filesystem 反映のみで十分。
 *
 * 非対応 (将来拡張):
 *   - 複数 file の category (typography/* など)
 *   - alias 値 (role tokens) の書き戻し
 *   - rem / em 入力の逆変換
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

interface CommitPayload {
  values: Record<string, unknown>
}

/**
 * token id ("tokens.spacing.m") → 書き戻し先 file 情報。
 * 未対応 id は null を返す。
 */
function resolveTokenTarget(
  id: string,
  rootDir: string,
): { file: string; keyPath: readonly string[] } | null {
  const parts = id.split('.')
  if (parts[0] !== 'tokens') return null
  const [, category, key] = parts
  if (!category || !key) return null
  // 単一 file (scale.json) category のみ
  const SINGLE_FILE_CATEGORIES = new Set(['spacing', 'margin', 'radius'])
  if (!SINGLE_FILE_CATEGORIES.has(category)) return null
  return {
    file: path.join(rootDir, 'tokens', category, 'scale.json'),
    keyPath: [category, key, '$value'],
  }
}

/** JSON の nested key path を set する (純粋関数、copy を返す) */
function setAt<T>(obj: T, keyPath: readonly string[], value: unknown): T {
  if (keyPath.length === 0) return value as T
  const [head, ...rest] = keyPath
  const copy = { ...(obj as Record<string, unknown>) }
  copy[head] = setAt((obj as Record<string, unknown>)[head] ?? {}, rest, value)
  return copy as T
}

/** number → "{n}px" 文字列。小数点以下の余計な 0 を削る */
function formatPxValue(n: number): string {
  return `${Number(n.toFixed(4))}px`
}

export interface CreoTokensPluginOptions {
  /** repo root (default: process.cwd() から 2 階層上、つまり examples/web-demo/ 前提) */
  rootDir?: string
  /** endpoint path (default: /_creo/tokens/commit) */
  endpoint?: string
  /** on commit callback — debug 用に reception を観察 */
  onCommit?: (result: { id: string; value: unknown; file: string }[]) => void
}

export function creoTokensPlugin(options: CreoTokensPluginOptions = {}): Plugin {
  const endpoint = options.endpoint ?? '/_creo/tokens/commit'
  return {
    name: 'creo-tokens-write-back',
    apply: 'serve',
    configureServer(server) {
      const rootDir = options.rootDir ?? path.resolve(server.config.root, '../..')

      server.middlewares.use(endpoint, async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Allow', 'POST')
          res.end('Method Not Allowed')
          return
        }
        let body = ''
        req.on('data', (chunk) => {
          body += chunk.toString()
        })
        req.on('end', async () => {
          try {
            const payload = JSON.parse(body) as CommitPayload
            const applied: { id: string; value: unknown; file: string }[] = []
            const skipped: string[] = []
            // file 単位で group して 1 回だけ read/write
            const groups = new Map<string, Map<string, unknown>>()

            for (const [id, value] of Object.entries(payload.values ?? {})) {
              const target = resolveTokenTarget(id, rootDir)
              if (!target) {
                skipped.push(id)
                continue
              }
              const pxString = typeof value === 'number' ? formatPxValue(value) : String(value)
              if (!groups.has(target.file)) groups.set(target.file, new Map())
              // biome-ignore lint/style/noNonNullAssertion: just set
              groups.get(target.file)!.set(target.keyPath.join('.'), pxString)
              applied.push({ id, value: pxString, file: target.file })
            }

            for (const [file, updates] of groups) {
              const raw = await fs.readFile(file, 'utf-8')
              let data = JSON.parse(raw)
              for (const [keyPathStr, v] of updates) {
                const keyPath = keyPathStr.split('.')
                data = setAt(data, keyPath, v)
              }
              await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, 'utf-8')
            }

            options.onCommit?.(applied)

            res.setHeader('Content-Type', 'application/json')
            res.statusCode = 200
            res.end(JSON.stringify({ applied, skipped }))
            if (applied.length > 0) {
              console.log(
                `[creo-tokens] ✓ wrote ${applied.length} token(s) — rebuild tokens with \`bun run build\` to propagate to tokens.css`,
              )
            }
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: String(err) }))
          }
        })
      })
    },
  }
}
