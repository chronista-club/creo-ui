import { Router, Route } from '@solidjs/router'
import { lazy } from 'solid-js'
import Layout from './layout/Layout'

const Home = lazy(() => import('./pages/Home'))
const Stub = lazy(() => import('./pages/Stub'))

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/getting-started" component={Stub} />
      <Route path="/foundations" component={Stub} />
      <Route path="/foundations/color" component={Stub} />
      <Route path="/foundations/typography" component={Stub} />
      <Route path="/foundations/spacing" component={Stub} />
      <Route path="/foundations/radius" component={Stub} />
      <Route path="/foundations/shadow" component={Stub} />
      <Route path="/foundations/theming" component={Stub} />
      <Route path="/components" component={Stub} />
      <Route path="/components/button" component={Stub} />
      <Route path="/components/input" component={Stub} />
      <Route path="/components/card" component={Stub} />
      <Route path="/components/avatar" component={Stub} />
      <Route path="/components/dialog" component={Stub} />
      <Route path="/icons" component={Stub} />
      <Route path="/content" component={Stub} />
      <Route path="/editor-mode" component={Stub} />
      <Route path="/playground" component={Stub} />
      <Route path="*" component={Stub} />
    </Router>
  )
}
