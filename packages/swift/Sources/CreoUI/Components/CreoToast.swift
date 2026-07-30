// CreoUI — Toast (SwiftUI)
//
// Web `.creo-toast` の SwiftUI 版。一時的な status / notification。VP ccwire
// msg 受信通知、action 完了 feedback 等で使用。
//
// Usage:
//   CreoToast(title: "保存しました", description: "変更が永続化されました", variant: .success)
//   CreoToast(title: "失敗", variant: .error)
//
// 通常 consumer は Toast をリスト化して `CreoToastRegion` (optional view builder で
// VStack 配置) に流す or SwiftUI の `.alert`/`.confirmationDialog` 相当の管理は
// consumer が担当。

import SwiftUI

public enum CreoToastVariant: String, CaseIterable, Sendable {
    case `default`
    case success
    case warning
    case error
    case info
}

public struct CreoToast: View {
    let title: String
    let description: String?
    let variant: CreoToastVariant
    let onClose: (() -> Void)?
    @Environment(\.creoTheme) private var theme

    public init(
        title: String,
        description: String? = nil,
        variant: CreoToastVariant = .default,
        onClose: (() -> Void)? = nil
    ) {
        self.title = title
        self.description = description
        self.variant = variant
        self.onClose = onClose
    }

    public var body: some View {
        HStack(alignment: .top, spacing: CreoUITokens.spacingS) {
            if let symbol = iconSymbol {
                Image(systemName: symbol)
                    .foregroundColor(iconColor)
                    .font(.system(size: CreoUITokens.typographyTitleCard))
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .creoText(.bodyEmphasis)
                    .foregroundColor(theme.textPrimary)

                if let description {
                    Text(description)
                        .creoText(.bodyHelper)
                        .foregroundColor(theme.textSecondary)
                        .lineLimit(3)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            if let onClose {
                Button(action: onClose) {
                    Image(systemName: "xmark")
                        .foregroundColor(theme.textTertiary)
                        .font(.system(size: CreoUITokens.typographySizeS))
                }
                .buttonStyle(.plain)
                .accessibilityLabel("閉じる")
            }
        }
        .padding(.horizontal, CreoUITokens.spacingM)
        .padding(.vertical, CreoUITokens.spacingS)
        .background(theme.surfaceSurface)
        .overlay(
            RoundedRectangle(cornerRadius: CreoUITokens.radiusM)
                .stroke(borderColor, lineWidth: borderWidth)
        )
        .clipShape(RoundedRectangle(cornerRadius: CreoUITokens.radiusM))
        .shadow(color: .black.opacity(0.08), radius: 8, y: 2)
    }

    // MARK: - Style resolvers

    private var iconSymbol: String? {
        switch variant {
        case .default: return nil
        case .success: return "checkmark.circle.fill"
        case .warning: return "exclamationmark.triangle.fill"
        case .error: return "xmark.octagon.fill"
        case .info: return "info.circle.fill"
        }
    }

    private var iconColor: Color {
        switch variant {
        case .default: return theme.textPrimary
        case .success: return theme.semanticSuccess
        case .warning: return theme.semanticWarning
        case .error: return theme.semanticError
        case .info: return theme.semanticInfo
        }
    }

    private var borderColor: Color {
        switch variant {
        case .default: return theme.surfaceBorder
        case .success: return theme.semanticSuccess
        case .warning: return theme.semanticWarning
        case .error: return theme.semanticError
        case .info: return theme.semanticInfo
        }
    }

    private var borderWidth: CGFloat {
        variant == .default ? 1 : 1.5
    }
}
