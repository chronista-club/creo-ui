/**
 * creo-ui-frame — 3D Frame system runtime
 *
 * P-2 (motion engine) + P-3 (Frame protocol) Ship 済。
 * 詳細は ../README.md と docs/design/frame-system.md。
 */

// Frame protocol — primary API (FrameProvider / FrameSlot / setFrame / Frame schema)
export * from './frame/index'

// Motion engine — Frame protocol が内部で使う、 consumer も直接呼べる
export * from './motion/index'

// Timeline — t を中心にした入れ子のアニメーション (Clip の木 + 時計 1 つ + 時間軸の表示)
export * from './timeline/index'
