/** Small deterministic random generator, so a tape always gets the same artwork. */
function seededRandom(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

/** Bar heights (0–1) shaped like a recording: quiet edges, a swell somewhere in the middle. */
export function wavePeaks(seed: string, count: number) {
  const rand = seededRandom(seed)
  const centre = 0.38 + rand() * 0.28
  const width = 0.16 + rand() * 0.14
  return Array.from({ length: count }, (_, i) => {
    const x = count === 1 ? 0.5 : i / (count - 1)
    const envelope = 0.22 + 0.78 * Math.exp(-((x - centre) ** 2) / (2 * width ** 2))
    return Math.max(0.12, envelope * (0.5 + 0.5 * rand()))
  })
}

/** Stable tint assignment. Each theme defines its own waveform and background colors. */
export function tintFor(seed: string) {
  const index = Math.floor(seededRandom(seed)() * 4)
  return {
    color: `var(--tape-wave-${index})`,
    background: `var(--tape-bg-${index})`,
  }
}
