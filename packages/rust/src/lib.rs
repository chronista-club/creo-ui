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
//! let md = tokens::SPACING_M;             // 18.0_f32 (論理 px, 5-step rule)
//! ```
//!
//! ## dimension token は「論理 px」— 生描画では [`Scale`] を掛ける
//!
//! dimension 系 token (`SPACING_*` / `TYPOGRAPHY_*` / `RADIUS_*` 等) の f32 は
//! **論理 px** — CSS px / SwiftUI pt と同じ土俵の値で、「同じ数字なら 3 platform で
//! 同じ見た目の大きさ」が既定の契約。論理→物理の変換は platform ごとに担当が違う:
//!
//! | platform | 変換の担当 |
//! |---|---|
//! | Web | browser (creo-ui は rem で emit、user 設定にも追従) |
//! | SwiftUI | OS (pt をそのまま渡せばよい) |
//! | Rust 生描画 (wgpu / glyphon 等) | **consumer — [`Scale`] を掛ける** |
//!
//! wgpu の surface は物理ピクセルなので、token 値を素で渡すと Retina (2x) で
//! 見た目が半分になる。window の scale factor (winit `window.scale_factor()` /
//! AppKit `NSView.backingScaleFactor`) から [`Scale`] を作り、描画直前に通すこと。
//! ratatui のようにセル単位の描画系では無関係 (色 / 比率 token のみ使う)。
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

/// 表示 scale — 論理 px の token 値を物理 px へ変換する倍率。
///
/// creo-ui の dimension token は **論理 px** ([crate docs](crate) の契約表参照)。
/// wgpu / glyphon のような物理ピクセル基準の生描画では、window の scale factor を
/// ここに包んで描画直前に [`Scale::px`] を通す:
///
/// ```
/// use creo_ui::{tokens, Scale};
///
/// let scale = Scale::new(2.0); // 例: Retina。実際は window.scale_factor() 等から
/// let font_px = scale.px(tokens::TYPOGRAPHY_SIZE_M); // 論理 px → 物理 px (2 倍)
/// assert_eq!(font_px, tokens::TYPOGRAPHY_SIZE_M * 2.0);
/// ```
///
/// glyphon なら `TextArea.scale` にそのまま factor を渡す手もある。padding や
/// 配置座標など layout 値も論理で組み、同じ [`Scale`] を通すこと (文字だけ
/// 掛けると余白と釣り合いが崩れる)。
///
/// `Default` は意図的に実装しない — 「黙って 1.0」は Retina で半分サイズになる
/// bug (scale 掛け忘れ) をそのまま既定化してしまうため、factor は常に明示する。
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Scale(pub f32);

impl Scale {
    /// 等倍 (非 HiDPI)。テストや scale 非対応環境での明示的な選択肢。
    pub const ONE: Scale = Scale(1.0);

    /// window / surface の scale factor から作る。
    /// winit: `window.scale_factor()` / AppKit: `NSView.backingScaleFactor`。
    pub fn new(factor: f64) -> Scale {
        Scale(factor as f32)
    }

    /// 論理 px の dimension token を物理 px へ。
    pub fn px(self, logical: f32) -> f32 {
        logical * self.0
    }
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

    #[test]
    fn scale_one_is_identity() {
        assert_eq!(Scale::ONE.px(tokens::TYPOGRAPHY_SIZE_M), tokens::TYPOGRAPHY_SIZE_M);
    }

    #[test]
    fn scale_doubles_on_retina() {
        // MacBook Air (2x) で論理 px の本文が 2 倍の物理 px で描かれる。
        // これを掛け忘れると「見た目半分」(ladyland cortex-gpu で実際に起きた)。
        // token の具体値には依存させない — 梯子は Editor 実測で改定されうる
        let retina = Scale::new(2.0);
        assert_eq!(retina.px(10.0), 20.0);
        assert_eq!(retina.px(tokens::TYPOGRAPHY_SIZE_M), tokens::TYPOGRAPHY_SIZE_M * 2.0);
    }
}
