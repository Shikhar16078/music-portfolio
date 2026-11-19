import { useRef, useState } from 'react'
import { PlayIcon } from 'lucide-react'
import { formatTime } from '@/lib/format'
import { desktopMediaQuery } from '@/lib/layout'
import { useInlineVideo } from '@/lib/inline-video-context'
import { InlineVideo } from '@/components/site/inline-video'
import { cn } from '@/lib/utils'
import { largestThumbnail, thumbnailSrcSet, videoMeta, type Video } from '@/lib/videos'

/**
 * YouTube facade: the real thumbnail (no player until clicked), duration chip and play button
 * on media tokens. Clicking loads the video in the same 16:9 frame.
 */
export function VideoCard({ video, className }: { video: Video; className?: string }) {
  const { open, close, playing } = useInlineVideo()
  const trigger = useRef<HTMLButtonElement>(null)
  const thumbnail = largestThumbnail(video)
  const [failedThumbnail, setFailedThumbnail] = useState<string>()
  return (
    <article className={cn('group flex w-full flex-col gap-4 md:max-lg:gap-3', className)}>
      {playing ? (
        <InlineVideo
          video={video}
          onClose={() => {
            close()
            requestAnimationFrame(() => trigger.current?.focus())
          }}
        />
      ) : (
        <button
          ref={trigger}
          type="button"
          onClick={open}
          aria-label={`Play video: ${video.title}`}
          className="video-thumbnail relative block aspect-video w-full overflow-hidden rounded-lg ring-1 ring-transparent transition-shadow outline-none hover:ring-accent/40 focus-visible:ring-2 focus-visible:ring-accent"
        >
          {thumbnail && thumbnail !== failedThumbnail && (
            <img
              src={thumbnail}
              onError={() => setFailedThumbnail(thumbnail)}
              srcSet={thumbnailSrcSet(video)}
              sizes={`${desktopMediaQuery} 33vw, (min-width: 768px) 50vw, 90vw`}
              alt=""
              loading="lazy"
              className="absolute inset-0 size-full object-cover transition-transform duration-(--duration-slow) ease-(--ease-attack) group-hover:scale-[1.03]"
            />
          )}
          <span
            aria-hidden
            className={cn(
              'absolute top-1/2 left-1/2 flex size-18 -translate-1/2 items-center justify-center rounded-full border border-video-control-fg/20 bg-video-control text-video-control-fg backdrop-blur-sm transition-all duration-(--duration-quick) group-hover:border-transparent group-hover:bg-accent group-hover:text-accent-foreground',
              'md:max-lg:size-14',
            )}
          >
            <PlayIcon className="size-6 translate-x-px fill-current" />
          </span>
          <span className="absolute right-4 bottom-4 rounded-sm bg-video-control px-2 py-1 font-mono text-xs text-video-control-fg tabular-nums md:max-lg:right-2 md:max-lg:bottom-2">
            {formatTime(video.duration)}
          </span>
        </button>
      )}
      <span className="flex flex-col gap-2 md:max-lg:gap-1">
        <span className={cn('font-mono text-xs tracking-wide text-fg-subtle uppercase')}>
          {videoMeta(video)}
        </span>
        <span
          className={cn(
            'font-heading text-2xl font-medium tracking-h3 text-fg transition-colors group-hover:text-accent md:line-clamp-2',
          )}
        >
          {video.title}
        </span>
      </span>
    </article>
  )
}
