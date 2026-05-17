# Vision Input — creoui Webcam motion capture

**Status**: Vision (architecture proposed、 実装未着手)
**Owners**: creoui (新 package `creoui-vision` の schema + Solid signal API)
**Scope**: Webcam motion capture を Editor Mode protocol 経由で Frame system に統合する protocol
**Related**: [frame-system.md](./frame-system.md), [editor-mode.md](./editor-mode.md), [stack-adr.md](./stack-adr.md), [vision-cross-platform.md](./vision-cross-platform.md)

---

## 1. Overview

Webcam を使ってモーションをキャプチャー、 UI に伝える。
3D Frame system と統合して、 **gesture-driven spatial UI** を実現する。
Apple Vision Pro / visionOS の design vocabulary を Web に降ろす形。

> **Vision (原文)**: あと Web カメラ使ってモーションをキャプチャーして、 UI にそれを伝えたいんだよなぁ、、、。

## 2. Stack 決定

**MediaPipe Tasks (Web SDK)** を採用:

- Hand / Pose / Face / Gesture 完備
- WASM + GPU 対応、 30-60ms latency
- **on-device 完結** (privacy ok、 server 送信なし) ← 決定打
- Bundle ~3MB、 lazy load 必須

代替検討と却下理由:

| Lib | 却下理由 |
|---|---|
| TensorFlow.js | latency 大きめ、 fragmented API |
| ONNX Runtime Web | model 自由だが整理コスト高 |
| WebRTC + server inference | privacy 問題、 ネット必須、 latency |

詳細は [stack-adr.md](./stack-adr.md) 参照。

## 3. Gesture 語彙

| 入力 | 意味 | UI 反応 |
|---|---|---|
| **Pinch** (thumb + index touch) | click 等価 | slot select / button activate |
| **Open palm** | rest | no input、 cursor 退避 |
| **Pointing** (index extended) | hover | 3D cursor 投影 |
| **Wave** (横移動) | morph trigger | `setFrame(next)` |
| **Pinch + drag** | spatial manipulate | 要素 grab して 3D 移動 |
| **Two-hand spread** | zoom | Frame perspective 変更 |
| **Head tilt** | parallax | perspective camera shift (Apple Vision 風) |
| **Lean forward** | focus / 詳細 | zoom in、 detail Frame に morph |
| **Lean back** | overview | zoom out、 dashboard Frame |
| **Face absent** | user 不在 | UI dim、 animation suspend、 webcam idle |

## 4. 不変条件 (V-1 〜 V-6)

| # | 項目 | 決定 |
|---|---|---|
| V-1 | Keyboard fallback | 必須 — gesture が唯一の入力経路にしない |
| V-2 | Camera ON indicator | LED + UI indicator 常時可視 (privacy transparency) |
| V-3 | Reduced motion | `prefers-reduced-motion: reduce` で head-pose parallax 無効 |
| V-4 | On-device only | raw frame は on-device に留める (server 送信なし) — MediaPipe Tasks 採用の決定打 |
| V-5 | Opt-in default | default OFF、 explicit enable button、 user 同意必須 |
| V-6 | User-space coords canonical | API が emit する landmark の x は **user 視点で正規化**。 selfie (`camera: 'user'`) は MediaPipe の生 image-plane x を `1 - x` で反転、 user の右手 → x 大。 raw camera POV は `coordSpace: 'camera'` で opt-out 可。 VP の ARKit と semantic 互換 |

### V-6 — なぜ user-space を canonical にするか (2026-05-03)

MediaPipe の生 landmark は **camera image plane** 座標 — selfie だと「 user の右手は image の左 (x が 0 寄り)」 に映る。 これは physics として正しいが、 UI consumer が触ると違和感。 二択:

1. **raw camera POV のまま渡す**: consumer 側で必要に応じ mirror。 「明示的」 だが consumer 全員に判断強制 → bug の温床
2. **library boundary で user-space に正規化** (V-6 採用): UI 層は直感のまま、 spatial reasoning 用は `coordSpace: 'camera'` で opt-out

決定打は **VP ARKit との semantic 互換**。 `HandTrackingProvider` は worldspace で hand position を返し、 device frame との関係から「 user の右手 → device-relative 右」 が natural。 MediaPipe を camera POV のまま expose すると、 consumer code が「 web の時だけ x を反転」 という platform-conditional 分岐を抱える。 library が boundary で吸収すれば、 consumer code は MediaPipe / ARKit / Apple Vision native を **同じ semantic で書ける** (CV-7 cross-platform 整合性)。

**実装** (`packages/vision/src/mediapipe.ts`):
- `coordSpace: 'user' | 'camera'`、 default は `camera` 引数から自動 (`'user'` → 'user'、 `'environment'` → 'camera')
- hand landmarks は `toUserSpace(p)` で `x ↦ 1 - x`
- head-pose の yaw / roll は scalar 反転 (matrix 直接 mirror は pitch に誤差を載せるので避ける)

**観察起源** (2026-05-03 dogfood): Mac webcam で Real MediaPipe demo を試した user の即時の発見「画面左が実際の右側ですね」 — proprioception で emoji indicator は追従感成立していたが、 video preview を出した瞬間に破綻するし、 「 button を pinch で押す」 等の絶対座標 UI で破綻する。 library boundary で正規化が正解。

## 5. Editor Mode protocol との統合

`creoui-vision` から得られる signal を **Editor Mode protocol 経由で** Frame system に流す。

```ts
// Solid signals
import { useHandPinch, useHeadPose, useFaceMesh } from 'creoui-vision'
import { useEditorHost } from 'creoui-editor-host'

const pinch = useHandPinch()           // Accessor<{ active: boolean, x, y, z }>
const head = useHeadPose()             // Accessor<{ pitch, yaw, roll }>
const face = useFaceMesh()             // Accessor<{ present, focused }>

const host = useEditorHost()
createEffect(() => {
  if (pinch().active) {
    host.setValue('frame.action', 'select')  // Editor Mode field 経由
  }
})
```

→ **keyboard / mouse / gesture / MCP の 4 経路が unified field operation model に収まる**。
gesture も「Editor Mode の field を操作する」 という単一抽象で扱える。

## 6. 「Fluent input」 として位置付け

Apple Vision Pro と同じ思想:

- **Keyboard / mouse は accuracy 用** (form 入力 / button 確実 click)
- **Gesture は ambient な操作** (Frame morph / parallax / 「居る」 シグナル) 限定
- **全 action gesture でできる UI は失敗する** (occlusion / 疲労 / 誤検知)

つまり gesture は primary input ではなく、 **fluent な layer** として keyboard / mouse の上に乗る。

## 7. 想定 API surface

```ts
// Provider
<VisionProvider config={{ camera: 'front', sampleRate: 30 }}>
  <App />
</VisionProvider>

// Hooks (Solid signals)
const pinch = useHandPinch()           // 手のひら pinch state
const point = useHandPointing()         // 人差し指方向
const head = useHeadPose()             // 頭部姿勢 (pitch / yaw / roll)
const face = useFaceMesh()             // 顔ランドマーク
const gesture = useGesture()           // 高レベル gesture (wave / nod / etc.)
const presence = useFacePresence()     // user 在否

// Calibration UI helper
<CalibrationGuide />  // hand visibility / lighting check
```

## 8. やってはいけない

- gesture を唯一の入力経路にしない (V-1 違反、 a11y 違反)
- raw video frame を server 送信しない (V-4 違反、 privacy 違反)
- camera 取得を user 同意なく開始しない (V-5 違反)
- 全 action を gesture mapping にしない (cognitive overload)
- gesture 語彙を docs に articulate せず ship しない (覚え必要、 docs page 必須)
