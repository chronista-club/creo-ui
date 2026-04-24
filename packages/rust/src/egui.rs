//! egui (immediate-mode GUI) interop layer.
//!
//! Creo UI tokens → `egui::Color32` 変換 helper と、Creo mint-dark baseline に
//! 合わせた [`egui::Visuals`] factory を提供する。ratatui と違い egui は
//! rect / stroke / rounding 等の数値 style も扱うが、ここでは「theme 起点」に
//! 絞り (visuals)、token の spacing / radius は consumer 側で `egui::Spacing`
//! や widget 単位の引数に適用する方針にする (egui 側の Spacing は大域 override
//! が副作用大きいので、theme 関数ではいじらない)。
//!
//! ## Feature flag
//! `creo-ui = { features = ["egui"] }` で有効化。
//!
//! ## 使用例
//!
//! ```ignore
//! use creo_ui::egui as creo_eg;
//! use creo_ui::tokens;
//!
//! fn setup(ctx: &egui::Context) {
//!     // Creo mint-dark theme を一括適用
//!     creo_eg::apply_creo_theme(ctx);
//! }
//!
//! fn button_tint() -> egui::Color32 {
//!     creo_eg::to_color32(tokens::COLOR_BRAND_PRIMARY)
//! }
//! ```

use crate::tokens::{self, Rgb};
use egui::{Color32, Context, Stroke, Visuals};

/// Creo UI の [`Rgb`] を egui の [`Color32`] に変換する (alpha = 255)。
///
/// `const fn` で定義されているので `pub const` token と合成して
/// `const` 初期化にも使える。
#[inline]
#[must_use]
pub const fn to_color32(rgb: Rgb) -> Color32 {
    Color32::from_rgb(rgb.r, rgb.g, rgb.b)
}

/// Trait 経由での変換も提供 (`Color32::from(rgb)` / `rgb.into()`)。
impl From<Rgb> for Color32 {
    #[inline]
    fn from(rgb: Rgb) -> Self {
        to_color32(rgb)
    }
}

/// Creo mint-dark baseline の [`Visuals`] を返す。
///
/// [`egui::Visuals::dark`] を起点に、window_fill / panel_fill / widgets /
/// selection / hyperlink / error / warning の色を Creo token に差し替える。
/// Rounding / stroke width 等の形状系 default は egui 既定を踏襲する。
///
/// 呼び出し側で [`Context::set_visuals`] を介して適用するか、[`apply_creo_theme`]
/// を使う。
#[must_use]
pub fn creo_visuals() -> Visuals {
    let mut v = Visuals::dark();

    // Background / surface
    v.window_fill = to_color32(tokens::COLOR_SURFACE_BG_BASE);
    v.panel_fill = to_color32(tokens::COLOR_SURFACE_BG_BASE);
    v.faint_bg_color = to_color32(tokens::COLOR_SURFACE_BG_SUBTLE);
    v.extreme_bg_color = to_color32(tokens::COLOR_SURFACE_BG_SUBTLE);
    v.code_bg_color = to_color32(tokens::COLOR_SURFACE_BG_EMPHASIS);

    v.window_stroke = Stroke::new(1.0, to_color32(tokens::COLOR_SURFACE_BORDER));

    // Widget states
    // - noninteractive: 静的な枠 (window 背景, label text)
    v.widgets.noninteractive.bg_fill = to_color32(tokens::COLOR_SURFACE_BG_BASE);
    v.widgets.noninteractive.weak_bg_fill = to_color32(tokens::COLOR_SURFACE_BG_SUBTLE);
    v.widgets.noninteractive.bg_stroke =
        Stroke::new(1.0, to_color32(tokens::COLOR_SURFACE_BORDER_SUBTLE));
    v.widgets.noninteractive.fg_stroke =
        Stroke::new(1.0, to_color32(tokens::COLOR_TEXT_PRIMARY));

    // - inactive: button / interactive widget の rest
    v.widgets.inactive.bg_fill = to_color32(tokens::COLOR_SURFACE_BG_SUBTLE);
    v.widgets.inactive.weak_bg_fill = to_color32(tokens::COLOR_SURFACE_BG_SUBTLE);
    v.widgets.inactive.bg_stroke = Stroke::new(1.0, to_color32(tokens::COLOR_SURFACE_BORDER));
    v.widgets.inactive.fg_stroke =
        Stroke::new(1.0, to_color32(tokens::COLOR_TEXT_SECONDARY));

    // - hovered
    v.widgets.hovered.bg_fill = to_color32(tokens::COLOR_SURFACE_BG_EMPHASIS);
    v.widgets.hovered.weak_bg_fill = to_color32(tokens::COLOR_SURFACE_BG_EMPHASIS);
    v.widgets.hovered.bg_stroke =
        Stroke::new(1.0, to_color32(tokens::COLOR_BRAND_PRIMARY_HOVER));
    v.widgets.hovered.fg_stroke = Stroke::new(1.5, to_color32(tokens::COLOR_TEXT_PRIMARY));

    // - active (pressed / focused)
    v.widgets.active.bg_fill = to_color32(tokens::COLOR_SURFACE_SURFACE);
    v.widgets.active.weak_bg_fill = to_color32(tokens::COLOR_SURFACE_SURFACE);
    v.widgets.active.bg_stroke =
        Stroke::new(1.0, to_color32(tokens::COLOR_BRAND_PRIMARY_ACTIVE));
    v.widgets.active.fg_stroke = Stroke::new(2.0, to_color32(tokens::COLOR_TEXT_PRIMARY));

    // - open (combo box menu 等)
    v.widgets.open.bg_fill = to_color32(tokens::COLOR_SURFACE_SURFACE);
    v.widgets.open.weak_bg_fill = to_color32(tokens::COLOR_SURFACE_BG_EMPHASIS);
    v.widgets.open.bg_stroke = Stroke::new(1.0, to_color32(tokens::COLOR_SURFACE_BORDER));
    v.widgets.open.fg_stroke = Stroke::new(1.0, to_color32(tokens::COLOR_TEXT_PRIMARY));

    // Selection (テキスト選択 / list item 選択)
    v.selection.bg_fill = to_color32(tokens::COLOR_BRAND_PRIMARY_SUBTLE);
    v.selection.stroke = Stroke::new(1.0, to_color32(tokens::COLOR_BRAND_PRIMARY));

    // Hyperlink: semantic.info
    v.hyperlink_color = to_color32(tokens::COLOR_SEMANTIC_INFO);

    // Warn / Error text tint
    v.warn_fg_color = to_color32(tokens::COLOR_SEMANTIC_WARNING_TEXT);
    v.error_fg_color = to_color32(tokens::COLOR_SEMANTIC_ERROR_TEXT);

    v
}

/// [`creo_visuals`] を [`Context`] に適用する convenience helper。
///
/// `eframe` の `App::update` 先頭や `CreationContext` 初期化で 1 度呼ぶ想定。
pub fn apply_creo_theme(ctx: &Context) {
    ctx.set_visuals(creo_visuals());
}

/// 代表色 helper (brand / semantic の短縮名)。ratatui 側と同形の API を提供し、
/// consumer が both feature を有効にした時に mental model が揃うようにする。
pub mod palette {
    use super::to_color32;
    use crate::tokens;
    use egui::Color32;

    /// `color.brand.primary`
    #[inline]
    #[must_use]
    pub const fn brand_primary() -> Color32 {
        to_color32(tokens::COLOR_BRAND_PRIMARY)
    }
    /// `color.brand.secondary`
    #[inline]
    #[must_use]
    pub const fn brand_secondary() -> Color32 {
        to_color32(tokens::COLOR_BRAND_SECONDARY)
    }
    /// `color.semantic.success`
    #[inline]
    #[must_use]
    pub const fn success() -> Color32 {
        to_color32(tokens::COLOR_SEMANTIC_SUCCESS)
    }
    /// `color.semantic.warning`
    #[inline]
    #[must_use]
    pub const fn warning() -> Color32 {
        to_color32(tokens::COLOR_SEMANTIC_WARNING)
    }
    /// `color.semantic.error`
    #[inline]
    #[must_use]
    pub const fn error() -> Color32 {
        to_color32(tokens::COLOR_SEMANTIC_ERROR)
    }
    /// `color.semantic.info`
    #[inline]
    #[must_use]
    pub const fn info() -> Color32 {
        to_color32(tokens::COLOR_SEMANTIC_INFO)
    }
    /// `color.text.primary`
    #[inline]
    #[must_use]
    pub const fn text_primary() -> Color32 {
        to_color32(tokens::COLOR_TEXT_PRIMARY)
    }
    /// `color.text.secondary`
    #[inline]
    #[must_use]
    pub const fn text_secondary() -> Color32 {
        to_color32(tokens::COLOR_TEXT_SECONDARY)
    }
    /// `color.surface.bg-base`
    #[inline]
    #[must_use]
    pub const fn bg_base() -> Color32 {
        to_color32(tokens::COLOR_SURFACE_BG_BASE)
    }
    /// `color.surface.surface`
    #[inline]
    #[must_use]
    pub const fn surface() -> Color32 {
        to_color32(tokens::COLOR_SURFACE_SURFACE)
    }
}
