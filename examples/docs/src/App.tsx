import { Router, Route } from '@solidjs/router'
import { lazy } from 'solid-js'
import Layout from './layout/Layout'

const Home = lazy(() => import('./pages/Home'))
const Stub = lazy(() => import('./pages/Stub'))

// Foundations
const Principles = lazy(() => import('./pages/Foundations/Principles'))
const Color = lazy(() => import('./pages/Foundations/Color'))
const Typography = lazy(() => import('./pages/Foundations/Typography'))
const Spacing = lazy(() => import('./pages/Foundations/Spacing'))
const Radius = lazy(() => import('./pages/Foundations/Radius'))
const Shadow = lazy(() => import('./pages/Foundations/Shadow'))
const Theming = lazy(() => import('./pages/Foundations/Theming'))

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/getting-started" component={Stub} />
      <Route path="/foundations" component={Principles} />
      <Route path="/foundations/principles" component={Principles} />
      <Route path="/foundations/color" component={Color} />
      <Route path="/foundations/typography" component={Typography} />
      <Route path="/foundations/spacing" component={Spacing} />
      <Route path="/foundations/radius" component={Radius} />
      <Route path="/foundations/shadow" component={Shadow} />
      <Route path="/foundations/theming" component={Theming} />
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
