/**
 * creo-ui-frame — 3D Frame system runtime
 *
 * 現在 P-2 (motion engine) のみ ship。 FrameProvider / FrameSlot は P-3 で実装。
 * 詳細は ../README.md と docs/design/frame-system.md。
 */

// Re-export motion engine for convenience (`creo-ui-frame` direct import も可)
export * from './motion/index'
