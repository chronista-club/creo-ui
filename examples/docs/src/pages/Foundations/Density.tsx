import { A } from '@solidjs/router'
import { For } from 'solid-js'

// ============================================================
// Operational definition — 4 axis で articulate
// ============================================================
// Density mode は Typography mode (app/read/editor/terminal) と直交する第 5 axis。
// `data-density="comfortable|default|compact|cozy"` を ancestor に articulate
// すると、 内部 component の spacing scale (padding / gap / min-height) が
// 一括 control される。 dense interface 復権 trend (Stripe / Linear 2026) を
// 4 mode のまま吸収するための articulate。

type AxisRow = {
  readonly density: string
  readonly paddingScale: string
  readonly target: string
  readonly useCase: string
}

const OPERATIONAL: readonly AxisRow[] = [
  {
    density: 'comfortable',
    paddingScale: '1.25 (base × 1.25)',
    target: '1.1 (target × 1.1)',
    useCase: 'reading mode / hero / onboarding / 短時間 burst で集中、 高 contrast 許容',
  },
  {
    density: 'default',
    paddingScale: '1 (base そのまま)',
    target: '1 (base)',
    useCase: '一般的な app surface (memory view / canvas / dashboard 標準)',
  },
  {
    density: 'compact',
    paddingScale: '0.85 (base × 0.85)',
    target: '0.95 (target × 0.95)',
    useCase: 'data table / dashboard / dev tool — 情報密度優先、 tap >= 44 維持',
  },
  {
    density: 'cozy',
    paddingScale: '0.7 (base × 0.7)',
    target: '0.85 (target × 0.85)',
    useCase: 'terminal mode / log viewer / VP terminal — max info-density、 keyboard-first',
  },
] as const

// ============================================================
// Rubric — operational から派生する density 設計基準
// ============================================================

type RubricItem = {
  readonly category: string
  readonly criteria: readonly string[]
}

const RUBRIC: readonly RubricItem[] = [
  {
    category: '4 mode と直交 (orthogonal)',
    criteria: [
      'Typography mode (app/read/editor/terminal) は font stack 軸',
      'Density mode (comfortable/default/compact/cozy) は spacing scale 軸',
      '同 mode で density を 切替可能 (例: app + comfortable / app + compact)',
      '同 density で mode を切替可能 (例: terminal + cozy / read + cozy)',
    ],
  },
  {
    category: 'Cascade / nesting',
    criteria: [
      '`data-density` は ancestor (body / region / container) に articulate',
      'CSS variable の inherit で内部 component が自動 sync',
      'nested で子 [data-density] が override 可能 (孫 component に伝播)',
      'default scale 1 で attribute 無しの component に変化なし (backward compat)',
    ],
  },
  {
    category: 'Component 適用 articulate',
    criteria: [
      'spacing 系 (padding / gap / min-height) を `calc(base * scale)` で articulate',
      'tap target >= 44px は cozy でも維持 (44 × 0.85 = 37.4 だが、 内部 hard min 44px 推奨)',
      'a11y minimum (focus 24px) を超えるよう scale 設計 (default の 32 × 0.85 = 27 で OK)',
      'font-size は density 影響なし (typography axis は density と独立)',
    ],
  },
  {
    category: 'Use-case mapping (4 mode × 3 density 例)',
    criteria: [
      'app + default — 標準 chrome (sidebar / header / button、 記述メイン)',
      'read + comfortable — long-form reading (memory view、 chat、 markdown render)',
      'app + compact — dashboard / data table (情報密度優先、 tap 維持)',
      'terminal + cozy — log viewer / VP terminal (max density、 keyboard-only)',
      'editor + default — editor input (writer 思想、 default 程度の breathing)',
    ],
  },
] as const

// ============================================================
// Live demo の data
// ============================================================

const DENSITIES = ['comfortable', 'default', 'compact', 'cozy'] as const

export default function Density() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Density mode</h1>
        <p class="docs-page-lead">
          <strong>4 mode (Typography axis) と直交する第 5 axis</strong>。{' '}
          <code>data-density="comfortable|default|compact|cozy"</code> を ancestor に articulate
          すると、 内部 component の spacing scale (padding / gap / min-height) が一括 control。
          dense interface 復権 trend (Stripe / Linear 2026) を 4 mode のまま吸収する。 詳細は{' '}
          <A href="/foundations/typography">Typography</A> (4 mode 軸) と本 page (density 軸) の組合
          せで articulate。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Density operational definition — 4 axis</h2>
        <p class="docs-page-helper">
          各 density を <strong>Density (名前)</strong> × <strong>Padding scale (× base)</strong> ×{' '}
          <strong>Target scale (a11y 維持)</strong> × <strong>Use-case (適用文脈)</strong> で
          articulate。 Typography mode と独立、 直交 axis として 「同 mode + 異 density」 「異 mode
          + 同 density」 が成立する設計。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>Density</th>
                <th>Padding scale</th>
                <th>Target scale</th>
                <th>Use-case</th>
              </tr>
            </thead>
            <tbody>
              <For each={OPERATIONAL}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.density}</code>
                    </th>
                    <td>{row.paddingScale}</td>
                    <td>{row.target}</td>
                    <td>{row.useCase}</td>
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
          直交 articulate / cascade / component 適用 / use-case mapping の 4 軸で rubric を
          articulate。 PR review で density 影響のある component はこの基準と照合。
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
        <h2 class="docs-section-title">Live demo — 4 density × button / input / card</h2>
        <p class="docs-page-helper">
          各 density で button / input / card がどう scale するか視認確認。 ancestor に
          <code>data-density</code> を付けるだけで内部 component が一括追従。
        </p>
        <div
          style={{
            display: 'grid',
            'grid-template-columns': 'repeat(2, 1fr)',
            gap: 'var(--spacing-l)',
          }}
        >
          <For each={DENSITIES}>
            {(density) => (
              <article
                class="creo-card"
                data-density={density}
                style={{
                  padding: 'var(--spacing-l)',
                  display: 'flex',
                  'flex-direction': 'column',
                  gap: 'var(--spacing-m)',
                }}
              >
                <code style={{ 'font-size': 'var(--typography-body-helper)' }}>
                  data-density="{density}"
                </code>
                <button type="button" class="creo-btn" data-variant="primary">
                  Primary button
                </button>
                <input type="text" class="creo-input" placeholder="Input field" />
                <article class="creo-card" style={{ background: 'var(--color-surface-bg-subtle)' }}>
                  <p style={{ margin: 0, 'font-size': 'var(--typography-body-default)' }}>
                    Nested card with body text
                  </p>
                </article>
              </article>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`<!-- HTML — ancestor に data-density を付ける -->
<body data-density="compact">  <!-- 全 page を dense に -->
  <main>
    <button class="creo-btn">Compact button</button>
  </main>
</body>

<!-- Section ごとに切替も可 -->
<body data-density="default">
  <article data-density="comfortable">  <!-- reading section -->
    <h2>Article title</h2>
    <p>Long-form content...</p>
  </article>
  <aside data-density="compact">  <!-- dense sidebar -->
    <ul>...</ul>
  </aside>
</body>

/* CSS — component で density scale を articulate */
.creo-btn {
  padding:
    calc(var(--spacing-s) * var(--density-padding-scale, 1))
    calc(var(--spacing-m) * var(--density-padding-scale, 1));
  min-height: calc(var(--layout-target-tap) * var(--density-min-height-scale, 1));
  gap: calc(var(--layout-gap-tight) * var(--density-gap-scale, 1));
}

/* default scale 1 で attribute 無しの component に変化なし (backward compat) */`}</code>
        </pre>
      </section>
    </>
  )
}
