# Editor Link — editor-host を外の相手と繋ぐ（D-16）

> **Status**: Active（editor-host 側は実装済み。相手側の hub は VP lane で進行中、実機確認待ち）
> **Related**: [Editor Mode](editor-mode.md) D-10 / D-16、[design 03](03-app-editor.md)、creo-memories thread `editor-link`（`mem_1CgX1jeiGkJJWUaxQHMRhz`）
> **対象**: `packages/editor-host/src/{link,ws-link}.ts`、`host.ts`（change listeners）、`provider.tsx`（`config.link`）、`apps/site/src/App.tsx`

## 目的

Editor Mode が既に持っているもの — fields / selection / values / mode — を、そのままの形で外の相手に流し、相手からの set / mode を受け取る口です。相手がそれを何に写すか（机の MIDI 機材、AI、別のアプリ）は creo-ui では決めません。**creo-ui は MIDI を知らない**ままで、editor-host を載せたどの面も、VP daemon が居れば机の機材に繋がります（mako 裁定 2026-10-30）。

位置付けは D-10「AI agent access は同じ protocol で」を「外部の誰でも」に一般化したものです。実体は cross-tab 同期（F5）の message 形を fields / selection / mode まで広げ、transport を WebSocket にしたものに過ぎません。

## 契約（wire）

JSON の text message、1 message = 1 object、`t` で種別を表します。この節が wire の SSOT です。相手側（VP hub）の mapping と調停は VP の design doc、機材との契約は midistage design 03 が持ち、ここには書きません。

### 面 → 相手

| `t` | payload | いつ |
|---|---|---|
| `hello` | `v`（wire 版、今は 1）、`app`（名札）、`surface`（面の id） | open 直後 |
| `mode` | `mode: 'on' \| 'off'` | open 直後、変わった時 |
| `fields` | `fields: LinkField[]`（**全量**、差分ではない） | open 直後、register / unregister で一覧が変わった時 |
| `selection` | `selection: { targetId, fieldIds, componentId? } \| null` | open 直後、変わった時（OFF による clear も含む） |
| `values` | `values: Record<id, value>` | open 直後、`get` への返答 |
| `set` | `id`、`value` | 面の側で値が変わった時（slider / console / AI）。cross-tab（F5）で別 tab から入った値は流れません（受信が silent のため） |

`LinkField` は `EditorField` の宣言部分（`id / label / type / semantic / scope / group / order / role / persistence / constraints / initial / cssVar`）で、`apply` などの関数は乗りません。`selection` から `element` / `rect` は落とします（画面の外では意味を持たないため）。

### 相手 → 面

| `t` | payload | 面の振る舞い |
|---|---|---|
| `set` | `id`、`value` | 知っている field なら `host.setValue`。知らない id は黙って捨てる |
| `mode` | `mode` | `enable()` / `disable()`。手動 toggle の一種として扱う（D-7） |
| `get` | — | `mode → fields → selection → values` を送り返す（`hello` は含まない） |

### 規則

- **open のたびに** `hello → mode → fields → selection → values` の順で snapshot を送ります。閉じている間に送ったものは捨てるので、相手はここで追いつきます。
- 相手から届いた `set` / `mode` を適用した結果（その `set` / `mode` そのもの）は**相手へ返しません**（echo loop 回避）。確認したい相手は `get` を送ります。ただし適用の副作用で起きた selection の変化（`mode off` による clear）は相手が知らないので、`selection null` として流します。
- 値の型は `field.type` のままです（number は number で送る）。文字列化して送ると書き戻しの段で `"1.75"` が焼き付きます（VP #890 の教訓）。
- host は値を clamp も変換もしません。`constraints` の範囲に収めるのは相手の責務です。
- URL は固定 `ws://127.0.0.1:32000/link`（`DEFAULT_LINK_URL`）。面の側は設定なしで繋がります。token は当面ありません — Link に乗るのは Editor の操作だけで、lease もファイル書き込みも乗らないためです。守り（loopback peer 限定 + Origin allowlist）は相手側が持ちます。
- 相手が居なければ 1s から倍々で最大 30s の間隔で繋ぎ直すだけで、Content にも Editor にも影響しません（D-6）。JS からは何も出しませんが、**ブラウザ自身の WebSocket 接続エラーは console に出ます**（JS では抑えられません）。そのため `link` は dev や機材のある環境でだけ有効にしてください。

## 構成

- `link.ts` — wire の型、`toLinkField` / `toLinkSelection` / `parseInbound`（純計算）、`installLink(host, opts)`。transport は差し替え可能（WebSocket 以外、例えば wry の ipc でも同じ形で繋げます）。
- `ws-link.ts` — `wsLink(url)`。WebSocket transport と再接続。
- `host.ts` — `onModeChange` / `onFieldsChange` / `onSelectionChange`。Solid の owner を持たない infra が state の変化を追うための plain listener で、値が実際に変わった時だけ呼ばれます。
- `provider.tsx` — `config.link`（`true` または `LinkOptions`）で install。

## consumer

```tsx
<EditorHostProvider config={{ link: { app: 'Vantage Point' } }}>
```

`app` は相手の一覧に出る名札で、`EditorLayer` の `appName` と揃えておくと迷いません。site は dev のときだけ有効にし、公開 site は loopback に繋ぎに行きません。

## 相手側（VP hub）に期待すること

概要だけ記します。詳細は VP の design doc と thread `editor-link` を参照してください。

- `hello.app` / `surface` を名札にして面を登録し、どの面が機材を持つかを調停する。
- `set` の値を field の `constraints` に収めて送る。
- wire を変えたいときは thread に先に書き、この doc を更新してから追従する。

## 検証

- `bun test packages/editor-host/src/link.test.ts` — fake transport で往復（open 時の snapshot、local 変化の mirror、inbound の適用と echo 抑止、`get`、uninstall）。
- `bun test packages/editor-host/src/host.test.ts` — change listener が「変わった時だけ」呼ばれること。
- `bun test packages/editor-host/src/ws-link.test.ts` — 再接続間隔の純計算。
- 実機（VP daemon + ROTO）での確認は VP lane の成功条件です。creo-ui 側は純計算のテストで完了とし、実機は「実機確認待ち」と記します。

## やってはいけない

- Link に MIDI の語彙（knob / fader / pad / ControlEvent / ParamSpec）を足す。写すのは相手の仕事です。
- host 側で値を clamp / 変換する。
- 相手が居ないときに JS から console を汚す、Content や Editor の動作を止める。
- 公開 site で `link` を有効にする。
- `fields` を差分で送る。全量が契約です。

## Status log

- 2026-10-30: 起草と実装。mako 裁定: VP daemon を hub にする / URL 固定 / token 当面なし / ノブは選択に追従（VP policy）/ 最初の実機は ROTO。相手側は VP lane `editor-hub`、midistage は `semantic-adapter` で並走。
