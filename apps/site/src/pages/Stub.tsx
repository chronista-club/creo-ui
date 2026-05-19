import { useLocation } from '@solidjs/router'

export default function Stub() {
  const loc = useLocation()
  return (
    <section class="docs-stub">
      <p class="docs-stub-eyebrow">Coming soon</p>
      <h1>{prettyTitle(loc.pathname)}</h1>
      <p class="docs-stub-body">
        この page は次の stage で content が入ります。 Sidebar 左の他 link でナビゲートできます。
      </p>
      <code class="docs-stub-path">{loc.pathname}</code>
    </section>
  )
}

function prettyTitle(path: string): string {
  if (path === '/' || path === '') return 'Home'
  const last = path.split('/').filter(Boolean).pop() ?? ''
  return last
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}
