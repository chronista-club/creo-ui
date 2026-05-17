# Immersive Field — Spatial environment as Field-layer expansion

**Status**: **Exploratory** (vision、 探求 frontier、 ADR ではない)
**Date**: 2026-05-03
**Owners**: creoui maintainer + future contributors (collaborative)
**Scope**: Story / Scene / Field 統一メンタルモデルの **Field 層** を visionOS の immersive 3D 環境として
articulate する exploratory memo。 既存 protocol (Frame / Vision / Content viewers) を immersive
mode に拡張する path を共同探求する
**Related**: [frame-system.md](./frame-system.md), [vision-cross-platform.md](./vision-cross-platform.md), [editor-mode.md](./editor-mode.md), [vision-input.md](./vision-input.md), [theme-system.md](./theme-system.md)
**Pair memory**: creo-memories `mem_1CZCk1Zg8cQpiLvjqqDKNA` (Story / Scene / Field 統一メンタルモデル、 2026-03-20)

> **このドキュメントは確定 ADR ではなく vision memo**。 いくつかの decision は探求中、 「open
> question」 として明示している。 半年後にこの memo を読む自分 / contributor は、 「ここはまだ
> 決まってない」 と分かる shape で書いてある。 ともに開拓する。

---

## 1. Overview

ANYCREATIVE 統一メンタルモデル (Story / Scene / Field) の **Field 層** = 「3D 空間・ブラウザ・
ライフサイクル」 (World)。 これが visionOS / Apple Vision Pro では **literal な immersive 3D 環境**
として実現される。

```
[Story]  データ・台本 (Component)
   ↓
[Scene]  レンダリング・インタラクション (System) — Frame system が articulate
   ↓
[Field]  描画環境 (World) — ブラウザ / WebView / native window / ★ immersive space
```

Web の Field = browser viewport (2D + CSS 3D simulation)。
visionOS の Field = **immersive 3D space** (literal、 物理的奥行き / 視差 / 空間 audio)。

**Immersive Field** = visionOS-native の Field 層。 既存 Field 概念の specialization で、
表現の richer 化により Frame / Vision input / Content viewers の体験が literal な spatial 表現に
昇華する。

`Frame system が Scene 層を spatial に articulate` した構造と並列で、
`Immersive Field が Field 層を immersive に articulate` する。

## 2. What "Immersive" means — 4 aspects

Immersive Field を構成する 4 軸:

### 2.1 Environment (描画環境としての immersive)

- **Web Field**: 2D viewport、 CSS 3D で奥行き simulate
- **WebView Field** (VP / wry / Tauri): native window 内に embed された 2D viewport
- **Immersive Field** (visionOS native): physical room-scale or fully-immersive virtual environment
  - SwiftUI の `ImmersiveSpace` で開く
  - World-anchored / Window / Volume の 3 種 (Apple Vision Pro 用語)
  - Mixed reality (passthrough) または fully virtual

### 2.2 Frame system literal 化

[frame-system.md](./frame-system.md) F-3 (depth metaphor multi-platform) が、 Immersive Field では
**literal な物理距離** として表現される。

```
Frame.slot.z = 16  (Web 解釈: CSS translateZ 16px、 視差 trick)
                    ↓
                    ↓ Immersive Field 解釈
                    ↓
Frame.slot.z = 16  (visionOS 解釈: head-relative 16cm or 16m? 単位の question)
                    RealityKit Entity の `position.z` に直結
```

**Open question**: Frame schema の `z` の単位を Immersive Field でどう解釈するか? 候補:
- (a) px → cm (1px = 1cm) の単純変換
- (b) 別 schema field `z_meters` を追加、 web は無視
- (c) Frame に `coord_system: 'web' | 'spatial'` を持たせて per-Frame で解釈切替
- (d) immersive 専用 slot を別概念で定義

### 2.3 Vision input native (eye+pinch canonical)

[vision-cross-platform.md](./vision-cross-platform.md) §9 で articulate した visionOS の input model:

- **Eye gaze** = focus / hover (canonical primary input)
- **Pinch** = activate / select
- **Hand position** in worldspace (m 単位)
- **Spatial pinches** (3D 位置ありの pinch event)

Web の MediaPipe pinch (2D normalized) と Immersive Field の hand tracking (3D worldspace) を **同
schema で統一**するか、 別 schema にするかは design 判断。

**Open question**: `HandPinch.x/y/z` を normalized [0,1] (Web) と worldspace meters (Immersive Field)
の混在で扱うか? 候補:
- (a) 単位正規化なし、 platform 依存 (consumer が知る)
- (b) 別 field `worldspace?: { x_m, y_m, z_m }` を追加 (immersive のみ populated)
- (c) `space_kind: 'normalized' | 'worldspace'` discriminant を schema に
- (d) 完全に別 type — `SpatialHandPinch` を新規

### 2.4 Content viewers の immersive 化

[creo-views/md](https://github.com/chronista-club/creo-views) の Markdown / Mermaid 等の content
viewers が、 Immersive Field では **3D entity** として配置される可能性:

- Markdown text → SwiftUI `Text` を RealityKit `ModelEntity` で wrap、 視点距離で readable size
- Mermaid SVG → RealityKit plane mesh に texture として render、 zoom / pan は spatial gesture で
- Code blocks → glass material の floating panel
- Wiki link → 3D anchor で他 content にジャンプ

**Open question**: content viewer の immersive 表現を creo-views で持つか、 visionOS app 側で
adapter として持つか? 候補:
- (a) creo-views/md-spatial 等の immersive-specific renderer 追加
- (b) creo-views は AST 提供のみ、 visionOS app が SwiftUI / RealityKit で render
- (c) Hybrid — Web HTML を visionOS の WebView で表示しつつ、 spatial pinch gesture を統合

## 3. Connection to existing concepts

| 既存 | Immersive Field との関係 |
|---|---|
| **Story / Scene / Field model** (creo-memories) | Field 層の visionOS specialization |
| **Frame system** (F-1〜F-3) | F-3 depth metaphor が Immersive Field では literal、 Frame protocol 無変更 |
| **Vision input** (V-1〜V-5) | a11y / privacy contract は immersive でも維持、 input source が ARKit + eye gaze に |
| **Vision cross-platform** (CV-1〜CV-7) | Phase B-spatial の native visionOS app が Immersive Field の primary path |
| **Editor Mode protocol** (D-1〜D-12) | 4 region overlay は immersive でも有効、 Field を「世界」 として扱い Editor を「世界の上の overlay」 に維持可 |
| **Theme system** (8 theme) | Immersive Field でも token 経由で表現 (color / spacing は同じ semantic、 native は SwiftUI Color 経由) |

## 4. Speculative — Immersive Field で何ができるか

未確定の dream space:

- **3D Frame morph as room transitions** — dashboard ↔ reading の Frame 切替が、 visionOS では
  「部屋が回転する」 ような spatial 体験になる。 同 DOM 保持の延長で「同 Entity 保持」、 物理的に
  動く視点
- **Multi-window spatial layout** — visionOS の window manager が Frame slot を別 window として
  配置、 user が手動で空間に配置できる (creoui 規定の Frame と user の自由配置のハイブリッド)
- **Voice + gaze + pinch の triadic input** — visionOS は voice も canonical、 keyboard が Bluetooth
  でしか繋がらない environment で voice 経路の Editor Mode が大事に
- **Spatial Editor Mode** — Editor の 4 region (TOP/LEFT/RIGHT/BOTTOM) が物理的に user の 4 方向
  (頭上 / 左 / 右 / 下) に配置される
- **Theme as ambient lighting** — 8 theme が visionOS の environment lighting にも反映 (mint-dark
  なら緑がかった ambient、 sora なら sky blue 透過光)

これらは **vision** であって決定事項ではない。

## 5. Phase plan (exploratory)

| Phase | scope | 予測工数 |
|---|---|---|
| **IF-A** | この memo articulate (現)、 sibling memo cross-link | 0.3 session |
| **IF-B** | Vision Pro 実機で Safari for visionOS の docs site を試して Field 体験を測る (Phase A の延長 + visual UX 評価) | 0.5 session |
| **IF-C** | visionOS native skeleton — `creoui-immersive-swift` (or `creoui-vision-swift` の visionOS subset) で `<ImmersiveSpace>` + RealityKit + ARKit HandTracking の minimal viable viewer | 2-3 session |
| **IF-D** | Frame system Immersive backend — Frame schema の z 解釈を visionOS で literal meters に、 RealityKit Entity binding | multi-session |
| **IF-E** | Content viewers Immersive — md / mermaid を spatial entity として render | multi-session |
| **IF-F** | Multi-window / Voice / Spatial Editor Mode 等の dream features | open-ended |

## 6. Open questions (探求中)

1. **z 単位**: Frame schema の `z` の単位を Web (px) と Immersive (meters) でどう統一するか?
   → §2.2 の 4 候補
2. **HandPinch coordinate**: 同 schema で normalized + worldspace 両対応するか?
   → §2.3 の 4 候補
3. **Content viewers**: creo-views に immersive renderer を追加するか、 visionOS app の adapter
   として外側に置くか?
   → §2.4 の 3 候補
4. **Editor Mode**: 4 region (TOP/LEFT/RIGHT/BOTTOM) を Immersive Field でどう物理配置するか?
   user の頭上 / 周囲 / floating panel?
5. **Theme System**: ambient lighting や environment audio に theme をどう反映? それとも UI
   element の color のみで十分?
6. **Frame coordinate origin**: Immersive Field の origin は head-locked / world-anchored / room-anchored
   どれを default にするか?
7. **Text rendering**: 3D text quality (RealityKit `Text3D` vs SwiftUI Text in volume)、 distance
   based scaling の仕様
8. **Performance budget**: visionOS native で 90 FPS を割らない条件、 Frame system + Vision input +
   Content viewers の同時動作で何が ceiling か

これら全てに答えなくて良い。 必要になった時に決める。

## 7. やってはいけない

- ❌ Immersive Field を ADR として扱う (まだ exploratory)
- ❌ visionOS native (IF-C 以降) を Phase A 検証前に着手 (まず Safari for visionOS で Field 体験を測る)
- ❌ Frame schema を Immersive 専用 fork する (protocol 統一を維持、 解釈拡張で対応)
- ❌ open question (§6) を「保留中」 として永久に放置 (必要時に決める、 が無視はしない)
- ❌ Vision Pro の visionOS-only feature を全 platform で約束する (cross-platform parity を諦める領域あり)

## 8. Spirit

「ともに開拓しましょう」 (user 言、 2026-05-03) — このドキュメントは **共同探求の起点**。 完成形では
ない、 frontier の地図。 半年後にこの memo を再訪する時、 何が決まり何がまだ open かが分かるよう
維持する。 新発見があれば updates section に追記、 矛盾が出たら open question を追加。

> Frame system が Scene 層を spatial に articulate したのと同じ精神で、
> Immersive Field は Field 層を immersive に articulate する。
> 既存の Frame / Vision / Content / Editor の protocol は無変更で、 表現が richer になる。
