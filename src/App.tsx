import { Skeleton } from '@/components/ui/skeleton'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { Hero } from '@/components/site/hero'
import { Journey } from '@/components/site/journey'
import { SECTIONS } from '@/components/site/nav'
import { Accent, Section } from '@/components/site/section'
import { useSiteSettings } from '@/lib/queries'
import { useActiveSection } from '@/lib/use-active-section'

const SECTION_IDS = SECTIONS.map((s) => s.id)

/** Placeholder body for sections that are built in later phases. */
function ComingNext({ label }: { label: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-8">
      <p className="font-mono text-xs tracking-wide text-fg-subtle uppercase">{label}</p>
      <Skeleton className="h-6 w-1/2 bg-surface-raised" />
      <Skeleton className="h-6 w-1/3 bg-surface-raised" />
    </div>
  )
}

export default function App() {
  const active = useActiveSection(SECTION_IDS, 'home')
  const { data } = useSiteSettings()

  return (
    <>
      <a
        href="#journey"
        className="sr-only z-50 rounded-full bg-accent px-4 py-2 text-accent-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <Header active={active} />
      <main>
        <Hero />
        <Journey />
        <Section
          id="videos"
          eyebrow="Videos · On YouTube"
          title={
            <>
              Most played <Accent>covers</Accent>
            </>
          }
          intro={data?.videosIntro}
          className="bg-surface"
        >
          <ComingNext label="Videos arrive in phase 4" />
        </Section>
        <Section
          id="listen"
          eyebrow="Listen · Audio only"
          title={
            <>
              From the <Accent>practice tapes.</Accent>
            </>
          }
          intro={data?.listenIntro}
        >
          <ComingNext label="Player arrives in phase 3" />
        </Section>
        <Section
          id="connect"
          eyebrow="Connect"
          title={
            <span className="font-display text-[56px] leading-[56px] font-normal tracking-display md:text-5xl">
              Pull up a <em className="text-accent">chair.</em>
            </span>
          }
          intro={data?.connectIntro}
          className="bg-surface"
        >
          <ComingNext label="Connect cards arrive in phase 5" />
        </Section>
      </main>
      <Footer />
    </>
  )
}
