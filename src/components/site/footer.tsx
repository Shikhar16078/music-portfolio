import { ArrowUpIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SECTIONS } from '@/components/site/nav'
import { useSiteSettings } from '@/lib/queries'

const label = 'font-mono text-xs tracking-wide text-fg-subtle uppercase'
const link = 'flex h-11 items-center text-sm text-fg transition-colors hover:text-accent md:h-8'

export function Footer() {
  const { data } = useSiteSettings()
  const elsewhere = [
    { label: 'YouTube', href: data?.youtubeChannelUrl },
    { label: 'Instagram', href: data?.instagramUrl },
    { label: 'Email', href: data?.email ? `mailto:${data.email}` : undefined },
  ].filter((l) => l.href)

  return (
    <footer className="mx-auto w-full max-w-(--container-wide) px-6 pb-12 md:px-12 lg:px-24">
      <Separator />
      <div className="flex flex-col gap-12 py-16 md:flex-row md:gap-16">
        <div className="flex flex-col gap-4 md:flex-[1.6]">
          <div className="flex items-center gap-2">
            <span className="font-heading text-2xl font-medium tracking-tight">Shikhar Kumar</span>
            <span aria-hidden className="size-2 rounded-full bg-accent" />
          </div>
          <p className="max-w-80 text-sm text-fg-muted">
            Piano covers and practice tapes, recorded at home.
          </p>
        </div>
        <div className="flex gap-8 md:flex-[2] md:gap-16">
          <nav aria-label="Explore" className="flex flex-1 flex-col gap-2">
            <p className={label}>Explore</p>
            {SECTIONS.filter((s) => s.id !== 'home').map((s) => (
              <a key={s.id} href={`#${s.id}`} className={link}>
                {s.label}
              </a>
            ))}
          </nav>
          <nav
            aria-label="Elsewhere"
            className="flex flex-1 flex-col items-end gap-2 text-right md:items-start md:text-left"
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
      <Separator />
      <div className="flex flex-col items-start gap-4 pt-6 md:flex-row md:items-center md:justify-between">
        <p className={label}>©2026 Shikhar Kumar · All rights reserved</p>
        <Button asChild variant="secondary" className="h-12 rounded-full px-5">
          <a href="#home">
            <ArrowUpIcon className="text-accent" />
            Back to top
          </a>
        </Button>
      </div>
    </footer>
  )
}
