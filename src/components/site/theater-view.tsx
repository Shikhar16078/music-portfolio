import { ArrowUpRightIcon, ChevronDownIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from '@/components/ui/drawer'
import { cn } from '@/lib/utils'
import { embedUrl, videoMeta, watchUrl, type Video } from '@/lib/videos'

const label = 'font-mono text-xs tracking-wide uppercase'

/** The 16:9 player. Videos with embedding disabled link out instead. */
function Screen({ video, className }: { video: Video; className?: string }) {
  return (
    <div className={cn('relative aspect-video w-full overflow-hidden bg-black', className)}>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 border border-dashed border-media-fg/20 text-center">
          <p className="text-media-fg/80">This video can’t play here.</p>
          <a
            href={watchUrl(video.id)}
            target="_blank"
            rel="noreferrer"
            className="text-media-accent hover:underline"
          >
            Open on YouTube ↗
          </a>
        </div>
      )}
    </div>
  )
}

function OpenOnYouTube({ video, className }: { video: Video; className?: string }) {
  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        'h-12 rounded-full border-media-fg/20 bg-transparent px-5 text-media-fg hover:bg-media-fg/10 hover:text-media-fg',
        className,
      )}
    >
      <a href={watchUrl(video.id)} target="_blank" rel="noreferrer">
        Open on YouTube
        <ArrowUpRightIcon />
      </a>
    </Button>
  )
}

/** Theater UI, loaded on first open (keeps the dialog + swipe-sheet code out of the first load). */
export default function TheaterView({
  video,
  open,
  setOpen,
  desktop,
}: {
  video: Video
  open: boolean
  setOpen: (open: boolean) => void
  desktop: boolean
}) {
  return (
    <>
      {desktop && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            showCloseButton={false}
            overlayClassName="z-[70] bg-media-bg/85 backdrop-blur-md"
            className="z-[70] w-[min(100%-4rem,1120px)] max-w-none gap-6 rounded-3xl bg-media-bg p-6 text-media-fg ring-media-fg/10 sm:max-w-none lg:p-10"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex min-w-0 flex-col gap-2">
                <DialogDescription className={cn(label, 'text-media-accent')}>
                  {videoMeta(video)}
                </DialogDescription>
                <DialogTitle className="font-heading text-2xl font-medium tracking-h3 text-balance">
                  {video.title}
                </DialogTitle>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <OpenOnYouTube video={video} />
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Close video"
                  onClick={() => setOpen(false)}
                  className="size-12 rounded-full bg-media-fg/10 text-media-fg hover:bg-media-fg/20 hover:text-media-fg"
                >
                  <XIcon />
                </Button>
              </div>
            </div>
            {/* Mount the iframe only while open so the video stops on close */}
            {open && <Screen video={video} className="rounded-2xl" />}
          </DialogContent>
        </Dialog>
      )}
      {!desktop && (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="z-[70] h-svh bg-media-bg text-media-fg data-[vaul-drawer-direction=bottom]:mt-0 data-[vaul-drawer-direction=bottom]:max-h-none data-[vaul-drawer-direction=bottom]:rounded-none data-[vaul-drawer-direction=bottom]:border-0 [&>div:first-child]:bg-media-fg/20">
            <div className="flex items-center justify-between px-4 pt-4">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close video"
                onClick={() => setOpen(false)}
                className="size-12 rounded-full bg-media-fg/10 text-media-fg hover:bg-media-fg/20 hover:text-media-fg"
              >
                <ChevronDownIcon />
              </Button>
              <span className={cn(label, 'text-media-fg/70')}>Swipe down to close</span>
            </div>
            <div className="flex flex-1 flex-col justify-center gap-6 pb-16">
              {open && <Screen video={video} />}
              <div className="flex flex-col gap-2 px-6">
                <DrawerDescription className={cn(label, 'text-media-accent')}>
                  {videoMeta(video)}
                </DrawerDescription>
                <DrawerTitle className="font-heading text-2xl font-medium tracking-h3 text-media-fg">
                  {video.title}
                </DrawerTitle>
              </div>
              <OpenOnYouTube video={video} className="mx-6" />
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  )
}
