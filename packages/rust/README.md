# creo-ui (Rust)

Creo UI Design System tokens for Rust consumers.

単一の W3C Design Tokens (DTCG) から生成された `pub const` 定義 (色 / 余白 / typography / radius / shadow) を `creo_ui::tokens` モジュールとして提供する。

## インストール

まだ crates.io に publish していない。Phase 2 で公開予定。現時点では path dependency または git dependency で参照する:

```toml
# Cargo.toml (path 参照の例)
[dependencies]
creo-ui = { path = "../creo-ui/packages/rust" }

# Cargo.toml (git 参照の例)
[dependencies]
creo-ui = { git = "https://github.com/chronista-club/creo-ui.git" }
```

## 使い方

```rust
use creo_ui::tokens;

fn main() {
    // Color は Rgb { r: u8, g: u8, b: u8 } 構造体
    let brand = tokens::COLOR_BRAND_PRIMARY;
    println!("brand primary = rgb({}, {}, {})", brand.r, brand.g, brand.b);

    // Dimension は f32 (px 単位)
    let md = tokens::SPACING_MD;
    assert_eq!(md, 16.0_f32);

    // Typography の family 等は &'static str
    let font = tokens::TYPOGRAPHY_FAMILY_SANS;
    println!("sans = {}", font);
}
```

### ratatui / image 等との連携

`Rgb` 構造体に `as_array()` が生えているので `[u8; 3]` 経由で他ライブラリの色型に渡せる:

```rust
use creo_ui::tokens::COLOR_BRAND_PRIMARY;

// ratatui
let bg = ratatui::style::Color::Rgb(
    COLOR_BRAND_PRIMARY.r,
    COLOR_BRAND_PRIMARY.g,
    COLOR_BRAND_PRIMARY.b,
);

// image crate
let pixel = image::Rgb(COLOR_BRAND_PRIMARY.as_array());
```

## 提供するトークン

| Category | 命名 | 型 |
|----------|------|----|
| `color.*` | `COLOR_BRAND_PRIMARY`, `COLOR_SEMANTIC_ERROR` 等 | `Rgb { r, g, b }` (u8) |
| `spacing.*` | `SPACING_XS`, `SPACING_MD` 等 (5 step) | `f32` (px) |
| `margin.*` | `MARGIN_XS`, `MARGIN_MD` 等 (5 step) | `f32` (px) |
| `radius.*` | `RADIUS_NONE`, `RADIUS_XS` ... `RADIUS_FULL` (5 step + special) | `f32` |
| `typography.size.*` | `TYPOGRAPHY_SIZE_MD` 等 (body text, 5 step) | `f32` (px) |
| `typography.display.*` | `TYPOGRAPHY_DISPLAY_MD` 等 (heading, 5 step) | `f32` (px) |
| `layout.gap.*` | `LAYOUT_GAP_SIBLING` 等 (semantic between-ness) | `f32` (px) |
| `layout.target.*` | `LAYOUT_TARGET_TAP` (=44) / `FOCUS` / `HIT` (Apple HIG accessibility) | `f32` (px) |
| `typography.weight.*` | `TYPOGRAPHY_WEIGHT_REGULAR` 等 | `f32` |
| `typography.family.*` / `shadow.*` | `TYPOGRAPHY_FAMILY_SANS`, `SHADOW_MD` 等 | `&'static str` |

全定数は [packages/rust/src/generated/tokens.rs](./src/generated/tokens.rs) で確認できる (Style Dictionary が `bun run build:rust` で自動生成)。

## Build 要件

- **Rust edition 2024** (`rust-version = "1.95"` を `mise` と揃えている)
- `#![forbid(unsafe_code)]`
- `creo_ui::tokens` は `include!()` で外部 module に取り込まれる設計 (`src/lib.rs:21`)

## License

Apache-2.0 — [LICENSE](https://github.com/chronista-club/creo-ui/blob/main/LICENSE)
