import { screenSection } from '@/lib/layout'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon, ShuffleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Accent } from '@/components/site/section'
import { TapeArt, Waveform } from '@/components/site/waveform'
import { duration as dur, ease, rise, stagger } from '@/lib/motion'
import { formatTime, kindLabel, longKey, pad2, shortKey, tapeLabel, trackTitle } from '@/lib/format'
import { usePlayer } from '@/lib/player-context'
import { useAudioDuration, useRecordings, useSiteSettings } from '@/lib/queries'
import type { Recording } from '@/lib/sanity'
import { cn } from '@/lib/utils'

const PER_PAGE = 6
const label = 'font-mono text-xs tracking-wide uppercase'

/** Current page, kept in the URL as ?tapes=N so shared links open the same page. */
function usePage(pageCount: number) {
  const [page, setPage] = useState(() => {
    const n = Number(new URLSearchParams(window.location.search).get('tapes'))
    return Number.isInteger(n) && n > 0 ? n : 1
  })
  const clamped = Math.min(page, Math.max(1, pageCount))

  useEffect(() => {
    const url = new URL(window.location.href)
    if (clamped > 1) url.searchParams.set('tapes', String(clamped))
    else url.searchParams.delete('tapes')
    window.history.replaceState(null, '', url)
  }, [clamped])

  return [clamped, setPage] as const
}

/** Animated equalizer shown in place of the tape number while it plays. */
function EqBars({ playing }: { playing: boolean }) {
  return (
    <span aria-hidden className="flex h-4 items-end gap-0.5 text-accent">
      {[0.6, 1, 0.4, 0.8].map((h, i) => (
        <motion.span
          key={i}
          className="w-0.5 origin-bottom rounded-full bg-current"
          style={{ height: `${h * 100}%` }}
          animate={playing ? { scaleY: [1, 0.35, 0.9, 0.5, 1] } : { scaleY: 0.5 }}
          transition={
            playing
              ? { duration: 1.1 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }
              : { duration: dur.quick }
          }
        />
      ))}
    </span>
  )
}

function PlayGlyph({ active, className }: { active: boolean; className?: string }) {
  return active ? (
    <PauseIcon className={cn('fill-current', className)} />
  ) : (
    <PlayIcon className={cn('translate-x-px fill-current', className)} />
  )
}

function TrackRow({ recording, queue }: { recording: Recording; queue: Recording[] }) {
  const player = usePlayer()
  const { data: length } = useAudioDuration(recording.audioUrl)
  const isCurrent = player.current?._id === recording._id
  const isPlaying = isCurrent && player.playing
  const title = trackTitle(recording)

  return (
    <li>
      <button
        type="button"
        onClick={() => player.playTrack(recording, queue)}
        aria-label={`${isPlaying ? 'Pause' : 'Play'} ${title}`}
        aria-current={isCurrent ? 'true' : undefined}
        className={cn(
          'group grid w-full grid-cols-[56px_1fr_48px] items-center gap-4 border border-transparent border-b-border py-2 text-left transition-colors md:grid-cols-[48px_56px_1fr_96px_56px] md:py-3',
          'hover:bg-surface focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-accent',
          isCurrent
            ? 'rounded-2xl border-accent/35 bg-accent-soft px-3 hover:bg-accent-soft md:bg-surface-raised md:px-4 md:hover:bg-surface-raised'
            : 'md:px-4',
        )}
      >
        {/* Tape number → play icon on hover → equalizer while playing */}
        <span className={cn('hidden items-center md:flex', label, 'text-fg-subtle')}>
          {isCurrent ? (
            <EqBars playing={isPlaying} />
          ) : (
            <>
              <span className="group-hover:hidden">{pad2(recording.tapeNumber)}</span>
              <PlayIcon className="hidden size-4 fill-current text-fg group-hover:block" />
            </>
          )}
        </span>
        <TapeArt recording={recording} />
        <span className="flex min-w-0 flex-col gap-1">
          <span
            className={cn('truncate text-base font-medium', isCurrent ? 'text-accent' : 'text-fg')}
          >
            {title}
          </span>
          <span className="truncate text-sm text-fg-muted">
            {tapeLabel(recording)} · {isPlaying ? 'Playing' : kindLabel(recording)}
            <span className="md:hidden"> · {formatTime(length)}</span>
          </span>
        </span>
        <span className={cn('hidden md:block', label, 'text-fg-subtle')}>
          {shortKey(recording.key)}
        </span>
        <span className="hidden text-right font-mono text-sm text-fg-muted tabular-nums md:block">
          {formatTime(length)}
        </span>
        {/* Phone: visible play button (the whole row is the real button) */}
        <span
          aria-hidden
          className={cn(
            'flex size-12 items-center justify-center rounded-full md:hidden',
            isCurrent ? 'bg-accent text-accent-foreground' : 'border border-border-strong text-fg',
          )}
        >
          <PlayGlyph active={isPlaying} className="size-4" />
        </span>
      </button>
    </li>
  )
}

/** Big tape card: the tape playing now, or the featured one. Artwork stays dark in every theme. */
function FeaturedCard({ recording, queue }: { recording: Recording; queue: Recording[] }) {
  const player = usePlayer()
  const { data: length } = useAudioDuration(recording.audioUrl)
  const isCurrent = player.current?._id === recording._id
  const isPlaying = isCurrent && player.playing
  const progress = isCurrent && player.duration ? player.time / player.duration : undefined
  const title = trackTitle(recording)
  const meta = [kindLabel(recording), longKey(recording.key), formatTime(length)]
    .filter(Boolean)
    .join(' · ')

  const playButton = (big: boolean) => (
    <Button
      onClick={() => player.playTrack(recording, queue)}
      aria-label={`${isPlaying ? 'Pause' : 'Play'} ${title}`}
      className={cn(
        'shrink-0 rounded-full bg-media-accent text-media-accent-fg shadow-glow hover:bg-media-accent/90',
        big ? 'size-18 [&_svg]:size-6' : 'size-16 [&_svg]:size-5',
      )}
    >
      <PlayGlyph active={isPlaying} />
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      <article
        className={cn(
          'relative flex flex-col gap-4 overflow-hidden rounded-3xl border border-media-fg/10 bg-media-bg p-5 text-media-fg',
          'md:grid md:grid-cols-[1fr_1.2fr_auto] md:items-center md:gap-8 md:p-6 lg:p-8',
          'lg:flex lg:aspect-square lg:items-stretch lg:justify-between lg:gap-0',
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_55%_at_50%_45%,color-mix(in_srgb,var(--color-media-accent)_16%,transparent),transparent_75%)]"
        />
        <div className={cn('relative flex justify-between gap-4 text-media-accent', label)}>
          <span>
            SK — {tapeLabel(recording)}
            <span className="lg:hidden"> · {shortKey(recording.key)}</span>
          </span>
          <span className="hidden lg:inline">{longKey(recording.key)?.toUpperCase()}</span>
        </div>

        {/* Phone + tablet: title and button in a row */}
        <div className="relative flex items-center justify-between gap-4 md:col-start-1 md:row-start-2 lg:hidden">
          <h3 className="font-heading text-2xl font-medium tracking-h3 text-balance">{title}</h3>
          <span className="md:hidden">{playButton(false)}</span>
        </div>

        <div className="relative h-8 text-media-accent md:col-start-2 md:row-span-2 md:h-20 lg:h-40">
          <Waveform
            seed={recording._id}
            bars={36}
            progress={progress}
            className="lg:hidden"
            barClassName="w-0.5 md:w-1"
          />
          <Waveform
            seed={recording._id}
            bars={40}
            progress={progress}
            className="hidden lg:flex"
            barClassName="w-1.5"
          />
        </div>

        <span className="relative hidden md:col-start-3 md:row-span-2 md:block lg:hidden">
          {playButton(false)}
        </span>

        {/* Desktop: title bottom-left, big button bottom-right */}
        <div className="relative hidden items-end justify-between gap-6 lg:flex">
          <h3 className="min-w-0 font-heading text-2xl font-medium tracking-h3 text-balance break-words">
            {title}
          </h3>
          {playButton(true)}
        </div>
      </article>

      <div className="hidden flex-col gap-2 lg:flex">
        <p className={cn(label, 'text-fg-subtle')}>
          {isCurrent ? 'Now playing' : 'Featured'} · {tapeLabel(recording)}
        </p>
        <p className="text-sm text-fg-muted">
          {recording.note && <>{recording.note} </>}
          {meta}
        </p>
      </div>
    </div>
  )
}

function Pagination({
  page,
  pageCount,
  total,
  onChange,
}: {
  page: number
  pageCount: number
  total: number
  onChange: (page: number) => void
}) {
  const from = (page - 1) * PER_PAGE + 1
  const to = Math.min(total, page * PER_PAGE)
  const arrow = 'size-12 rounded-full border-border-strong bg-transparent md:size-10'

  return (
    <nav aria-label="Recordings pages" className="flex items-center justify-between gap-4">
      <p className={cn('hidden md:block', label, 'text-fg-subtle')}>
        {from}–{to} of {total} recordings
      </p>
      <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-end">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          className={arrow}
        >
          <ChevronLeftIcon />
        </Button>
        <p className={cn('md:hidden', label, 'text-fg-subtle')}>
          Page {page} of {pageCount}
        </p>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
          <Button
            key={n}
            variant="ghost"
            aria-label={`Page ${n}`}
            aria-current={n === page ? 'page' : undefined}
            onClick={() => onChange(n)}
            className={cn(
              'hidden size-10 rounded-full font-mono text-sm md:inline-flex',
              n === page
                ? 'bg-accent text-accent-foreground hover:bg-accent'
                : 'text-fg-muted hover:bg-surface-raised',
            )}
          >
            {n}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={page === pageCount}
          onClick={() => onChange(page + 1)}
          className={arrow}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </nav>
  )
}

/** Empty / offline state: the player stays hidden. */
function QuietTapes() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-border bg-surface px-6 py-16 text-center">
      <span aria-hidden className="flex h-4 items-center gap-1 text-fg-subtle">
        {[0.3, 0.6, 0.4, 0.4, 0.7, 0.3].map((h, i) => (
          <span key={i} className="w-1 rounded-full bg-current" style={{ height: `${h * 100}%` }} />
        ))}
      </span>
      <p className="text-fg-muted">The tapes are quiet right now.</p>
    </div>
  )
}

function ListSkeleton() {
  return (
    <ul aria-label="Loading recordings" className="flex flex-col">
      {Array.from({ length: PER_PAGE }, (_, i) => (
        <li key={i} className="flex items-center gap-4 border-b border-border py-4 md:px-4">
          <Skeleton className="hidden h-3 w-6 bg-surface-raised md:block" />
          <Skeleton className="size-14 rounded-xl bg-surface-raised" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-1/2 bg-surface-raised" />
            <Skeleton className="h-3 w-1/3 bg-surface-raised" />
          </div>
        </li>
      ))}
    </ul>
  )
}

export function Listen() {
  const { data: recordings, isPending, isError } = useRecordings()
  const { data: settings } = useSiteSettings()
  const player = usePlayer()
  const total = recordings?.length ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE))
  const [page, setPage] = usePage(pageCount)

  const pageItems = recordings?.slice((page - 1) * PER_PAGE, page * PER_PAGE) ?? []
  const featured =
    (player.current && recordings?.find((r) => r._id === player.current?._id)) ??
    recordings?.find((r) => r.featured) ??
    recordings?.[0]

  return (
    <section id="listen" className={screenSection}>
      <motion.div
        key={isPending ? 'loading' : 'ready'}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className="mx-auto flex max-w-(--container-wide) flex-col gap-10 px-6 md:px-12 lg:px-24 2xl:max-w-(--container-ultra)"
      >
        <motion.header
          variants={rise}
          className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        >
          <div className="flex flex-col gap-4">
            <p className={cn(label, 'text-accent')}>Listen · Audio only</p>
            <h2 className="font-heading text-[40px] leading-12 font-medium tracking-h1 md:text-4xl">
              From the <Accent>practice tapes.</Accent>
            </h2>
          </div>
          <div className="flex flex-col items-start gap-6 md:items-end">
            {settings?.listenIntro && (
              <p className="text-lg text-fg-muted md:text-right">{settings.listenIntro}</p>
            )}
            {total > 0 && (
              <Button
                onClick={() => recordings && player.shufflePlay(recordings)}
                className="h-12 rounded-full px-6 text-base"
              >
                <ShuffleIcon />
                Shuffle play
              </Button>
            )}
          </div>
        </motion.header>

        <motion.div variants={rise}>
          {isPending ? (
            <ListSkeleton />
          ) : isError || !recordings?.length || !featured ? (
            <QuietTapes />
          ) : (
            <div className="grid gap-6 lg:grid-cols-[416px_1fr] lg:gap-16">
              <FeaturedCard recording={featured} queue={recordings} />
              <div className="flex flex-col gap-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.ul
                    key={page}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: dur.quick, ease: ease.breath }}
                    className="flex flex-col gap-1 md:gap-0"
                  >
                    {pageItems.map((r) => (
                      <TrackRow key={r._id} recording={r} queue={recordings} />
                    ))}
                  </motion.ul>
                </AnimatePresence>
                {pageCount > 1 && (
                  <Pagination page={page} pageCount={pageCount} total={total} onChange={setPage} />
                )}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}
