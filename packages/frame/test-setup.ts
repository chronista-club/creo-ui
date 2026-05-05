/**
 * Test setup — happy-dom globals を register。
 *
 * bunfig.toml の `[test] preload` で全 test file の前に走る。 これで
 * window / document / Element / HTMLElement / matchMedia /
 * Element.animate() / getComputedStyle が globally available になる。
 *
 * 既存 test (spring.test.ts / tokens.test.ts fallback path /
 * utils.test.ts 純関数) は happy-dom 環境でも regression なし
 * (CSS variable 未定義 → fallback、 純関数は DOM 非依存)。
 */

import { GlobalRegistrator } from '@happy-dom/global-registrator'

GlobalRegistrator.register()
