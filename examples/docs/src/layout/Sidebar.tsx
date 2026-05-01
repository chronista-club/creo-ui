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
      { href: '/components/card', label: 'Card' },
      { href: '/components/avatar', label: 'Avatar' },
      { href: '/components/dialog', label: 'Dialog' },
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
    items: [{ href: '/playground', label: 'Playground', tag: 'live' }],
  },
]

export default function Sidebar() {
  return (
    <aside class="docs-sidebar" aria-label="documentation">
      <nav>
        <For each={NAV}>
          {(group) => (
            <section class="docs-sidebar-group">
              <h2 class="docs-sidebar-title">{group.title}</h2>
              <ul class="docs-sidebar-list">
                <For each={group.items}>
                  {(item) => (
                    <li>
                      <A
                        class="docs-sidebar-link"
                        href={item.href}
                        end={item.href === '/'}
                        activeClass="is-active"
                      >
                        <span>{item.label}</span>
                        {item.tag && <span class="docs-sidebar-tag">{item.tag}</span>}
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
