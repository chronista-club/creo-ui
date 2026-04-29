# creo-ui-icons-web

Iconify-based icon adapter for SolidJS web apps. Universal semantic registry with curated 9-set Iconify lineup.

## Lineup (10 sets, all permissive licenses)

| Prefix | Set | Role | License |
|--------|-----|------|---------|
| `mingcute:` | MingCute | friendly UI (button/dialog/menu) | Apache 2.0 |
| `iconoir:` | Iconoir | minimal/dense (sidebar/list/table) | MIT |
| `ph:` | Phosphor | expressive 6 weight (state-driven) | MIT |
| `svg-spinners:` | SVG Spinners | loading/pending (動的) | MIT |
| `codicon:` | Codicons | editor/git/layout (VS Code 文化) | MIT |
| `simple-icons:` | Simple Icons | brand mono logo | CC0 |
| `flagpack:` | Flagpack | i18n 国旗 (ISO 3166-1) | MIT |
| `noto:` | Noto Emoji | Unicode emoji (cross-platform 統一) | OFL 1.1 |
| `bi:` | Bootstrap Icons | file type (`filetype-*` subset) | MIT |

(Nerd Font は terminal/TUI/monospace 文脈用、 web UI 側ではない)

## Usage

```tsx
import { CreoIcon, SYSTEM } from 'creo-ui-icons-web'

// 直接 Iconify 名で
<CreoIcon name="ph:book-open" size={20} />
<CreoIcon name="ph:book-open-fill" size={20} color="var(--color-accent)" />

// semantic alias 経由 (推奨)
<CreoIcon name={SYSTEM.settings} size={16} />
<CreoIcon name={SYSTEM.settingsActive} size={16} />
```

## Architecture

2-layer split:
- **`creo-ui-icons-web`** (this package) — generic adapter + universal semantic registry (system / status / editor / brand / motion / flag / emoji / filetype)
- **VP-domain registry** (consumer 側、 例: `vantage-point/.../icons/`) — Stand / Lane / Mailbox / TheWorld 等の VP 概念固有 alias

詳細: creo-ui memory `feedback_creo_ui_icon_dual_axis.md` (2026-04-29 確定)

## Skeleton 段階の制約

- runtime mode: `@iconify/solid` が Iconify API から動的 fetch (offline 不可)
- production 化時は `@iconify-json/{prefix}` packages を bundle して offline 化予定
- 現状 registry は `system` 1 個のみ、 status/editor/brand/motion/flag/emoji/filetype は順次追加

## License

Apache-2.0
