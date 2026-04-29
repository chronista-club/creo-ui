import type { IconName } from '../core/types'

// Brand mono logo icons — simple-icons (CC0、 brand-monochrome)。
// dev / collab / cloud service の inline reference 用。
// color logo が必要な場面では direct に `logos:github-icon` 等を使う (本 registry には含めない)。
export const BRAND = {
  // code hosting / collaboration
  github: 'simple-icons:github' as IconName,
  gitlab: 'simple-icons:gitlab' as IconName,
  bitbucket: 'simple-icons:bitbucket' as IconName,

  // project management
  linear: 'simple-icons:linear' as IconName,
  notion: 'simple-icons:notion' as IconName,
  jira: 'simple-icons:jira' as IconName,
  asana: 'simple-icons:asana' as IconName,

  // communication
  slack: 'simple-icons:slack' as IconName,
  discord: 'simple-icons:discord' as IconName,

  // AI service
  anthropic: 'simple-icons:anthropic' as IconName,
  openai: 'simple-icons:openai' as IconName,
  googlegemini: 'simple-icons:googlegemini' as IconName,

  // cloud / infra
  vercel: 'simple-icons:vercel' as IconName,
  cloudflare: 'simple-icons:cloudflare' as IconName,
  aws: 'simple-icons:amazonwebservices' as IconName,

  // package mgr / runtime
  npm: 'simple-icons:npm' as IconName,
  pnpm: 'simple-icons:pnpm' as IconName,
  bun: 'simple-icons:bun' as IconName,
  deno: 'simple-icons:deno' as IconName,

  // language
  rust: 'simple-icons:rust' as IconName,
  typescript: 'simple-icons:typescript' as IconName,
  javascript: 'simple-icons:javascript' as IconName,
  python: 'simple-icons:python' as IconName,
  go: 'simple-icons:go' as IconName,
  swift: 'simple-icons:swift' as IconName,
} as const

export type BrandIconKey = keyof typeof BRAND
