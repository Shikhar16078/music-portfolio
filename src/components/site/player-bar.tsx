import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  ChevronDownIcon,
  CircleAlertIcon,
  ListMusicIcon,
  LoaderCircleIcon,
  Maximize2Icon,
  MinimizeIcon,
  PauseIcon,
  PlayIcon,
  Repeat1Icon,
  RepeatIcon,
  ShuffleIcon,
  SkipBackIcon,
  SkipForwardIcon,
  Volume2Icon,
  VolumeXIcon,
  XIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { LiveVisualizer, TapeArt } from '@/components/site/waveform'
import { formatTime, longKey, tapeLabel, trackTitle } from '@/lib/format'
import { spring } from '@/lib/motion'
import { usePlayer } from '@/lib/player-context'
import { cn } from '@/lib/utils'

const label = 'font-mono text-xs tracking-wide uppercase'
const iconButton =
  'size-12 rounded-full text-fg-muted hover:bg-surface-raised hover:text-fg lg:size-10 [&_svg]:size-5'

/** Shared slider look: thin rail and theme foreground thumb. */
const sliderLook = cn(
  'relative h-6 cursor-pointer',
  '**:data-[slot=slider-track]:h-1 **:data-[slot=slider-track]:bg-transparent',
  '**:data-[slot=slider-range]:bg-accent',
  '**:data-[slot=slider-thumb]:size-3 **:data-[slot=slider-thumb]:border-0 **:data-[slot=slider-thumb]:bg-fg',
)

function PlayPauseButton({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { playing, buffering, toggle } = usePlayer()
  return (
    <Button
      onClick={toggle}
      aria-label={playing ? 'Pause' : 'Play'}
      className={cn(
        'shrink-0 rounded-full',
        size === 'sm' && 'size-12 [&_svg]:size-4',
        size === 'md' && 'size-12 lg:size-10 [&_svg]:size-5',
        size === 'lg' && 'size-18 [&_svg]:size-6',
      )}
    >
      {buffering ? (
        <LoaderCircleIcon className="animate-spin" />
      ) : playing ? (
        <PauseIcon className="fill-current" />
      ) : (
        <PlayIcon className="translate-x-px fill-current" />
      )}
    </Button>
  )
}

/** Seek bar with the buffered range drawn behind it. ←/→ seek 5 seconds. */
function Progress({ className, showTimes = true }: { className?: string; showTimes?: boolean }) {
  const { time, duration, buffered, seek } = usePlayer()
  const [scrub, setScrub] = useState<number>()
  const shown = scrub ?? time
  const pct = (v: number) => (duration ? `${Math.min(100, (v / duration) * 100)}%` : '0%')

  return (
    <div className={cn('flex items-center gap-4 md:max-lg:gap-2', className)}>
      {showTimes && (
        <span className="w-10 shrink-0 text-right font-mono text-xs leading-4 text-fg-subtle tabular-nums md:max-lg:w-auto">
          {formatTime(shown)}
        </span>
      )}
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-border">
          <div className="h-full bg-border-strong/60" style={{ width: pct(buffered) }} />
        </div>
        <Slider
          aria-label="Seek"
          min={0}
          max={duration || 1}
          step={5}
          value={[shown]}
          disabled={!duration}
          onValueChange={([v]) => setScrub(v)}
          onValueCommit={([v]) => {
            seek(v)
            setScrub(undefined)
          }}
          className={cn(
            sliderLook,
            'seek-slider',
            showTimes ? 'h-4' : '**:data-[slot=slider-thumb]:size-4',
          )}
        />
      </div>
      {showTimes && (
        <span className="w-10 shrink-0 font-mono text-xs leading-4 text-fg-subtle tabular-nums md:max-lg:w-auto">
          {formatTime(duration || undefined)}
        </span>
      )}
    </div>
  )
}

function Transport({ size = 'md' }: { size?: 'md' | 'lg' }) {
  const { shuffle, repeat, toggleShuffle, cycleRepeat, prev, next } = usePlayer()
  const on = 'text-accent hover:text-accent'
  return (
    <div className={cn('flex items-center', size === 'lg' ? 'justify-between' : 'gap-2')}>
      <Button
        variant="ghost"
        size="icon"
        aria-label={shuffle ? 'Shuffle on' : 'Shuffle off'}
        aria-pressed={shuffle}
        onClick={toggleShuffle}
        className={cn(iconButton, shuffle && on, size === 'md' && 'hidden lg:inline-flex')}
      >
        <ShuffleIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Previous"
        onClick={prev}
        className={iconButton}
      >
        <SkipBackIcon className="fill-current" />
      </Button>
      <PlayPauseButton size={size} />
      <Button variant="ghost" size="icon" aria-label="Next" onClick={next} className={iconButton}>
        <SkipForwardIcon className="fill-current" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Repeat: ${repeat === 'off' ? 'off' : repeat === 'all' ? 'all tapes' : 'this tape'}`}
        onClick={cycleRepeat}
        className={cn(iconButton, repeat !== 'off' && on, size === 'md' && 'hidden lg:inline-flex')}
      >
        {repeat === 'one' ? <Repeat1Icon /> : <RepeatIcon />}
      </Button>
    </div>
  )
}

function ErrorBanner({ className }: { className?: string }) {
  const { retry } = usePlayer()
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 rounded-2xl border-l-2 border-destructive bg-surface-raised py-2 pr-2 pl-4 text-sm',
        className,
      )}
    >
      <CircleAlertIcon className="size-4 shrink-0 text-destructive" />
      <span className="flex-1">
        <span className="md:max-lg:hidden">Couldn’t load this recording.</span>
        <span className="hidden md:max-lg:inline">Load failed.</span>
      </span>
      <Button
        variant="ghost"
        onClick={retry}
        className="h-10 shrink-0 rounded-full px-4 text-accent md:max-lg:px-2"
      >
        Try again
      </Button>
    </div>
  )
}

/** "Up next" list. Picking a tape plays it within the same queue. */
function QueueButton() {
  const { upNext, playTrack } = usePlayer()
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Up next" className={iconButton}>
          <ListMusicIcon />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={16}
        className="z-[60] w-80 rounded-2xl border-border bg-surface-raised p-2"
      >
        <p className={cn('px-3 pt-2 pb-3', label, 'text-fg-subtle')}>Up next</p>
        {upNext.length ? (
          <ScrollArea className="max-h-80">
            <ul className="flex flex-col">
              {upNext.map((r) => (
                <li key={r._id}>
                  <button
                    type="button"
                    onClick={() => playTrack(r)}
                    className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-surface focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    <TapeArt recording={r} className="size-10 px-1.5 py-2.5" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{trackTitle(r)}</span>
                      <span className="text-xs text-fg-muted">{tapeLabel(r)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <p className="px-3 pb-3 text-sm text-fg-muted">That’s the last tape in the queue.</p>
        )}
      </PopoverContent>
    </Popover>
  )
}

function Volume() {
  const { volume, setVolume, toggleMute } = usePlayer()
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label={volume ? 'Mute' : 'Unmute'}
        onClick={toggleMute}
        className={iconButton}
      >
        {volume ? <Volume2Icon /> : <VolumeXIcon />}
      </Button>
      <Slider
        aria-label="Volume"
        min={0}
        max={1}
        step={0.05}
        value={[volume]}
        onValueChange={([v]) => setVolume(v)}
        className={cn(
          sliderLook,
          'hidden w-24 **:data-[slot=slider-range]:bg-fg-muted **:data-[slot=slider-track]:bg-border lg:flex',
        )}
      />
    </div>
  )
}

/** Desktop + tablet: floating bar docked 16px from the bottom. */
function DockedBar() {
  const { current, errorNotice, setExpanded } = usePlayer()
  if (!current) return null
  return (
    <div className="player-dock grid h-20 grid-cols-[min(248px,calc(100%-448px))_minmax(0,1fr)_auto] items-center gap-4 rounded-3xl border border-fg/8 bg-surface-raised px-4 shadow-overlay backdrop-blur-xl lg:h-18 lg:grid-cols-[min(320px,28%)_minmax(0,1fr)_auto] lg:gap-8">
      <div className="flex min-w-0 items-center gap-4">
        <TapeArt recording={current} className="size-12 px-2 py-3.5" />
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-sm leading-6 font-medium lg:text-base">
            {trackTitle(current)}
          </p>
          <p className="truncate text-xs leading-4 text-fg-muted lg:text-sm lg:leading-6">
            {[tapeLabel(current), longKey(current.key)].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>
      {errorNotice ? (
        <ErrorBanner className="md:max-lg:gap-1 md:max-lg:px-1.5" />
      ) : (
        <div className="flex min-w-0 flex-col items-center gap-1 lg:gap-0">
          <Transport />
          <Progress className="w-full" />
        </div>
      )}
      <div className="flex items-center justify-end gap-1 lg:gap-2">
        <QueueButton />
        <Volume />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Open player"
          onClick={() => setExpanded(true)}
          className={iconButton}
        >
          <Maximize2Icon />
        </Button>
        <HideCloseButtons />
      </div>
    </div>
  )
}

/** Hide: shrink to a small floating button, music keeps playing. Close: stop and remove. */
function HideCloseButtons() {
  const { setHidden, close } = usePlayer()
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Hide player"
        onClick={() => setHidden(true)}
        className={iconButton}
      >
        <MinimizeIcon />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Close player and stop music"
        onClick={close}
        className={iconButton}
      >
        <XIcon />
      </Button>
    </>
  )
}

/** Hidden state: a small round button with the playing bars; click to bring the player back. */
function ShowPlayerButton() {
  const { current, playing, time, duration, setHidden } = usePlayer()
  if (!current) return null
  const pct = duration ? (time / duration) * 100 : 0
  return (
    <Button
      onClick={() => setHidden(false)}
      aria-label={`Show player: ${trackTitle(current)}`}
      className="relative size-14 rounded-full border border-border bg-surface-raised/95 p-0 text-accent shadow-overlay backdrop-blur-xl hover:bg-surface-raised"
      style={{
        backgroundImage: `conic-gradient(var(--accent) ${pct}%, transparent 0)`,
        backgroundOrigin: 'border-box',
      }}
    >
      <span className="absolute inset-0.5 flex items-center justify-center rounded-full bg-surface-raised">
        <EqGlyph playing={playing} />
      </span>
    </Button>
  )
}

function EqGlyph({ playing }: { playing: boolean }) {
  return (
    <span aria-hidden className="flex h-5 items-end gap-0.5">
      {[0.6, 1, 0.45, 0.8].map((h, i) => (
        <motion.span
          key={i}
          className="w-1 origin-bottom rounded-full bg-current"
          style={{ height: `${h * 100}%` }}
          animate={playing ? { scaleY: [1, 0.35, 0.9, 0.5, 1] } : { scaleY: 0.45 }}
          transition={playing ? { duration: 1.1 + i * 0.15, repeat: Infinity } : { duration: 0.24 }}
        />
      ))}
    </span>
  )
}

/** Phone: compact bar. Tapping the title opens the full-screen player. */
function MiniPlayer() {
  const { current, time, duration, next, errorNotice, setExpanded } = usePlayer()
  if (!current) return null
  return (
    <div className="player-mini relative flex h-16 items-center gap-2 overflow-hidden rounded-2xl px-2 pb-0.5 shadow-overlay backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={`Open player: ${trackTitle(current)}`}
        className="flex min-w-0 flex-1 items-center gap-2 self-stretch text-left"
      >
        <TapeArt recording={current} className="size-12 px-2 py-3.5" />
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-sm leading-6 font-medium">{trackTitle(current)}</span>
          <span
            className={cn('truncate text-xs', errorNotice ? 'text-destructive' : 'text-fg-muted')}
          >
            {errorNotice
              ? 'Couldn’t load this recording'
              : `${tapeLabel(current)} · ${formatTime(time)}`}
          </span>
        </span>
      </button>
      <Button variant="ghost" size="icon" aria-label="Next" onClick={next} className={iconButton}>
        <SkipForwardIcon className="fill-current" />
      </Button>
      <PlayPauseButton size="sm" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-0.5 bg-border">
        <div
          className="h-full bg-accent"
          style={{ width: duration ? `${(time / duration) * 100}%` : '0%' }}
        />
      </div>
    </div>
  )
}

/** Full-screen player with the live visualizer (phone sheet; also opened from the desktop bar). */
function ExpandedPlayer() {
  const { current, expanded, setExpanded, errorNotice } = usePlayer()
  return (
    <Sheet open={expanded && Boolean(current)} onOpenChange={setExpanded}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="z-[55] max-h-none gap-0 border-0 bg-[linear-gradient(to_bottom,color-mix(in_srgb,var(--accent)_14%,var(--surface)),var(--bg)_45%)] p-0 data-[side=bottom]:top-0 data-[side=bottom]:h-svh"
      >
        {current && (
          <div className="mx-auto flex h-full w-full max-w-md flex-col gap-8 overflow-y-auto px-6 pt-6 pb-10">
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                size="icon"
                aria-label="Collapse player"
                onClick={() => setExpanded(false)}
                className="size-12 rounded-full"
              >
                <ChevronDownIcon />
              </Button>
              <SheetTitle className={cn(label, 'font-normal text-fg-muted')}>
                Practice tapes
              </SheetTitle>
              <SheetDescription className="sr-only">
                Now playing {trackTitle(current)}
              </SheetDescription>
              <div className="flex items-center gap-1">
                <QueueButton />
                <PhoneCloseButton />
              </div>
            </div>

            <div className="relative flex aspect-square flex-col overflow-hidden rounded-3xl border border-border bg-recording-bg p-4 text-recording-wave">
              <span
                className={cn(
                  'relative flex w-fit items-center gap-2 rounded-full bg-recording-fg/8 px-3 py-1.5 text-recording-fg',
                  label,
                )}
              >
                <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                Visualizer
              </span>
              <div className="relative flex flex-1 items-center px-4">
                <LiveVisualizer seed={current._id} className="h-1/2 w-full" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-heading text-2xl font-medium tracking-h3">{trackTitle(current)}</p>
              <p className="text-fg-muted">
                {[tapeLabel(current), longKey(current.key)].filter(Boolean).join(' · ')}
              </p>
            </div>

            {errorNotice ? (
              <ErrorBanner />
            ) : (
              <div className="flex flex-col gap-2">
                <Progress showTimes={false} />
                <ProgressTimes />
              </div>
            )}
            <Transport size="lg" />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function PhoneCloseButton() {
  const { close } = usePlayer()
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Close player and stop music"
      onClick={close}
      className={iconButton}
    >
      <XIcon />
    </Button>
  )
}

function ProgressTimes() {
  const { time, duration } = usePlayer()
  return (
    <div className="flex justify-between font-mono text-xs text-fg-subtle tabular-nums">
      <span>{formatTime(time)}</span>
      <span>{formatTime(duration || undefined)}</span>
    </div>
  )
}

/**
 * Docked player: appears once a tape is played, at the same width as the nav.
 * Sets data-player on <html> so sections shrink by the player's height (see --player-space).
 * Layer 50, under the sheet and popovers.
 */
export function PlayerBar() {
  const { current, hidden } = usePlayer()
  const docked = Boolean(current) && !hidden

  useEffect(() => {
    const root = document.documentElement
    if (docked) root.dataset.player = 'docked'
    else delete root.dataset.player
  }, [docked])

  return (
    <>
      <AnimatePresence>
        {docked && (
          <motion.div
            key="docked"
            role="region"
            aria-label="Audio player"
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={spring.settle}
            className="fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 px-6 md:bottom-4 md:px-12 lg:bottom-4 lg:px-24"
          >
            <div className="mx-auto max-w-(--site-content-max)">
              <div className="md:hidden">
                <MiniPlayer />
              </div>
              <div className="hidden md:block">
                <DockedBar />
              </div>
            </div>
          </motion.div>
        )}
        {current && hidden && (
          <motion.div
            key="hidden"
            role="region"
            aria-label="Audio player (hidden)"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={spring.key}
            className="fixed right-(--site-gutter) bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 md:bottom-4 lg:right-[max(var(--site-gutter),calc((100%_-_var(--site-content-max))/2))] lg:bottom-4"
          >
            <ShowPlayerButton />
          </motion.div>
        )}
      </AnimatePresence>
      <ExpandedPlayer />
    </>
  )
}
