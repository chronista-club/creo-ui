// CreoUI — Button component (SwiftUI)
//
// CSS `.creo-btn` の Swift/SwiftUI 版。variant (primary/secondary/ghost) と
// size (sm/md/lg) を type-safe に表現。Apple HIG 44pt tap target を md/lg で
// 自動満たす。
//
// Usage:
//   CreoButton("保存", variant: .primary) { save() }
//   CreoButton("Small", variant: .secondary, size: .sm) { ... }
//   CreoButton.icon("✕", variant: .ghost, size: .sm) { dismiss() }

import SwiftUI

public enum CreoButtonVariant: String, CaseIterable, Sendable {
    case primary
    case secondary
    case ghost
}

public enum CreoButtonSize: String, CaseIterable, Sendable {
    case sm
    case md
    case lg
}

public struct CreoButton<Label: View>: View {
    let variant: CreoButtonVariant
    let size: CreoButtonSize
    let action: () -> Void
    let label: Label
    @Environment(\.isEnabled) private var isEnabled

    public init(
        variant: CreoButtonVariant = .primary,
        size: CreoButtonSize = .md,
        action: @escaping () -> Void,
        @ViewBuilder label: () -> Label
    ) {
        self.variant = variant
        self.size = size
        self.action = action
        self.label = label()
    }

    public var body: some View {
        Button(action: action) {
            label
                .font(.system(size: fontSize, weight: .medium))
                .foregroundColor(foregroundColor)
                .frame(minHeight: minHeight)
                .padding(.horizontal, paddingHorizontal)
                .padding(.vertical, paddingVertical)
                .background(backgroundColor)
                .overlay(
                    RoundedRectangle(cornerRadius: cornerRadius)
                        .stroke(borderColor, lineWidth: borderWidth)
                )
                .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
                .opacity(isEnabled ? 1.0 : 0.5)
        }
        .buttonStyle(.plain)
        .disabled(!isEnabled)
    }

    // MARK: - Style resolvers (token-driven)

    private var fontSize: CGFloat {
        switch size {
        case .sm: return CreoUITokens.typographySizeSm
        case .md: return CreoUITokens.typographySizeMd
        case .lg: return CreoUITokens.typographySizeLg
        }
    }

    private var minHeight: CGFloat {
        switch size {
        case .sm: return CreoUITokens.layoutTargetFocus
        case .md: return CreoUITokens.layoutTargetTap
        case .lg: return CreoUITokens.layoutTargetTap * 1.15
        }
    }

    private var paddingHorizontal: CGFloat {
        switch size {
        case .sm: return CreoUITokens.spacingS
        case .md: return CreoUITokens.spacingM
        case .lg: return CreoUITokens.spacingL
        }
    }

    private var paddingVertical: CGFloat {
        switch size {
        case .sm: return CreoUITokens.spacingXs
        case .md: return CreoUITokens.spacingS
        case .lg: return CreoUITokens.spacingM
        }
    }

    private var cornerRadius: CGFloat {
        switch size {
        case .sm: return CreoUITokens.radiusXs
        case .md: return CreoUITokens.radiusSm
        case .lg: return CreoUITokens.radiusMd
        }
    }

    private var backgroundColor: Color {
        switch variant {
        case .primary: return .colorBrandPrimary
        case .secondary: return .colorSurfaceSurface
        case .ghost: return .clear
        }
    }

    private var foregroundColor: Color {
        switch variant {
        case .primary: return .colorSurfaceBgBase
        case .secondary, .ghost: return .colorTextPrimary
        }
    }

    private var borderColor: Color {
        switch variant {
        case .primary: return .colorBrandPrimary
        case .secondary: return .colorSurfaceBorder
        case .ghost: return .clear
        }
    }

    private var borderWidth: CGFloat {
        variant == .ghost ? 0 : 1
    }
}

// MARK: - Text convenience init

public extension CreoButton where Label == Text {
    init(
        _ title: String,
        variant: CreoButtonVariant = .primary,
        size: CreoButtonSize = .md,
        action: @escaping () -> Void
    ) {
        self.init(variant: variant, size: size, action: action) {
            Text(title)
        }
    }
}
