import { A } from '@solidjs/router'
import ThemeSwitcher from './ThemeSwitcher'

export default function Header() {
  return (
    <header class="docs-header">
      <A class="docs-brand" href="/">
        <span class="docs-brand-logo" aria-hidden="true">
          ◎
        </span>
        <span class="docs-brand-text">Creo UI</span>
        <span class="docs-brand-version">v0.16.0</span>
      </A>
      <nav class="docs-header-nav" aria-label="primary">
        <A href="/getting-started" activeClass="is-active">
          Get started
        </A>
        <A href="/components" activeClass="is-active">
          Components
        </A>
        <A href="/playground" activeClass="is-active">
          Playground
        </A>
      </nav>
      <div class="docs-header-actions">
        <ThemeSwitcher />
        <a
          class="docs-header-link"
          href="https://github.com/chronista-club/creo-ui"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </header>
  )
}
