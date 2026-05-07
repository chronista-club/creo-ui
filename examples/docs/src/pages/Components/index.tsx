import { A } from '@solidjs/router'
import { For } from 'solid-js'

interface ComponentEntry {
  name: string
  slug: string
  desc: string
  detail?: boolean
}

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
          creo-ui-web v0.14.0 で shipped した 27 component。 全て CSS class +
          <code> data-* attribute</code> で variant / size / state を表現する{' '}
          <strong>framework-agnostic</strong> 設計 — React / Vue / Solid / 生 HTML どれでも同じ
          class を import すれば動く。 このサイト自身も consumer (creo-ui-web を import して docs
          render に使用)。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Detail pages</h2>
        <p class="docs-page-helper">
          live preview + props table + token reference + a11y note を持つ完全版 page。 packages/web
          の **27 component CSS が全て docs 化** ✨
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
            <strong>5-step size-feel convention</strong> — sm / md / lg は xs-xl の 3 段抜粋。
            <A href="/foundations/principles">原則 1</A> 参照
          </li>
          <li>
            <strong>Apple HIG</strong> — <code>layout.target.tap</code> (44pt) を min-height、{' '}
            <code>layout.target.focus</code> (32pt) を sm variant で
          </li>
        </ul>
      </section>
    </>
  )
}
