//! creo-ui
//!
//! Creo UI Design System tokens for Rust consumers.
//!
//! Phase 0: 空の stub。
//! Phase 1 で `generated/tokens.rs` (Style Dictionary output) を include する。

#![forbid(unsafe_code)]

pub const VERSION: &str = "0.0.0";

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn version_is_set() {
        assert_eq!(VERSION, "0.0.0");
    }
}
