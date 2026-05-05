/**
 * Phase 2a PoC — fetch creo-ui-design release artifacts。
 *
 * `chronista-club/creo-ui-design` の GitHub Releases から指定 tag (default: latest)
 * の artifact 6 種を download し、 `dist-creo-ui-design/{web,swift,rust}/` に配置。
 *
 * 目的: 「design SSOT split」 試行の consumer 検証。 creo-ui (TS) が
 * creo-ui-design release を consume できるか + local Style Dictionary build
 * と内容一致するかを後段で diff 検証する base にする。
 *
 * 既存 creo-ui の build chain (tokens/ + transforms/ + Style Dictionary) は
 * **keep** — 試行 phase で並走、 完全置換は別 sprint (Phase 2d)。
 *
 * Usage:
 *   bun run scripts/fetch-creo-ui-design.mjs              # latest
 *   bun run scripts/fetch-creo-ui-design.mjs v0.0.1      # 特定 tag
 *   CREO_UI_DESIGN_TAG=v0.0.1 bun run fetch:design       # env 経由
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'

const REPO = 'chronista-club/creo-ui-design'
const REQUESTED_TAG = process.argv[2] ?? process.env.CREO_UI_DESIGN_TAG ?? 'latest'

const ROOT = path.resolve(import.meta.dirname, '..')
const DIST_BASE = path.join(ROOT, 'dist-creo-ui-design')

/** GitHub Releases に attach された artifact の path layout */
const ARTIFACTS = [
  { name: 'tokens.css', dir: 'web' },
  { name: 'tokens.js', dir: 'web' },
  { name: 'tokens.d.ts', dir: 'web' },
  { name: 'Tokens.swift', dir: 'swift' },
  { name: 'tokens.rs', dir: 'rust' },
  { name: 'tokens-source.tar.gz', dir: '_source' },
]

async function fetchRelease() {
  const url =
    REQUESTED_TAG === 'latest'
      ? `https://api.github.com/repos/${REPO}/releases/latest`
      : `https://api.github.com/repos/${REPO}/releases/tags/${REQUESTED_TAG}`
  console.log(`[fetch-creo-ui-design] querying ${url}`)
  const res = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'creo-ui-fetch-script',
    },
  })
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`)
  }
  return res.json()
}

async function downloadArtifact(downloadUrl, destPath) {
  const res = await fetch(downloadUrl, {
    headers: { 'User-Agent': 'creo-ui-fetch-script' },
    redirect: 'follow',
  })
  if (!res.ok) {
    throw new Error(`download failed ${res.status}: ${downloadUrl}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.mkdir(path.dirname(destPath), { recursive: true })
  await fs.writeFile(destPath, buf)
  return buf.length
}

async function main() {
  const release = await fetchRelease()
  console.log(`[fetch-creo-ui-design] release ${release.tag_name} (${release.name})`)

  // Clean previous dist
  await fs.rm(DIST_BASE, { recursive: true, force: true })

  let totalBytes = 0
  for (const { name, dir } of ARTIFACTS) {
    const asset = release.assets.find((a) => a.name === name)
    if (!asset) {
      console.warn(`  ⚠ ${name} not found in release ${release.tag_name}`)
      continue
    }
    const destPath = path.join(DIST_BASE, dir, name)
    const bytes = await downloadArtifact(asset.browser_download_url, destPath)
    totalBytes += bytes
    console.log(`  ✓ ${dir}/${name} (${bytes} bytes)`)
  }

  // Manifest を書く (consumer が tag / fetch 時刻を知る用)
  const manifest = {
    fetchedAt: new Date().toISOString(),
    sourceRepo: REPO,
    tag: release.tag_name,
    releaseUrl: release.html_url,
    artifacts: ARTIFACTS.map((a) => `${a.dir}/${a.name}`),
  }
  await fs.writeFile(
    path.join(DIST_BASE, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
  )

  console.log(
    `[fetch-creo-ui-design] done — ${ARTIFACTS.length} artifacts (${totalBytes} bytes total)`,
  )
  console.log(
    `[fetch-creo-ui-design] manifest: ${path.relative(ROOT, path.join(DIST_BASE, 'manifest.json'))}`,
  )
}

main().catch((err) => {
  console.error('[fetch-creo-ui-design] error:', err.message)
  process.exit(1)
})
