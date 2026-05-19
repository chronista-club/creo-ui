import { For } from 'solid-js'

// ============================================================
// Operational definition — 4 axis で articulate
// ============================================================
// Shadow は「subtle / medium / large」 のような大きさ表現ではなく、
// elevation × 視覚層 × 浮遊感 × context の 4 axis で operational に articulate。
// 「何 px の blur を使うか」 ではなく 「どの z-depth に置きたいか」 を judge する
// rubric ベース選定に shift する。

type AxisRow = {
  readonly token: string
  readonly elevation: string
  readonly visualLayer: string
  readonly floatiness: string
  readonly context: string
}

const OPERATIONAL: readonly AxisRow[] = [
  {
    token: 'none',
    elevation: 'flat (z=0) — 同 plane、 no separation',
    visualLayer: '同 layer (background と同居)',
    floatiness: '0 (anchored)',
    context: 'reset / technical surface / strict grid / table cell',
  },
  {
    token: 's',
    elevation: 'slight (z=1) — micro lift、 ほぼ flat',
    visualLayer: 'hover / focus state hint — 「動きました」 の signal',
    floatiness: '1 (whisper)',
    context: 'sidebar item hover / dropdown 微発光 / chip hover / segmented active',
  },
  {
    token: 'm',
    elevation: 'medium (z=2) — clear lift、 認識される',
    visualLayer: 'card hover / popover layer — content から離れた前景',
    floatiness: '2 (lift)',
    context: 'card hover state / popover / dropdown panel / tooltip',
  },
  {
    token: 'l',
    elevation: 'high (z=3) — overlay 然、 page から分離',
    visualLayer: 'sheet / drawer layer — page をなぞる overlay',
    floatiness: '3 (float)',
    context: 'side drawer / bottom sheet / overlay panel / focused popover',
  },
  {
    token: 'xl',
    elevation: 'maximum (z=4) — modal、 page を侵略',
    visualLayer: 'modal / focal layer — 注意を集中させる anchor',
    floatiness: '4 (anchor)',
    context: 'modal dialog / page-blocking overlay / spotlight tour anchor',
  },
] as const

// ============================================================
// Rubric — operational から派生する shadow 選定基準
// ============================================================

type RubricItem = {
  readonly category: string
  readonly criteria: readonly string[]
}

const RUBRIC: readonly RubricItem[] = [
  {
    category: '5 tier discipline',
    criteria: [
      'none + s/m/l/xl の 5 step (5 tier convention の variant: none を special として持つ)',
      '中央 m が default、 端で発散 (size-feel 認知負荷の下限)',
      'shadow value は theme で適応 — dark theme で opacity 強め、 light で subtle',
      '新 step 追加時: visual layer の意味的区別 (z-depth) が必要、 大きさだけで増やさない',
    ],
  },
  {
    category: 'Z-depth と視覚層の対応',
    criteria: [
      'none = z=0 (anchored layer)',
      's = z=1 (state hint layer)',
      'm = z=2 (card hover / popover layer)',
      'l = z=3 (overlay / sheet layer)',
      'xl = z=4 (modal / focal layer)',
      '同 page 内で z-depth の hierarchy を visible に保つ — 同じ z で異なる shadow を使わない',
    ],
  },
  {
    category: 'Theme 適応 rubric',
    criteria: [
      'dark theme: opacity 強め (visible 確保)、 ambient occlusion 寄り',
      'light theme: opacity 控えめ (subtle)、 outer-glow 寄り',
      'theme 切替で shadow 値が自動追従 (token が theme で値を持つ)',
      'WCAG: shadow に頼った visible 階層は不可、 必ず border / contrast でも区別',
    ],
  },
  {
    category: 'Reduced-motion 適合',
    criteria: [
      'shadow transition は motion-* token (duration / easing) と coordinate',
      'prefers-reduced-motion 環境では transition を無効化 (a11y baseline)',
      'shadow 自体は静的、 elevation 変化が animate される (hover lift 等)',
      '原則 8 (a11y baseline) の dogfood',
    ],
  },
] as const

// ============================================================
// Existing 5 step swatches
// ============================================================

const SHADOWS = [
  { name: 'shadow.none', cssVar: '--shadow-none', hint: 'Explicit reset (no elevation)' },
  { name: 'shadow.s', cssVar: '--shadow-s', hint: 'Subtle lift (hover, dropdown 微発光)' },
  { name: 'shadow.m', cssVar: '--shadow-m', hint: 'Card hover / popover / dropdown' },
  { name: 'shadow.l', cssVar: '--shadow-l', hint: 'Sheet / drawer / overlay' },
  { name: 'shadow.xl', cssVar: '--shadow-xl', hint: 'Modal / focal surface' },
] as const

export default function Shadow() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Shadow</h1>
        <p class="docs-page-lead">
          5 階層の elevation (none / s / m / l / xl) を <strong>4 axis</strong> (z-depth × 視覚層 ×
          浮遊感 × context) で operational に articulate。 dark theme では opacity 強め、 light
          theme では subtle に — token 値が theme 切替で適切な visible に追従。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Shadow operational definition — 4 axis</h2>
        <p class="docs-page-helper">
          各 step を <strong>elevation (z-depth)</strong> × <strong>視覚層 (Visual layer)</strong> ×{' '}
          <strong>浮遊感 (Floatiness scale)</strong> × <strong>context (どこで使うか)</strong> で
          articulate。 「subtle / medium」 の大きさ表現ではなく{' '}
          <strong>「どの z-depth に置きたいか」</strong> で judge する rubric ベース選定に shift。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Elevation (z-depth)</th>
                <th>視覚層 (Visual layer)</th>
                <th>浮遊感</th>
                <th>Context</th>
              </tr>
            </thead>
            <tbody>
              <For each={OPERATIONAL}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.token}</code>
                    </th>
                    <td>{row.elevation}</td>
                    <td>{row.visualLayer}</td>
                    <td>{row.floatiness}</td>
                    <td>{row.context}</td>
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
          shadow 選定 / 新 step 追加 / theme 適応の判断 rubric。 PR review でこの基準と照合する。
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
        <h2 class="docs-section-title">Live preview</h2>
        <div class="docs-shadow-grid">
          <For each={SHADOWS}>
            {(s) => (
              <article class="docs-shadow-card" style={{ 'box-shadow': `var(${s.cssVar})` }}>
                <code class="docs-shadow-name">{s.name}</code>
                <code class="docs-shadow-var">{s.cssVar}</code>
                <p class="docs-shadow-hint">{s.hint}</p>
              </article>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* CSS */
.card-hover {
  box-shadow: var(--shadow-m);  /* z=2 lift layer */
}
.modal {
  box-shadow: var(--shadow-xl); /* z=4 focal anchor */
}

/* hover transition は motion token と coordinate */
.card {
  transition: box-shadow var(--motion-duration-normal) var(--motion-easing-out);
}
.card:hover {
  box-shadow: var(--shadow-m);
}`}</code>
        </pre>
      </section>
    </>
  )
}
