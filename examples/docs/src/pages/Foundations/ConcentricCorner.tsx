import { A } from '@solidjs/router'
import { For } from 'solid-js'

// ============================================================
// Operational definition — 4 axis で articulate
// ============================================================
// Concentric corner は「親子の角を視覚的に同心円で揃える」 慣習。 Apple HIG
// (iOS 16+ / visionOS 26) で formal articulate、 Creo UI でも原則 04 (Principles)
// として SSOT 化。 子 radius = 親 radius - 親 padding の formula で機械的に
// 揃える、 helper は creo-ui-editor-host の concentric() / concentricTokens()。

type AxisRow = {
  readonly useCase: string
  readonly formula: string
  readonly visible: string
  readonly implementation: string
}

const OPERATIONAL: readonly AxisRow[] = [
  {
    useCase: 'Card 内 button',
    formula: 'parent radius.m (15px) - parent padding spacing.m (18px) → calc',
    visible:
      '親 padding が大きい (18 > 15) ため child radius が負数、 結果は 0 (sharp)。 親 radius を radius.l (22px) に格上げするか、 padding を spacing.s (8px) に下げる',
    implementation: '`concentric("var(--radius-l)", "var(--spacing-s)")` → calc(22 - 8) = 14px',
  },
  {
    useCase: 'Modal / Dialog 内 panel',
    formula: 'parent radius.l (22px) - parent padding spacing.l (24px) → calc',
    visible: '同様 negative、 親 radius を radius.xl (28px) に格上げで child = 4px',
    implementation: '`concentric("var(--radius-xl)", "var(--spacing-l)")` → 28 - 24 = 4px',
  },
  {
    useCase: 'Hero card 内 nested card',
    formula: 'parent radius.xl (28px) - parent padding spacing.l (24px) → calc',
    visible: 'child radius = 4px、 hero の柔らかい外形に内側の panel が同心円で並ぶ',
    implementation: '`concentric("var(--radius-xl)", "var(--spacing-l)")` (xl に格上げで余裕)',
  },
  {
    useCase: 'Avatar 内 status dot',
    formula: 'avatar = radius.full (pill)、 dot は formula 不要 (= radius.full で同心円)',
    visible: '両方 pill / circle なので formula 計算不要、 子 dot も radius.full 採用',
    implementation: 'special semantic radius.full の dogfood、 formula 適用外',
  },
] as const

// ============================================================
// Rubric — operational から派生する concentric 設計基準
// ============================================================

type RubricItem = {
  readonly category: string
  readonly criteria: readonly string[]
}

const RUBRIC: readonly RubricItem[] = [
  {
    category: 'Apple HIG / visionOS 26 spec',
    criteria: [
      'iOS 16+ で SwiftUI cornerRadius は default で concentric を internal 計算',
      'visionOS 26 (2025-06 announcement) で container-concentric が formal spec 化',
      'real-time lensing / specular highlights を含む Liquid Glass の foundation',
      'Creo UI は Web (CSS calc) / Apple (SwiftUI default) / Rust (手計算 + concentric helper) で articulate',
    ],
  },
  {
    category: 'Formula (子 radius = 親 radius - 親 padding)',
    criteria: [
      '親 radius > 親 padding の関係を保つ (negative child radius は anti-pattern)',
      '親 radius が小さい (m=15px) 場合、 padding を spacing.s (8px) 以下に設計',
      'multi-level nesting (grandparent → parent → child) は各 level で再帰計算',
      'special radius (none / full) では formula 適用外',
    ],
  },
  {
    category: 'Helper API (creo-ui-editor-host)',
    criteria: [
      '`concentric(parentRadius, padding)` — string (CSS length) を受けて calc() string を返す',
      '`concentricTokens(radiusKey, paddingKey, opts?)` — token key の shortcut',
      'CSS 計算 ベース (build-time ではなく runtime) — token 切替で自動追従',
      'Swift / Rust では native cornerRadius が default concentric (Web 専用 helper)',
    ],
  },
  {
    category: 'Anti-pattern',
    criteria: [
      'Inverse concentric (子 radius > 親 radius) — 子が親に「食い込む」 視覚的違和感',
      'Random radius nesting (formula 無視) — 同心円が崩れて 「角に押される」 不快感',
      'Padding が radius を上回る (negative child) — clamp(0, ...) 等で safety 必須',
      'Multi-level で formula 切れる (途中で hardcode 値) — design system articulate 違反',
    ],
  },
] as const

// ============================================================
// Live formula table (radius × padding combinations)
// ============================================================

type FormulaRow = {
  readonly parentRadius: string
  readonly parentPadding: string
  readonly childRadius: string
  readonly note: string
}

const FORMULA_TABLE: readonly FormulaRow[] = [
  {
    parentRadius: 'radius.s (8px)',
    parentPadding: 'spacing.xs (4px)',
    childRadius: 'calc(8 - 4) = 4px (radius.xs)',
    note: 'small button 内 inline icon — gentle nesting',
  },
  {
    parentRadius: 'radius.m (15px)',
    parentPadding: 'spacing.s (8px)',
    childRadius: 'calc(15 - 8) = 7px (≈ radius.s)',
    note: 'card 内 button (small padding) — 7px は token に無いが calc で articulate',
  },
  {
    parentRadius: 'radius.l (22px)',
    parentPadding: 'spacing.m (18px)',
    childRadius: 'calc(22 - 18) = 4px (radius.xs)',
    note: 'modal 内 inline button — slim child radius',
  },
  {
    parentRadius: 'radius.xl (28px)',
    parentPadding: 'spacing.l (24px)',
    childRadius: 'calc(28 - 24) = 4px (radius.xs)',
    note: 'hero card 内 nested card — tight nesting で margin に余裕',
  },
  {
    parentRadius: 'radius.full (pill)',
    parentPadding: 'spacing.xs (4px)',
    childRadius: 'radius.full (pill 維持)',
    note: 'pill 内 inline element — special semantic、 formula 適用外',
  },
] as const

export default function ConcentricCorner() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Concentric corner</h1>
        <p class="docs-page-lead">
          Apple HIG (iOS 16+ / visionOS 26) で formal articulate された{' '}
          <strong>「親子同心円 radius」</strong> 慣習。 子 radius = 親 radius - 親 padding の
          formula で機械的に揃える。 Creo UI では <A href="/foundations/principles">Principles</A>{' '}
          原則 04 (Concentric corners) として SSOT 化、 <code>creo-ui-editor-host</code> の{' '}
          <code>concentric()</code> / <code>concentricTokens()</code> helper が CSS calc を
          articulate する。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Concentric operational definition — 4 axis</h2>
        <p class="docs-page-helper">
          各 use-case を <strong>Use-case (nesting パターン)</strong> ×{' '}
          <strong>Formula (計算式)</strong> × <strong>Visible (見え方)</strong> ×{' '}
          <strong>Implementation (実装方法)</strong> で articulate。 「padding を radius
          より小さく設計する」 という設計時の constraint を意識した judge path に shift。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>Use-case</th>
                <th>Formula</th>
                <th>Visible</th>
                <th>Implementation</th>
              </tr>
            </thead>
            <tbody>
              <For each={OPERATIONAL}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.useCase}</code>
                    </th>
                    <td>{row.formula}</td>
                    <td>{row.visible}</td>
                    <td>
                      <code>{row.implementation}</code>
                    </td>
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
          Apple HIG / visionOS 26 spec 準拠 / formula 適用 / helper 使用 / anti-pattern 回避 の 4
          軸で rubric を articulate。 PR review で nested radius を持つ component はこの基準と照合。
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
        <h2 class="docs-section-title">Formula table — 主要 nesting パターン</h2>
        <p class="docs-page-helper">
          radius × padding の主要組み合わせと結果 child radius。 設計時の reference table。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>親 radius</th>
                <th>親 padding</th>
                <th>子 radius (formula 結果)</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              <For each={FORMULA_TABLE}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.parentRadius}</code>
                    </th>
                    <td>
                      <code>{row.parentPadding}</code>
                    </td>
                    <td>
                      <code>{row.childRadius}</code>
                    </td>
                    <td>{row.note}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Live demo — concentric vs anti-pattern</h2>
        <p class="docs-page-helper">
          左: concentric (子 radius が親に追従) / 右: anti-pattern (子 radius が独立、 不調和)。
          Header の theme switcher で 4 family を切替えても concentric は維持される (token alias が
          calc に bind)。
        </p>
        <div
          class="docs-component-preview"
          style={{
            display: 'grid',
            'grid-template-columns': 'repeat(2, 1fr)',
            gap: 'var(--spacing-l)',
          }}
        >
          {/* Concentric (good) */}
          <article
            class="creo-card"
            style={{
              padding: 'var(--spacing-l)',
              'border-radius': 'var(--radius-xl)',
            }}
          >
            <div
              style={{
                'border-radius': 'calc(var(--radius-xl) - var(--spacing-l))',
                background: 'var(--color-brand-primary-subtle)',
                padding: 'var(--spacing-m)',
                color: 'var(--color-text-primary)',
                'font-size': 'var(--typography-body-default)',
                'text-align': 'center',
              }}
            >
              <strong>✓ Concentric</strong>
              <br />
              parent radius xl - padding l = child 4px
            </div>
          </article>

          {/* Anti-pattern */}
          <article
            class="creo-card"
            style={{
              padding: 'var(--spacing-l)',
              'border-radius': 'var(--radius-xl)',
            }}
          >
            <div
              style={{
                'border-radius': 'var(--radius-l)',
                background:
                  'color-mix(in oklch, var(--color-semantic-error-subtle) 60%, transparent)',
                padding: 'var(--spacing-m)',
                color: 'var(--color-text-primary)',
                'font-size': 'var(--typography-body-default)',
                'text-align': 'center',
              }}
            >
              <strong>✗ Anti-pattern</strong>
              <br />
              parent radius xl, child radius l (random、 食い込む)
            </div>
          </article>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* CSS — calc() で articulate */
.parent {
  border-radius: var(--radius-xl);
  padding: var(--spacing-l);
}
.parent .child {
  border-radius: calc(var(--radius-xl) - var(--spacing-l));
}

/* TS helper (creo-ui-editor-host) */
import { concentric, concentricTokens } from 'creo-ui-editor-host'

// String 引数版
concentric('var(--radius-xl)', 'var(--spacing-l)')
// → 'calc(var(--radius-xl) - var(--spacing-l))'

// Token key shortcut 版
concentricTokens('xl', 'l')
// → 'calc(var(--radius-xl) - var(--spacing-l))'

// Custom prefix
concentricTokens('xl', 'l', { radiusPrefix: '--my-radius-', paddingPrefix: '--my-pad-' })

/* Apple SwiftUI — default で concentric */
.cornerRadius(CreoUITokens.radiusXl)  // 子が同 modifier で nested の場合 default 計算

/* Rust (手計算) */
let parent_radius = creo_ui::RADIUS_XL;
let parent_padding = creo_ui::SPACING_L;
let child_radius = parent_radius - parent_padding;  // 4.0`}</code>
        </pre>
      </section>
    </>
  )
}
