import { useEffect, useMemo, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { usePlayer } from '@/lib/player-context'
import { hotspotPosition, imageUrl, type Recording } from '@/lib/sanity'
import { cn } from '@/lib/utils'
import { tintFor, wavePeaks } from '@/lib/waveform'

/** Static waveform. Bars after `progress` (0–1) are dimmed. Colour comes from `currentColor`. */
export function Waveform({
  seed,
  bars,
  progress,
  className,
  barClassName,
}: {
  seed: string
  bars: number
  progress?: number
  className?: string
  barClassName?: string
}) {
  const peaks = useMemo(() => wavePeaks(seed, bars), [seed, bars])
  return (
    <div aria-hidden className={cn('flex h-full items-center justify-between', className)}>
      {peaks.map((p, i) => (
        <span
          key={i}
          className={cn(
            'w-0.5 shrink-0 rounded-full bg-current transition-opacity duration-(--duration-quick)',
            progress !== undefined && (i + 0.5) / bars > progress && 'opacity-35',
            barClassName,
          )}
          style={{ height: `${p * 100}%` }}
        />
      ))}
    </div>
  )
}

/** Square tape artwork: the uploaded cover, or a waveform drawn from the tape's id. */
export function TapeArt({ recording, className }: { recording: Recording; className?: string }) {
  if (recording.cover?.asset) {
    return (
      <img
        src={imageUrl(recording.cover, 160)}
        alt=""
        loading="lazy"
        className={cn('size-14 shrink-0 rounded-md object-cover', className)}
        style={{ objectPosition: hotspotPosition(recording.cover) }}
      />
    )
  }
  const tint = tintFor(recording._id)
  return (
    <div
      aria-hidden
      className={cn('flex size-14 shrink-0 items-center rounded-md px-2.5 py-4', className)}
      style={tint}
    >
      <Waveform seed={recording._id} bars={11} className="w-full" />
    </div>
  )
}

/**
 * Live visualizer for the expanded player: bars follow the music through a Web Audio analyser.
 * Falls back to the tape's static waveform when paused, unsupported or with reduced motion.
 */
export function LiveVisualizer({ seed, className }: { seed: string; className?: string }) {
  const { playing, getAnalyser } = usePlayer()
  const reduce = useReducedMotion()
  const bars = 28
  const rest = useMemo(() => wavePeaks(seed, bars).map((p) => p * 0.45), [seed])
  const refs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (reduce) return
    const analyser = getAnalyser()
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : undefined
    const heights = [...rest]
    let frame = 0
    const tick = () => {
      if (analyser && data && playing) analyser.getByteFrequencyData(data)
      heights.forEach((h, i) => {
        // Mirror around the centre and favour the lower, more musical bins
        const bin = Math.floor(
          (Math.abs(i - bars / 2) / (bars / 2)) ** 1.4 * (data?.length ?? 1) * 0.7,
        )
        const target = playing && data ? Math.max(0.08, (data[bin] ?? 0) / 255) : rest[i]
        heights[i] = h + (target - h) * 0.25
        const el = refs.current[i]
        if (el) el.style.transform = `scaleY(${heights[i]})`
      })
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, getAnalyser, reduce, rest])

  if (reduce) return <Waveform seed={seed} bars={bars} className={className} barClassName="w-1" />

  return (
    <div aria-hidden className={cn('flex h-full items-center justify-between', className)}>
      {rest.map((h, i) => (
        <span
          key={i}
          ref={(el) => {
            refs.current[i] = el
          }}
          className="h-full w-1 origin-center rounded-full bg-current"
          style={{ transform: `scaleY(${h})` }}
        />
      ))}
    </div>
  )
}
