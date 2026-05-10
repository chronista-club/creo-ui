import { A } from '@solidjs/router'
import { For } from 'solid-js'
import { DimensionScale, type DimensionToken } from '../../ui/TokenList'

// ============================================================
// Operational definition — 4 axis で articulate
// ============================================================
// Spacing 系は token category (spacing / margin / layout.gap / layout.target)
// が 4 つ並走する設計。 各 category を「距離 (Distance) × 役割 (Role) ×
// 心理的距離 (Psychological gap) × 適用 surface」 の 4 axis で articulate。
// 5 tier convention (xs/s/m/l/xl) は全 category 共通の骨格、 中央 m=18px で
// 結節し端で発散 (原則 1-2 dogfood)。

type AxisRow = {
  readonly category: string
  readonly distance: string
  readonly role: string
  readonly psychGap: string
  readonly surface: string
}

const OPERATIONAL: readonly AxisRow[] = [
  {
    category: 'spacing.*',
    distance: '4-32 px (5 tier、 5 tier xs/s/m/l/xl)',
    role: '要素「間」 — sibling rhythm',
    psychGap: '密 (密着 / 隣接 / 関連) — 同じかたまりの中の breath',
    surface: 'card 内側 padding / form field 縦間隔 / list item 間 / icon-label inline',
  },
  {
    category: 'margin.*',
    distance: '8-64 px (5 tier、 端で発散 — l=40 / xl=64)',
    role: 'block「外」 — block break',
    psychGap: '疎 (区切り / 呼吸 / 分離) — 異なるかたまりの境界',
    surface: 'section divider / hero と footer の major break / page-level breathing',
  },
  {
    category: 'layout.gap.*',
    distance: 'tight (4) / sibling (18) / section (40) / page (64) — semantic alias',
    role: 'consumer 視点の意図 — base token を意味で参照',
    psychGap: 'tight (詰まる) → sibling (流れる) → section (区切る) → page (隔てる)',
    surface: 'flexbox / grid gap、 base 変えれば全 alias 同期 (原則 3 dogfood)',
  },
  {
    category: 'layout.target.*',
    distance: '24-44 px (a11y 確保、 5 tier 外 special)',
    role: 'input control の最小 hit 領域 — accessibility 要件',
    psychGap: 'tap (touch、 大) → focus (pointer、 中) → hit (dense、 小)',
    surface: 'button height / link inline tap area / icon button / form control',
  },
] as const

// ============================================================
// Rubric — operational から派生する spacing 選定基準
// ============================================================

type RubricItem = {
  readonly category: string
  readonly criteria: readonly string[]
}

const RUBRIC: readonly RubricItem[] = [
  {
    category: '5 tier discipline (原則 1)',
    criteria: [
      'xs / s / m / l / xl の 5 tier convention strict (sm/md/lg 命名禁止)',
      '中央 m が default、 端で発散 (Miller 7±2 法則 — 認知負荷の下限)',
      '新 step 追加禁止 (5 tier 外の hue を作らない)',
      'Component の size variant は s/m/l の 3 段階 = 5 tier から中央 3 段抜粋',
    ],
  },
  {
    category: 'Spacing vs Margin (原則 2)',
    criteria: [
      'spacing.* = 要素「間」 (sibling、 密)',
      'margin.* = block「外」 (section、 疎)',
      '中央 m=18px で結節 (両 scale が一致する hub)、 端 (l/xl) で発散',
      'spacing.l=24 / margin.l=40 (1.67 倍)、 spacing.xl=32 / margin.xl=64 (2 倍)',
      'form field 縦間隔は spacing.s、 hero と footer の間は margin.xl',
    ],
  },
  {
    category: 'Token vs Alias 二層 (原則 3)',
    criteria: [
      'consumer は layout.gap.* alias を使う (意図表現 = sibling / section / page)',
      'maintainer は base token (spacing / margin) を tune',
      'base を変えれば全 alias の値が DTCG token reference 機構で自動追従',
      '単層 (alias 無し) だと意図表現が弱い、 単層 (atomic 無し) だと再利用性破綻',
    ],
  },
  {
    category: 'Accessibility target',
    criteria: [
      'tap target ≥ 44px (Apple HIG accessibility requirement、 touch device)',
      'focus target ≥ 32px (pointer-friendly desktop)',
      'hit target ≥ 24px (dense UI、 hover affordance を伴う場合のみ)',
      '5 tier 外の special semantic (a11y 用途固定) として articulate',
    ],
  },
] as const

// ============================================================
// Existing token data (5 tier x 4 category)
// ============================================================

const SPACING: readonly DimensionToken[] = [
  { name: 'spacing.xs', cssVar: '--spacing-xs', value: '4px' },
  { name: 'spacing.s', cssVar: '--spacing-s', value: '8px' },
  { name: 'spacing.m', cssVar: '--spacing-m', value: '18px', hint: '5 tier convention の中央' },
  { name: 'spacing.l', cssVar: '--spacing-l', value: '24px' },
  { name: 'spacing.xl', cssVar: '--spacing-xl', value: '32px' },
]

const MARGIN: readonly DimensionToken[] = [
  { name: 'margin.xs', cssVar: '--margin-xs', value: '8px' },
  { name: 'margin.s', cssVar: '--margin-s', value: '16px' },
  { name: 'margin.m', cssVar: '--margin-m', value: '18px', hint: 'spacing.m と揃える' },
  { name: 'margin.l', cssVar: '--margin-l', value: '40px' },
  { name: 'margin.xl', cssVar: '--margin-xl', value: '64px' },
]

const GAPS: readonly DimensionToken[] = [
  {
    name: 'layout.gap.tight',
    cssVar: '--layout-gap-tight',
    value: '4px',
    hint: '→ {spacing.xs} (icon+label inline / chip)',
  },
  {
    name: 'layout.gap.sibling',
    cssVar: '--layout-gap-sibling',
    value: '18px',
    hint: '→ {spacing.m} (form field 縦間隔 / list item 間)',
  },
  {
    name: 'layout.gap.section',
    cssVar: '--layout-gap-section',
    value: '40px',
    hint: '→ {margin.l} (section to section)',
  },
  {
    name: 'layout.gap.page',
    cssVar: '--layout-gap-page',
    value: '64px',
    hint: '→ {margin.xl} (hero / footer の major break)',
  },
]

const TARGETS: readonly DimensionToken[] = [
  {
    name: 'layout.target.tap',
    cssVar: '--layout-target-tap',
    value: '44px',
    hint: 'Apple HIG min tap (touch)',
  },
  {
    name: 'layout.target.focus',
    cssVar: '--layout-target-focus',
    value: '32px',
    hint: 'Pointer-friendly',
  },
  {
    name: 'layout.target.hit',
    cssVar: '--layout-target-hit',
    value: '24px',
    hint: 'Dense UI w/ hover affordance',
  },
]

export default function Spacing() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Spacing & Margin</h1>
        <p class="docs-page-lead">
          5 tier convention に基づく <strong>4 token category</strong> (spacing / margin /
          layout.gap / layout.target) を <strong>4 axis</strong> (距離 × 役割 × 心理的距離 × 適用
          surface) で articulate。 spacing.* = 要素「間」 (sibling)、 margin.* = block「外」
          (section)。 同 m=18px で結節、 l/xl で発散。 詳細は{' '}
          <A href="/foundations/principles">Principles</A> 原則 1-3。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Spacing operational definition — 4 axis</h2>
        <p class="docs-page-helper">
          各 token category を <strong>距離 (Distance scale)</strong> × <strong>役割 (Role)</strong>{' '}
          × <strong>心理的距離 (Psychological gap)</strong> × <strong>適用 surface</strong> で
          articulate。 「間隔を取る」 という単純な操作ではなく 「sibling か section か」
          「密か疎か」 を意識した judge path に shift する。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>距離 (Distance)</th>
                <th>役割 (Role)</th>
                <th>心理的距離</th>
                <th>適用 surface</th>
              </tr>
            </thead>
            <tbody>
              <For each={OPERATIONAL}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.category}</code>
                    </th>
                    <td>{row.distance}</td>
                    <td>{row.role}</td>
                    <td>{row.psychGap}</td>
                    <td>{row.surface}</td>
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
          token 増設 / consumer の token 選定 / a11y 要件の判断 rubric。 PR review で照合する。
        </p>
        <dl class="docs-rubric">
          <For each={RUBRIC}>
            {(item) => (
              <>
                <dt>
                  <code>{item.category}</code>
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
        <h2 class="docs-section-title">spacing.* — sibling 間</h2>
        <p class="docs-page-helper">
          要素同士の <strong>密な</strong> gap。 form field 縦間隔、 list item 間、 icon と label の
          inline、 card 内側の padding 等。
        </p>
        <DimensionScale tokens={SPACING} type="spacing" />
      </section>

      <section>
        <h2 class="docs-section-title">margin.* — block 外</h2>
        <p class="docs-page-helper">
          block 同士の <strong>呼吸する</strong> rhythm。 section 間、 hero / footer の major
          break。 spacing より大きくなる方向 (l/xl) で発散して呼吸量を増やす。
        </p>
        <DimensionScale tokens={MARGIN} type="spacing" />
      </section>

      <section>
        <h2 class="docs-section-title">layout.gap.* — semantic alias</h2>
        <p class="docs-page-helper">
          意図を表現する semantic alias。 base token (spacing / margin) を参照しているので、 base
          を変えれば全 alias が同期。 consumer は alias を使う、 maintainer は base を tune する。
        </p>
        <DimensionScale tokens={GAPS} type="spacing" />
      </section>

      <section>
        <h2 class="docs-section-title">layout.target.* — accessibility</h2>
        <p class="docs-page-helper">
          input control の最小サイズ (button, link, etc.)。 device / context に応じて 3 段階。
        </p>
        <DimensionScale tokens={TARGETS} type="spacing" />
      </section>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* CSS */
.card {
  padding: var(--spacing-m);            /* 内側 — sibling scale */
  gap: var(--layout-gap-sibling);        /* alias 推奨 */
}
section + section {
  margin-top: var(--layout-gap-section); /* → margin.l = 40px */
}

/* a11y target */
.button {
  min-height: var(--layout-target-tap);  /* 44px (Apple HIG) */
}

/* Swift */
.padding(CreoUITokens.spacingM)         // Component 内側
.padding(.top, CreoUITokens.marginL)    // Section 間

/* Rust (token const) */
creo_ui::SPACING_M   // → 18.0 (f32 px、 ratatui consumer は cell 換算で適用)
creo_ui::MARGIN_L    // → 40.0`}</code>
        </pre>
      </section>
    </>
  )
}
