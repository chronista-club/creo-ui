// Principal Layout の Rail (docs/design/principal-layout.md §5)。VP の額縁 (doc 87) の要望:
// 右 edge にも置ける / peek の幅を外から与える / drag 中は幅の transition を止める。
import { type JSX, render } from '@solidjs/web'
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

test('peekOpen=false (slim) では選択中 Rail の aria-current を保ったまま peek だけ畳む', () => {
  const c = mount(() => (
    <CURail registry={rails} pathname="/lanes" onNavigate={() => {}} peekOpen={false} />
  ))
  expect(c.querySelector('[data-rail="lanes"]')?.getAttribute('aria-current')).toBe('page')
  expect(peekOf(c).dataset.expanded).toBe('false')
  expect(c.querySelector('[data-testid="peek-body"]')).toBeNull()
})

test('anchor="bottom" の Rail は下起点 (.anchor-bottom) に入り、columnCenter / columnBottom / peekFooter slot を描ける', () => {
  const withBottom: RailDef[] = [
    ...rails,
    {
      id: 'settings',
      icon: Icon,
      labelKey: '設定',
      route: '/settings',
      peek: Peek,
      order: 2,
      anchor: 'bottom',
    },
  ]
  const c = mount(() => (
    <CURail
      registry={withBottom}
      pathname="/lanes"
      onNavigate={() => {}}
      columnCenter={<div class="slot-center">center</div>}
      columnBottom={<div class="slot-bottom">bottom</div>}
      peekFooter={<div class="slot-footer">footer</div>}
    />
  ))
  expect(c.querySelector('.anchor-top [data-rail="lanes"]')).not.toBeNull()
  expect(c.querySelector('.anchor-center .slot-center')).not.toBeNull()
  const bottom = c.querySelector('.anchor-bottom')!
  const order = Array.from(bottom.children).map(
    (el) => el.getAttribute('data-rail') ?? el.className,
  )
  expect(order).toEqual(['slot-bottom', 'settings'])
  expect(peekOf(c).querySelector('.slot-footer')).not.toBeNull()
})

test('keepPeeksMounted=true では開いている間全 Rail の peek を mount したまま選択外を hidden にする', () => {
  const PeekA = () => <div class="peek-a">a</div>
  const PeekB = () => <div class="peek-b">b</div>
  const twoRails: RailDef[] = [
    { id: 'lanes', icon: Icon, labelKey: 'Lanes', route: '/lanes', peek: PeekA, order: 0 },
    { id: 'actions', icon: Icon, labelKey: 'Actions', route: '/actions', peek: PeekB, order: 1 },
  ]
  const c = mount(() => (
    <CURail registry={twoRails} pathname="/lanes" onNavigate={() => {}} keepPeeksMounted />
  ))
  const sectionLanes = c.querySelector('[data-peek="lanes"]') as HTMLElement
  const sectionActions = c.querySelector('[data-peek="actions"]') as HTMLElement
  expect(sectionLanes.hidden).toBe(false)
  expect(sectionActions.hidden).toBe(true)
})
