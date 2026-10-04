/**
 * check-mediapipe-version — WASM の版と npm 依存の版が食い違っていないか検査する (CI 実行)
 *
 * `@mediapipe/tasks-vision` の WASM は **npm から読み込む JS と同じ版**でなければ
 * ならない。 食い違うと型検査も build も通るのに **実行時だけ壊れる**。
 *
 * tasks-vision は runtime に版を expose しない (`VERSION` export も `./package.json`
 * への exports も無い) ため、 動的導出ができない。 そこで
 * `packages/vision/src/mediapipe.ts` の `MEDIAPIPE_WASM_VERSION` を SSOT とし、
 * package.json の依存レンジがそれを含むかをここで照合する。
 *
 * 実行: bun scripts/check-mediapipe-version.mjs
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SRC = path.join(ROOT, 'packages/vision/src/mediapipe.ts')

const src = readFileSync(SRC, 'utf8')
const m = src.match(/MEDIAPIPE_WASM_VERSION\s*=\s*'([^']+)'/)
if (!m) {
  console.error('✗ MEDIAPIPE_WASM_VERSION が packages/vision/src/mediapipe.ts に見つからない')
  process.exit(1)
}
const wasmVersion = m[1]

/** `^1.0.1` / `^0.10.0 || ^1.0.0` から満たすべき major を集める */
const majorsOf = (range) => [...range.matchAll(/(\d+)\.\d+\.\d+/g)].map((x) => x[1])

const targets = [
  ['packages/vision/package.json', ['devDependencies', 'peerDependencies']],
  ['apps/site/package.json', ['dependencies']],
]

let failed = false
const wasmMajor = wasmVersion.split('.')[0]

for (const [file, sections] of targets) {
  const pkg = JSON.parse(readFileSync(path.join(ROOT, file), 'utf8'))
  for (const sect of sections) {
    const range = pkg[sect]?.['@mediapipe/tasks-vision']
    if (!range) continue
    const majors = majorsOf(range)
    if (!majors.includes(wasmMajor)) {
      console.error(
        `✗ ${file} [${sect}] = "${range}" は WASM の版 ${wasmVersion} (major ${wasmMajor}) を含まない`,
      )
      failed = true
    }
  }
}

if (failed) {
  console.error(
    '\n  WASM と JS の版が食い違うと実行時にのみ壊れる。' +
      '\n  packages/vision/src/mediapipe.ts の MEDIAPIPE_WASM_VERSION と' +
      '\n  package.json の依存レンジを揃えること。',
  )
  process.exit(1)
}

console.log(`✓ MediaPipe WASM 版 ${wasmVersion} と依存レンジが整合`)
