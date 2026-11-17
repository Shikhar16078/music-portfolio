import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { rise, stagger } from '@/lib/motion'
import { cn } from '@/lib/utils'

/** Shared section wrapper: anchor id, page gutters and the eyebrow + title pattern. */
export function Section({
  id,
  eyebrow,
  title,
  intro,
  className,
  children,
}: {
  id: string
  eyebrow: string
  title: ReactNode
  intro?: ReactNode
  className?: string
  children?: ReactNode
}) {
  return (
    <section id={id} className={cn('scroll-mt-28 py-24 md:py-32', className)}>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className="mx-auto flex max-w-(--container-wide) flex-col gap-12 px-6 md:px-12 lg:px-24"
      >
        <motion.div variants={rise} className="flex flex-col gap-4">
          <p className="font-mono text-xs tracking-wide text-accent uppercase">{eyebrow}</p>
          <h2 className="max-w-3xl font-heading text-[40px] leading-12 font-medium tracking-h1 md:text-4xl">
            {title}
          </h2>
          {intro && <p className="max-w-(--container-prose) text-lg text-fg-muted">{intro}</p>}
        </motion.div>
        {children && <motion.div variants={rise}>{children}</motion.div>}
      </motion.div>
    </section>
  )
}

/** Italic serif accent used inside headings ("one song at a time."). */
export function Accent({ children }: { children: ReactNode }) {
  return <em className="font-display font-normal tracking-display">{children}</em>
}
