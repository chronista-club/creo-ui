import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'
import solid from 'vite-plugin-solid'

// HTTPS is enabled so that visionOS Safari (and iOS Safari) accepts
// `navigator.mediaDevices.getUserMedia()` over LAN IP — non-localhost http is not
// a secure context. Self-signed cert: visit `https://<lan-ip>:5173/` once on the
// device and tap "Visit Website" on the warning to trust it for the session.
export default defineConfig({
  plugins: [solid(), basicSsl()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
})
