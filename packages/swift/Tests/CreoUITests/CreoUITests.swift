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
        // Creo UI 規約: 同じ "medium" は spacing.md と margin.md を揃える
        XCTAssertEqual(CreoUITokens.marginMd, CreoUITokens.spacingM, accuracy: 0.001)
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
}
