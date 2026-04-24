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
        HStack(alignment: .top, spacing: CreoUITokens.spacingSm) {
            if let symbol = iconSymbol {
                Image(systemName: symbol)
                    .foregroundColor(iconColor)
                    .font(.system(size: CreoUITokens.typographyTitleCard))
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: CreoUITokens.typographySizeMd, weight: .semibold))
                    .foregroundColor(Color.colorTextPrimary)

                if let description {
                    Text(description)
                        .font(.system(size: CreoUITokens.typographyBodyHelper))
                        .foregroundColor(Color.colorTextSecondary)
                        .lineLimit(3)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            if let onClose {
                Button(action: onClose) {
                    Image(systemName: "xmark")
                        .foregroundColor(Color.colorTextTertiary)
                        .font(.system(size: CreoUITokens.typographySizeSm))
                }
                .buttonStyle(.plain)
                .accessibilityLabel("閉じる")
            }
        }
        .padding(.horizontal, CreoUITokens.spacingMd)
        .padding(.vertical, CreoUITokens.spacingSm)
        .background(Color.colorSurfaceSurface)
        .overlay(
            RoundedRectangle(cornerRadius: CreoUITokens.radiusMd)
                .stroke(borderColor, lineWidth: borderWidth)
        )
        .clipShape(RoundedRectangle(cornerRadius: CreoUITokens.radiusMd))
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
        case .default: return Color.colorTextPrimary
        case .success: return Color.colorSemanticSuccess
        case .warning: return Color.colorSemanticWarning
        case .error: return Color.colorSemanticError
        case .info: return Color.colorSemanticInfo
        }
    }

    private var borderColor: Color {
        switch variant {
        case .default: return Color.colorSurfaceBorder
        case .success: return Color.colorSemanticSuccess
        case .warning: return Color.colorSemanticWarning
        case .error: return Color.colorSemanticError
        case .info: return Color.colorSemanticInfo
        }
    }

    private var borderWidth: CGFloat {
        variant == .default ? 1 : 1.5
    }
}
