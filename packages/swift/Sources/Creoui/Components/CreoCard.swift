// Creoui — Card component (SwiftUI)
//
// CSS `.creo-card` の SwiftUI 版。variant (default/elevated/outlined) と
// padding (sm/md/lg) を type-safe に表現。
//
// Usage:
//   CreoCard {
//       VStack { Text("Title"); Text("Body") }
//   }
//   CreoCard(variant: .elevated, padding: .lg) { ... }

import SwiftUI

public enum CreoCardVariant: String, CaseIterable, Sendable {
    case `default`
    case elevated
    case outlined
}

public enum CreoCardPadding: String, CaseIterable, Sendable {
    case sm
    case md
    case lg
}

public struct CreoCard<Content: View>: View {
    let variant: CreoCardVariant
    let padding: CreoCardPadding
    let content: Content

    public init(
        variant: CreoCardVariant = .default,
        padding: CreoCardPadding = .md,
        @ViewBuilder content: () -> Content
    ) {
        self.variant = variant
        self.padding = padding
        self.content = content()
    }

    public var body: some View {
        content
            .padding(paddingValue)
            .background(backgroundColor)
            .overlay(
                RoundedRectangle(cornerRadius: CreouiTokens.radiusM)
                    .stroke(borderColor, lineWidth: borderWidth)
            )
            .clipShape(RoundedRectangle(cornerRadius: CreouiTokens.radiusM))
            .shadow(color: shadowColor, radius: shadowRadius, x: 0, y: shadowY)
    }

    // MARK: - Style resolvers

    private var paddingValue: CGFloat {
        switch padding {
        case .sm: return CreouiTokens.spacingS
        case .md: return CreouiTokens.spacingM
        case .lg: return CreouiTokens.spacingL
        }
    }

    private var backgroundColor: Color {
        switch variant {
        case .default, .elevated: return .colorSurfaceSurface
        case .outlined: return .clear
        }
    }

    private var borderColor: Color {
        switch variant {
        case .default, .outlined: return .colorSurfaceBorder
        case .elevated: return .clear
        }
    }

    private var borderWidth: CGFloat {
        switch variant {
        case .default: return 1.0
        case .outlined: return 1.5
        case .elevated: return 0
        }
    }

    // SwiftUI の shadow は素朴に近似 (iOS/macOS の blur 値)
    private var shadowColor: Color {
        switch variant {
        case .default: return .black.opacity(0.06)
        case .elevated: return .black.opacity(0.12)
        case .outlined: return .clear
        }
    }

    private var shadowRadius: CGFloat {
        switch variant {
        case .default: return 2
        case .elevated: return 8
        case .outlined: return 0
        }
    }

    private var shadowY: CGFloat {
        switch variant {
        case .default: return 1
        case .elevated: return 4
        case .outlined: return 0
        }
    }
}
