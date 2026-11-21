// cf の Wrangler bundler が読む build 設定 (cf migrate が wrangler.jsonc から書き出したもの)。
// worker の設定そのものは cloudflare.config.ts。
import { defineWranglerConfig } from 'wrangler/experimental-config'

export default defineWranglerConfig({
  assetsDirectory: './dist',
})
