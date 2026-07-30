/**
 * Docs drift checker — site (apps/site) の記述を実物と静的に照合する。
 *
 * showcase の HTML は間違っていても壊れない (存在しない class も効かない属性値も
 * browser は黙って無視する) ため、drift は型検査でも build でも捕まらない。
 * 2026-07-28 の実測 sweep で発見した 3 class の drift (stepper の data-state 誤記で
 * 状態色が全死、存在しない .creo-accordion-item 等) の再発をここで防ぐ。
 *
 * 検査軸:
 *   1. import specifier   — @chronista-club/* が packages/* の exports に実在するか
 *   2. .creo-* class      — components CSS に定義があるか
 *   3. CSS custom property — tokens.css / components.css / docs.css に定義があるか
 *   4. data-* 属性         — component CSS の [data-...] selector に **名前と値の組** が
 *                            実在するか (名前だけの照合では stepper の事故を拾えない)
 *
 * 前提: packages/web/dist/ が build 済みであること (`bun run build:web`)。
 * 実行: `bun run check:drift` (repo root)。drift があれば exit 1。
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dir, '..')
const rel = (p) => path.relative(ROOT, p)

// ---------- 収集: 実物 (SSOT 側) ----------

const distCss = path.join(ROOT, 'packages/web/dist/tokens.css')
if (!existsSync(distCss)) {
  console.error(
    '✗ packages/web/dist/tokens.css がありません — 先に `bun run build:web` を実行してください',
  )
  process.exit(2)
}

/** dir 以下の全 file path (再帰) */
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name)
    return e.isDirectory() ? walk(full) : [full]
  })

// 1. 有効な import specifier (packages/*/package.json の name + exports)
const validSpecifiers = new Set()
for (const dir of readdirSync(path.join(ROOT, 'packages'), { withFileTypes: true })) {
  if (!dir.isDirectory()) continue
  const pkgPath = path.join(ROOT, 'packages', dir.name, 'package.json')
  if (!existsSync(pkgPath)) continue
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  if (!pkg.name) continue
  validSpecifiers.add(pkg.name)
  for (const key of Object.keys(pkg.exports ?? {})) {
    if (key !== '.') validSpecifiers.add(path.posix.join(pkg.name, key.replace(/^\.\//, '')))
  }
}

// 2/3. class と custom property の定義元 (component CSS + 生成 tokens + site 自身の CSS)
const componentCssDir = path.join(ROOT, 'packages/web/src/components')
const componentCss = readdirSync(componentCssDir)
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(path.join(componentCssDir, f), 'utf-8'))
  .join('\n')
const allCss = [
  componentCss,
  readFileSync(distCss, 'utf-8'),
  readFileSync(path.join(ROOT, 'apps/site/src/styles/docs.css'), 'utf-8'),
].join('\n')

const definedClasses = new Set([...allCss.matchAll(/\.(creo-[a-z0-9-]+)/g)].map((m) => m[1]))
const definedVars = new Set([...allCss.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]))

// 4. component CSS の data 属性 (名前 / 名前=値 / 値を取らない bare 使用)
const cssDataAttrs = new Set([...componentCss.matchAll(/\[data-([a-z0-9-]+)/g)].map((m) => m[1]))
const cssDataPairs = new Set(
  [...componentCss.matchAll(/\[data-([a-z0-9-]+)\s*=\s*"([^"]*)"/g)].map((m) => `${m[1]}=${m[2]}`),
)
const bareAttr = (attr) => new RegExp(`\\[data-${attr}\\](?!\\s*=)`).test(componentCss)

// component CSS の管轄外の data 属性 (editor-host / theme / site 都合)
const ATTR_IGNORE = new Set(['editor-fields', 'editor-mode', 'theme', 'delay', 'testid'])

// ---------- 走査: site 側 ----------

const findings = []
const files = walk(path.join(ROOT, 'apps/site/src')).filter((f) => /\.tsx?$/.test(f))

for (const file of files) {
  const src = readFileSync(file, 'utf-8')
  const lines = src.split('\n')

  lines.forEach((line, i) => {
    const at = `${rel(file)}:${i + 1}`

    // 軸 1: import specifier
    for (const m of line.matchAll(/['"`](@chronista-club\/[^'"`]+)['"`]/g)) {
      if (!validSpecifiers.has(m[1])) findings.push(`${at}  存在しない specifier: ${m[1]}`)
    }

    // 軸 2: class="... creo-* ..."
    for (const m of line.matchAll(/class(?:Name)?=["'`]([^"'`]*creo-[^"'`]*)["'`]/g)) {
      for (const cls of m[1].split(/\s+/)) {
        if (cls.startsWith('creo-') && !definedClasses.has(cls))
          findings.push(`${at}  未定義 class: .${cls}`)
      }
    }

    // 軸 3: var(--...) 参照。実 usage (直後が ")" か "," か空白) だけを対象にする —
    //        説明文中の wildcard 例示 (var(--color-*) 等) を除外するため。
    //        --_* / --demo-* は demo 専用 private var なので対象外。
    for (const m of line.matchAll(/var\((--[a-z0-9-]*[a-z0-9])(?=[),\s])/g)) {
      const v = m[1]
      if (v.startsWith('--_') || v.startsWith('--demo-')) continue
      if (!definedVars.has(v)) findings.push(`${at}  未定義 custom property: ${v}`)
    }

    // 軸 4: creo-* 要素の data-* (名前 + 静的な値)
    const near = `${lines[i - 1] ?? ''}\n${line}`
    if (!/creo-[a-z-]+/.test(near)) return
    for (const m of line.matchAll(/\sdata-([a-z0-9-]+)\s*=\s*["{]([^"}]*)["}]?/g)) {
      const [, attr, rawVal] = m
      if (ATTR_IGNORE.has(attr)) continue
      if (!cssDataAttrs.has(attr)) {
        findings.push(`${at}  CSS に無い data 属性: data-${attr}="${rawVal}"`)
        continue
      }
      const val = rawVal.trim()
      if (!val || /[(){}$]/.test(val)) continue // JSX 式は静的検査の対象外
      if (!cssDataPairs.has(`${attr}=${val}`) && !bareAttr(attr))
        findings.push(`${at}  CSS に無い 属性=値: data-${attr}="${val}"`)
    }
  })
}

// ---------- 報告 ----------

if (findings.length === 0) {
  console.log(
    `✓ docs drift なし (${files.length} files / class ${definedClasses.size} / var ${definedVars.size} / data 属性 ${cssDataAttrs.size})`,
  )
  process.exit(0)
}

console.error(`✗ docs drift ${findings.length} 件:`)
for (const f of findings) console.error(`  ${f}`)
process.exit(1)
