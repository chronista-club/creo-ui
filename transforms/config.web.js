/**
 * Style Dictionary config for Web platform.
 *
 * Generates CSS custom properties from W3C DTCG tokens.
 * Consumed by creo-ui-web (packages/web).
 *
 * Theme matrix (0.1.0+):
 *   tokens/color/themes/*.json には `color.themes.{theme-id}.*` path の
 *   token を宣言する。custom format `css/creo-ui-themed` は、
 *   - themeId segment を var 名から除去
 *   - Mint Dark を :root default に出力
 *   - 他 7 theme を [data-theme="{id}"] で出力
 *   - fleetstage 後方互換 alias (.dark / [data-theme="dark"] / [data-theme="light"])
 *   - @media (prefers-color-scheme: light) で default dark → mint-light に逆転
 *   を 1 つの tokens.css に concat する。
 *
 *   editor-mode / spacing / radius / shadow / typography は theme 非依存で
 *   :root に 1 回だけ emit。
 *
 * Unit policy (0.2.0+):
 *   dimension type の px 値は **build 時に rem に変換して emit** する
 *   (1rem = 16px を前提、18px → 1.125rem)。user の browser font 設定
 *   (zoom / 文字サイズ) に UI が比例追従する accessibility-friendly な
 *   配布形が Creo UI Web の default。source tokens (tokens/<cat>/<file>.json)
 *   は px のまま保持し、Swift / Rust はそちらを直接使用。
 *
 *   例外:
 *     - `0px` → `0` (unit 不要)
 *     - `1000px` を超える値 (例: radius.full = 9999px) は px のまま保持
 *       (semantic に "実質無限" を表す数値、rem 化すると意味が失われる)
 *     - shadow 内の px (spread / offset) は shadow 値全体の parse になるので
 *       今は触らず保持 (将来: shadow 専用 parser で rem 化可能)
 */

const DEFAULT_THEME_ID = 'mint-dark'
const LIGHT_ALIAS_THEME_ID = 'mint-light'

/** themed token の var 名は "--color-{残り path をハイフン結合}" */
const themedVarName = (path) => `--color-${path.slice(3).join('-')}`

/** 非 themed token の var 名は "--{path をハイフン結合}" */
const nonThemedVarName = (path) => `--${path.join('-')}`

/**
 * dimension token の px 値を rem に変換する (1rem = 16px 前提)。
 *   - `0px` → `'0'`
 *   - `|value| > 1000px` → 原値保持 (semantic-infinity 値は px のまま)
 *   - それ以外 → 16 で割って 4 桁精度の rem 表現
 *   - non-px (em / rem / %) や数値でない場合は null を返して呼び側で無視させる
 */
const pxToRem = (value) => {
  if (typeof value !== 'string') return null
  const m = /^(-?\d+(?:\.\d+)?)px$/.exec(value.trim())
  if (!m) return null
  const num = Number.parseFloat(m[1])
  if (num === 0) return '0'
  if (Math.abs(num) > 1000) return value // full=9999 等は px のまま
  const rem = num / 16
  return `${Number(rem.toFixed(4))}rem`
}

/**
 * token.$value から CSS 値を render する。
 *   1. DTCG alias (`{path}`) → `var(--...)` 参照として emit
 *   2. dimension 型の px 値 → rem に変換 (pxToRem)
 *   3. それ以外 → 値をそのまま
 */
const renderValue = (token) => {
  const original = token.original?.$value ?? token.original?.value
  if (typeof original === 'string' && /^\{[^}]+\}$/.test(original)) {
    const refPath = original.slice(1, -1).split('.')
    return `var(--${refPath.join('-')})`
  }
  const value = token.$value ?? token.value
  const type = token.$type ?? token.type
  if (type === 'dimension') {
    const rem = pxToRem(value)
    if (rem !== null) return rem
  }
  return value
}

const renderDescription = (token) => {
  const desc = token.$description
  return desc ? ` /** ${String(desc).replace(/\*\//g, '*\\/')} */` : ''
}

const isThemed = (token) => token.path[0] === 'color' && token.path[1] === 'themes'

/** theme id を path の 3 番目から取得 */
const themeIdOf = (token) => token.path[2]

export default {
  source: ['tokens/**/*.json'],
  hooks: {
    formats: {
      'css/creo-ui-themed': ({ dictionary }) => {
        // Common (theme-非依存) tokens は category (path[0]) ごとに group して、
        // :root を category 別に複数 block で emit する。
        // Why: 単一 :root block に 150+ props 入れると Chrome の CSS parser が
        //   block 全体を drop する閾値に当たり、 token が解決されない事故が出る
        //   (v0.18 で 169 props に到達して visible regression 発生)。
        //   category 別に分けると 各 block 50 props 以下に収まり parser が安定。
        //
        // Note (block 順): commonBlocks は Object.keys().sort() でアルファベット
        //   順 emit している。 CSS variable は **late binding** (cascade 後に
        //   resolve) で順序依存性は無いため、 cross-category alias (例:
        //   layout.gap.section が margin.l を参照) があっても browser 解決で
        //   問題は出ない。 ただし build-step で eager に var() inline 展開
        //   する transform を将来追加する場合 (postcss-custom-properties 等)、
        //   topological sort へ切替える必要が出る点に注意。
        //   現時点の cross-category alias: layout.gap.* → spacing/margin,
        //   typography.{body,title}.* → typography.{size,display}。
        const commonByCategory = {}
        const themes = {}

        for (const token of dictionary.allTokens) {
          if (isThemed(token)) {
            const tid = themeIdOf(token)
            const line = `  ${themedVarName(token.path)}: ${renderValue(token)};${renderDescription(token)}`
            if (!themes[tid]) themes[tid] = []
            themes[tid].push(line)
          } else {
            const line = `  ${nonThemedVarName(token.path)}: ${renderValue(token)};${renderDescription(token)}`
            const cat = token.path[0]
            if (!commonByCategory[cat]) commonByCategory[cat] = []
            commonByCategory[cat].push(line)
          }
        }

        const defaultLines = themes[DEFAULT_THEME_ID] ?? []
        const lightAliasLines = themes[LIGHT_ALIAS_THEME_ID] ?? []

        const themeBlocks = Object.keys(themes)
          .sort()
          .map((tid) => [`[data-theme="${tid}"] {`, ...themes[tid], '}'].join('\n'))
          .join('\n\n')

        const header = [
          '/**',
          ' * Do not edit directly — generated by Style Dictionary from Creo UI tokens.',
          ' * Source: tokens/**/*.json (DTCG).',
          ' *',
          ' * Default theme: mint-dark (Creo Design System default)',
          ' * Switch theme via `[data-theme="{id}"]` attribute on any ancestor.',
          ' * fleetstage 後方互換: `.dark` / `[data-theme="dark"]` = mint-dark、',
          ' * `[data-theme="light"]` = mint-light。',
          ' *',
          ' * NOTE: :root block は category (depth / editor-mode / frame / layout 等)',
          ' * 別に分割して emit する (Chrome CSS parser の prop-count 閾値回避)。',
          ' */',
          '',
        ].join('\n')

        const commonBlocks = Object.keys(commonByCategory)
          .sort()
          .map((cat) =>
            [`/* === ${cat} === */`, ':root {', ...commonByCategory[cat], '}'].join('\n'),
          )
          .join('\n\n')

        const defaultThemeBlock = [
          `/* === default theme color (${DEFAULT_THEME_ID}) === */`,
          ':root {',
          ...defaultLines,
          '}',
        ].join('\n')

        const rootBlock = `${commonBlocks}\n\n${defaultThemeBlock}`

        const fleetstageAlias = [
          '/* fleetstage / legacy 後方互換 */',
          '.dark,',
          '[data-theme="dark"] {',
          ...defaultLines,
          '}',
          '',
          '[data-theme="light"] {',
          ...lightAliasLines,
          '}',
        ].join('\n')

        const prefersLight =
          lightAliasLines.length > 0
            ? [
                '/* system が light preference で [data-theme] 未指定なら mint-light に逆転 */',
                '@media (prefers-color-scheme: light) {',
                '  :root:not([data-theme]):not(.dark):not([data-theme="mint-dark"]) {',
                ...lightAliasLines.map((line) => `  ${line}`),
                '  }',
                '}',
              ].join('\n')
            : ''

        return `${header}${rootBlock}\n\n${themeBlocks}\n\n${fleetstageAlias}\n\n${prefersLight}\n`
      },
    },
  },
  platforms: {
    css: {
      transformGroup: 'css',
      buildPath: 'packages/web/dist/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/creo-ui-themed',
        },
      ],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'packages/web/dist/',
      files: [
        {
          destination: 'tokens.js',
          format: 'javascript/es6',
        },
        {
          destination: 'tokens.d.ts',
          format: 'typescript/es6-declarations',
        },
      ],
    },
  },
}
