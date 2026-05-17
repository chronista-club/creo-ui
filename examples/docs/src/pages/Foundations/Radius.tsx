import { A } from '@solidjs/router'
import { For } from 'solid-js'
import { DimensionScale, type DimensionToken } from '../../ui/TokenList'

// ============================================================
// Operational definition — 4 axis で articulate
// ============================================================
// Radius は「rounded / sharp / pill」 のような subjective 形容ではなく、
// 形状語彙 × 適用 surface × 柔らかさ × 用例 の 4 axis で operational に
// articulate。 5 tier convention strict (xs/s/m/l/xl) + 2 special (none/full)
// = 7 step の selection 判断が rubric ベースに shift する。

type AxisRow = {
  readonly token: string
  readonly shape: string
  readonly surface: string
  readonly softness: string
  readonly example: string
}

const OPERATIONAL: readonly AxisRow[] = [
  {
    token: 'none',
    shape: 'sharp / orthogonal — 直角 (radius=0)',
    surface: 'grid lines / table cells / technical surface — 機能優先',
    softness: '0 (硬質、 機械的)',
    example: 'reset / inline image / data table / 技術的 illustration',
  },
  {
    token: 'xs',
    shape: 'minimal rounding — ほぼ直角だが角に微弱なやわらかさ',
    surface: 'inline element / 小さな chip — text-flow に並ぶ要素',
    softness: '1 (whisper)',
    example: 'chip / tag / inline label / small badge',
  },
  {
    token: 's',
    shape: 'gentle rounding — 認識できる丸みだが control 然',
    surface: 'input control — 操作対象の認識',
    softness: '2 (control)',
    example: 'button / input / select / segmented control',
  },
  {
    token: 'm (default)',
    shape: 'rounded — はっきり丸い、 friendly な container',
    surface: 'container surface — content を包む',
    softness: '3 (friendly)',
    example: 'card / popover / tooltip / menu / dropdown panel',
  },
  {
    token: 'l',
    shape: 'soft rounding — はっきり柔らかい、 上位 surface',
    surface: 'elevated surface — overlay / sheet 系',
    softness: '4 (welcoming)',
    example: 'modal / drawer / sheet / dialog frame',
  },
  {
    token: 'xl',
    shape: 'very soft — 包み込む丸み、 immersive',
    surface: 'hero surface — page 内最大の包容性',
    softness: '5 (immersive)',
    example: 'hero card / splash banner / onboarding card / feature tile',
  },
  {
    token: 'full',
    shape: 'pill / circle — 形状を radius が定義する',
    surface: 'shape-defining — 内容より形が priority',
    softness: '∞ (organic)',
    example: 'avatar / circular badge / pill button / tag closer',
  },
] as const

// ============================================================
// Rubric — operational から派生する radius 選定基準
// ============================================================

type RubricItem = {
  readonly category: string
  readonly criteria: readonly string[]
}

const RUBRIC: readonly RubricItem[] = [
  {
    category: '5 tier discipline',
    criteria: [
      'xs / s / m / l / xl の 5 tier convention strict (sm/md/lg 命名禁止)',
      '中央 m が default、 端で発散 (size-feel 認知負荷の下限)',
      '新 step 追加時: visual softness の進行性 (硬質 → 柔らか) に連続的に integrate',
      '5 tier 外の hue を作らない — special semantic (none/full) のみ例外',
    ],
  },
  {
    category: 'Concentric corner (Apple HIG)',
    criteria: [
      '親子の radius は 「子 radius = 親 radius - 親 padding」 で揃える',
      '機械的計算は creoui-editor-host の concentric() helper を使用',
      'theme 切替で親 radius が変わっても子が追従する設計',
      '原則 04 (Concentric corners) の dogfood — 違和感 「中の要素が角に当たって押される」 防止',
    ],
  },
  {
    category: 'Surface 適合 rubric',
    criteria: [
      'inline element (chip / tag) → xs',
      'input control (button / input / select) → s',
      'container surface (card / popover) → m (default)',
      'elevated surface (modal / drawer) → l',
      'hero surface (splash / onboarding) → xl',
      'shape-defining (avatar / pill) → full (special)',
      '同 surface 内で複数 radius を使わない (visual hierarchy 統一)',
    ],
  },
  {
    category: 'Special semantic (none / full)',
    criteria: [
      'none: explicit reset — table cell / 技術的 illustration / strict grid',
      'full: shape-defining — radius が形状の主役 (avatar / pill)',
      '5 tier 内では表現できない 「機能優先 (none)」 と 「形状優先 (full)」 の 2 極',
      '中間 step の代用ではない — 用途が明確に分離している場合のみ採用',
    ],
  },
] as const

// ============================================================
// Existing 7 step swatches
// ============================================================

const RADII: readonly DimensionToken[] = [
  { name: 'radius.none', cssVar: '--radius-none', value: '0px', hint: 'Explicit reset (special)' },
  { name: 'radius.xs', cssVar: '--radius-xs', value: '4px', hint: 'Chip / Tag' },
  { name: 'radius.s', cssVar: '--radius-s', value: '8px', hint: 'Button / Input' },
  { name: 'radius.m', cssVar: '--radius-m', value: '15px', hint: 'Card / Popover (default)' },
  { name: 'radius.l', cssVar: '--radius-l', value: '22px', hint: 'Modal / Drawer' },
  { name: 'radius.xl', cssVar: '--radius-xl', value: '28px', hint: 'Hero surface' },
  {
    name: 'radius.full',
    cssVar: '--radius-full',
    value: '9999px',
    hint: 'Pill / Avatar (special)',
  },
]

export default function Radius() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Radius</h1>
        <p class="docs-page-lead">
          7 step (xs / s / m / l / xl の <strong>5 tier convention</strong> + <code>none</code> /{' '}
          <code>full</code> の 2 special) を <strong>4 axis</strong> (形状語彙 × 適用 surface ×
          柔らかさ × 用例) で operational に articulate。 親子は <strong>concentric corner</strong>{' '}
          (子 = 親 - 親 padding) で揃える慣習 — Apple HIG 由来。 詳細は{' '}
          <A href="/foundations/principles">Principles</A> 原則 4。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Radius operational definition — 4 axis</h2>
        <p class="docs-page-helper">
          各 step を <strong>形状語彙 (Shape vocabulary)</strong> ×{' '}
          <strong>適用 surface (Surface intent)</strong> ×{' '}
          <strong>柔らかさ (Softness scale)</strong> × <strong>用例 (Example)</strong> で
          articulate。 「これは chip だから s 使おう」 ではなく 「inline element に gentle rounding
          を当てたい → s」 のように judge path が rubric ベース になる。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>形状語彙 (Shape)</th>
                <th>適用 surface</th>
                <th>柔らかさ</th>
                <th>用例</th>
              </tr>
            </thead>
            <tbody>
              <For each={OPERATIONAL}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.token}</code>
                    </th>
                    <td>{row.shape}</td>
                    <td>{row.surface}</td>
                    <td>{row.softness}</td>
                    <td>{row.example}</td>
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
          radius 選定 / 新 step 追加 / concentric 設計の判断 rubric。 PR review
          でこの基準と照合する。
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
        <h2 class="docs-section-title">Live tokens</h2>
        <DimensionScale tokens={RADII} type="radius" />
      </section>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* CSS */
.card { border-radius: var(--radius-m); }      /* 15px、 friendly container */
.avatar { border-radius: var(--radius-full); } /* pill / circle */

/* concentric helper (creoui-editor-host) */
import { concentric } from 'creoui-editor-host'
const childRadius = concentric(parentRadius, parentPadding)
// e.g. parent radius=15, parent padding=8 → child radius=7

/* Swift */
.cornerRadius(CreouiTokens.radiusM)

/* Rust (token const) */
creoui::RADIUS_M  // → 15.0 (f32 px)`}</code>
        </pre>
      </section>
    </>
  )
}
