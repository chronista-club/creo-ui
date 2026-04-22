//! ratatui (TUI) interop layer.
//!
//! Creo UI tokens → `ratatui::Color` 変換 helper を提供。TUI は「色」と
//! 「text style (bold / italic / underline 等)」のみ意味を持つので、spacing /
//! shadow 系 token はここでは扱わない (character cell 単位の padding helper
//! は [`pad`] 以下で別途提供)。
//!
//! ## Feature flag
//! `creo-ui = { features = ["ratatui"] }` で有効化。
//!
//! ## 使用例
//!
//! ```ignore
//! use creo_ui::ratatui as creo_rat;
//! use creo_ui::tokens;
//!
//! let title_style = ratatui::style::Style::default()
//!     .fg(creo_rat::color(tokens::COLOR_BRAND_PRIMARY))
//!     .add_modifier(ratatui::style::Modifier::BOLD);
//! ```

use crate::tokens::Rgb;
use ratatui::style::Color;

/// Creo UI の [`Rgb`] を ratatui の [`Color::Rgb`] に変換する。
#[inline]
#[must_use]
pub fn color(rgb: Rgb) -> Color {
    Color::Rgb(rgb.r, rgb.g, rgb.b)
}

/// Style 作成ヘルパー。前景色を brand.primary に set、bold を add する等の典型パターン。
///
/// ```ignore
/// let s = creo_ui::ratatui::style()
///     .fg(creo_ui::ratatui::color(creo_ui::tokens::COLOR_BRAND_PRIMARY));
/// ```
#[inline]
#[must_use]
pub fn style() -> ratatui::style::Style {
    ratatui::style::Style::default()
}

/// Character cell 単位の padding helper (spacing token を「文字数」として解釈)。
///
/// token は px 単位なので、`round(px / 8)` で character cell に近似する (典型 font
/// の advance を 8px 仮定)。consumer は自分の cell size で割り直すこともできる。
pub mod pad {
    /// `spacing-xs` (4px) → ~0 cell
    #[inline]
    #[must_use]
    pub const fn xs() -> u16 {
        cells(crate::tokens::SPACING_XS)
    }
    /// `spacing-sm` (8px) → ~1 cell
    #[inline]
    #[must_use]
    pub const fn sm() -> u16 {
        cells(crate::tokens::SPACING_SM)
    }
    /// `spacing-md` (18px) → ~2 cell
    #[inline]
    #[must_use]
    pub const fn md() -> u16 {
        cells(crate::tokens::SPACING_MD)
    }
    /// `spacing-lg` (24px) → ~3 cell
    #[inline]
    #[must_use]
    pub const fn lg() -> u16 {
        cells(crate::tokens::SPACING_LG)
    }
    /// `spacing-xl` (32px) → ~4 cell
    #[inline]
    #[must_use]
    pub const fn xl() -> u16 {
        cells(crate::tokens::SPACING_XL)
    }

    /// px 値を character cell 数に変換 (8px/cell 仮定、round down)。
    #[inline]
    #[must_use]
    const fn cells(px: f32) -> u16 {
        (px / 8.0) as u16
    }
}

/// 代表色 helper (brand / semantic の短縮名)。
pub mod palette {
    use super::color;
    use crate::tokens;
    use ratatui::style::Color;

    /// `color.brand.primary`
    #[inline]
    #[must_use]
    pub fn brand_primary() -> Color {
        color(tokens::COLOR_BRAND_PRIMARY)
    }
    /// `color.brand.secondary`
    #[inline]
    #[must_use]
    pub fn brand_secondary() -> Color {
        color(tokens::COLOR_BRAND_SECONDARY)
    }
    /// `color.semantic.success`
    #[inline]
    #[must_use]
    pub fn success() -> Color {
        color(tokens::COLOR_SEMANTIC_SUCCESS)
    }
    /// `color.semantic.warning`
    #[inline]
    #[must_use]
    pub fn warning() -> Color {
        color(tokens::COLOR_SEMANTIC_WARNING)
    }
    /// `color.semantic.error`
    #[inline]
    #[must_use]
    pub fn error() -> Color {
        color(tokens::COLOR_SEMANTIC_ERROR)
    }
    /// `color.text.primary`
    #[inline]
    #[must_use]
    pub fn text_primary() -> Color {
        color(tokens::COLOR_TEXT_PRIMARY)
    }
    /// `color.text.secondary`
    #[inline]
    #[must_use]
    pub fn text_secondary() -> Color {
        color(tokens::COLOR_TEXT_SECONDARY)
    }
    /// `color.surface.bg-base`
    #[inline]
    #[must_use]
    pub fn bg_base() -> Color {
        color(tokens::COLOR_SURFACE_BG_BASE)
    }
}
