import XCTest
@testable import CreoUI

final class CreoUITests: XCTestCase {
    func testVersion() {
        XCTAssertEqual(CreoUI.version, "0.0.0")
    }
}
