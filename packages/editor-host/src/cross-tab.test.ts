/**
 * bun test packages/editor-host/src/cross-tab.test.ts
 */
import { describe, expect, test } from 'bun:test'
import { __test__ } from './cross-tab'

describe('defaultChannelName', () => {
  test('prefixes namespace', () => {
    expect(__test__.defaultChannelName('my-app')).toBe('creo-ui-editor-host:my-app')
    expect(__test__.defaultChannelName('creo-ui-editor-host')).toBe(
      'creo-ui-editor-host:creo-ui-editor-host',
    )
  })
})

describe('generateTabId', () => {
  test('returns non-empty string', () => {
    const id = __test__.generateTabId()
    expect(id.length).toBeGreaterThan(0)
  })
  test('is unique across calls', () => {
    const a = __test__.generateTabId()
    const b = __test__.generateTabId()
    expect(a).not.toBe(b)
  })
})
