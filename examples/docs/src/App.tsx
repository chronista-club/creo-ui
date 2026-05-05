import { Route, Router } from '@solidjs/router'
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

// Concepts
const FrameSystem = lazy(() => import('./pages/Concepts/FrameSystem'))
const EditorMode = lazy(() => import('./pages/Concepts/EditorMode'))
const Layers = lazy(() => import('./pages/Concepts/Layers'))
const MultiPlatform = lazy(() => import('./pages/Concepts/MultiPlatform'))

// Components
const ComponentsIndex = lazy(() => import('./pages/Components/index'))
const Button = lazy(() => import('./pages/Components/Button'))
const Input = lazy(() => import('./pages/Components/Input'))
const Card = lazy(() => import('./pages/Components/Card'))
const Avatar = lazy(() => import('./pages/Components/Avatar'))
const Dialog = lazy(() => import('./pages/Components/Dialog'))

// Resources
const Icons = lazy(() => import('./pages/Resources/Icons'))
const Content = lazy(() => import('./pages/Resources/Content'))

// Lab + Overview
const Playground = lazy(() => import('./pages/Lab/Playground'))
const GettingStarted = lazy(() => import('./pages/GettingStarted'))

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/getting-started" component={GettingStarted} />
      <Route path="/foundations" component={Principles} />
      <Route path="/foundations/principles" component={Principles} />
      <Route path="/foundations/color" component={Color} />
      <Route path="/foundations/typography" component={Typography} />
      <Route path="/foundations/spacing" component={Spacing} />
      <Route path="/foundations/radius" component={Radius} />
      <Route path="/foundations/shadow" component={Shadow} />
      <Route path="/foundations/theming" component={Theming} />
      <Route path="/concepts" component={FrameSystem} />
      <Route path="/concepts/frame-system" component={FrameSystem} />
      <Route path="/concepts/editor-mode" component={EditorMode} />
      <Route path="/concepts/layers" component={Layers} />
      <Route path="/concepts/multi-platform" component={MultiPlatform} />
      <Route path="/editor-mode" component={EditorMode} />
      <Route path="/components" component={ComponentsIndex} />
      <Route path="/components/button" component={Button} />
      <Route path="/components/input" component={Input} />
      <Route path="/components/card" component={Card} />
      <Route path="/components/avatar" component={Avatar} />
      <Route path="/components/dialog" component={Dialog} />
      <Route path="/icons" component={Icons} />
      <Route path="/content" component={Content} />
      <Route path="/playground" component={Playground} />
      <Route path="*" component={Stub} />
    </Router>
  )
}
