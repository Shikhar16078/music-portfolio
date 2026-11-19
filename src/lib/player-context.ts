import { createContext, useContext } from 'react'
import type { Recording } from '@/lib/sanity'

export type RepeatMode = 'off' | 'all' | 'one'

export type Player = {
  current?: Recording
  /** Tapes still to come, in play order (respects shuffle). */
  upNext: Recording[]
  playing: boolean
  buffering: boolean
  error: boolean
  errorNotice: boolean
  time: number
  duration: number
  /** Seconds buffered ahead of the start. */
  buffered: number
  volume: number
  shuffle: boolean
  repeat: RepeatMode
  expanded: boolean
  /** Player minimised to a small floating button (music keeps playing). */
  hidden: boolean
  /** Plays a tape (or toggles it if it's already the current one). `queue` becomes the play list. */
  playTrack: (track: Recording, queue?: Recording[]) => void
  shufflePlay: (queue: Recording[]) => void
  toggle: () => void
  pause: () => void
  next: () => void
  prev: () => void
  seek: (seconds: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleShuffle: () => void
  cycleRepeat: () => void
  retry: () => void
  setExpanded: (open: boolean) => void
  setHidden: (hidden: boolean) => void
  /** Stops the music and removes the player. */
  close: () => void
  /** Web Audio analyser for the live visualizer, created on first use. */
  getAnalyser: () => AnalyserNode | null
}

export const PlayerContext = createContext<Player | null>(null)

export function usePlayer() {
  const ctx = useContext(PlayerContext)
  if (!ctx) throw new Error('usePlayer must be used inside <PlayerProvider>')
  return ctx
}
