import { HeadphonesIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { rise, stagger } from '@/lib/motion'
import { useSiteSettings } from '@/lib/queries'
import { hotspotPosition, imageUrl, type SanityImage } from '@/lib/sanity'
import { useTheme } from '@/lib/theme-config'
import { cn } from '@/lib/utils'
import dusk1280 from '@/assets/hero/dusk-1280.webp'
import dusk2560 from '@/assets/hero/dusk-2560.webp'
import daylight1280 from '@/assets/hero/daylight-1280.webp'
import daylight2560 from '@/assets/hero/daylight-2560.webp'

/** Built-in photos, plus where each one is cropped per breakpoint (phone / tablet / desktop). */
const DEFAULTS = {
  dusk: {
    srcSet: `${dusk1280} 1280w, ${dusk2560} 2560w`,
    position: 'object-[68%_50%] md:object-[72%_50%] lg:object-center',
  },
  daylight: {
    srcSet: `${daylight1280} 1280w, ${daylight2560} 2560w`,
    position: 'object-[65%_50%] md:object-[92%_85%] lg:object-center',
  },
}

function HeroPhoto({ image, daylight }: { image?: SanityImage; daylight: boolean }) {
  const fallback = daylight ? DEFAULTS.daylight : DEFAULTS.dusk
  const srcSet = image?.asset
    ? [960, 1600, 2560].map((w) => `${imageUrl(image, w)} ${w}w`).join(', ')
    : fallback.srcSet
  const hotspot = hotspotPosition(image)

  return (
    <img
      src={srcSet.split(' ')[0]}
      srcSet={srcSet}
      sizes="100vw"
      alt=""
      fetchPriority="high"
      className={cn('size-full object-cover', !hotspot && fallback.position)}
      style={hotspot ? { objectPosition: hotspot } : undefined}
    />
  )
}

/**
 * Full-bleed piano photo. Desktop: sharp on the image side, softly blurred only behind the text.
 * Tablet and phone: photo at the top, never blurred, fading into the page.
 */
function HeroBackdrop() {
  const { data } = useSiteSettings()
  const { theme } = useTheme()
  const daylight = theme === 'daylight'

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[62%] md:h-[72%] lg:h-full">
        <HeroPhoto
          image={daylight ? data?.heroPhotoDaylight : data?.heroPhotoDusk}
          daylight={daylight}
        />
        {/* Warm tone that tames bright highlights in light photos */}
        {daylight && (
          <div className="absolute inset-0 bg-[radial-gradient(60%_90%_at_38%_40%,rgb(214_180_138/0.3),transparent_80%)] mix-blend-multiply" />
        )}
        {/* Fade into the page below the photo */}
        <div className="absolute inset-0 bg-linear-to-b from-bg/40 via-transparent via-30% to-bg lg:via-60%" />
      </div>

      {/* Desktop only: legibility behind the text column */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 hidden w-[62%] lg:block',
          daylight
            ? 'bg-linear-to-r from-bg/55 via-bg/40 to-transparent'
            : 'bg-linear-to-r from-bg/75 via-bg/60 to-transparent',
        )}
      />
      <div className="absolute inset-y-0 left-0 hidden w-[58%] mask-r-from-55% mask-r-to-100% backdrop-blur-[10px] lg:block" />
    </div>
  )
}

export function Hero() {
  const { data, isPending } = useSiteSettings()

  return (
    <section id="home" className="relative flex min-h-svh items-end lg:min-h-[880px]">
      <HeroBackdrop />
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="relative mx-auto flex w-full max-w-(--container-wide) flex-col gap-6 px-6 pt-40 pb-20 md:px-12 md:pb-24 lg:px-24 lg:pb-32"
      >
        <motion.h1
          variants={rise}
          className="max-w-3xl font-display text-[56px] leading-[56px] tracking-display md:text-[96px] md:leading-[96px] lg:text-5xl"
        >
          Every song needs a <em className="text-accent">piano version.</em>
        </motion.h1>
        <motion.div variants={rise} className="max-w-xl">
          {isPending ? (
            <div className="flex flex-col gap-3 py-1">
              <Skeleton className="h-5 w-full bg-surface-raised" />
              <Skeleton className="h-5 w-2/3 bg-surface-raised" />
            </div>
          ) : (
            data?.heroIntro && <p className="text-lg text-fg-muted">{data.heroIntro}</p>
          )}
        </motion.div>
        <motion.div variants={rise} className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-14 rounded-full px-8 text-base">
            <a href="#listen">
              <HeadphonesIcon />
              Hear the recordings
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-14 rounded-full border-border-strong bg-bg/60 px-8 text-base backdrop-blur-sm"
          >
            <a href="#videos">Watch the videos</a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
