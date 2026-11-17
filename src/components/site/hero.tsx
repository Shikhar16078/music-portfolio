import { HeadphonesIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { rise, stagger } from '@/lib/motion'
import { useSiteSettings } from '@/lib/queries'

/** Hero text column. The photo backdrop arrives in Phase 2. */
export function Hero() {
  const { data, isPending } = useSiteSettings()

  return (
    <section id="home" className="relative flex min-h-svh items-end">
      <motion.div
        initial="hidden"
        animate="show"
        variants={stagger}
        className="mx-auto flex w-full max-w-(--container-wide) flex-col gap-6 px-6 pt-40 pb-24 md:px-12 md:pb-32 lg:px-24"
      >
        <motion.h1
          variants={rise}
          className="max-w-3xl font-display text-[56px] leading-[56px] tracking-display md:text-[88px] md:leading-[88px] lg:text-5xl"
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
            className="h-14 rounded-full border-border-strong bg-transparent px-8 text-base"
          >
            <a href="#videos">Watch the videos</a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
