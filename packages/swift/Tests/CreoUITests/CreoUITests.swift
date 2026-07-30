import XCTest
import SwiftUI
@testable import CreoUI

final class CreoUITests: XCTestCase {
    func testVersion() {
        XCTAssertEqual(CreoUI.version, "0.0.1")
    }

    func testSpacingMdIs18() {
        // 5-step size-feel rule (2026-04-22)
        XCTAssertEqual(CreoUITokens.spacingM, 18.0, accuracy: 0.001)
    }

    func testMarginMdMatchesSpacingMd() {
        // creo-ui 規約: 同じ "medium" は spacing.md と margin.md を揃える
        XCTAssertEqual(CreoUITokens.marginM, CreoUITokens.spacingM, accuracy: 0.001)
    }

    func testLayoutTargetTapIs44pt() {
        // Apple HIG minimum tap target
        XCTAssertEqual(CreoUITokens.layoutTargetTap, 44.0, accuracy: 0.001)
    }

    func testRadiusFullIsPill() {
        XCTAssertEqual(CreoUITokens.radiusFull, 9999.0, accuracy: 0.001)
    }

    func testBrandPrimaryExists() {
        // Smoke check — compiler confirms the symbol is generated.
        _ = Color.colorBrandPrimary
    }

    // MARK: - Theme (ladyland consumer feedback #4)

    func testThemePresetsAreEightAndUnique() {
        XCTAssertEqual(CreoTheme.all.count, 8)
        XCTAssertEqual(Set(CreoTheme.all.map(\.id)).count, 8)
    }

    func testThemePresetLookupById() {
        XCTAssertEqual(CreoTheme.preset(id: "sora-light")?.id, "sora-light")
        XCTAssertNil(CreoTheme.preset(id: "no-such-theme"))
    }

    func testThemeFamilyResolvesLightDarkPair() {
        XCTAssertEqual(CreoThemeFamily.mint.dark.id, "mint-dark")
        XCTAssertEqual(CreoThemeFamily.mint.light.id, "mint-light")
        XCTAssertEqual(CreoThemeFamily.oldschool.light.id, "oldschool-light")
        XCTAssertEqual(CreoThemeFamily.allCases.count, 4)
    }

    func testMintDarkMatchesFlatTokens() {
        // default theme は flat 定数 (後方互換 API) と同じ値でなければならない
        XCTAssertEqual(CreoTheme.mintDark.brandPrimary, Color.colorBrandPrimary)
        XCTAssertEqual(CreoTheme.mintDark.textPrimary, Color.colorTextPrimary)
        XCTAssertEqual(CreoTheme.mintDark.surfaceSurface, Color.colorSurfaceSurface)
        XCTAssertEqual(CreoTheme.mintDark.shadowBase, Color.colorShadowBase)
    }

    func testThemeIsCopyModifiable() {
        // consumer が独自 theme を組める (ladyland #10 の AV semantic 発明の受け皿)
        var custom = CreoTheme.mintDark
        custom.brandPrimary = Color(red: 1, green: 0, blue: 0)
        XCTAssertNotEqual(custom, CreoTheme.mintDark)
        XCTAssertEqual(CreoTheme.mintDark.brandPrimary, Color.colorBrandPrimary)
    }

    // MARK: - Typography (ladyland consumer feedback #6)

    func testTextStylePresetsMatchTokens() {
        XCTAssertEqual(CreoTextStyle.body.size, CreoUITokens.typographyBodyDefault)
        XCTAssertEqual(CreoTextStyle.titlePage.size, CreoUITokens.typographyTitlePage)
        XCTAssertEqual(CreoTextStyle.bodyCaption.size, CreoUITokens.typographyBodyCaption)
        XCTAssertEqual(CreoTextStyle.body.weight, .regular)
        XCTAssertEqual(CreoTextStyle.titlePage.weight, .bold)
        XCTAssertEqual(CreoTextStyle.bodyEmphasis.weight, .semibold)
        // emphasis は size を変えず weight だけで強調する (token 設計)
        XCTAssertEqual(CreoTextStyle.bodyEmphasis.size, CreoTextStyle.body.size)
    }

    func testFontWeightBridgeFromDTCGNumeric() {
        XCTAssertEqual(Font.Weight(creoWeight: 400), .regular)
        XCTAssertEqual(Font.Weight(creoWeight: 500), .medium)
        XCTAssertEqual(Font.Weight(creoWeight: 600), .semibold)
        XCTAssertEqual(Font.Weight(creoWeight: 700), .bold)
        // 中間値は最近傍へ
        XCTAssertEqual(Font.Weight(creoWeight: 449), .regular)
        XCTAssertEqual(Font.Weight(creoWeight: 450), .medium)
    }

    func testLineHeightConversionUsesFontMetrics() {
        // 換算式: lineSpacing = 倍率 × size − system 実 line height。
        // system font は leading を内包するので、正の値でも size × (倍率 − 1) より小さい
        let size: CGFloat = 16
        let system = CreoTextModifier.systemLineHeight(ofSize: size)
        XCTAssertGreaterThan(system, size) // leading 内包の確認
        let spacing = max(0, CreoTextStyle.body.lineHeight * size - system)
        XCTAssertLessThan(spacing, size * (CreoTextStyle.body.lineHeight - 1))
    }
}
