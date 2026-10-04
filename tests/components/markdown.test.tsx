// R02: mem_1Cf1aYkR2EcfhbdmQxpVSx
import { createSignal, type JSX } from 'solid-js'
import { render } from 'solid-js/web'
import { afterEach, expect, test, vi } from 'vitest'
import { CreoMarkdown } from '../../packages/md-view/src'

const cleanups: Array<() => void> = []
afterEach(() => {
  for (const cleanup of cleanups.splice(0).reverse()) cleanup()
})
function mount(view: () => JSX.Element) {
  const container = document.createElement('div')
  document.body.append(container)
  const dispose = render(view, container)
  cleanups.push(() => {
    dispose()
    container.remove()
  })
  return container
}

test('text-only API renders GFM, references and frontmatter through the installed parser', async () => {
  let astType = ''
  const container = mount(() => (
    <CreoMarkdown
      text={
        '---\ntitle: hidden\n---\n# Hello\n\n[Reference][doc]\n\n[doc]: https://example.com\n\n- [x] done\n- plain\n\n| left | right |\n| :--- | ---: |\n| a | b |\n\n~~gone~~'
      }
      onAst={(ast) => {
        astType = ast.type
      }}
    />
  ))
  await vi.waitFor(() => expect(container.querySelector('h1')?.textContent).toBe('Hello'))
  expect(astType).toBe('root')
  expect(container.textContent).not.toContain('title: hidden')
  expect(container.querySelector('a')?.href).toBe('https://example.com/')
  expect(container.querySelector('input')?.checked).toBe(true)
  expect(container.querySelectorAll('input')).toHaveLength(1)
  expect(container.querySelector('del')?.textContent).toBe('gone')
  expect(container.querySelectorAll('table th')).toHaveLength(2)
  expect(container.querySelectorAll('table td')[1]?.getAttribute('align')).toBe('right')
})

test('consumer signal updates replace the rendered document', async () => {
  const [text, setText] = createSignal('# First')
  const container = mount(() => <CreoMarkdown text={text()} />)
  await vi.waitFor(() => expect(container.querySelector('h1')?.textContent).toBe('First'))
  setText('## Second')
  await vi.waitFor(() => expect(container.querySelector('h2')?.textContent).toBe('Second'))
  expect(container.querySelector('h1')).toBeNull()
})

test('raw HTML is text by default and unsafe Markdown URLs are removed', async () => {
  const container = mount(() => (
    <CreoMarkdown
      text={
        '<img src=x onerror="alert(1)">\n\n[bad](javascript:alert%281%29)\n\n![bad](data:text/html,bad)'
      }
    />
  ))
  await vi.waitFor(() => expect(container.querySelector('a')).not.toBeNull())
  expect(container.textContent).toContain('<img')
  expect(container.querySelector('[onerror]')).toBeNull()
  expect(container.querySelector('a')?.hasAttribute('href')).toBe(false)
  expect(container.querySelector('img')?.hasAttribute('src')).toBe(false)
})

test('opt-in HTML is sanitized before DOM creation', async () => {
  const container = mount(() => (
    <CreoMarkdown
      allowHtml
      text={
        '<b>allowed</b><img src="https://example.com/a.png" onerror="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">bad</a>'
      }
    />
  ))
  await vi.waitFor(() => expect(container.querySelector('b')?.textContent).toBe('allowed'))
  expect(container.querySelector('script')).toBeNull()
  expect(container.querySelector('[onerror]')).toBeNull()
  expect(container.querySelector('a')?.hasAttribute('href')).toBe(false)
  expect(container.querySelector('img')?.src).toBe('https://example.com/a.png')
})

test('consumer replaces links, images and fenced code using display props', async () => {
  const container = mount(() => (
    <CreoMarkdown
      text={'[docs](/guide)\n\n![cover](/cover.png)\n\n```mermaid\ngraph TD\n```'}
      components={{
        a: (props) => (
          <a data-custom-link href={props.href}>
            {props.children}
          </a>
        ),
        img: (props) => <img data-custom-image src={props.src} alt={props.alt} />,
        code: (props) => <pre data-language={props.language}>{props.code}</pre>,
      }}
    />
  ))
  await vi.waitFor(() => expect(container.querySelector('[data-custom-link]')).not.toBeNull())
  expect(container.querySelector('[data-custom-link]')?.getAttribute('href')).toBe('/guide')
  expect(container.querySelector('[data-custom-image]')?.getAttribute('alt')).toBe('cover')
  expect(container.querySelector('[data-language="mermaid"]')?.textContent).toContain('graph TD')
})

test('parse callback errors use fallback and a new document can recover', async () => {
  const [text, setText] = createSignal('bad')
  const container = mount(() => (
    <CreoMarkdown
      text={text()}
      onAst={() => {
        if (text() === 'bad') throw new Error('consumer error')
      }}
      fallback={(error) => <span role="alert">{error}</span>}
    />
  ))
  await vi.waitFor(() =>
    expect(container.querySelector('[role="alert"]')?.textContent).toContain('consumer error'),
  )
  setText('# recovered')
  await vi.waitFor(() => expect(container.querySelector('h1')?.textContent).toBe('recovered'))
})

test('footnote references resolve within each of two Markdown viewers', async () => {
  const markdown = 'note[^one]\n\n[^one]: detail'
  const container = mount(() => (
    <>
      <CreoMarkdown text={markdown} />
      <CreoMarkdown text={markdown} />
    </>
  ))
  await vi.waitFor(() => expect(container.querySelectorAll('sup a')).toHaveLength(2))
  const ids = [...container.querySelectorAll('[id]')].map((node) => node.id)
  expect(new Set(ids).size).toBe(ids.length)
  for (const viewer of container.querySelectorAll('.creo-md')) {
    const describedBy = viewer.querySelector('sup a')?.getAttribute('aria-describedby')
    expect([...viewer.querySelectorAll('[id]')].some((node) => node.id === describedBy)).toBe(true)
    for (const anchor of viewer.querySelectorAll('a[href^="#"]')) {
      const target = anchor.getAttribute('href')!.slice(1)
      expect([...viewer.querySelectorAll('[id]')].some((node) => node.id === target)).toBe(true)
    }
  }
})
