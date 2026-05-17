// Creoui — Menu / context menu (SwiftUI)
//
// Web `.creo-menu` の SwiftUI 版。native `Menu` を Creo token で整えた wrapper。
// VP lane right-click、toolbar ⋯ button の dropdown で使用。
//
// Usage:
//   CreoMenu("⚙️", icon: "gear") {
//       CreoMenuItem("Settings") { navigate(.settings) }
//       CreoMenuItem("Billing") { navigate(.billing) }
//       Divider()
//       CreoMenuItem("Sign out", variant: .destructive) { signOut() }
//   }

import SwiftUI

public enum CreoMenuItemVariant: String, CaseIterable, Sendable {
    case `default`
    case destructive
}

public struct CreoMenuItem: View {
    let label: String
    let variant: CreoMenuItemVariant
    let action: () -> Void

    public init(
        _ label: String,
        variant: CreoMenuItemVariant = .default,
        action: @escaping () -> Void
    ) {
        self.label = label
        self.variant = variant
        self.action = action
    }

    public var body: some View {
        Button(action: action) {
            Text(label)
                .foregroundColor(textColor)
        }
    }

    private var textColor: Color {
        switch variant {
        case .default: return Color.colorTextPrimary
        case .destructive: return Color.colorSemanticError
        }
    }
}

public struct CreoMenu<Label: View, Content: View>: View {
    let label: Label
    let content: Content

    public init(
        @ViewBuilder label: () -> Label,
        @ViewBuilder content: () -> Content
    ) {
        self.label = label()
        self.content = content()
    }

    public var body: some View {
        Menu {
            content
        } label: {
            label
        }
        .menuStyle(.borderlessButton)
    }
}

// MARK: - Text convenience init

public extension CreoMenu where Label == HStack<TupleView<(Text, Image)>> {
    init(
        _ title: String,
        icon: String = "ellipsis",
        @ViewBuilder content: () -> Content
    ) {
        self.init(
            label: {
                HStack {
                    Text(title)
                    Image(systemName: icon)
                }
            },
            content: content
        )
    }
}
