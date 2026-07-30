import { A } from '@solidjs/router'

export default function GettingStarted() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Overview</p>
        <h1>Getting started</h1>
        <p class="docs-page-lead">
          creo-ui は <strong>Web · Apple · Rust</strong> の 3 platform を 1 つの DTCG token から
          生成する design system。 このページでは Web (CSS + SolidJS) を例に install → first example
          まで案内。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Install</h2>
        <pre class="docs-code">
          <code>{`# 必須 (token CSS + components.css)
bun add @chronista-club/creo-ui

# (任意) Editor Mode の reference runtime
bun add @chronista-club/creo-ui-editor-host solid-js

# (任意) Markdown renderer
bun add creo-ui-md-view

# (任意) Iconify-based icon adapter
bun add @chronista-club/creo-ui-icons-web`}</code>
        </pre>
        <p class="docs-page-helper">
          npm / yarn / pnpm でも同様。 すべての package は{' '}
          <a href="https://www.npmjs.com/package/creo-ui" target="_blank" rel="noopener noreferrer">
            npmjs.com
          </a>{' '}
          公開中 (Apache-2.0)。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">CSS の取り込み</h2>
        <pre class="docs-code">
          <code>{`// app entry (例: main.tsx)
import '@chronista-club/creo-ui/tokens.css'        // 8 theme + 全 token (--color-*, --spacing-*, ...)
import '@chronista-club/creo-ui/components.css'    // 27 component の CSS class (.creo-btn, .creo-card, ...)

// (任意)
import 'creo-ui-md-view/styles.css'`}</code>
        </pre>
        <p class="docs-page-helper">
          tokens.css は <code>:root</code> に CSS custom property を定義。 components.css は class +
          data-attribute base (<A href="/foundations/principles">原則 6</A>) の framework-agnostic
          形式。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">First example — Button + Input + Card</h2>
        <pre class="docs-code">
          <code>{`<!-- React / Vue / Solid / 生 HTML どれでも同じ -->
<article class="creo-card" data-variant="elevated" data-padding="l">
  <h2>Sign up</h2>
  <p>creo-ui を試してみる</p>

  <label for="email">Email</label>
  <input id="email" class="creo-input" type="email" placeholder="you@example.com" />

  <div style="display: flex; gap: var(--layout-gap-tight); margin-top: var(--spacing-m);">
    <button class="creo-btn" data-variant="primary">Sign up</button>
    <button class="creo-btn" data-variant="secondary">Cancel</button>
  </div>
</article>`}</code>
        </pre>
        <p class="docs-page-helper">
          → <A href="/components">All components</A> で 27 component の variant matrix を確認。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">Theme switching</h2>
        <pre class="docs-code">
          <code>{`<!-- HTML 属性で theme 切替 -->
<html data-theme="sora-dark">
  <!-- ... -->
</html>

<!-- JS で動的切替 -->
<script>
  document.documentElement.setAttribute('data-theme', 'mint-dark')
  // 'mint-light' / 'mint-dark' / 'sora-light' / 'sora-dark' /
  // 'contrast-light' / 'contrast-dark' / 'oldschool-light' / 'oldschool-dark'
</script>`}</code>
        </pre>
        <p class="docs-page-helper">
          → <A href="/foundations/theming">Theming</A> で 8 theme の brand 色 / fleetstage 互換
          alias (<code>.dark</code> / <code>[data-theme="dark"]</code>) を確認。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">Editor Mode (live editing)</h2>
        <pre class="docs-code">
          <code>{`import {
  EditorHostProvider,
  EditorLayer,
  bind,
  number,
  cssVarNumberTarget,
} from '@chronista-club/creo-ui-editor-host'

// Field 宣言は Provider の下 (component の中) で呼ぶ。
// bind({ target, control, placement }) の 3 点セット。
function CardPanel() {
  bind({
    target: cssVarNumberTarget('card.padding', '--app-card-padding', 18, 'px'),
    control: number({ min: 0, max: 48, step: 1, unit: 'px', variant: 'slider' }),
    placement: { semantic: 'tool', group: 'card', label: 'Card padding', order: 1 },
  })
  return <div class="creo-card">...</div>
}

// Provider + Layer
<EditorHostProvider config={{ exposeConsole: true }}>
  <CardPanel />
  <EditorLayer />
</EditorHostProvider>

// Ctrl+Shift+E で Editor Mode toggle、 RIGHT panel で field 操作

// 注意: bind は field 登録時に initial を document root へ適用する。
// 対象は app 固有の var (--app-*) にすること。design token (--spacing-m 等) を
// 直接 bind すると、Editor Mode が OFF でもその値が焼き込まれて全体に効く。`}</code>
        </pre>
        <p class="docs-page-helper">
          → <A href="/lab/editor">Playground</A> で動作実演、{' '}
          <A href="/concepts/editor-mode">Editor Mode protocol</A> で D-1 〜 D-12 articulate。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">Multi-platform (Apple / Rust)</h2>
        <p class="docs-page-helper">同 token を Swift / Rust から消費するには:</p>
        <pre class="docs-code">
          <code>{`# Apple (Swift Package Manager)
dependencies: [
  .package(url: "https://github.com/chronista-club/creo-ui", branch: "main"),
],

// SwiftUI
import CreoUI
Text("Hi").foregroundColor(.colorBrandPrimary)
  .padding(CreoUITokens.spacingM)

# Rust (Cargo)
[dependencies]
creo-ui = "0.3"
# 必要に応じて feature flag
# creo-ui = { version = "0.3", features = ["ratatui"] }

// Rust
use creo-ui::tokens;
let primary = tokens::COLOR_BRAND_PRIMARY;  // Rgb { r, g, b }
let m = tokens::SPACING_M;                  // f32 px (5 tier 中央)`}</code>
        </pre>
        <p class="docs-page-helper">
          → <A href="/concepts/multi-platform">Multi-platform pipeline</A> で命名規約 + custom
          format の理由。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">次に読むもの</h2>
        <ul class="docs-bullet-list">
          <li>
            <A href="/foundations/principles">Principles</A> — token 設計を貫く 6 原則
          </li>
          <li>
            <A href="/concepts/frame-system">Frame system</A> — 3D Spatial UI の design DNA
            (近日着手)
          </li>
          <li>
            <A href="/components">Components</A> — 27 component (live preview + Token reference)
          </li>
          <li>
            <A href="/lab/editor">Playground</A> — Editor Mode の live demo
          </li>
        </ul>
      </section>
    </>
  )
}
