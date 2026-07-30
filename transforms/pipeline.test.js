/**
 * Token pipeline invariant tests — tokens/**.json → 3 platform 出力の値検査。
 *
 * 各 config の buildPath を tmp に差し替えて実 build し、出力 text の
 * **不変条件 (invariant)** を assert する。snapshot (全文一致) にはしない —
 * token を 1 つ足すたびに壊れるテストではなく、「壊れたら本当に壊れている」
 * テストにするため。
 *
 * 動機 (2026-07-30, ladyland consumer feedback レビュー):
 *   scrim の alpha (oklch(0 0 0 / 0.4)) が Swift 出力で落ち、不透明の純黒として
 *   emit されていた (#11)。この class の bug は transform の unit test が 1 行で
 *   防げる — screenshot も browser も不要。
 *
 * 注意: config の source path は repo root 相対 (CLAUDE.md)。このテストも
 * root から実行すること (`bun run test:transforms`)。
 */
import { beforeAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import StyleDictionary from 'style-dictionary'
import rustConfig from './config.rust.js'
import swiftConfig from './config.swift.js'
import webConfig from './config.web.js'

const out = {}

/** buildPath を tmp に差し替え、検査対象 platform だけに絞った config を返す。
 *
 * platform を絞るのは web の js platform (SD 組み込み javascript/es6 /
 * typescript/es6-declarations format) が bun:test 環境で deadlock するため
 * (CLI 経由の通常 build は無事)。このテストの検査対象は custom format の
 * 出力 (css / swift / rust) なので、絞っても検査能力は落ちない。 */
const retarget = (config, tmp, only) => ({
  ...config,
  log: { verbosity: 'silent' },
  platforms: Object.fromEntries(
    Object.entries(config.platforms)
      .filter(([key]) => only.includes(key))
      .map(([key, platform]) => [key, { ...platform, buildPath: `${path.join(tmp, key)}/` }]),
  ),
})

beforeAll(async () => {
  const tmp = mkdtempSync(path.join(tmpdir(), 'creo-pipeline-'))
  const builds = [
    [webConfig, ['css']],
    [swiftConfig, ['swift']],
    [rustConfig, ['rust']],
  ]
  for (const [config, only] of builds) {
    const sd = new StyleDictionary(retarget(config, tmp, only))
    await sd.buildAllPlatforms()
  }
  out.css = readFileSync(path.join(tmp, 'css/tokens.css'), 'utf-8')
  out.swift = readFileSync(path.join(tmp, 'swift/Tokens.swift'), 'utf-8')
  out.swiftThemes = readFileSync(path.join(tmp, 'swift/Themes.swift'), 'utf-8')
  out.rust = readFileSync(path.join(tmp, 'rust/tokens.rs'), 'utf-8')
})

describe('web (tokens.css)', () => {
  test('alpha 付き color が alpha を保持する (scrim 40% / 50%)', () => {
    expect(out.css).toMatch(/--color-surface-scrim: oklch\(0 0 0 \/ 0\.4\)/)
    expect(out.css).toMatch(/--color-surface-scrim-modal: oklch\(0 0 0 \/ 0\.5\)/)
  })

  test('8 theme が全部 emit される (:root default + 7 つの [data-theme])', () => {
    expect(out.css).toMatch(/:root \{/)
    for (const id of [
      'mint-light',
      'sora-light',
      'sora-dark',
      'contrast-light',
      'contrast-dark',
      'oldschool-light',
      'oldschool-dark',
    ]) {
      expect(out.css).toContain(`[data-theme="${id}"]`)
    }
  })

  test('system preference light の逆転 block がある', () => {
    expect(out.css).toMatch(/@media \(prefers-color-scheme: light\)/)
  })

  test('rem 化 policy — 通常 dimension は rem、radius.full (実質無限) は px のまま', () => {
    expect(out.css).toMatch(/--spacing-m: 1\.125rem/) // 18px → rem
    expect(out.css).toMatch(/--radius-full: 9999px/)
  })

  test('alias が var() 参照のまま生き残る (theme 切替の芋づる追従の前提)', () => {
    expect(out.css).toMatch(/--layout-gap-tight: var\(--spacing-xs\)/)
  })
})

describe('swift (Tokens.swift)', () => {
  test('alpha 付き color が opacity 引数で emit される (#11 の回帰防止)', () => {
    expect(out.swift).toMatch(/colorSurfaceScrim = Color\([^)]*opacity: 0\.4000\)/)
    // hex 経由の 1/255 量子化 (0.5 → 0.502) に戻っていないこと
    expect(out.swift).toMatch(/colorSurfaceScrimModal = Color\([^)]*opacity: 0\.5000\)/)
  })

  test('alpha 1 の color は opacity 引数を持たない (diff 最小 policy)', () => {
    const brand = out.swift.match(/colorBrandPrimary = Color\((.*)\)/)
    expect(brand).not.toBeNull()
    expect(brand[1]).not.toContain('opacity')
  })

  test('duration は TimeInterval (秒) — "80ms" String に戻っていない (#8 の回帰防止)', () => {
    expect(out.swift).toMatch(/motionDurationInstant: TimeInterval = 0\.08/)
    expect(out.swift).not.toMatch(/String = "\d+ms"/)
  })

  test('flat 定数の theme は mint-dark のみ (themes segment が ident に漏れない)', () => {
    expect(out.swift).not.toMatch(/colorThemes/)
  })

  test('Swift ident 規約 — 数字始まりの ident が無い', () => {
    expect(out.swift).not.toMatch(/static let \d/)
  })
})

describe('swift (Themes.swift — CreoTheme 8 preset)', () => {
  test('8 preset が全部 emit される (4 family × light/dark)', () => {
    for (const name of [
      'mintDark',
      'mintLight',
      'soraDark',
      'soraLight',
      'contrastDark',
      'contrastLight',
      'oldschoolDark',
      'oldschoolLight',
    ]) {
      expect(out.swiftThemes).toMatch(new RegExp(`static let ${name} = CreoTheme\\(`))
    }
    expect(out.swiftThemes).toMatch(/enum CreoThemeFamily/)
  })

  test('mintDark preset は flat 定数 (Tokens.swift) と同一の Color literal', () => {
    const flat = out.swift.match(/colorBrandPrimary = (Color\([^)]+\))/)[1]
    const preset = out.swiftThemes.match(
      /static let mintDark = CreoTheme\([\s\S]*?brandPrimary: (Color\([^)]+\))/,
    )[1]
    expect(preset).toBe(flat)
  })

  test('alpha 付き slot (shadow / focus halo) が opacity を保持する', () => {
    expect(out.swiftThemes).toMatch(/shadowBase: Color\([^)]*opacity: 0\.3000\)/)
    expect(out.swiftThemes).toMatch(/focusRingHalo: Color\([^)]*opacity: 0\.1800\)/)
  })

  test('gradient slot は struct から除外される (CSS 文字列を持ち込まない)', () => {
    expect(out.swiftThemes).not.toContain('linear-gradient')
    expect(out.swiftThemes).not.toMatch(/gradientHero/)
  })
})

describe('rust (tokens.rs)', () => {
  test('include! 制約 — inner attribute / inner doc が無い (CLAUDE.md)', () => {
    expect(out.rust).not.toContain('#![')
    expect(out.rust).not.toMatch(/^\/\/!/m)
  })

  test('SCREAMING_SNAKE 命名で emit される', () => {
    expect(out.rust).toMatch(/pub const COLOR_BRAND_PRIMARY: Rgb/)
  })

  test('theme は mint-dark のみ', () => {
    expect(out.rust).not.toMatch(/COLOR_THEMES/)
  })

  // 既知の課題 (assert しない): rust の Rgb は alpha を持てず、scrim が不透明に
  // なっている。Rgb struct への field 追加は breaking なので rust-v0.8.0 で対応予定。
})

describe('cross-platform 整合', () => {
  test('spacing.m が 3 platform で同じ実値 (web は rem、swift/rust は px)', () => {
    const rem = Number.parseFloat(out.css.match(/--spacing-m: ([\d.]+)rem/)[1])
    const swift = Number.parseFloat(out.swift.match(/spacingM: CGFloat = ([\d.]+)/)[1])
    const rust = Number.parseFloat(out.rust.match(/SPACING_M: f32 = ([\d.]+)/)[1])
    expect(rem * 16).toBe(swift)
    expect(swift).toBe(rust)
  })

  test('layout.target.tap (44pt Apple HIG) が swift / rust で一致', () => {
    const swift = Number.parseFloat(out.swift.match(/layoutTargetTap: CGFloat = ([\d.]+)/)[1])
    const rust = Number.parseFloat(out.rust.match(/LAYOUT_TARGET_TAP: f32 = ([\d.]+)/)[1])
    expect(swift).toBe(44)
    expect(rust).toBe(44)
  })
})
