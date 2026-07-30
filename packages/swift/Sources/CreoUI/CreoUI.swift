// CreoUI - creo-ui Design System for Apple platforms
//
// 3 層で構成する (2026-07-30、ladyland consumer feedback #4/#6 対応):
//   1. Generated/Tokens.swift — flat token 定数 (mint-dark)。後方互換 API
//   2. Generated/Themes.swift + Theme/ — CreoTheme (8 preset) を
//      @Environment(\.creoTheme) / .creoTheme() modifier で注入
//   3. Typography/ — CreoTextStyle + .creoText() modifier (Dynamic Type 対応)
//
//   import CreoUI
//   import SwiftUI
//
//   struct Hero: View {
//       @Environment(\.creoTheme) private var theme
//       var body: some View {
//           Text("Creo")
//               .creoText(.titlePage)
//               .foregroundColor(theme.brandPrimary)
//               .padding(CreoUITokens.spacingM)
//       }
//   }
//
//   // app root で theme を選ぶ (外観モード追従は family 指定)
//   ContentView().creoTheme(.mint)

import Foundation

public enum CreoUI {
    public static let version = "0.0.1"
}
