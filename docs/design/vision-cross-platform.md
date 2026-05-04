# Vision Input — Cross-platform Strategy

**Status**: Decision (Phase A 採用、 Phase B/C は future)
**Date**: 2026-05-03
**Owners**: Creo UI (schema + Web source)、 consumer / future packages (native sources)
**Scope**: Browser (Chrome) と Mac local app (VP 等) で同 vision input 体験を実現する戦略。 creo-ui-vision の API contract を保ちつつ、 platform 最適 inference engine を差替可能に
**Related**: [vision-input.md](./vision-input.md), [editor-mode.md](./editor-mode.md), [frame-system.md](./frame-system.md), [stack-adr.md](./stack-adr.md), [immersive-field.md](./immersive-field.md)

---

## 1. Overview

Vision Input (webcam motion capture) を **Browser (Chrome)** と **VP (Rust + tao + wry WebView)** で
両方実現する戦略。 結論: **VP は WebView なので Browser 実装をそのまま再利用できる** + 性能要件
で必要時に native source を追加する **3 層 common architecture**。

> **重要な事実**: VP は wry (WKWebView on Mac) アプリ。 つまり VP の中 = browser-equivalent JS/WASM
> 環境。 `creo-ui-vision/mediapipe` (P-4.5、 既 ship) がそのまま動く。 Phase A は **新コード ゼロ**。

## 2. 3 層 common architecture

| 層 | 内容 | platform 横断性 |
|---|---|---|
| **Schema** (data shape) | HandPinch / HeadPose / FaceMesh / GestureEvent 等の types | TS / Rust / Swift / Kotlin で derive 可能 |
| **Protocol** (interface) | `VisionSource` (start / stop / on / isRunning) | platform-agnostic な contract |
| **Engine** (inference) | MediaPipe / Apple Vision / ONNX Runtime 等 | platform-specific impl |

### 2.1 Schema layer

`packages/vision/src/types.ts` が SSOT。 `HandPinch` / `HeadPose` / `FaceMesh` / `GestureEvent`。
将来は ts-rs で **Rust を真実の SSOT** にして TS 型を auto-gen するパターン (creo-views/md と同じ) を
採用する余地あり。

### 2.2 Protocol layer

```ts
export interface VisionSource {
  start(): Promise<void>
  stop(): void
  on(listener: VisionListener): () => void
  isRunning(): boolean
}
```

各 platform で実装が違っても **caller の使い方は同じ**。 これが「source plug-in pattern」 の核。

Rust trait / Swift protocol も同 shape で表現可能:

```rust
// 将来 creo-ui-vision-rs
#[async_trait]
pub trait VisionSource: Send + Sync {
    async fn start(&mut self) -> Result<()>;
    fn stop(&mut self);
    fn subscribe(&self, listener: VisionListener) -> SubscriptionHandle;
    fn is_running(&self) -> bool;
}
```

```swift
// 将来 creo-ui-vision-swift
public protocol VisionSource: Actor {
    func start() async throws
    func stop()
    func subscribe(_ listener: @escaping (VisionUpdate) -> Void) -> AnyCancellable
    var isRunning: Bool { get }
}
```

### 2.3 Engine layer (per-platform)

| Platform | Engine | Status |
|---|---|---|
| **Browser (Chrome / Safari / Firefox)** | MediaPipe Tasks Web (WASM + WebGPU) | ✅ ship 済 (P-4.5) |
| **WebView (wry / WKWebView / WebView2)** | 同上 (Web と同コード) | ✅ VP で動く (Phase A) |
| **Safari for visionOS** | 同上 (WebView と同等) | ✅ Phase A で動く (Vision Pro 即時 path) |
| **Mac native** | Apple Vision framework (`VNDetectHumanHandPoseRequest`) | 🔮 Phase B-mac `creo-ui-vision-swift` |
| **visionOS native** | ARKit `HandTrackingProvider` (27 joint × 90Hz, spatial worldspace) | 🔮 Phase B-spatial `creo-ui-vision-swift` |
| **Cross-platform Rust** | ONNX Runtime + wgpu (or Apple Vision via objc2) | 🔮 Phase C `creo-ui-vision-rs` |
| **Mock (dev / test)** | Synthetic | ✅ ship 済 |

## 3. 設計決定 (CV-1 〜 CV-8)

| # | 項目 | 決定 |
|---|------|------|
| CV-1 | Common layer の境界 | Schema + Protocol layer は platform 横断 SSOT、 Engine layer は platform-specific |
| CV-2 | **VP の Phase A は native input、 library 不要** | VP では visionOS が **eye+pinch を pointer event** として Safari に渡す → `creo-ui-vision` を import しない方が正解。 Frame system + 通常 onClick で全部動く。 webcam-based MediaPipe は VP Safari で動かない (Phase A observation 2026-05-03、 §10) |
| CV-3 | Native engine 採用条件 | 性能 (5ms/frame 以下が必須) や memory footprint 制約で WebView では不足な時のみ Phase B |
| CV-4 | Schema SSOT 形式 | TS が現在の SSOT、 将来 Rust に移行 (ts-rs auto-gen) — vp-mdast → creo-md と同 pattern |
| CV-5 | Engine 選択原則 | Mac/iOS は Apple Vision 優先 (5ms/frame, OS 内 model)、 cross-platform は ONNX Runtime + wgpu |
| CV-6 | **割り切り (pragmatism)** | **「そこそこのスペック」 (M1+ / mid-tier desktop) 想定**、 WebView ~200MB memory overhead は許容。 Phase A が **default primary path**、 Phase B/C は specific 性能要件出現時のみ |
| CV-7 | **Vision Pro = first-class target** | visionOS は **正式 target**。 spatial UI は Frame system の literal 表現で、 F-3 (depth metaphor multi-platform) が物理的距離として実現。 達成手段は **OS-native input (eye+pinch → pointer event)** + Frame system の CSS 3D、 webcam-based hand tracking ではない |
| CV-8 | **`creo-ui-vision` の scope = spatial-input-poor environments** | library が活躍する環境 = **native spatial input が無い** desktop / laptop browser (Mac Chrome / Edge / Firefox / desktop Safari)。 **VP / iOS / Android は scope 外** — それぞれ system が rich な native input (eye+pinch / touch) を pointer event として透過提供するので library を呼ぶ必要がない |

### CV-6 詳細 — pragmatism と target spec

**target environment**:
- M1+ Mac (mini / laptop) / mid-tier desktop (16GB+ RAM)
- **Apple Vision Pro** (visionOS) ← first-class target、 詳細 §9 で
- Chrome / Safari / VP (wry WebView) で同等動作
- mobile / iOS native phone / 低電力 device は **out of scope**

**割り切り**:
- WebView overhead (~150-200MB memory) は許容 — そこそこのスペックなら気にならない
- MediaPipe 30 FPS / 30ms latency は許容 — Frame morph や fluent input には十分
- battery 効率は target ではない — desktop user の estimate

これにより:
- **Phase A が default**、 Phase B/C は「specific 制約に当たった時にだけ」 のオプション
- 「最適化の罠」 を避ける — 性能足りてるのに native 化を始めない
- design choice の判断軸が「動くか」 「保守可能か」 になる、 「最速か」 ではない

「割り切り」 は creo-ui の core 哲学の一つ:
- token は **基本 + 使ってるものだけ** (narrow scope)
- motion engine は **narrow self-built** (Motion One archive 教訓)
- vision input は **WebView + MediaPipe で 80% case 完結**

完璧主義より ship-readable な現実主義。

### CV-1 詳細 — Common layer の境界

「最大公約数」 として platform 横断にするのは **Schema + Protocol** まで。 Engine は platform 慣習に
任せる。 これは creo-ui token system と同じ哲学 (token は SSOT、 各 platform は最適 render)。

### CV-2 詳細 — VP の Phase A は library 不要

**当初の見立て (誤)**: VP は wry WebView (WKWebView) 経由で `creo-ui-vision/mediapipe` がそのまま動く。

**観察結果 (2026-05-03、 §10 Phase A observation log)**: visionOS Safari (= WKWebView の派生) で MediaPipe Tasks Web は **inference layer が silent fail** する (camera / WASM / model load は全部 OK、 `detectForVideo()` が常に landmarks 0 を返す)。 GPU / CPU delegate どちらでも同症状。 既知の WebKit bug (iOS Safari + MediaPipe + WebGL2 framebuffer / context loss、 GitHub mediapipe issues #1427 #4499 #5122) の visionOS 継承と判断。

**正しい解釈**: VP では **library が要らない**。 visionOS は eye gaze + pinch を **system level で pointer event 化** して Safari に渡すので:

- `<button onclick={...}>` が eye+pinch で natively 動く
- `onPointerDown` / `onMouseEnter` は eye gaze で natively 動く
- Frame system の dashboard / reading button が eye+pinch click で morph 切替

つまり VP page では `creo-ui-vision` を **import せず** 、 Frame system の CSS 3D + 普通の event handler だけで spatial UI が完成する。 これが一番 robust で、 OS の interaction model と整合し、 V-4 不変条件 (camera 取得不要) も自動で満たす。

**VP 専用 spatial gesture** (両手操作、 worldspace hand pose 等) が後日必要になった場合は WebXR (`navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hand-tracking'] })`) で ARKit の 25-joint data に直接 access できる (visionOS 2 で default 有効)。 WebXR は immersive session 内でのみ動くので 「通常 web page UI」 の文脈では不要、 真の immersive 3D experience を作る時だけ採用 (Phase B-spatial の web 版に相当)。

### CV-3 詳細 — Native engine 採用条件

WebView + MediaPipe は ~30 FPS で 30ms/frame くらい。 これで困る case:
- **多 task 並列** (hand + face + body 同時) で frame budget を切る
- **batter 寿命** が critical な mobile 環境で WebView overhead を削りたい
- **memory footprint** が必要 (WebView + MediaPipe = ~200MB)
- **Apple Vision の roll/pitch/yaw** が直接欲しい (matrixToEuler 不要)

これらが該当しないなら Phase A で十分。

### CV-4 詳細 — Schema SSOT 形式

現状: TypeScript (`packages/vision/src/types.ts`) が SSOT。
将来: Rust に移して ts-rs で TS 型 auto-gen (creo-views で確立済み pattern)。
理由: Rust 側で実装する future engine (Apple Vision via objc2 / ONNX Runtime) と整合。

### CV-5 詳細 — Engine 選択原則

| Target | 推奨 Engine | 理由 |
|---|---|---|
| Mac M-series native | **Apple Vision** | 5ms/frame、 OS 内蔵 model、 GPU (Metal) auto |
| iOS | **Apple Vision** | 同上 + battery 優位 |
| Linux / Windows native | **ONNX Runtime + wgpu** | cross-platform GPU、 model 自由 |
| Web / WebView (desktop) | **MediaPipe Tasks Web** | 標準的、 既ship |
| Web / WebView (visionOS Safari) | **— (library 不要、 native input 経由)** | system が eye+pinch を pointer event 化、 CV-2/CV-8 |

### CV-8 詳細 — `creo-ui-vision` の scope は spatial-input-poor environments

**library が活躍する target**:
- ✅ **Mac Chrome / Edge / Firefox / desktop Safari** — webcam で hand tracking を **UI input modality の一つ** として使う (mouse / keyboard と並列、 V-1 fallback 必須)
- ✅ **Windows / Linux desktop の Chromium 系** — 同上、 cross-platform で同 codebase
- ✅ **Mac の native app に WebView 同梱** (例: Vantage Point の wry WebView) — desktop 同等

**library が不要な target** (各 system が native spatial input を provide):
- ❌ **Vision Pro Safari** (CV-7) — eye+pinch が pointer event として届く、 webcam も MediaPipe inference も visionOS Safari で silent fail (§10)
- ❌ **iOS Safari / Android Chrome** — touch event が native の spatial input、 mobile webcam での hand tracking は ergonomics 上も不適 (片手で持ちながら片手で gesture は無理)
- ❌ **iPadOS Safari** — Apple Pencil / touch / magic keyboard が native input、 webcam は不適

**判断軸の articulate**:
> 「 native input が rich でない browser 環境」 = creo-ui-vision の scope。 そこでは hand tracking が **one of UI inputs** として機能する (keyboard / mouse / gesture 並列)。 「 native input が rich」 な環境では、 system の input layer に依存し、 library を **import しない** ほうが正解。

これは V-1 (keyboard fallback 必須) と組み合わさり、 input の階層化を成立させる:
1. **Native input** (mouse / keyboard / touch / eye+pinch) — 常に primary
2. **Vision input** (creo-ui-vision via webcam) — desktop browser でのみ optional fluent layer
3. Both は keyboard で完全 fallback 可能 (V-1)

User はどの環境でも 1 で十分 task 完遂できる、 2 が乗ると「より自然」 になる、 が design 契約。

## 4. Apple Vision framework の優位 (Phase B 検討時)

```swift
import Vision
import AVFoundation

let request = VNDetectHumanHandPoseRequest { request, error in
    guard let observations = request.results as? [VNHumanHandPoseObservation],
          let hand = observations.first else { return }
    // 21 landmarks (MediaPipe と同 semantic)
    let thumbTip = try? hand.recognizedPoint(.thumbTip)
    let indexTip = try? hand.recognizedPoint(.indexTip)
    // ... HandPinch を emit
}

let faceRequest = VNDetectFaceLandmarksRequest { request, error in
    guard let face = (request.results as? [VNFaceObservation])?.first else { return }
    // roll / pitch / yaw が CGFloat で直接取れる (matrix 計算不要)
    let pitch = face.pitch?.doubleValue ?? 0
    let yaw = face.yaw?.doubleValue ?? 0
    let roll = face.roll?.doubleValue ?? 0
}
```

優位点:
- **5ms/frame** (M2 Mac) — MediaPipe Web の ~3 倍速い
- **Memory footprint 小** — model は OS-level で shared
- **Roll/pitch/yaw 直取得** — matrixToEuler 不要、 Apple がすでに変換済
- **Battery 効率** — Apple Neural Engine 利用 (M-series chip)

弱点:
- **Mac/iOS 限定** — Linux/Windows 不可
- **API 変更** — iOS 14+/macOS 11+ 必須、 古い OS 不対応

## 5. VP 統合 staged path

> **重要 — Phase A は default primary path、 Phase B/C は specific 制約時のみのオプション**。
> CV-6 (pragmatism) により WebView ~200MB memory は target spec で許容、 Phase A で 80%+ case を
> ship する想定。

### Phase A (today、 zero new code) — **default primary**

```
VP wry WebView
    └─ creo-ui-vision/mediapipe (既 ship)
        └─ HandLandmarker / FaceLandmarker
            └─ getUserMedia → WKWebView → AVCaptureDevice
```

VP repo 側の作業:
- Info.plist `NSCameraUsageDescription`
- `creo-ui-vision/mediapipe` import (workspace dep として)
- VisionProvider 配置 + opt-in start button

工数: **0.3 session** (主に VP repo 側の boilerplate)。

### Phase B (optional、 native performance — specific 制約出現時のみ)

```
VP の Rust process
    └─ creo-ui-vision-swift (Swift Package、 Apple Vision)
        └─ swift-bridge / objc2 binding
            └─ VP の WebView に postMessage で update 配信
                └─ creo-ui-vision/native (新 source impl)
                    └─ Solid signals (consumer 無変更)
```

工数: **2-3 session** (Swift package + Rust binding + WebView bridge)。

### Phase C (visionary、 Linux / Windows desktop も視野 — far future)

```
creo-ui-vision-rs (Rust crate)
    ├─ Apple Vision via objc2 (Mac/iOS)
    ├─ ONNX Runtime + wgpu (Linux/Windows)
    └─ wasm-bindgen で browser 経由でも使える
```

工数: **multi-session**、 P-6 VP migration と統合の余地。

## 6. Constraints (a11y / privacy)

[vision-input.md](./vision-input.md) の V-1 〜 V-5 不変条件は **全 platform で contract**:

1. Keyboard fallback 必須 (Web / Mac native 共通)
2. Camera ON indicator 常時可視 (OS-level LED + UI dot)
3. `prefers-reduced-motion: reduce` で head-pose parallax 無効
4. Raw frame on-device only (server 送信なし) — Apple Vision / MediaPipe 両方ローカル inference で satisfy
5. User opt-in default — `autoStart: false`

## 7. Phase plan

| Phase | scope | 工数 |
|---|---|---|
| **A** | docs/design に articulate (this) + VP / Vision Pro に Phase A 統合 (Info.plist + import 追加) | 0.3 session |
| **B-mac** | `creo-ui-vision-swift` SPM package skeleton (AppleVisionSource for Mac native) | 1 session |
| **B-spatial** | visionOS native app path — ARKit HandTrackingProvider + RealityKit Frame integration | 2-3 session |
| **B+** | Swift implementation + VP の Rust↔Swift bridge | 2 session |
| **C** | `creo-ui-vision-rs` (cross-platform Rust)、 WASM build | multi-session |

## 9. Vision Pro target — spatial-first 設計

**visionOS は first-class target** (CV-7)。 Frame system の F-3 (depth metaphor multi-platform) が
**物理的距離として literal に表現** される唯一の environment。

### 9.1 2 path

#### Path A — Safari for visionOS (Phase A、 OS-native input、 library 不要)

VP では visionOS が **eye gaze + pinch を OS-level で pointer event 化** して Safari に渡す。 つまり:

- `<button onclick={...}>` は eye+pinch で natively click
- `onPointerEnter` / `onPointerLeave` は eye gaze の hover transition で発火
- Frame system の dashboard / reading button が **そのまま** spatial UI として機能
- CSS 3D transform (`perspective` + `translateZ` + `rotateX/Y`) が VP で物理的奥行きを伴って render

→ **`creo-ui-vision` を import せず**、 Frame system + 通常 event handler だけで完成する。 これが OS の interaction model (eye + intention) と整合する自然な path。

**観察 (2026-05-03、 §10)**: webcam-based MediaPipe path は VP Safari で silent fail (camera / WASM / model load OK、 inference が常に landmarks 0)。 これは Safari for visionOS の structural limitation で workaround 困難、 そして OS が rich な native input を提供しているので **そもそも要らない**。

**immersive 3D scene が要る場合のみ** WebXR (`navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['hand-tracking'] })`) を Phase B-spatial-web 路として併用可。 VP Safari は visionOS 2 で WebXR + hand-tracking を default 有効化、 ARKit の 25-joint world-space data を web に直接 expose する。 通常 page UI には不要、 真に immersive な 3D experience を作る時のオプション。

#### Path B-spatial — Native visionOS app (Phase B、 真の spatial UI)

```swift
// 将来 creo-ui-vision-swift の visionOS subset
import ARKit
import RealityKit

@MainActor
public class SpatialVisionSource: VisionSource {
    private let session = ARKitSession()
    private let handTracking = HandTrackingProvider()

    public func start() async throws {
        try await session.run([handTracking])
        for await update in handTracking.anchorUpdates {
            let hand = update.anchor
            // hand.handSkeleton joints — 27 joint × 90 FPS、 worldspace meters
            // → HandPinch (x/y/z は meters or normalized)
        }
    }
}
```

優位:
- **27 joint × 90 FPS** (MediaPipe の 21 × 30 比で 4 倍以上)
- **Spatial worldspace 座標** (m 単位、 視点との相対距離が分かる)
- **Eye+pinch canonical input** — visionOS の正規 gesture model
- **RealityKit Entity** で Frame system の slot を **literal な 3D entity** として配置
  - F-3 「depth metaphor」 が物理的距離として実装される
  - perspective / scale / rotation は OS-level GPU で計算

弱点:
- Swift / SwiftUI / RealityKit / ARKit の **4 framework 混合学習コスト**
- visionOS 限定 (Mac/iOS にこのまま転用不可、 共通コードは limited)

### 9.2 Frame system との整合

[frame-system.md](./frame-system.md) F-3 で「depth metaphor として platform 慣習で表現」 と articulate
していたが、 visionOS では **metaphor ではなく literal**:

| Platform | F-3 表現 |
|---|---|
| Web (CSS 3D) | `transform: translateZ(...)` の視覚的 depth (eye には平面、 視差で奥行き) |
| TUI (ratatui) | dim/bright で奥行きを示唆 |
| SwiftUI native | Liquid Glass + shadow |
| **visionOS native** | **RealityKit Entity の物理的 z 座標** (head-relative meters) |

Frame system の slot.z は CSS 上は px (一見 trick) だが、 visionOS では **そのまま meters に解釈**
すれば物理的奥行きが得られる。 protocol は変えずに representation が richer に。

### 9.3 Vision input 統合 — eye+pinch は OS が提供

visionOS の input model は **eye gaze + pinch** で、 OS が pointer event として web 層へ透過提供する。 つまり web page 側は **何もしない** で eye+pinch が hover / click として動く。

Creo UI の gesture 語彙 (vision-input.md) との整合:
- `<button onclick>` / `<a>` / `[role=button]` → eye+pinch で natively click
- `onPointerEnter` / `:hover` → eye gaze の hover transition で発火
- focus state → eye gaze で natural (browser が自動)
- **`creo-ui-vision` の `useHandPinch` 等は VP で呼ばない** — pointer event を listen するだけ

将来 Phase B-spatial (native visionOS app) では別途 `SpatialVisionSource` で 27-joint hand pose / eye gaze vector を直接 expose する (§9.1 Path B-spatial)。 web では出番無し。

### 9.4 Recommended path

**Phase A (即時、 default)**: VP で docs site / app をそのまま Safari で開く。 **`creo-ui-vision` import なし**。 Frame system の CSS 3D が VP で物理的奥行きを伴って render され、 button click は eye+pinch で natively trigger される。 user は何もインストールせず、 page 配信だけで spatial UI 体験開始。

**Phase B-spatial-web (optional)**: 真に immersive な 3D scene が要る時、 WebXR の `immersive-ar` session を起動して ARKit hand pose data を直接受ける。 通常 page UI では不要、 immersive content (例: 3D viewer、 game-like experience) に限定。

**Phase B-spatial-native (将来)**: native visionOS app として `creo-ui-vision-swift` 内に SpatialVisionSource 追加。 RealityKit binding で Frame system を literal 3D entity で表現。 Vision Pro 純粋体験 (web 層を超えた spatial 体験)。

**判断軸**:
1. **通常 web 体験** が VP で美しく動けば良い → Phase A、 99% の use case はこれで終わる
2. **immersive 3D scene** を web で配信したい → Phase B-spatial-web (WebXR 採用)
3. **app store 配信、 web 層を超えた体験** → Phase B-spatial-native

## 10. Phase A observation log (2026-05-03)

VP 実機で Phase A path (= Safari for visionOS で `creo-ui-vision/mediapipe` を動かす) を試した dogfood 観察記録。 partial-α 結果から **CV-2 / CV-7 / CV-8 を articulate** に至った judgment material。

### 10.1 観察した layer 別状態

| layer | status | 詳細 |
|---|---|---|
| HTTPS dev server (Mac) → VP 接続 | ✅ OK | LAN IP `https://192.168.68.101:5173/`、 自己署名 cert を VP Safari が「詳細 → Visit Website」 で accept すれば通る |
| `navigator.mediaDevices.getUserMedia` | ✅ OK | permission prompt 出る、 grant で stream 取得成功 |
| `MediaStreamTrack.getSettings()` | ✅ OK | `640×480 @ 30fps`、 `facingMode: 'user'`、 `whiteBalanceMode: 'continuous'` (= 能動的に動作中)、 `aspectRatio: 1.333`。 つまり **OS は web に frames を渡している** |
| `<video>.srcObject` 描画 | ⚠ 不明瞭 | 正常 preview 出ることもあれば 「camera blocked icon」 placeholder 出ることもある — autoplay policy の壁 (`requestAnimationFrame` 経由の `.play()` が user gesture 外と判定される疑い) |
| MediaPipe Tasks Web SDK fetch (jsDelivr CDN) | ✅ OK | `mediapipe.js` (300B) / `vision_wasm_internal.js` / `.wasm` / `hand_landmarker.task` が Performance API entries に出現。 cross-origin の sizes は CORS Timing-Allow-Origin 不在で 0B 隠蔽 (失敗ではない) |
| MediaPipe `FilesetResolver.forVisionTasks` | ✅ OK | error なく完了 |
| `HandLandmarker.createFromOptions` | ✅ OK | error なく完了 |
| `detectForVideo()` 呼出 | ✅ OK | exception throw なし、 inference loop は走り続ける |
| `result.landmarks.length` | ❌ **常に 0** | 手を camera に映しても検出ゼロ、 GPU delegate / CPU delegate どちらでも同症状 |

**結論**: camera / WASM / model / SDK init / inference loop の全てが「動いている」 が、 `result.landmarks` だけが空。 silent fail。

### 10.2 既知の WebKit + MediaPipe issue との一致

GitHub `google-ai-edge/mediapipe` で iOS Safari + WebGL2 系の bug が常連:

- [#1427](https://github.com/google-ai-edge/mediapipe/issues/1427) — Mediapipe CodePens don't run on iOS Safari
- [#4499](https://github.com/google-ai-edge/mediapipe/issues/4499) — Pose landmarker WKWebview: `Creating a context with WebGL 2 failed: emscripten_webgl_create_context() returned error 0`
- [#5122](https://github.com/google-ai-edge/mediapipe/issues/5122) — WebGL context lost on iOS Safari background switch

visionOS Safari は iOS WebKit base なので **同じ structural limitation を継承** していると判断。 isolated bug ではない。 加えて Safari 26 (iOS 26 / visionOS 2.x+) で WebGL → WebGPU pivot ([WebKit blog](https://webkit.org/blog/17640/webkit-features-for-safari-26-2/)) が進む方向性。 MediaPipe Tasks Web は WebGL 依存が深いので長期的にも Apple platform で苦しい path。

### 10.3 「Apple quiet wisdom」 解釈

Safari が web 層で MediaPipe を実用的に動かさないのは bug の側面もあるが、 同時に **意図的な resource 配置** とも読み解ける:

- VP の前面 camera は OS-level で eye / hand / passthrough rendering に常時専有
- ARKit `HandTrackingProvider` が **27 joint × 90Hz** worldspace で OS 側で常時 track
- visionOS が eye+pinch を **pointer event として既に web に渡している**
- → web layer で webcam から CV 推論する path は **二重実装** + OS の確実な答えと競合

つまり 「webcam-based hand tracking on VP」 は path として要らない。 OS は既に最良の答えを持っており、 それを native input 経由で web に渡している。

### 10.4 articulation の result

この observation から以下の articulate に到達:

- **CV-2 修正**: VP の Phase A は library 不要、 OS-native input + Frame system + 通常 onClick で完成
- **CV-7 articulation 強化**: VP は first-class target、 達成手段は **OS-native input** であって webcam-based hand tracking ではない
- **CV-8 新設**: `creo-ui-vision` の scope は **spatial-input-poor environments** (Mac / Windows desktop browser)。 VP / iOS / Android は scope 外
- **Mac/Windows desktop での hand tracking は引き続き valid** (CV-8): MediaPipe path は desktop browser で動く、 UI input modality の一つとして library が機能する

### 10.5 後日確認候補

- VP Safari の `<video>` autoplay policy 詳細 (preview NG icon の正体特定)
- Safari 26 + WebGPU 環境で MediaPipe Tasks の挙動 (将来的に動くようになる可能性)
- WebXR `immersive-ar` + `hand-tracking` feature の VP での実装確認 (Phase B-spatial-web)
- visionOS 純粋 native での `SpatialVisionSource` 仮実装 (Phase B-spatial-native)

## 11. やってはいけない

- ❌ 全 platform で同 inference engine を強要する (Web で MediaPipe、 Mac で Apple Vision で良い)
- ❌ Schema を platform ごとに分裂させる (SSOT 維持)
- ❌ VP に Phase B (native) を Phase A 検証前に着手 (まず WebView で動かす)
- ❌ Apple Vision の matrix output を `matrixToEuler` で再変換 (`face.pitch/yaw/roll` を直接使う)
- ❌ Linux / Windows desktop を Phase C 前に supported と謳う
- ❌ **「最速」 を理由に Phase B を選ぶ** (CV-6 違反、 target spec で WebView は十分)
- ❌ mobile / iOS native phone / 低電力 device の対応を Phase A で約束する (out of scope)
- ❌ memory footprint を 200MB 以下に抑える要求を初期から立てる (target spec で許容範囲)
- ❌ **Vision Pro を「将来やる」 扱いにする** (CV-7、 first-class target — Phase A は Safari for visionOS で OS-native input 経由で**何もせず動く**)
- ❌ visionOS native (Phase B-spatial) を MediaPipe Web と並列維持しない (engine layer の分裂、 各 best practice 採用)
- ❌ **VP page で `creo-ui-vision` を import する** (CV-2 / CV-8、 silent fail + 不要、 native input が rich)
- ❌ **Mac/Windows desktop browser で hand tracking を「不要」 扱いにする** (CV-8、 desktop は library の正規 target — webcam は UI input modality の一つ)
