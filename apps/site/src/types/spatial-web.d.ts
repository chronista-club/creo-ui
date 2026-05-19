/**
 * Spatial web HTML elements — augment SolidJS JSX intrinsics for visionOS 26 features。
 *
 * `<model>` element (Apple WebKit、 visionOS 26+):
 *   https://webkit.org/blog/17118/a-step-into-the-spatial-web-the-html-model-element-in-apple-vision-pro/
 *   https://immersive-web.github.io/model-element/
 *
 * Spec が WIP なので、 ここでは Apple Safari visionOS 26 で実装されている surface のみ宣言。
 * 他 browser では子 `<img>` (子 element として書く) が graceful fallback として render される。
 */

import 'solid-js'

declare module 'solid-js' {
  namespace JSX {
    interface ModelElementAttributes extends HTMLAttributes<HTMLElement> {
      /**
       * `'orbit'` で pinch-and-drag による rotation interaction を有効化。
       * VisionOS Safari でのみ機能、 他 browser では fallback `<img>` が表示される。
       */
      stagemode?: 'orbit'
      /** Boolean attribute: animation の自動再生 */
      autoplay?: boolean
      /** Boolean attribute: animation の loop */
      loop?: boolean
      /** Custom HDR environment map URL (equirectangular) */
      environmentmap?: string
    }

    interface IntrinsicElements {
      model: ModelElementAttributes
    }
  }
}

/**
 * HTMLModelElement runtime interface (visionOS Safari 26+ で実装)。
 * 他 browser では `'HTMLModelElement' in window === false` で feature detect 可。
 */
interface HTMLModelElement extends HTMLElement {
  readonly ready: Promise<void>
  readonly environmentMapReady: Promise<void>
  entityTransform: DOMMatrix
  readonly boundingBoxCenter: DOMPointReadOnly
  readonly boundingBoxExtents: DOMPointReadOnly
  readonly duration: number
  currentTime: number
  playbackRate: number
  play(): void
  pause(): void
}

declare global {
  interface Window {
    HTMLModelElement?: typeof HTMLModelElement
  }
}
