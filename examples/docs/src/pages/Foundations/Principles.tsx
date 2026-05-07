import type { JSX } from 'solid-js'

export default function Principles() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Principles</h1>
        <p class="docs-page-lead">
          Token 設計を貫く 6 つの原則。 「なぜこの構造か」 を articulate して、 token を増やす /
          削る / alias を作るときの判断基準とする。 確立: 2026-04-22。
        </p>
      </header>

      <Principle
        number="01"
        title="5 tier size-feel convention"
        rule="Dimension scale は xs / s / m / l / xl の 5 tier を基本骨格とする。 中央 (m) が default、 上下 2 段ずつ。"
      >
        <h3>Why</h3>
        <p>
          Miller の <strong>7±2 法則</strong> — 人間の短期記憶は 5-9 項目。 5 step
          は認知負荷の下限近く、 一目で全体把握できる。 段階数を増やすほど「どれを使うか」
          の判断コストが膨らみ、 一貫性が崩れる。 デザイナの constraint も意図 — 多すぎる値は misuse
          を招く。
        </p>
        <h3>How it shows up</h3>
        <p>
          Component の size variant は <code>sm</code> / <code>md</code> / <code>lg</code> の 3 段階
          = 5 step から中央 3 段抜粋。 7 段階の component は無い。 例外: <code>radius</code> は{' '}
          <code>none</code> / <code>full</code> を special として持つが、 中の 5 段は rule に従う。
        </p>
      </Principle>

      <Principle
        number="02"
        title="Spacing vs Margin — sibling と block の区別"
        rule="spacing.* = 要素「間」 の gap (sibling 間、 密)。 margin.* = block「外」 の rhythm (section 間、 疎)。 同 md=18px で結節、 lg/xl で発散する 2 系統。"
      >
        <h3>Why</h3>
        <p>
          タイポグラフィの <strong>line-height (paragraph 内)</strong> と{' '}
          <strong>leading (paragraph 間)</strong> の関係を layout に拡張したもの。 sibling 間と
          block 間で必要な breathing space は質的に違う — 前者は密接さ、 後者は呼吸。 同じ scale
          で扱うと 「カードの padding と section の間隔が同じ」 のような違和感が出る。
        </p>
        <h3>How it shows up</h3>
        <p>
          <code>spacing.l = 24px</code> / <code>margin.l = 40px</code> (1.67 倍)。
          <code>spacing.xl = 32px</code> / <code>margin.xl = 64px</code> (2 倍)。 大きくなるほど
          margin は呼吸量を増やす。 form field の縦間隔は <code>spacing.s</code>、 hero と footer
          の間は <code>margin.xl</code>。
        </p>
      </Principle>

      <Principle
        number="03"
        title="Token と Alias の二層"
        rule="基本 token (spacing / margin / radius / shadow) は atomic で直接値。 Alias (layout.gap.{tight,sibling,section,page}) は semantic で基本 token を参照。"
      >
        <h3>Why</h3>
        <p>
          Designer は 「これは sibling 間」 「ここは page-level break」 という <strong>意図</strong>{' '}
          で 考える。 alias がその語彙を提供する一方で、 base token (atomic) を変えれば全 alias
          が同期する。 単層 (alias 無し) だと意図表現が弱く、 単層 (atomic 無し)
          だと再利用性が破綻。
        </p>
        <h3>How it shows up</h3>
        <p>
          <code>layout.gap.tight = {'{spacing.xs}'}</code>、{' '}
          <code>layout.gap.sibling = {'{spacing.m}'}</code>、
          <code>layout.gap.section = {'{margin.l}'}</code>、{' '}
          <code>layout.gap.page = {'{margin.xl}'}</code>。 consumer は alias を使う、 maintainer は
          base を tune。
        </p>
      </Principle>

      <Principle
        number="04"
        title="Concentric corners (Apple HIG)"
        rule="親子の radius は 「子 radius = 親 radius - 親 padding」 を満たす。 機械的維持には concentric() helper を使う。"
      >
        <h3>Why</h3>
        <p>
          親 container の角と内側の child の角が <strong>同心円的に揃う</strong> と、
          視覚的調和が生まれる。 逆に揃ってないと 「中の要素が角に当たって押されてる」
          不快感が出る。 Apple HIG (iOS 16+) で 明文化された原則。
        </p>
        <h3>How it shows up</h3>
        <p>
          radius は 7 step (none / xs / s / m / l / xl / full)。 中の 5 tier が size-feel convention
          に従い、 none / full は special (explicit reset / pill shape)。{' '}
          <code>creo-ui-editor-host</code> の<code>concentric()</code> helper が「親 radius と
          padding から子 radius を導出」 を機械的に提供。
        </p>
      </Principle>

      <Principle
        number="05"
        title="Multi-platform parity"
        rule="同一 token が Web (CSS variable) / Apple (SwiftUI Color, CGFloat) / Rust (Rgb 構造体, f32) で同じ意味を持つ。 命名規約は platform 慣習に追従。"
      >
        <h3>Why</h3>
        <p>
          Creo ecosystem は Web 中心ではない — Vantage Point (Rust TUI / wry WebView) や Mac native
          app も同じ design system を共有する。 platform ごとに token を別々に定義すると drift
          が発生して、 「Web の brand color と Mac app の brand color が微妙に違う」
          という最悪の体験になる。
        </p>
        <h3>How it shows up</h3>
        <p>
          <code>{'tokens/**/*.json'}</code> (DTCG 準拠) が <strong>SSOT</strong>。
          <code>style-dictionary v4</code> + custom format が:
        </p>
        <ul>
          <li>
            Web → CSS variable + JS export (<code>--color-brand-primary</code>)
          </li>
          <li>
            Apple → SwiftUI Color extension (<code>colorBrandPrimary</code>, camelCase)
          </li>
          <li>
            Rust → Rgb 構造体 + f32 const (<code>COLOR_BRAND_PRIMARY</code>, SCREAMING_SNAKE)
          </li>
        </ul>
        <p>を生成。 platform 慣習に従いつつ意味は統一。</p>
      </Principle>

      <Principle
        number="06"
        title="Token SSOT 強制 — no hardcode"
        rule="component CSS / Swift / Rust で hardcode の値 (色 / 数値 / radius) は禁止。 必ず var(--...) や CreoUITokens 経由。"
      >
        <h3>Why</h3>
        <p>Hardcode を 1 箇所許すと、 以下の 3 機能が同時に壊れる:</p>
        <ul>
          <li>
            <strong>Theme 切替</strong> — 8 theme (4 family × light/dark) のうち、 hardcode
            部分だけ追従しない
          </li>
          <li>
            <strong>Editor Mode</strong> — live token edit が hardcode 部分を素通り、
            「動かないつまみ」 ができる
          </li>
          <li>
            <strong>Cross-platform parity</strong> — Web は固定値で OK でも、 同 component を Swift
            / Rust に 移植する時に同期しない
          </li>
        </ul>
        <h3>How it shows up</h3>
        <p>
          <code>creo-ui-web/components.css</code> 全体が token 経由。
          <code>creo-ui-md-view/styles.css</code> も同様。 docs site (この page を含む) も{' '}
          <code>--color-*</code> / <code>--spacing-*</code> 経由で 書かれているため、 docs 自身が{' '}
          <strong>regression detection 装置</strong> として働く。 token に変更があれば docs site
          の見た目が即変わる。
        </p>
      </Principle>

      <section class="docs-principles-footnote">
        <h2 class="docs-section-title">この原則をどう使うか</h2>
        <p>
          token を増やしたい / 削りたいと思ったら、 上記 6 原則と照らし合わせる。 「2xl spacing
          欲しい」 → 原則 1 に照らして 5 step 違反、 不採用。 「margin と spacing 統合できる?」 →
          原則 2 で双 scale が機能設計、 統合すると意図表現が落ちるため不可。 「component で 直接
          16px 書きたい」 → 原則 6 で禁止、 spacing.s を経由。
        </p>
        <p>
          原則は時間で風化する — 半年後も同じ判断ができるよう、 docs に articulate して残す。 これが
          design system における <strong>Architecture Decision Record</strong>。
        </p>
      </section>
    </>
  )
}

interface PrincipleProps {
  number: string
  title: string
  rule: string
  children: JSX.Element
}

function Principle(props: PrincipleProps) {
  return (
    <section class="docs-principle">
      <header class="docs-principle-head">
        <span class="docs-principle-number" aria-hidden="true">
          {props.number}
        </span>
        <h2 class="docs-principle-title">{props.title}</h2>
      </header>
      <p class="docs-principle-rule">{props.rule}</p>
      <div class="docs-principle-body">{props.children}</div>
    </section>
  )
}
