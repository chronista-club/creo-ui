import { A } from '@solidjs/router'
import { For, type JSX } from 'solid-js'

interface ComponentEntry {
  name: string
  slug: string
  desc: string
  detail?: boolean
}

/**
 * Featured — 実 component の mini render (標本 / specimen) を見せる card 群。
 * specimen は `.creo-*` class を素で使う (このサイトは reference consumer)。
 * pointer-events は CSS 側で無効化され、 card 全体が詳細 page への link になる。
 */
interface FeaturedEntry {
  name: string
  slug: string
  desc: string
  render: () => JSX.Element
}

const FEATURED: readonly FeaturedEntry[] = [
  {
    name: 'Button',
    slug: 'button',
    desc: 'Action trigger — 5 variants × 3 sizes',
    render: () => (
      <div class="docs-gallery-cluster">
        <button type="button" class="creo-btn" data-variant="primary" data-size="s">
          Primary
        </button>
        <button type="button" class="creo-btn" data-variant="secondary" data-size="s">
          Secondary
        </button>
        <button type="button" class="creo-btn" data-variant="ghost" data-size="s">
          Ghost
        </button>
      </div>
    ),
  },
  {
    name: 'Badge',
    slug: 'badge',
    desc: 'Pill-shaped status / count / tag — 6 variants',
    render: () => (
      <div class="docs-gallery-cluster">
        <span class="creo-badge" data-variant="brand">
          v0.24
        </span>
        <span class="creo-badge" data-variant="success">
          Passing
        </span>
        <span class="creo-badge" data-variant="warning">
          Beta
        </span>
        <span class="creo-badge" data-variant="error">
          3
        </span>
        <span class="creo-badge" data-variant="info">
          New
        </span>
      </div>
    ),
  },
  {
    name: 'Alert',
    slug: 'alert',
    desc: 'Inline persistent status — 4 semantic variants',
    render: () => (
      <div class="creo-alert" data-variant="success">
        <span class="creo-alert-icon" aria-hidden="true">
          ✓
        </span>
        <div class="creo-alert-content">
          <strong>Deployed.</strong> creo-ui は 3 platform に着地しました。
        </div>
      </div>
    ),
  },
  {
    name: 'Switch',
    slug: 'switch',
    desc: 'Immediate toggle (settings / feature flag)',
    render: () => (
      <div class="docs-gallery-stack">
        <label class="creo-switch">
          <input
            type="checkbox"
            class="creo-switch-input"
            role="switch"
            checked
            aria-checked="true"
          />
          <span class="creo-switch-track">
            <span class="creo-switch-thumb" />
          </span>
          <span>Editor Mode</span>
        </label>
        <label class="creo-switch">
          <input type="checkbox" class="creo-switch-input" role="switch" aria-checked="false" />
          <span class="creo-switch-track">
            <span class="creo-switch-thumb" />
          </span>
          <span>Reduced motion</span>
        </label>
      </div>
    ),
  },
  {
    name: 'Progress',
    slug: 'progress',
    desc: 'Determinate + indeterminate bar + inline spinner',
    render: () => (
      <div class="docs-gallery-stack docs-gallery-stack--wide">
        <div class="creo-progress">
          <div class="creo-progress-fill" style={{ width: '72%' }} />
        </div>
        <div class="creo-progress">
          <div class="creo-progress-fill" style={{ width: '38%' }} />
        </div>
      </div>
    ),
  },
  {
    name: 'Avatar',
    slug: 'avatar',
    desc: 'Visual identity — initials × 4 sizes × status',
    render: () => (
      <div class="docs-gallery-cluster">
        <span class="creo-avatar" data-size="l">
          <span class="creo-avatar-initials" aria-label="Mako">
            MK
          </span>
          <span class="creo-avatar-status" data-status="online" aria-hidden="true" />
        </span>
        <span class="creo-avatar" data-size="l">
          <span class="creo-avatar-initials" aria-label="Claude">
            CL
          </span>
        </span>
        <span class="creo-avatar" data-shape="square" data-size="l">
          <span class="creo-avatar-initials" aria-label="Akira">
            AK
          </span>
        </span>
      </div>
    ),
  },
  {
    name: 'Input',
    slug: 'input',
    desc: 'Text field — bordered / filled × 3 sizes × error',
    render: () => (
      <div class="docs-gallery-stack docs-gallery-stack--wide">
        <input class="creo-input" type="text" value="mako@chronista.club" readonly />
        <input
          class="creo-input"
          type="text"
          placeholder="Filled variant"
          data-variant="filled"
          readonly
        />
      </div>
    ),
  },
  {
    name: 'Segmented',
    slug: 'segmented',
    desc: 'Mutually exclusive options bar',
    render: () => (
      <div class="creo-segmented" role="radiogroup" aria-label="View mode">
        <label class="creo-segmented-option">
          <input type="radio" name="gallery-seg" value="day" checked />
          <span>Day</span>
        </label>
        <label class="creo-segmented-option">
          <input type="radio" name="gallery-seg" value="week" />
          <span>Week</span>
        </label>
        <label class="creo-segmented-option">
          <input type="radio" name="gallery-seg" value="month" />
          <span>Month</span>
        </label>
      </div>
    ),
  },
  {
    name: 'Tabs',
    slug: 'tabs',
    desc: 'Tab navigation with aria-selected',
    render: () => (
      <div class="creo-tabs">
        <div class="creo-tabs-list" role="tablist">
          <button type="button" class="creo-tabs-tab" role="tab" aria-selected="true">
            Overview
          </button>
          <button type="button" class="creo-tabs-tab" role="tab" aria-selected="false">
            Tokens
          </button>
          <button type="button" class="creo-tabs-tab" role="tab" aria-selected="false">
            API
          </button>
        </div>
      </div>
    ),
  },
  {
    name: 'Checkbox',
    slug: 'checkbox',
    desc: 'Multi-select binary — accent-color brand tint',
    render: () => (
      <div class="docs-gallery-stack">
        <label class="creo-checkbox">
          <input type="checkbox" class="creo-checkbox-input" checked />
          <span>DTCG token SSOT</span>
        </label>
        <label class="creo-checkbox">
          <input type="checkbox" class="creo-checkbox-input" checked />
          <span>8 theme parity</span>
        </label>
        <label class="creo-checkbox">
          <input type="checkbox" class="creo-checkbox-input" />
          <span>Nightly publish</span>
        </label>
      </div>
    ),
  },
  {
    name: 'Skeleton',
    slug: 'skeleton',
    desc: 'Linear-gradient shimmer placeholder',
    render: () => (
      <div class="docs-gallery-skeleton">
        <span class="creo-skeleton" data-shape="circle" style={{ width: '40px', height: '40px' }} />
        <div class="docs-gallery-skeleton-lines">
          <span class="creo-skeleton" data-shape="text" data-size="l" />
          <span class="creo-skeleton" data-shape="text" style={{ width: '60%' }} />
        </div>
      </div>
    ),
  },
  {
    name: 'Timeline',
    slug: 'timeline',
    desc: 'Vertical activity feed — 5 marker variants',
    render: () => (
      <ol class="creo-timeline docs-gallery-timeline">
        <li class="creo-timeline-item" data-variant="success">
          <div class="creo-timeline-marker" aria-hidden="true" />
          <div class="creo-timeline-content">
            <div class="creo-timeline-title">PR merged</div>
            <div class="creo-timeline-meta">2m ago</div>
          </div>
        </li>
        <li class="creo-timeline-item" data-variant="info">
          <div class="creo-timeline-marker" aria-hidden="true" />
          <div class="creo-timeline-content">
            <div class="creo-timeline-title">v0.24 released</div>
            <div class="creo-timeline-meta">today</div>
          </div>
        </li>
      </ol>
    ),
  },
  {
    name: 'Toast',
    slug: 'toast',
    desc: 'Transient region — 6 placements × 5 variants',
    render: () => (
      <div class="creo-toast docs-gallery-toast" data-variant="success">
        <span class="creo-toast-icon" aria-hidden="true">
          ✓
        </span>
        <div class="creo-toast-content">
          <strong>Saved.</strong> Token patch を反映しました。
        </div>
        <button type="button" class="creo-toast-close" aria-label="閉じる" tabindex="-1">
          ✕
        </button>
      </div>
    ),
  },
  {
    name: 'Stepper',
    slug: 'stepper',
    desc: 'Horizontal wizard — 4 states',
    render: () => (
      <ol class="creo-stepper docs-gallery-stepper">
        <li class="creo-stepper-item" data-state="completed">
          <span class="creo-stepper-marker" aria-hidden="true">
            ✓
          </span>
          <div class="creo-stepper-content">
            <div class="creo-stepper-label">Design</div>
          </div>
        </li>
        <li class="creo-stepper-item" data-state="current" aria-current="step">
          <span class="creo-stepper-marker" aria-hidden="true">
            2
          </span>
          <div class="creo-stepper-content">
            <div class="creo-stepper-label">Build</div>
          </div>
        </li>
        <li class="creo-stepper-item" data-state="pending">
          <span class="creo-stepper-marker" aria-hidden="true">
            3
          </span>
          <div class="creo-stepper-content">
            <div class="creo-stepper-label">Ship</div>
          </div>
        </li>
      </ol>
    ),
  },
  {
    name: 'Card',
    slug: 'card',
    desc: 'Concept boundary — default / elevated / outlined',
    render: () => (
      <article class="creo-card docs-gallery-mini-card" data-variant="elevated" data-padding="m">
        <span class="creo-badge" data-variant="brand">
          Editor Mode
        </span>
        <div class="docs-gallery-mini-card-title">Live design surface</div>
        <div class="docs-gallery-mini-card-body">
          Designer と AI agent が同じ surface 上で token を編集。
        </div>
      </article>
    ),
  },
]

const COMPONENTS: readonly ComponentEntry[] = [
  // Detail pages (11)
  { name: 'Button', slug: 'button', desc: 'Action trigger — 3 variants × 3 sizes', detail: true },
  {
    name: 'Input',
    slug: 'input',
    desc: 'Text field — bordered / filled × 3 sizes × error',
    detail: true,
  },
  {
    name: 'Checkbox',
    slug: 'checkbox',
    desc: 'Multi-select binary — accent-color brand tint',
    detail: true,
  },
  {
    name: 'Radio',
    slug: 'radio',
    desc: 'Exclusive selection in named group',
    detail: true,
  },
  {
    name: 'Switch',
    slug: 'switch',
    desc: 'Immediate toggle (settings / feature flag)',
    detail: true,
  },
  {
    name: 'Card',
    slug: 'card',
    desc: 'Concept boundary — default / elevated / outlined',
    detail: true,
  },
  {
    name: 'Avatar',
    slug: 'avatar',
    desc: 'Visual identity — image / initials × 4 sizes × shape',
    detail: true,
  },
  {
    name: 'Badge',
    slug: 'badge',
    desc: 'Pill-shaped status / count / tag — 6 variants',
    detail: true,
  },
  {
    name: 'Dialog',
    slug: 'dialog',
    desc: 'Native <dialog> modal — focus trap + backdrop',
    detail: true,
  },
  {
    name: 'Tooltip',
    slug: 'tooltip',
    desc: 'CSS-only hover/focus hint — 4 placements',
    detail: true,
  },
  {
    name: 'Alert',
    slug: 'alert',
    desc: 'Inline persistent status — 4 semantic variants',
    detail: true,
  },
  {
    name: 'Tabs',
    slug: 'tabs',
    desc: 'Tab navigation with aria-selected — default/pill × 3 sizes',
    detail: true,
  },
  {
    name: 'Breadcrumbs',
    slug: 'breadcrumbs',
    desc: '<nav> + <ol> with chevron/slash/dot separators',
    detail: true,
  },
  {
    name: 'Menu',
    slug: 'menu',
    desc: 'Native popover API based dropdown',
    detail: true,
  },
  {
    name: 'Pagination',
    slug: 'pagination',
    desc: 's/m/l × default/compact, aria-current',
    detail: true,
  },
  {
    name: 'Table',
    slug: 'table',
    desc: 'Sortable + aria-sort table — striped / sticky-head / s/m/l',
    detail: true,
  },
  {
    name: 'Timeline',
    slug: 'timeline',
    desc: 'Vertical activity feed — 5 marker variants (semantic)',
    detail: true,
  },
  {
    name: 'Stepper',
    slug: 'stepper',
    desc: 'Horizontal/vertical wizard — 4 states (completed/current/pending/error)',
    detail: true,
  },
  {
    name: 'Progress',
    slug: 'progress',
    desc: 'Determinate + indeterminate bar + inline spinner',
    detail: true,
  },
  {
    name: 'Skeleton',
    slug: 'skeleton',
    desc: 'Linear-gradient shimmer placeholder — text/circle/rect',
    detail: true,
  },
  {
    name: 'Form field',
    slug: 'form-field',
    desc: 'Label + input + helper-text composite (error state、 required indicator)',
    detail: true,
  },
  {
    name: 'Segmented',
    slug: 'segmented',
    desc: 'Mutually exclusive options bar (radio group の visual variant)',
    detail: true,
  },
  {
    name: 'Toast',
    slug: 'toast',
    desc: 'Transient region (6 placements × 5 variants)',
    detail: true,
  },
  {
    name: 'Accordion',
    slug: 'accordion',
    desc: 'Native <details> / <summary> based — bordered / subtle、 exclusive (name attr)',
    detail: true,
  },
  {
    name: 'Popover',
    slug: 'popover',
    desc: 'Native popover (3 sizes × default/muted) — non-modal interactive panel',
    detail: true,
  },
  {
    name: 'Drawer',
    slug: 'drawer',
    desc: 'Native <dialog>.showModal() — 4 placements × 4 sizes',
    detail: true,
  },
  {
    name: 'Empty state',
    slug: 'empty-state',
    desc: 'Icon + title + description + actions — first-time/no-result/error',
    detail: true,
  },
  {
    name: 'Error boundary',
    slug: 'error-boundary',
    desc: 'State polish — semantic error + brand identity の dual layer + recovery CTA',
    detail: true,
  },
  {
    name: 'Combobox',
    slug: 'combobox',
    desc: 'Native <input list> + <datalist> — type-ahead suggestion',
    detail: true,
  },
  {
    name: 'Header',
    slug: 'header',
    desc: '3-slot ViewBuilder (logo / nav / actions) — default/marketing × sticky/elevation',
    detail: true,
  },
  // Layout primitives (4 件、 NEW CSS in PR #22)
  {
    name: 'Stack',
    slug: 'stack',
    desc: '1-axis flex layout primitive — vertical/horizontal × gap/align/justify/wrap',
    detail: true,
  },
  {
    name: 'Grid',
    slug: 'grid',
    desc: 'CSS Grid layout primitive — 1/2/3/4/6/12 cols + auto-fit responsive',
    detail: true,
  },
  {
    name: 'Container',
    slug: 'container',
    desc: 'max-width + horizontal centering — 5 sizes (s/m/l/xl/full)',
    detail: true,
  },
  {
    name: 'Divider',
    slug: 'divider',
    desc: 'Visual / semantic separator — horizontal/vertical × thin/thick × subtle',
    detail: true,
  },
]

export default function ComponentsIndex() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Components</p>
        <h1>All components</h1>
        <p class="docs-page-lead">
          creo-ui は <strong>{COMPONENTS.length} 個</strong>の component を提供。 全て CSS class +
          <code> data-* attribute</code> で variant / size / state を表現する{' '}
          <strong>framework-agnostic</strong> 設計 — React / Vue / Solid / 生 HTML どれでも同じ
          class を import すれば動く。 このサイト自身も consumer (creo-ui を import して docs render
          に使用) なので、 下の preview は <strong>実物の live render</strong> である。
        </p>
      </header>

      <section>
        <div class="docs-gallery-head">
          <h2 class="docs-section-title">Featured</h2>
          <p class="docs-page-helper">
            代表 {FEATURED.length} component の live specimen。 card をクリックすると props table +
            token reference + a11y note を持つ完全版 page へ。
          </p>
        </div>
        <div class="docs-gallery-grid">
          <For each={FEATURED}>
            {(c) => (
              <A class="docs-gallery-card" href={`/components/${c.slug}`}>
                <div class="docs-gallery-preview" aria-hidden="true">
                  <div class="docs-gallery-specimen">{c.render()}</div>
                </div>
                <div class="docs-gallery-meta">
                  <div class="docs-gallery-meta-head">
                    <span class="docs-gallery-name">{c.name}</span>
                    <span class="docs-gallery-arrow" aria-hidden="true">
                      →
                    </span>
                  </div>
                  <div class="docs-gallery-desc">{c.desc}</div>
                </div>
              </A>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">All {COMPONENTS.length} components</h2>
        <p class="docs-page-helper">
          全 component が live preview + props table + token reference + a11y note を持つ完全版 page
          を持つ。
        </p>
        <div class="docs-components-grid">
          <For each={COMPONENTS.filter((c) => c.detail)}>
            {(c) => (
              <A
                class="docs-component-card docs-component-card--detail"
                href={`/components/${c.slug}`}
              >
                <div class="docs-component-card-name">{c.name}</div>
                <div class="docs-component-card-desc">{c.desc}</div>
                <div class="docs-component-card-cta">View →</div>
              </A>
            )}
          </For>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">設計規約</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>CSS class + data attribute</strong> —{' '}
            <code>.creo-btn[data-variant="primary"]</code> 形式。 React / Vue / Solid props (
            <code>variant="primary"</code>) → DOM 上は同じ <code>data-variant</code>
          </li>
          <li>
            <strong>Token SSOT 経由のみ</strong> — component CSS で hardcode 禁止、 必ず{' '}
            <code>var(--color-*)</code> / <code>var(--spacing-*)</code> 等。
            <A href="/foundations/principles">原則 6</A> 参照
          </li>
          <li>
            <strong>5 tier size-feel convention</strong> — Component の size variant は s / m / l の
            3 段階 (xs-xl の中央 3 段抜粋)。 <A href="/foundations/principles">原則 1</A> 参照
          </li>
          <li>
            <strong>Apple HIG</strong> — <code>layout.target.tap</code> (44pt) を min-height、{' '}
            <code>layout.target.focus</code> (32pt) を s variant で
          </li>
        </ul>
      </section>
    </>
  )
}
