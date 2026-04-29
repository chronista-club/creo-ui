import type { IconName } from '../core/types'

// Editor / Layout / Git icons — VS Code 文化に整合する codicon 中心。
// dev tool UI で familiar な見た目を提供。
export const EDITOR = {
  // terminal
  terminal: 'codicon:terminal' as IconName,
  terminalBash: 'codicon:terminal-bash' as IconName,
  terminalNew: 'codicon:terminal-new' as IconName,

  // layout / split
  splitHorizontal: 'codicon:split-horizontal' as IconName,
  splitVertical: 'codicon:split-vertical' as IconName,
  sidebarLeft: 'codicon:layout-sidebar-left' as IconName,
  sidebarRight: 'codicon:layout-sidebar-right' as IconName,
  panelBottom: 'codicon:layout-panel' as IconName,
  layout: 'codicon:layout' as IconName,

  // git
  gitBranch: 'codicon:git-branch' as IconName,
  gitMerge: 'codicon:git-merge' as IconName,
  gitPullRequest: 'codicon:git-pull-request' as IconName,
  gitCommit: 'codicon:git-commit' as IconName,
  gitCompare: 'codicon:git-compare' as IconName,
  sourceControl: 'codicon:source-control' as IconName,

  // editor actions
  fold: 'codicon:fold' as IconName,
  unfold: 'codicon:unfold' as IconName,
  findReplace: 'codicon:find-replace' as IconName,
  references: 'codicon:references' as IconName,

  // misc dev surface
  notebook: 'codicon:notebook' as IconName,
  debug: 'codicon:debug' as IconName,
  extensions: 'codicon:extensions' as IconName,
  output: 'codicon:output' as IconName,
} as const

export type EditorIconKey = keyof typeof EDITOR
