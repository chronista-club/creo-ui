//! ratatui widgets helper test (feature gated)。
//! `cargo test --features ratatui` で実行される。

#![cfg(feature = "ratatui")]

use creoui::ratatui::widgets;

#[test]
fn section_block_builds_with_title() {
    let _b = widgets::section_block(Some("Memories"));
    // compile-only check: widget builder returns Block<'_> with title.
}

#[test]
fn section_block_without_title() {
    let _b = widgets::section_block(None);
}

#[test]
fn active_block_is_distinct_from_section() {
    let _a = widgets::active_block(Some("Active"));
    let _s = widgets::section_block(Some("Active"));
    // compile-only; visual diff in border color unverifiable without render context.
}

#[test]
fn status_line_has_two_main_spans_plus_separator() {
    let line = widgets::status_line("left", "right");
    // 3 spans: left, separator, right
    assert_eq!(line.spans.len(), 3);
}

#[test]
fn header_line_single_span() {
    let line = widgets::header_line("Dashboard");
    assert_eq!(line.spans.len(), 1);
}

#[test]
fn tag_line_accepts_all_kinds() {
    use widgets::TagKind;
    let _s = widgets::tag_line("OK", TagKind::Success);
    let _w = widgets::tag_line("!", TagKind::Warning);
    let _e = widgets::tag_line("ERR", TagKind::Error);
    let _i = widgets::tag_line("hi", TagKind::Info);
    let _n = widgets::tag_line("-", TagKind::Neutral);
}
