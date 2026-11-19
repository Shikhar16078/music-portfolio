import { Connect } from '@/components/site/connect'
import { Footer } from '@/components/site/footer'
import { Header } from '@/components/site/header'
import { Hero } from '@/components/site/hero'
import { Journey } from '@/components/site/journey'
import { Listen } from '@/components/site/listen'
import { SECTIONS } from '@/components/site/nav'
import { PlayerBar } from '@/components/site/player-bar'
import { Videos } from '@/components/site/videos'
import { useActiveSection } from '@/lib/use-active-section'

const SECTION_IDS = SECTIONS.map((s) => s.id)

export default function App() {
  const active = useActiveSection(SECTION_IDS, 'home')

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
        <Videos />
        <Listen />
        <Connect />
      </main>
      {/* Room for the docked player so it never covers the footer */}
      <Footer className="pb-(--player-space)" />
      <PlayerBar />
    </>
  )
}
