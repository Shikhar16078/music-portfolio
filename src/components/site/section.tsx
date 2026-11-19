import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Italic serif accent used inside headings ("one song at a time."). */
export function Accent({ children }: { children: ReactNode }) {
  return (
    <em className="md:tracking-inherit font-display font-normal tracking-[-0.01em]">{children}</em>
  )
}

/** Section headings share the Compact typography, with the 40/48 phone scale. */
export function SectionTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        'font-heading text-[40px] leading-12 font-medium tracking-h1 md:text-[56px] md:leading-16',
        className,
      )}
    >
      {children}
    </h2>
  )
}
