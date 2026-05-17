import XCTest
import SwiftUI
@testable import Creoui

final class CreouiTests: XCTestCase {
    func testVersion() {
        XCTAssertEqual(Creoui.version, "0.0.1")
    }

    func testSpacingMdIs18() {
        // 5-step size-feel rule (2026-04-22)
        XCTAssertEqual(CreouiTokens.spacingM, 18.0, accuracy: 0.001)
    }

    func testMarginMdMatchesSpacingMd() {
        // creoui 規約: 同じ "medium" は spacing.md と margin.md を揃える
        XCTAssertEqual(CreouiTokens.marginM, CreouiTokens.spacingM, accuracy: 0.001)
    }

    func testLayoutTargetTapIs44pt() {
        // Apple HIG minimum tap target
        XCTAssertEqual(CreouiTokens.layoutTargetTap, 44.0, accuracy: 0.001)
    }

    func testRadiusFullIsPill() {
        XCTAssertEqual(CreouiTokens.radiusFull, 9999.0, accuracy: 0.001)
    }

    func testBrandPrimaryExists() {
        // Smoke check — compiler confirms the symbol is generated.
        _ = Color.colorBrandPrimary
    }
}
