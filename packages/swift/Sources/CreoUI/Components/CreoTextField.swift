// CreoUI — Input / TextField component (SwiftUI)
//
// CSS `.creo-input` の SwiftUI 版。native TextField をラップして variant
// (bordered/filled) と size (sm/md/lg) と state (default/error) を Creo UI
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
    case sm
    case md
    case lg
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

    public init(
        _ prompt: String,
        text: Binding<String>,
        variant: CreoTextFieldVariant = .bordered,
        size: CreoTextFieldSize = .md,
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
            .foregroundColor(.colorTextPrimary)
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
        case .sm: return CreoUITokens.spacingSm
        case .md: return CreoUITokens.spacingMd
        case .lg: return CreoUITokens.spacingLg
        }
    }

    private var paddingVertical: CGFloat {
        switch size {
        case .sm: return CreoUITokens.spacingXs
        case .md: return CreoUITokens.spacingSm
        case .lg: return CreoUITokens.spacingMd
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
        case .bordered: return .colorSurfaceSurface
        case .filled: return .colorSurfaceBgSubtle
        }
    }

    private var borderColor: Color {
        if state == .error {
            return .colorSemanticError
        }
        if focused {
            return .colorBrandPrimary
        }
        switch variant {
        case .bordered: return .colorSurfaceBorder
        case .filled: return .clear
        }
    }

    private var borderWidth: CGFloat {
        if state == .error { return 1.5 }
        if focused { return 2 }
        return variant == .filled ? 0 : 1
    }
}
