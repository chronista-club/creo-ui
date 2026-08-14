import { A } from '@solidjs/router'
import { For } from 'solid-js'

interface NavGroup {
  title: string
  items: readonly { href: string; label: string; tag?: string }[]
}

const NAV: readonly NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { href: '/', label: 'Home' },
      { href: '/getting-started', label: 'Getting started' },
    ],
  },
  {
    title: 'Foundations',
    items: [
      { href: '/foundations/principles', label: 'Principles' },
      { href: '/foundations/color', label: 'Color' },
      { href: '/foundations/typography', label: 'Typography' },
      { href: '/foundations/spacing', label: 'Spacing & Margin' },
      { href: '/foundations/radius', label: 'Radius' },
      { href: '/foundations/shadow', label: 'Shadow' },
      { href: '/foundations/theming', label: 'Theming' },
      { href: '/foundations/focus-ring', label: 'Focus Ring', tag: 'a11y' },
      { href: '/foundations/motion', label: 'Motion', tag: 'rubric' },
      { href: '/foundations/concentric-corner', label: 'Concentric corner', tag: 'HIG' },
      { href: '/foundations/density', label: 'Density mode', tag: 'NEW' },
      { href: '/foundations/iconography', label: 'Iconography' },
      { href: '/foundations/kinetic-typography', label: 'Kinetic typography', tag: 'opt-in' },
    ],
  },
  {
    title: 'Concepts',
    items: [
      { href: '/concepts/frame-system', label: 'Frame system', tag: 'spec' },
      { href: '/concepts/editor-mode', label: 'Editor Mode' },
      { href: '/concepts/layers', label: 'Layers' },
      { href: '/concepts/multi-platform', label: 'Multi-platform' },
    ],
  },
  {
    title: 'Components',
    items: [
      { href: '/components', label: 'All components' },
      { href: '/components/button', label: 'Button' },
      { href: '/components/input', label: 'Input' },
      { href: '/components/checkbox', label: 'Checkbox' },
      { href: '/components/radio', label: 'Radio' },
      { href: '/components/switch', label: 'Switch' },
      { href: '/components/card', label: 'Card' },
      { href: '/components/avatar', label: 'Avatar' },
      { href: '/components/badge', label: 'Badge' },
      { href: '/components/dialog', label: 'Dialog' },
      { href: '/components/tooltip', label: 'Tooltip' },
      { href: '/components/alert', label: 'Alert' },
      { href: '/components/tabs', label: 'Tabs' },
      { href: '/components/breadcrumbs', label: 'Breadcrumbs' },
      { href: '/components/menu', label: 'Menu' },
      { href: '/components/pagination', label: 'Pagination' },
      { href: '/components/table', label: 'Table' },
      { href: '/components/timeline', label: 'Timeline' },
      { href: '/components/stepper', label: 'Stepper' },
      { href: '/components/progress', label: 'Progress' },
      { href: '/components/skeleton', label: 'Skeleton' },
      { href: '/components/form-field', label: 'Form field' },
      { href: '/components/segmented', label: 'Segmented' },
      { href: '/components/toast', label: 'Toast' },
      { href: '/components/accordion', label: 'Accordion' },
      { href: '/components/outliner', label: 'Outliner' },
      { href: '/components/popover', label: 'Popover' },
      { href: '/components/drawer', label: 'Drawer' },
      { href: '/components/empty-state', label: 'Empty state' },
      { href: '/components/combobox', label: 'Combobox' },
      { href: '/components/select', label: 'Select' },
      { href: '/components/header', label: 'Header' },
      { href: '/components/stack', label: 'Stack' },
      { href: '/components/grid', label: 'Grid' },
      { href: '/components/container', label: 'Container' },
      { href: '/components/divider', label: 'Divider' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { href: '/icons', label: 'Icons' },
      { href: '/content', label: 'Content (Markdown)' },
    ],
  },
  {
    title: 'Lab',
    items: [
      { href: '/lab/editor', label: 'Editor surface', tag: 'live' },
      { href: '/lab/frame', label: 'Frame & Gaze', tag: 'spec' },
      { href: '/lab/vision', label: 'Vision input' },
      { href: '/lab/layout', label: 'Layout Engine', tag: 'live' },
    ],
  },
]

export default function Sidebar() {
  return (
    <aside class="creo-sidenav docs-sidebar" aria-label="documentation">
      <nav>
        <For each={NAV}>
          {(group) => (
            <section class="creo-sidenav-group">
              <h2 class="creo-sidenav-title">{group.title}</h2>
              <ul class="creo-sidenav-list">
                <For each={group.items}>
                  {(item) => (
                    <li>
                      {/* 現在地は <A> が自動で付ける aria-current="page" を
                          .creo-sidenav-link 側 CSS が拾う (独自 active class 廃止) */}
                      <A class="creo-sidenav-link" href={item.href} end={item.href === '/'}>
                        <span>{item.label}</span>
                        {item.tag && <span class="creo-sidenav-tag">{item.tag}</span>}
                      </A>
                    </li>
                  )}
                </For>
              </ul>
            </section>
          )}
        </For>
      </nav>
    </aside>
  )
}
