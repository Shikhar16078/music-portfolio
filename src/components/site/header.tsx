import { CirclePlayIcon, MenuIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { ThemeChips, ThemePicker } from '@/components/site/theme-picker'
import { SECTIONS, subscribeUrl, type SectionId } from '@/components/site/nav'
import { useSiteSettings } from '@/lib/queries'
import { cn } from '@/lib/utils'

function SubscribeButton({ className }: { className?: string }) {
  const { data } = useSiteSettings()
  const href = subscribeUrl(data?.youtubeChannelUrl)
  return (
    <Button asChild className={cn('h-12 rounded-full px-5', className)}>
      <a href={href ?? '#'} target="_blank" rel="noreferrer" aria-disabled={!href}>
        <CirclePlayIcon />
        Subscribe
      </a>
    </Button>
  )
}

/** Floating pill nav (tablet and up) and top bar + sheet menu (phone). */
export function Header({ active }: { active: SectionId }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 md:px-8 md:pt-6 lg:px-24">
      {/* Tablet and up */}
      <nav
        aria-label="Main"
        className="mx-auto hidden h-18 max-w-(--container-wide) items-center justify-between rounded-full border border-border bg-surface/80 pr-3 pl-6 backdrop-blur-xl md:flex"
      >
        <ul className="flex items-center gap-1">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={active === s.id ? 'true' : undefined}
                className={cn(
                  'relative flex h-12 items-center px-3 text-sm text-fg-muted transition-colors hover:text-fg',
                  'aria-[current]:text-fg aria-[current]:after:absolute aria-[current]:after:bottom-2 aria-[current]:after:left-1/2 aria-[current]:after:size-1 aria-[current]:after:-translate-x-1/2 aria-[current]:after:rounded-full aria-[current]:after:bg-accent',
                )}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <div className="hidden lg:block">
            <ThemePicker />
          </div>
          <div className="lg:hidden">
            <ThemePicker compact />
          </div>
          <SubscribeButton />
        </div>
      </nav>

      {/* Phone */}
      <div className="flex items-center justify-between md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              aria-label="Open menu"
              className="size-12 rounded-full border-border bg-surface/75 backdrop-blur-xl"
            >
              <MenuIcon />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="top"
            showCloseButton={false}
            className="z-[55] gap-8 rounded-b-4xl border-border bg-surface px-6 pt-16 pb-8"
          >
            <div className="flex items-center justify-between">
              <SheetTitle className="font-mono text-xs font-normal tracking-wide text-fg-subtle uppercase">
                Menu
              </SheetTitle>
              <SheetDescription className="sr-only">Site sections and theme</SheetDescription>
              <SheetClose asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  aria-label="Close menu"
                  className="size-12 rounded-full"
                >
                  <XIcon />
                </Button>
              </SheetClose>
            </div>
            <ul className="flex flex-col gap-2">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active === s.id ? 'true' : undefined}
                    className="flex h-14 items-center justify-between rounded-2xl px-4 font-heading text-3xl font-medium tracking-h3 text-fg-muted aria-[current]:bg-accent-soft aria-[current]:text-fg aria-[current]:ring-1 aria-[current]:ring-accent/35"
                  >
                    {s.label}
                    {active === s.id && (
                      <span className="flex items-center gap-2 font-mono text-xs tracking-wide text-accent uppercase">
                        Here <span aria-hidden className="size-2 rounded-full bg-accent" />
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
            <Separator />
            <div className="flex flex-col gap-4">
              <p className="font-mono text-xs tracking-wide text-fg-subtle uppercase">Theme</p>
              <ThemeChips />
            </div>
          </SheetContent>
        </Sheet>
        <SubscribeButton />
      </div>
    </header>
  )
}
