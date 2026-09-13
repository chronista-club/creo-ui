// R02: mem_1Cf1aYkR2EcfhbdmQxpVSx — consume packed artifacts outside the workspace.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const scratch = mkdtempSync(join(tmpdir(), 'creo-package-install-'))
const archives = join(scratch, 'tarballs')
const consumer = join(scratch, 'consumer')
mkdirSync(archives)
mkdirSync(consumer)
const env = { ...process.env, npm_config_cache: join(scratch, 'npm-cache') }
delete env.NODE_PATH
const json = (file) => JSON.parse(readFileSync(file, 'utf8'))
const writeJson = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
const run = (command, args, cwd, capture = false) =>
  execFileSync(command, args, { cwd, env, encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' })

console.log(`Package consumer: ${scratch}`)
const dependencies = {}
const imports = []
const namespaces = []
let exportsChecked = 0
for (const directory of readdirSync(join(root, 'packages'))) {
  const packageRoot = join(root, 'packages', directory)
  let manifest
  try {
    manifest = json(join(packageRoot, 'package.json'))
  } catch (error) {
    if (error.code === 'ENOENT') continue
    throw error
  }
  if (manifest.private) continue
  const [packed] = JSON.parse(
    run(
      'npm',
      ['pack', '--json', '--ignore-scripts', '--workspaces=false', '--pack-destination', archives],
      packageRoot,
      true,
    ),
  )
  dependencies[manifest.name] = `file:../tarballs/${packed.filename}`
  const files = new Set(packed.files.map((file) => file.path))
  const checkTarget = (target) => {
    if (typeof target === 'string') {
      assert.ok(
        files.has(target.replace(/^\.\//, '')),
        `${manifest.name}: missing packed export ${target}`,
      )
    } else {
      for (const value of Object.values(target)) checkTarget(value)
    }
  }
  for (const [entry, target] of Object.entries(manifest.exports)) {
    checkTarget(target)
    exportsChecked++
    const specifier = manifest.name + (entry === '.' ? '' : entry.slice(1))
    if (entry.endsWith('.json')) continue
    if (entry.endsWith('.css')) {
      imports.push(`import ${JSON.stringify(specifier)}`)
    } else {
      const namespace = `entry${namespaces.length}`
      imports.push(`import * as ${namespace} from ${JSON.stringify(specifier)}`)
      namespaces.push(namespace)
    }
  }
}
assert.ok(namespaces.length > 0, 'No public JS exports found')
// Exact build-tool versions from this checkout; the consumer has no workspace/src aliases.
for (const tool of ['typescript', 'vite', 'solid-js']) {
  dependencies[tool] = json(join(root, 'node_modules', tool, 'package.json')).version
}
writeJson(join(consumer, 'package.json'), {
  name: 'creo-package-consumer',
  private: true,
  type: 'module',
  dependencies,
  scripts: { typecheck: 'tsc --noEmit', build: 'vite build' },
})
writeJson(join(consumer, 'tsconfig.json'), {
  compilerOptions: {
    target: 'ES2022',
    module: 'ESNext',
    moduleResolution: 'Bundler',
    strict: true,
    skipLibCheck: false,
    lib: ['ES2022', 'DOM'],
    jsx: 'preserve',
    jsxImportSource: 'solid-js',
  },
  include: ['main.ts', 'assets.d.ts'],
})
writeFileSync(join(consumer, 'assets.d.ts'), "declare module '*.css'\n")
writeFileSync(
  join(consumer, 'main.ts'),
  `${imports.join('\n')}\ndocument.body.textContent = [${namespaces.join(', ')}].map(entry => Object.keys(entry).join(', ')).join('\\n')\n`,
)
writeFileSync(
  join(consumer, 'index.html'),
  '<!doctype html><html><head><title>Package consumer</title></head><body><script type="module" src="/main.ts"></script></body></html>\n',
)
run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund'], consumer)
// A shipped stylesheet can resolve yet silently reference obsolete design tokens.
const tokenCss = readFileSync(
  join(consumer, 'node_modules/@chronista-club/creo-ui/dist/tokens.css'),
  'utf8',
)
const markdownCss = readFileSync(
  join(consumer, 'node_modules/creo-ui-md-view/dist/styles.css'),
  'utf8',
)
const declaredTokens = new Set([...tokenCss.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]))
for (const [, token] of markdownCss.matchAll(/var\((--[\w-]+)\)/g)) {
  assert.ok(declaredTokens.has(token), `Markdown CSS references missing token: ${token}`)
}
run('npm', ['run', 'typecheck'], consumer)
run('npm', ['run', 'build'], consumer)

// Reuse the exact lockfile in a second clean directory, not the first node_modules.
const locked = join(scratch, 'locked-consumer')
mkdirSync(locked)
for (const file of [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'assets.d.ts',
  'main.ts',
  'index.html',
]) {
  cpSync(join(consumer, file), join(locked, file))
}
const digest = (file) => createHash('sha256').update(readFileSync(file)).digest('hex')
const lockHash = digest(join(locked, 'package-lock.json'))
run('npm', ['ci', '--ignore-scripts', '--no-audit', '--no-fund'], locked)
assert.equal(digest(join(locked, 'package-lock.json')), lockHash, 'npm ci changed the lockfile')
run('npm', ['run', 'typecheck'], locked)
run('npm', ['run', 'build'], locked)
console.log(
  `PASS: ${exportsChecked} packed exports; fresh install and locked reinstall both typecheck and build`,
)
