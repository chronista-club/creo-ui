//! ratatui feature の統合 test (feature gated)。
//! `cargo test --features ratatui` で実行される。

#![cfg(feature = "ratatui")]

use creoui::ratatui as creo_rat;
use creoui::tokens;
use ::ratatui::style::Color;

#[test]
fn color_converts_rgb_to_ratatui_rgb() {
    let rgb = tokens::Rgb::new(115, 231, 170);
    let c = creo_rat::color(rgb);
    assert_eq!(c, Color::Rgb(115, 231, 170));
}

#[test]
fn palette_brand_primary_is_green_dominant() {
    let Color::Rgb(r, g, b) = creo_rat::palette::brand_primary() else {
        panic!("expected Color::Rgb");
    };
    // mint-dark brand primary は green dominant
    assert!(g > r, "g={g} should be > r={r}");
    assert!(g > b, "g={g} should be > b={b}");
    assert!(g > 150, "g={g} should be > 150 for mint");
}

#[test]
fn pad_cells_approximates_spacing_scale() {
    // 8px/cell 仮定、round down
    assert_eq!(creo_rat::pad::xs(), 0); // 4px → 0 cell
    assert_eq!(creo_rat::pad::sm(), 1); // 8px → 1 cell
    assert_eq!(creo_rat::pad::md(), 2); // 18px → 2 cell
    assert_eq!(creo_rat::pad::lg(), 3); // 24px → 3 cell
    assert_eq!(creo_rat::pad::xl(), 4); // 32px → 4 cell
}

#[test]
fn style_returns_default_ratatui_style() {
    let s = creo_rat::style();
    // default Style は fg / bg / modifier が None / empty
    assert!(s.fg.is_none());
    assert!(s.bg.is_none());
    assert!(s.add_modifier.is_empty());
}

#[test]
fn chained_style_works() {
    let s = creo_rat::style()
        .fg(creo_rat::palette::brand_primary())
        .bg(creo_rat::palette::bg_base());
    assert!(s.fg.is_some());
    assert!(s.bg.is_some());
}
