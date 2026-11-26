import { EditorHostProvider, EditorLayer } from '@chronista-club/creo-ui-editor-host'
import { createRouter, useNavigate } from '@solidjs/router'
import type { JSX } from '@solidjs/web'
import { lazy, onSettled } from 'solid-js'
import Layout from './layout/Layout'

// Editor Mode は site 全体で 1 host (一本化 2026-08-13)。どのページでも
// Ctrl+Shift+E で ON になり、Discovery がそのページの component を映す。
// Portal (EditorLayer) は body 直下に mount されるので Layout の外に置く。
function Root(props: { children?: JSX.Element }) {
  return (
    <EditorHostProvider
      config={{
        localStorageNamespace: 'creo-ui-site',
        // selectionRoot は指定しない (= body 全体)。site chrome (Header / Sidebar /
        // ThemeSwitcher) も creo component なので Editor の編集対象に含める
        // 通常の nav click はそのまま操作できる。「画面から選ぶ」の間だけ選択になる
        // D-16: dev では VP daemon の hub に Link で顔を出す (URL 固定。居なければ再接続を
        // 待つだけだが、ブラウザの接続エラーは console に出る)。公開 site は loopback に繋がない
        link: import.meta.env.DEV ? { app: 'creo-ui' } : undefined,
      }}
    >
      <Layout>{props.children}</Layout>
      <EditorLayer appName="creo-ui" />
    </EditorHostProvider>
  )
}

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
const FocusRing = lazy(() => import('./pages/Foundations/FocusRing'))
const Motion = lazy(() => import('./pages/Foundations/Motion'))
const ConcentricCorner = lazy(() => import('./pages/Foundations/ConcentricCorner'))
const Density = lazy(() => import('./pages/Foundations/Density'))
const Iconography = lazy(() => import('./pages/Foundations/Iconography'))
const KineticTypography = lazy(() => import('./pages/Foundations/KineticTypography'))

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
const FormField = lazy(() => import('./pages/Components/FormField'))
const Segmented = lazy(() => import('./pages/Components/Segmented'))
const Toast = lazy(() => import('./pages/Components/Toast'))
const Accordion = lazy(() => import('./pages/Components/Accordion'))
const Outliner = lazy(() => import('./pages/Components/Outliner'))
const Popover = lazy(() => import('./pages/Components/Popover'))
const Drawer = lazy(() => import('./pages/Components/Drawer'))
const EmptyState = lazy(() => import('./pages/Components/EmptyState'))
const Combobox = lazy(() => import('./pages/Components/Combobox'))
const Select = lazy(() => import('./pages/Components/Select'))
const Header = lazy(() => import('./pages/Components/Header'))
const ErrorBoundary = lazy(() => import('./pages/Components/ErrorBoundary'))
const Stack = lazy(() => import('./pages/Components/Stack'))
const Grid = lazy(() => import('./pages/Components/Grid'))
const Container = lazy(() => import('./pages/Components/Container'))
const Divider = lazy(() => import('./pages/Components/Divider'))

// Resources
const Icons = lazy(() => import('./pages/Resources/Icons'))
const Content = lazy(() => import('./pages/Resources/Content'))

// Lab + Overview
const EditorLab = lazy(() => import('./pages/Lab/EditorLab'))
const FrameLab = lazy(() => import('./pages/Lab/FrameLab'))
const VisionLab = lazy(() => import('./pages/Lab/VisionLab'))
const LayoutLab = lazy(() => import('./pages/Lab/LayoutLab'))
const FrameNestLab = lazy(() => import('./pages/Lab/FrameNestLab'))
const GettingStarted = lazy(() => import('./pages/GettingStarted'))

function RedirectToEditorLab() {
  const navigate = useNavigate()
  onSettled(() => navigate('/creo-ui/lab/editor', { replace: true }))
  return null
}

// base: doc.anycreative.tech の hub 配下 /creo-ui/ で配信 (vite.config.ts の base と対)
const Router = createRouter({
  base: '/creo-ui',
  routes: [
    { path: '/', component: Home },
    { path: '/getting-started', component: GettingStarted },
    { path: '/foundations', component: Principles },
    { path: '/foundations/principles', component: Principles },
    { path: '/foundations/color', component: Color },
    { path: '/foundations/typography', component: Typography },
    { path: '/foundations/spacing', component: Spacing },
    { path: '/foundations/radius', component: Radius },
    { path: '/foundations/shadow', component: Shadow },
    { path: '/foundations/theming', component: Theming },
    { path: '/foundations/focus-ring', component: FocusRing },
    { path: '/foundations/motion', component: Motion },
    { path: '/foundations/concentric-corner', component: ConcentricCorner },
    { path: '/foundations/density', component: Density },
    { path: '/foundations/iconography', component: Iconography },
    { path: '/foundations/kinetic-typography', component: KineticTypography },
    { path: '/concepts', component: FrameSystem },
    { path: '/concepts/frame-system', component: FrameSystem },
    { path: '/concepts/editor-mode', component: EditorMode },
    { path: '/concepts/layers', component: Layers },
    { path: '/concepts/multi-platform', component: MultiPlatform },
    { path: '/editor-mode', component: EditorMode },
    { path: '/components', component: ComponentsIndex },
    { path: '/components/button', component: Button },
    { path: '/components/input', component: Input },
    { path: '/components/card', component: Card },
    { path: '/components/avatar', component: Avatar },
    { path: '/components/dialog', component: Dialog },
    { path: '/components/checkbox', component: Checkbox },
    { path: '/components/radio', component: Radio },
    { path: '/components/switch', component: Switch },
    { path: '/components/badge', component: Badge },
    { path: '/components/tooltip', component: Tooltip },
    { path: '/components/alert', component: Alert },
    { path: '/components/tabs', component: Tabs },
    { path: '/components/breadcrumbs', component: Breadcrumbs },
    { path: '/components/menu', component: Menu },
    { path: '/components/pagination', component: Pagination },
    { path: '/components/table', component: Table },
    { path: '/components/timeline', component: Timeline },
    { path: '/components/stepper', component: Stepper },
    { path: '/components/progress', component: Progress },
    { path: '/components/skeleton', component: Skeleton },
    { path: '/components/form-field', component: FormField },
    { path: '/components/segmented', component: Segmented },
    { path: '/components/toast', component: Toast },
    { path: '/components/accordion', component: Accordion },
    { path: '/components/outliner', component: Outliner },
    { path: '/components/popover', component: Popover },
    { path: '/components/drawer', component: Drawer },
    { path: '/components/empty-state', component: EmptyState },
    { path: '/components/combobox', component: Combobox },
    { path: '/components/select', component: Select },
    { path: '/components/header', component: Header },
    { path: '/components/error-boundary', component: ErrorBoundary },
    { path: '/components/stack', component: Stack },
    { path: '/components/grid', component: Grid },
    { path: '/components/container', component: Container },
    { path: '/components/divider', component: Divider },
    { path: '/icons', component: Icons },
    { path: '/content', component: Content },
    { path: '/lab/editor', component: EditorLab },
    { path: '/lab/frame', component: FrameLab },
    { path: '/lab/frame-nest', component: FrameNestLab },
    { path: '/lab/vision', component: VisionLab },
    { path: '/lab/layout', component: LayoutLab },
    // 旧 /playground は Editor lab へ redirect (既存リンク保護)
    { path: '/playground', component: RedirectToEditorLab },
    { path: '*404', component: Stub },
  ],
})

export default function App() {
  return <Router>{(props) => <Root>{props.children}</Root>}</Router>
}
