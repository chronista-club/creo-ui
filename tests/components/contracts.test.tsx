// R01: mem_1Cf1aYeoBAH5i4surBDEsT
import { createSignal, type JSX, onCleanup } from 'solid-js'
import { render } from 'solid-js/web'
import { afterEach, beforeEach, expect, test } from 'vitest'
import {
  bind,
  boolean,
  EditorHostProvider,
  ephemeralTarget,
  useEditorHost,
} from '../../packages/editor-host/src'
import type { ResolvedMap } from '../../packages/layout/src'
import { PaneStage } from '../../packages/layout/src/solid'
import { CUButton, CUOutliner, type OutlinerNode } from '../../packages/web/src/controls'

const cleanups: Array<() => void> = []
let originalStyle: string

beforeEach(() => {
  originalStyle = document.documentElement.style.cssText
})

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
  // Editor の global style 復元契約は R07。テスト同士の状態はここで隔離する。
  document.documentElement.style.cssText = originalStyle
})

function mount(component: () => JSX.Element): HTMLDivElement {
  const container = document.createElement('div')
  document.body.append(container)
  const dispose = render(component, container)
  cleanups.push(() => {
    dispose()
    container.remove()
  })
  return container
}

test('Button は consumer の signal 変更を同じ DOM の属性と操作へ反映する', () => {
  const [loading, setLoading] = createSignal(false)
  let clicks = 0
  const container = mount(() => (
    <CUButton loading={loading()} onClick={() => clicks++}>
      保存
    </CUButton>
  ))
  const button = container.querySelector('button')!
  expect(button.type).toBe('button')
  button.click()
  expect(clicks).toBe(1)

  setLoading(true)
  expect(container.querySelector('button')).toBe(button)
  expect(button.disabled).toBe(true)
  expect(button.getAttribute('aria-busy')).toBe('true')
  button.click()
  expect(clicks).toBe(1)

  setLoading(false)
  expect(button.disabled).toBe(false)
  button.click()
  expect(clicks).toBe(2)
})

test('Outliner は入力を controlled な consumer の木へ返し、外部更新を描画する', () => {
  const [nodes, setNodes] = createSignal<OutlinerNode[]>([{ id: 'note', text: '初期値' }])
  const container = mount(() => <CUOutliner nodes={nodes()} onChange={setNodes} />)
  const input = container.querySelector('input')!
  input.value = '編集後'
  input.dispatchEvent(new InputEvent('input', { bubbles: true }))
  expect(nodes()[0].text).toBe('編集後')

  setNodes([{ id: 'note', text: 'consumer から更新' }])
  expect(container.querySelector('input')?.value).toBe('consumer から更新')
})

test('Provider 内の binding が Target・Host・DOM を更新し、unmount で field を解除する', () => {
  const target = ephemeralTarget('contract.enabled', false)
  let readHostValue: () => unknown = () => undefined
  let registered: () => boolean = () => false
  const Control = () => {
    const host = useEditorHost()
    const value = bind({
      target,
      control: boolean(),
      placement: { label: 'Enabled', semantic: 'global' },
    })
    readHostValue = () => host.getValue(target.id)
    registered = () => host.fields().some((field) => field.id === target.id)
    return (
      <button type="button" onClick={() => value.set(!value())}>
        {String(value())}
      </button>
    )
  }
  const [visible, setVisible] = createSignal(true)
  const container = mount(() => (
    <EditorHostProvider config={{ discoverComponents: false, exposeConsole: false }}>
      {visible() && <Control />}
    </EditorHostProvider>
  ))
  const button = container.querySelector('button')!
  expect(button.textContent).toBe('false')
  button.click()
  expect(target.get()).toBe(true)
  expect(readHostValue()).toBe(true)
  expect(button.textContent).toBe('true')

  setVisible(false)
  expect(registered()).toBe(false)
  expect(container.querySelector('button')).toBeNull()
})

test('PaneStage は配置変更と非表示をまたいで pane 内の DOM と入力値を保持する', () => {
  const panes = [{ id: 'terminal' }]
  const shown: ResolvedMap = {
    terminal: { rect: { x: 0, y: 0, w: 1, h: 1 }, attention: 1, floating: false },
  }
  const [resolved, setResolved] = createSignal(shown)
  let mounts = 0
  let unmounts = 0
  const Pane = () => {
    mounts++
    onCleanup(() => unmounts++)
    return <input aria-label="terminal" />
  }
  const container = mount(() => (
    <PaneStage panes={panes} resolved={resolved()} renderPane={() => <Pane />} />
  ))
  const input = container.querySelector('input')!
  input.value = '作業中の入力'
  setResolved({})
  setResolved(shown)

  expect(container.querySelector('input')).toBe(input)
  expect(input.value).toBe('作業中の入力')
  expect(mounts).toBe(1)
  expect(unmounts).toBe(0)
})
