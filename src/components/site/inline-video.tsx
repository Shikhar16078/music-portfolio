import { useState, type ReactNode } from 'react'
import { XIcon } from 'lucide-react'
import { InlineVideoContext } from '@/lib/inline-video-context'
import { usePlayer } from '@/lib/player-context'
import { cn } from '@/lib/utils'
import { embedUrl, watchUrl, type Video } from '@/lib/videos'

export function InlineVideoProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null)
  const { pause } = usePlayer()
  return (
    <InlineVideoContext.Provider
      value={{
        active,
        open: (id) => {
          pause()
          setActive(id)
        },
        close: () => setActive(null),
      }}
    >
      {children}
    </InlineVideoContext.Provider>
  )
}

export function InlineVideo({
  video,
  onClose,
  className,
}: {
  video: Video
  onClose: () => void
  className?: string
}) {
  return (
    <div
      className={cn('relative aspect-video w-full overflow-hidden rounded-lg bg-black', className)}
    >
      {video.embeddable ? (
        <iframe
          src={embedUrl(video.id)}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center text-white">
          <p>This video can’t play here.</p>
          <a href={watchUrl(video.id)} target="_blank" rel="noreferrer" className="underline">
            Open on YouTube ↗
          </a>
        </div>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close inline video"
        className="absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-black/80 text-white hover:bg-black focus-visible:outline-2 focus-visible:outline-white"
      >
        <XIcon className="size-4" />
      </button>
    </div>
  )
}
