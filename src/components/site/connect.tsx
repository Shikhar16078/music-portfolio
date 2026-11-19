import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { ArrowUpRightIcon, MailIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { subscribeUrl } from '@/components/site/nav'
import { Accent, SectionTitle } from '@/components/site/section'
import { Waveform } from '@/components/site/waveform'
import { screenSection } from '@/lib/layout'
import { rise, stagger } from '@/lib/motion'
import { useSiteSettings } from '@/lib/queries'
import { cn } from '@/lib/utils'

const label = 'font-mono text-xs tracking-wide uppercase'
const card = 'rounded-xl border border-border bg-bg'

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={cn('size-6', className)}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function YouTubeGlyph({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={cn('size-6', className)}
    >
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8z" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}

/** Static brand tiles standing in for Instagram posts (no Instagram API): keys, a waveform, the handle mark. */
function InstagramTiles({ className }: { className?: string }) {
  const tile =
    'relative flex h-36 flex-1 overflow-hidden rounded-lg md:h-40 lg:h-44 lg:w-32 lg:flex-none'
  return (
    <div aria-hidden className={cn('flex gap-2', className)}>
      <div className={cn(tile, 'items-end bg-(--tape-bg-0)')}>
        <div className="flex h-2/5 w-full gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="flex-1 bg-(--tape-wave-1)" />
          ))}
        </div>
      </div>
      <div
        className={cn(
          tile,
          'items-center justify-center bg-(--tape-bg-2) px-6 text-(--tape-wave-2)',
        )}
      >
        <Waveform seed="instagram-reel" bars={10} className="h-16 w-full" barClassName="w-0.5" />
      </div>
      <div
        className={cn(tile, 'flex-col justify-between border border-accent/30 bg-accent-soft p-4')}
      >
        <span className="font-display text-[56px] leading-14 text-accent italic">@</span>
        <span className={cn(label, 'text-fg-muted')}>Reels</span>
      </div>
    </div>
  )
}

function LinkCard({
  href,
  icon,
  name,
  title,
  shortTitle,
  description,
}: {
  href?: string
  icon: ReactNode
  name: string
  title: string
  /** Phone cards are half width: a shorter title, no description. */
  shortTitle: string
  description: string
}) {
  if (!href) return null
  return (
    <a
      href={href}
      target={href.startsWith('mailto:') ? undefined : '_blank'}
      rel="noreferrer"
      className={cn(
        card,
        'group flex flex-1 flex-col justify-between gap-6 p-5 transition-colors hover:border-accent/40 md:p-8',
      )}
    >
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-fg">
          {icon}
          <span className={cn(label, 'text-fg-muted')}>{name}</span>
        </span>
        <ArrowUpRightIcon className="size-5 text-fg-subtle transition-colors group-hover:text-accent" />
      </span>
      <span className="flex flex-col gap-1">
        <span className="font-heading text-lg font-medium tracking-tight group-hover:text-accent md:text-xl lg:text-[20px] lg:leading-7">
          <span className="md:hidden">{shortTitle}</span>
          <span className="hidden md:inline">{title}</span>
        </span>
        <span className="hidden text-sm text-fg-muted md:block">{description}</span>
      </span>
    </a>
  )
}

export function Connect() {
  const { data } = useSiteSettings()

  return (
    <section id="connect" className={cn(screenSection, 'bg-surface')}>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className="site-container flex flex-col gap-8 md:gap-12"
      >
        <motion.header
          variants={rise}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6"
        >
          <div className="flex flex-col gap-4 lg:gap-6">
            <p className={cn(label, 'text-accent')}>Connect</p>
            <SectionTitle>
              Pull up a <Accent>chair.</Accent>
            </SectionTitle>
          </div>
          {data?.connectIntro && (
            <p className="text-lg text-fg-muted lg:w-100 lg:shrink-0 lg:text-base lg:leading-7">
              {data.connectIntro}
            </p>
          )}
        </motion.header>

        <motion.div variants={rise} className="flex flex-col gap-4 lg:flex-row">
          {data?.instagramUrl && (
            <div
              className={cn(
                card,
                'flex flex-col gap-6 p-6 md:p-8 lg:flex-[1.6] lg:flex-row lg:gap-8',
              )}
            >
              <InstagramTiles className="md:order-2 lg:order-2" />
              <div className="flex flex-1 flex-col gap-6 md:order-1 md:flex-row md:items-end md:justify-between lg:flex-col lg:items-stretch lg:justify-between lg:gap-8">
                <div className="flex flex-col gap-4">
                  <span className="flex items-center gap-2 text-accent">
                    <InstagramGlyph />
                    <span className={label}>Instagram</span>
                  </span>
                  <h3 className="font-heading text-2xl font-medium tracking-h3 md:max-lg:text-[32px] md:max-lg:leading-10">
                    Behind the <Accent>keys.</Accent>
                  </h3>
                  <p className="text-fg-muted">
                    Short reels, sneak peeks of what I’m learning, and the occasional wrong note.
                  </p>
                </div>
                <Button
                  asChild
                  className="h-12 w-full rounded-full px-6 text-base md:w-auto lg:h-10 lg:self-start lg:px-5 lg:text-sm"
                >
                  <a href={data.instagramUrl} target="_blank" rel="noreferrer">
                    Follow on Instagram
                  </a>
                </Button>
              </div>
            </div>
          )}
          <div className="flex gap-4 md:flex-row lg:flex-1 lg:flex-col">
            <LinkCard
              href={subscribeUrl(data?.youtubeChannelUrl)}
              icon={<YouTubeGlyph />}
              name="YouTube"
              title="Watch the full covers"
              shortTitle="Full covers"
              description="Subscribe to the channel on YouTube"
            />
            <LinkCard
              href={data?.email ? `mailto:${data.email}` : undefined}
              icon={<MailIcon className="size-6" strokeWidth={1.5} />}
              name="Email"
              title="Requests & collabs"
              shortTitle="Requests"
              description="Got a song you’d like on piano? Write in."
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
