import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import type { IncomingMessage } from 'node:http'
import { join, resolve } from 'node:path'
import type { Plugin } from 'vite'

// 手元の Claude (curl) → dev server → Vite HMR ws → ブラウザの window.creoEditor / CSS var。
//
//   # (A) live op を creoEditor に流す (片方向):
//   curl -X POST http://localhost:13600/_creo/agent/cmd \
//     -d '{"op":"picker","args":["--color-brand-primary","#ff5500"]}'
//
//   # (B) CSS var を live 反映 + tokens/*.json に永続化 (push + persist を 1 コマンド):
//   curl -X POST http://localhost:13600/_creo/agent/set \
//     -d '{"var":"--spacing-m","value":"20px"}'
//
// MVP transport = Vite HMR WebSocket を相乗り。将来 creo wire / unison に載せ替えるときは
// 受信側 (src/dev/agent-bridge.ts) の transport を差し替えるだけで、この plugin は不変。

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((res) => {
    let body = ''
    req.on('data', (chunk) => {
      body += String(chunk)
    })
    req.on('end', () => res(body))
  })
}

// --spacing-m → spacing.m (非 themed token 専用。themed color --color-* は 8 theme file に
// 散在するため PoC 対象外)
function cssVarToDotPath(cssVar: string): string {
  return cssVar.replace(/^--/, '').replace(/-/g, '.')
}

function listJsonFiles(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...listJsonFiles(p))
    else if (name.endsWith('.json')) out.push(p)
  }
  return out
}

// tokens/**/*.json を dot-path で deep-key 探索し、leaf の $value を書き換える。
// 書き換えた file path を返す (見つからなければ null)。
function writeTokenValue(tokensDir: string, dotPath: string, value: string): string | null {
  const segs = dotPath.split('.')
  for (const file of listJsonFiles(tokensDir)) {
    const json = JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>
    let node: unknown = json
    for (const seg of segs) {
      if (node && typeof node === 'object' && seg in node) {
        node = (node as Record<string, unknown>)[seg]
      } else {
        node = undefined
        break
      }
    }
    if (node && typeof node === 'object' && '$value' in node) {
      ;(node as Record<string, unknown>).$value = value
      writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`)
      return file
    }
  }
  return null
}

export function creoAgentBridge(): Plugin {
  return {
    name: 'creo-agent-bridge',
    apply: 'serve', // dev サーバーのみ。production build には一切載らない
    configureServer(server) {
      // (A) live op を creoEditor に流す (既存・片方向)
      server.middlewares.use('/_creo/agent/cmd', (req, res, next) => {
        if (req.method !== 'POST') return next()
        readBody(req).then((body) => {
          res.setHeader('Content-Type', 'application/json')
          try {
            const op = JSON.parse(body || '{}')
            server.ws.send({ type: 'custom', event: 'creo:agent', data: op })
            res.end(JSON.stringify({ ok: true, forwarded: op }))
          } catch (err) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, error: String(err) }))
          }
        })
      })

      // (B) CSS var を live 反映 (ws push) + tokens/*.json に永続化 (fs 書き戻し) を 1 コマンドで。
      // 値の source が手元 Claude なので、ブラウザ往復・creoEditor.commitToTokens を経由しない。
      const tokensDir = resolve(server.config.root, '../../tokens')
      server.middlewares.use('/_creo/agent/set', (req, res, next) => {
        if (req.method !== 'POST') return next()
        readBody(req).then((body) => {
          res.setHeader('Content-Type', 'application/json')
          try {
            const parsed = JSON.parse(body || '{}') as { var?: unknown; value?: unknown }
            const cssVar = parsed.var
            const value = parsed.value
            if (typeof cssVar !== 'string' || typeof value !== 'string') {
              res.statusCode = 400
              res.end(JSON.stringify({ ok: false, error: 'expected {var, value} as strings' }))
              return
            }
            if (cssVar.startsWith('--color-')) {
              res.statusCode = 422
              res.end(
                JSON.stringify({ ok: false, error: 'themed color (--color-*) は PoC 対象外' }),
              )
              return
            }
            const dotPath = cssVarToDotPath(cssVar)
            const file = writeTokenValue(tokensDir, dotPath, value)
            // (1) live 反映 — 接続中の全ブラウザの :root に CSS var を直書き
            server.ws.send({
              type: 'custom',
              event: 'creo:agent:set',
              data: { var: cssVar, value, persisted: file ? { file } : null },
            })
            // (2) 永続化の結果を返す
            res.end(
              JSON.stringify({
                ok: true,
                var: cssVar,
                value,
                dotPath,
                persisted: file,
                note: file
                  ? 'tokens/*.json に書き戻し済み。build:web で tokens.css に反映されます'
                  : 'token 未検出 (live 反映のみ)',
              }),
            )
          } catch (err) {
            res.statusCode = 400
            res.end(JSON.stringify({ ok: false, error: String(err) }))
          }
        })
      })
    },
  }
}
