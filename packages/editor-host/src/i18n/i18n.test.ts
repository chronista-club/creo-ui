/**
 * bun test packages/editor-host/src/i18n/i18n.test.ts
 */
import { describe, expect, test } from 'bun:test'
import { translate } from './useT'

describe('translate (pure resolver)', () => {
  test('returns current locale value when present', () => {
    expect(translate({ ja: 'こんにちは', en: 'Hello' }, 'ja')).toBe('こんにちは')
    expect(translate({ ja: 'こんにちは', en: 'Hello' }, 'en')).toBe('Hello')
  })

  test('fallback chain: missing locale → en → ja', () => {
    // missing 'en', locale='en' → fallback to ja
    expect(translate({ ja: 'のみ' } as { ja?: string; en?: string }, 'en')).toBe('のみ')
    // missing 'ja', locale='ja' → fallback to en
    expect(translate({ en: 'only' }, 'ja')).toBe('only')
  })

  test('extended locale (declaration merging style) — resolves via escape-hatch index', () => {
    const text = { ja: '日本語', en: 'English', ko: '한국어' }
    // Locale='ja' but we extend with 'ko' key、ja resolves normally
    expect(translate(text, 'ja')).toBe('日本語')
    // explicit: cast to widened locale (consumer pattern) — ko via index
    expect(translate(text, 'ko' as 'ja')).toBe('한국어')
  })

  test('all empty → returns fallback argument', () => {
    expect(translate({}, 'en', '(no translation)')).toBe('(no translation)')
    expect(translate({}, 'en')).toBe('')
  })

  test('first defined key wins when primary/en/ja all missing', () => {
    const text = { fr: 'Bonjour' }
    expect(translate(text, 'en')).toBe('Bonjour')
  })
})
