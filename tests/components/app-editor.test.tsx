// mem_1CfhYLwFUNkDpFgDaxw1z4 — app-wide Editor contract
import { type JSX, render } from '@solidjs/web'
import { flush, onCleanup } from 'solid-js'
import { afterEach, expect, test } from 'vitest'
import {
  type EditorHost,
  EditorHostProvider,
  EditorLayer,
  LocaleProvider,
  useEditorHost,
} from '../../packages/editor-host/src'

const cleanups: Array<() => void> = []
afterEach(() => {
  for (const dispose of cleanups.splice(0).reverse()) dispose()
})
function mount(layerProps = {}) {
  let host!: EditorHost
  let clicks = 0
  const Fixture = (): JSX.Element => {
    host = useEditorHost()
    onCleanup(
      host.register([
        {
          id: 'sidebar.size',
          label: 'Sidebar の文字',
          type: 'number',
          initial: 14,
          semantic: 'tool',
          group: 'Sidebar',
          constraints: { min: 10, max: 24 },
        },
      ]),
    )
    return (
      <>
        <button
          type="button"
          data-editor-fields="sidebar.size"
          data-editor-selectable-id="Sidebar"
          onClick={() => clicks++}
        >
          通常操作
        </button>
        <EditorLayer {...layerProps} />
      </>
    )
  }
  const container = document.createElement('div')
  document.body.append(container)
  const style = document.documentElement.style.cssText
  const dispose = render(
    () => (
      <LocaleProvider initial="ja">
        <EditorHostProvider
          config={{ initialMode: 'on', exposeConsole: false, discoverComponents: false }}
        >
          <Fixture />
        </EditorHostProvider>
      </LocaleProvider>
    ),
    container,
  )
  flush()
  cleanups.push(() => {
    dispose()
    container.remove()
    document.documentElement.style.cssText = style
  })
  return { host, clicks: () => clicks, content: container.querySelector('button')! }
}
function button(text: string): HTMLButtonElement {
  const found = [
    ...document.querySelectorAll<HTMLButtonElement>('[data-editor-panel] button'),
  ].find((el) => el.textContent?.includes(text))
  expect(found, `button: ${text}`).toBeTruthy()
  return found!
}
function panel() {
  return document.querySelector<HTMLElement>('[data-editor-panel]')!
}

test('application identity and registered non-global sections are discoverable', () => {
  mount({ appName: 'Vantage Point' })
  expect(panel().textContent).toContain('Vantage Point')
  expect(panel().textContent).toContain('アプリ全体')
  expect(panel().textContent).not.toContain('このページの component')
  button('画面の各部').click()
  flush()
  button('Sidebar').click()
  flush()
  expect(panel().textContent).toContain('Sidebar の文字')
  expect(panel().textContent).toContain('反映範囲')
})

test('consumer can name a section and describe its actual impact', () => {
  mount({
    appName: 'VP',
    sections: [
      {
        id: 'sidebar',
        label: 'サイドバー',
        fieldIds: ['sidebar.size'],
        scopeLabel: 'すべての repo 名',
      },
    ],
  })
  button('画面の各部').click()
  flush()
  button('サイドバー').click()
  flush()
  expect(panel().textContent).toContain('すべての repo 名')
  expect(panel().textContent).toContain('Sidebar の文字')
})

test('opening the Editor preserves app clicks; picking captures only the requested selection', () => {
  const fixture = mount()
  fixture.content.click()
  flush()
  expect(fixture.clicks()).toBe(1)
  button('画面から選ぶ').click()
  flush()
  fixture.content.click()
  flush()
  expect(fixture.clicks()).toBe(1)
  expect(fixture.host.selection()?.targetId).toBe('Sidebar')
  expect(panel().textContent).toContain('Sidebar の文字')
  fixture.content.click()
  flush()
  expect(fixture.clicks()).toBe(2)
})

test('Escape cancels picking before closing the editor', () => {
  const { host } = mount()
  button('画面から選ぶ').click()
  flush()
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  flush()
  expect(host.mode()).toBe('on')
  expect(button('画面から選ぶ').getAttribute('aria-pressed')).toBe('false')
  button('閉じる').click()
  flush()
  expect(host.mode()).toBe('off')
  expect(document.querySelector('[data-editor-panel]')).toBeNull()
})

test('changes show current and default values and reset through the host', () => {
  const { host } = mount()
  host.setValue('sidebar.size', 18)
  flush()
  button('変更した項目').click()
  flush()
  expect(panel().textContent).toContain('Sidebar の文字')
  expect(panel().textContent).toContain('18')
  button('既定値に戻す').click()
  flush()
  expect(host.getValue('sidebar.size')).toBe(14)
  expect(panel().textContent).toContain('変更はありません')
})

test('explicit field selection reports the consumer scope even on a CSS component', () => {
  const { host } = mount({
    sections: [
      {
        id: 'sidebar',
        label: 'Sidebar',
        fieldIds: ['sidebar.size'],
        scopeLabel: 'Sidebar の repo 名',
      },
    ],
  })
  host.select({
    targetId: 'Sidebar',
    componentId: 'btn',
    fieldIds: ['sidebar.size'],
    rect: new DOMRect(),
  })
  flush()
  expect(panel().textContent).toContain('Sidebar の repo 名')
  expect(panel().textContent).not.toContain('このアプリ内の同じ種類の部品すべて')
})
