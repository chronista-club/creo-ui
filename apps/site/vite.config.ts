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
  plugins: useHttps ? [solid(), basicSsl()] : [solid()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
})
