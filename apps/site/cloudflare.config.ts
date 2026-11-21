// creo-ui 公式 site (apps/site) の Cloudflare Workers (static assets) 配信設定。cf CLI が読む。
//
// - 公開 URL: https://doc.anycreative.tech/creo-ui/
//   custom domain は hub (chronista-club/anycreative-doc の worker) が保有し、
//   /creo-ui/* を prefix strip してこの worker へ service binding 転送する。
//   この worker 自体は route を持たない (workers.dev preview のみ)。
// - assets-only worker (script なし)。SPA なので notFoundHandling で index.html に fallback
// - browser から見える asset URL は /creo-ui/... — vite.config.ts の base と対
// - assets の置き場 (./dist) は wrangler.config.ts。cf は build を Wrangler に任せる
// - deploy 経路は 2 つ (どちらも `cf deploy`):
//     local:  bun run site:deploy (要 `cf auth login`、または CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID)
//     CD:     .github/workflows/deploy-site.yml — release cut (main への push) 毎に自動 deploy
// - dist は site:build (build:web → build:packages → vite build) の成果物。cf build は vite を呼ばない
import { defineConfig } from 'cf/config'

export default defineConfig({
  worker: {
    name: 'creo-ui-doc',
    compatibilityDate: '2026-07-01',
    assets: {
      notFoundHandling: 'single-page-application',
    },
  },
})
