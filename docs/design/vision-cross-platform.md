# Vision Input — Cross-platform Strategy

**Status**: Decision (Phase A 採用、 Phase B/C は future)
**Date**: 2026-05-03
**Owners**: Creo UI (schema + Web source)、 consumer / future packages (native sources)
**Scope**: Browser (Chrome) と Mac local app (VP 等) で同 vision input 体験を実現する戦略。 creo-ui-vision の API contract を保ちつつ、 platform 最適 inference engine を差替可能に
**Related**: [vision-input.md](./vision-input.md), [editor-mode.md](./editor-mode.md), [frame-system.md](./frame-system.md), [stack-adr.md](./stack-adr.md)

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
| **Mac/iOS native** | Apple Vision framework (`VNDetectHumanHandPoseRequest`) | 🔮 Phase B `creo-ui-vision-swift` |
| **Cross-platform Rust** | ONNX Runtime + wgpu (or Apple Vision via objc2) | 🔮 Phase C `creo-ui-vision-rs` |
| **Mock (dev / test)** | Synthetic | ✅ ship 済 |

## 3. 設計決定 (CV-1 〜 CV-6)

| # | 項目 | 決定 |
|---|------|------|
| CV-1 | Common layer の境界 | Schema + Protocol layer は platform 横断 SSOT、 Engine layer は platform-specific |
| CV-2 | VP 即時 path | wry WebView 経由で `creo-ui-vision/mediapipe` をそのまま使う (新コード不要、 Phase A) |
| CV-3 | Native engine 採用条件 | 性能 (5ms/frame 以下が必須) や memory footprint 制約で WebView では不足な時のみ Phase B |
| CV-4 | Schema SSOT 形式 | TS が現在の SSOT、 将来 Rust に移行 (ts-rs auto-gen) — vp-mdast → creo-md と同 pattern |
| CV-5 | Engine 選択原則 | Mac/iOS は Apple Vision 優先 (5ms/frame, OS 内 model)、 cross-platform は ONNX Runtime + wgpu |
| CV-6 | **割り切り (pragmatism)** | **「そこそこのスペック」 (M1+ / mid-tier desktop) 想定**、 WebView ~200MB memory overhead は許容。 Phase A が **default primary path**、 Phase B/C は specific 性能要件出現時のみ |

### CV-6 詳細 — pragmatism と target spec

**target environment**:
- M1 Mac mini / Apple Silicon laptop / mid-tier desktop (16GB+ RAM)
- chrome / safari / vp (wry WebView) で同等動作
- mobile / iOS native / 低電力 device は **out of scope**

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

### CV-2 詳細 — VP 即時 path

VP は **wry WebView** = WKWebView on Mac。 中で動く JS / WASM は browser と同等:
- `getUserMedia` 動作 (Info.plist の `NSCameraUsageDescription` 設定要)
- `@mediapipe/tasks-vision` (WASM + WebGPU) 動作
- Solid signals と Frame system も同様

**今日の VP に統合手順** (VP repo 側で):
1. VP の `Info.plist` (or `tauri.conf.json` 相当) に `NSCameraUsageDescription` 追加
2. Sandbox 環境なら `com.apple.security.device.camera` entitlement 追加
3. VP の web/ 内で `creo-ui-vision/mediapipe` import + `<VisionProvider>` 配置
4. (任意) VP の Rust 側から `webview.evaluate_script` で gesture event を listen

完了。 native source は不要。

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
| Web / WebView | **MediaPipe Tasks Web** | 標準的、 既ship |

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
| **A** | VP に Phase A 統合 (Info.plist + import 追加)、 docs/design に articulate (this) | 0.3 session |
| **B** | `creo-ui-vision-swift` SPM package skeleton (AppleVisionSource API + stub) | 1 session |
| **B+** | Swift implementation + VP の Rust↔Swift bridge | 2 session |
| **C** | `creo-ui-vision-rs` (cross-platform Rust)、 WASM build | multi-session |

## 8. やってはいけない

- ❌ 全 platform で同 inference engine を強要する (Web で MediaPipe、 Mac で Apple Vision で良い)
- ❌ Schema を platform ごとに分裂させる (SSOT 維持)
- ❌ VP に Phase B (native) を Phase A 検証前に着手 (まず WebView で動かす)
- ❌ Apple Vision の matrix output を `matrixToEuler` で再変換 (`face.pitch/yaw/roll` を直接使う)
- ❌ Linux / Windows desktop を Phase C 前に supported と謳う
- ❌ **「最速」 を理由に Phase B を選ぶ** (CV-6 違反、 target spec で WebView は十分)
- ❌ mobile / iOS native / 低電力 device の対応を Phase A で約束する (out of scope)
- ❌ memory footprint を 200MB 以下に抑える要求を初期から立てる (target spec で許容範囲)
