import { A } from '@solidjs/router'
import type { JSX } from 'solid-js'
import GazeLivePreview from '../../ui/GazeLivePreview'

export default function FrameSystem() {
  return (
    <>
      <header class="docs-page-header">
        <p class="docs-page-eyebrow">Concepts</p>
        <h1>Frame system — Spatial UI as design DNA</h1>
        <p class="docs-page-lead">
          creo-ui の layout 哲学。 画面 = <strong>名前付き 3D Frame の連続</strong> として表現する。
          各 Frame は slot 集合と perspective を持ち、 view component は slot に bind される。 Scene
          遷移 = Frame morph で、 view は解体せず spatial 移動。 平面 2D の
          <strong>(x, y, z-index)</strong>
          に対して、 (x, y, z, rotation, depth-of-field) で <strong>情報密度を倍以上</strong>に。
        </p>
      </header>

      <section>
        <h2 class="docs-section-title">何が Frame か</h2>
        <pre class="docs-code">
          <code>{`type Frame = {
  id: string                              // "dashboard" / "reading" / "editor" / ...
  slots: Record<SlotName, SlotPlacement>  // 名前付き slot の集合
  perspective: PerspectiveConfig          // camera 位置 / FOV / depth budget
  gaze?: { x, y }                         // 視線 = perspective-origin (消失点 / horizon)
  transition: TransitionConfig            // 別 Frame への morph (FLIP + z + opacity)
}

type SlotPlacement = {
  x: string | number     // (% / px / vw)
  y: string | number
  z: string | number     // depth (px or token alias)
  rotateX?: number       // deg
  rotateY?: number
  scale?: number
  opacity?: number
}`}</code>
        </pre>
        <p class="docs-page-helper">
          Component は <code>&lt;FrameSlot name="hero"&gt;...&lt;/FrameSlot&gt;</code> 等で slot に
          bind。
          <code>setFrame('reading')</code> で Frame morph trigger → 全 bound component が新 Frame の
          slot 位置に animate。 解体・再 mount せず、 同じ DOM が空間移動するだけ。
        </p>
      </section>

      <Decision number="F-1" title="Frame は名前付き spatial container">
        <h3>Why</h3>
        <p>
          画面遷移を「別 page を mount する」 とすると、 view が解体されて context が切れる (scroll
          position / focus / animation state lost)。 Frame system は{' '}
          <strong>同じ世界の中での視点移動</strong> を メタファとして採用 — view は持続、
          配置だけ変わる。 結果として遷移が <strong>連続性のある体験</strong>に。
        </p>
        <h3>How it shows up</h3>
        <p>
          各 app が複数 Frame を定義 (<code>dashboard / reading / editor / detail</code> 等)、 view
          component は slot に bind。 setFrame で morph、 view は同じ DOM のまま translateZ / rotate
          / scale で空間移動。 Apple visionOS の "spatial computing" の 2D 投影版に近い。
        </p>
      </Decision>

      <Decision number="F-2" title="View binding — slot に component が住む">
        <h3>Why</h3>
        <p>
          Component が「どの Frame の」 「どの slot に住む」 を <strong>宣言的に</strong>
          定義することで、 Frame morph 時の transform は protocol が自動計算。 component author
          は配置を気にせず、 機能だけ書く。 責務分離の極致。
        </p>
        <h3>How it shows up</h3>
        <p>
          <code>
            &lt;FrameSlot name="hero" frames={'{["dashboard", "reading"]}'}&gt;&lt;Card
            /&gt;&lt;/FrameSlot&gt;
          </code>{' '}
          のように 「dashboard と reading frame で hero slot に居る」 と宣言。 Frame 切替時、
          protocol が 各 slot の前後位置を比較して FLIP + z 軸で transform を補間。
        </p>
      </Decision>

      <Decision number="F-3" title="Multi-platform abstract — depth metaphor で表現">
        <h3>Why</h3>
        <p>
          Web は CSS 3D で literal な perspective を持てるが、 TUI (ratatui) / native (SwiftUI /
          iced) では literal 3D 不可。 しかし「奥行き」 という <strong>知覚</strong>は表現可能 — TUI
          は dim/bright で 深度、 SwiftUI は Liquid Glass + shadow、 ratatui は border 強度で
          foreground / background。 Frame system は{' '}
          <strong>「depth metaphor」 として abstract</strong>、 platform は最良の表現を選択。
        </p>
        <h3>How it shows up</h3>
        <p>
          <code>depth.foreground</code> / <code>depth.midground</code> /{' '}
          <code>depth.background</code> の 3 段が 抽象 token。 Web では translateZ + perspective
          で、 TUI では color/style 強度で、 SwiftUI では z-axis + blur で実装。 同じ semantic が
          platform 慣習で render される (原則 5 と同じ仕組み)。
        </p>
      </Decision>

      <Decision number="F-4" title="視線 (Gaze) — perspective-origin は観察者の目">
        <h3>Why</h3>
        <p>
          3D grid が「馴染む」 かどうかは、 grid の座標ではなく{' '}
          <strong>観察者がどこを見ているか</strong> で決まる。 現実の遠近法は{' '}
          <strong>消失点 (vanishing point)</strong> と <strong>水平線 (horizon)</strong>{' '}
          が視線の高さで決まり、 そこに向かって平行線が収束する。 CSS の{' '}
          <code>perspective-origin</code> は まさにこの <strong>「目の位置」</strong>で、 Frame
          system が literal 3D を持つ web では、 これを{' '}
          <strong>ユーザが設定できる視点 parameter</strong> として露出できる。 視点が定まると 3D
          grid は 幾何的な格子ではなく <strong>「空間」 として知覚</strong>される。
        </p>
        <h3>How it shows up</h3>
        <p>
          実装済 (<code>creo-ui-frame</code> v0.1+): <code>Frame.gaze: {'{ x, y }'}</code>{' '}
          で消失点の水平位置 + 水平線の高さを宣言し、 <code>FrameProvider</code> が{' '}
          <code>perspective-origin</code> として root に適用する。 runtime では{' '}
          <code>useFrame().setGaze()</code> で視点を上書きでき、 これが「user が水平線を動かす」
          入口になる (Frame 切替で override は解除)。 下の demo は{' '}
          <strong>その実 runtime を dogfood</strong> — stage を掴むと <code>setGaze</code> が
          呼ばれ、 floor grid と深度カードがその視線に向かって収束し直す。 水平線を目の高さに
          合わせるほど grid が地面として「馴染む」。 platform 抽象としては、 literal 3D 非対応の TUI
          / native では gaze は <strong>深度 metaphor の強調方向</strong> (どの layer を foreground
          に引き出すか) として解釈される。
        </p>
        <pre class="docs-code">
          <code>{`const frame: Frame = {
  id: 'reading',
  slots: { /* ... */ },
  gaze: { x: '50%', y: '42%' },   // 消失点(x) + 水平線の高さ(y)
}

// runtime で視点を user 操作に開く
const { gaze, setGaze } = useFrame()
setGaze({ x: '35%', y: '30%' })   // horizon を上げて見下ろす
setGaze(undefined)                // Frame.gaze に戻す`}</code>
        </pre>
        <GazeLivePreview namespace="creo-ui-docs.gaze-editor" />
        <p class="docs-page-helper">
          <kbd>Ctrl+Shift+E</kbd> (or <kbd>⌘+Shift+E</kbd>) か鉛筆 toggle で Editor Mode ON →
          inspector パネルの slider で 消失点 X / 水平線 Y / perspective を精密調整できる (stage
          ドラッグと同じ gaze を双方向 sync)。{' '}
          <code>perspective-origin: {'{gaze.x}% {gaze.y}%'}</code> — horizon (<code>gaze.y</code>)
          を境に上が sky (奥)、 下が ground。 <code>prefers-reduced-motion</code> では grid の追従
          transition を切る (F-4 も原則 8 の契約下)。
        </p>
      </Decision>

      <section>
        <h2 class="docs-section-title">Editor Mode は Frame system の specialization</h2>
        <p>
          既存の <A href="/concepts/editor-mode">Editor Mode protocol</A> は Frame system の
          <strong> "Editor Frame" 1 instance</strong> として再解釈できる:
        </p>
        <ul class="docs-bullet-list">
          <li>
            <strong>D-2 4 方向 layout</strong> = Editor Frame の 4 slot (<code>top-global</code> /{' '}
            <code>left-past</code> / <code>right-future</code> / <code>bottom-utility</code>)
          </li>
          <li>
            <strong>D-3 2 軸の意味</strong> = Editor Frame の slot 配置が持つ意味的 axes (時系列
            horizontal / 階層 vertical)
          </li>
          <li>
            <strong>D-6 非侵襲性</strong> = Editor Frame と Content Frame が{' '}
            <strong>z 軸で完全分離</strong>
            (Editor Frame は <code>translateZ(z-large)</code> で Content の手前に浮かぶ)
          </li>
          <li>
            <strong>Mode toggle</strong> = Frame 切替の特殊形 (Editor Frame ON/OFF が dual state、
            morph は opacity + translateZ + scale)
          </li>
        </ul>
        <p>
          つまり Frame system が generalize、 Editor Mode は Frame の <strong>Editor scene</strong>{' '}
          instance。 Frame system が ship した暁には Editor Mode は Frame protocol
          の上に再実装される (D-2 〜 D-12 は Editor Frame の slot 定義として残る)。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">VP との関係 — primary consumer</h2>
        <p>
          Vantage Point (VP) は multi-pane app (TUI + WebView 並存)。 各 pane = 独立の view、 pane
          切替 = spatial rearrangement。 これは{' '}
          <strong>Frame system が抽象化したい現象そのもの</strong>。
        </p>
        <ul class="docs-bullet-list">
          <li>
            VP の現状: pane layout は ad hoc (各 scene で hardcode)、 切替 animation なし、
            状態管理は manual
          </li>
          <li>
            Frame system 適用後: VP scenes (<code>terminal-mode</code> / <code>doc-mode</code> /{' '}
            <code>browse-mode</code> 等) を Frame として定義、 pane = view binding、 切替 = Frame
            morph
          </li>
          <li>
            TUI + WebView の混合では、 同 Frame に対して platform-specific render (TUI = depth
            metaphor、 WebView = literal 3D)
          </li>
        </ul>
        <p class="docs-page-helper">
          → VP が Frame system の <strong>最重要 proof point</strong>。 VP で動けば Creo ecosystem
          の他 app (creo-memories DevEditor 等) も追従しやすい。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">情報密度の理屈</h2>
        <p>
          平面 2D は <code>(x, y)</code> + z-index による疑似深度の 3 axis。 Frame system では:
        </p>
        <ul class="docs-bullet-list">
          <li>
            <strong>x, y</strong> — 既存の平面位置
          </li>
          <li>
            <strong>z</strong> — 実深度 (CSS perspective による視差含む)
          </li>
          <li>
            <strong>rotateX / rotateY</strong> — 角度による「向き」 表現
          </li>
          <li>
            <strong>scale</strong> — 大小による「重要度」 表現
          </li>
          <li>
            <strong>depth-of-field (blur)</strong> — focus / unfocus の選択的提示
          </li>
        </ul>
        <p>
          5+ axis を視覚に投影できる → 同じ画面面積で表現できる「相対関係」 が倍以上。 ただし
          trade-off は cognitive load — 過剰な 3D は情報密度を上げず、 視覚 noise になる。 適切な
          restraint が必要。
        </p>
      </section>

      <section>
        <h2 class="docs-section-title">Constraints — 守るべき不変条件</h2>
        <ul class="docs-bullet-list">
          <li>
            <strong>
              <code>prefers-reduced-motion: reduce</code> で全 3D 動きを flat fallback
            </strong>{' '}
            — vestibular issue 配慮、 これは契約 (negotiable ではない)
          </li>
          <li>
            <strong>Mobile / 低性能 device で graceful degradation</strong> — perspective を切り、
            transform を simplified 形に。 60 FPS を割らない
          </li>
          <li>
            <strong>Token SSOT 強制継続</strong> — 3D parameter (perspective / depth scale) も
            hardcode 禁止、
            <code>--depth-*</code> token 経由 (将来追加)
          </li>
          <li>
            <strong>Cross-platform abstract 維持</strong> — TUI / native は depth metaphor で表現、
            literal 3D 非依存
          </li>
          <li>
            <strong>Cognitive load 制限</strong> — 1 画面で active な depth layer は 3 (foreground /
            mid / background) まで、 それ以上は flatten
          </li>
        </ul>
      </section>

      <section>
        <h2 class="docs-section-title">Phase plan</h2>
        <div class="docs-table-scroll">
          <table class="creo-table" data-size="s">
            <thead class="creo-table-head">
              <tr class="creo-table-row">
                <th class="creo-table-cell" scope="col">
                  Phase
                </th>
                <th class="creo-table-cell" scope="col">
                  Scope
                </th>
                <th class="creo-table-cell" scope="col">
                  Deliverable
                </th>
              </tr>
            </thead>
            <tbody class="creo-table-body">
              <tr class="creo-table-row">
                <td class="creo-table-cell">
                  <code>P-0</code>
                </td>
                <td class="creo-table-cell">docs site visual</td>
                <td class="creo-table-cell">
                  perspective root + card translateZ + sidebar depth + reduced-motion guard。 哲学を
                  docs site 自身が dogfood
                </td>
              </tr>
              <tr class="creo-table-row">
                <td class="creo-table-cell">
                  <code>P-1</code>
                </td>
                <td class="creo-table-cell">Concept docs</td>
                <td class="creo-table-cell">
                  この page (FrameSystem) で Frame system の design memo を articulate。 Editor Mode
                  / VP / multi-platform 連結を明記
                </td>
              </tr>
              <tr class="creo-table-row">
                <td class="creo-table-cell">
                  <code>P-1</code>
                </td>
                <td class="creo-table-cell">Token system</td>
                <td class="creo-table-cell">
                  <code>tokens/depth/scale.json</code> で foreground / mid / background の 3 step
                  abstract + perspective / FOV を frame.json に
                </td>
              </tr>
              <tr class="creo-table-row">
                <td class="creo-table-cell">
                  <code>P-2</code>
                </td>
                <td class="creo-table-cell">自作 motion engine</td>
                <td class="creo-table-cell">
                  Web Animations API 直叩き + FLIP + spring + easing token bridge。 ~600-800 LOC、{' '}
                  <code>creo-ui-frame</code> 内同梱。 Motion One が archive 化したため自作必須
                </td>
              </tr>
              <tr class="creo-table-row">
                <td class="creo-table-cell">
                  <code>P-3</code>
                </td>
                <td class="creo-table-cell">Runtime API</td>
                <td class="creo-table-cell">
                  新 package <code>creo-ui-frame</code> で <code>&lt;FrameProvider&gt;</code> +{' '}
                  <code>&lt;FrameSlot&gt;</code> + <code>setFrame()</code>。 自作 motion engine 同梱
                </td>
              </tr>
              <tr class="creo-table-row">
                <td class="creo-table-cell">
                  <code>P-4</code>
                </td>
                <td class="creo-table-cell">VP migration</td>
                <td class="creo-table-cell">
                  VP の pane logic を Frame protocol に refactor。 TUI 側は depth metaphor 実装。
                  Frame system の proof point
                </td>
              </tr>
              <tr class="creo-table-row">
                <td class="creo-table-cell">
                  <code>P-5</code>
                </td>
                <td class="creo-table-cell">Editor Mode 統合</td>
                <td class="creo-table-cell">
                  Editor Mode を Editor Frame として Frame protocol 上に再実装。 D-2 〜 D-12
                  の精神は維持しつつ、 4 方向 layout = Editor Frame の slot 群へ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 class="docs-section-title">関連</h2>
        <ul class="docs-bullet-list">
          <li>
            <A href="/concepts/editor-mode">Editor Mode protocol</A> — Frame system の Editor scene
            specialization
          </li>
          <li>
            <A href="/concepts/layers">Layers</A> — Editor Layer ↔ Content Layer の z 分離 (Frame
            system が一般化)
          </li>
          <li>
            <A href="/concepts/multi-platform">Multi-platform pipeline</A> — depth metaphor も同
            platform parity 経由
          </li>
          <li>
            <A href="/foundations/principles">Principles</A> — 原則 5 (multi-platform parity) と原則
            6 (token SSOT) は Frame system でも継続
          </li>
        </ul>
      </section>
    </>
  )
}

interface DecisionProps {
  number: string
  title: string
  children: JSX.Element
}

function Decision(props: DecisionProps) {
  return (
    <section class="docs-principle">
      <header class="docs-principle-head">
        <span class="docs-principle-number" aria-hidden="true">
          {props.number}
        </span>
        <h2 class="docs-principle-title">{props.title}</h2>
      </header>
      <div class="docs-principle-body">{props.children}</div>
    </section>
  )
}
