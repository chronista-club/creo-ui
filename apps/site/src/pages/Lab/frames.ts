import type { Frame } from 'creo-ui-frame'

export const dashboardFrame: Frame = {
  id: 'dashboard',
  slots: {
    hero: { x: '0%', y: '-30%', z: 8 },
    sidebar: { x: '-30%', y: '0%', z: 0 },
    main: { x: '20%', y: '10%', z: 4 },
  },
  perspective: 1400,
  // overview は視線をやや上に (俯瞰気味)
  gaze: { x: '50%', y: '38%' },
  transition: { duration: 480, easing: 'spring' },
}

export const readingFrame: Frame = {
  id: 'reading',
  slots: {
    hero: { x: '0%', y: '-40%', z: 16, scale: 1.2 },
    sidebar: { x: '-65%', y: '0%', z: -20, opacity: 0.25 },
    main: { x: '0%', y: '0%', z: 8, scale: 1.05 },
  },
  perspective: 'var(--frame-perspective-deep)',
  // reading は視線を下げて content に潜り込む (horizon が下がり morph 時に視点も動く)
  gaze: { x: '50%', y: '56%' },
  transition: { duration: 480, easing: 'spring' },
}
