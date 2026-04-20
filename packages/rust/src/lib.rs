//! creo-ui
//!
//! Creo UI Design System tokens for Rust consumers.
//!
//! Phase 1: Style Dictionary から生成された token module を再 export する。
//!
//! ```ignore
//! use creo_ui::tokens;
//!
//! let brand = tokens::COLOR_BRAND_PRIMARY; // Rgb { r: 115, g: 231, b: 170 }
//! let md = tokens::SPACING_MD;             // 16.0_f32 (px)
//! ```
//!
//! Phase 2 以降で ratatui / egui 等のヘルパー trait を追加する予定。

#![forbid(unsafe_code)]

pub const VERSION: &str = "0.0.1";

#[allow(dead_code)]
pub mod tokens {
    include!("generated/tokens.rs");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn version_is_set() {
        assert_eq!(VERSION, "0.0.1");
    }

    #[test]
    fn brand_primary_is_mint_green() {
        // #73e7aa
        assert_eq!(tokens::COLOR_BRAND_PRIMARY, tokens::Rgb::new(115, 231, 170));
    }

    #[test]
    fn spacing_md_is_16px() {
        assert_eq!(tokens::SPACING_MD, 16.0_f32);
    }

    #[test]
    fn radius_full_is_pill() {
        assert_eq!(tokens::RADIUS_FULL, 9999.0_f32);
    }
}
