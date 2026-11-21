// Principal Layout の Rail (docs/design/principal-layout.md §5)。VP の額縁 (doc 87) の要望:
// 右 edge にも置ける / peek の幅を外から与える / drag 中は幅の transition を止める。
import type { JSX } from 'solid-js'
import { render } from 'solid-js/web'
import { afterEach, expect, test } from 'vitest'
import { CURail } from '../../packages/core/src/shells'
import type { RailDef } from '../../packages/core/src/shells/railRegistry'

const cleanups: Array<() => void> = []

afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
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

const Icon = () => <span>i</span>
const Peek = () => <p data-testid="peek-body">peek</p>

const rails: RailDef[] = [
  {
    id: 'lanes',
    icon: Icon,
    labelKey: 'Lanes',
    aspect: 'lane',
    route: '/lanes',
    peek: Peek,
    order: 0,
  },
  { id: 'prs', icon: Icon, labelKey: 'PRs', aspect: 'pr', route: '/prs', peek: Peek, order: 1 },
]

const railRoot = (c: HTMLElement) => c.querySelector('[data-region]') as HTMLElement
const peekOf = (c: HTMLElement) => c.querySelector('[data-expanded]') as HTMLElement

test('既定では left edge に立ち、route に一致する Rail の peek を開く', () => {
  const c = mount(() => <CURail registry={rails} pathname="/lanes/a" onNavigate={() => {}} />)
  expect(railRoot(c).dataset.region).toBe('leftEdge')
  expect(peekOf(c).dataset.expanded).toBe('true')
  expect(c.querySelector('[data-rail="lanes"]')?.getAttribute('aria-current')).toBe('page')
})

test('region に rightEdge を渡すと右 edge の Rail として立つ', () => {
  const c = mount(() => (
    <CURail registry={rails} pathname="/prs" onNavigate={() => {}} region="rightEdge" />
  ))
  expect(railRoot(c).dataset.region).toBe('rightEdge')
  expect(peekOf(c).dataset.expanded).toBe('true')
})

test('peekWidth は開いた peek の幅を外から与える (数値は px、文字列はそのまま)', () => {
  const px = mount(() => (
    <CURail registry={rails} pathname="/lanes" onNavigate={() => {}} peekWidth={360} />
  ))
  expect(railRoot(px).style.getPropertyValue('--cu-rail-peek-width')).toBe('360px')

  const len = mount(() => (
    <CURail registry={rails} pathname="/lanes" onNavigate={() => {}} peekWidth="24rem" />
  ))
  expect(railRoot(len).style.getPropertyValue('--cu-rail-peek-width')).toBe('24rem')
})

test('peekWidth を渡さなければ幅の変数を立てない (CSS の既定 240px が効く)', () => {
  const c = mount(() => <CURail registry={rails} pathname="/lanes" onNavigate={() => {}} />)
  expect(railRoot(c).style.getPropertyValue('--cu-rail-peek-width')).toBe('')
})

test('resizing の間は peek に data-resizing を立てる (幅の transition を止める合図)', () => {
  const c = mount(() => (
    <CURail registry={rails} pathname="/lanes" onNavigate={() => {}} peekWidth={300} resizing />
  ))
  expect(peekOf(c).dataset.resizing).toBe('true')

  const idle = mount(() => <CURail registry={rails} pathname="/lanes" onNavigate={() => {}} />)
  expect(peekOf(idle).dataset.resizing).toBeUndefined()
})
