import { A } from '@solidjs/router'

const FEATURES = [
  {
    title: 'Token SSOT',
    body: 'W3C DTCG JSON が唯一の真実。 Style Dictionary v4 が Web (CSS + JS) / Apple (SwiftUI) / Rust (ratatui / egui / iced / dioxus) の 3 platform へ生成。',
    href: '/foundations/color',
    cta: 'Foundations →',
  },
  {
    title: '8 Themes (4 family × light/dark)',
    body: 'Creo (mint) · 空 (Sora) · Contrast / Paradox · Old School。 OKLCH 値で記述、 modern browser がそのまま解釈。',
    href: '/foundations/theming',
    cta: 'Theming →',
  },
  {
    title: 'Editor Mode protocol',
    body: '4 方向 semantic layout (TOP global / LEFT source / RIGHT tool / BOTTOM utility)。 Content 非侵襲、 AI agent access、 universal mode。',
    href: '/editor-mode',
    cta: 'Editor Mode →',
  },
  {
    title: 'Live Design Surface',
    body: 'Console REPL · DOM auto-discover · URL share · Cross-tab sync · Export to CSS patch。 Designer + AI が rebuild 無しで token を編集。',
    href: '/playground',
    cta: 'Playground →',
  },
  {
    title: 'Content viewers (creo-views)',
    body: 'Markdown (mdast) / Mermaid / 将来 image / pdf / kdl / json。 Rust = AST SSOT、 TypeScript = 型安全 renderer。',
    href: '/content',
    cta: 'Content →',
  },
  {
    title: 'Multi-platform parity',
    body: '同じ token が Web の CSS variable、 SwiftUI の Color、 Rust の Rgb 構造体として自動生成。 命名規約は platform 慣習に追従。',
    href: '/getting-started',
    cta: 'Getting started →',
  },
] as const

export default function Home() {
  return (
    <>
      <section class="docs-hero">
        <p class="docs-hero-eyebrow">Design System</p>
        <h1 class="docs-hero-title">
          Tokens, components, and a live design surface — for the Creo ecosystem.
        </h1>
        <p class="docs-hero-lead">
          Creo UI は <strong>Web · Apple · Rust</strong> の 3 platform を 1 つの DTCG token から
          生成する design system。 Editor Mode protocol で designer と AI agent が同じ surface 上で
          token を編集する。
        </p>
        <div class="docs-hero-cta">
          <A class="creo-btn" data-variant="primary" href="/getting-started">
            Get started
          </A>
          <A class="creo-btn" data-variant="ghost" href="/components">
            Browse components
          </A>
          <A class="creo-btn" data-variant="ghost" href="/playground">
            Try the playground
          </A>
        </div>
      </section>

      <section class="docs-features">
        <h2 class="docs-section-title">Why Creo UI</h2>
        <div class="docs-features-grid">
          {FEATURES.map((f) => (
            <article class="docs-feature-card">
              <h3>{f.title}</h3>
              <p>{f.body}</p>
              <A class="docs-feature-cta" href={f.href}>
                {f.cta}
              </A>
            </article>
          ))}
        </div>
      </section>

      <section class="docs-quick-install">
        <h2 class="docs-section-title">Install</h2>
        <pre class="docs-code">
          <code>{`bun add creo-ui-web solid-js
bun add creo-ui-md-view        # Markdown renderer
bun add creo-ui-editor-host    # Editor Mode runtime`}</code>
        </pre>
        <p class="docs-quick-install-note">
          Token CSS は <code>creo-ui-web/tokens.css</code> + <code>creo-ui-web/components.css</code>
          。 詳しくは <A href="/getting-started">Getting started</A>。
        </p>
      </section>
    </>
  )
}
