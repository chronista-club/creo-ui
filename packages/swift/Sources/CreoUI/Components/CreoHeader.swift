// CreoUI — Header component (SwiftUI)
//
// CSS `.creo-header` の SwiftUI 版。app shell / toolbar / page top で使用。
// logo + nav + actions の 3 slot layout (slots via ViewBuilder)。
//
// Usage:
//   CreoHeader {
//       // logo slot
//       Image(systemName: "sparkles").foregroundColor(.colorBrandPrimary)
//       Text("Creo").font(.headline)
//   } nav: {
//       NavLink("Memories")
//       NavLink("Projects")
//   } actions: {
//       CreoButton("Sign out", variant: .ghost, size: .sm) { ... }
//   }

import SwiftUI

public enum CreoHeaderVariant: String, CaseIterable, Sendable {
    case app
    case marketing
}

public enum CreoHeaderElevation: String, CaseIterable, Sendable {
    case none
    case sm
    case md
}

public struct CreoHeader<Logo: View, Nav: View, Actions: View>: View {
    let variant: CreoHeaderVariant
    let elevation: CreoHeaderElevation
    let logo: Logo
    let nav: Nav
    let actions: Actions

    public init(
        variant: CreoHeaderVariant = .app,
        elevation: CreoHeaderElevation = .sm,
        @ViewBuilder logo: () -> Logo,
        @ViewBuilder nav: () -> Nav = { EmptyView() },
        @ViewBuilder actions: () -> Actions = { EmptyView() }
    ) {
        self.variant = variant
        self.elevation = elevation
        self.logo = logo()
        self.nav = nav()
        self.actions = actions()
    }

    public var body: some View {
        HStack(spacing: CreoUITokens.layoutGapSibling) {
            HStack(spacing: CreoUITokens.layoutGapTight) {
                logo
            }

            // nav (flex 1 相当、SwiftUI では spacer で対応可能、consumer の実装に委ねる)
            HStack(spacing: CreoUITokens.spacingMd) {
                nav
            }

            Spacer()

            HStack(spacing: CreoUITokens.layoutGapTight) {
                actions
            }
        }
        .padding(.horizontal, horizontalPadding)
        .padding(.vertical, verticalPadding)
        .frame(minHeight: minHeight)
        .background(backgroundColor)
        .overlay(alignment: .bottom) {
            if elevation != .none {
                Rectangle()
                    .fill(Color.colorSurfaceBorder)
                    .frame(height: 1)
            }
        }
        .shadow(
            color: elevation == .md ? .black.opacity(0.06) : .clear,
            radius: elevation == .md ? 4 : 0,
            y: elevation == .md ? 1 : 0
        )
    }

    // MARK: - Style resolvers

    private var horizontalPadding: CGFloat {
        variant == .marketing ? CreoUITokens.spacingXl : CreoUITokens.spacingLg
    }

    private var verticalPadding: CGFloat {
        variant == .marketing ? CreoUITokens.spacingMd : CreoUITokens.spacingSm
    }

    private var minHeight: CGFloat {
        variant == .marketing ? 72 : CreoUITokens.layoutTargetTap
    }

    private var backgroundColor: Color {
        variant == .marketing ? Color.colorSurfaceBgBase : Color.colorSurfaceSurface
    }
}
