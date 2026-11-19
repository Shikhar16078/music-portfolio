import { ArrowUpIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SECTIONS } from '@/components/site/nav'
import { useSiteSettings } from '@/lib/queries'
import { cn } from '@/lib/utils'

const label = 'font-mono text-xs tracking-wide text-fg-subtle uppercase'
/** 44px tap rows on phone, compact list from tablet up. */
const link =
  'flex h-11 items-center text-base text-fg transition-colors hover:text-accent md:h-auto md:text-sm'

function Wordmark() {
  return (
    <div className="flex items-center gap-3">
      {/* Monogram mark: serif italic initials on a soft accent tile */}
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft font-display text-lg text-accent italic ring-1 ring-accent/25"
      >
        SK
      </span>
      <span className="font-heading text-xl font-medium tracking-tight lg:text-[20px] lg:leading-7">
        Shikhar Kumar
      </span>
    </div>
  )
}

/** Full-bleed surface band. Phone: wordmark card, link columns, stacked bottom row. */
export function Footer({ className }: { className?: string }) {
  const { data } = useSiteSettings()
  const elsewhere = [
    { label: 'YouTube', href: data?.youtubeChannelUrl },
    { label: 'Instagram', href: data?.instagramUrl },
    { label: 'Email', href: data?.email ? `mailto:${data.email}` : undefined },
  ].filter((l) => l.href)

  return (
    <footer className={cn('border-t border-border bg-surface', className)}>
      <div className="site-container flex flex-col gap-6 pt-8 pb-12 md:gap-12 md:pt-16 lg:pt-12">
        <div className="flex flex-col gap-6 md:flex-row md:gap-16">
          {/* Phone: wordmark in a warm card; tablet and up: plain column */}
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-[radial-gradient(120%_120%_at_100%_0%,color-mix(in_srgb,var(--accent)_16%,var(--bg))_0%,var(--bg)_60%)] p-6 md:flex-[1.6] md:rounded-none md:border-0 md:bg-none md:p-0">
            <Wordmark />
            <p className="max-w-80 text-sm text-fg-muted">
              Piano covers and practice tapes, recorded at home.
            </p>
          </div>
          <div aria-hidden className="h-px bg-border md:hidden" />
          <div className="flex px-6 md:contents">
            <nav
              aria-label="Explore"
              className="flex w-44 shrink-0 flex-col md:w-auto md:flex-1 md:gap-4"
            >
              <p className={label}>Explore</p>
              {SECTIONS.filter((s) => s.id !== 'home').map((s) => (
                <a key={s.id} href={`#${s.id}`} className={link}>
                  {s.label}
                </a>
              ))}
            </nav>
            <nav
              aria-label="Elsewhere"
              className="flex flex-1 flex-col items-end text-right md:items-start md:gap-4 md:text-left"
            >
              <p className={label}>Elsewhere</p>
              {elsewhere.map((l) => (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className={link}>
                  {l.label} ↗
                </a>
              ))}
            </nav>
          </div>
        </div>
        <div className="flex flex-col items-start gap-4 border-t border-border px-6 pt-6 md:flex-row md:items-center md:justify-between md:border-0 md:p-0">
          <p className={label}>
            ©2026 Shikhar Kumar
            <span className="md:hidden">
              <br />
            </span>
            <span className="hidden md:inline"> · </span>
            All rights reserved
          </p>
          <Button asChild variant="secondary" className="h-12 rounded-full px-5 lg:h-10">
            <a href="#home">
              <ArrowUpIcon className="text-accent" />
              Back to top
            </a>
          </Button>
        </div>
      </div>
    </footer>
  )
}
