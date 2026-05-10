import { A } from '@solidjs/router'
import { For } from 'solid-js'

// ============================================================
// Operational definition — 4 axis で articulate
// ============================================================
// Iconography は font-based glyph (Nerd Font) と SVG-based (Iconify) の
// 2 system が並走。 同一 icon でも use-case で system を選ぶ judgement
// を SSOT 化。 size scale × color variant × system × use-case の 4 axis。

type AxisRow = {
  readonly system: string
  readonly source: string
  readonly fidelity: string
  readonly useCase: string
}

const OPERATIONAL: readonly AxisRow[] = [
  {
    system: 'creo-icon (CSS-only)',
    source: 'Nerd Font glyph (~10k、 typography.family.icon)',
    fidelity: 'mono color (currentColor)、 font-based、 軽量',
    useCase:
      'inline mark / dense list / button leading icon / dev tool aesthetic — text-flow に並ぶ',
  },
  {
    system: '<Icon> (creo-ui-icons-web、 Iconify-based)',
    source:
      'Iconify 9 set (mingcute/iconoir/ph/svg-spinners/codicon/simple-icons/flagpack/noto/bi)',
    fidelity: 'multi-color、 SVG-based、 stroke 制御可、 dynamic',
    useCase: 'hero / illustration / brand-specific icon / status / onboarding — visual anchor',
  },
] as const

// ============================================================
// Size scale — 5 tier (xs/s/m/l/xl) typography.icon scale
// ============================================================

type SizeRow = {
  readonly token: string
  readonly value: string
  readonly visualSize: string
  readonly useCase: string
}

const SIZES: readonly SizeRow[] = [
  {
    token: 'typography.icon.xs',
    value: '1rem (16px)',
    visualSize: 'tiny inline',
    useCase: 'text-flow に並ぶ補助 mark / favicon / dense list の leading icon',
  },
  {
    token: 'typography.icon.s (default)',
    value: '1.5rem (24px)',
    visualSize: 'small',
    useCase: 'button / input / chip の leading mark、 toolbar action — base 16px text と並ぶ',
  },
  {
    token: 'typography.icon.m',
    value: '2.5rem (40px)',
    visualSize: 'medium',
    useCase: 'list item / inline 強調 — emoji や icon font の visual size',
  },
  {
    token: 'typography.icon.l',
    value: '4rem (64px)',
    visualSize: 'large',
    useCase: 'empty-state default / card header / feature illustration',
  },
  {
    token: 'typography.icon.xl',
    value: '6rem (96px)',
    visualSize: 'extra large',
    useCase:
      'empty-state large variant / hero illustration / onboarding — page-level visual anchor',
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
    category: '5 tier convention (size scale)',
    criteria: [
      'typography.icon.{xs/s/m/l/xl} を strict (Tailwind 流 sm/md/lg 命名禁止)',
      '中央 s が default (24px、 button leading) — 認知負荷の下限近く',
      '新 size 追加禁止、 5 tier 内で組合せ',
      'icon scale は typography.size scale (body 用 xs/s/m/l/xl の 12-20px) と独立、 visual hierarchy が違う',
    ],
  },
  {
    category: 'System 選択 (creo-icon vs Iconify)',
    criteria: [
      'inline / dense / mono color → .creo-icon (Nerd Font、 軽量、 CSS-only)',
      'hero / multi-color / brand specific → Iconify (creo-ui-icons-web、 SVG)',
      '同 icon が 2 system にあるとき: 文脈で選ぶ (button leading は creo-icon、 hero は Iconify)',
      'mixed の場合は両 system 利用可、 ただし 1 surface 内では 1 system に統一推奨',
    ],
  },
  {
    category: 'Color articulate',
    criteria: [
      'creo-icon default: `currentColor` (text-color から継承)',
      'creo-icon variant: data-variant で semantic 変更 (primary / success / warning / error 等)',
      'Iconify: multi-color SVG は brand identity 表現用、 mono color SVG は currentColor',
      'theme switch で色追従 (token alias 経由、 hardcode 禁止)',
    ],
  },
  {
    category: 'a11y baseline',
    criteria: [
      '装飾 icon: aria-hidden="true" (screen reader 読み飛ばし)',
      '機能 icon (button-only など): aria-label 必須',
      'icon-only button は visible label or aria-label で意味を articulate',
      'tap target は icon size + spacing で 44px 確保 (.creo-btn 内 icon は OK、 standalone icon-button は別途確保)',
    ],
  },
] as const

export default function Iconography() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Iconography</h1>
        <p class="docs-page-lead">
          Iconography は <strong>2 system 並走</strong> (Nerd Font glyph + Iconify SVG) を 4 axis
          (System / Source / Fidelity / Use-case) で articulate。 size scale は{' '}
          <A href="/foundations/typography">typography.icon</A> の 5 tier を bind。 inline / dense
          は <code>.creo-icon</code> CSS class、 hero / multi-color は{' '}
          <code>creo-ui-icons-web</code> の <code>&lt;Icon&gt;</code> を judge。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">2 system operational definition — 4 axis</h2>
        <p class="docs-page-helper">
          各 system を <strong>System</strong> × <strong>Source (icon source)</strong> ×{' '}
          <strong>Fidelity (色 / 表現力)</strong> × <strong>Use-case</strong> で articulate。
          「inline か hero か」 「mono か multi-color か」 で judge する rubric ベース選択。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>System</th>
                <th>Source</th>
                <th>Fidelity</th>
                <th>Use-case</th>
              </tr>
            </thead>
            <tbody>
              <For each={OPERATIONAL}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.system}</code>
                    </th>
                    <td>{row.source}</td>
                    <td>{row.fidelity}</td>
                    <td>{row.useCase}</td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Size scale — typography.icon 5 tier</h2>
        <p class="docs-page-helper">
          5 tier convention strict、 typography.size scale (body 用) と独立。 icon は visual
          hierarchy がより gross-grain で、 12-96px の wide range が必要。
        </p>
        <div class="docs-operational-table">
          <table>
            <thead>
              <tr>
                <th>Token</th>
                <th>Value</th>
                <th>Visual size</th>
                <th>Use-case</th>
              </tr>
            </thead>
            <tbody>
              <For each={SIZES}>
                {(row) => (
                  <tr>
                    <th>
                      <code>{row.token}</code>
                    </th>
                    <td>{row.value}</td>
                    <td>{row.visualSize}</td>
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
        <h2 class="docs-section-title">Live preview — 5 size × variant</h2>
        <p class="docs-page-helper">
          各 size の visual + semantic variant で color articulate を視認確認。
        </p>
        <div
          class="docs-component-preview"
          style={{ display: 'flex', 'flex-wrap': 'wrap', gap: 'var(--spacing-l)' }}
        >
          <For each={['xs', 's', 'm', 'l', 'xl'] as const}>
            {(size) => (
              <div
                style={{
                  display: 'flex',
                  'flex-direction': 'column',
                  'align-items': 'center',
                  gap: 'var(--spacing-xs)',
                }}
              >
                <span class="creo-icon" data-size={size} aria-hidden="true">
                  ★
                </span>
                <code style={{ 'font-size': 'var(--typography-body-helper)' }}>{size}</code>
              </div>
            )}
          </For>
        </div>

        <div class="docs-preview-row-label" style={{ 'margin-top': 'var(--layout-gap-section)' }}>
          Semantic variants
        </div>
        <div style={{ display: 'flex', 'flex-wrap': 'wrap', gap: 'var(--spacing-m)' }}>
          <For
            each={['primary', 'secondary', 'success', 'warning', 'error', 'info', 'muted'] as const}
          >
            {(variant) => (
              <div
                style={{
                  display: 'flex',
                  'flex-direction': 'column',
                  'align-items': 'center',
                  gap: 'var(--spacing-xs)',
                }}
              >
                <span class="creo-icon" data-size="m" data-variant={variant} aria-hidden="true">
                  ●
                </span>
                <code style={{ 'font-size': 'var(--typography-body-helper)' }}>{variant}</code>
              </div>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">使い方</h2>
        <pre class="docs-code">
          <code>{`<!-- creo-icon CSS class (Nerd Font glyph) -->
<span class="creo-icon" data-size="m" aria-hidden="true"></span>
<span class="creo-icon" data-size="l" data-variant="success">✓</span>

<!-- Inline 使用 (button 内) -->
<button class="creo-btn" data-variant="primary">
  <span class="creo-icon" data-size="s" aria-hidden="true">★</span>
  Favorite
</button>

<!-- Iconify SVG (creo-ui-icons-web、 separate package) -->
import { Icon } from 'creo-ui-icons-web'
<Icon set="mingcute" name="star-fill" size="m" variant="warning" />

/* CSS — color customize */
.my-icon {
  color: var(--color-brand-primary);  /* currentColor で継承 */
}

/* a11y */
<!-- 装飾 icon -->
<span class="creo-icon" aria-hidden="true">★</span>

<!-- 機能 icon -->
<button class="creo-btn" aria-label="Add to favorites">
  <span class="creo-icon" aria-hidden="true">★</span>
</button>`}</code>
        </pre>
      </section>
    </>
  )
}
