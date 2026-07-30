// CreoUI — .creoText() modifier
//
// CreoTextStyle を view に適用する。consumer の書き味:
//
//   Text("保存しました").creoText(.bodyEmphasis)
//   Text("h2 見出し").creoText(.titleSection)
//
// 一元化している 2 点 (手組みでは毎回ズレるところ):
//   1. Dynamic Type — @ScaledMetric(relativeTo:) で size を scaling。
//      .font(.system(size:)) 直書きは固定 pt になり accessibility 設定に追従しない
//   2. line-height — CSS の倍率 token (1.25 / 1.5 / 1.75) を SwiftUI の
//      lineSpacing (行間の追加分) に換算。system font の実 line height を
//      platform font metrics (UIFont / NSFont) から引いて差分だけ足す

import SwiftUI

#if canImport(UIKit)
    import UIKit
#elseif canImport(AppKit)
    import AppKit
#endif

public struct CreoTextModifier: ViewModifier {
    private let style: CreoTextStyle
    @ScaledMetric private var scaledSize: CGFloat

    public init(_ style: CreoTextStyle) {
        self.style = style
        _scaledSize = ScaledMetric(wrappedValue: style.size, relativeTo: style.relativeTo)
    }

    public func body(content: Content) -> some View {
        content
            .font(.system(size: scaledSize, weight: style.weight))
            .lineSpacing(extraLineSpacing)
    }

    /// 目標 line height (倍率 × size) と system font の実 line height の差分。
    /// system font は既に ~1.2 倍相当の leading を内包しているので、倍率をそのまま
    /// lineSpacing に足すと行間が過剰になる — 差分だけ足すのが正しい換算
    private var extraLineSpacing: CGFloat {
        max(0, style.lineHeight * scaledSize - Self.systemLineHeight(ofSize: scaledSize))
    }

    static func systemLineHeight(ofSize size: CGFloat) -> CGFloat {
        #if canImport(UIKit)
            return UIFont.systemFont(ofSize: size).lineHeight
        #elseif canImport(AppKit)
            let font = NSFont.systemFont(ofSize: size)
            return font.ascender - font.descender + font.leading
        #else
            return size * 1.2
        #endif
    }
}

public extension View {
    /// typography token を役割 (CreoTextStyle) で適用する
    func creoText(_ style: CreoTextStyle) -> some View {
        modifier(CreoTextModifier(style))
    }
}
