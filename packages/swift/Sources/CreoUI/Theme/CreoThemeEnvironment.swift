// CreoUI — Theme 注入 (SwiftUI Environment)
//
// Generated/Themes.swift の CreoTheme (8 preset) を view tree に注入する層。
// ladyland consumer feedback #4: 「8 テーマ資産が Swift に届いていない。本命は
// @Environment(\.creoTheme) の SwiftUI テーマ注入」への応答。
//
// Usage:
//   // 固定 theme (id 指定)
//   ContentView().creoTheme(.soraDark)
//
//   // 外観モード追従 (light/dark を colorScheme から自動選択)
//   ContentView().creoTheme(.mint)
//
//   // 読む側 (CreoUI component は全てこの経路で色を引く)
//   @Environment(\.creoTheme) private var theme
//   Text("...").foregroundColor(theme.textPrimary)
//
// default は .mintDark (= flat 定数 Color.colorBrandPrimary 等と同じ値) なので、
// 何も注入しない既存 consumer (VP / ladyland) の見た目は変わらない。

import SwiftUI

private struct CreoThemeKey: EnvironmentKey {
    static let defaultValue: CreoTheme = .mintDark
}

public extension EnvironmentValues {
    /// 現在の CreoTheme。default は .mintDark (Creo Design System default)
    var creoTheme: CreoTheme {
        get { self[CreoThemeKey.self] }
        set { self[CreoThemeKey.self] = newValue }
    }
}

public extension View {
    /// theme を固定で注入する (外観モードに追従しない)
    func creoTheme(_ theme: CreoTheme) -> some View {
        environment(\.creoTheme, theme)
    }

    /// family を注入し、light/dark は colorScheme (外観モード) に追従させる
    func creoTheme(_ family: CreoThemeFamily) -> some View {
        modifier(CreoThemeFamilyModifier(family: family))
    }
}

private struct CreoThemeFamilyModifier: ViewModifier {
    @Environment(\.colorScheme) private var colorScheme
    let family: CreoThemeFamily

    func body(content: Content) -> some View {
        content.environment(\.creoTheme, colorScheme == .dark ? family.dark : family.light)
    }
}
