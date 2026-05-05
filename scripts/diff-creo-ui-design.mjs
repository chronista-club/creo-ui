/**
 * Phase 2a PoC — 「local build」 vs 「creo-ui-design release」 の diff 検証。
 *
 * Style Dictionary が tokens/ から build した generated と、 creo-ui-design v0.x.x
 * の release artifact が **byte-level で一致する** ことを confirm。 一致 = creo-ui
 * は creo-ui-design release を consume しても結果同じ、 split が semantically clean。
 *
 * 不一致 = drift あり、 token JSON 編集 / transforms 差分が原因。 Phase 2d (slim
 * down) 前にこの drift を解消する必要を signal。
 *
 * Usage:
 *   bun run scripts/fetch-creo-ui-design.mjs   # 先に release を fetch
 *   bun run build                              # local build
 *   bun run scripts/diff-creo-ui-design.mjs    # 比較
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST_DESIGN = path.join(ROOT, 'dist-creo-ui-design')

/** local build の path → release artifact の path */
const PAIRS = [
  {
    label: 'tokens.css',
    local: path.join(ROOT, 'packages/web/dist/tokens.css'),
    release: path.join(DIST_DESIGN, 'web/tokens.css'),
  },
  {
    label: 'tokens.js',
    local: path.join(ROOT, 'packages/web/dist/tokens.js'),
    release: path.join(DIST_DESIGN, 'web/tokens.js'),
  },
  {
    label: 'tokens.d.ts',
    local: path.join(ROOT, 'packages/web/dist/tokens.d.ts'),
    release: path.join(DIST_DESIGN, 'web/tokens.d.ts'),
  },
  {
    label: 'Tokens.swift',
    local: path.join(ROOT, 'packages/swift/Sources/CreoUI/Generated/Tokens.swift'),
    release: path.join(DIST_DESIGN, 'swift/Tokens.swift'),
  },
  {
    label: 'tokens.rs',
    local: path.join(ROOT, 'packages/rust/src/generated/tokens.rs'),
    release: path.join(DIST_DESIGN, 'rust/tokens.rs'),
  },
]

async function fileExists(p) {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

async function main() {
  // pre-flight check
  const manifestPath = path.join(DIST_DESIGN, 'manifest.json')
  if (!(await fileExists(manifestPath))) {
    console.error(
      '[diff-creo-ui-design] no manifest at',
      manifestPath,
      '— run `bun run fetch:design` first',
    )
    process.exit(2)
  }
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  console.log(
    `[diff-creo-ui-design] comparing local vs creo-ui-design ${manifest.tag} (fetched ${manifest.fetchedAt})`,
  )

  const results = []
  for (const { label, local, release } of PAIRS) {
    const localExists = await fileExists(local)
    const releaseExists = await fileExists(release)
    if (!localExists) {
      results.push({ label, status: 'missing-local', local, release })
      continue
    }
    if (!releaseExists) {
      results.push({ label, status: 'missing-release', local, release })
      continue
    }
    const [localBuf, releaseBuf] = await Promise.all([fs.readFile(local), fs.readFile(release)])
    const match = localBuf.equals(releaseBuf)
    results.push({
      label,
      status: match ? 'match' : 'drift',
      localSize: localBuf.length,
      releaseSize: releaseBuf.length,
    })
  }

  const matched = results.filter((r) => r.status === 'match').length
  const drift = results.filter((r) => r.status === 'drift').length
  const missing = results.filter((r) => r.status.startsWith('missing-')).length

  for (const r of results) {
    const symbol =
      r.status === 'match' ? '✓' : r.status === 'drift' ? '✗ (drift)' : `? (${r.status})`
    const detail =
      r.status === 'match'
        ? `${r.localSize} bytes`
        : r.status === 'drift'
          ? `local ${r.localSize}B vs release ${r.releaseSize}B`
          : ''
    console.log(`  ${symbol} ${r.label}${detail ? ` — ${detail}` : ''}`)
  }

  console.log(
    `\n[diff-creo-ui-design] summary: ${matched} match / ${drift} drift / ${missing} missing`,
  )

  if (drift > 0) {
    console.log(
      '  → drift があります。 token JSON / transforms / generator の差を確認してください。',
    )
    process.exit(1)
  }
  if (missing > 0) {
    console.log('  → missing files があります (local build 未実行 or release artifact 不在)。')
    process.exit(2)
  }
  console.log('  → 全 file 一致 ✨ — design SSOT split は consumer 視点で clean。')
}

main().catch((err) => {
  console.error('[diff-creo-ui-design] error:', err.message)
  process.exit(1)
})
