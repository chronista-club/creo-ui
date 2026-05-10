import { A } from '@solidjs/router'
import { For } from 'solid-js'

// ============================================================
// Operational definition — 4 axis で articulate
// ============================================================
// Kinetic typography は 2026 dynamic typography trend を Creo UI に articulate
// する第 6 axis (size / family / line-height / weight / icon scale に続く)。
// ただし **display 限定** で、 read / editor mode は侵食禁止 (Purple Haze
// report avoid path)。 utility class として consumer が opt-in で使う。

type AxisRow = {
  readonly utility: string
  readonly trigger: string
  readonly effect: string
  readonly useCase: string
}

const OPERATIONAL: readonly AxisRow[] = [
  {
    utility: '.creo-kinetic-hero',
    trigger: ':hover',
    effect: 'letter-spacing 詰め → 開く / font-weight 700 → 800 / font-variation-settings slnt -2',
    useCase: 'Hero headline / landing CTA / hero card title — interactive emphasis',
  },
  {
    utility: '.creo-kinetic-gradient',
    trigger: 'static (no animation)',
    effect: 'brand primary → secondary の linear-gradient で text 塗り (background-clip: text)',
    useCase: 'Hero brand identity / promotional headline — visual anchor (mint→violet 等)',
  },
  {
    utility: '.creo-kinetic-reveal',
    trigger: 'page load (animation forwards)',
    effect: 'opacity 0 + translateY 8px → 1 + 0 (modal-enter mapping)、 data-delay で staggered',
    useCase: 'Page hero on landing / onboarding / staggered reveal — choreographed entry',
  },
] as const

// ============================================================
// Rubric
// ============================================================

type RubricItem = {
  readonly category: string
  readonly criteria: readonly string[]
}

const RUBRIC: readonly RubricItem[] = [
  {
    category: 'Display 限定 (avoid path)',
    criteria: [
      'read mode 侵食禁止 — long-form reading では typography stability が最優先',
      'editor mode 侵食禁止 — writer 体験は static で集中、 kinetic は subjective fatigue',
      'app mode は controlled に — 限定 hover effect (button hover の transform 等) のみ',
      'terminal mode 完全禁止 — fixed-width grid / monospace の identity',
    ],
  },
  {
    category: 'Variable font 対応',
    criteria: [
      'font-variation-settings は variable font (Inter Variable / Roboto Flex / Recursive) 採用時のみ機能',
      'fallback non-variable font では variation 無視、 ただし transition は他 property (letter-spacing 等) で機能',
      'wght / slnt / wdth axis を tokenize する場合は別 token group で articulate (将来)',
      'display family に Variable font 採用は別 PR で議論 (typography.family.display 拡張)',
    ],
  },
  {
    category: 'Reduced-motion 適合 (a11y baseline)',
    criteria: [
      'prefers-reduced-motion: reduce で kinetic effects を全て無効化',
      'ただし *static* effect (gradient text) は維持 (motion ではないため)',
      'reveal animation は opacity 1 + transform none に固定',
      'reduced-motion でも visual hierarchy は維持される設計',
    ],
  },
  {
    category: 'Motion mapping coordination',
    criteria: [
      'kinetic transition は motion mapping (--motion-mapping-frame-morph-duration / -easing) を参照',
      'reveal animation は --motion-mapping-modal-enter-* を参照',
      'hardcode duration 禁止、 全部 mapping token bind',
      'token tune で全 kinetic effect が同期 (原則 03 dogfood)',
    ],
  },
] as const

export default function KineticTypography() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Kinetic typography</h1>
        <p class="docs-page-lead">
          2026 dynamic typography trend を <strong>display 限定</strong> で articulate。 hero /
          landing / onboarding で「文字が呼吸する」 visual anchor、 ただし{' '}
          <A href="/foundations/typography">read / editor mode</A> は侵食禁止 (long-form reading の
          stability 優先)。 motion mapping coordinated、 reduced-motion で安全に degrade。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview — 3 utility class</h2>
        <p class="docs-page-helper">
          各 utility class の visual demo。 Tab / hover / page reload で trigger を試す。
        </p>

        <div class="docs-preview-row-label">creo-kinetic-hero (hover で variation)</div>
        <div
          class="docs-component-preview"
          style={{ padding: 'var(--spacing-xl)', 'text-align': 'center' }}
        >
          <h2 class="creo-kinetic-hero">Hover me, breathe</h2>
        </div>

        <div class="docs-preview-row-label">creo-kinetic-gradient (brand identity gradient)</div>
        <div
          class="docs-component-preview"
          style={{ padding: 'var(--spacing-xl)', 'text-align': 'center' }}
        >
          <h2 class="creo-kinetic-gradient">Creo Identity</h2>
        </div>

        <div class="docs-preview-row-label">creo-kinetic-reveal (page load animation)</div>
        <div
          class="docs-component-preview"
          style={{
            padding: 'var(--spacing-xl)',
            'text-align': 'center',
            display: 'flex',
            'flex-direction': 'column',
            gap: 'var(--spacing-s)',
          }}
        >
          <h3 class="creo-kinetic-reveal" style={{ 'font-size': 'var(--typography-display-s)' }}>
            First line
          </h3>
          <h3
            class="creo-kinetic-reveal"
            data-delay="1"
            style={{ 'font-size': 'var(--typography-display-s)' }}
          >
            Staggered second
          </h3>
          <h3
            class="creo-kinetic-reveal"
            data-delay="2"
            style={{ 'font-size': 'var(--typography-display-s)' }}
          >
            Staggered third
          </h3>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Kinetic operational definition — 4 axis</h2>
        <p class="docs-page-helper">
          各 utility を <strong>Utility class</strong> × <strong>Trigger (発動条件)</strong> ×{' '}
          <strong>Effect (効果)</strong> × <strong>Use-case</strong> で articulate。 「いつ、 どう
          動くか」 を意図的に articulate、 random kinetic effect 適用は NG。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>Utility</th>
                <th>Trigger</th>
                <th>Effect</th>
                <th>Use-case</th>
              </tr>
            </thead>
            <tbody>
              <For each={OPERATIONAL}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.utility}</code>
                    </th>
                    <td>{row.trigger}</td>
                    <td>{row.effect}</td>
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
          Display 限定 articulate / Variable font 対応 / Reduced-motion 適合 / Motion mapping
          coordination の 4 軸で rubric を articulate。 PR review で kinetic effect 追加時に照合。
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
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`<!-- Hover で variation -->
<h1 class="creo-kinetic-hero">Hero title</h1>

<!-- Brand gradient text -->
<h1 class="creo-kinetic-gradient">Creo Identity</h1>

<!-- Page load reveal (staggered) -->
<h1 class="creo-kinetic-reveal">First line</h1>
<h2 class="creo-kinetic-reveal" data-delay="1">Second line</h2>
<p class="creo-kinetic-reveal" data-delay="2">Third line</p>

<!-- ❌ Anti-pattern: read mode 侵食 -->
<article class="memory-content">
  <p class="creo-kinetic-hero">  <!-- read mode で kinetic は禁止 -->
    Long-form reading text...
  </p>
</article>

<!-- ✅ Display 限定 -->
<header class="hero">
  <h1 class="creo-kinetic-hero">Display title</h1>  <!-- hero / display ↑ -->
</header>
<article class="memory-content">
  <p>Long-form reading text...</p>  <!-- static、 stability 優先 -->
</article>`}</code>
        </pre>
      </section>
    </>
  )
}
