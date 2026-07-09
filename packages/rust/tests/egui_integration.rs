//! egui feature の統合 test (feature gated)。
//! `cargo test --features egui` で実行される。

#![cfg(feature = "egui")]

use ::egui::Color32;
use creo_ui::egui as creo_eg;
use creo_ui::tokens;

#[test]
fn to_color32_converts_rgb_with_opaque_alpha() {
    let rgb = tokens::Rgb::new(115, 231, 170);
    let c = creo_eg::to_color32(rgb);
    assert_eq!(c, Color32::from_rgb(115, 231, 170));
    // alpha は 255 (opaque)
    assert_eq!(c.a(), 255);
}

#[test]
fn from_trait_is_equivalent_to_to_color32() {
    let rgb = tokens::COLOR_BRAND_PRIMARY;
    let via_fn = creo_eg::to_color32(rgb);
    let via_from: Color32 = rgb.into();
    assert_eq!(via_fn, via_from);
}

#[test]
fn palette_brand_primary_is_green_dominant() {
    let c = creo_eg::palette::brand_primary();
    let [r, g, b, _a] = c.to_array();
    assert!(g > r, "g={g} should be > r={r}");
    assert!(g > b, "g={g} should be > b={b}");
    assert!(g > 150, "g={g} should be > 150 for mint");
}

#[test]
fn creo_visuals_uses_mint_dark_tokens() {
    let v = creo_eg::creo_visuals();

    // window_fill / panel_fill は COLOR_SURFACE_BG_BASE
    let bg_base = creo_eg::to_color32(tokens::COLOR_SURFACE_BG_BASE);
    assert_eq!(v.window_fill, bg_base, "window_fill should be surface.bg-base");
    assert_eq!(v.panel_fill, bg_base, "panel_fill should be surface.bg-base");

    // selection.bg_fill は brand.primary.subtle
    let brand_subtle = creo_eg::to_color32(tokens::COLOR_BRAND_PRIMARY_SUBTLE);
    assert_eq!(v.selection.bg_fill, brand_subtle);

    // selection.stroke は brand.primary
    let brand = creo_eg::to_color32(tokens::COLOR_BRAND_PRIMARY);
    assert_eq!(v.selection.stroke.color, brand);

    // hyperlink_color は semantic.info
    let info = creo_eg::to_color32(tokens::COLOR_SEMANTIC_INFO);
    assert_eq!(v.hyperlink_color, info);

    // noninteractive.fg_stroke.color は text.primary
    let text_primary = creo_eg::to_color32(tokens::COLOR_TEXT_PRIMARY);
    assert_eq!(v.widgets.noninteractive.fg_stroke.color, text_primary);

    // inactive.fg_stroke.color は text.secondary
    let text_secondary = creo_eg::to_color32(tokens::COLOR_TEXT_SECONDARY);
    assert_eq!(v.widgets.inactive.fg_stroke.color, text_secondary);

    // error / warn tint は semantic.*.text
    assert_eq!(
        v.error_fg_color,
        creo_eg::to_color32(tokens::COLOR_SEMANTIC_ERROR_TEXT)
    );
    assert_eq!(
        v.warn_fg_color,
        creo_eg::to_color32(tokens::COLOR_SEMANTIC_WARNING_TEXT)
    );

    // dark_mode flag は dark baseline を継承
    assert!(v.dark_mode, "creo mint-dark should preserve dark_mode=true");
}

#[test]
fn creo_visuals_widget_states_distinct() {
    // inactive / hovered / active で bg_fill が異なる (visual feedback が出る)
    let v = creo_eg::creo_visuals();
    assert_ne!(
        v.widgets.inactive.bg_fill,
        v.widgets.hovered.bg_fill,
        "inactive と hovered は視認可能な差があるべき"
    );
    assert_ne!(
        v.widgets.hovered.bg_fill,
        v.widgets.active.bg_fill,
        "hovered と active は視認可能な差があるべき"
    );
}

#[test]
fn apply_creo_theme_sets_visuals_on_ctx() {
    // egui::Context::default() は test 環境でも生成できる (windowing 不要)。
    let ctx = ::egui::Context::default();
    creo_eg::apply_creo_theme(&ctx);

    // ctx から読み戻して確認
    let bg_base = creo_eg::to_color32(tokens::COLOR_SURFACE_BG_BASE);
    ctx.style_mut(|s| {
        assert_eq!(s.visuals.window_fill, bg_base);
        assert_eq!(s.visuals.panel_fill, bg_base);
    });
}

#[test]
fn to_color32_is_const_usable() {
    // const 文脈でも呼べることを保証 (compile test を兼ねた値検証)
    const PRIMARY: Color32 = creo_eg::to_color32(tokens::COLOR_BRAND_PRIMARY);
    const SURFACE: Color32 = creo_eg::palette::surface();
    assert_eq!(PRIMARY.a(), 255);
    assert_eq!(SURFACE.a(), 255);
}
