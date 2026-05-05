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
const Checkbox = lazy(() => import('./pages/Components/Checkbox'))
const Radio = lazy(() => import('./pages/Components/Radio'))
const Switch = lazy(() => import('./pages/Components/Switch'))
const Badge = lazy(() => import('./pages/Components/Badge'))
const Tooltip = lazy(() => import('./pages/Components/Tooltip'))
const Alert = lazy(() => import('./pages/Components/Alert'))
const Tabs = lazy(() => import('./pages/Components/Tabs'))
const Breadcrumbs = lazy(() => import('./pages/Components/Breadcrumbs'))
const Menu = lazy(() => import('./pages/Components/Menu'))
const Pagination = lazy(() => import('./pages/Components/Pagination'))
const Table = lazy(() => import('./pages/Components/Table'))
const Timeline = lazy(() => import('./pages/Components/Timeline'))
const Stepper = lazy(() => import('./pages/Components/Stepper'))
const Progress = lazy(() => import('./pages/Components/Progress'))
const Skeleton = lazy(() => import('./pages/Components/Skeleton'))

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
      <Route path="/components/checkbox" component={Checkbox} />
      <Route path="/components/radio" component={Radio} />
      <Route path="/components/switch" component={Switch} />
      <Route path="/components/badge" component={Badge} />
      <Route path="/components/tooltip" component={Tooltip} />
      <Route path="/components/alert" component={Alert} />
      <Route path="/components/tabs" component={Tabs} />
      <Route path="/components/breadcrumbs" component={Breadcrumbs} />
      <Route path="/components/menu" component={Menu} />
      <Route path="/components/pagination" component={Pagination} />
      <Route path="/components/table" component={Table} />
      <Route path="/components/timeline" component={Timeline} />
      <Route path="/components/stepper" component={Stepper} />
      <Route path="/components/progress" component={Progress} />
      <Route path="/components/skeleton" component={Skeleton} />
      <Route path="/icons" component={Icons} />
      <Route path="/content" component={Content} />
      <Route path="/playground" component={Playground} />
      <Route path="*" component={Stub} />
    </Router>
  )
}
