import XCTest
import SwiftUI
@testable import CreoUI

final class CreoUITests: XCTestCase {
    func testVersion() {
        XCTAssertEqual(CreoUI.version, "0.0.1")
    }

    func testSpacingMdIs16() {
        XCTAssertEqual(CreoUITokens.spacingMd, 16.0, accuracy: 0.001)
    }

    func testRadiusFullIsPill() {
        XCTAssertEqual(CreoUITokens.radiusFull, 9999.0, accuracy: 0.001)
    }

    func testBrandPrimaryExists() {
        // Smoke check — compiler confirms the symbol is generated.
        _ = Color.colorBrandPrimary
    }
}
