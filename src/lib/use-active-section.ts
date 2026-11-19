import { useEffect, useState } from 'react'

/** Returns the id of the section currently in the middle of the viewport. */
export function useActiveSection<T extends string>(ids: readonly T[], initial: T): T {
  const [active, setActive] = useState<T>(initial)

  useEffect(() => {
    const sections = ids.flatMap((id) => {
      const element = document.getElementById(id)
      return element ? [{ id, element }] : []
    })
    const viewport = window.visualViewport
    let frame = 0

    function update() {
      frame = 0
      const midpoint = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight) / 2
      const section = sections.find(({ element }) => {
        const { top, bottom } = element.getBoundingClientRect()
        return top <= midpoint && midpoint < bottom
      })
      if (section) setActive(section.id)
    }

    function scheduleUpdate() {
      if (!frame) frame = window.requestAnimationFrame(update)
    }

    const observer = new ResizeObserver(scheduleUpdate)
    sections.forEach(({ element }) => observer.observe(element))
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    viewport?.addEventListener('resize', scheduleUpdate)
    viewport?.addEventListener('scroll', scheduleUpdate)
    update()

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      viewport?.removeEventListener('resize', scheduleUpdate)
      viewport?.removeEventListener('scroll', scheduleUpdate)
      window.cancelAnimationFrame(frame)
    }
  }, [ids])

  return active
}
