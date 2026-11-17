import type { Transition, Variants } from 'motion/react'

/** Easing curves — keep in sync with --ease-* in index.css */
export const ease = {
  /** quick, confident attack: entrances, reveals */
  attack: [0.22, 1, 0.36, 1],
  /** symmetric: theme crossfades */
  breath: [0.65, 0, 0.35, 1],
} as const

/** Durations in seconds — keep in sync with --duration-* in index.css */
export const duration = {
  tap: 0.12,
  quick: 0.24,
  base: 0.4,
  slow: 0.64,
  sustain: 1.2,
} as const

export const spring = {
  /** press, tabs, layoutId transitions */
  key: { type: 'spring', stiffness: 400, damping: 32 },
  /** sheets, video theater, larger surfaces */
  settle: { type: 'spring', stiffness: 260, damping: 30 },
} as const satisfies Record<string, Transition>

/** Fade + rise 16px. Use with whileInView={{ once: true }} or on mount. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.attack } },
}

export const stagger: Variants = {
  show: { transition: { staggerChildren: 0.08 } },
}
