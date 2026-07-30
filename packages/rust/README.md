# creo-ui (Rust)

creo-ui Design System tokens for Rust consumers.

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
    // Color は Rgb { r, g, b, a } 構造体 (u8、a は straight alpha。0.8.0 で追加 —
    // scrim 等の translucent token が alpha を保持して届く)
    let brand = tokens::COLOR_BRAND_PRIMARY;
    println!("brand primary = rgba({}, {}, {}, {})", brand.r, brand.g, brand.b, brand.a);

    let scrim = tokens::COLOR_SURFACE_SCRIM;
    assert_eq!(scrim.a, 102); // 40% scrim (旧版は alpha が落ちて不透明だった)

    // Dimension は f32 (px 単位)
    let md = tokens::SPACING_M;
    assert_eq!(md, 18.0_f32);

    // Typography の family 等は &'static str
    let font = tokens::TYPOGRAPHY_FAMILY_SANS;
    println!("sans = {}", font);
}
```

### ratatui / image 等との連携

`Rgb` 構造体に `as_array()` (`[u8; 3]`、alpha は落ちる) / `as_rgba_array()` (`[u8; 4]`) が
生えているので他ライブラリの色型に渡せる:

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

### ratatui interop (`features = ["ratatui"]`)

`creo_ui::ratatui` 下に `Color` 変換と palette helper、character cell padding が生えている:

```rust
use creo_ui::ratatui as creo_rat;
use creo_ui::tokens;

let title_style = ratatui::style::Style::default()
    .fg(creo_rat::color(tokens::COLOR_BRAND_PRIMARY))
    .bg(creo_rat::palette::bg_base())
    .add_modifier(ratatui::style::Modifier::BOLD);

// spacing token を character cell 数 (8px/cell 仮定) で扱う
let left_pad = creo_rat::pad::md(); // 18px → 2 cells
```

### egui interop (`features = ["egui"]`)

`creo_ui::egui` で mint-dark baseline の `Visuals` を egui Context にワンショット
適用できる。`Rgb` → `Color32` 変換は alpha を保持する (0.8.0 で const fn 保証を撤回 —
egui の unmultiplied → premultiplied 変換が const でないため):

```rust
use creo_ui::egui as creo_eg;
use creo_ui::tokens;

fn setup(ctx: &egui::Context) {
    // Creo mint-dark theme を Visuals に一括反映 (surface / widgets / selection
    // / hyperlink / error・warning tint まで)
    creo_eg::apply_creo_theme(ctx);
}

// Visuals を直接取得して部分 override したい場合
let mut v = creo_eg::creo_visuals();
v.window_rounding = 8.0.into();

// 単発の Color32 変換 (scrim 等は translucent のまま届く)
let brand = creo_eg::to_color32(tokens::COLOR_BRAND_PRIMARY);
let info: egui::Color32 = tokens::COLOR_SEMANTIC_INFO.into();
```

## 提供するトークン

| Category | 命名 | 型 |
|----------|------|----|
| `color.*` | `COLOR_BRAND_PRIMARY`, `COLOR_SEMANTIC_ERROR` 等 | `Rgb { r, g, b, a }` (u8、straight alpha) |
| `spacing.*` | `SPACING_XS`, `SPACING_M` 等 (5 step) | `f32` (px) |
| `margin.*` | `MARGIN_XS`, `MARGIN_M` 等 (5 step) | `f32` (px) |
| `radius.*` | `RADIUS_NONE`, `RADIUS_XS` ... `RADIUS_FULL` (5 step + special) | `f32` |
| `typography.size.*` | `TYPOGRAPHY_SIZE_M` 等 (body text, 5 step) | `f32` (px) |
| `typography.display.*` | `TYPOGRAPHY_DISPLAY_M` 等 (heading, 5 step) | `f32` (px) |
| `layout.gap.*` | `LAYOUT_GAP_SIBLING` 等 (semantic between-ness) | `f32` (px) |
| `layout.target.*` | `LAYOUT_TARGET_TAP` (=44) / `FOCUS` / `HIT` (Apple HIG accessibility) | `f32` (px) |
| `typography.title.*` | `TYPOGRAPHY_TITLE_PAGE` 等 (role-based headings, hero/page/section/subsection/card) | `f32` (px) |
| `typography.body.*` | `TYPOGRAPHY_BODY_DEFAULT` 等 (role-based body, lead/default/emphasis/helper/caption) | `f32` (px) |
| `typography.weight.*` | `TYPOGRAPHY_WEIGHT_REGULAR` 等 | `f32` |
| `typography.family.*` / `shadow.*` | `TYPOGRAPHY_FAMILY_SANS`, `SHADOW_M` 等 | `&'static str` |

全定数は [packages/rust/src/generated/tokens.rs](./src/generated/tokens.rs) で確認できる (Style Dictionary が `bun run build:rust` で自動生成)。

## Build 要件

- **Rust edition 2024** (`rust-version = "1.95"` を `mise` と揃えている)
- `#![forbid(unsafe_code)]`
- `creo_ui::tokens` は `include!()` で外部 module に取り込まれる設計 (`src/lib.rs:21`)

## License

Apache-2.0 — [LICENSE](https://github.com/chronista-club/creo-ui/blob/main/LICENSE)
