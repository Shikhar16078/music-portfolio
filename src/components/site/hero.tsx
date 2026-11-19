import { HeadphonesIcon, PlayIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { rise, stagger } from '@/lib/motion'
import { formatTime } from '@/lib/format'
import { useSiteSettings } from '@/lib/queries'
import { useInlineVideo } from '@/lib/inline-video-context'
import { InlineVideo } from '@/components/site/inline-video'
import { formatAge, isNew, useVideos } from '@/lib/videos'
import { useTheme } from '@/lib/theme-config'
import { cn } from '@/lib/utils'
import dusk1280 from '@/assets/hero/dusk-1280.webp'
import dusk1536 from '@/assets/hero/dusk-1536.webp'
import daylight1280 from '@/assets/hero/daylight-1280.webp'
import daylight1748 from '@/assets/hero/daylight-1748.webp'

/** Built-in photos, plus where each one is cropped per breakpoint (phone / tablet / desktop). */
const DEFAULTS = {
  dusk: {
    srcSet: `${dusk1280} 1280w, ${dusk1536} 1536w`,
    position: 'object-[62%_50%] md:object-[51%_50%] lg:object-center',
  },
  daylight: {
    srcSet: `${daylight1280} 1280w, ${daylight1748} 1748w`,
    position: 'object-[74%_8%] md:object-[72%_8%] lg:object-[50%_8%]',
  },
}

function HeroPhoto({ daylight }: { daylight: boolean }) {
  const { srcSet, position } = daylight ? DEFAULTS.daylight : DEFAULTS.dusk

  return (
    <div className="hero-photo">
      <img
        src={daylight ? daylight1280 : dusk1280}
        srcSet={srcSet}
        sizes="100vw"
        alt=""
        fetchPriority="high"
        className={cn('size-full object-cover', position)}
      />
    </div>
  )
}

/** "Latest upload" card under the buttons: the channel's newest video, plays in the hero. */
function LatestUpload() {
  const { data } = useVideos()
  const { open, close, playing } = useInlineVideo()
  const video = data?.latest
  if (!video) return null
  if (playing) {
    return (
      <motion.div variants={rise} className="w-full max-w-104 lg:max-w-90 2xl:max-w-[576px]">
        <InlineVideo video={video} onClose={close} />
      </motion.div>
    )
  }
  return (
    <motion.button
      variants={rise}
      type="button"
      onClick={open}
      aria-label={`Play latest upload: ${video.title}`}
      className="group flex h-20 w-full max-w-104 items-center gap-3 rounded-lg border border-fg/8 bg-surface pr-3 pl-2 text-left transition-colors hover:border-accent/40 md:gap-4 md:pr-6 lg:h-22 lg:max-w-90 2xl:h-36 2xl:max-w-[576px] 2xl:gap-6 2xl:rounded-xl 2xl:pr-10 2xl:pl-3"
    >
      <span className="relative flex h-14 w-18 shrink-0 items-center justify-center overflow-hidden rounded-md bg-video-control md:w-24 lg:h-14 lg:w-20 2xl:h-22 2xl:w-32">
        <img
          src={video.thumbnails[Math.min(1, video.thumbnails.length - 1)]?.url}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-60"
        />
        <PlayIcon className="relative size-4 fill-video-control-fg text-video-control-fg 2xl:size-6" />
      </span>
      <span className="flex min-w-0 flex-col gap-1 2xl:gap-1.5">
        <span className="font-mono text-xs tracking-wide text-accent uppercase 2xl:text-lg">
          Latest upload
        </span>
        <span className="truncate font-medium text-fg group-hover:text-accent 2xl:text-2xl">
          {video.title}
        </span>
        <span className="text-sm text-fg-muted 2xl:text-xl">
          {formatTime(video.duration)} ·{' '}
          {isNew(video.publishedAt) ? 'New' : formatAge(video.publishedAt)}
        </span>
      </span>
    </motion.button>
  )
}

export function Hero() {
  const { data, isPending } = useSiteSettings()
  const { theme } = useTheme()
  const daylight = theme === 'daylight'

  return (
    <section id="home" className="site-hero relative isolate">
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <HeroPhoto daylight={daylight} />
      </div>
      <div className="site-container">
        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="hero-copy flex w-full max-w-[704px] flex-col gap-6 px-6 py-8 md:p-10 lg:p-12 2xl:max-w-[1120px] 2xl:gap-10 2xl:p-[72px]"
        >
          <motion.h1
            variants={rise}
            className="font-display text-[clamp(2.5rem,11.3vw,3.5rem)] leading-none tracking-[-0.02em] md:max-w-150 md:text-[80px] md:tracking-display lg:text-[88px] 2xl:max-w-[960px] 2xl:text-[144px]"
          >
            Every song deserves a <em className="text-accent">piano version.</em>
          </motion.h1>
          <motion.div variants={rise} className="max-w-[560px] 2xl:max-w-[896px]">
            {isPending ? (
              <div className="flex flex-col gap-3 py-1">
                <Skeleton className="h-5 w-full bg-surface-raised" />
                <Skeleton className="h-5 w-2/3 bg-surface-raised" />
              </div>
            ) : (
              <p className="text-base leading-6 text-fg md:text-lg md:leading-8 lg:text-base lg:leading-7 2xl:text-2xl 2xl:leading-10">
                {data?.heroIntro ??
                  'Film scores, Bollywood and pop, rearranged for solo piano and recorded at home in a single take.'}
              </p>
            )}
          </motion.div>
          <motion.div
            variants={rise}
            className="flex flex-col gap-2 pt-2 md:flex-row md:gap-4 md:pt-0 2xl:gap-6"
          >
            <Button
              asChild
              className="h-12 rounded-full px-6 text-base md:h-14 md:px-8 lg:h-10 lg:px-6 lg:text-sm 2xl:h-16 2xl:px-10 2xl:text-[22px]"
            >
              <a href="#listen">
                <HeadphonesIcon />
                Hear the recordings
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-12 rounded-full border-border-strong bg-surface-raised px-6 text-base md:h-14 md:px-8 lg:h-10 lg:px-6 lg:text-sm 2xl:h-16 2xl:px-10 2xl:text-[22px]"
            >
              <a href="#videos">Watch the videos</a>
            </Button>
          </motion.div>
          <LatestUpload />
        </motion.div>
      </div>
    </section>
  )
}
