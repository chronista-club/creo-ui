import { A } from '@solidjs/router'

const NAMING = [
  {
    token: 'color.brand.primary',
    web: '--color-brand-primary',
    apple: 'colorBrandPrimary',
    rust: 'COLOR_BRAND_PRIMARY',
  },
  {
    token: 'spacing.m',
    web: '--spacing-m',
    apple: 'spacingM',
    rust: 'SPACING_MD',
  },
  {
    token: 'typography.size.lg',
    web: '--typography-size-lg',
    apple: 'typographySizeLg',
    rust: 'TYPOGRAPHY_SIZE_LG',
  },
  {
    token: 'radius.md',
    web: '--radius-md',
    apple: 'radiusMd',
    rust: 'RADIUS_MD',
  },
] as const

export default function MultiPlatform() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Concepts</p>
        <h1>Multi-platform pipeline</h1>
        <p class="docs-page-lead">
          DTCG JSON (SSOT) → <strong>Style Dictionary v4</strong> → Web (CSS + JS) / Apple (SwiftUI)
          / Rust (struct + interop) の 3 platform へ生成。 命名規約は platform 慣習に追従しつつ、
          意味は統一。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">Pipeline</h2>
        <div class="docs-pipeline-diagram">
          <div class="docs-pipeline-step docs-pipeline-source">
            <div class="docs-pipeline-step-label">SSOT</div>
            <div class="docs-pipeline-step-name">{'tokens/**/*.json'}</div>
            <div class="docs-pipeline-step-meta">W3C DTCG 準拠 · 3 階層 dot-notation</div>
          </div>
          <div class="docs-pipeline-arrow" aria-hidden="true">
            ↓
          </div>
          <div class="docs-pipeline-step docs-pipeline-engine">
            <div class="docs-pipeline-step-label">Engine</div>
            <div class="docs-pipeline-step-name">Style Dictionary v4 + custom format</div>
            <div class="docs-pipeline-step-meta">transforms/config.{'{web,swift,rust}'}.js</div>
          </div>
          <div class="docs-pipeline-arrow" aria-hidden="true">
            ↓
          </div>
          <div class="docs-pipeline-outputs">
            <div class="docs-pipeline-step docs-pipeline-out">
              <div class="docs-pipeline-step-label">Web</div>
              <div class="docs-pipeline-step-name">creo-ui-web</div>
              <div class="docs-pipeline-step-meta">CSS variable + JS export</div>
            </div>
            <div class="docs-pipeline-step docs-pipeline-out">
              <div class="docs-pipeline-step-label">Apple</div>
              <div class="docs-pipeline-step-name">CreoUI (Swift)</div>
              <div class="docs-pipeline-step-meta">SwiftUI Color + CGFloat</div>
            </div>
            <div class="docs-pipeline-step docs-pipeline-out">
              <div class="docs-pipeline-step-label">Rust</div>
              <div class="docs-pipeline-step-name">creo-ui (Rust)</div>
              <div class="docs-pipeline-step-meta">Rgb 構造体 + f32 const</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">命名規約</h2>
        <p class="docs-page-helper">
          同一 token が platform ごとに慣習に従った識別子で expose される。 同じ意味 / 同じ値、
          違う書式。
        </p>
        <div class="docs-naming-table">
          <div class="docs-naming-row docs-naming-head">
            <div>Token (DTCG)</div>
            <div>Web</div>
            <div>Apple (Swift)</div>
            <div>Rust</div>
          </div>
          {NAMING.map((n) => (
            <div class="docs-naming-row">
              <code>{n.token}</code>
              <code>{n.web}</code>
              <code>{n.apple}</code>
              <code>{n.rust}</code>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">Per-platform output</h2>

        <h3 class="docs-platform-title">Web — creo-ui-web</h3>
        <p class="docs-page-helper">
          CSS custom property + ESM module。 OKLCH 値は literal で emit、 modern browser
          がそのまま解釈。
        </p>
        <pre class="docs-code">
          <code>{`/* dist/tokens.css */
:root {
  --color-brand-primary: oklch(73% 0.15 160);
  --spacing-m: 18px;
}

/* dist/tokens.js */
export const colorBrandPrimary = 'oklch(73% 0.15 160)'
export const spacingM = 18

/* dist/components.css — 全 token 経由で書かれた component 集 */
.creo-btn { padding: var(--spacing-m); ... }`}</code>
        </pre>

        <h3 class="docs-platform-title">Apple — CreoUI (Swift)</h3>
        <p class="docs-page-helper">
          SwiftUI <code>Color</code> + <code>CGFloat</code>。 iOS 17+ / macOS 14+ / watchOS 10+ /
          tvOS 17+ 対応。 OKLCH は build 時に hex に変換 (Mint Dark のみ、 他 theme は将来対応)。
        </p>
        <pre class="docs-code">
          <code>{`// Sources/CreoUI/Generated/Tokens.swift
public extension Color {
    static let colorBrandPrimary = Color(red: 0.13, green: 0.74, blue: 0.50)
}

public enum CreoUITokens {
    public static let spacingM: CGFloat = 18.0
    public static let radiusMd: CGFloat = 15.0
}`}</code>
        </pre>

        <h3 class="docs-platform-title">Rust — creo-ui</h3>
        <p class="docs-page-helper">
          struct + const。 ratatui / egui / iced / dioxus interop は opt-in feature flag。 zero-dep
          base crate。
        </p>
        <pre class="docs-code">
          <code>{`// src/generated/tokens.rs (include! 経由で lib.rs から取り込み)
pub struct Rgb { pub r: u8, pub g: u8, pub b: u8 }

pub const COLOR_BRAND_PRIMARY: Rgb = Rgb { r: 33, g: 189, b: 128 };
pub const SPACING_MD: f32 = 18.0;
pub const RADIUS_MD: f32 = 15.0;

// ratatui interop (feature = "ratatui")
use creo_ui::ratatui::{color, palette};
let style = ratatui::style::Style::default()
    .fg(palette::brand_primary());`}</code>
        </pre>
      </section>

      <section>
        <h2 class="docs-section-title">Custom format を hand-roll した理由</h2>
        <p class="docs-page-helper">
          Style Dictionary v4 の標準 transform は使わず、 <code>transforms/config.swift.js</code> /{' '}
          <code>config.rust.js</code> で hand-roll している。 理由:
        </p>
        <ul class="docs-bullet-list">
          <li>
            <strong>Apple 標準 transform は UIKit 指向</strong> — SwiftUI の <code>Color</code>{' '}
            ではなく <code>UIColor</code> を出力。 cross-platform (macOS / iOS) に使えない
          </li>
          <li>
            <strong>Rust 標準 transform は存在しない</strong> — Style Dictionary v4 に Rust output
            は無い。 自分で書くしか
          </li>
          <li>
            <strong>命名規約の細かい制御</strong> — Apple は camelCase、 Rust は SCREAMING_SNAKE、
            sanitize (先頭数字回避) も独自
          </li>
          <li>
            <strong>
              Rust の <code>include!</code> 互換
            </strong>{' '}
            — generated file は <code>lib.rs</code> の <code>pub mod tokens</code> 内に{' '}
            <code>include!</code> される。 inner attribute / inner doc を出すと parse error
            になるので、 manually 抑制
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Build flow</h2>
        <pre class="docs-code">
          <code>{`bun run build         # 全 platform を再生成
bun run build:web     # Web のみ
bun run build:swift   # Swift のみ
bun run build:rust    # Rust のみ`}</code>
        </pre>
        <p class="docs-page-helper">
          Web の <code>dist/</code> は gitignore (npm publish workflow で生成)、 Swift / Rust の
          generated ファイルは <strong>commit 対象</strong>。 これは consumer (cargo build / swift
          build) が docs generate を実行できない前提で、 git に乗せておく方が build が安定するため。
          <code>tokens/**</code> を変更した PR は Swift / Rust generated の diff も一緒に commit
          する。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">関連</h2>
        <ul class="docs-bullet-list">
          <li>
            <A href="/foundations/principles">Principles</A> 原則 5 (Multi-platform parity) で哲学を
            articulate
          </li>
          <li>
            <A href="/foundations/color">Color</A> /{' '}
            <A href="/foundations/typography">Typography</A> 等で実 token を見る
          </li>
        </ul>
      </section>
    </>
  )
}
