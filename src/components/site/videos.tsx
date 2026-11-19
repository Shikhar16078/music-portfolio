import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { Accent, SectionTitle } from '@/components/site/section'
import { VideoCard } from '@/components/site/video-card'
import { screenSection } from '@/lib/layout'
import { rise, stagger } from '@/lib/motion'
import { useSiteSettings } from '@/lib/queries'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/lib/use-media-query'
import { useVideos, type Video } from '@/lib/videos'

const HOME_COUNT = 3
const TABLET_HOME_COUNT = 4
const tabletGrid = 'md:max-lg:flex md:max-lg:flex-wrap md:max-lg:justify-center md:max-lg:gap-6'

const tabletCardWidth = 'md:max-lg:w-[calc(50%-12px)]'
const label = 'font-mono text-xs tracking-wide uppercase'

/** YouTube's play-button mark, drawn in the current colour (icon only, no brand colours). */
function YouTubeGlyph() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8z" />
      <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ShowMoreButton({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  return (
    <Button
      variant="outline"
      onClick={onToggle}
      aria-expanded={expanded}
      className="h-12 rounded-full border-border-strong bg-surface-raised px-6 text-base lg:h-10 lg:px-5 lg:text-sm"
    >
      {expanded ? 'Show less' : 'Show more videos'}
      <ChevronDownIcon
        className={cn('text-accent transition-transform', expanded && 'rotate-180')}
      />
    </Button>
  )
}

/** Tablet: two equal cards per row. Desktop: three equal columns. */
function VideoGrid({
  videos,
  expanded,
  homeCount,
}: {
  videos: Video[]
  expanded: boolean
  homeCount: number
}) {
  const shown = expanded ? videos : videos.slice(0, homeCount)
  return (
    <motion.ul
      layout
      className={cn('videos-grid hidden gap-x-8 gap-y-12 lg:grid lg:grid-cols-3', tabletGrid)}
    >
      <AnimatePresence initial={false}>
        {shown.map((v, i) => (
          <motion.li
            key={v.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { delay: i >= homeCount ? (i - homeCount) * 0.06 : 0 },
            }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            className={tabletCardWidth}
          >
            <VideoCard video={v} />
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  )
}

/** Phone: swipeable carousel of the home set; "Show more" switches to a stacked list. */
function VideoCarousel({
  videos,
  expanded,
  onToggle,
}: {
  videos: Video[]
  expanded: boolean
  onToggle?: () => void
}) {
  const [api, setApi] = useState<CarouselApi>()
  const [index, setIndex] = useState(0)
  const home = videos.slice(0, HOME_COUNT)

  useEffect(() => {
    if (!api) return
    const onSelect = () => setIndex(api.selectedScrollSnap())
    onSelect()
    api.on('select', onSelect)
    return () => {
      api.off('select', onSelect)
    }
  }, [api])

  return (
    <div className="flex flex-col gap-8 md:hidden">
      {expanded ? (
        <motion.ul layout className="flex flex-col gap-10">
          {videos.map((video) => (
            <li key={video.id}>
              <VideoCard video={video} />
            </li>
          ))}
        </motion.ul>
      ) : (
        <Carousel setApi={setApi} opts={{ align: 'start' }} className="-mr-6">
          <CarouselContent className="-ml-4">
            {home.map((video) => (
              <CarouselItem key={video.id} className="basis-[85%] pl-4">
                <VideoCard video={video} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}
      <div
        className={cn('flex items-center gap-4', expanded ? 'justify-center' : 'justify-between')}
      >
        {!expanded && (
          <div className="flex items-center gap-2" role="group" aria-label="Choose video">
            {home.map((video, i) => (
              <button
                key={video.id}
                type="button"
                aria-current={i === index ? 'true' : undefined}
                aria-label={`Video ${i + 1}`}
                onClick={() => api?.scrollTo(i)}
                className="flex h-12 min-w-6 items-center justify-center"
              >
                <span
                  className={cn(
                    'block h-1 rounded-full transition-all duration-(--duration-quick)',
                    i === index ? 'w-6 bg-accent' : 'w-2 bg-border-strong',
                  )}
                />
              </button>
            ))}
          </div>
        )}
        {onToggle && <ShowMoreButton expanded={expanded} onToggle={onToggle} />}
      </div>
    </div>
  )
}

function VideosSkeleton({ count }: { count: number }) {
  return (
    <div aria-label="Loading videos" className={cn('grid gap-8 lg:grid-cols-3', tabletGrid)}>
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cn('flex min-w-0 flex-col gap-4', tabletCardWidth, i > 0 && 'max-md:hidden')}
        >
          <Skeleton className="aspect-video w-full rounded-lg bg-surface-raised" />
          <Skeleton className="h-3 w-1/2 bg-surface-raised" />
          <Skeleton className="h-6 w-3/4 bg-surface-raised" />
        </div>
      ))}
    </div>
  )
}

/** Shown when YouTube can't be reached or the playlist is empty. */
function VideosFallback({ channelUrl }: { channelUrl?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-bg px-6 py-16 text-center">
      <p className="text-fg-muted">The videos couldn’t load right now.</p>
      {channelUrl && (
        <a
          href={channelUrl}
          target="_blank"
          rel="noreferrer"
          className="text-accent hover:underline"
        >
          Watch on YouTube ↗
        </a>
      )}
    </div>
  )
}

export function Videos() {
  const { data, isPending, isError } = useVideos()
  const { data: settings } = useSiteSettings()
  const [expanded, setExpanded] = useState(false)
  const videos = data?.featured ?? []
  const phone = useMediaQuery('(width < 48rem)')
  const tablet = useMediaQuery('(48rem <= width < 72rem)')
  const homeCount = tablet ? TABLET_HOME_COUNT : HOME_COUNT
  const canExpand = videos.length > homeCount

  const toggle = () => {
    // Collapsing: return to the heading so the visitor isn't left below the section
    if (expanded) document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth' })
    setExpanded((e) => !e)
  }

  return (
    <section
      id="videos"
      className={cn(
        screenSection,
        'videos-section bg-surface md:max-lg:pb-[max(120px,calc(var(--player-space)+24px))]',
      )}
    >
      <motion.div
        key={isPending ? 'loading' : 'ready'}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className="videos-content site-container flex flex-col gap-8 md:gap-6 lg:gap-12"
      >
        <motion.header
          variants={rise}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div className="videos-heading flex flex-col gap-4 lg:gap-6">
            <p className={cn(label, 'text-accent')}>Videos · On YouTube</p>
            <SectionTitle>
              Most played <Accent>covers</Accent>
            </SectionTitle>
          </div>
          <div className="flex items-center gap-6">
            {settings?.videosIntro && (
              <p className="text-sm text-fg-muted">{settings.videosIntro}</p>
            )}
            {settings?.youtubeChannelUrl && (
              <a
                href={settings.youtubeChannelUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open the YouTube channel"
                className="hidden size-10 shrink-0 items-center justify-center rounded-full border border-border-strong text-fg transition-colors hover:border-accent hover:text-accent lg:flex"
              >
                <YouTubeGlyph />
              </a>
            )}
          </div>
        </motion.header>

        <motion.div variants={rise} className="videos-body flex flex-col gap-6 lg:gap-12">
          {isPending ? (
            <VideosSkeleton count={homeCount} />
          ) : isError || !videos.length ? (
            <VideosFallback channelUrl={settings?.youtubeChannelUrl} />
          ) : (
            <>
              {!phone && <VideoGrid videos={videos} expanded={expanded} homeCount={homeCount} />}
              {phone && (
                <VideoCarousel
                  videos={videos}
                  expanded={expanded}
                  onToggle={canExpand ? toggle : undefined}
                />
              )}
              {canExpand && (
                <div className="hidden justify-center md:flex">
                  <ShowMoreButton expanded={expanded} onToggle={toggle} />
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}
