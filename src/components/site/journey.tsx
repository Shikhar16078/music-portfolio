import { useState } from 'react'
import { ArrowDownIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { motion } from 'motion/react'
import { PortableText, toPlainText } from '@portabletext/react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accent } from '@/components/site/section'
import { rise, stagger } from '@/lib/motion'
import { useChapters, useSiteSettings } from '@/lib/queries'
import type { Chapter } from '@/lib/sanity'
import { useMediaQuery } from '@/lib/use-media-query'
import { cn } from '@/lib/utils'

const pad = (n: number) => String(n).padStart(2, '0')

/** "Six strings, sore fingers" → ["Six strings, ", "sore fingers."]; otherwise the last word is the accent. */
function splitTitle(title: string): [string, string] {
  const comma = title.lastIndexOf(', ')
  const cut = comma >= 0 ? comma + 2 : title.lastIndexOf(' ') + 1
  const accent = title.slice(cut)
  return [title.slice(0, cut), /[.!?]$/.test(accent) ? accent : `${accent}.`]
}

function readMinutes(chapter: Chapter) {
  const words = toPlainText(chapter.body ?? [])
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/** Story text from Sanity. The first paragraph leads; the rest are quieter. */
function ChapterBody({ chapter }: { chapter: Chapter }) {
  return (
    <div className="flex flex-col gap-4 text-base text-fg-muted [&>p:first-child]:text-lg [&>p:first-child]:leading-8 [&>p:first-child]:text-fg">
      <PortableText
        value={chapter.body ?? []}
        components={{
          block: { normal: ({ children }) => <p>{children}</p> },
          marks: {
            em: ({ children }) => <em className="font-display text-[1.1em]">{children}</em>,
          },
        }}
      />
    </div>
  )
}

function ChapterMeta({ chapter }: { chapter: Chapter }) {
  const guitar = chapter.instrument === 'guitar'
  return (
    <div className="flex flex-wrap items-center gap-3 font-mono text-xs tracking-wide uppercase">
      <span className="text-accent">Chapter {pad(chapter.number)}</span>
      <span
        className={cn(
          'flex h-6 items-center rounded-sm px-2',
          guitar ? 'bg-rosewood text-piano' : 'bg-accent-soft text-accent',
        )}
      >
        {guitar ? 'Guitar' : 'Piano'}
      </span>
      <span className="text-fg-subtle">{readMinutes(chapter)} min read</span>
    </div>
  )
}

function JourneyHeading() {
  const { data } = useSiteSettings()
  return (
    <motion.div variants={rise} className="flex flex-col gap-4">
      <p className="font-mono text-xs tracking-wide text-accent uppercase">The journey</p>
      <h2 className="font-heading text-[40px] leading-12 font-medium tracking-h1 md:text-[56px] md:leading-16 lg:text-4xl">
        Learning by ear, <Accent>one song at a time.</Accent>
      </h2>
      {data?.journeyIntro && <p className="text-lg text-fg-muted">{data.journeyIntro}</p>}
    </motion.div>
  )
}

/** Desktop: chapter list + reader. Tablet: chapter tabs + reader. */
function JourneyTabs({ chapters }: { chapters: Chapter[] }) {
  const [current, setCurrent] = useState(chapters[0]._id)
  const index = chapters.findIndex((c) => c._id === current)
  const go = (i: number) => setCurrent(chapters[i]._id)
  const desktop = useMediaQuery('(min-width: 1024px)')

  return (
    <Tabs
      value={current}
      onValueChange={setCurrent}
      orientation={desktop ? 'vertical' : 'horizontal'}
      className="grid gap-8 lg:grid-cols-[520px_1fr] lg:gap-16"
    >
      <div className="flex flex-col gap-8 lg:gap-6">
        <JourneyHeading />
        <motion.div variants={rise}>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 lg:flex-col lg:items-stretch lg:rounded-3xl lg:border lg:border-border lg:bg-surface lg:p-2">
            {chapters.map((c) => (
              <TabsTrigger
                key={c._id}
                value={c._id}
                className={cn(
                  'group h-12 flex-none gap-2 rounded-full border border-border px-5 font-mono text-xs tracking-wide text-fg-subtle uppercase',
                  'data-[state=active]:border-accent data-[state=active]:bg-accent-soft data-[state=active]:text-accent',
                  'lg:w-full lg:justify-start lg:gap-4 lg:rounded-lg lg:border-0 lg:px-0 lg:pr-4 lg:data-[state=active]:bg-surface-raised',
                )}
              >
                <span
                  aria-hidden
                  className="hidden h-6 w-0.5 rounded-full group-data-[state=active]:bg-accent lg:block"
                />
                <span className="lg:w-14 lg:text-left">Ch. {pad(c.number)}</span>
                <span className="hidden flex-1 text-left font-sans text-base font-medium tracking-normal text-fg-muted normal-case group-data-[state=active]:text-fg lg:block">
                  {c.title}
                </span>
                <ChevronRightIcon className="hidden text-fg-subtle group-data-[state=active]:text-accent lg:block" />
              </TabsTrigger>
            ))}
          </TabsList>
        </motion.div>
      </div>

      {chapters.map((c, i) => {
        const [lead, accent] = splitTitle(c.title)
        const last = i === chapters.length - 1
        return (
          <TabsContent key={c._id} value={c._id} className="flex">
            <motion.article
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative flex flex-1 flex-col justify-between gap-8 overflow-hidden rounded-3xl border border-border bg-surface p-8 md:p-10 lg:p-12"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -top-32 -right-32 size-96 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--accent)_10%,transparent),transparent_70%)]"
              />
              <div className="relative flex flex-col gap-6">
                <ChapterMeta chapter={c} />
                <h3 className="font-heading text-2xl font-medium tracking-h3 lg:text-3xl">
                  {lead}
                  <Accent>{accent}</Accent>
                </h3>
                <ScrollArea className="lg:h-64 lg:pr-4">
                  <ChapterBody chapter={c} />
                </ScrollArea>
              </div>
              <div className="relative flex items-center justify-between border-t border-border pt-6">
                <span className="font-mono text-xs tracking-wide text-fg-subtle">
                  {pad(i + 1)} / {pad(chapters.length)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Previous chapter"
                    disabled={i === 0}
                    onClick={() => go(index - 1)}
                    className="size-12 rounded-full border-border-strong bg-transparent"
                  >
                    <ChevronLeftIcon />
                  </Button>
                  {last ? (
                    <Button asChild className="h-12 rounded-full px-5">
                      <a href="#videos">
                        Hear where it led
                        <ArrowDownIcon />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => go(index + 1)}
                      className="h-12 rounded-full border-border-strong bg-transparent px-5"
                    >
                      Next chapter
                      <ChevronRightIcon className="text-accent" />
                    </Button>
                  )}
                </div>
              </div>
            </motion.article>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}

/** Phone: one accordion item per chapter, no inner scrolling. */
function JourneyAccordion({ chapters }: { chapters: Chapter[] }) {
  return (
    <div className="flex flex-col gap-8">
      <JourneyHeading />
      <motion.div variants={rise}>
        <Accordion type="single" collapsible defaultValue={chapters[0]._id} className="gap-2">
          {chapters.map((c) => (
            <AccordionItem
              key={c._id}
              value={c._id}
              className="rounded-2xl border border-border not-last:border-b data-[state=open]:border-accent/35 data-[state=open]:bg-surface"
            >
              <AccordionTrigger className="min-h-14 items-center gap-4 px-4 py-3 hover:no-underline">
                <span className="w-14 shrink-0 font-mono text-xs tracking-wide whitespace-nowrap text-fg-subtle uppercase">
                  Ch. {pad(c.number)}
                </span>
                <span className="flex-1 text-base font-medium text-fg-muted">{c.title}</span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-6">
                <ChapterBody chapter={c} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </motion.div>
    </div>
  )
}

export function Journey() {
  const { data: chapters, isPending, isError } = useChapters()

  return (
    <section id="journey" className="scroll-mt-28 py-24 md:py-32">
      <motion.div
        // Remount when the chapters arrive so their entrance animation runs too
        key={isPending ? 'loading' : 'ready'}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        variants={stagger}
        className="mx-auto max-w-(--container-wide) px-6 md:px-12 lg:px-24"
      >
        {isPending ? (
          <div className="flex flex-col gap-4">
            <JourneyHeading />
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl bg-surface-raised" />
            ))}
          </div>
        ) : isError || !chapters?.length ? (
          <div className="flex flex-col gap-8">
            <JourneyHeading />
            <p className="text-fg-muted">
              The chapters couldn’t load right now. Try again in a bit.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <JourneyTabs chapters={chapters} />
            </div>
            <div className="md:hidden">
              <JourneyAccordion chapters={chapters} />
            </div>
          </>
        )}
      </motion.div>
    </section>
  )
}
