import { A } from '@solidjs/router'
// `packages/web/package.json` から動的に読み (release 毎 stale 化を防止、build-time bake)
import pkg from '../../../../packages/web/package.json'
import ThemeSwitcher from './ThemeSwitcher'

/**
 * site header — `.creo-header` の dogfood。
 *
 * sticky / blur / nav の hover・press・active は component (header.css) に全委譲。
 * nav の active 表示は solid-router の <A> が自動で付ける aria-current="page" を
 * `.creo-header-nav a[aria-current="page"]` が拾う (独自 is-active class は廃止)。
 * site 側に残る chrome は高さの固定 (.docs-header、 sidebar / editor dock の
 * offset と同期) のみ。
 */
export default function Header() {
  return (
    <header class="creo-header docs-header" data-variant="app" data-sticky="true">
      <A class="creo-header-logo" href="/">
        Creo UI
        <span class="creo-badge" data-size="s">
          v{pkg.version}
        </span>
      </A>
      <nav class="creo-header-nav" aria-label="primary">
        <A href="/getting-started">Get started</A>
        <A href="/components">Components</A>
        <A href="/lab/editor">Lab</A>
      </nav>
      <div class="creo-header-actions">
        <ThemeSwitcher />
        <a
          class="creo-btn"
          data-variant="ghost"
          data-size="s"
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
