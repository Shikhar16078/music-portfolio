import { lazy, Suspense, useCallback, useMemo, useState, type ReactNode } from 'react'
import { usePlayer } from '@/lib/player-context'
import { TheaterContext } from '@/lib/theater-context'
import { useMediaQuery } from '@/lib/use-media-query'
import type { Video } from '@/lib/videos'

const TheaterView = lazy(() => import('@/components/site/theater-view'))

/**
 * Provides `open(video)`; renders the theater. Stays dark in every theme (media tokens).
 * Tablet + desktop: centred dialog. Phone: full-screen sheet you can swipe down.
 * Layer 70, above the player and sheets.
 */
export function TheaterProvider({ children }: { children: ReactNode }) {
  const [video, setVideo] = useState<Video | null>(null)
  const [open, setOpen] = useState(false)
  const { pause } = usePlayer()
  const desktop = useMediaQuery('(min-width: 768px)')

  const openVideo = useCallback(
    (v: Video) => {
      pause()
      setVideo(v)
      setOpen(true)
    },
    [pause],
  )
  const value = useMemo(() => ({ open: openVideo }), [openVideo])

  return (
    <TheaterContext.Provider value={value}>
      {children}
      {video && (
        <Suspense fallback={null}>
          <TheaterView video={video} open={open} setOpen={setOpen} desktop={desktop} />
        </Suspense>
      )}
    </TheaterContext.Provider>
  )
}
