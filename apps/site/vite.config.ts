import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

// HTTPS is enabled so that visionOS Safari (and iOS Safari) accepts
// `navigator.mediaDevices.getUserMedia()` over LAN IP — non-localhost http is not
// a secure context. Self-signed cert: visit `https://<lan-ip>:5173/` once on the
// device and tap "Visit Website" on the warning to trust it for the session.
// CREO_SITE_HTTP=1 で http に fallback (localhost での browser automation / screenshot 用 —
// Chrome は自己署名 interstitial への automation attach を拒否するため)。
const useHttps = process.env.CREO_SITE_HTTP !== '1'

export default defineConfig({
  // doc.anycreative.tech の hub (anycreative-doc worker) 配下 /creo-ui/ で配信するため。
  // hub は prefix を strip して creo-ui-doc worker へ転送するが、browser から見える
  // asset URL は /creo-ui/assets/... なので build 側で base を合わせる。
  base: '/creo-ui/',
  plugins: useHttps ? [solid(), basicSsl()] : [solid()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
})
