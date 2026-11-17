import { motion } from 'motion/react'
import { Badge } from '@/components/ui/badge'
import { rise, stagger, ease } from '@/lib/motion'

/** Relative bar heights for the "breathing" waveform (0–1). */
const BARS = [
  0.18, 0.3, 0.46, 0.38, 0.62, 0.5, 0.78, 0.58, 0.92, 0.7, 1, 0.74, 0.86, 0.6, 0.72, 0.44, 0.56,
  0.34, 0.42, 0.24, 0.3, 0.16,
]

/** Temporary landing page while the full site is built from the Paper design. */
export default function App() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-bg text-fg">
      {/* Lamplight glow, same as the design cover */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_20%,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_70%)]"
      />

      <header className="relative mx-auto flex w-full max-w-(--container-wide) items-center justify-between px-6 pt-8 md:px-12">
        <div className="flex items-center gap-2">
          <span className="font-heading text-xl font-medium tracking-tight">Shikhar Kumar</span>
          <span aria-hidden className="size-2 rounded-full bg-accent" />
        </div>
        <span className="hidden font-mono text-xs tracking-wide text-fg-subtle uppercase sm:inline">
          music.shikharkumar.in
        </span>
      </header>

      <motion.main
        initial="hidden"
        animate="show"
        variants={stagger}
        className="relative mx-auto flex w-full max-w-(--container-wide) flex-1 flex-col justify-center gap-8 px-6 py-24 md:px-12"
      >
        <motion.div variants={rise}>
          <Badge
            variant="outline"
            className="h-8 gap-2 rounded-full border-border-strong px-3 font-mono text-xs tracking-wide text-fg-muted uppercase"
          >
            <span aria-hidden className="size-1.5 animate-pulse rounded-full bg-accent" />
            In the practice room
          </Badge>
        </motion.div>

        <motion.h1
          variants={rise}
          className="max-w-4xl font-display text-[56px] leading-[56px] tracking-display md:text-5xl"
        >
          Still tuning <em className="text-accent">the piano.</em>
        </motion.h1>

        <motion.p variants={rise} className="max-w-(--container-prose) text-lg text-fg-muted">
          This is where piano covers and practice tapes will live: film scores, Bollywood and pop,
          rearranged for solo piano and recorded at home. The site is being built right now. Check
          back soon.
        </motion.p>

        <motion.div variants={rise} aria-hidden className="flex h-16 items-center gap-1.5">
          {BARS.map((h, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-accent"
              style={{ height: `${h * 100}%` }}
              animate={{ scaleY: [1, 0.55, 1] }}
              transition={{
                duration: 2.4,
                ease: ease.breath,
                repeat: Infinity,
                delay: i * 0.08,
              }}
            />
          ))}
        </motion.div>
      </motion.main>

      <footer className="relative mx-auto w-full max-w-(--container-wide) px-6 pb-8 md:px-12">
        <div className="border-t border-border pt-6 font-mono text-xs tracking-wide text-fg-subtle uppercase">
          ©2026 Shikhar Kumar · All rights reserved
        </div>
      </footer>
    </div>
  )
}
