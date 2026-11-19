import { screenSection } from '@/lib/layout'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon, ShuffleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Accent, SectionTitle } from '@/components/site/section'
import { TapeArt, Waveform } from '@/components/site/waveform'
import { duration as dur, ease, rise, stagger } from '@/lib/motion'
import { formatTime, kindLabel, longKey, pad2, shortKey, tapeLabel, trackTitle } from '@/lib/format'
import { usePlayer } from '@/lib/player-context'
import { useAudioDuration, useRecordings, useSiteSettings } from '@/lib/queries'
import type { Recording } from '@/lib/sanity'
import { cn } from '@/lib/utils'

const PER_PAGE = 5
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
          // Every row: same padding (content lines up), same rounded shape on hover and when playing.
          // The divider is drawn inset and hides on hover / when playing, so rounded corners stay clean.
          'group relative -mx-3 grid w-[calc(100%+1.5rem)] grid-cols-[56px_1fr_48px] items-center gap-4 rounded-2xl border border-transparent px-3 py-2 text-left transition-colors md:mx-0 md:h-20 md:w-full md:grid-cols-[24px_48px_1fr_72px_40px_48px] md:px-4 md:py-0 lg:h-16 lg:grid-cols-[48px_48px_1fr_96px_56px]',
          'after:absolute after:inset-x-3 after:-bottom-px after:h-px after:bg-border md:after:inset-x-4',
          'hover:bg-surface hover:after:opacity-0 focus-visible:outline-2 focus-visible:outline-accent',
          isCurrent && 'border-accent/35 bg-accent-soft after:opacity-0 hover:bg-accent-soft',
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
        <TapeArt recording={recording} className="md:size-12 md:px-2 md:py-3.5" />
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
        <span className="hidden font-mono text-xs text-fg-subtle tabular-nums md:block lg:text-right lg:text-sm lg:text-fg-muted">
          {formatTime(length)}
        </span>
        {/* Phone + tablet: visible play button (the whole row is the real button) */}
        <span
          aria-hidden
          className={cn(
            'flex size-12 items-center justify-center rounded-full lg:hidden',
            isCurrent ? 'bg-accent text-accent-foreground' : 'border border-border-strong text-fg',
          )}
        >
          <PlayGlyph active={isPlaying} className="size-4" />
        </span>
      </button>
    </li>
  )
}

const card =
  'relative overflow-hidden rounded-3xl border border-border bg-recording-bg text-recording-fg'

/** Big tape card: the tape playing now, or the featured one. */
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
        'shrink-0 rounded-full bg-accent text-accent-foreground',
        big ? 'size-14 [&_svg]:size-5' : 'size-16 [&_svg]:size-5',
      )}
    >
      <PlayGlyph active={isPlaying} />
    </Button>
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Phone: label, title + button, slim waveform */}
      <article className={cn(card, 'flex flex-col gap-4 p-5 md:hidden')}>
        <p className={cn('relative text-recording-wave', label)}>
          {tapeLabel(recording)} · {shortKey(recording.key)}
        </p>
        <div className="relative flex items-center justify-between gap-4">
          <h3 className="font-heading text-2xl font-medium tracking-h3 text-balance">{title}</h3>
          {playButton(false)}
        </div>
        <div className="relative h-8 text-recording-wave">
          <Waveform seed={recording._id} bars={36} progress={progress} />
        </div>
      </article>

      {/* Tablet: artwork square, text, button */}
      <article className={cn(card, 'hidden items-center gap-6 p-6 md:flex lg:hidden')}>
        <div className="flex size-44 shrink-0 items-center rounded-lg bg-recording-fg/5 px-6 py-12 text-recording-wave">
          <Waveform
            seed={recording._id}
            bars={20}
            progress={progress}
            className="w-full"
            barClassName="w-[3px]"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className={cn('text-recording-wave', label)}>
            {[tapeLabel(recording), longKey(recording.key), isCurrent && 'Now playing']
              .filter(Boolean)
              .join(' · ')}
          </p>
          <h3 className="font-heading text-[32px] leading-10 font-medium tracking-h3">{title}</h3>
          <p className="text-sm text-fg-muted">
            {recording.note && <>{recording.note} </>}
            {meta}
          </p>
        </div>
        {playButton(false)}
      </article>

      {/* Desktop: square card, title bottom-left, big button bottom-right */}
      <article className={cn(card, 'hidden aspect-square flex-col justify-between p-8 lg:flex')}>
        <div className={cn('relative flex justify-between gap-4 text-recording-wave', label)}>
          <span>SK — {tapeLabel(recording)}</span>
          <span>{longKey(recording.key)?.toUpperCase()}</span>
        </div>
        <div className="relative h-40 text-recording-wave">
          <Waveform seed={recording._id} bars={40} progress={progress} barClassName="w-1.5" />
        </div>
        <div className="relative flex items-end justify-between gap-6">
          <h3 className="min-w-0 font-heading text-2xl font-medium tracking-display text-balance break-words">
            {title}
          </h3>
          {playButton(true)}
        </div>
      </article>
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
        className="site-container flex flex-col gap-8 md:gap-10 lg:gap-12"
      >
        <motion.header
          variants={rise}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6"
        >
          <div className="flex flex-col gap-4">
            <p className={cn(label, 'text-accent')}>Listen · Audio only</p>
            <SectionTitle>
              From the <Accent>practice tapes.</Accent>
            </SectionTitle>
          </div>
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between lg:flex-col lg:items-end lg:justify-start">
            {settings?.listenIntro && (
              <p className="text-lg text-fg-muted lg:text-right lg:text-base">
                {settings.listenIntro}
              </p>
            )}
            {total > 0 && (
              <Button
                onClick={() => recordings && player.shufflePlay(recordings)}
                className="h-12 rounded-full px-6 text-base lg:h-10 lg:px-5 lg:text-sm"
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
            <div className="grid gap-6 lg:grid-cols-[352px_1fr] lg:gap-12">
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
