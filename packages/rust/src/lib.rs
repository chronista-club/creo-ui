//! creo-ui
//!
//! Creo UI Design System tokens for Rust consumers.
//!
//! Phase 1: Style Dictionary から生成された token module を再 export する。
//!
//! ```ignore
//! use creo_ui::tokens;
//!
//! let brand = tokens::COLOR_BRAND_PRIMARY; // Rgb (mint-dark default)
//! let md = tokens::SPACING_MD;             // 18.0_f32 (px, 5-step rule)
//! ```
//!
//! Phase 2 以降で ratatui / egui 等のヘルパー trait を追加する予定。

#![forbid(unsafe_code)]

pub const VERSION: &str = "0.1.0";

#[allow(dead_code)]
pub mod tokens {
    include!("generated/tokens.rs");
}

// ratatui interop — opt-in via `features = ["ratatui"]`
#[cfg(feature = "ratatui")]
pub mod ratatui;

// egui interop — opt-in via `features = ["egui"]`
#[cfg(feature = "egui")]
pub mod egui;

// iced / dioxus は skeleton (feature gate のみ、実装は将来 issue)

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn version_is_set() {
        assert_eq!(VERSION, "0.1.0");
    }

    #[test]
    fn brand_primary_is_mint_green_family() {
        // mint-dark brand primary (theme system default)、値そのものは theme が
        // 変わったら追従させる必要があるので "green 帯" の smoke check に留める。
        let c = tokens::COLOR_BRAND_PRIMARY;
        assert!(c.g > c.r && c.g > c.b, "brand primary should be green-dominant");
        assert!(c.g > 150, "brand primary green channel should be high for mint");
    }

    #[test]
    fn spacing_md_is_18px() {
        // 5-step size-feel rule (2026-04-22): md is the middle of xs/sm/md/lg/xl
        assert_eq!(tokens::SPACING_MD, 18.0_f32);
    }

    #[test]
    fn margin_md_matches_spacing_md() {
        // Creo UI 規約: 同じ "medium" は spacing.md と margin.md を揃える
        assert_eq!(tokens::MARGIN_MD, tokens::SPACING_MD);
    }

    #[test]
    fn layout_target_tap_is_44pt() {
        // Apple HIG minimum tap target
        assert_eq!(tokens::LAYOUT_TARGET_TAP, 44.0_f32);
    }

    #[test]
    fn radius_full_is_pill() {
        assert_eq!(tokens::RADIUS_FULL, 9999.0_f32);
    }
}
