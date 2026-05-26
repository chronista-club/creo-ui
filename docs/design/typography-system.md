# Typography system — creoui の font family 規約 + consumer override path

**Status**: Boundary + override declaration (2026-05-25) — typography token は creoui の sensible defaults、override は CSS variable cascade を first-class supported path とする。
**Owners**: creoui (token defaults + override path 明文化)、consumer apps (任意 local font の override 実装)
**Scope**: `tokens/typography/family.json` の 14 family token と Web emit 経路の articulate、および **consumer が任意の local font を自由に乗せる override path** の規律。`@font-face` を creoui 側に置かないこと・font museum 化しないことを宣言。
**Related**: [frame-system.md](./frame-system.md), [theme-system.md](./theme-system.md), [principal-layout.md](./principal-layout.md), [identity.md](./identity.md), [editor-mode.md](./editor-mode.md), [stack-adr.md](./stack-adr.md)

---

## 1. Overview (Why)

creoui の typography token は **mode-based + variant-aware** に組まれている (v0.12 multi-platform fonts → v0.13 mono variant → v0.14 mode-based 確立 → v0.18 5 tier 統一 → v0.20 安定)。14 family token が `tokens/typography/family.json` に置かれ、Style Dictionary が `--typography-family-{name}` という CSS custom property として `:root` に emit する。

ところが **「consumer が好みの local font を乗せる supported path」が明文化されていない**。CSS cascade で override 可能なのは事実だが、どの doc にも書かれておらず、consumer が「token を fork するしかない」と誤解する余地がある。本 doc はその override path を **first-class supported path** として articulate する。

> **暗黙のメッセージ**: 「Mizolet を creoui の principal にしたい」 のような local font 採用は **creoui 側に追加しない**。consumer 側 (creo-web / fleetstage hq・backstage / apps/site 等) で **1 行 CSS override** すれば達成する。creoui は「sensible defaults + 明確な override API」を提供する design system であって、全 user の font 好みを内蔵する font museum ではない。
> これは PL-1 (`creoui-frame` 別 primitive) / EH-1 (Web reference runtime に限定) / [identity.md](./identity.md) (auth は consumer 領分) と同じ **「consumer の自由を奪わない / SSOT を declarative に articulate する」規律** の延長。

## 2. 14 family token の構造

`tokens/typography/family.json` が SSOT。役割で 3 群に分かれる:

### 2.1. mode-based 4 family (= UI 体験の core)

| token | mode | 用途 | 現 chain の主軸 |
|---|---|---|---|
| **`app`** ★ | App UI mode | chrome 全般 (sidebar / button / dialog / tab) | JetBrainsMono Nerd Font Mono + PlemolJP (CJK 等幅統一) |
| `read` | Read mode | 読み専用 (memory view / chat history / canvas markdown / log viewer) | PlemolJP + JetBrainsMono Mono |
| `editor` | Editor mode (default) | textarea / Markdown editor / chat input | iA Writer Duo S + PlemolJP |
| `terminal` | Terminal mode | xterm.js 等 | JetBrainsMono Nerd Font Mono (`app` と同 stack だが意味分離) |

★ = **principal slot**。VP Phase A1 default として CHANGELOG v0.14.0 で articulate された。「principal font を override したい」= `--typography-family-app` を override する、と読み替える。

### 2.2. editor mode variant (= 書き手の好みで切替)

| token | 想定読者 | 主軸 |
|---|---|---|
| `editor-mono` | コード重視 user | iA Writer Mono S |
| `editor-quattro` | 長文散文 user | iA Writer Quattro S (semi-proportional) |

(`editor` 本体が Duo、それと並列の選択肢として Mono / Quattro を用意)

### 2.3. 用途別 (= 個別 component / aesthetic 用途)

| token | 用途 |
|---|---|
| `sans` | Default UI sans-serif (multi-language EN/JA/KO、multi-platform macOS/Win/Linux) |
| `mono` | Default monospace for code blocks / tokens / IDs |
| `mono-legible` | a11y / 低視力 / 小サイズ / long session (Atkinson Hyperlegible Mono + Hack) |
| `mono-retro` | retro / pixel / lo-fi aesthetic (Departure Mono / GohuFont / 3270 / Terminus) |
| `mono-corporate` | corporate / professional tone (IBM Plex Mono + Adwaita Mono) |
| `mono-display` | display / heading / cyberpunk aesthetic (Share Tech Mono + Victor Mono) |
| `display` | hero / large marketing headline |
| `icon` | Nerd Fonts ~10k アイコン + OS native emoji fallback |

## 3. 設計判断 (TY-1 〜 TY-5)

### TY-1 — Override = CSS custom property の cascade、first-class supported path

全 14 family は `--typography-family-{name}` という CSS custom property として `:root` に emit される。consumer は **CSS cascade で override 可能** = creoui が認める first-class supported override path。token を fork する必要は無い。

```css
/* consumer 側 (例: creo-web の src/index.css) */
:root {
  --typography-family-app: 'Mizolet', var(--typography-family-app);
}
```

これだけで `app` family を参照する全 UI primitive (Principal Layout / CreoPageShell / CreoRail icon 等) が Mizolet を使う。

### TY-2 — `@font-face` / web-hosted font asset は creoui 側に置かない

creoui は web font asset (woff2 / otf / ttf) を提供しない。全 font は **OS local / user-installed 前提** (Nerd Font も同様、user が install してる前提で chain に並んでる)。`@font-face` declaration も creoui 側には置かない。

理由: web font asset を creoui が host すると (a) bundle 肥大化、(b) license 管理が creoui に縛られる、(c) consumer が別 host (self-host / Google Fonts / Adobe Fonts 等) を選ぶ自由を奪う。auth SDK ラッパーを creoui に入れない ([identity.md](./identity.md) §6) と同じ規律。

consumer 側で `@font-face` が必要なら、そちらの index.css / global stylesheet で declare する (TY-5 参照)。

### TY-3 — Override は **prepend pattern** を推奨

custom font を chain 先頭に置き、creoui defaults を fallback として残す:

```css
/* ✅ 推奨 (prepend pattern) — Mizolet 不在環境では既存 chain に degrade */
:root {
  --typography-family-app: 'Mizolet', var(--typography-family-app);
}

/* ❌ 非推奨 (replace pattern) — Mizolet 不在環境で system default に落ち、Nerd Font icon が見えなくなる */
:root {
  --typography-family-app: 'Mizolet';
}
```

prepend なら font 不在環境 (= 別 OS / install 忘れ) で既存 fallback (Nerd Font / PlemolJP / system) に grace degrade する。replace すると Nerd Font icon が消えたり CJK 等幅が崩れる。

### TY-4 — Override scope を 4 段階で articulate

scope の柔軟性は **CSS cascade そのものの性質** であり、consumer が自由に選べる:

| scope | selector 例 | 用途 |
|---|---|---|
| **global** | `:root { ... }` | app 全体で 1 font に統一 (mito の Mizolet 採用は通常これ) |
| **theme-scoped** | `[data-theme="mint-dark"] { ... }` | 特定 theme でだけ font 切替 |
| **app/section-scoped** | `.my-workspace { ... }` | 特定 subtree のみ |
| **inline** | `style={{ '--typography-family-app': '...' }}` | 動的 / 例外 |

scope 間で 1 ヶ所だけ override すれば、他 scope は creoui defaults を継続。

### TY-5 — Consumer-side `@font-face` を足す場合の規律

consumer が web-hosted custom font (e.g., woff2) を使う場合、**creoui repo の外** (consumer の index.css 等) で declare する:

```css
/* consumer 側の index.css 例 */
@font-face {
  font-family: 'Mizolet';
  src: url('/fonts/Mizolet.woff2') format('woff2');
  font-display: swap; /* FOIT 回避、FOUT 容認 */
  font-weight: 400;
}

@font-face {
  font-family: 'Mizolet';
  src: url('/fonts/Mizolet-Bold.woff2') format('woff2');
  font-display: swap;
  font-weight: 700;
}

:root {
  --typography-family-app: 'Mizolet', var(--typography-family-app);
}
```

trade-off: `font-display: swap` で FOUT (Flash of Unstyled Text) は出るが FOIT (Flash of Invisible Text) は回避。preload hint (`<link rel="preload" as="font" ...>`) を入れれば swap 期間を短縮可。詳細は consumer 側の判断。

## 4. Override の具体例

### 4.1. Mizolet を principal font に (mito の典型 use case)

```css
/* creo-web の src/index.css に 1 行追加 */
:root {
  --typography-family-app: 'Mizolet', var(--typography-family-app);
}
```

Mizolet が install 済の Mac では Mizolet で描画、未 install / 別 OS では既存 chain (JetBrainsMono Nerd Font Mono → PlemolJP → monospace) に degrade。

### 4.2. read mode と editor mode を同 font に揃える

```css
:root {
  --typography-family-read: 'Iosevka', var(--typography-family-read);
  --typography-family-editor: 'Iosevka', var(--typography-family-editor);
}
```

mode-based articulate は維持しつつ、書く / 読む両方を同一 font に揃える user 好み実装。

### 4.3. 特定 theme でだけ retro font に切替

```css
[data-theme="oldschool-dark"] {
  --typography-family-app: var(--typography-family-mono-retro);
}
```

theme と typography は独立 token category だが、cascade selector で組み合わせれば theme-aware typography を consumer 側で実装可能。

### 4.4. subtree のみ override (例: 特定 workspace)

```css
.atelier-workspace {
  --typography-family-app: 'JetBrainsMono Nerd Font Mono', var(--typography-family-app);
  --typography-family-editor: 'iA Writer Quattro S', var(--typography-family-editor);
}
```

## 5. やってはいけない

- creoui の `tokens/typography/family.json` を **consumer が fork** する (override で十分、fork は upstream drift の元)
- consumer の component で `font-family: 'XXX'` を **inline で大量 hard-code** する (token 経由を維持しないと override の起点を失う)
- creoui に **web-hosted font asset (woff2 / otf 等) を入れる** PR を出す (TY-2、bundle 肥大化と license 縛りで consumer の自由を奪う)
- principal font を creoui defaults で **1 個に固定する** (mode-based の articulate が崩れ、editor mode に app mode 用 font が漏れる)
- 4 mode family の意味を ambiguate する **新 mode token** を追加する (CHANGELOG v0.14.0 で確立した 4 mode 規律を壊さない)
- creoui に **font picker UI / font management API を出す** (font 選択は consumer のドメイン、auth SDK ラッパーを入れない規律と同じ)

## 6. 関連

- token SSOT: [`tokens/typography/family.json`](../../tokens/typography/family.json) (14 family token の正本)
- emit 経路: [`transforms/config.web.js`](../../transforms/config.web.js) (Style Dictionary `css/creoui-themed` format)
- 生成物: `packages/web/dist/tokens.css` (`--typography-family-*` の宣言、gitignore、npm publish 成果物)
- dogfood viewer: [`apps/site/src/pages/Foundations/Typography.tsx`](../../apps/site/src/pages/Foundations/Typography.tsx) (typography 全 family の visible 確認)
- 兄弟 doc: [theme-system.md](./theme-system.md), [principal-layout.md](./principal-layout.md), [identity.md](./identity.md), [editor-mode.md](./editor-mode.md), [frame-system.md](./frame-system.md), [stack-adr.md](./stack-adr.md)
- CHANGELOG 関連 entries:
  - v0.12.0 — multi-platform fonts (Nerd Fonts + `--typography-family-icon`)
  - v0.13.0 — mono variant tokens (legible / retro / corporate / display) + Top 5 Nerd Fonts
  - v0.14.0 — mode-based typography family (app / read / editor / terminal)
  - v0.18 — 5 tier 統一 (sm/md/lg → s/m/l、typography 含む)
  - v0.20 — Phase 2-3 完走、 typography baseline 確定
