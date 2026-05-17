// Creoui — Avatar component (SwiftUI)
//
// CSS `.creo-avatar` の SwiftUI 版。user / account / item の視覚 identity。
// image + initials fallback + optional status dot。VP member 表示や
// Rail / Sidebar の identity で使用。
//
// Usage:
//   CreoAvatar(image: Image("mako"))
//   CreoAvatar(initials: "M", size: .lg, status: .online)

import SwiftUI

public enum CreoAvatarSize: String, CaseIterable, Sendable {
    case sm
    case md
    case lg
    case xl
}

public enum CreoAvatarShape: String, CaseIterable, Sendable {
    case circle
    case square
}

public enum CreoAvatarStatus: String, CaseIterable, Sendable {
    case online
    case busy
    case away
    case offline
}

public struct CreoAvatar: View {
    let image: Image?
    let initials: String?
    let size: CreoAvatarSize
    let shape: CreoAvatarShape
    let status: CreoAvatarStatus?

    public init(
        image: Image? = nil,
        initials: String? = nil,
        size: CreoAvatarSize = .md,
        shape: CreoAvatarShape = .circle,
        status: CreoAvatarStatus? = nil
    ) {
        self.image = image
        self.initials = initials
        self.size = size
        self.shape = shape
        self.status = status
    }

    public var body: some View {
        ZStack(alignment: .bottomTrailing) {
            baseContent
                .frame(width: diameter, height: diameter)
                .background(Color.colorBrandPrimarySubtle)
                .clipShape(clipShape)

            if let status {
                Circle()
                    .fill(statusColor(status))
                    .frame(width: statusDotSize, height: statusDotSize)
                    .overlay(
                        Circle().stroke(Color.colorSurfaceSurface, lineWidth: 2)
                    )
                    .offset(x: statusDotOffset, y: statusDotOffset)
            }
        }
    }

    @ViewBuilder
    private var baseContent: some View {
        if let image {
            image
                .resizable()
                .scaledToFill()
        } else if let initials {
            Text(initials.uppercased())
                .font(.system(size: initialsFontSize, weight: .semibold))
                .foregroundColor(Color.colorTextPrimary)
        } else {
            Color.clear
        }
    }

    private var clipShape: AnyShape {
        switch shape {
        case .circle: return AnyShape(Circle())
        case .square: return AnyShape(RoundedRectangle(cornerRadius: CreouiTokens.radiusS))
        }
    }

    // MARK: - Style resolvers

    private var diameter: CGFloat {
        switch size {
        case .sm: return 24
        case .md: return 32
        case .lg: return CreouiTokens.layoutTargetTap
        case .xl: return 64
        }
    }

    private var initialsFontSize: CGFloat {
        switch size {
        case .sm: return CreouiTokens.typographySizeXs
        case .md: return CreouiTokens.typographySizeS
        case .lg: return CreouiTokens.typographySizeM
        case .xl: return CreouiTokens.typographySizeL
        }
    }

    private var statusDotSize: CGFloat {
        max(8, diameter * 0.25)
    }

    private var statusDotOffset: CGFloat {
        statusDotSize * 0.15
    }

    private func statusColor(_ s: CreoAvatarStatus) -> Color {
        switch s {
        case .online: return .colorSemanticSuccess
        case .busy: return .colorSemanticError
        case .away: return .colorSemanticWarning
        case .offline: return .colorTextTertiary
        }
    }
}
