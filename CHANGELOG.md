# Changelog

本ファイルは creo-ui の version 別変更履歴を記録する。
package 別 version (web / swift / rust / editor-host) は独立に bump される — 該当 package の `package.json` / `Package.swift` / `Cargo.toml` を SSOT とする。

> **命名について**: 本 project は 2026-07-09 に `creoui` → **`creo-ui`** へ rename した (下記 Unreleased 参照)。**それ以前の version エントリは release 当時の名称 (`creoui` / `Creoui`) を史実として保持**しており、意図的に書き換えていない。

## editor-host v0.8.1 (2026-08-14) — Font size group を Global へ統合

> **editor-host `0.8.1`** のみを release (patch)。web 0.30.0 ほか他 package は据え置き。

- panel の Font size group を Global へ統合 (#156、VP 経由の mako 依頼)。Global accordion = Typography scale → size.xs〜xl → Brand/Surface hue・chroma → layout.gap.sibling の 11 項目。Font size accordion は消滅

## v0.30.0 (2026-08-14) — Editor が調整卓になった: 脱出ハッチ + color ノブ + 永続化

> **web `0.30.0`** / **editor-host `0.8.0`** を release。rust `0.9.0` は generated 値の変化なし (republish 不要)、layout `0.3.0` / icons-web `0.0.1` も src 実変更なしのため据え置き。swift は publish 経路なし。

### editor-host 0.8.0 — 脱出ハッチ / color ノブ / panel 刷新 / localStorage 永続 (#134–#153)

**挙動変更**:

- **調整ノブが localStorage 永続に** (#137, #153): size 梯子と color 系ノブの値が reload / 再訪をまたいで復元される (従来はセッション限り。`typography.scale` は従来から永続)。既定値に戻すと override が外れ、token emit (rem 追従) と theme 切替追従が復活する — 適用は「SSOT 既定値なら removeProperty」の値ベース判定
- **radius 梯子ノブを撤去** (#136): v0.29.0 の SSOT 焼き込みで役目を終えた
- **panel 構成を刷新** (#135, #136, #146): Discovery (ツリー件数 badge 付き) が最上段、以下 GLOBAL / FONT SIZE / SURFACE の accordion。**初期状態は一層目全閉じ**で、開くたびコンパクトから始まる。開閉 state は panel 側で保持し、component 選択やドリルインでは閉じない (#140)

**新機能**:

- **脱出ハッチ** (#134): 選択 component の base rule 宣言を CSSOM から列挙し、ノブに無い property を `.creo-<id>` rule として override 編集 (「まずノブ、無ければハッチ」)。specificity は base rule と同じ後勝ち — !important を使わない正直 cascade。copy-CSS export 付き、セッション限り
- **color ノブ** (#136, #151, #152, #153):
  - GLOBAL: **Brand hue / chroma ×**、**Surface hue / chroma ×** — OKLCH var 族 (brand 8 var / surface 8 var) を相対で一括調整。hue は基準 var との差分適用で族内の相対関係を保ち、l (明度) は触らない
  - SURFACE: 個別 token 8 本 (bg-base 〜 scrim-modal) の絶対値編集 (L/C/H/A slider + ↺)
- **layout.gap.sibling ノブ** (#145): stacked 要素間の既定 gap (0–48px)

**UX**:

- number ノブを 1 ライナー化 — name (ellipsis + tooltip) | slider (50% 固定で縦揃い) | 値 | ↺ (#141, #143, #144)
- **↺ reset** を number / color 共通部品化 — 既定値と違うときだけ現れ、押すと SSOT 既定へ (#141, #153)
- Typography scale は 0.8–1.2 / step 0.01 (#147, #148)、panel 本文の font size +1px (ヘッダ据え置き) (#149)
- 自動発見ノブの range 推定を unit-aware に — rem/em の 1–10 帯は step 0.1 (0.5rem = 8px 飛びを解消) (#150)

### web 0.30.0 — Sidenav component (#142)

- 新 component **`.creo-sidenav`**: group / title (brand rail 付き) / list / link / tag。現在地は router が付ける `aria-current="page"` を CSS が拾う (header nav と同じ作法、独自 active class なし)。knob 5 本 (`--_sidenav__{group-gap,link-pad-y,link-pad-x,link-radius,indicator-width}`、pattern B + density calc)。幅 / sticky / 高さは page layout の管轄で component は持たない
- 既存 component への変更なし — 追加のみで **breaking なし**

### site (参考 — 出荷物ではない)

- Editor の selectionRoot を body 全体へ — header / sidebar / theme switcher も Editor の編集対象に (#139)。sidebar は `.creo-sidenav` の初 consumer へ移行 (#142)
- ヘッダ表記を Creo UI へ、logo mark (◎) 撤去 (#137, #138)
- demo stage: `.containerignore` で build context を配信物だけに (#133)

## v0.29.0 (2026-08-13) — Editor Discovery + 実測 token 改定

> **web `0.29.0`** / **editor-host `0.7.0`** / **rust `0.9.0`** を release。layout `0.3.0` / icons-web `0.0.1` は src 実変更なしのため据え置き。swift は publish 経路なし (SPM git 参照) — 本 promote で新 token 値と `Scale` 相当の契約記述が main に載る。

> **⚠️ 視覚変更を含む**: typography.size と radius の既定値を改定した (下記)。consumer は upgrade するだけで本文サイズと角丸が変わる。

### token 改定 — Editor 実測による新既定 (#130)

owner が Editor Mode の梯子ノブで実ページ・実 font (Gen Interface JP)・実ディスプレイ (MacBook Air) 上で体感調整した値を、そのまま新既定として採用した。「気になる → Editor で指して回す → SSOT に焼く → 3 platform に配る」の一気通貫の初回実走。

| token | 旧 | 新 |
|---|---|---|
| **typography.size** (xs–xl) | 12 / 14 / 16 / 18 / 20 px | **13 / 15 / 17 / 18.5 / 20.5 px** (m=17 は Apple HIG body と一致) |
| **radius** (xs–xl) | 4 / 8 / 15 / 22 / 28 px | **3.5 / 4 / 8 / 17.5 / 21.5 px** (シャープ寄り、card 系の印象が変わる) |

title / body の semantic alias、component の使用箇所は token 参照なので自動追従。`radius.none` / `radius.full`、display / icon scale は**値としては**据え置き。ただし `--typography-display-*` / `--typography-icon-*` の 10 変数は `calc(… * var(--typography-scale, 1))` にラップされる形へ emit が変わっている (`typography.scale` ノブに追従させるため)。**値は不変なので実害は無いが、diff を取ると変化として現れる** (consumer feedback により 2026-08-30 追記)。**migration**: 旧値に依存した見た目を保ちたい consumer は、自 app の `:root` で該当 `--typography-size-*` / `--radius-*` を旧値に上書きする (token 名は不変)。

### editor-host 0.7.0 — Discovery panel と選択の意味論 (#126, #127, #130)

**breaking (default 挙動の変更)**: `discoverComponents` が **default true** — Editor Mode 中に creo-ui component がクリック選択可能になる。切る場合は `discoverComponents: false`。panel は旧 3-scope 一覧を廃し Discovery ツリーへ刷新した。

- **Discovery ツリー + drill-in**: ページの実 DOM から component の instance ツリーを構築し、選ぶとその component のノブが開く。ページ上の要素クリックも同じ selection に載る
- **選択の実体は class、instance はアンカー**: ハイブリッド outline (選択強枠 + 同 class 全 instance に淡枠) で「囲っていないものが変わった」驚きを防ぐ。入れ子は最内 + 祖先 breadcrumb、hover は双方向、Esc 2 段
- **命名規約 `--_<component>__<knob>`** (#127): `<component>` は実在する `.creo-<component>` class そのもの。抽出は split 1 回で、selectorText 解析 (state 疑似 / comma list の罠) が消えた。規約は CI (`check:tweak-vars`) が守る
- **global knobs**: `typography.scale` (1 変数で文字だけ全体伸縮、emit に `calc(<rem> * var(--typography-scale, 1))` を焼き込み、localStorage 永続 — 老眼対応)、Size / Radius scale の梯子ノブ (lazy 書き込み — 触るまで emit を潰さない)
- **`selectionRoot`** (config): Discovery / 選択を content root に限定。chrome (header 等) は選択に食われず操作可能
- site は App root の global provider に一本化 (全ページで Ctrl+Shift+E)

### web 0.29.0 — tweak var の全 component 整備 (#126, #127)

- private tweak var を **55 component / 111 knob** に整備 (従来 14 file のみ)。命名は `--_<component>__<knob>` 規約に統一、略記 6 系統 (`--_eb-*` 等) を class 名へ改名
- **pattern A → B 移行**: base rule 側で `--_x: ...` を宣言していた 11 component (card / stack / grid / table / empty-state / error-boundary / header / tabs / pagination / segmented / select 一部) は `:root` override が届かず Editor から動かせなかった。使用箇所 fallback へ移行 (**見た目は不変**、variant 宣言は維持)
- 注意: `--_*` は private (public API ではない) だが、**旧 var 名を直接参照していた consumer が居れば改名の影響を受ける** (`--_badge-pad-x` → `--_badge__pad-x` 等)

### rust 0.9.0 — 論理 px 契約と `Scale` (#129)

- dimension token は **論理 px** (CSS px / SwiftUI pt と同じ土俵) であることを契約として明文化。wgpu / glyphon 等の生描画では新設の **`Scale`** を掛けて物理 px 化する (`Scale::new(window.scale_factor()).px(tokens::TYPOGRAPHY_SIZE_M)`)。掛け忘れると Retina で見た目が半分になる実害 (ladyland) への根治
- `Scale` に `Default` は意図的に無い — 「黙って 1.0」は掛け忘れ bug の既定化になるため
- generated token 値は上記改定に追従

### infra (出荷物には影響なし)

- ポート採番を台帳 block `13600-13699` へ (#128): dev vite = 13600 (strictPort)、常駐 demo = 13610。旧 5173 / 8080 は retire

## v0.28.0 (2026-08-02) — Outliner (階層リスト)

> **web `0.28.0`** を release。rust `0.8.0` / editor-host `0.6.0` / layout `0.3.0` / icons-web `0.0.1` は据え置き (src 実変更なし)。swift は publish 経路なし。

### Outliner — `List<List<Item>>` の階層リスト (#121)

思いつきを **その場で書き留めて、後から構造を与える** ための capture-first component。アイデア出し / タスク分解 / 議事メモのように「先に構造を決められない」情報に向く。行の追加・インデント・並べ替えは全て keyboard で完結し、編集開始の mode 切替 (ダブルクリック等) を挟まない — 行を叩けばそのまま書ける。

- **CSS-only 層** (`.creo-outliner*`): 1 行 = テキスト + 右端 slot。深さは `--outliner-depth`、`data-variant` で `plain` ↔ `card`、`data-guides` でインデントの縦ガイド線
- **SolidJS primitive** (`CUOutliner`、`@chronista-club/creo-ui/controls`): keyboard grammar (`Enter` / `Tab` / `Shift+Tab` / `↑↓` / `⌥↑⌥↓` / `Backspace` / 折りたたみ) 内蔵、controlled + uncontrolled 両対応
- **木の操作は純関数として別 export** (`indent` / `outdent` / `moveUp` / `insertSiblingAfter` 等)。すべて immutable で、操作が成立しないときは同一参照を返す — 呼び出し側が `next === prev` で「何も起きなかった」を判定できる

設計上の判断 (詳細は [`docs/components/outliner.md`](https://github.com/chronista-club/creo-ui/blob/main/docs/components/outliner.md)):

- **DOM は flat + `role="tree"` + `aria-level`** — 入れ子 `ul` にしないのは ① keyboard の index 計算が壊れにくい ② `aria-level` が flat 構造を正式に想定しているため。代償として折りたたみは CSS 単独では書けず「子孫を描画しない」で表現する
- **row を最初から自立した box として組む** — Item の card 見た目への拡張に備え、plain と card で DOM も flex 構造も共通にした
- outdent は後続の兄弟を連れ出さない / 子を持つ行は `Backspace` で消さない / indent 先が畳まれていたら開く / plain の選択色に brand を使わない

### infra / docs (出荷物には影響なし)

- **Support Tier** を一級コンセプトとして設計 — [`docs/design/support-tiers.md`](https://github.com/chronista-club/creo-ui/blob/main/docs/design/support-tiers.md)。Tier 1 = Web (SolidJS) / Apple / Rust、**Tier 2 = Svelte** (正式サポート、CSS 層 public API を土台にした薄い wrapper を実消費者駆動で提供) の owner 裁定を明文化 (#115〜#117)
- web README に「安定性 (public API)」節を新設 — `components.css` の class / data 属性 / CSS variable が public API であることを正式化 (Tier 2 wrapper が乗る土台)
- **demo stage の常設化** — `http://demo.creo-ui/` で常時アクセス、vite 起動中は同じ名前が開発中の姿を映し、止めれば常駐 demo へ自動 rewire (#113/#114/#118/#119/#120)

## v0.27.1 (2026-07-31) — npm 導線根治 + rust 0.8.0 (Rgb alpha) + swift theme/typography

> **web `0.27.1`** / **rust `0.8.0`** を release。editor-host `0.6.0` / layout `0.3.0` / icons-web `0.0.1` は src 実変更なしのため据え置き (README の install 行修正は次の実変更出荷に同乗)。swift は publish 経路なし (SPM git/path 参照) — 本 promote で CreoTheme / `.creoText()` が main に載る。

### web 0.27.1 — npm install 導線の 404 根治 (#109, #110)

npm の package 実名は v0.24.4 から `@chronista-club/creo-ui` (scoped) だが、README / site の install 手順とリンクが unscoped `creo-ui` のまま残り、手順通りに `npm install creo-ui` すると 404 になっていた (「外部の第一印象で死ぬ経路」の npm 版)。

- README (= npm ページに表示される) の install コマンドを scoped に統一、「unscoped は 404」の注意書きを追加 (#109)
- site の Footer (全ページ共通) / Getting Started の npm リンクも scoped URL に (#110)
- stale な JS 定数例を実 export 名に修正 (`ColorBrandPrimary` → `ColorThemesMintDarkBrandPrimary`、`SpacingMd` → `SpacingM`)
- **src / dist の実変更なし** — 出荷物の差分は README のみ (patch)

### rust 0.8.0 — **BREAKING**: `Rgb` に alpha field (#108)

swift #11 (alpha 落ち、0.27.0 cycle の #105 で根治) と同根の bug が rust に残っていた: `Rgb { r, g, b }` が alpha を持てず、scrim (`oklch(0 0 0 / 0.4)`) が**不透明の純黒**で emit されていた。

- **`Rgb` に `a: u8` (straight alpha) を追加** — struct literal 構築 (`Rgb { r, g, b }`) はコンパイルエラーになる。`Rgb::new(r, g, b)` (a=255 を補完) は従来通り動き、alpha 付き token (scrim ×2 / shadow ×2 / focus halo の 5 個) のみ `Rgb::with_alpha(r, g, b, a)` で emit
- **egui interop `to_color32` の const fn 保証を撤回** — `from_rgba_unmultiplied` 化で translucent が正しく届く (egui の premultiply 変換が const でないため)。palette helper も同様に non-const
- ratatui interop は `Color::Rgb` が alpha を持てないため**意図的に drop** (doc 明記)
- `as_rgba_array()` / `alpha_f32()` helper 追加。`VERSION` は `env!("CARGO_PKG_VERSION")` 追従に (手書き "0.3.0" と Cargo.toml の乖離根治)
- **migration**: struct literal は `a` を追加するか `Rgb::new` / `Rgb::with_alpha` に置換。const 文脈の `to_color32` / palette 呼び出しは実行時初期化に変更

### swift — CreoTheme 注入 + .creoText() (SPM、version tag なし) (#105, #107)

ladyland consumer feedback (2026-07-30、10 項) への対応 2 連:

- **#105「今すぐ」群**: alpha 落ち根治 (scrim 不透明 #11) / component enum の命名統一 `.sm/.md/.lg` → `.s/.m/.l` (**BREAKING**) / motion token を `TimeInterval` (秒) に型変換 (#8)
- **#107「次」群**: `CreoTheme` struct (8 theme preset) + `@Environment(\.creoTheme)` 注入 + `.creoTheme(_ family:)` 外観モード追従 (#4) / `CreoTextStyle` + `.creoText()` typography modifier — Dynamic Type (`@ScaledMetric`) と line-height 換算を一元化 (#6)。既存 9 component は theme 経由に移行済み (default `.mintDark` で見た目不変)

### infra

- release flow 固定化 — 設計文書 + `/release` skill + `release-tag.yml` (main push で auto tag + publish dispatch)。本 release がこの新 flow の初回実走 (#104)
- 値のテスト 2 層 — token pipeline invariants (tokens → 3 platform 出力の値検査) + docs drift checker、CI 常設 (#106)

## v0.27.0 (2026-07-29) — Surface veil + density 実効化 + press 語彙 + Select

> **web `0.27.0`** を release。editor-host `0.6.0` / layout `0.3.0` は本 cycle 中に nightly から個別 release 済み。rust / swift は token 不変更のため据え置き (tag なし)。

component layer の brush-up 一式 (#93〜#101)。「宣言されているのに効いていない機構」を実測で洗い出して根治する回 — veil / density / press / contrast はすべて同じ物語の章。

### Surface veil — 「面の上の一段」の相対化 (#93)

striped row / filled input / track / hover のような「今いる面より一段」の差分表現が絶対 token (`--color-surface-bg-subtle`) で書かれており、面自体が bg-subtle の場所 (card / panel) では段差が 0 になり消えていた。CSS には親の背景色を読む手段が無いので絶対値では原理的に解けない — `text-primary` の theme 反転を利用した translucent veil を導入:

- `--surface-veil-1` (4%) / `--surface-veil-2` (8%) を `_elevation.css` に追加 (#96 で `veil-3` 12% 追加)
- 29 箇所を veil 化。ΔL が全 8 theme で揃う (従来は dark 0.030 / light 0.020 と不揃い)

### density axis の実効化 (#94) — 宣言だけだった機構が動く

`data-density="comfortable|default|compact|cozy"` は base rule に calc で入っていたが、**size variant が素の padding で上書きするため size 指定した瞬間に無効化**されていた (fallback の 1 が効いてエラーにもならず、実測で発覚)。size variant を「変数差し替えのみ」に制限し、padding / min-height の宣言 (= density calc の場所) を 1 箇所に集約する **B pattern** で 26 component に展開。`<body data-density="compact">` で dashboard 密度の一括制御が実際に動くように。

### Press 語彙 (#95)

`:active` を持つのが button / card だけだった。press 語彙を 2 層で定義 (`_elevation.css` に SSOT):

- raised control (button / card) = 沈み込み translateY(1px) — 既存
- flat target (menu-item / tab / pagination / summary / close 等 10 component) = **veil ladder をもう一段** (hover veil-1 → active veil-2) + press duration 80ms の fast-in / soft-out

### Secondary / Outline の分業 (#96) — **視覚変更**

secondary と outline が「同じ border + 不可視の fill 差」でほぼ同一に見えていた。各 variant が識別子を 1 つだけ持つ形に:

- **secondary = fill の variant** (border 無しの veil-2 tonal pill、hover veil-3)
- **outline = border の variant** (fill 無し、hover で border が brand に灯る)
- ghost の press を veil-2 に (press 語彙整合)、toggle (aria-pressed) の text を `--text-brand-readable` に (light theme で 1.5:1 まで崩れていた brand 直挿しの是正)

### Semantic fill 上の contrast 根治 (#97)

timeline / stepper marker の文字色 `bg-base` 固定は light theme で最低 1.4:1 まで崩壊していた (luminance-core lane の取り残し)。`--on-fill-success` / `--on-fill-warning` / `--on-fill-info` を追加し全 8 theme で AA (実測 5.91:1 以上)。

### Stepper connector の grid 化 (#99)

horizontal の connector (absolute で item 全幅を貫く) が label の文字に被っていた。connector を grid 第 3 列の実要素に変更 — 線は label の後ろの余白だけを走り、size variant でも中心がズレない。**item の内部 grid が 2 列 → 3 列になったため、内部構造に依存した custom CSS を持つ consumer は要確認** (markup は不変)。

### Select component 新規 (#101)

native `<select>` の styled wrapper。`.creo-select` (wrapper + ::after arrow) + `.creo-select-input`。bordered / filled × s/m/l × fit/full + error state。dropdown は browser native (listbox の再発明をしない)。spec: [docs/components/select.md](./docs/components/select.md)。

### table の行 header 定義 (#98)

`.creo-table-cell` に `text-align: left` を明示し、tbody th (行 header) を weight-medium に — 行 header を使う consumer で browser default (center + bold) が出ていたのを是正。

### site (npm 成果物外)

- showcase drift 一掃 (#94): stepper の `data-state` → `data-status` (状態色が全部死んでいた)、accordion の構造是正、旧 API コードサンプル更新
- 独自 table CSS 6 種 54 block を `.creo-table` に全面置換 (#98)、header を `.creo-header` に (#100)、theme switcher を `.creo-select` に (#101) — **site の見た目の知識を component へ集約する dogfooding 三部作**

## v0.26.0 (2026-07-15) — Button pill + Editor Live Preview 全展開 + Frame gaze

> **web `0.26.0`** / **frame `0.2.0`** を release。web は breaking (button shape、下記)。editor-host / rust / swift は API 不変 (rust/swift generated の radius.s は description コメントのみ変更、値は 8px 不変)。

公式 site の Live Preview / Editor Mode 体験を拡充し、Frame system に「視線 (gaze)」を runtime 実装、Lab を topic ページに再編した一連の作業 (#81)。

### Button を pill 化 — **consumer に breaking** (web)

`.creo-btn` の `border-radius` を size 別固定 (`radius.xs/s/m`) から `--_btn-radius` (default `radius.full`) に統一 → **どの size でも高さの半分に自動 clamp される pill 形状**。

- padding も `--_btn-pad-{x,y}` の private tweak var 経由に (Editor Mode から live 調整可能)
- `radius.s` の description を「buttons, inputs」→「inputs, small surfaces」に更新 (値 8px は不変)
- **migration**: 角丸を戻したい consumer は `--_btn-radius: <px>` を指定して override 可能

### Frame gaze (視線 = perspective-origin) — F-4 (frame `0.2.0`)

`Frame.gaze: { x, y }` で消失点の水平位置 + 水平線の高さを宣言、`FrameProvider` が `perspective-origin` として適用。`useFrame().setGaze()` で runtime 上書き (user が水平線を動かす入口)、`setFrame` で override 解除。`formatGaze` / `DEFAULT_GAZE` + test 3 ケース追加 (frame 全 59 test green)。

### site — Live Preview 全展開 / gaze demo / Lab 分割

- **34 Components ページ**に Editor Mode playground (bind + selection) を展開、文字 toggle を Phosphor 鉛筆アイコンの `EditorModeToggle` に統一
- Button に padding X/Y (component scope) と corner radius の Live Preview slider
- Frame system に **F-4「視線 (gaze)」** の概念 + `GazeLivePreview` (ドラッグ + Editor パネル双方向 sync)
- **Lab を Playground 1 枚から `EditorLab` / `FrameLab` / `VisionLab` の 3 topic に分割** (`/playground` は `/lab/editor` へ redirect)
- demo stage の Caddyfile を `/creo-ui/` prefix 配信に、`site:up` に `--force-recreate` 追加

## v0.25.0 (2026-07-12) — Deep Luminance + root font 一本化 + `Creo*` alias 撤去

> **web `0.25.0`** / **editor-host `0.5.3`** / **rust `0.7.0`** を同時 release。web / rust は breaking (下記)。

「理論的には正しいが並べるとかっこよくない」という owner 課題への回答。VP performer 3 lane 並列編成 (conductor 統括) で 4 PR を nightly に集約 (2026-07-11〜12)。

### Deep Luminance — depth/light の視覚言語 (#70 / #69 / #71)

Linear / Vercel 級の dark 洗練を基調に、**dark theme は「影」ではなく「面の明度 ladder + border の光 + 抑制された brand glow」で立体感を作る**。light theme は per-theme shadow tint による従来型 shadow が主役。

- **`_elevation.css` 新設** (視覚言語の SSOT): elevation ladder 0-3 (flat / resting / raised / overlay) の rubric、border-light (面上端の 1px 光)、brand glow 2 チャンネル (button=`filter: drop-shadow` で focus ring policy と非干渉 / 面=box-shadow)、`--fill-brand` (chroma×1.3 + l×0.95) + `--on-fill-brand` (明度で黒白自動選択)、`--text-brand-readable` (brand×text-primary 50/50 mix)
- **全 recipe は既存 theme 変数から color-mix / relative color syntax で導出** — theme SSOT (generated JSON) 不変のまま 8 theme に自動追従
- core controls (#70: button / card / input / form-controls / form-field / segmented / tabs) → 残り全 component (#71: overlay=elevation3、menu=2、resting=1、nav/selection の focal fill 化)
- **a11y 是正**: 旧実装は solid fill の文字色に `--color-surface-bg-base` を固定 → mint-light の primary が **1.46:1** の重大 fail だった。auto on-color で全 8 theme min 4.82:1 (全出荷 recipe を color-utils.js で実測検証)。既知の残 1 件: contrast-light の danger 4.39:1 (AA-large、token 側調整が将来候補)
- **site showcase 刷新** (#69): /components を実物 live specimen card 15 個に (素の `.creo-*` 標本 = CSS 改修に自動追従)、Home hero に live surface、sidebar / header の視覚階層

### root font 一本化 (#72) — **consumer に breaking**

font 指定を **`--typography-family-sans` = `'Gen Interface JP', 'UDEV Gothic 35NF', sans-serif` の単一 root stack に集約**。mode 別 family 切替 (app / read / editor / terminal) と用途別 variant (mono 系 / display / icon) の機構を全廃 — **family token 13 個を削除**。

- UDEV Gothic 35NF が等幅数字 + Nerd icon glyph (~10k) を root stack 内で供給 (専用 icon family 不要)
- UA stylesheet が monospace を強制する `pre` / `code` / `kbd` / `samp` と font 非継承の form control のみ `var(--typography-family-sans)` を明示 (新規 font 名は増えない)
- **migration**: `--typography-family-{mono,app,display,icon,…}` の参照が残っても `var()` invalid → root font へ自然 degrade (壊れない)。次回 upgrade 時に `-sans` へ置換を推奨 (VP の `family-app` 等)
- Swift / Rust generated も再生成済み (`typographyFamily*` / `TYPOGRAPHY_FAMILY_*` の削除 = API surface の breaking)

### `Creo*` shell alias 撤去 — **consumer に breaking** (v0.24.2 で予約したとおり 0.25.0 で実施)

`shells` の後方互換 alias re-export (`CreoEdgeShell` / `CreoFacetGrid` / `CreoPageShell` / `CreoRail`) を撤去。**migration**: `Creo{X}` → `CU{X}` の機械的 rename (0.23.0 canonical)。breaking を font 一本化と同一 release に束ね、consumer の migration を 1 回で済ませる owner 判断。

### site 公開 — https://doc.anycreative.tech/creo-ui/

- Cloudflare Workers (assets-only) 配信 + hub router (`chronista-club/anycreative-doc`) 配下の path 配信へ移行。vite/router base `/creo-ui/`
- release cut (main への push) 毎の CD (`deploy-site.yml`、要 `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets)

### dx

- `CREO_SITE_HTTP=1` で apps/site dev server を http fallback 起動 (browser automation / screenshot QA 用。default は従来どおり https)

## Unreleased — `creoui` → `creo-ui` へ全面 rename

「繋げた `creoui` は可読性が低い」という owner 判断により、identifier を **`creo-ui`** に統一 (2026-05 に `creo-ui` → `creoui` へ寄せた [v0.6 系の決定](#) を巻き戻す形)。言語制約に合わせゾーン別に変換:

- **npm 公開名**: web は `creoui` → **`@chronista-club/creo-ui`**（org scope）、editor-host は `@chronista-club/creoui-editor-host` → **`@chronista-club/creo-ui-editor-host`**。**unscoped `creo-ui` は取得不可**だった — npm の類似名ガードが既存 `creoui` に似すぎと判定して E403、かつ `creoui@0.24.2` は 72h 超で unpublish できずガードが恒久化するため。よって scope 化で回避（scoped は namespace 分離でガード対象外）。`creoui-frame` / `vision` / `md-view` / `icons-web` は元々 npm 未 publish（今回対象外）。**consumer に breaking**（scoped import path + 依存名の変更）。
- **Swift**: module / target / type を `Creoui` → **`CreoUI`** (ハイフンは Swift identifier 不可)。`CreouiTokens` → `CreoUITokens`、`Sources/Creoui/` → `Sources/CreoUI/`。
- **Rust**: crate `creoui` → **`creo-ui`** (package 名)、コード identifier は `creo_ui` (`use creo_ui::tokens`)。
- **CSS class**: `.creoui-icon` → `.creo-ui-icon` (consumer markup の breaking)。
- **transforms / docs / CI**: `creoui` 表記を全て `creo-ui` に統一。generated (Tokens.swift / tokens.rs) は再生成。
- 外部 `creo-memories/packages/creoui` 参照は別 project の実体のため**変更しない**。

### 実施状況 (2026-07-11)

- ✅ GitHub repo `chronista-club/creoui` → **`creo-ui`** に rename 済み（旧 URL は redirect）。
- ✅ npm publish: **`@chronista-club/creo-ui@0.24.4`**（web、`0.24.2` を bump — `web-v0.24.3` は unscoped で E403 のため scope 化して `web-v0.24.4` で成功） / **`@chronista-club/creo-ui-editor-host@0.5.2`**。
- ✅ 旧 `creoui` を `npm deprecate`（"renamed to 'creo-ui'"）。
- ⏳ 旧 `@chronista-club/creoui-editor-host` の deprecate は未実施。
- ⏳ 他 consumer repo（creo-memories / vantage-point-portal 等）の import を `@chronista-club/creo-ui` へ載せ替えは別途。

consumer の import 例: `import '@chronista-club/creo-ui/tokens.css'` / `import { CUButton } from '@chronista-club/creo-ui/controls'`。

## v0.24.2 (2026-06-18) — `CUButton` に `loading` + `as`(polymorphic) を追加

creo-memories follow-up handoff (`mem_1Cc9EthpMESukrjb6phG1k`) への対応。creo-web の `@creo/ui` Button → CUButton **全面移行 (109 callsite)** に必要な残り 2 prop の parity。

### 追加 (後方互換)

- **`loading?: boolean`** — 処理中状態。`data-loading="true"` + `aria-busy="true"`、native `<button>` は `disabled` 強制 / polymorphic・link は `aria-disabled`。`button.css` が label を隠して spinner (`::after`、progress.css の `creoSpinnerRotate` 流用、新規依存なし) を中央に被せる。spinner 色は variant 毎の `--_btn-fg` (primary/danger=inverse、それ以外=text-primary)。
- **`as?: ValidComponent`** — 描画 component を差し替える polymorphic prop。`as={A}` (solid-router) で **client-side routing** する link button に。描画先は `as` > `href` > `<button>` の優先で解決 (CUButton を `Show` 分岐から `Dynamic` ベースに作り替え)。

`CUButtonOptions` に `loading`、`CUButtonAttrs` に `data-loading` / `aria-busy` を追加。既存 consumer 無改修。回帰テストに loading の attr マッピングを追加。

> version は additive のため patch (0.24.2)。`0.25.0` は `Creo*` shell alias 撤去 (breaking) に予約済みのため踏まない。

## v0.24.1 (2026-06-18) — `CUButton` に `danger` / `outline` variant を追加

creo-memories follow-up handoff (`mem_1Cc9Bqc2QKyqsU4uRjV54a`) への対応。creo-web が `@creo/ui` Button → CUButton へ**全面移行**するため、不足していた variant を補完。

### 追加 (後方互換)

- **`danger`** — destructive action 用 (削除等)。`semantic.error` トークンで solid fill (`--color-semantic-error` / `-hover` / `-active`、 8 theme 全対応)。削除ボタンの移行 blocker を解消。
- **`outline`** — 透明背景 + border の bordered variant (`secondary` の subtle fill 無し版)。owner decision で `secondary` への寄せ (mapping) ではなく**独立 variant として追加**。

`CUButtonVariant` = `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'` (3 → 5)。`button.css` に各 variant の hover / active / aria-pressed(toggle) ルールを追加。既存 consumer は無改修。回帰テストも 5 variant passthrough を pin。

> version は additive のため patch (0.24.1)。`0.25.0` は `Creo*` shell alias 撤去 (breaking) のマイルストーンに予約済みのため踏まない。

## v0.24.0 (2026-06-16) — `CUButton` interactive primitive を新設 (`creoui/controls`)

interactive component primitive 用の新 export subpath **`creoui/controls`** を切り、第一号として **`CUButton`** を追加。既存の CSS-only component (`components/button.css` = `.creo-btn`) を type-safe に wrap した薄い SolidJS primitive。

**motivation**: creo-memories から「published `creoui` の Button が variant 等の動的 prop を再描画に反映しない」handoff を受領。原因は consumer 側 component の「`const buttonClass = cn(...)` 即時 1 回計算」アンチパターン。creoui を component lib の本拠地とし、`shells/` (layout grammar) と分離した `controls/` (interactive control) に bug-free な reference 実装を置く方針に拡張。

### 追加

- `creoui/controls` export subpath (interactive primitive 用、今後 Input / Select 等も集約)
- `CUButton` — `variant` (primary / secondary / ghost) / `size` (s / m / l) / `pressed` (aria-pressed toggle) / `disabled` / `href` (→ `<a>` polymorphic) を type-safe に提供
- `cuButtonAttrs` — props → DOM 属性の純粋関数 (reactivity の核、回帰テスト付き)

### reactivity 設計 (handoff への回答)

`createMemo(() => cuButtonAttrs(local))` で **描画毎に props から属性を導出**。component body で class を eager に 1 回計算しないため、`variant` / `size` / `pressed` を signal で変えても class / data 属性が追従する。さらに variant / size は `cn` 文字列結合ではなく **data 属性 binding** なので、元 bug の構造を持たない。

### consumer

`creo-memories` は published `creoui` を npm 経由で consume するため、本 version の publish 後に `@creo/ui` の Button.tsx を `creoui/controls` の `CUButton` へ移行可能。

## v0.23.0 (2026-05-28) — shells primitive を `CU*` prefix に rename (ecosystem vocabulary 統一)

`creoui/shells` の primitive component prefix を `Creo*` → **`CU*`** に rename (owner decision)。**後方互換 alias を 0.23.x / 0.24.x で同梱**、 0.25.0 で撤去。

**motivation (owner)**: ergonomics 優先で `CU` (= creoui-shells primitive) / `CR` (= project-local) の 2 prefix を全 product 共通 vocabulary にし、 import 1 行で「primitive vs project-local」を即判別できる clarity を ecosystem の SSOT にする。 brand "Creo Memories" / "Creo ID" は touch せず keep — component prefix と brand surface を意味的に分離する articulate。

### rename 一覧 (creoui repo に現存する 4 primitive + Props)

| 旧 | 新 |
|---|---|
| `CreoPageShell` | `CUPageShell` |
| `CreoFacetGrid` | `CUFacetGrid` |
| `CreoEdgeShell` | `CUEdgeShell` |
| `CreoRail` | `CURail` |

(他の `CU*` 名 — `CUTimeline` / `CULogo` / `CUCanvas` / `CUMain` / `CUTopbar` / `CUStatusbar` / `CURSidebar` / `CULSidebar` / `CUCorner` / `CUOrientation` / `CULayeredSurface` / `CUEmptyState` / `CUStyle` / `CUDemo` 等 — は consumer 側で実装中の primitive 向け **forward-looking 命名規約**。creoui repo には未実装。)

### 後方互換 (breaking change cost を消す)

`shells/index.ts` で **alias re-export を同梱**:

```ts
export { CUPageShell } from './CUPageShell'              // canonical (v0.23.0+)
export { CUPageShell as CreoPageShell } from './CUPageShell'  // alias (0.23.x / 0.24.x keep, 0.25.0 撤去)
```

既存 consumer (`import { CreoPageShell } from 'creoui/shells'`) は **無改修で動く**。0.22.x には npm deprecate tag を貼り migration 期間を可視化、0.25.0 で alias 撤去。

### 設計 doc

`docs/design/principal-layout.md` §4 の命名節を「proposed」→「確定 (v0.23.0)」に更新。`identity.md` / `typography-system.md` の primitive 表記も CU* に追従。

## v0.22.1 (2026-05-25) — doc: typography-system 追加 (npm artifact 不変)

`docs/design/typography-system.md` を追加 ([#54](https://github.com/chronista-club/creoui/pull/54))。「Mizolet (local font) を principal に」という要望の reframe を受け、**consumer が任意の local font を CSS custom property cascade で自由に override する path** を first-class supported path として articulate する design doc。

- 14 family token の構造 (mode-based 4 + editor variant 2 + 用途別 8)
- TY-1〜TY-5 の設計判断 (cascade override = first-class / `@font-face` は creoui に置かない / prepend pattern 推奨 / 4 scope / consumer-side `@font-face` の規律)
- 4 override 具体例 + 6 件の「やってはいけない」

> ⚠️ **npm artifact 不変**: doc のみの release で `packages/web/dist` の出力は v0.22.0 と完全同一。本 release は doc landing の time marker。consumer から本 doc を確実に参照したい場合に `creoui@0.22.1` を指定する用途。

## v0.22.0 (2026-05-20) — web、Principal Layout P-3 Z 軸 layer add-on

Principal Layout primitive に **Z 軸 layer add-on** を追加 ([#50](https://github.com/chronista-club/creoui/pull/50))。creo-memories doc 29 §4 / doc 30 §6.6 の多層 Atlas (認知境界の積層) を、creoui/shells の **opt-in add-on** として実装。

PL-6 通り primitive の core surface には出していない — `<CreoEdgeShell>` / `<CreoRail>` は本 add-on を一切参照せず、Z 軸を使う consumer (creo-web) だけが import する。

| 追加 export (`creoui/shells`) | 役割 |
|---|---|
| `createLayerStore()` | `LayerId` (`atlasId \| undefined`、undefined = ルート層) を SSOT に持つ Z 位置 store |
| `createLayerUrlSync(store, { readParam, writeParam })` | URL `?layer` の双方向同期。router-agnostic — param accessor を consumer 供給 |
| `parseLayerParam` / `layerToParam` / `layerEqualsParam` | pure logic。無限ループ収束を `layerEqualsParam` ガードで保証 |

additive のみ — 既存 export (`<CreoEdgeShell>` / `<CreoRail>` / `railRegistry` / `regions` / tokens / components.css) は 100% backward compat。

## v0.21.0 (2026-05-19) — web、Principal Layout primitive (Edge Ring + Rail)

`creoui/shells` に **Principal Layout** primitive を追加 ([#48](https://github.com/chronista-club/creoui/pull/48))。creo-memories doc 29/30 の 3x3 Frame / Rail UX を共有 primitive 化したもの (fleetstage handoff が起点)。設計は [docs/design/principal-layout.md](./docs/design/principal-layout.md)。

additive のみ — 既存 export (`CreoPageShell` / `CreoFacetGrid` / tokens / components.css) は 100% backward compat。

| 追加 export (`creoui/shells`) | 役割 |
|---|---|
| `<CreoEdgeShell>` | 4 edge + center の Edge Ring (2D 基盤フレーム) |
| `<CreoRail>` | Rail column + peek (collapsed⇄expanded)、router-agnostic |
| `railRegistry` | `RailDef` + pure logic (`selectRailId` / `railsByOrder` / `railById`) |
| `regions` | 位置語彙 type (`EdgeRegion` / `CornerRegion` / `Region`) |

Rail registry は consumer 供給 (特定 App の rail を hardcode しない)。Rail 選択 = route が唯一の SSOT。

## creoui rename (2026-05-17) — web v0.20.1 / editor-host v0.5.1

デザインシステムの正式名を `creoui` に統一 ([#41](https://github.com/chronista-club/creoui/pull/41))。`Creo UI` / `creo-ui` / `CreoUI` の散在を廃し、`creoui` を naming SSOT とする。

npm package を rename publish (機能変更なし、patch bump):

| 旧 | 新 |
|---|---|
| `creo-ui-web@0.20.0` | `creoui@0.20.1` |
| `creo-ui-editor-host@0.5.0` | `@chronista-club/creoui-editor-host@0.5.1` |

editor-host が scoped なのは npm の類似名ガード回避（unscoped `creoui-editor-host` は既存 `creo-ui-editor-host` に似すぎて E403）。旧 package は `npm deprecate` で新名へ誘導。Swift module `CreoUI` → `Creoui`、Rust crate `creo-ui` → `creoui`、CSS `creo-icon` → `creoui-icon`、GitHub repo も `creoui` に統一。

## v0.20.0 (2026-05-10) — Phase 2-3 完走 (web、 a11y baseline + 4 family identity polish + opt-in articulate)

Purple Haze design system benchmark report の **Top 1-7 finding を Phase 2-3 全 7 完走** で解消。 v0.18-v0.19 の token / attribute layer 統一 (final) を土台に、 component / foundation layer の **a11y baseline + identity polish + opt-in articulate** を additive で追加。 BREAKING なし、 既存 component / token / attribute は 100% backward compat。

並行で発見された **critical CSS parser bug** (6 日間 silent regression、 全 token resolve 失敗) も同 release で fix。

### Phase 2-3 完走 sequence

| # | PR | finding score | 内容 |
|---|---|---|---|
| 1/7 | #33 focus-ring | ★★★★★ | a11y baseline + Sophisticated layered (WCAG AA + AAA × 8 theme) |
| 2/7 | #34 motion mapping | ★★★★★ | base (5×5) → 11 use-case × 4 axis SSOT alias、 18 component sync |
| 3/7 | #35 state polish | ★★★★ | Skeleton / EmptyState に 4 family identity 追加、 ErrorBoundary 新設 |
| 4/7 | #36 concentric corner | (foundations docs only) | Apple HIG / visionOS 26 spec articulate |
| 5/7 | #37 density mode | ★★★ | 4 mode と直交する第 5 axis (comfortable / default / compact / cozy) |
| 6/7 | #38 iconography | ★★ | 2 system articulate (creo-icon CSS + Iconify SVG) + 4 axis docs |
| 7/7 | #39 kinetic-typography | ★★ | display 限定 dynamic effects (read / editor mode 侵食防止) |

### 追加 — focus-ring (Phase 2-3 #1, ★★★★★)

WCAG 2.4.7 (AA) + 2.4.11 (AAA) を 8 theme 全部で達成。 Apple HIG visionOS 26 concentric layer + Linear "気付かれない polish" hybrid:

- outer 2px solid + inner 4px halo (offset 2px) を `:focus-visible` policy で 19 interactive element に articulate
- `tokens/focus-ring.json` (4 scaffold token: `width` / `offset` / `halo-width` / `style`)
- 8 theme で family hue × luminance 調整 (mint / sora / contrast / oldschool × dark / light)、 全 theme で AAA contrast 確保
- 10 component CSS sweep (hardcode focus rule 削除 → policy 委譲)
- reduced-motion 環境でも ring 自体は表示 (a11y 最優先)、 transition のみ無効化

### 追加 — motion mapping (Phase 2-3 #2, ★★★★★)

base token (5 duration × 5 easing) の主観的組み合わせから **11 use-case × 4 axis SSOT mapping** に articulate。 Material 3 distance-based motion を Creo brand (mint + spring) で reinterpret:

- `tokens/motion/mapping.json` 22 token (use-case × duration|easing alias、 base への参照のみで base を変えれば全 mapping 自動追従)
- 11 use-case: hover / press / toggle / focus-ring / dropdown / modal-enter / modal-exit / page-transition / frame-morph / skeleton-shimmer / progress-indeterminate
- 18 component CSS sync (hardcode duration / easing 削除 → mapping bind)
- 例外 articulate: skeleton / progress の cycle 1.4s は keyframes 専用 (mapping lazy 480ms より長く end-less perception 表現)、 easing のみ mapping 参照

### 追加 — state polish (Phase 2-3 #3, ★★★★)

Skeleton / EmptyState を「neutral surface のみ」 から「4 family identity を whisper で articulate」 に shift。 ErrorBoundary を新 primitive として追加 (loading / empty / error の 3 set 完成):

- **Skeleton**: shimmer peak (50%) に brand-primary-subtle を 60% mix、 4 family theme で identity 表現
- **EmptyState**: subtle radial gradient (brand-primary-subtle 30%) + brand-secondary icon (mint=violet / sora=cyan / contrast=magenta / oldschool=amber) + radius-l で modal-tier surface
- **ErrorBoundary** (新): semantic-error-subtle (70%) + brand-primary-subtle (30%) dual layer、 s/m/l 3 size、 `role="alert"` + `aria-live="assertive"`、 retry / reload / report CTA articulate

### 追加 — density mode (Phase 2-3 #5, ★★★)

4 mode (Typography axis) と直交する **第 5 axis** で同 mode 内の「呼吸量」 を切替可能に:

- `tokens/density.json` 4 density × 3 scale (padding / gap / min-height):
  - comfortable: 1.25 / 1.25 / 1.1 (reading / hero / onboarding)
  - default: 1 / 1 / 1 (base、 backward compat)
  - compact: 0.85 / 0.85 / 0.95 (data table / dashboard、 tap >= 44 維持)
  - cozy: 0.7 / 0.7 / 0.85 (terminal / log viewer、 max info-density)
- `_density.css` で `data-density="..."` を ancestor articulate → CSS variable cascade で内部 component に伝播
- button / input / card に `calc(base * scale)` で適用 (default scale 1 で attribute 無し時は backward compat 完全)

### 追加 — iconography 2 system (Phase 2-3 #6, ★★)

「inline か hero か」 judgement framework articulate:

- **`creo-icon` CSS class 新設**: Nerd Font glyph (~10k)、 mono color、 inline / dense (5 size × 7 semantic variant、 `font-feature-settings` で ligature 無効化 → emoji 色維持)
- **`<Icon>` (creo-ui-icons-web)**: Iconify SVG 9 set、 multi-color、 hero / illustration (既存)
- 2 system 並走で「inline は creo-icon、 hero は Icon」 の judgement basis を articulate

### 追加 — kinetic typography (Phase 2-3 #7, ★★)

2026 dynamic typography trend を **display 限定** で articulate、 read / editor mode の typography stability は厳格保護 (long-form reading の subjective fatigue 防止):

- `_kinetic.css` 3 utility (opt-in):
  - `.creo-kinetic-hero` — `:hover` で letter-spacing / font-weight / slnt 変動 (Variable font、 fallback 対応)
  - `.creo-kinetic-gradient` — brand primary → secondary linear-gradient + `background-clip: text` (static)
  - `.creo-kinetic-reveal` — page load の opacity + translateY animation、 `data-delay` (1/2/3) で staggered
- transition は motion-mapping (frame-morph / modal-enter) bind、 hardcode 禁止
- prefers-reduced-motion で hero / reveal は base 固定 (gradient 維持)
- avoid path articulate: read / editor / terminal mode 侵食禁止、 app mode は controlled (button hover 等限定)

### 追加 — Foundations docs

新 page 6 件 articulate (4 axis × n operational definition + 5 rubric category + Live preview):

- `/foundations/focus-ring`
- `/foundations/motion`
- `/foundations/concentric-corner` (Apple HIG / visionOS 26 spec、 docs only)
- `/foundations/density`
- `/foundations/iconography`
- `/foundations/kinetic-typography`

これで **14 foundations page 揃い** (Principles + Color + Typography + Theming + Spacing + Radius + Shadow + Focus Ring + Motion + Concentric Corner + Density + Iconography + Kinetic Typography)、 Phase 2-3 完走で foundation layer の articulate 完成。

### Bug fix — Chrome CSS parser 閾値回避 (#27)

v0.18 で `:root` block prop 数が 169 に到達、 Chrome の CSS parser が **150+ で block 全体を silently drop** する閾値で **6 日間 silent regression** が進行 (token resolve 全失敗、 全要素 browser default 16px / padding 0 / margin 0 で表示)。

- binary search で localized (line 11-95 / 96-179 を split inject すると両方 parse OK、 169 一括は fail = chrome parser 自体が drop)
- Style Dictionary `transforms/config.web.js` を `commonByCategory` (Map<category, lines[]>) で token.path[0] (= category) ごとに group、 `:root` を **category 別 12 block** に split emit:
  - color / depth / editor-mode / frame / layout / margin / motion / radius / shadow / spacing: 2-22 props
  - typography (最大): 46 props
  - default theme (mint-dark): ~42 props
- 副次 fix: docs.css の stale token 名 sweep (size-base / size-2xl / size-3xl / spacing-2xl) + semantic alias (`title-page` / `body-default` / `layout-gap-section`) 採用 (原則 03 dogfood)
- **Living rule articulate**: 1 `:root` block あたり 50 props 以下 (`mem_1CatH9CfXPpG3Pogx2nZjM` Atlas: Creo UI)

### Stability commitment

v0.18 で「5 tier convention 完全統一の最終 release」 と articulate した stability は **継続**。 v0.20 は全 additive、 既存 token / component / attribute は touch なし。 Phase 2-3 完走で foundation layer の articulate framework が揃ったため、 以降は **新 capability の articulate 追加** または **identity polish 深化** が主軸。

### 関連

- Purple Haze report agentId: `abb25a554fccfedce`
- Phase 2-3 sequence: PR #33 → #34 → #35 → #36 → #37 → #38 → #39 (全 7 完走)
- Foundations docs: 14 page 揃い

---

## v0.19.0 (2026-05-09) — Shells primitives 抽出 (web、 additive、 retroactive entry)

Creo Memories Layered Surface Phase 1 (CREO-160) で確立した layout pattern を **`creo-ui-web/shells` subpath** に primitive 化。 Phase B (CREO-84) の最初の shells release。 Backward compat 完全、 既存 token / component / attribute touch なし。

> **note**: 本 entry は v0.19.0 publish 時に書き漏れていたため v0.20.0 release 時に retroactive で追加。 npm 上の v0.19.0 とは内容一致。

### 追加 — shells subpath exports

新 subpath: `creo-ui-web/shells` (TypeScript / SolidJS):

| primitive | 役割 | bundle |
|---|---|---|
| `<CreoFacetGrid>` | 6 facet narrow form の grid layout (intrinsic top + extrinsic main + sub) | gzip 0.62 kB (JS) |
| `<CreoPageShell>` | max-width 920px wrapper + entrance animation (page fade in) | gzip 0.39 kB (CSS) |

合計 **1 KB 未満** で entrance animation + responsive grid を提供。

### Tree-shaking

`exports` field の subpath 構造で `creo-ui-web/shells` だけ import すれば components.css / tokens.css は引き込まれない。 single library + subpath の design で:

- consumer は `^0.19.0` 1 entry で全 capability access
- modular import で kitchen sink 化を回避
- internal は `src/shells/` `src/components/` で organization 維持

### Consumer

Creo Memories `apps/creo-web` で初 dogfood (creo-memories PR #391)、 net **-22 行** (重複 CSS が primitive へ吸収、 `.memoryPage` + `@keyframes pageFadeIn` + 920px / 480px 重複の 4 ブロック削除)。

### 関連

- Layered Surface Phase 1 vision: `mem_1Cak5rxTFWvLNxjSRiQ1Ak` (Creo Memories Atlas)
- Phase B PR-1 / PR-2 / PR-3 sequence (creo-ui PR #25 #26 + creo-memories PR #391)
- Linear: CREO-84 Phase B (In Progress)

---

## v0.18.0 (2026-05-07) — Component attribute も 5 tier 完全統一 (web、 BREAKING、 attribute layer final)

v0.17.0 で **token layer** の 5 tier convention 完全統一を達成、 v0.18.0 で **component attribute layer** も同 convention に揃え、 ecosystem 全層 (token + CSS var + JS const + Swift identifier + Rust const + HTML attribute) で convention drift が完全解消した状態に到達。

### BREAKING (web 0.18.0)

17 component の HTML attribute を sm/md/lg → s/m/l に rename:

| component | attribute | v0.17.0 → | v0.18.0 |
|---|---|---|---|
| Button / Input / Dialog / Popover / Tabs / Table / Pagination / Skeleton / Progress / Spinner | `data-size` | `sm/md/lg` | `s/m/l` |
| Drawer / Avatar | `data-size` | `sm/md/lg/xl` | `s/m/l/xl` |
| Badge / Breadcrumbs / Stepper / Timeline | `data-size` | `sm/md` | `s/m` |
| Card | `data-padding` | `sm/md/lg` | `s/m/l` |
| Header | `data-elevation` | `sm/md` | `s/m` (`none` 据置) |

`data-variant` / `data-placement` / `data-shape` / `data-cols` / `data-state` 等 5 tier 命名以外の attribute は touch なし。

### Migration

```diff
- <button class="creo-btn" data-size="md">              → <button class="creo-btn" data-size="m">
- <article class="creo-card" data-padding="lg">         → <article class="creo-card" data-padding="l">
- <header class="creo-header" data-elevation="sm">      → <header class="creo-header" data-elevation="s">
```

bulk sd pattern + 完全 table は [`docs/migration/v0.14-to-v0.18.md`](docs/migration/v0.14-to-v0.18.md) 参照。

### token-shim.css extend (legacy CSS variable alias 完備)

v0.18 で `packages/web/dist/token-shim.css` の legacy alias を extend、 v0.16-v0.17 で rename した token (margin / radius / shadow / typography.size / typography.display) も `--margin-md` → `--margin-m` 等の CSS variable alias を網羅。 consumer は `import 'creo-ui-web/token-shim.css'` で **CSS variable 層は段階移行** 可能。 ただし **HTML attribute は shim で吸収不可**、 markup 書換が必要。

### Stability commitment

v0.18 が **5 tier convention 完全統一 (token + attribute) の最終 release**。 「sm/md/lg」 由来の breaking rename は **これ以上発生しない予定**。 以降の breaking change は新 capability 追加時のみ。

---

## v0.17.0 (2026-05-06) — 5 tier convention 完全統一 (web、 BREAKING、 token layer final)

v0.16.0 で部分統一 (spacing / container / grid / icon を `xs/s/m/l/xl`)、 残 token (margin / radius / shadow / typography.size / typography.display) は `xs/sm/md/lg/xl` で violation 残存していたのを v0.17.0 で **完全統一**。 これで Creo UI の全 dimension scale token が `xs/s/m/l/xl` (5 tier) で揃う。

### BREAKING (web 0.17.0)

| token | v0.16.0 → | v0.17.0 |
|---|---|---|
| `--margin-{sm,md,lg}` | (4 tier 違反) | `--margin-{s,m,l}` |
| `--radius-{sm,md,lg}` (+ `none/full`) | (4 tier 違反) | `--radius-{s,m,l}` (+ `none/full`) |
| `--shadow-{sm,md,lg}` (+ `none`) | (4 tier 違反) | `--shadow-{s,m,l}` (+ `none`) |
| `--typography-size-{sm,md,lg}` | (4 tier 違反) | `--typography-size-{s,m,l}` |
| `--typography-display-{sm,md,lg}` | (4 tier 違反) | `--typography-display-{s,m,l}` |

### Migration

```css
/* before (v0.16.0) — DO NOT USE, removed */
margin: var(--margin-md);
border-radius: var(--radius-lg);
box-shadow: var(--shadow-sm);
font-size: var(--typography-size-md);

/* after (v0.17.0) */
margin: var(--margin-m);
border-radius: var(--radius-l);
box-shadow: var(--shadow-s);
font-size: var(--typography-size-m);
```

JS:

```ts
// before (v0.16.0) — removed
import { MarginMd, RadiusLg, ShadowSm, TypographySizeMd } from 'creo-ui-web/tokens.js'

// after (v0.17.0)
import { MarginM, RadiusL, ShadowS, TypographySizeM } from 'creo-ui-web/tokens.js'
```

### Notes (web 0.17.0)
- 値 (= dimension の物理値) は据置、 名前のみ変更。
- `none` / `full` (radius / shadow) と `xs` / `xl` 4 corner は touch なし、 v0.16.0 と意味的に一致。
- ecosystem 全層 (token JSON + CSS components + dogfood docs site + Swift / Rust generated + creo-ui-editor-host jsdoc/test) を 1 commit で sync 完了。 Container 等 Round 1 で先行 rename 済の token は touch なし。

### 後始末
- `examples/docs/src/pages/Foundations/{Spacing,Principles}.tsx` で v0.16 暫定の「margin は historical に sm/md/lg のまま、 後で 5 tier 統一予定」 注記を **削除** (= 統一完了で historical state 解消)。

---

## v0.6.0 (2026-05-06) — 5 tier 完全統一 (rust + swift、 BREAKING)

web v0.17.0 と sync。 Rust const + Swift identifier 両方が rename:

```rust
// before — removed
creo_ui::MARGIN_MD
creo_ui::RADIUS_LG
creo_ui::SHADOW_SM
creo_ui::TYPOGRAPHY_SIZE_MD

// after
creo_ui::MARGIN_M
creo_ui::RADIUS_L
creo_ui::SHADOW_S
creo_ui::TYPOGRAPHY_SIZE_M
```

```swift
// before — removed
CreoUITokens.marginMd
CreoUITokens.radiusLg
Color.shadowSm

// after
CreoUITokens.marginM
CreoUITokens.radiusL
Color.shadowS
```

v0.5.0 (rust) は publish 直後本 session で本問題発覚、 production consumer ゼロ。 v0.6.0 が crates.io / SwiftPM の最初の 5 tier 完全統一 release。

---

## v0.16.0 (2026-05-06) — 5 tier sizing convention 統一 (web、 BREAKING、 partial)

### BREAKING (web 0.16.0)

v0.15.0 で追加した container / grid / icon token + data-size attribute が **Tailwind 流 sm/md/lg/xl の 4 段階** で書かれていたが、 commit `98a5804` (`refactor(spacing): rename sm/md/lg → s/m/l (5 tier 統一)`) で確立された **既存 spacing convention `xs/s/m/l/xl` (5 段階)** に違反していた (PR #24 Round 1 の認識ミス)。

v0.16.0 で **token name + dogfood の data-size attribute 両層** を 5 tier convention に揃える:

#### Token rename + 値拡張

| token | v0.15.0 | v0.16.0 |
|---|---|---|
| `--layout-container-*` | `sm/md/lg/xl` (4 値) | `xs/s/m/l/xl` (5 値、 xs=480 追加) |
| `--layout-grid-col-min-*` | `sm/md/lg` (3 値) | `xs/s/m/l/xl` (5 値、 xs=120 + l=280 + xl=320 追加) |
| `--typography-icon-*` | `md/lg/xl` (3 値) | `xs/s/m/l/xl` (5 値、 xs=16 + s=24 追加) |

#### Migration (consumer side)

```css
/* before (v0.15.0) — DO NOT USE, removed */
max-width: var(--layout-container-md);
font-size: var(--typography-icon-lg);

/* after (v0.16.0) */
max-width: var(--layout-container-m);
font-size: var(--typography-icon-l);
```

```html
<!-- before -->
<div class="creo-container" data-size="md">
<div class="creo-grid" data-cols="auto-md">
<div class="creo-empty-state" data-size="lg">

<!-- after -->
<div class="creo-container" data-size="m">
<div class="creo-grid" data-cols="auto-m">
<div class="creo-empty-state" data-size="l">
```

実 consumer は v0.15.0 install しないまま v0.16.0 直行を推奨 (v0.15.0 は publish 直後 30 分で本問題発覚、 実 production consumer ゼロ)。

### Notes (web 0.16.0)
- `data-padding="s"` / `"l"` は元から convention 準拠で touch なし。 `data-padding="m"` は default 値で attribute 不要。
- empty-state の `data-size` attribute も `s/m/l` (3 段階) に rename。 button / input 等他 component の `data-size` (sm/md/lg) は **別 axis** で本 release 範囲外 (将来別 PR で 5 tier 統一する場合は consumer-breaking change として明示)。
- Swift / Rust generated にも 5 tier rename + 値拡張が伝播。

---

## v0.5.0 (2026-05-06) — New tokens additive (rust + swift)

5 新 token (web v0.16.0 の 5 tier rename と sync):
- `COLOR_SURFACE_SCRIM` / `COLOR_SURFACE_SCRIM_MODAL`
- `LAYOUT_CONTAINER_{XS,S,M,L,XL}` (5 tier、 v0.4.0 の sm/md/lg/xl 4 tier から rename + xs 追加)
- `LAYOUT_GRID_COL_MIN_{XS,S,M,L,XL}` (5 tier、 v0.4.0 の 3 tier から拡張)
- `TYPOGRAPHY_ICON_{XS,S,M,L,XL}` (5 tier、 v0.4.0 の 3 tier から拡張)

const 名 BREAKING (Rust / Swift consumer の `LAYOUT_CONTAINER_SM` 等は無くなる、 `_S` に rename 必要)。 v0.4.0 は publish 直後 (30 分以内) で実 consumer ゼロ、 v0.5.0 直行推奨。

OKLCH alpha (0.4 / 0.5) は依然 opaque RGB に変換 (Phase 3 で alpha 対応検討)。

---

## v0.15.0 (2026-05-06) — A11y reduced-motion full coverage + 5 new tokens (web)

### Added (web 0.15.0)
- **Surface scrim tokens** (modal / drawer backdrop の semantic split):
  - `--color-surface-scrim` (40% black) — drawer / side sheet
  - `--color-surface-scrim-modal` (50% black) — dialog (中央 modal、 強い注意)
- **Layout container tokens** (`--layout-container-{sm,md,lg,xl}` = 640/768/1024/1280px) — page-level max-width SSOT
- **Layout grid tokens** (`--layout-grid-col-min-{sm,md,lg}` = 160/220/320px) — auto-fit grid minmax
- **Typography icon tokens** (`--typography-icon-{md,lg,xl}` = 40/64/96px) — empty-state / illustration icon size

### Changed (web 0.15.0)
- **A11y `prefers-reduced-motion: reduce` guard を 14 全 component に完全適用** — dialog / drawer / tooltip / skeleton (元から or Round 3) + button / card / breadcrumbs / pagination / form-controls / input / header / menu / stepper / segmented / tabs / table (本 PR で追加)。 WCAG 2.1 SC 2.3.3 (Animation from Interactions) + SC 2.3.1 準拠。 spatial transform (switch thumb slide / button press / table sort indicator 等) も全停止。
- `container.css` の `data-size="full"` を `100vw` → `100%` に修正 (scrollbar gutter で水平 scroll する bug fix)。
- `dialog.css::backdrop` の `rgba(0, 0, 0, 0.5)` を `var(--color-surface-scrim-modal)` に置換 (Token SSOT 原則 6 violation の解消)。
- `drawer.css::backdrop` の `rgba(0, 0, 0, 0.4)` を `var(--color-surface-scrim)` に置換。

### Notes (web 0.15.0)
- 全 token additive、 既存 var 名変更なし。 consumer は単純 upgrade で 5 新 token + 14 component の reduced-motion 対応を取得。
- Swift / Rust generated にも新 token が伝播 (creo-ui-swift / creo-ui Rust crate も同 PR で bump)。

---

## v0.5.0 (2026-05-06) — Public type exports + DEV-gated console (editor-host)

### Added (editor-host 0.5.0)
- Public type re-exports (consumer が config / host を annotate 可能に):
  - `EditorHostConfig` — `<EditorHostProvider>` の config prop 型
  - `EditorShortcut` — `config.shortcut` の型 (`{ ctrl?, shift?, alt?, meta?, key }`)
  - `EditorHost` — `useEditorHost()` 戻り値
  - `EditorHostMcpApi` — `host.mcp` の AI agent 向け subset
  - `EditorField` / `EditorFieldType` / `EditorFieldConstraints` — field 宣言用

### Changed (editor-host 0.5.0、 behavior change — consumer 確認必要)
- **`config.exposeConsole` の default を `import.meta.env.DEV` に変更** (CLAUDE.md EH-6 規定への準拠)。 これまで production build でも `window.creoEditor` が expose されていたが、 production では default `false`、 dev (Vite) では default `true`。 production で意図的に expose したい consumer は明示的に `config={{ exposeConsole: true }}` を渡す。
- `morphFrame()` (frame package、 別 bump 0.1.1) の cancel 挙動 contract 変更も併せて参照。

### Notes (editor-host 0.5.0)
- `provider.tsx` の DEV gating は `Boolean(import.meta.env?.DEV)` で defensive cast、 Vite 以外の consumer 環境でも `undefined → false` で **安全 fail (production 扱い)** する。
- Vite consumer は `vite/client` types を tsconfig に含めると completion が効く。

---

## v0.1.1 (2026-05-06) — morphFrame cancel graceful skip + JSDoc (frame)

### Fixed (frame 0.1.1)
- **`morphFrame()` が cancel された animation で全体 throw しない** — 内部実装を `Promise.all` から `Promise.allSettled` に変更。 1 個の `animation.cancel()` (B-γ で in-flight setFrame 上書き / Provider unmount race 等) で全体 reject していた挙動を、 cancel された animation のみ skip し完走 animation のみ返す挙動に修正。 caller は try/catch なしで `await morphFrame(...)` 可能。

### Documented (frame 0.1.1)
- `morph.ts` JSDoc に **Cancel / unmount 時の挙動 contract** を明記 (cancel された animation は graceful skip、 fulfilled animation のみ結果に含む)。
- `spring.ts` JSDoc に過減衰近似の精度限界を明記 (damping ≥ 1 で physically-correct な hyperbolic 解と分岐していない件、 視覚的影響最小だが将来の精度向上 path として明示)。

### Test (frame 0.1.1)
- `morph.test.ts` に cancel / rejection graceful skip test 2 件追加 (single cancel / mixed cancel + fulfilled)。

---

## v0.4.0 (2026-05-06) — New tokens additive (rust + swift)

### Added (rust 0.4.0 / swift 0.4.0)
- 5 新 token (web v0.15.0 の token 追加と sync):
  - `COLOR_SURFACE_SCRIM` / `COLOR_SURFACE_SCRIM_MODAL`
  - `LAYOUT_CONTAINER_{SM,MD,LG,XL}`
  - `LAYOUT_GRID_COL_MIN_{SM,MD,LG}`
  - `TYPOGRAPHY_ICON_{MD,LG,XL}`
- Swift: 同等の `Color.colorSurfaceScrim` 等 + `CreoUITokens.layoutContainerMd` 等の CGFloat extension。

### Notes (rust 0.4.0 / swift 0.4.0)
- OKLCH alpha (0.4 / 0.5) は Swift / Rust の現 custom format で **opaque RGB に変換** される (alpha drop)。 Phase 3 で alpha 対応検討、 現状は限界として CHANGELOG に明記。
- Web は OKLCH literal で emit、 modern browser が直接解釈。

---

## v0.14.0 (2026-04-26) — Mode-based Typography Family

### Added (web)
- **Mode-based typography family tokens** (6 keys):
  - `--typography-family-app` — App UI chrome (sidebar / button / dialog / tab)。JetBrainsMono Nerd Font Mono + PlemolJP fallback。
  - `--typography-family-read` — 読み専用表示 (memory view / chat history / canvas markdown)。PlemolJP 主軸、CJK 完全等幅統一。
  - `--typography-family-editor` (default) — textarea / Markdown editor / chat input。iA Writer Duo Nerd Font Mono の Duospace。
  - `--typography-family-editor-mono` — 純粋 mono 派 (iA Writer Mono)。
  - `--typography-family-editor-quattro` — semi-proportional 派 (iA Writer Quattro、長文散文)。
  - `--typography-family-terminal` — xterm.js 用 (app と同じ stack だが意味的に分離)。
- 同等の Swift token: `Color.typographyFamilyApp` 等 — `packages/swift/Sources/CreoUI/Generated/Tokens.swift`
- 同等の Rust token: `TYPOGRAPHY_FAMILY_APP` 等 — `packages/rust/src/generated/tokens.rs`

### Notes
- 既存の `sans / mono / mono-{legible,retro,corporate,display} / display / icon` token は **back compat で残置**。consumer は段階的に mode-based に移行可。
- フォント WOFF2 bundle は本 version では **同梱しない** (Phase F2 で別 PR)。当面は consumer (VP 等) 側で system install or 個別 bundle が必要。
- ライセンス: 採用 font は全て **OFL 1.1** (JetBrains Mono Nerd Font / iA Writer Mono/Duo/Quattro / PlemolJP) — 将来 bundle 時は `THIRD_PARTY_NOTICES.md` で表記予定。

### 設計起点
- 「書く時は writer 思想 (iA Writer)、読む時は和文重視 (PlemolJP)、UI は dev tool 感 (JetBrainsMono)」を font swap で UX に乗せる。
- VP (vantage-point) の AI native dev environment コンセプトに合わせ、monospace UI で「IDE / terminal で work する場」感を最大化。

### Phase 計画
- **F1 (本 PR)**: token 追加 + version bump 0.14.0 + CHANGELOG (token-only)
- **F2**: `packages/web/dist/fonts/` に WOFF2 bundle + `@font-face` CSS + LICENSE 通知
- **F3**: iA Writer Mono / Quattro 素 OFL 追加 (editor catalog option)
- **F4**: `packages/editor-host/` で mode 切替 runtime UI
- **F5**: VP 側 (vantage-point installer) で creo-ui v0.14+ + WOFF2 同梱
