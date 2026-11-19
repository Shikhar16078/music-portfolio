import { createContext, useContext } from 'react'
import type { Video } from '@/lib/videos'

export const TheaterContext = createContext<{ open: (video: Video) => void } | null>(null)

/** Opens the video theater (and pauses the audio player). */
export function useTheater() {
  const ctx = useContext(TheaterContext)
  if (!ctx) throw new Error('useTheater must be used inside <TheaterProvider>')
  return ctx
}
