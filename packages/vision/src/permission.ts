/**
 * Camera permission helpers — getUserMedia の thin wrapper。
 *
 * V-2 (camera ON indicator) と V-5 (opt-in default) の支援用。 actual webcam
 * frame capture は MediaPipe source 側で行う、 こちらは permission 取得 + 状態取得のみ。
 */

export type CameraPermissionState = 'unknown' | 'granted' | 'denied' | 'pending'

/**
 * 現在の camera permission state を navigator.permissions API で取得。
 * 古い browser や API 未対応環境では 'unknown' を返す。
 */
export async function getCameraPermission(): Promise<CameraPermissionState> {
  if (typeof navigator === 'undefined') return 'unknown'
  if (!navigator.permissions || !navigator.permissions.query) return 'unknown'
  try {
    // 'camera' は PermissionName の Permissions API 拡張 (lib.dom.d.ts のバージョンによる)
    const status = await navigator.permissions.query({
      name: 'camera' as PermissionName,
    })
    if (status.state === 'granted') return 'granted'
    if (status.state === 'denied') return 'denied'
    return 'pending'
  } catch {
    return 'unknown'
  }
}

/**
 * Camera permission を request して MediaStream を返す。 user は dialog で許可 / 拒否。
 *
 * 拒否時は permission denied error を throw。 caller は graceful fallback (mock source / disabled UI) を実装。
 */
export async function requestCameraStream(
  facingMode: 'user' | 'environment' = 'user',
): Promise<MediaStream> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
    throw new Error('navigator.mediaDevices unavailable (SSR or insecure context)')
  }
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode },
    audio: false,
  })
}

/**
 * MediaStream を停止 (track を全 stop)。 unmount や stop() 時に呼ぶ、
 * 「camera ON indicator」 が消えるための contract。
 */
export function stopCameraStream(stream: MediaStream): void {
  stream.getTracks().forEach((t) => t.stop())
}
