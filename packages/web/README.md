# creo-ui-web

Creo UI の Web 向け Design Token 配布パッケージ。

Creo ecosystem (creo-memories, vantage-point 他) の Web アプリに、共通の色 / 余白 / typography / radius / shadow を **CSS custom properties** と **JavaScript 定数** として提供する。

単一の W3C Design Tokens (DTCG) から生成されているため、どのパッケージから読み込んでも Creo の視覚的一貫性が保たれる。

## インストール

```bash
bun add creo-ui-web
# or
npm install creo-ui-web
# or
pnpm add creo-ui-web
```

## 使い方

### 1. CSS custom properties として読み込む (推奨)

```ts
// エントリポイントで一度だけ読み込む
import 'creo-ui-web/tokens.css'
```

読み込むと `:root` に CSS 変数が定義される:

```css
.my-button {
  background: var(--color-brand-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}
```

### 2. JS 定数として参照する

ビルド時に値を埋め込みたい場合や、JS で計算したい場合:

```ts
import { ColorBrandPrimary, SpacingMd } from 'creo-ui-web/tokens.js'

console.log(ColorBrandPrimary) // '#73e7aa'
console.log(SpacingMd)          // '16px'
```

TypeScript 型定義 (`tokens.d.ts`) が同梱されているので補完が効く。

## 提供するトークン

| Category | 例 | 型 |
|----------|-----|----|
| `color.brand.*` | `primary`, `primary-hover`, `secondary`, `accent` | hex string |
| `color.semantic.*` | `success`, `warning`, `error`, `info` | hex string |
| `color.surface.*` / `color.text.*` | 背景 / テキスト色 | hex string |
| `spacing.*` | `xs` / `sm` / `md` / `lg` / `xl` / `2xl` | px |
| `radius.*` | `sm` / `md` / `lg` / `full` | px |
| `shadow.*` | `sm` / `md` / `lg` / `xl` | CSS shadow string |
| `typography.family.*` | `sans` / `mono` / `display` | font-family stack |
| `typography.size.*` | `xs` ... `4xl` | px |
| `typography.weight.*` | `regular` / `medium` / `bold` 等 | number |
| `typography.line-height.*` | `tight` / `normal` / `relaxed` | number |

完全な一覧は install 後の `node_modules/creo-ui-web/dist/tokens.css` または [GitHub repository](https://github.com/chronista-club/creo-ui/tree/main/tokens) 参照。

## 別 platform 向けパッケージ

同じ token SSOT から別 platform 向けにも配布している:

| Platform | Package |
|----------|---------|
| Apple (iOS / macOS / watchOS / tvOS) | SPM: `https://github.com/chronista-club/creo-ui` (target `CreoUI`) |
| Rust | `creo-ui` (将来 crates.io 予定) |

## Status

Phase 1 — W3C DTCG Token MVP。Phase 2 で Web Components、Phase 4 で theme 切替 (light / dark / high-contrast) を予定。

詳細は [Linear Epic CREO-84](https://linear.app/chronista/issue/CREO-84) を参照。

## License

Apache-2.0 — [LICENSE](https://github.com/chronista-club/creo-ui/blob/main/LICENSE)
