/**
 * Typed motion language for Cube Trainer.
 *
 * Animation principles (design-engineering / Emil Kowalski's approach):
 * - animate only `transform` / `opacity` (cheap, 60fps)
 * - spring or ease-out for enters; snappy ~150–250ms
 * - exit animations matter — don't pop things out
 * - micro-interactions are purposeful, not decorative
 * - always respect `prefers-reduced-motion` (see useReducedMotion)
 *
 * Keep CSS-mirror values in `globals.css` if a token is needed in both places.
 */
import type { Transition, Variants } from 'framer-motion'

export const ease = {
  /** Default enter easing — soft, decisive landing. */
  out: [0.16, 1, 0.3, 1] as const,
  /** Symmetric move (reordering, layout). */
  inOut: [0.65, 0, 0.35, 1] as const,
} as const

export const dur = {
  fast: 0.15,
  base: 0.22,
  slow: 0.4,
} as const

/** Snappy spring for interactive elements (chips, toggles, sheet handles). */
export const spring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 32,
  mass: 0.8,
}

/** Standard enter/exit for fading content (panels, overlays). */
export const fade: Variants = {
  hidden: { opacity: 0, y: 4 },
  show: { opacity: 1, y: 0, transition: { duration: dur.base, ease: ease.out } },
  exit: { opacity: 0, y: 4, transition: { duration: dur.fast, ease: ease.out } },
}

/** Pop for solve chips / new entries entering a list. */
export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: spring },
  exit: { opacity: 0, scale: 0.96, transition: { duration: dur.fast, ease: ease.out } },
}
