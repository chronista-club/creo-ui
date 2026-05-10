import { For } from 'solid-js'
import { ColorGroup, type ColorSwatchSpec } from '../../ui/ColorSwatch'

// ============================================================
// Operational definition — 4 axis で articulate
// ============================================================
// Color group は「accent」 「neutral」 のような subjective 抽象ではなく、
// 観察可能 / 計測可能な特性 (Purpose / Visual / Hierarchy / Response) で
// articulate する。 これにより新 group 追加や theme family 増設の判断が
// objective rubric に基づく path に shift する。

type AxisRow = {
  readonly group: string
  readonly purpose: string
  readonly visual: string
  readonly hierarchy: string
  readonly response: string
}

const OPERATIONAL: readonly AxisRow[] = [
  {
    group: 'Brand',
    purpose: 'identity / CTA / link / interactive emphasis (action 軸)',
    visual:
      'high chroma + family hue (mint=160、 sora=230、 paradox=270、 oldschool=145)。 light/dark で同 hue を保ちつつ luminance 反転',
    hierarchy: '前景 (foreground action layer) — 視線を引き寄せる focal point',
    response: 'click 期待 / 注意誘導 / family identity 認識 (Creo / 空 / Paradox / Old School)',
  },
  {
    group: 'Semantic',
    purpose: 'status / feedback / state communication (system 状態の声)',
    visual:
      'fixed hue convention: success=145 (chartreuse) / warning=85 (amber) / error=25 (red orange) / info=240 (blue)。 family を超えて 不変',
    hierarchy: 'overlay / inline status — content の流れに割り込む alert layer',
    response: '成功安心 / 警戒注意 / エラー警告 / 情報補足 — 認知バイアスを 利用',
  },
  {
    group: 'Surface',
    purpose: 'structural / layered architecture (空間の床 / 天井 / 壁)',
    visual:
      'low chroma (0-0.04) neutral、 luminance hierarchy: bg-base < bg-subtle < surface < bg-emphasis (4 層)',
    hierarchy: '背景 plane — 認識せず構造受容 (透明性が美意識)',
    response: '構造把握 (これは card / これは bg) を意識せず行う / 没入を妨げない',
  },
  {
    group: 'Text',
    purpose: 'content delivery (読ませる / scan させる / 補足する)',
    visual:
      'low chroma (0-0.02) neutral、 luminance hierarchy で primary > secondary > tertiary > disabled (4 層)',
    hierarchy: '前景 content layer — 視覚的 hierarchy で読み順を 誘導',
    response: 'reading (long-form) / scanning (UI) / disabled 認識 — 疲労最小化',
  },
] as const

// ============================================================
// Rubric — operational から派生する色選定基準
// ============================================================
// 「この hue は Brand に適切か?」 「Surface 層を増やすべきか?」 のような判断を
// subjective from objective に shift する rubric。 token 増設 / theme 増設の
// PR review でこの基準と照合して一貫性を維持。

type RubricItem = {
  readonly group: string
  readonly criteria: readonly string[]
}

const RUBRIC: readonly RubricItem[] = [
  {
    group: 'Brand',
    criteria: [
      'family hue から ±10 以内 (mint=160 ±10、 sora=230 ±10、 etc)',
      'chroma 0.10〜0.20 (識別性確保、 蛍光は避ける)',
      'luminance: dark theme = 0.65〜0.80、 light theme = 0.45〜0.60',
      'hover/active variant は ±0.05 luminance 階段で生成',
    ],
  },
  {
    group: 'Semantic',
    criteria: [
      'fixed hue を破壊しない (success=145 / warning=85 / error=25 / info=240)',
      'platform 共通の意味マッピング — Web / Apple / Rust で同 token 名 = 同意味',
      'theme family を変えても semantic hue は不変 (status の意味は universal)',
      'subtle (低 luminance) 版は背景 tint 用、 text 版は WCAG 4.5+ 確保',
    ],
  },
  {
    group: 'Surface',
    criteria: [
      'chroma 上限 0.04 (色味は brand に譲る、 surface は背景)',
      'luminance 4 層: bg-base / bg-subtle / surface / bg-emphasis が clear に区別',
      'border は surface より luminance 0.05〜0.10 ずらし (visible だが控えめ)',
      'shadow tint は surface と integrated に見える低 chroma',
    ],
  },
  {
    group: 'Text',
    criteria: [
      'WCAG contrast: primary は 7.0+ (AAA)、 secondary は 4.5+ (AA)、 tertiary は 3.0+ (AA Large)',
      'disabled は 1.5+ (識別可能だが「無効」 と認識できる)',
      'inverse は dark surface 上での明色版 (theme で hue 反転)',
      'hue 微小 chroma 0-0.02 (純粋黒/白ではなく僅かな warmth/coolness で家族感)',
    ],
  },
] as const

// ============================================================
// Existing 4 group swatches (token reality 直結)
// ============================================================

const BRAND: readonly ColorSwatchSpec[] = [
  { name: 'color.brand.primary', cssVar: '--color-brand-primary', hint: 'Action / Link / Active' },
  { name: 'color.brand.secondary', cssVar: '--color-brand-secondary', hint: 'Hover / Accent 補色' },
]

const SEMANTIC: readonly ColorSwatchSpec[] = [
  { name: 'color.semantic.success', cssVar: '--color-semantic-success' },
  { name: 'color.semantic.warning', cssVar: '--color-semantic-warning' },
  { name: 'color.semantic.error', cssVar: '--color-semantic-error' },
  { name: 'color.semantic.info', cssVar: '--color-semantic-info' },
]

const SURFACE: readonly ColorSwatchSpec[] = [
  { name: 'color.surface.bg-base', cssVar: '--color-surface-bg-base', hint: 'Page background' },
  { name: 'color.surface.bg-subtle', cssVar: '--color-surface-bg-subtle', hint: 'Code / Tag bg' },
  { name: 'color.surface.surface', cssVar: '--color-surface-surface', hint: 'Card / Panel' },
  { name: 'color.surface.border', cssVar: '--color-surface-border', hint: 'Divider / Outline' },
]

const TEXT: readonly ColorSwatchSpec[] = [
  { name: 'color.text.primary', cssVar: '--color-text-primary', hint: 'Body / Heading' },
  { name: 'color.text.secondary', cssVar: '--color-text-secondary', hint: 'Helper / Caption' },
  { name: 'color.text.tertiary', cssVar: '--color-text-tertiary', hint: 'Disabled / Footer' },
]

export default function Color() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Color</h1>
        <p class="docs-page-lead">
          Color は <strong>4 group</strong> (Brand / Semantic / Surface / Text) を 4 axis で
          operational に articulate。 値は OKLCH、 modern browser がそのまま解釈。 4 family ×
          light/dark = 8 theme で同 token 名のまま値が切替わる (詳細は Theming page)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Color group operational definition — 4 axis</h2>
        <p class="docs-page-helper">
          Color group は <strong>役割 (Purpose)</strong> ×{' '}
          <strong>視覚特性 (Visual character)</strong> × <strong>階層位置 (Hierarchy)</strong> ×{' '}
          <strong>期待される反応 (Response)</strong> の 4 axis で articulate。 「accent」「neutral」
          のような subjective 抽象ではなく、 観察可能 / 計測可能な特性で group を定義することで、
          新色追加 (Tertiary brand?) や theme family 増設の判断が <strong>objective rubric</strong>{' '}
          に基づく path に shift する。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>Group</th>
                <th>役割 (Purpose)</th>
                <th>視覚特性 (Visual)</th>
                <th>階層位置 (Hierarchy)</th>
                <th>期待される反応 (Response)</th>
              </tr>
            </thead>
            <tbody>
              <For each={OPERATIONAL}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.group}</code>
                    </th>
                    <td>{row.purpose}</td>
                    <td>{row.visual}</td>
                    <td>{row.hierarchy}</td>
                    <td>{row.response}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">派生要件 — operational から rubric へ</h2>
        <p class="docs-page-helper">
          各 group の 4 axis から派生する color 選定 rubric。 「この hue は Brand に適切か?」
          「Surface 層を増やすべきか?」 の判断を subjective from objective に shift。 token 増設 /
          theme 増設の PR review でこの基準と照合する。
        </p>
        <dl class="docs-rubric">
          <For each={RUBRIC}>
            {(item) => (
              <>
                <dt>
                  <code>{item.group}</code>
                </dt>
                <dd>
                  <ul>
                    <For each={item.criteria}>{(c) => <li>{c}</li>}</For>
                  </ul>
                </dd>
              </>
            )}
          </For>
        </dl>
      </section>

      <section>
        <h2 class="docs-section-title">Live tokens</h2>
        <p class="docs-page-helper">
          Header の theme switcher で family / light-dark を切替えると、 token 値が同 token 名のまま
          動的に変わるのを確認できます。
        </p>
        <ColorGroup
          title="Brand"
          description="Action / Link / Active state に使う core 色。 brand.primary が CTA、 secondary は hover や accent 補色。"
          swatches={BRAND}
        />
        <ColorGroup
          title="Semantic"
          description="意味を持つ status 色 (toast / alert / form error 等)。 ratatui / egui で同じ意味マッピング、 family を超えて hue 不変。"
          swatches={SEMANTIC}
        />
        <ColorGroup
          title="Surface"
          description="Page background / panel / divider などの構造色。 contrast 維持のため bg-base と surface は十分な luminance 差を持たせる。"
          swatches={SURFACE}
        />
        <ColorGroup
          title="Text"
          description="primary は body / heading、 secondary は helper / caption、 tertiary は disabled / footer。 WCAG contrast を満たすペア構成。"
          swatches={TEXT}
        />
      </section>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* CSS */
.button {
  background: var(--color-brand-primary);
  color: var(--color-text-primary);
}

/* Swift (CreoUITokens) */
Color.colorBrandPrimary

/* Rust (creo-ui::tokens) */
tokens::COLOR_BRAND_PRIMARY  // → Rgb { r, g, b }`}</code>
        </pre>
      </section>
    </>
  )
}
