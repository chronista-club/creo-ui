#!/usr/bin/env bun
/**
 * creo-memories/packages/creoui の 8 preset (OKLCH オブジェクト) を読み込み、
 * creoui 側 DTCG JSON として tokens/color/themes/ に書き出す。
 *
 * 出力 path は `color.themes.{theme-id}.{brand, semantic, surface, text, shadow,
 * gradient}.*` — web custom format で themes segment を除くと、旧 creoui 0.0.4
 * までの var 名 (`--color-brand-primary`, `--color-surface-bg-base`,
 * `--color-text-primary` 等) と互換になる。
 *
 * $value は `oklch(l c h [/ a])` string で保持 (precision、modern browser 対応)。
 *
 * 使い方:
 *   bun scripts/generate-themes.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = `${__dirname}/..`
const CM_PRESETS = '/Users/makoto/repos/creo-memories/packages/creoui/src/palette/presets'

const themes = [
  { file: 'light', newId: 'mint-light', exportName: 'lightPalette' },
  { file: 'dark', newId: 'mint-dark', exportName: 'darkPalette' },
  { file: 'sora', newId: 'sora-light', exportName: 'soraPalette' },
  { file: 'sora-dark', newId: 'sora-dark', exportName: 'soraDarkPalette' },
  { file: 'contrast-light', newId: 'contrast-light', exportName: 'contrastLightPalette' },
  { file: 'contrast', newId: 'contrast-dark', exportName: 'contrastPalette' },
  { file: 'oldschool', newId: 'oldschool-light', exportName: 'oldschoolPalette' },
  { file: 'oldschool-dark', newId: 'oldschool-dark', exportName: 'oldschoolDarkPalette' },
]

function oklchToCss(color) {
  const { l, c, h, a } = color
  if (a !== undefined && a < 1) {
    return `oklch(${l} ${c} ${h} / ${a})`
  }
  return `oklch(${l} ${c} ${h})`
}

function gradientToCss(gradient) {
  const stops = gradient.stops
    .map((stop) => `${oklchToCss(stop.color)} ${stop.position}%`)
    .join(', ')
  if (gradient.type === 'linear') {
    return `linear-gradient(${gradient.angle ?? 135}deg, ${stops})`
  }
  return `radial-gradient(${stops})`
}

function colorToDtcg(color, description) {
  return {
    $value: oklchToCss(color),
    $type: 'color',
    $description: description,
  }
}

/**
 * Palette → DTCG。creo-memories の nested structure (brand.primary.{base,hover,...})
 * を creoui 0.0.4 の flat 命名 (brand.primary / brand.primary-hover / ...) に
 * unfold する。これで var 名が旧版と互換になる。
 */
function paletteToDtcg(palette, themeId) {
  const v = palette.values
  const theme = {
    brand: {},
    semantic: {},
    surface: {},
    text: {},
    shadow: {},
  }

  // brand: primary / secondary の scale を flat unfold
  for (const key of ['primary', 'secondary']) {
    const scale = v.brand[key]
    theme.brand[key] = colorToDtcg(scale.base, `Brand ${key} (base)`)
    theme.brand[`${key}-hover`] = colorToDtcg(scale.hover, `Brand ${key} — hover`)
    theme.brand[`${key}-active`] = colorToDtcg(scale.active, `Brand ${key} — active / pressed`)
    theme.brand[`${key}-subtle`] = colorToDtcg(scale.subtle, `Brand ${key} — subtle tint surface`)
  }

  // semantic: success / warning / error / info の scale を flat unfold
  for (const key of ['success', 'warning', 'error', 'info']) {
    const scale = v.semantic[key]
    theme.semantic[key] = colorToDtcg(scale.base, `Semantic ${key} (base)`)
    theme.semantic[`${key}-hover`] = colorToDtcg(scale.hover, `Semantic ${key} — hover`)
    theme.semantic[`${key}-active`] = colorToDtcg(scale.active, `Semantic ${key} — active`)
    theme.semantic[`${key}-subtle`] = colorToDtcg(scale.subtle, `Semantic ${key} — subtle surface`)
    theme.semantic[`${key}-text`] = colorToDtcg(scale.text, `Semantic ${key} — text on tinted bg`)
  }

  // surface: creo-memories の neutral.{background, surface, border} を 0.0.4 flat に
  theme.surface['bg-base'] = colorToDtcg(v.neutral.background.base, 'Root background — page canvas')
  theme.surface['bg-subtle'] = colorToDtcg(
    v.neutral.background.subtle,
    'Subtle background — panels, sections',
  )
  theme.surface['bg-emphasis'] = colorToDtcg(
    v.neutral.background.emphasis,
    'Emphasized background — highlighted regions',
  )
  theme.surface.surface = colorToDtcg(
    v.neutral.surface.base,
    'Card / modal / elevated container surface',
  )
  theme.surface.border = colorToDtcg(v.neutral.border.base, 'Default border / divider')
  theme.surface['border-subtle'] = colorToDtcg(
    v.neutral.border.subtle,
    'Subtle border — quiet separators',
  )

  // text
  theme.text.primary = colorToDtcg(v.neutral.text.primary, 'Primary foreground text')
  theme.text.secondary = colorToDtcg(v.neutral.text.secondary, 'Secondary text — supporting copy')
  theme.text.tertiary = colorToDtcg(v.neutral.text.tertiary, 'Tertiary text — captions, hints')
  theme.text.disabled = colorToDtcg(v.neutral.text.disabled, 'Disabled text')
  theme.text.inverse = colorToDtcg(v.neutral.text.inverse, 'Inverse text — on dark surfaces')

  // shadow tint (creo-memories の neutral.shadow)
  theme.shadow.base = colorToDtcg(v.neutral.shadow.base, 'Shadow tint — default')
  theme.shadow.strong = colorToDtcg(v.neutral.shadow.strong, 'Shadow tint — strong')

  // gradient.hero (optional)
  if (v.gradient?.hero) {
    theme.gradient = {
      hero: {
        $value: gradientToCss(v.gradient.hero),
        $type: 'color',
        $description: 'Hero gradient — marketing / splash surfaces',
      },
    }
  }

  return { color: { themes: { [themeId]: theme } } }
}

async function main() {
  const outDir = `${ROOT}/tokens/color/themes`
  await mkdir(outDir, { recursive: true })

  for (const t of themes) {
    const mod = await import(`${CM_PRESETS}/${t.file}.ts`)
    const palette = mod[t.exportName]
    if (!palette) {
      throw new Error(`Export ${t.exportName} not found in ${t.file}.ts`)
    }
    const dtcg = paletteToDtcg(palette, t.newId)
    const outPath = `${outDir}/${t.newId}.json`
    const body = `${JSON.stringify(dtcg, null, 2)}\n`
    await writeFile(outPath, body)
    console.log(`✔︎ ${outPath} (${palette.name} — ${palette.description})`)
  }

  console.log(`\nDone. 8 themes written to ${outDir}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
