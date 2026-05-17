//! ratatui (TUI) interop layer.
//!
//! creoui tokens → `ratatui::Color` 変換 helper を提供。TUI は「色」と
//! 「text style (bold / italic / underline 等)」のみ意味を持つので、spacing /
//! shadow 系 token はここでは扱わない (character cell 単位の padding helper
//! は [`pad`] 以下で別途提供)。
//!
//! ## Feature flag
//! `creoui = { features = ["ratatui"] }` で有効化。
//!
//! ## 使用例
//!
//! ```ignore
//! use creoui::ratatui as creo_rat;
//! use creoui::tokens;
//!
//! let title_style = ratatui::style::Style::default()
//!     .fg(creo_rat::color(tokens::COLOR_BRAND_PRIMARY))
//!     .add_modifier(ratatui::style::Modifier::BOLD);
//! ```

use crate::tokens::Rgb;
use ratatui::style::Color;

/// creoui の [`Rgb`] を ratatui の [`Color::Rgb`] に変換する。
#[inline]
#[must_use]
pub fn color(rgb: Rgb) -> Color {
    Color::Rgb(rgb.r, rgb.g, rgb.b)
}

/// Style 作成ヘルパー。前景色を brand.primary に set、bold を add する等の典型パターン。
///
/// ```ignore
/// let s = creoui::ratatui::style()
///     .fg(creoui::ratatui::color(creoui::tokens::COLOR_BRAND_PRIMARY));
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
        cells(crate::tokens::SPACING_S)
    }
    /// `spacing-md` (18px) → ~2 cell
    #[inline]
    #[must_use]
    pub const fn md() -> u16 {
        cells(crate::tokens::SPACING_M)
    }
    /// `spacing-lg` (24px) → ~3 cell
    #[inline]
    #[must_use]
    pub const fn lg() -> u16 {
        cells(crate::tokens::SPACING_L)
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

/// Preset widget builders。VP TUI / 他 ratatui consumer で Block / Paragraph / Tabs 等の
/// 頻出パターンを token 経由で 1 行で生成できる helper 群。
pub mod widgets {
    use super::{color, palette};
    use crate::tokens;
    use ratatui::style::{Modifier, Style};
    use ratatui::text::{Line, Span};
    use ratatui::widgets::{Block, Borders, Padding};

    /// VP pane / section の標準 Block。
    ///
    /// - border: rounded、surface.border 色
    /// - padding: 1 cell (inner breathing)
    /// - title (optional): bold + text.primary
    ///
    /// ```ignore
    /// use creoui::ratatui::widgets;
    /// let area_block = widgets::section_block(Some("Memories"));
    /// ```
    #[must_use]
    pub fn section_block(title: Option<&str>) -> Block<'_> {
        let mut block = Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(color(tokens::COLOR_SURFACE_BORDER)))
            .padding(Padding::uniform(1));
        if let Some(t) = title {
            block = block.title(Span::styled(
                t,
                Style::default()
                    .fg(color(tokens::COLOR_TEXT_PRIMARY))
                    .add_modifier(Modifier::BOLD),
            ));
        }
        block
    }

    /// 前面強調 Block (現在アクティブ pane 等)。
    /// border 色を brand.primary に、title を brand 色で。
    #[must_use]
    pub fn active_block(title: Option<&str>) -> Block<'_> {
        let mut block = Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(palette::brand_primary()))
            .padding(Padding::uniform(1));
        if let Some(t) = title {
            block = block.title(Span::styled(
                t,
                Style::default()
                    .fg(palette::brand_primary())
                    .add_modifier(Modifier::BOLD),
            ));
        }
        block
    }

    /// Subtle な area (log / quiet panel)。border 色を sub,text.secondary で柔らかく。
    #[must_use]
    pub fn subtle_block(title: Option<&str>) -> Block<'_> {
        let mut block = Block::default()
            .borders(Borders::ALL)
            .border_style(Style::default().fg(palette::text_secondary()))
            .padding(Padding::horizontal(1));
        if let Some(t) = title {
            block = block.title(Span::styled(
                t,
                Style::default().fg(palette::text_secondary()),
            ));
        }
        block
    }

    /// Status line helper。左 / 右 の 2 カラム構成 Line を生成する。
    /// 色は text.secondary 基調で、中央は spacer 展開を consumer 側で。
    ///
    /// ```ignore
    /// let status = widgets::status_line("project-creoui", "active · 2m ago");
    /// ```
    #[must_use]
    pub fn status_line<'a>(left: &'a str, right: &'a str) -> Line<'a> {
        Line::from(vec![
            Span::styled(left, Style::default().fg(palette::text_secondary())),
            Span::raw("  ·  "),
            Span::styled(
                right,
                Style::default()
                    .fg(palette::text_secondary())
                    .add_modifier(Modifier::DIM),
            ),
        ])
    }

    /// Header line (pane top bar 等の強調 title line)。
    #[must_use]
    pub fn header_line(text: &str) -> Line<'_> {
        Line::from(vec![Span::styled(
            text,
            Style::default()
                .fg(palette::brand_primary())
                .add_modifier(Modifier::BOLD),
        )])
    }

    /// Semantic tag line (success / warning / error).
    /// 小さな text 断片にタグ風の前景色を当てる。
    #[must_use]
    pub fn tag_line<'a>(label: &'a str, kind: TagKind) -> Line<'a> {
        let c = match kind {
            TagKind::Success => palette::success(),
            TagKind::Warning => palette::warning(),
            TagKind::Error => palette::error(),
            TagKind::Info => color(tokens::COLOR_SEMANTIC_INFO),
            TagKind::Neutral => palette::text_secondary(),
        };
        Line::from(vec![Span::styled(
            label,
            Style::default().fg(c).add_modifier(Modifier::BOLD),
        )])
    }

    /// [`tag_line`] の種別。
    #[derive(Debug, Clone, Copy, PartialEq, Eq)]
    pub enum TagKind {
        Success,
        Warning,
        Error,
        Info,
        Neutral,
    }
}
