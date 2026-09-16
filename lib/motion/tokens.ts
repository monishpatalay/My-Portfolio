/**
 * Motion tokens — mirrors styles/tokens.css (PRD §12.5) so GSAP/Motion/WebGL
 * code reads the same durations, eases and springs as CSS. Keep both files
 * in sync by hand until the §12.5 lint step (grep for bare literals) lands;
 * that step is what will eventually generate one of these from the other.
 */

// Durations in seconds (GSAP/Motion convention) — CSS uses ms of the same number.
export const dur = {
  instant: 0.08,
  micro: 0.12,
  fast: 0.18,
  base: 0.24,
  mid: 0.35,
  slow: 0.6,
  reveal: 0.9,
  cine: 1.4,
  epic: 1.8,
} as const;

export const exitRatio = 0.7;

// Cubic-bezier control points — identical curves registered with GSAP's
// CustomEase in loop.ts, so CSS, GSAP and Motion never disagree by a frame.
export const ease = {
  out: [0.16, 1, 0.3, 1],
  in: [0.7, 0, 0.84, 0],
  io: [0.65, 0, 0.35, 1],
  cine: [0.87, 0, 0.13, 1],
  smooth: [0.22, 1, 0.36, 1],
  std: [0.4, 0, 0.2, 1],
  amb: [0.37, 0, 0.63, 1],
} as const;

// GSAP-named overshoot eases (never expressed as bezier — control points
// would fall outside 0..1, which §12.5 bans from the token file).
export const overshoot = {
  back: "back.out(1.4)",
  elastic: "elastic.out(1, 0.4)",
} as const;

export const spring = {
  snap: { stiffness: 400, damping: 40 },
  ui: { stiffness: 300, damping: 30 },
  press: { stiffness: 280, damping: 26 },
  gentle: { stiffness: 120, damping: 20 },
  release: { stiffness: 200, damping: 20 },
  playful: { stiffness: 400, damping: 14 },
} as const;

export const stagger = {
  char: 0.018,
  word: 0.04,
  line: 0.08,
  item: 0.05,
  card: 0.08,
  ceiling: 0.6,
} as const;

export const distance = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 48,
} as const;

export const scale = {
  press: 0.97,
  subtle: 0.98,
  pop: 1.04,
  card: 1.06,
} as const;
