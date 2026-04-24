// CreoUI — Badge component (SwiftUI)
//
// CSS `.creo-badge` の SwiftUI 版。短い status / count / tag 表示。Rail activity badge
// (CREO-107) 等で使用。
//
// Usage:
//   CreoBadge("Active", variant: .success)
//   CreoBadge("3", variant: .error, size: .sm)
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
    case sm
    case md
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

    public init(
        _ text: String,
        variant: CreoBadgeVariant = .neutral,
        size: CreoBadgeSize = .md,
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
        size == .sm ? CreoUITokens.typographySizeXs : CreoUITokens.typographySizeSm
    }

    private var verticalPadding: CGFloat {
        size == .sm ? 1 : 2
    }

    private var cornerRadius: CGFloat {
        switch shape {
        case .pill: return CreoUITokens.radiusFull
        case .square: return CreoUITokens.radiusXs
        }
    }

    private var backgroundColor: Color {
        switch variant {
        case .neutral: return Color.colorSurfaceBgSubtle
        case .brand: return Color.colorBrandPrimarySubtle
        case .success: return Color.colorSemanticSuccess.opacity(0.2)
        case .warning: return Color.colorSemanticWarning.opacity(0.2)
        case .error: return Color.colorSemanticError.opacity(0.2)
        case .info: return Color.colorSemanticInfo.opacity(0.2)
        }
    }

    private var foregroundColor: Color {
        switch variant {
        case .neutral: return .colorTextSecondary
        case .brand: return .colorBrandPrimary
        case .success: return .colorSemanticSuccess
        case .warning: return .colorSemanticWarning
        case .error: return .colorSemanticError
        case .info: return .colorSemanticInfo
        }
    }
}
