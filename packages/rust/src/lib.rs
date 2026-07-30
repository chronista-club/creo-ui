//! creo-ui
//!
//! creo-ui Design System tokens for Rust consumers.
//!
//! Phase 1: Style Dictionary から生成された token module を再 export する。
//!
//! ```ignore
//! use creo_ui::tokens;
//!
//! let brand = tokens::COLOR_BRAND_PRIMARY; // Rgb (mint-dark default)
//! let md = tokens::SPACING_M;             // 18.0_f32 (px, 5-step rule)
//! ```
//!
//! Phase 2 以降で ratatui / egui 等のヘルパー trait を追加する予定。

#![forbid(unsafe_code)]

// Cargo.toml の version を SSOT にする (手書き定数は 0.3.0 で止まったまま
// Cargo 側が 0.7.0 まで進む drift を起こしていた — ladyland feedback 補足と同類)
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

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
    fn version_tracks_cargo_manifest() {
        assert_eq!(VERSION, env!("CARGO_PKG_VERSION"));
    }

    #[test]
    fn scrim_preserves_alpha() {
        // 旧実装は alpha を落とし scrim が不透明の純黒だった (swift #11 と同根、
        // rust-v0.8.0 で根治)。40% → 102、50% → 128 (× 255 round)
        let scrim = tokens::COLOR_SURFACE_SCRIM;
        assert_eq!((scrim.r, scrim.g, scrim.b, scrim.a), (0, 0, 0, 102));
        assert_eq!(tokens::COLOR_SURFACE_SCRIM_MODAL.a, 128);
    }

    #[test]
    fn opaque_colors_have_full_alpha() {
        assert_eq!(tokens::COLOR_BRAND_PRIMARY.a, 255);
        assert_eq!(tokens::COLOR_TEXT_PRIMARY.a, 255);
    }

    #[test]
    fn alpha_f32_converts_to_unit_range() {
        assert_eq!(tokens::COLOR_BRAND_PRIMARY.alpha_f32(), 1.0);
        let a = tokens::COLOR_SURFACE_SCRIM.alpha_f32();
        assert!((a - 0.4).abs() < 0.01, "scrim alpha_f32 = {a} should be ~0.4");
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
        assert_eq!(tokens::SPACING_M, 18.0_f32);
    }

    #[test]
    fn margin_md_matches_spacing_md() {
        // creo-ui 規約: 同じ "medium" は spacing.md と margin.md を揃える
        assert_eq!(tokens::MARGIN_M, tokens::SPACING_M);
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
