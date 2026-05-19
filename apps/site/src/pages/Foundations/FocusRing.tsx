import { A } from '@solidjs/router'
import { For } from 'solid-js'

// ============================================================
// Operational definition — 4 axis で articulate
// ============================================================
// Focus ring は単なる「accent 色の outline」 ではなく、 Aesthetic (見た目) /
// Visibility (見える条件) / Behavior (反応) / Theme integration (theme 追従)
// の 4 axis で articulate する。 a11y baseline (WCAG 2.4.7 / 2.4.11) を満たす
// design DNA として定着させる。

type AxisRow = {
  readonly token: string
  readonly aesthetic: string
  readonly visibility: string
  readonly behavior: string
  readonly themeIntegration: string
}

const OPERATIONAL: readonly AxisRow[] = [
  {
    token: 'focus-ring.width',
    aesthetic: '2px solid — 細すぎず厚すぎず',
    visibility: 'WCAG 2.4.11 minimum 2 CSS px (perimeter)',
    behavior: 'theme 非依存 fixed value、 8 theme 共通',
    themeIntegration: 'scaffold (theme 不変) — :root に 1 set',
  },
  {
    token: 'focus-ring.offset',
    aesthetic: '2px 要素境界から離れて呼吸',
    visibility: '要素を遮らない (inset = anti-pattern)',
    behavior: 'outline-offset で element を覆わずに ring',
    themeIntegration: 'scaffold (theme 不変)',
  },
  {
    token: 'focus-ring.halo-width',
    aesthetic: '4px subtle bg tint で ring を「包む glow」',
    visibility: 'box-shadow で実装 (outline 外側の layer)',
    behavior: 'alpha 0.18 (or contrast theme 0.20) で控えめ',
    themeIntegration: 'scaffold (theme 不変、 color は theme 別)',
  },
  {
    token: 'color.focus-ring.color',
    aesthetic: 'family hue + luminance 調整 (dark UP / light DOWN)',
    visibility: 'WCAG AAA (7:1+) を 8 theme 全部で確保',
    behavior: 'brand と整合した identity を articulate',
    themeIntegration: 'theme 別、 family hue を保持',
  },
  {
    token: 'color.focus-ring.halo',
    aesthetic: 'focus-ring color と同 hue + alpha',
    visibility: 'subtle bg tint、 ring を 補完する layer',
    behavior: '0.18 (mint/sora/oldschool) / 0.20 (contrast) で more assertive',
    themeIntegration: 'theme 別、 alpha は family identity で articulate',
  },
] as const

// ============================================================
// Rubric — operational から派生する focus ring 設計基準
// ============================================================

type RubricItem = {
  readonly category: string
  readonly criteria: readonly string[]
}

const RUBRIC: readonly RubricItem[] = [
  {
    category: 'WCAG 2.4 compliance',
    criteria: [
      '2.4.7 Focus Visible (Level AA) — keyboard focus indicator が visible',
      '2.4.11 Focus Appearance (Level AAA) — 2 CSS px perimeter + 3:1 contrast',
      '8 theme 全部で focus-ring color が bg-base に対し WCAG AAA (7:1+) 達成',
      'reduced-motion 環境でも ring 自体は表示 (transition のみ無効化)',
    ],
  },
  {
    category: ':focus-visible policy (keyboard-only)',
    criteria: [
      ':focus ではなく :focus-visible — mouse click で ring 出さない (Radix-pattern)',
      'keyboard tab / tabindex / programmatic focus の場合のみ ring 表示',
      ':where() で specificity 0 — consumer が override 容易',
      'component-agnostic な _focus.css に articulate (cascade order 最優先)',
    ],
  },
  {
    category: 'Aesthetic — Sophisticated layered',
    criteria: [
      'outer ring (outline 2px solid) + inner halo (box-shadow 4px subtle alpha) の dual-layer',
      'Apple HIG visionOS 26 の concentric layer + Linear "気付かれない polish" の hybrid',
      'pure monochromatic (Geist 路線) ではなく family hue identity を articulate',
      'maximalist (full saturation flash) ではなく "assertive but calm"',
    ],
  },
  {
    category: 'Theme integration',
    criteria: [
      'family hue (mint=160 / sora=230 / contrast=270 / oldschool=145) を保持',
      'dark theme: brand luminance + 0.07〜0.13 で contrast 確保 (例: mint brand 0.75 → focus 0.85)',
      'light theme: brand luminance - 0.10〜0.40 で contrast 確保 (例: mint brand 0.85 → focus 0.45)',
      'contrast theme は chroma も + 0.04 で paradox identity assertive',
    ],
  },
  {
    category: 'Component override 規約',
    criteria: [
      '原則: 個別 component CSS で :focus-visible を override しない (a11y consistency)',
      '例外 1: switch (track sibling 経由) — selector が `~` で policy で cover 不可',
      '例外 2: table sortable cell — cell 内側に ring 巻く特殊 layout',
      '例外時は新 token (--focus-ring-* / --color-focus-ring-*) を使い、 hardcode 値禁止',
    ],
  },
] as const

// ============================================================
// Live preview tokens (viewer 装置)
// ============================================================

type FocusToken = {
  readonly name: string
  readonly cssVar: string
  readonly hint: string
}

const SCAFFOLD_TOKENS: readonly FocusToken[] = [
  {
    name: 'focus-ring.width',
    cssVar: '--focus-ring-width',
    hint: 'Outer ring width — 2px (WCAG 2.4.11 minimum)',
  },
  {
    name: 'focus-ring.offset',
    cssVar: '--focus-ring-offset',
    hint: 'Outline offset — 2px (要素境界から離す)',
  },
  {
    name: 'focus-ring.halo-width',
    cssVar: '--focus-ring-halo-width',
    hint: 'Inner halo width — 4px (subtle bg tint glow)',
  },
  {
    name: 'focus-ring.style',
    cssVar: '--focus-ring-style',
    hint: 'Outline style — solid のみ採用',
  },
] as const

const COLOR_TOKENS: readonly FocusToken[] = [
  {
    name: 'color.focus-ring.color',
    cssVar: '--color-focus-ring-color',
    hint: 'Focus ring color (theme 別、 family hue + luminance 調整)',
  },
  {
    name: 'color.focus-ring.halo',
    cssVar: '--color-focus-ring-halo',
    hint: 'Focus halo (theme 別、 alpha 0.18-0.20 で subtle)',
  },
] as const

export default function FocusRing() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Focus Ring</h1>
        <p class="docs-page-lead">
          a11y baseline (WCAG 2.4.7 Focus Visible / 2.4.11 Focus Appearance) を満たす{' '}
          <strong>Sophisticated layered</strong> な focus ring。 outer 2px solid brand ring + inner
          4px halo の dual-layer で 「assertive but calm」 を articulate、 8 theme で family hue と
          整合。 keyboard-only 表示 (Radix-pattern の <code>:focus-visible</code>) で mouse 操作時は
          ring 出さない。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Live preview — keyboard で Tab を試す</h2>
        <p class="docs-page-helper">
          以下の interactive element に Tab key で focus すると ring が現れます。 Header の theme
          switcher で family を切替えると、 ring 色も brand と整合した hue に追従。
        </p>
        <div
          class="docs-component-preview"
          style={{
            display: 'flex',
            'flex-wrap': 'wrap',
            gap: 'var(--spacing-m)',
            'align-items': 'center',
          }}
        >
          <button type="button" class="creo-btn" data-variant="primary">
            Primary button
          </button>
          <button type="button" class="creo-btn" data-variant="secondary">
            Secondary
          </button>
          <button type="button" class="creo-btn" data-variant="ghost">
            Ghost
          </button>
          <input
            type="text"
            class="creo-input"
            placeholder="Tab to focus"
            style={{ 'max-width': '200px' }}
          />
          <a href="#focus-demo" id="focus-demo">
            Focus link
          </a>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Focus ring operational definition — 4 axis</h2>
        <p class="docs-page-helper">
          各 token を <strong>Aesthetic (見た目)</strong> × <strong>Visibility (見える条件)</strong>{' '}
          × <strong>Behavior (反応)</strong> × <strong>Theme integration (theme 追従)</strong> で
          articulate。 a11y baseline (WCAG) を measurable 基準で記述、 design intent (Sophisticated
          layered) と分けて articulate。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Aesthetic</th>
                <th>Visibility</th>
                <th>Behavior</th>
                <th>Theme integration</th>
              </tr>
            </thead>
            <tbody>
              <For each={OPERATIONAL}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.token}</code>
                    </th>
                    <td>{row.aesthetic}</td>
                    <td>{row.visibility}</td>
                    <td>{row.behavior}</td>
                    <td>{row.themeIntegration}</td>
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
          a11y compliance / :focus-visible policy / aesthetic / theme integration / component
          override 規約 の 5 軸で rubric を articulate。 PR review でこの基準と照合する。
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
        <h2 class="docs-section-title">Scaffold tokens (theme 非依存)</h2>
        <p class="docs-page-helper">
          width / offset / halo-width / style は 8 theme 共通の固定値。
        </p>
        <div class="docs-token-table">
          <For each={SCAFFOLD_TOKENS}>
            {(t) => (
              <div class="docs-token-row">
                <code class="docs-token-name">{t.name}</code>
                <code class="docs-token-value">
                  {(() => {
                    const val =
                      typeof window === 'undefined'
                        ? ''
                        : getComputedStyle(document.documentElement)
                            .getPropertyValue(t.cssVar)
                            .trim()
                    return val || '—'
                  })()}
                </code>
                <span class="docs-token-desc">{t.hint}</span>
              </div>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Color tokens (theme 別)</h2>
        <p class="docs-page-helper">
          Header の theme switcher で family / light-dark を切替えると、 値が動的に変化。 詳細は{' '}
          <A href="/foundations/theming">Theming</A> page。
        </p>
        <div class="docs-token-table">
          <For each={COLOR_TOKENS}>
            {(t) => (
              <div class="docs-token-row">
                <code class="docs-token-name">{t.name}</code>
                <code class="docs-token-value">
                  {(() => {
                    const val =
                      typeof window === 'undefined'
                        ? ''
                        : getComputedStyle(document.documentElement)
                            .getPropertyValue(t.cssVar)
                            .trim()
                    return val || '—'
                  })()}
                </code>
                <span class="docs-token-desc">{t.hint}</span>
              </div>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`/* 通常: _focus.css の policy が自動適用 (.creo-* class を持つ
   interactive element に :focus-visible で ring が出る)。 */

/* 例外: switch 等 sibling selector の場合は個別 articulate */
.creo-switch-input:focus-visible ~ .creo-switch-track {
  outline: var(--focus-ring-width) var(--focus-ring-style) var(--color-focus-ring-color);
  outline-offset: var(--focus-ring-offset);
  box-shadow: 0 0 0 var(--focus-ring-halo-width) var(--color-focus-ring-halo);
}

/* :focus (keyboard + mouse 両方) で active feedback を出したい場合 (input 等) */
.creo-input:focus {
  border-color: var(--color-focus-ring-color);
  /* outline + halo は :focus-visible policy が担当 (keyboard-only) */
}`}</code>
        </pre>
      </section>
    </>
  )
}
