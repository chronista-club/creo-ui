# Tokens Spec

Creo UI で使う W3C Design Tokens (DTCG) の仕様。

## Reference

- [W3C DTCG Editor's Draft](https://tr.designtokens.org/format/)
- [Style Dictionary v4 docs](https://styledictionary.com/)

## ディレクトリ構造

```
tokens/
├── color/       # color.* (brand, semantic, surface, text, border)
├── spacing/     # spacing.* (0, 1, 2, 4, 8, 16, 24, 32, ...)
├── typography/  # typography.* (family, size, weight, leading)
├── radius/      # radius.* (sm, md, lg, full)
└── shadow/      # shadow.* (sm, md, lg, xl)
```

各ファイルは DTCG 準拠の JSON。例:

```json
{
  "color": {
    "brand": {
      "primary": {
        "$value": "#0EA5E9",
        "$type": "color",
        "$description": "Creo primary brand color"
      }
    }
  }
}
```

## Naming Convention

- **3 階層まで**: `category.variant.scale`（例: `color.brand.primary`、`spacing.scale.4`）
- **kebab-case** は避け、**camelCase / snake_case なし の dot-notation** に統一
- **semantic**: `color.semantic.success` / `color.semantic.danger` など意味的な alias を別途定義し、生の brand color を直接参照しない

## Platform 出力先

| Platform | Build path | Format |
|----------|-----------|--------|
| Web CSS | `packages/web/dist/tokens.css` | `css/variables` |
| Web JS | `packages/web/dist/tokens.js` + `.d.ts` | `javascript/es6` + `typescript/es6-declarations` |
| Swift | `packages/swift/Sources/CreoUI/Generated/Tokens.swift` | custom `swift/creo-ui` |
| Rust | `packages/rust/src/generated/tokens.rs` | custom `rust/creo-ui` |

Swift / Rust は標準 transform (iOS 向け UIKit / Rust 未提供) を使わず、`transforms/config.{swift,rust}.js` で hand-roll している。詳細は [CLAUDE.md](../CLAUDE.md) の「custom format のフォーマット仕様」参照。
