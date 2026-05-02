/**
 * creo-ui-vision — Webcam motion capture (Solid signals)
 *
 * Phase 4 (skeleton + types + provider + hooks) Ship 済。
 * 実 MediaPipe Tasks Web SDK 統合は P-4.5 で実装。
 *
 * 詳細は ../README.md と docs/design/vision-input.md。
 */

// Types
export type {
  Point3D,
  HandPinch,
  HandPointing,
  HeadPose,
  FaceMesh,
  GestureEvent,
  VisionState,
  VisionConfig,
} from './types'

// Source interface (plug-in基盤)
export type { VisionSource, VisionListener, VisionUpdate } from './source'

// Provider + hooks
export {
  VisionProvider,
  useVision,
  type VisionProviderProps,
  type VisionContextValue,
} from './provider'
export {
  useVisionState,
  useHandPinch,
  useHandPointing,
  useHeadPose,
  useFaceMesh,
  useFacePresence,
  useGesture,
} from './hooks'

// Permission helpers
export {
  getCameraPermission,
  requestCameraStream,
  stopCameraStream,
  type CameraPermissionState,
} from './permission'

// Pure utilities
export {
  distance3D,
  distance2D,
  isPinchActive,
  pinchCenter,
  normalizeAngle,
  clamp,
  toViewportPixel,
} from './utils'
