// CreoUI — Badge component (SwiftUI)
//
// CSS `.creo-badge` の SwiftUI 版。短い status / count / tag 表示。Rail activity badge
// (CREO-107) 等で使用。
//
// Usage:
//   CreoBadge("Active", variant: .success)
//   CreoBadge("3", variant: .error, size: .s)
//   CreoBadge("Beta", variant: .brand, shape: .square)

import SwiftUI

public enum CreoBadgeVariant: String, CaseIterable, Sendable {
    case neutral
    case brand
    case success
    case warning
    case error
    case info
}

public enum CreoBadgeSize: String, CaseIterable, Sendable {
    case s
    case m
}

public enum CreoBadgeShape: String, CaseIterable, Sendable {
    case pill
    case square
}

public struct CreoBadge: View {
    let text: String
    let variant: CreoBadgeVariant
    let size: CreoBadgeSize
    let shape: CreoBadgeShape
    @Environment(\.creoTheme) private var theme

    public init(
        _ text: String,
        variant: CreoBadgeVariant = .neutral,
        size: CreoBadgeSize = .m,
        shape: CreoBadgeShape = .pill
    ) {
        self.text = text
        self.variant = variant
        self.size = size
        self.shape = shape
    }

    public var body: some View {
        Text(text)
            .font(.system(size: fontSize, weight: .medium))
            .foregroundColor(foregroundColor)
            .padding(.horizontal, CreoUITokens.spacingXs)
            .padding(.vertical, verticalPadding)
            .background(backgroundColor)
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .lineLimit(1)
            .fixedSize(horizontal: true, vertical: false)
    }

    // MARK: - Style resolvers

    private var fontSize: CGFloat {
        size == .s ? CreoUITokens.typographySizeXs : CreoUITokens.typographySizeS
    }

    private var verticalPadding: CGFloat {
        size == .s ? 1 : 2
    }

    private var cornerRadius: CGFloat {
        switch shape {
        case .pill: return CreoUITokens.radiusFull
        case .square: return CreoUITokens.radiusXs
        }
    }

    private var backgroundColor: Color {
        switch variant {
        case .neutral: return theme.surfaceBgSubtle
        case .brand: return theme.brandPrimarySubtle
        case .success: return theme.semanticSuccess.opacity(0.2)
        case .warning: return theme.semanticWarning.opacity(0.2)
        case .error: return theme.semanticError.opacity(0.2)
        case .info: return theme.semanticInfo.opacity(0.2)
        }
    }

    private var foregroundColor: Color {
        switch variant {
        case .neutral: return theme.textSecondary
        case .brand: return theme.brandPrimary
        case .success: return theme.semanticSuccess
        case .warning: return theme.semanticWarning
        case .error: return theme.semanticError
        case .info: return theme.semanticInfo
        }
    }
}
