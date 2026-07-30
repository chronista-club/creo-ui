// CreoUI — Input / TextField component (SwiftUI)
//
// CSS `.creo-input` の SwiftUI 版。native TextField をラップして variant
// (bordered/filled) と size (s/m/l) と state (default/error) を creo-ui
// token で統一。
//
// Usage:
//   CreoTextField("Email", text: $email)
//   CreoTextField("Password", text: $pw, variant: .filled, state: .error)

import SwiftUI

public enum CreoTextFieldVariant: String, CaseIterable, Sendable {
    case bordered
    case filled
}

public enum CreoTextFieldSize: String, CaseIterable, Sendable {
    case s
    case m
    case l
}

public enum CreoTextFieldState: String, CaseIterable, Sendable {
    case `default`
    case error
}

public struct CreoTextField: View {
    let prompt: String
    let variant: CreoTextFieldVariant
    let size: CreoTextFieldSize
    let state: CreoTextFieldState
    @Binding var text: String
    @FocusState private var focused: Bool
    @Environment(\.creoTheme) private var theme

    public init(
        _ prompt: String,
        text: Binding<String>,
        variant: CreoTextFieldVariant = .bordered,
        size: CreoTextFieldSize = .m,
        state: CreoTextFieldState = .default
    ) {
        self.prompt = prompt
        self._text = text
        self.variant = variant
        self.size = size
        self.state = state
    }

    public var body: some View {
        TextField(prompt, text: $text)
            .font(.system(size: fontSize))
            .foregroundColor(theme.textPrimary)
            .padding(.horizontal, paddingHorizontal)
            .padding(.vertical, paddingVertical)
            .frame(minHeight: minHeight)
            .background(backgroundColor)
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .stroke(borderColor, lineWidth: borderWidth)
            )
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius))
            .focused($focused)
            .textFieldStyle(.plain)
    }

    // MARK: - Style resolvers

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
        case .bordered: return theme.surfaceSurface
        case .filled: return theme.surfaceBgSubtle
        }
    }

    private var borderColor: Color {
        if state == .error {
            return theme.semanticError
        }
        if focused {
            return theme.brandPrimary
        }
        switch variant {
        case .bordered: return theme.surfaceBorder
        case .filled: return .clear
        }
    }

    private var borderWidth: CGFloat {
        if state == .error { return 1.5 }
        if focused { return 2 }
        return variant == .filled ? 0 : 1
    }
}
