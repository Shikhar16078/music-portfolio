import { useState } from 'react'
import { PlayIcon } from 'lucide-react'
import { formatTime } from '@/lib/format'
import { useTheater } from '@/lib/theater-context'
import { cn } from '@/lib/utils'
import { largestThumbnail, thumbnailSrcSet, videoMeta, type Video } from '@/lib/videos'

/**
 * YouTube facade: the real thumbnail (no player until clicked), duration chip and play button
 * on media tokens. Clicking opens the theater. Hover lights the play button and the title.
 */
export function VideoCard({
  video,
  featured = false,
  className,
}: {
  video: Video
  /** Tablet: the first card spans the full width with a taller thumbnail. */
  featured?: boolean
  className?: string
}) {
  const { open } = useTheater()
  const thumbnail = largestThumbnail(video)
  const [failedThumbnail, setFailedThumbnail] = useState<string>()
  return (
    <button
      type="button"
      onClick={() => open(video)}
      aria-label={`Play video: ${video.title}`}
      className={cn('group flex w-full flex-col gap-4 text-left outline-none', className)}
    >
      <span
        className={cn(
          'video-thumbnail relative block aspect-video w-full overflow-hidden rounded-lg ring-1 ring-transparent transition-shadow',
          'group-hover:ring-accent/40 group-focus-visible:ring-2 group-focus-visible:ring-accent',
        )}
      >
        {thumbnail && thumbnail !== failedThumbnail && (
          <img
            src={thumbnail}
            onError={() => setFailedThumbnail(thumbnail)}
            srcSet={thumbnailSrcSet(video)}
            sizes={
              featured
                ? '(min-width: 768px) 100vw, 90vw'
                : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 90vw'
            }
            alt=""
            loading="lazy"
            className="absolute inset-0 size-full object-cover transition-transform duration-(--duration-slow) ease-(--ease-attack) group-hover:scale-[1.03]"
          />
        )}
        <span
          aria-hidden
          className="absolute top-1/2 left-1/2 flex size-18 -translate-1/2 items-center justify-center rounded-full border border-video-control-fg/20 bg-video-control text-video-control-fg backdrop-blur-sm transition-all duration-(--duration-quick) group-hover:border-transparent group-hover:bg-accent group-hover:text-accent-foreground"
        >
          <PlayIcon className="size-6 translate-x-px fill-current" />
        </span>
        <span className="absolute right-4 bottom-4 rounded-sm bg-video-control px-2 py-1 font-mono text-xs text-video-control-fg tabular-nums">
          {formatTime(video.duration)}
        </span>
      </span>
      <span className="flex flex-col gap-2">
        <span className="font-mono text-xs tracking-wide text-fg-subtle uppercase">
          {videoMeta(video)}
        </span>
        <span
          className={cn(
            'font-heading text-2xl font-medium tracking-h3 text-fg transition-colors group-hover:text-accent',
            featured && 'md:max-lg:text-[32px] md:max-lg:leading-10',
          )}
        >
          {video.title}
        </span>
      </span>
    </button>
  )
}
