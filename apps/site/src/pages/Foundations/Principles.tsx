import type { JSX } from 'solid-js'

export default function Principles() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Foundations</p>
        <h1>Principles</h1>
        <p class="docs-page-lead">
          Token 設計と design system 運営を貫く 8 つの原則。 「なぜこの構造か」 を articulate して、
          token を増やす / 削る / alias を作るとき、 doc を整えるとき、 PR の進め方を
          決めるときの判断基準とする。 確立: 2026-04-22 / v0.18 で完全更新: 2026-05-08。
        </p>
      </header>

      <Principle
        number="01"
        title="5 tier size-feel convention"
        rule="Dimension scale は xs / s / m / l / xl の 5 tier を基本骨格とする。 中央 (m) が default、 上下 2 段ずつ。"
      >
        <h3>Why</h3>
        <p>
          Miller の <strong>7±2 法則</strong> — 人間の短期記憶は 5-9 項目。 5 tier
          は認知負荷の下限近く、 一目で全体把握できる。 段階数を増やすほど「どれを使うか」
          の判断コストが膨らみ、 一貫性が崩れる。 デザイナの constraint も意図 — 多すぎる値は misuse
          を招く。
        </p>
        <h3>How it shows up</h3>
        <p>
          全 dimension scale token (<code>spacing</code> / <code>margin</code> / <code>radius</code>{' '}
          / <code>shadow</code> / <code>typography.size</code> / <code>typography.display</code> /{' '}
          <code>typography.icon</code> / <code>layout.container</code> /{' '}
          <code>layout.grid.col-min</code>) が <code>xs</code> / <code>s</code> / <code>m</code> /{' '}
          <code>l</code> / <code>xl</code> で揃う (v0.17 token + v0.18 attribute で完全統一)。
          Component の size variant は <code>s</code> / <code>m</code> / <code>l</code> の 3 段階 =
          5 tier から中央 3 段抜粋。 Tailwind 流の <code>sm/md/lg</code> 命名は完全廃止。 例外:{' '}
          <code>radius</code> は <code>none</code> / <code>full</code>、 <code>shadow</code> は{' '}
          <code>none</code> を special として持つが、 中の 5 段は rule に従う。
        </p>
      </Principle>

      <Principle
        number="02"
        title="Spacing vs Margin — sibling と block の区別"
        rule="spacing.* = 要素「間」 の gap (sibling 間、 密)。 margin.* = block「外」 の rhythm (section 間、 疎)。 同 m=18px で結節、 lg/xl で発散する 2 系統。"
      >
        <h3>Why</h3>
        <p>
          タイポグラフィの <strong>line-height (paragraph 内)</strong> と{' '}
          <strong>leading (paragraph 間)</strong> の関係を layout に拡張したもの。 sibling 間と
          block 間で必要な breathing space は質的に違う — 前者は <strong>密接さ</strong>{' '}
          (情報のかたまり)、 後者は <strong>呼吸</strong> (情報の境界)。 同じ scale で扱うと
          「カードの padding と section の間隔が同じ」 のような違和感が出る。
        </p>
        <h3>How it shows up</h3>
        <p>
          中央 (<code>m</code> = 18px) で結節し、 端 (<code>l</code> / <code>xl</code>) で発散:
        </p>
        <ul>
          <li>
            <code>spacing.l = 24px</code> / <code>margin.l = 40px</code> (1.67 倍)
          </li>
          <li>
            <code>spacing.xl = 32px</code> / <code>margin.xl = 64px</code> (2 倍)
          </li>
        </ul>
        <p>
          form field の縦間隔は <code>spacing.s</code>、 hero と footer の間は{' '}
          <code>margin.xl</code>。 大きくなるほど margin は呼吸量を増やす設計。
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
          <code>layout.gap.sibling = {'{spacing.m}'}</code>、{' '}
          <code>layout.gap.section = {'{margin.l}'}</code>、{' '}
          <code>layout.gap.page = {'{margin.xl}'}</code>。 consumer は alias を使う、 maintainer は
          base を tune。 base を変えれば全 alias の値が自動追従する DTCG token reference 機構 (
          <code>{'{...}'}</code> syntax) を style-dictionary が解決。
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
          不快感が出る。 Apple HIG (iOS 16+) で 明文化された原則、 SwiftUI の{' '}
          <code>cornerRadius</code> は default で concentric を内部計算する。
        </p>
        <h3>How it shows up</h3>
        <p>
          radius は 7 step (<code>none</code> / <code>xs</code> / <code>s</code> / <code>m</code> /{' '}
          <code>l</code> / <code>xl</code> / <code>full</code>)。 中の 5 tier が size-feel
          convention に従い、 <code>none</code> / <code>full</code> は special (explicit reset /
          pill shape)。 機械的計算は <code>@chronista-club/creoui-editor-host</code> の{' '}
          <code>concentric()</code> helper が担当 — `concentric('var(--radius-m)',
          'var(--spacing-m)')` で `calc(var(--radius-m) - var(--spacing-m))` を return、 親 radius
          が theme 切替で動いても child が追従する。
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
            Web → CSS variable + JS export (<code>--color-brand-primary</code>) — kebab-case CSS
            convention
          </li>
          <li>
            Apple → SwiftUI Color extension (<code>colorBrandPrimary</code>) — Swift camelCase
            convention
          </li>
          <li>
            Rust → Rgb 構造体 + f32 const (<code>COLOR_BRAND_PRIMARY</code>) — Rust SCREAMING_SNAKE
            const convention
          </li>
        </ul>
        <p>
          を生成。 <strong>意味は統一、 命名は慣習に従う</strong>。 同じ token を 3 platform
          consumer が import して、 視覚的同一性を実現する。
        </p>
      </Principle>

      <Principle
        number="06"
        title="Token SSOT 強制 — no hardcode"
        rule="component CSS / Swift / Rust で hardcode の値 (色 / 数値 / radius) は禁止。 必ず var(--...) や CreouiTokens 経由。"
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
          <code>creoui/components.css</code> 全体が token 経由。 docs site (この page を含む) も{' '}
          <code>--color-*</code> / <code>--spacing-*</code> 経由で書かれているため、 docs 自身が{' '}
          <strong>regression detection 装置</strong> として働く。 token に変更があれば docs site
          の見た目が即変わる。 v0.16-v0.18 の 5 tier rename では、 <code>token-shim.css</code>{' '}
          legacy alias で旧 var 名を維持しつつ、 dogfood で sweep 漏れを視覚的に検出した
          実例がある。
        </p>
      </Principle>

      <Principle
        number="07"
        title="Living docs sync — 3 SSOT 同期義務"
        rule="tokens/ JSON、 packages/ 実装、 docs/ 文献の 3 SSOT は常に同期。 page と token reality は乖離させない。"
      >
        <h3>Why</h3>
        <p>
          Doc が token reality を超えて進むと、 consumer が doc を信じて存在しない API を呼ぶ ような
          hallucinate な誘導が起きる。 v0.18 sweep の経験から articulate された原則 — token rename
          と doc rename は同じ PR 内で sync しないと、 publish された README が consumer に{' '}
          <strong>古い消費 API を教える状態</strong> が永続化する (npm 詳細ページの stale README
          は最悪の入り口)。
        </p>
        <h3>How it shows up</h3>
        <p>3 文献が canonical な spec / state を持ち、 sync 義務がある:</p>
        <ul>
          <li>
            <code>{'tokens/**/*.json'}</code> — DTCG SSOT。 全 platform token はここから生成。
          </li>
          <li>
            <code>packages/web/src/components/*.css</code> — component class API の実装。 token を
            参照する側 — token 名 rename したら同 PR で sync。
          </li>
          <li>
            <code>docs/components/*.md</code> + <code>docs/design/*.md</code> — class API canonical
            spec + Architecture Decision Record。 内容は実装と drift しないこと。
          </li>
        </ul>
        <p>
          Dogfood (<code>apps/site/</code>) は <strong>viewer</strong> で、 spec の役割は持たない
          (visual reference の SSOT は markdown / generated tokens)。 doc の hardcode が token
          reality と乖離していたら <strong>即時止血</strong> が原則 06 より優先。
        </p>
      </Principle>

      <Principle
        number="08"
        title="2 axis hybrid governance — concept proactive / surface feedback"
        rule="Concept / Architecture / Foundation は creoui 側 proactive に drive。 Surface friction / API ergonomics / new component need は consumer feedback driven。"
      >
        <h3>Why</h3>
        <p>
          設計の駆動源を「 consumer-only feedback」 一本にすると、 consumer が現状の語彙で 要求を
          articulate できない領域 (Frame system / Editor Mode / Theme palette / 5 tier convention
          等の concept) が永遠に articulate されない。 逆に creoui-only proactive だと、 consumer
          の実 friction が観察できず「想定 friction を回避するための rename loop」 で疲弊する (v0.16
          → v0.17 → v0.18 で実体験)。
        </p>
        <h3>How it shows up</h3>
        <p>2 axis を PR ごとに articulate して進める:</p>
        <ul>
          <li>
            <strong>Concept driven (creoui proactive)</strong> — Frame system protocol / Editor Mode
            4 region / 8 theme palette / 5 tier convention / OKLCH adoption / DTCG SSOT 設計 / a11y
            baseline (reduced-motion / WCAG)
          </li>
          <li>
            <strong>Surface driven (consumer feedback)</strong> — data-* attribute friction / 新
            token request / migration ハマり / a11y bug / component-specific size graduation
          </li>
        </ul>
        <p>
          境界判断: <strong>「consumer が現状の語彙で要求を articulate できるか」</strong> —
          できない場合は creoui 側で先に concept を起こす責務、 できる場合は consumer feedback
          を待つ。 固定 rule よりも case-by-case 判断を優先、 PR 説明文で どちら駆動か明示。 詳細は{' '}
          <code>docs/contributing.md</code> 参照。
        </p>
      </Principle>

      <section class="docs-principles-footnote">
        <h2 class="docs-section-title">この原則をどう使うか</h2>
        <p>
          token を増やしたい / 削りたいと思ったら、 上記 8 原則と照らし合わせる。 「2xl spacing
          欲しい」 → 原則 1 に照らして 5 tier 違反、 不採用。 「margin と spacing 統合できる?」 →
          原則 2 で双 scale が機能設計、 統合すると意図表現が落ちるため不可。 「component で 直接
          16px 書きたい」 → 原則 6 で禁止、 <code>spacing.s</code> を経由。 「README に新 API
          書いてあるけど実装無い」 → 原則 7 違反、 即時止血で sync。 「PR の方向は誰が決める?」 →
          原則 8 で concept か surface か articulate、 case-by-case で判断。
        </p>
        <p>
          原則は時間で風化する — 半年後も同じ判断ができるよう、 docs に articulate して残す。 これが
          design system における <strong>Architecture Decision Record</strong>。 原則自身も living
          document — v0.18 で 6 → 8 原則に拡張したように、 ecosystem の成熟に応じて articulate
          を更新していく。
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
