# Layout Engine — creo-ui Attention Field + Structure Protocol

**Status**: 設計 doc **v3**（2026-07-22、発想出し 2 ラウンド + 全採否確定。次 = LE-P0 実装プラン）
**Owners**: creo-ui（protocol schema + SolidJS reference 実装）、consumer apps（**VP が最初で最難の consumer**）
**Scope**: pane 配置の protocol。**attention 連続場**（サイズ・遠近・明暗・可視の唯一の真実源）+
**構造**（軸交代と所属のみ）+ **scrub 遷移**（`interpolate(A, B, t)`）+ **settle log**（履歴・永続）+
**AI 共著**（MCP bridge + hitl/auto policy）+ **物理コントローラ投影**。
[frame-system.md](./frame-system.md)（3D morph）の置き換えではなく、creo-ui に無かった層（分割）の新設。
frame は本 protocol の遷移実行系（time driver / FLIP）として optional 統合される
**Related**: [frame-system.md](./frame-system.md), [principal-layout.md](./principal-layout.md),
[editor-mode.md](./editor-mode.md), VP `docs/design/49-gui-layout-engine.md`（VP 側要件 R1-R6）,
VP `docs/design/44-world-one-process.md`（タブ=注視）/ `46-lane-pane-model.md` / `47-internal-consistency.md` /
`48-editor-mode-loop.md`（調整ループ = 本 protocol の開発道具）

---

## 1. Overview (Why)

空間配置系は repo を跨いで 3 兄弟が居り、本物の「分割」は誰も持っていない（VP doc 49 §2）:
VP `frame-engine.ts`（Scene = transform snapshot、motion なし）/ VP `pane-shell.ts`（flex row tiling、
motion なし）/ creo-ui `creo-ui-frame`（FLIP morph、分割なし）。3 つは 1 本の pipeline
（authoring → resolve → 遷移）の別の層の部分実装だった。

**LayoutEngine = 3 層を貫く 1 protocol** として新設する。所有モデルは Editor Mode（D-11）の反復:
**creo-ui = protocol owner + reference 実装（SolidJS）/ VP = 最初で最難の consumer**。

v1 叩き台（離散状態）→ mako レビューで **連続場 core** に v2 改稿 → 発想出し第 2 ラウンド
（polish 10 点）の採否確定で本 v3。経緯の要点は §15 Status log。

## 2. 中核 — attention 連続場（LE-3）

pane ごとの **attention ∈ [0,1] のスカラー場 1 本**が、サイズ・遠近・明暗・可視の**唯一の真実源**。
離散状態は protocol に存在せず、全て場の射影・導出になる:

| 旧概念（v1 / VP 実装の離散状態） | 連続場での姿 | mixer 語彙 |
|---|---|---|
| `weights`（幅の重み） | 場そのもの（兄弟集合内で正規化 → 面積） | fader |
| `minimized` / `hidden` | **attention = 0 = 非表示** | mute |
| `maximized` | attention 1.0 独占 | — |
| 「1 枚に倒す」 | 独占への gesture（un-solo で last settle に復帰） | solo |
| `focused` | **protocol は持たない**（LE-20）。argmax = 主役（最大面積）の意味のみ | — |
| 遠近・明暗（frame F-3 depth） | 場の射影（platform が depth metaphor で表現） | — |

### 0 = 非表示（規則は 2 つだけ）

```
1. resolve は attention = 0 の pane を正規化から除く
2. gesture は場を全零にする変更を拒否する（最後の 1 枚 guard）
```

閾値・退避ゾーンは持たない — **0 だけが特別、あとは純粋に比例**。呼び戻し表現（chip / picker /
ノブ位置）は consumer の表現判断で protocol は規定しない。

### 場の二重読み — raw と share（LE-19 と対）

格納形は **raw**（自由な非負値）、表示・操作形は **share**（正規化後の取り分）。
ノブ・リサイズ等の入力は **share を直接指定**し（touched は取り分固定、untouched は余りを比例配分 —
VCA と同型）、engine が raw を逆算する。「1 本上げると他が目に見えて下がる」が定義から出る。

### 知覚テーパー

attention → 面積の写像に **taper 曲線を投影パラメータとして 1 個**持つ（音量フェーダーが
log taper であるのと同じ理由）。曲線は token 化して Editor Mode の knob で回し、**dogfood で決める**
（仕様で当てない）。

### 旧 invariant の再導出

v1 が contract test で「守る」としていた不変条件は、連続場では大半が**定義から出る**:

| v1 invariant（VP 実戦由来） | v3 での根拠 |
|---|---|
| 最後の 1 枚は畳ませない | 場の総和 > 0（全零 guard） |
| minimize しても並びから抜かない | 非表示は場の値であり、**構造の所属は不変** — 復帰位置は定義から保存 |
| restore は focus も移す | 復帰 gesture は attention を引き上げる（dominance は面積に従う） |
| focus 移動は端で wrap | dominance 移動は 2D cyclic（横 = 列間 / 縦 = 列内、gesture 規約） |
| 未登録 pane は hidden | 場に無い = 外（2×2 の第 4 象限） |
| apply はべき等 | 継承 — resolved から DOM を作り直せる |

## 3. 構造 — 軸交代と所属のみ（LE-4 / LE-5 / LE-18）

構造は**サイズ情報を一切持たない**。決めるのは「軸の交代」（主軸 = 水平の列並び、副軸 = 列内の
縦積み、交代は 2 回で終わり）と「所属」（どの pane がどの列に居るか）だけ。
各レベルの **arity は無制限** — 数は場が動的に決める（VP doc 46「並べたい"種類"と"何枚"かは
別の問い」の layout 版）。縦置きモニタは将来「主軸 transpose」1 穴。

### 状態空間の 2×2

| | attention > 0 | attention = 0 |
|---|---|---|
| **構造に所属** | tiled（列 / 段） | 非表示（所属保持 = 復帰位置あり） |
| **非所属** | **floating**（tiled の上に浮く） | 完全に外（存在しない） |

新しいフィールドゼロで tiled / 非表示 / floating / 外 の 4 状態が出る。

### 記法

```
ec | cv/pp ~ board      |  = 列の区切り（軸の交代）
                        /  = 列内の縦の並び
                        ~  = floating（構造非所属で場に居る pane の明示）
                        数字は書かない — サイズは場の領分
```

- 極小のトポロジー直列化。preset / MCP 提案 / token はこの 1 行 + attention record で運ぶ
- `parse` / `format` は**往復テストで固定**。`|` `/` `~` は pane id に使用禁止
- 意味論の目安（規範ではない）: 横 = 別の対象を並べる、縦 = 同じ領域の 2 面（editor-mode D-3 と共鳴）

### floating（LE-18）

- floating = 構造非所属 × attention > 0。tiled の**正規化に参加しない**（面積を奪わず、覆う）
- **サイズ = attention の射影** — コーナードラッグのリサイズは attention への書き込み**そのもの**
  （knob と同じ操作。SSOT を破らない）
- **位置 = ephemeral な座標 1 個**（既定 = 中央）。移動 gesture で変更できるが、
  **Scene / settle log / token に直列化しない**（永続不要、mako 2026-07-22）
- 複数 float の重なり順 = attention 順（argmax が最前面）
- pop-out / pop-in = 構造編集の gesture（列から抜く / 列へ戻す）

### 入場規則（新 pane）

**入場 = tiled 直入り**: 既定で末尾に新規列として dock、attention 既定 = 可視 pane の平均。
consumer は列・値を上書き可。float 化は popOut でいつでもできる —
「現れる → 浮く → dock」の 1 step 増を嫌い、float 入場案は**不採用**（mako 2026-07-22）。

## 4. resolve — normalize の再帰適用（LE-6 / LE-9）

resolve は「**兄弟集合内で場を正規化する**」1 つの純関数の再帰適用。分割数は演算に現れない:

1. 列の attention = 列内 pane の**集約**（初版 = **max**: 列の幅はその列で一番見たいものが決める。OQ-1）
2. row 内で列 attention を正規化 → 幅。列内で pane attention を正規化 → 高さ（taper は写像時に適用）
3. attention = 0 は集合から除外。列の全 pane が 0 なら列ごと消える — 全レベル一様
4. 署名は **`resolve(layout)` の純形**（viewport 引数なし。content negotiation 延期に伴い用途消滅 —
   復帰時に引数ごと戻す）

### 量子化は投影の縁（LE-9）

protocol は端から端まで**連続**。量子化は各 platform の投影の縁でやる — TUI = 文字セル、Web = px、
MIDI = 7bit CC、snap（`equalize` 等）= gesture 層の作法。
番人判定: **「粗い量子化で投影しても意味が壊れない機能だけを core に入れる」**。
連続場・構造・scrub は通る。Gaze / perspective は通らない → frame 側の optional 層。

## 5. 遷移 — scrub（LE-7）

遷移の核は **`interpolate(resolvedA, resolvedB, t)` の純関数**。時間は protocol の外:

```
interpolate(A, B, t)   … 唯一の遷移 primitive（純 calculation）
        ↑ t を与えるのは driver（protocol 外）:
          - time driver : spring / duration が t を進める（従来のアニメーション相当）
          - hand driver : fader / gesture / scroll が t を保持する（scrub）
          - jump driver : t を即 1 に（prefers-reduced-motion は driver 選択に落ちる）
```

- 純関数なので t の全域で snapshot テスト可能
- 端点に居ない pane は所属位置（float は自位置）で 0 収束へ補間 — 消える動きも現れる動きも同じ規則
- creo-ui-frame の `morphFrame` は「t を外から与えられる形」に開く（LE-P3）。FLIP / spring /
  reduced-motion の実装資産は time driver になる。**core は creo-ui-frame を import しない**

### 一時状態の統一 — 戻り先は常に last settle

solo の un-solo、Touch の release、スクラブ途中の手放しは全て「一時的な逸脱と復帰」の同型:

```
逸脱中は settle log に書かない ／ 復帰 = last settle entry の再 apply
スクラブ手放し = 近い端点へ spring（t < 0.5 → A、以上 → B）で settle 状態に必ず着地
```

solo 専用の退避 state も Touch 専用の記憶も持たない。

## 6. Scene（LE-14）

Scene = `(structure, attention)` の**名前付き immutable snapshot** = 注視の表現（VP doc 44）=
**scrub の端点**。runtime の調整は current Layout の場に対して行い、preset を汚さない。

**適用は total recall**: Scene に未記載の pane は 0（非表示）。Scene =「このように注視せよ」の
全称宣言であり、適用前の形へは settle log で必ず戻れる（undo が total の危うさを消す）。
mixer の Recall Safe（適用除外フラグ）は離散状態の再導入になるため将来穴。

## 7. 履歴と永続 — settle log（LE-17）

```
1. settle 時に append: { layout, at, author }
   （settle = gesture release / Scene apply / AI apply。連続の knob stream は記録しない）
2. entry の layout 型は Scene と同一 — 履歴 = 無名 Scene の列。「戻る」 = applyScene(entry)
3. author ∈ { human, ai, scene } — auto モードの監査証跡を兼ねる
```

- **永続 = log の末尾**: session 復元 = per-scope log の最後の entry を apply。専用の永続機構ゼロ、
  クラッシュ復帰もタダで付く（旧 OQ「Layout の永続」はこれで消滅）
- 保存場所・保持期間は consumer 判断（LE-11 と同じ規律）
- **蒸留は engine に実装しない**: 「よく戻る形」の検出は CC が log を読んで propose（LE-15 の経路）。
  構造の一致は記法の文字列比較、場の近さは距離 1 つ — engine は事実だけ、解釈は AI

## 8. AI 共著 — MCP bridge と apply policy（LE-15 / LE-16）

### LE-15: AI access

Editor Mode D-10 の反復。`layout_scenes / get / set / propose` を MCP に出す
（VP は doc 48 Phase 2 の `window.vpEditorHost.mcp` 経路の兄弟として実装）。
提案は記法 + 場で運ぶ:

```
propose: { structure: "ec | cv/pp ~ board", attention: {...}, reason: "レビュー中なので diff を広く" }
```

- 提案 Scene は **t で「半分だけ覗ける」**（scrub との合成 — 承認行為そのものがスクラブになる）
- 蒸留提案（§7）も同経路: 「この形、今週 5 回戻ってます。名前つけますか？」

### LE-16: apply policy = DAW automation modes

誰が引き金を引くかは consumer 側の **per-scope policy**。語彙は DAW から借りる:

| mode | 意味 |
|---|---|
| Off | AI 提案を受けない |
| **Write**（hitl、既定） | AI は propose まで。適用は人の手か t フェーダー |
| **Read**（auto） | propose が届いたら time driver が t を 1 へ運ぶ（プレゼン/デモ） |
| **Touch** | auto 中でもコントロールに触れた瞬間、人間が奪取。離すと AI へ滑らかに復帰 |

- **Touch は機材の機能ではなく driver 調停の protocol 概念**: pane 境界の mouse-down・キーボード操作も
  「触れる」に含む。調停の粒度は **per-pane**（1 本触っても残りの morph は続く）
- release 後の復帰は last settle へ（§5 の統一機構）。復帰時間（return time）も token / knob にできる
- doc 44「注視の主権は user」は、auto モードでも touch-override として保存される

## 9. 物理コントローラ — 場の投影面（LE-19）

機材は入力装置であると同時に、DOM / TUI と並ぶ**もう 1 つの renderer**:

- **モータライズノブ = 場の投影面**: `subscribe` で share を motor 位置に写す。正規化の結合が
  物理で見える（1 本上げると他のノブが下がる）— invariant が触覚になる
- ノブの入力は **share 指定**（§2 の二重読み）。Touch 中 = 指定、release 後 = 表示
- **機材 → 面の対応は consumer 供給の mapping registry**（Rail registry / pane kind に続く同パターン）。
  型が対応を予言する: 多本の連続値（場）→ knob 群、1 本のスカラー（t）→ フェーダー、
  離散の選択肢（Scene）→ pad。構造は演奏対象ではない（画面と AI の領分）
- MIDI 7bit は「粗い投影面」— LE-9 の番人判定を通る（protocol 変更ゼロで艦隊が繋がる）

## 10. 設計決定（LE-1 〜 LE-20）

| # | 項目 | 決定 |
|---|------|------|
| LE-1 | 所有モデル | creo-ui = protocol + SolidJS reference、VP = 最初で最難の consumer。primary dogfood = VP gallery mode |
| LE-2 | 命名 | 新 package 仮称 `creo-ui-layout`。`creo-ui-frame` は rename しない（遷移実行系として残る） |
| LE-3 | 連続場 | attention 1 本が唯一の真実源。0 = 非表示（2 規則）。raw/share 二重読み。taper は token（§2） |
| LE-4 | 直交分解 | 構造はサイズを持たない（軸交代 + 所属のみ）。記法 `ec \| cv/pp ~ board`（§3） |
| LE-5 | 主軸水平 | 軸交代 2（横→縦）で打ち止め、arity 無制限。縦画面は将来 transpose 1 穴 |
| LE-6 | resolve | normalize の再帰適用 1 関数、`resolve(layout)` の純形。列集約は初版 max（OQ-1）（§4） |
| LE-7 | scrub 遷移 | `interpolate(A, B, t)` が唯一の遷移 primitive。時間は driver。一時状態の戻り先 = last settle（§5） |
| LE-8 | content negotiation | **延期**（follow-up 穴）。min 制約・solver は dogfood で必要になってから |
| LE-9 | 量子化は縁 | protocol は連続。番人判定 =「粗い量子化に耐えるか」（§4） |
| LE-10 | DOM 安定性 | pane host を reparent しない。配置は transform / grid 座標のみ（VP R1、xterm.js 再生成不可） |
| LE-11 | projection 境界 | engine は純 client。「何が存在するか」は consumer 供給。scope key を型に明示（VP = lane） |
| LE-12 | pane kind | primitive は `kind` を意味づけしない。Engine×Act も consumer 供給 |
| LE-13 | 構造規律 | 純 data / 純 calculation / 純 action の分離を protocol の形に保存（VP R6） |
| LE-14 | Scene | immutable snapshot = 注視の表現 = scrub の端点。**適用は total recall**、undo は log（§6） |
| LE-15 | AI access | MCP bridge（scenes/get/set/propose）。提案は記法 + 場、t で覗ける。蒸留も同経路（§8） |
| LE-16 | apply policy | DAW automation modes（Off/Write/Read/Touch）。Touch = per-pane の driver 調停、per-scope 設定（§8） |
| LE-17 | settle log | 履歴 = 無名 Scene の列（3 規則）。永続 = log 末尾。蒸留は CC（§7） |
| LE-18 | floating | 構造非所属 × attention > 0。入場は tiled 直入り。リサイズ = attention、移動 = ephemeral 座標（§3） |
| LE-19 | 物理投影 | 機材 = もう 1 つの renderer。share 指定、mapping registry は consumer 供給（§9） |
| LE-20 | focus 非所有 | keyboard focus は DOM / consumer の領分。protocol は空間だけ。argmax = 主役（入力先ではない） |

## 11. Protocol（TypeScript 素描）

> 正確な API 面は LE-P0 の確定事項。形と依存の向きだけ固定する。

```ts
/** pane identity — 「何が存在するか」は consumer 供給（LE-11/12） */
interface PaneRef { id: string; kind?: string; label?: string }

/** 構造: 軸交代 + 所属のみ（LE-4/5）。float は構造に居ない（2×2） */
interface Structure { columns: readonly { panes: readonly string[] }[] }
// 記法 "ec | cv/pp ~ board" ⇄ (Structure, float 集合) は parse/format 往復テストで固定

/** 場: 唯一の真実源（LE-3）。格納は raw、操作/表示は share */
type Attention = Readonly<Record<string, number>>

interface Layout { structure: Structure; attention: Attention }
interface Scene { id: string; name: string; layout: Layout; description?: string }

/** resolved: 連続な矩形 + 場の透過。量子化しない（LE-9） */
interface ResolvedPane {
  rect: { x: number; y: number; w: number; h: number }   // 0..1 連続
  attention: number     // share。遠近・明暗への射影は platform 判断（frame F-3）
  floating: boolean
}
// attention = 0 の所属 pane は所属位置で面積 0 の rect（morph の収束先）

/** 純 calculation。viewport 引数なし（LE-6） */
function resolve(layout: Layout): Readonly<Record<string, ResolvedPane>>

/** 唯一の遷移 primitive（LE-7）。t は driver が外から与える */
function interpolate(a: ResolvedMap, b: ResolvedMap, t: number): ResolvedMap

/** gesture（純 calculation）。snap 等の量子化はここ = UI 作法 */
function setShare(l: Layout, id: string, share: number): Layout   // knob / リサイズ（touched 固定・余り比例配分）
function mute(l: Layout, id: string): Layout                      // = 0（全零 guard）
function solo(l: Layout, id: string): Layout                      // 独占（un-solo = last settle 再 apply）
function moveDominance(l: Layout, dir: 'left'|'right'|'up'|'down'): Layout   // 2D cyclic
function admit(l: Layout, id: string, opts?: { column?: number; share?: number }): Layout  // 既定: 末尾新規列・可視平均
function popOut(l: Layout, id: string): Layout                    // tiled → floating
function popIn(l: Layout, id: string, column?: number): Layout    // floating → tiled

/** engine: scope key ごとの Layout + settle log を束ねる（LE-11/17） */
interface LayoutEngine {
  current(scope: string): Layout
  update(scope: string, fn: (l: Layout) => Layout): void
  applyScene(scope: string, scene: Scene): void          // total recall（LE-14）。preset は mutate しない
  settle(scope: string, author: 'human'|'ai'|'scene'): void   // log append（LE-17）
  history(scope: string): readonly { layout: Layout; at: number; author: string }[]
  moveFloat(scope: string, id: string, pos: { x: number; y: number }): void  // ephemeral、直列化しない
  subscribe(fn: (scope: string, resolved: Readonly<Record<string, ResolvedPane>>) => void): () => void
}
```

DOM 反映（action）は reference 実装（SolidJS）と consumer 実装（VP renderer / MIDI motor）が
`subscribe` の外側で担う。

## 12. 他 protocol との分担

| protocol | 担当 | 一言で |
|---|---|---|
| Principal Layout（`CUEdgeShell` / `CURail`） | 画面の**外殻** — 4 edge + center | どこに何の領域があるか |
| **Layout Engine（本 doc）** | **center の内側** — 場 + 構造 + scrub + log | 領域の中に何をどう並べるか |
| creo-ui-frame | 遷移の**実行系** — time driver（FLIP / spring） | t をどう進め、どう見せるか（optional） |
| Editor Mode | overlay（非侵襲の調整層） | 場・taper・policy の knob を提供（開発道具） |

位置語彙（`regions.ts`、PL-2）は共有 canonical vocabulary。相互 import はしない。

## 13. Dogfood

- **primary = VP gallery mode**（doc 48 Phase 3）。`bun link` × watch → Reload で WKWebView 実機の秒ループ
- secondary = creo-ui site Playground（frame P-5 の台を流用）
- 全ループの完成形:
  `CC が propose（記法 + 場）→ t で覗く → フェーダー / knob で微調整（艦隊）→ 承認 → CC が token に Edit（蒸留）→ git`

## 14. Phase plan

| Phase | scope | 出荷物 |
|---|---|---|
| **LE-P0** | protocol types + 純 calculation 全部（normalize / resolve / interpolate / 全 gesture / 記法 parse-format）+ **property-based test 群を受け入れ条件に**（§2 再導出表 + 面積和 = 1 / 非重複 / 端点一致 / 往復 / 全零 guard。golden は記法文字列で書く） | 新 package（仮称 `creo-ui-layout`）、DOM 依存ゼロ |
| **LE-P1** | SolidJS reference 実装（apply = 連続 rect を transform / grid に写す、reparent なし、float 描画 + ephemeral 移動） | site Playground で secondary dogfood |
| **LE-P2** | VP gallery mode を最初のコンテンツとして pane 化 + **MCP bridge**（layout_* tools、doc 48 経路の兄弟） | VP 側 PR、primary dogfood 開始 |
| **LE-P3** | driver 統合 — `morphFrame` の t 外部化 + time / jump driver + **apply policy（Write/Read/Touch）** + 艦隊 mapping registry（VP 側、hand driver = knob/fader） | frame 側改修 + adapter + VP 配線 |
| **LE-P4** | VP 本統合 — `frame-engine.ts` / `pane-shell.ts` を置換（= frame-system P-6 の完了形） | VP UI フェーズ本体 |

## 15. Open questions（LE-P0 / P1 で確定）

1. **OQ-1 列集約 = max か sum か** — 初版 max（§4 の根拠）。dogfood で違和感が出たら再訪
2. **OQ-2 taper の曲線形** — token + Editor Mode knob で dogfood 決定（仕様で当てない）
3. **OQ-3 settle 判定の詳細** — release / debounce の具体値（P1 実装時）
4. **OQ-4 float 位置の寿命** — ephemeral の消えるタイミング（scope 切替 / pane 消滅時。P1）
5. **OQ-5 命名確定** — 仮称 `creo-ui-layout` / `CU*` prefix。owner decision

> 消滅した問い: 分割の次元（軸交代 2 + arity 自由）/ maximized（1.0 独占）/ 退避閾値（0 だけが特別）/
> Layout の永続（= log 末尾）/ min 競合（negotiation 延期に同梱）

## 16. やってはいけない

- **離散状態フラグの再導入**（focused / minimized / maximized 等）— 全て場の射影・導出（LE-3 / LE-20）
- **サイズを構造・記法に書く** — 二重 SSOT の再発。ASCII grid 却下の理由そのもの（LE-4）
- **protocol 内での量子化** — 文字セル / px / snap は投影と gesture の縁（LE-9）
- **時間駆動を interpolate に内蔵** — t は常に外。driver が進める（LE-7）
- **float のサイズを場の外で管理** — リサイズは attention 書き込み（LE-18）
- **system / AI が hitl（Write）モードで場に直接書く** — 提案まで。注視の主権は user（LE-16）
- **蒸留アルゴリズムを engine に実装** — 事実は log、解釈は CC（LE-17）
- pane host の reparent（LE-10）/ Scene（preset）の runtime mutate（LE-14）
- 特定 app の pane kind・機材割当を primitive に hardcode（LE-12 / LE-19）
- `creo-ui-frame` の直接移植・rename — 遷移実行系として活かす（LE-2 / LE-7）
- VP 以外の consumer 要件の先取り — 2nd consumer が現れた時に protocol を広げる

## 17. 関連

- VP 側の対 doc: `vantage-point/docs/design/49-gui-layout-engine.md`（要件 R1-R6・Epic の弧）
- 畳む対象: VP `crates/vp-app/webview/frame-engine.ts`（VP-140）/ `pane-shell.ts`（doc 46 P1）
- 遷移実行系: [frame-system.md](./frame-system.md)（P-6 が本 protocol 経由で完了形になる）
- 外殻: [principal-layout.md](./principal-layout.md)（Edge Ring + Rail、位置語彙 SSOT）
- 所有モデルの前例: [editor-mode.md](./editor-mode.md) D-11 / D-10
- 調整ループ（開発道具）: VP `docs/design/48-editor-mode-loop.md`

## 18. Status log

- 2026-07-22: v1 叩き台 — 3 層 pipeline（authoring → resolved → motion）、離散状態 Layout
- 2026-07-22: **v2 全面改稿**（発想出し第 1 ラウンド 10 案）— attention 連続場 core 化 /
  構造とサイズの直交分解（記法 `ec | cv/pp`）/ scrub 全面採用 / **ASCII grid 却下**（サイズの二重 SSOT）/
  量子化は投影の縁
- 2026-07-22: **v3**（第 1 ラウンド後半 + 第 2 ラウンド polish 10 点の採否確定）—
  0 = 非表示（2 規則）/ floating（2×2 の空きマス、入場は tiled 直入り = float 入場**不採用**、
  リサイズ = attention・移動 = ephemeral）/ solo・mute の mixer 語彙 /
  settle log（履歴 = 無名 Scene、永続 = 末尾、蒸留 = CC）/ AI 共著 LE-15 + apply policy LE-16
  （DAW automation modes、Touch = per-pane 調停）/ 物理投影 LE-19（share 指定、mapping registry）/
  **focus 追放 LE-20** / taper / 記法 `~` / `resolve(layout)` 純形 / property test を P0 受け入れ条件に
