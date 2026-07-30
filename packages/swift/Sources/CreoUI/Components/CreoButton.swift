// CreoUI — Button component (SwiftUI)
//
// CSS `.creo-btn` の Swift/SwiftUI 版。variant (primary/secondary/ghost) と
// size (s/m/l) を type-safe に表現。Apple HIG 44pt tap target を m/l で
// 自動満たす。
//
// Usage:
//   CreoButton("保存", variant: .primary) { save() }
//   CreoButton("Small", variant: .secondary, size: .s) { ... }
//   CreoButton.icon("✕", variant: .ghost, size: .s) { dismiss() }

import SwiftUI

public enum CreoButtonVariant: String, CaseIterable, Sendable {
    case primary
    case secondary
    case ghost
}

public enum CreoButtonSize: String, CaseIterable, Sendable {
    case s
    case m
    case l
}

public struct CreoButton<Label: View>: View {
    let variant: CreoButtonVariant
    let size: CreoButtonSize
    let action: () -> Void
    let label: Label
    @Environment(\.isEnabled) private var isEnabled
    @Environment(\.creoTheme) private var theme

    public init(
        variant: CreoButtonVariant = .primary,
        size: CreoButtonSize = .m,
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
        case .s: return CreoUITokens.typographySizeS
        case .m: return CreoUITokens.typographySizeM
        case .l: return CreoUITokens.typographySizeL
        }
    }

    private var minHeight: CGFloat {
        switch size {
        case .s: return CreoUITokens.layoutTargetFocus
        case .m: return CreoUITokens.layoutTargetTap
        case .l: return CreoUITokens.layoutTargetTap * 1.15
        }
    }

    private var paddingHorizontal: CGFloat {
        switch size {
        case .s: return CreoUITokens.spacingS
        case .m: return CreoUITokens.spacingM
        case .l: return CreoUITokens.spacingL
        }
    }

    private var paddingVertical: CGFloat {
        switch size {
        case .s: return CreoUITokens.spacingXs
        case .m: return CreoUITokens.spacingS
        case .l: return CreoUITokens.spacingM
        }
    }

    private var cornerRadius: CGFloat {
        switch size {
        case .s: return CreoUITokens.radiusXs
        case .m: return CreoUITokens.radiusS
        case .l: return CreoUITokens.radiusM
        }
    }

    private var backgroundColor: Color {
        switch variant {
        case .primary: return theme.brandPrimary
        case .secondary: return theme.surfaceSurface
        case .ghost: return .clear
        }
    }

    private var foregroundColor: Color {
        switch variant {
        case .primary: return theme.surfaceBgBase
        case .secondary, .ghost: return theme.textPrimary
        }
    }

    private var borderColor: Color {
        switch variant {
        case .primary: return theme.brandPrimary
        case .secondary: return theme.surfaceBorder
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
        size: CreoButtonSize = .m,
        action: @escaping () -> Void
    ) {
        self.init(variant: variant, size: size, action: action) {
            Text(title)
        }
    }
}
