# Migration guide — legacy CSS → creoui

flat 1 階層 (`--color-primary`) / Tailwind 風 / Tabler 風の token を使ってる既存プロジェクトを、creoui の DTCG 3 階層 token に段階移行するための手引き。

CREO-103 (Creo Memories UI Foundation Migration) の Phase 1 ベースに汎用化。

## 全体像

```
Phase A: tokens.css + token-shim.css + 既存 CSS (unchanged)
           ↓
Phase B: domain 単位で直接参照に置換 (bg-primary → bg-brand-primary, 1200+ 箇所)
           ↓
Phase C: shim 削除 → 完全移行完了
```

## Phase A — Token shim 導入 (1-2 日 / 2 PR 相当)

### 1. package install

```bash
bun add creoui@^0.3.0
```

### 2. import 順を整備

```ts
// apps/<your-app>/src/main.ts or entry
import 'creoui/tokens.css'       // 1. SSOT token (必須、先頭)
import 'creoui/token-shim.css'   // 2. transitional alias (Phase A/B 間)
import 'creoui/components.css'   // 3. (optional) Button/Card/Input/Header
import './styles/app.css'              // 4. app 固有 CSS (既存、unchanged)
```

### 3. 既存 theme.css の色定義 を削除

`token-shim.css` が `--color-primary` / `--color-bg` 等を自動供給する。既存の色ハードコード定義は **重複排除**。

```css
/* BEFORE: apps/<app>/src/styles/theme.css */
:root {
  --color-primary: #73e7aa;
  --color-bg: #0f1419;
  --color-muted: rgba(255, 255, 255, 0.6);
  /* ... */
}

/* AFTER: 削除 */
```

### 4. 全 theme で visual diff = 0 を確認

Playwright (or 手動) で 8 theme (`mint-dark` / `mint-light` / `sora-*` / `contrast-*` / `oldschool-*`) 全切替で旧版と diff を比較。theme-shim が正しく mapping できてれば pixel-identical のはず。

## Phase B — Class / variable name の直接置換 (3-5 日 / domain 単位 PR)

### 対象: 1200+ 箇所の Tailwind class / CSS var

| Before | After |
|--------|-------|
| `bg-primary` | `bg-brand-primary` |
| `text-muted` | `text-text-secondary` |
| `border-primary` | `border-brand-primary` |
| `var(--color-primary)` | `var(--color-brand-primary)` |
| `var(--color-bg)` | `var(--color-surface-bg-base)` |

### 推奨: domain 単位の PR 分割

1 PR で 1200 箇所置換はレビュー不能。domain で分割:

```
PR 1: auth/        (auth form, sign-in/up)
PR 2: memory/      (memory list, detail, editor)
PR 3: layout/      (main layout, rail, nav)
PR 4: graph/       (atlas graph view)
PR 5: stats/       (dashboard)
PR 6: console/     (console REPL, editor-host chrome)
```

各 PR は biome / lint / typecheck + Playwright screenshot diff < 1% で検証。

### 機械的置換 の注意

- `sd` / `rg + sed` で一括置換できる箇所と、context-aware な箇所を区別
- CSS custom property 名はただの文字列なので regex で OK
- Tailwind class は全部 rebuild して確認 (PurgeCSS / Tailwind v4 の @source との整合)

### Tailwind v4 consumer の追加 step

`index.css` の `@theme` block を DTCG 名に直す:

```css
/* BEFORE */
@theme {
  --color-primary: #73e7aa;
  --color-bg: #0f1419;
}

/* AFTER — creoui/tokens.css が供給するので空、または DTCG 参照のみ */
@theme {
  /* 必要な追加 token があればここで定義 */
}
```

## Phase C — shim 削除 (1 PR)

全 domain の書き換えが完了したら:

### 1. token-shim.css の import を削除

```ts
import 'creoui/tokens.css'
// import 'creoui/token-shim.css'   ← 削除
import 'creoui/components.css'
import './styles/app.css'
```

### 2. build → visual diff 確認

shim 消しても見た目が変わらなければ migration 完了。変わるなら参照漏れがあるので Phase B に戻って domain 再確認。

### 3. deprecated token の CHANGELOG 記述

consumer 向けに「`--color-primary` は 0.x で deprecate、次 major で完全削除」のような明示的メッセージ。

## 典型的 trouble-shooting

### Q. shim 入れても色が変わってしまう
A. `token-shim.css` の import 順が `tokens.css` の **後** になっているか確認。`@import` 順が逆だと alias が上書き失敗。

### Q. Tailwind の `bg-primary` が効かない
A. `tailwind.config.js` の `theme.colors.primary` が古い hex を指してないか確認。DTCG 名に直すか `var(--color-brand-primary)` 参照に。

### Q. Mermaid の色が theme 切替で追従しない
A. Mermaid は CSS var を直接読まないので、`mermaid.initialize({ theme: 'base', themeVariables: { primaryColor: 'var(--color-brand-primary)' } })` ではなく `getComputedStyle(document.documentElement).getPropertyValue('--color-brand-primary')` で resolve してから渡す必要あり。theme 切替時に再初期化。

### Q. Editor Mode (editor-host) と併用できる?
A. できる。`creoui-editor-host` は `creoui` の token に乗るだけなので、shim + editor-host の同居 OK。consumer は Editor Mode で変えたい token を `bind()` 経由で操作、shim は alias 層として常駐。

## 関連

- [CREO-103](https://linear.app/chronista/issue/CREO-103) Creo Memories migration Epic
- [CREO-84](https://linear.app/chronista/issue/CREO-84) creoui Design System Epic
- [CREO-87 / CREO-88](https://linear.app/chronista/issue/CREO-87) component spec + impl
- [docs/components/README.md](../components/README.md) — MVP component index
