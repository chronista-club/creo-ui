# Outliner

> `List<List<Item>>` を任意の深さで畳める階層リスト。1 行 = テキスト + 右端 slot。「思い立った時に足せる」ことが主目的の capture-first component。

## Purpose

思いつきを **その場で書き留めて、後から構造を与える** ための view。アイデア出し / タスク分解 / 議事メモのように「先に構造を決められない」情報に向く。

書く速さを最優先にしているので、行の追加・インデント・並べ替えは全て keyboard で完結し、mode 切替 (ダブルクリックで編集開始、など) を挟まない。行を叩けばそのまま書ける。

## Classes

| class | role |
|---|---|
| `.creo-outliner` | container (`role="tree"`) |
| `.creo-outliner-row` | 1 行 (`role="treeitem"`) |
| `.creo-outliner-twisty` | 折りたたみ toggle。子が無い行は `data-placeholder` で場所だけ空ける |
| `.creo-outliner-bullet` | 行頭の点。畳んでいる行では塗りが濃くなる |
| `.creo-outliner-text` | 本文 (`<input>`。素の文字に見えるよう装飾を落としてある) |
| `.creo-outliner-meta` | 右端 slot (badge / 日付 / 件数など) |
| `.creo-outliner-add` | 末尾の「＋ 追加」 |

## Data 属性 / custom property

| 属性 | 値 | 意味 |
|---|---|---|
| `data-variant` (container) | `plain` (default) / `card` | `card` は Item を面として立てる |
| `data-guides` (container) | (boolean) | インデントの縦ガイド線を出す |
| `data-collapsed` (row) | (boolean) | 畳んでいる = 子孫行を描画しない |
| `data-done` (row) | (boolean) | 完了 (取り消し線 + 減光) |
| `data-selected` (row) | (boolean) | 選択中 |
| `--outliner-depth` (row, inline style) | number | 行の深さ。padding-left に効く |
| `--outliner-indent` (container) | length | 1 段のインデント幅 (default `spacing.l`) |

## Structure

DOM は **flat** (入れ子の `ul` ではない)。深さは `--outliner-depth` で表現する。

```html
<div class="creo-outliner" data-guides role="tree">
  <div class="creo-outliner-row" style="--outliner-depth: 0" role="treeitem" aria-level="1" aria-expanded="true">
    <button class="creo-outliner-twisty" aria-label="折りたたむ">›</button>
    <span class="creo-outliner-bullet" aria-hidden="true">•</span>
    <input class="creo-outliner-text" value="親" />
    <span class="creo-outliner-meta">3</span>
  </div>
  <div class="creo-outliner-row" style="--outliner-depth: 1" role="treeitem" aria-level="2">
    <button class="creo-outliner-twisty" data-placeholder tabindex="-1"></button>
    <span class="creo-outliner-bullet" aria-hidden="true">•</span>
    <input class="creo-outliner-text" value="子" />
  </div>
</div>
```

### なぜ flat DOM か

1. **keyboard 操作が素直になる** — ↑↓ や ⌥↑⌥↓ は「見えている行の並び」を 1 次元で辿れれば済む。入れ子 DOM だと index 計算が壊れやすい
2. **a11y が flat を正式に想定している** — `role="tree"` + `aria-level` は入れ子でない tree のための仕組み

代償として、**折りたたみは CSS 単独ではできない** (子孫が兄弟なので隠す選択子が書けない)。畳んだ枝の子孫は「描画しない」で表現する — 出し分けは consumer / primitive 側の責務。

## SolidJS primitive

keyboard grammar 込みで使う場合は `CUOutliner` を使う。

```tsx
import { CUOutliner, type OutlinerNode } from '@chronista-club/creo-ui/controls'

const [nodes, setNodes] = createSignal<OutlinerNode[]>([
  { id: '1', text: '思いついたこと', children: [{ id: '2', text: '細かいこと' }] },
])

<CUOutliner nodes={nodes()} onChange={setNodes} variant="card" guides />
```

`nodes` を渡せば controlled (木の所有権は consumer)、`defaultNodes` だけなら uncontrolled。どちらでも `onChange` は発火する。

### Keyboard

| キー | 動作 |
|---|---|
| `Enter` | 同じ深さに新しい行 |
| `Tab` / `Shift+Tab` | 1 段深く / 1 段浅く |
| `↑` `↓` | 行間を移動 (畳んだ枝は飛ばす) |
| `⌥↑` `⌥↓` | 行ごと上下に入れ替え (親はまたがない) |
| `Backspace` | 空行を削って上へ (子を持つ行は消さない) |

### 木の操作 (純関数)

`indent` / `outdent` / `moveUp` / `moveDown` / `insertSiblingAfter` / `removeNode` などは同じ subpath から export している。独自 UI から同じ操作を呼びたい場合に使える。

すべて **immutable** で、操作が成立しなかったときは **同一参照をそのまま返す**。呼び出し側は `next === prev` で「何も起きなかった」を判定できる (先頭行で `Tab` を押しても focus が跳ねない、など)。

## 設計上の判断

- **outdent は後続の兄弟を連れ出さない** — 動かしたつもりのない行まで動くのは capture 用途では驚きが大きいため (Notion 系の挙動)
- **子を持つ行は Backspace で消さない** — 畳んでいる時に子ごと消えると取り返しがつかない
- **indent 先が畳まれていたら開く** — 畳んだまま潜らせると、打った行が画面から消えて迷子になる
- **選択色に brand を使わない** (plain) — 行数が多い view で brand 色に塗ると画面が騒がしくなるため、`surface-veil` で示す

## Tokens

| slot | token |
|---|---|
| インデント 1 段 | `spacing.l` (`--outliner-indent` で上書き可) |
| row padding | `spacing.xs` × `spacing.s` (× density scale) |
| hover / press | `surface-veil-1` / `surface-veil-2` (press 語彙) |
| 畳んだ行の bullet | `surface-veil-3` + `radius.full` |
| card variant | `color.surface.surface` + `radius.s` + `elevation-1` |
| twisty rotate | `motion.mapping.toggle` (accordion の chevron と同方向) |
| meta (右端) | `typography.size.s` + `color.text.tertiary` |

## Related

- [Accordion](./accordion.md) — 1 段だけの開閉。階層を持たない情報に
- [Timeline](./timeline.md) — 時系列に並ぶ縦リスト
