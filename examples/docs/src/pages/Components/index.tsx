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
    desc: 'sm/md/lg × default/compact, aria-current',
    detail: true,
  },

  // Shipped, spec only (12)
  { name: 'Form field', slug: 'form-field', desc: 'Label + input + helper-text composite' },
  { name: 'Segmented', slug: 'segmented', desc: 'Mutually exclusive options bar' },
  { name: 'Progress', slug: 'progress', desc: 'Determinate + indeterminate bar + spinner' },
  { name: 'Toast', slug: 'toast', desc: 'Transient region (6 placements × 5 variants)' },
  { name: 'Accordion', slug: 'accordion', desc: 'Native <details> / <summary> based' },
  { name: 'Table', slug: 'table', desc: 'Sortable + aria-sort table' },
  { name: 'Popover', slug: 'popover', desc: 'Native popover (3 sizes × default/muted)' },
  { name: 'Drawer', slug: 'drawer', desc: 'Native <dialog>.showModal() — 4 placements × 4 sizes' },
  { name: 'Skeleton', slug: 'skeleton', desc: 'Linear-gradient shimmer placeholder' },
  { name: 'Empty state', slug: 'empty-state', desc: 'Icon + title + description + actions' },
  {
    name: 'Stepper',
    slug: 'stepper',
    desc: 'Horizontal/vertical with completed/current/pending/error',
  },
  { name: 'Timeline', slug: 'timeline', desc: 'Vertical activity feed (5 marker variants)' },
  { name: 'Combobox', slug: 'combobox', desc: 'Native <input list> + <datalist>' },
  { name: 'Header', slug: 'header', desc: '3-slot ViewBuilder (logo / nav / actions)' },
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
          live preview + props table + token reference + a11y note を持つ完全版 page。 残りの 12
          component は spec doc (GitHub) を参照。
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
        <h2 class="docs-section-title">Spec only (GitHub)</h2>
        <p class="docs-page-helper">
          docs page 化は段階的。 各 component の spec は{' '}
          <code>docs/components/&lt;name&gt;.md</code> に 記述済 (Purpose / Anatomy / Props / Token
          / A11y / Do-Don't / 使用例)。
        </p>
        <div class="docs-components-grid">
          <For each={COMPONENTS.filter((c) => !c.detail)}>
            {(c) => (
              <a
                class="docs-component-card"
                href={`https://github.com/chronista-club/creo-ui/blob/main/docs/components/${c.slug}.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div class="docs-component-card-name">{c.name}</div>
                <div class="docs-component-card-desc">{c.desc}</div>
                <div class="docs-component-card-cta">Spec ↗</div>
              </a>
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
            <strong>5-step size-feel rule</strong> — sm / md / lg は xs-xl の 3 段抜粋。
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
