/**
 * check-tweak-vars — private tweak var の命名規約を検査する (CI 実行)
 *
 *   --_<component>__<knob>
 *
 * `<component>` は **実在する `.creo-<component>` class そのもの**でなければならない。
 * この 1 本の規約があるだけで、editor-host は var 名を `__` で split するだけで
 * 「どの component のノブか」を確定できる (CSSOM の selectorText 解析が要らない)。
 *
 * 規約が無いと `--_accordion-content-pad-x` が `accordion` なのか
 * `accordion-content` なのか原理的に決まらず、最長一致に頼ることになる。
 * 最長一致は「今たまたま当たっている」だけで、`.creo-btn-pad` のような class が
 * 増えた瞬間に `--_btn-pad-x` の解釈が静かに変わる。ここで弾く。
 *
 * 実行: bun scripts/check-tweak-vars.mjs
 */
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dir, '..')
const CSS_DIR = path.join(ROOT, 'packages/web/src/components')

const files = readdirSync(CSS_DIR).filter((f) => f.endsWith('.css'))
const sources = new Map(files.map((f) => [f, readFileSync(path.join(CSS_DIR, f), 'utf8')]))
const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '')

/** 実在する component class (modifier は落とす): `.creo-btn--sm` → `btn` */
const definedClasses = new Set(
  [...stripComments([...sources.values()].join('\n')).matchAll(/\.creo-([a-z0-9-]+)/g)].map(
    (m) => m[1].split('--')[0],
  ),
)

const errors = []
/** component → knob 名の集合 (fallback 付き使用 = 実際に panel に出るノブ) */
const knobsByComponent = new Map()

for (const [file, src] of sources) {
  const lines = src.split('\n')
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/--_([a-z0-9_-]+)/g)) {
      const name = m[1]
      const where = `${file}:${i + 1}`

      // コメント中の `--_alert__*` のような総称表記は component だけ検査する
      const generic = name.endsWith('__') || name.endsWith('__*')
      const parts = name.split('__')

      if (parts.length !== 2) {
        errors.push(
          `${where}: --_${name} — 規約 --_<component>__<knob> に合いません (__ 区切りが ${parts.length - 1} 個)`,
        )
        continue
      }
      const [component, knob] = parts
      if (!definedClasses.has(component)) {
        errors.push(
          `${where}: --_${name} — 対応する .creo-${component} が存在しません (class 名と揃えてください)`,
        )
        continue
      }
      if (!generic && !knob) {
        errors.push(`${where}: --_${name} — knob 名が空です`)
      }
    }
  })

  // fallback 付きで使われているものだけが実際のノブ
  for (const m of stripComments(src).matchAll(/var\(--_([a-z0-9_-]+)\s*,/g)) {
    const [component, knob] = m[1].split('__')
    if (!component || !knob) continue
    if (!knobsByComponent.has(component)) knobsByComponent.set(component, new Set())
    knobsByComponent.get(component).add(knob)
  }
}

if (errors.length > 0) {
  console.error(`✗ tweak var 命名規約の違反 ${errors.length} 件\n`)
  for (const e of errors) console.error(`  ${e}`)
  console.error('\n規約: --_<component>__<knob> — <component> は実在する .creo-<component> と一致')
  process.exit(1)
}

const componentCount = knobsByComponent.size
const knobCount = [...knobsByComponent.values()].reduce((n, s) => n + s.size, 0)
console.log(
  `✓ tweak var 規約 OK (${componentCount} component / ${knobCount} knob、class ${definedClasses.size})`,
)
