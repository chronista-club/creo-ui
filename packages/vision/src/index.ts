/**
 * creo-ui-vision — Webcam motion capture (Solid signals)
 *
 * Phase 4 (skeleton + types + provider + hooks) Ship 済。
 * 実 MediaPipe Tasks Web SDK 統合は P-4.5 で実装。
 *
 * 詳細は ../README.md と docs/design/vision-input.md。
 */

export {
  useFaceMesh,
  useFacePresence,
  useGesture,
  useHandPinch,
  useHandPointing,
  useHeadPose,
  useVisionState,
} from './hooks'
// Permission helpers
export {
  type CameraPermissionState,
  getCameraPermission,
  requestCameraStream,
  stopCameraStream,
} from './permission'

// Provider + hooks
export {
  useVision,
  type VisionContextValue,
  VisionProvider,
  type VisionProviderProps,
} from './provider'
// Smoothing (One-Euro filter for jitter reduction)
export {
  applyGain,
  OneEuroFilter,
  Point3DSmoother,
  type SmoothingOptions,
} from './smoothing'
// Source interface (plug-in基盤)
export type { VisionListener, VisionSource, VisionUpdate } from './source'
// Types
export type {
  FaceMesh,
  GestureEvent,
  HandPinch,
  HandPointing,
  HeadPose,
  Point3D,
  VisionConfig,
  VisionState,
} from './types'
// Pure utilities
export {
  clamp,
  distance2D,
  distance3D,
  isPinchActive,
  normalizeAngle,
  pinchCenter,
  toViewportPixel,
} from './utils'
