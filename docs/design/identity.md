# Identity — creoui の auth 責務境界

**Status**: Boundary declaration (2026-05-24) — identity / auth は creoui scope 外、consumer 領分。
**Owners**: creoui (boundary 明文化)、consumer apps (Auth0 SPA / verifier 配線の実装)
**Scope**: creoui の責務境界を declarative に articulate する doc。identity / auth / session / scope / token / JWT に関する code を **creoui は提供しない** ことを記録し、将来の認識ズレ ("creoui に login primitive 出るはず" / "Principal Layout に audience prop 生やそう") を構造的に防ぐ。
**Related**: [principal-layout.md](./principal-layout.md), [editor-mode.md](./editor-mode.md), [frame-system.md](./frame-system.md), creo-memories `mem_1CbMiGk28cSeQ1BjB6P7hq` (CreoApps platform canonical rule — CreoID-as-SSOT identity model)

---

## 1. Overview (Why)

creoui の 3 本柱は **(1) 視覚的定数の SSOT (DTCG tokens) / (2) Editor Mode protocol schema / (3) Web reference runtime (`@chronista-club/creoui-editor-host`)** (CLAUDE.md)。**identity / auth は本柱に含まれない** — auth は各 consumer app (creo-web / fleetstage hq / backstage / GFP / Object Records 等) が自前で `@auth0/auth0-spa-js` 等を直接配線する責務。

本 doc は **creoui に auth code が無い事実を declarative 宣言** し、認識ズレを構造的に防ぐ。declarative boundary doc は principal-layout.md PL-1 (`creoui-frame` と別 primitive) や editor-mode.md EH-1〜EH-5 (Web reference runtime に限定) と同じパターン — **何を作らないかを SSOT 化** する規律。

### 1.1. 起源

2026-05-24、anycreative ecosystem の identity SSOT (CreoID-as-SSOT、creo-memories `mem_1CbMiGk28cSeQ1BjB6P7hq`) が canonical rule 化された。同 rule §6 creoui lane checklist に「Principal Layout 等の login UI primitive が `audience=https://id.anycreative.tech` を Auth0 SPA client init に渡す形か verify」とあり、OR lead から verify 依頼を受領。

実地調査の結果、**creoui に auth surface はゼロ** (verify session annotation: `mem_1CbMoHataLpsKyrDv4fFC6`)。`audience` を渡す primitive が存在せず checklist は verify 不能。本 doc はその結果を後付け文書として残し、creoui の責務境界を明文化する。

## 2. 責務境界 — creoui = visual / structural、auth = consumer

| 領域 | 責務 owner |
|---|---|
| 視覚的定数 (color / spacing / typography / radius / shadow / motion 等 design tokens) | creoui |
| Layout primitive (`<CUEdgeShell>` / `<CURail>` / `<CUPageShell>` / `<CUFacetGrid>`) | creoui |
| Editor Mode protocol + Web reference runtime (`@chronista-club/creoui-editor-host`) | creoui |
| 3D Frame system (`creoui-frame`、 spatial morph) | creoui |
| Icon / Motion / Vision primitives | creoui |
| **identity / auth / login UI / session / scope / token** | **consumer apps** |

consumer apps の例:

- **creo-web** (creo-memories の SPA): `@auth0/auth0-solid` 等で SPA 配線、`audience='https://id.anycreative.tech'` を init で渡す
- **fleetstage hq / backstage**: 同じく自前で SPA 配線
- **GFP** (将来): 同じく
- **Object Records (OR)**: server-side で JWT verify (`OBJECT_RECORDS_AUTH0_*` env で 3 値固定)

## 3. canonical rule reference (consumer 向け)

全 consumer は **CreoApps platform canonical rule (creo-memories `mem_1CbMiGk28cSeQ1BjB6P7hq`)** に従う:

```
iss   = https://id.creo-memories.in/    (CreoID = identity SSOT)
aud   = https://id.anycreative.tech     (Variant 1B shared、 anycreative ecosystem fence)
scope = product:permission              (product 識別 + permission grant の唯一の場、例 'object-records:write')
```

creoui は本 3 値の **定数も helper も提供しない**。consumer 側で hardcode するか、それぞれの app 内で env / config として保持する。

(将来 cross-app の重複が観察された時点で、`creoui/identity` subpath に薄い helper を additive 追加する path は残している — §5 参照。今は YAGNI。)

## 4. 各 primitive の境界 (= 不在の確認)

| primitive | auth との関係 |
|---|---|
| `<CUEdgeShell>` (Principal Layout、 PL-1) | 純粋な layout (4 edge + center)、 auth context を持たない |
| `<CURail>` (PL-3〜PL-5) | router-agnostic (`pathname` / `onNavigate` 受取)、 auth は consumer 配線 |
| `<CUPageShell>` / `<CUFacetGrid>` | layout primitive、 auth と無関係 |
| `creoui-frame` (3D spatial morph) | Scene 層 spatial articulation、 auth と無関係 |
| `@chronista-club/creoui-editor-host` (Editor Mode) | editor protocol / field 配線、 auth と無関係 (consumer の field を表示するだけ) |
| `creoui/shells` Z 軸 layer add-on (PL-6) | `currentLayer` store + URL sync、 auth と無関係 |

## 5. 将来 — `creoui/identity` を出す場合の規律

cross-app の auth init 重複 (例: 各 app が `audience='https://id.anycreative.tech'` を hardcode する) が問題化した時、creoui に **opt-in subpath として** identity helper を追加できる。想定 surface:

```ts
// creoui/identity (将来追加される場合の想定)
export const CREOID_AUDIENCE = 'https://id.anycreative.tech'
export const CREOID_ISSUER   = 'https://id.creo-memories.in/'
export const CREOID_JWKS_URL = 'https://id.creo-memories.in/.well-known/jwks.json'

/** scope idiom helper: base scope に product scope を additive 追加 */
export function appendScopes(base: string, scopes: readonly string[]): string
```

設計規律 (合意済み):

- **Auth0 SDK のラッパーまでは作らない** — consumer の login UX 自由 (Auth0 SDK 選択 / login flow / post-login routing) を奪わない。SDK config の constants と pure helper だけ
- **subpath で分離** (`creoui/identity`) — `creoui/shells` (layout) と並列、互いに依存しない (PL-1 と同型のパターン)
- **Principal Layout 等の layout primitive に audience prop を生やす設計は禁止** — SRP 違反、layout と auth は責務が違う (本 doc が articulate する境界の核)

今 (2026-05-24) は YAGNI、observed duplication が出るまで作らない。canonical rule `mem_1CbMiGk28cSeQ1BjB6P7hq` §5 (YAGNI 原則) と整合。

## 6. やってはいけない

- creoui の layout / icon / token / motion 等 visual primitive に **auth 関連 prop** (audience / scope / token 受取) を生やす
- `@auth0/*` 系 SDK を **creoui の dependency に入れる** (consumer の Auth0 SDK 選択自由を奪う)
- creoui に **login UI component** (LoginButton / LogoutButton / UserAvatar 等) を出す — それらは consumer 領分
- Principal Layout / Frame system / Editor Mode の docs / spec で **auth API を例示する** (例示自体が「creoui に auth surface ある」誤解を生む)
- canonical rule の identity 値 (`CREOID_AUDIENCE` 等) を creoui の **design token / theme / constant として埋め込む** (auth 識別子は design token ではない、 §2 で auth = consumer の責務分割が崩れる)
- 将来 `creoui/identity` を作るとしても、**Principal Layout 等の既存 primitive と混ぜる** (§5 規律違反)

## 7. 関連

- 起源 canonical: creo-memories `mem_1CbMiGk28cSeQ1BjB6P7hq` (CreoApps platform canonical rule — CreoID-as-SSOT)
- verify session: creo-memories annotation `mem_1CbMoHataLpsKyrDv4fFC6` (creoui lead 2026-05-24、 §6 creoui lane checklist verify = NA + 3 path 提案)
- 兄弟 doc: [principal-layout.md](./principal-layout.md), [editor-mode.md](./editor-mode.md), [frame-system.md](./frame-system.md)
- consumer 側参照箇所: creo-web / fleetstage hq・backstage / GFP / Object Records (各 repo の Auth0 init / JWT verifier 箇所)
