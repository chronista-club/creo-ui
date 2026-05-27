import { A } from '@solidjs/router'
// `packages/web/package.json` から動的に読み (release 毎 stale 化を防止、build-time bake)
import pkg from '../../../../packages/web/package.json'
import ThemeSwitcher from './ThemeSwitcher'

export default function Header() {
  return (
    <header class="docs-header">
      <A class="docs-brand" href="/">
        <span class="docs-brand-logo" aria-hidden="true">
          ◎
        </span>
        <span class="docs-brand-text">creoui</span>
        <span class="docs-brand-version">v{pkg.version}</span>
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
          href="https://github.com/chronista-club/creoui"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>
    </header>
  )
}
