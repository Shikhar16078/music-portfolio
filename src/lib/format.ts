import type { Recording } from '@/lib/sanity'

export const pad2 = (n: number) => String(n).padStart(2, '0')

/** 384 → "6:24". Unknown → "–:––". */
export function formatTime(seconds?: number) {
  if (seconds === undefined || !Number.isFinite(seconds)) return '–:––'
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${pad2(s % 60)}`
}

/** "C♯ / D♭ major" → { note: "D♭", mode: "major" } (flat spelling wins). */
function parseKey(key?: string) {
  if (!key) return undefined
  const mode = key.endsWith('minor') ? 'minor' : 'major'
  const notes = key.replace(/ (major|minor)$/, '').split(' / ')
  return { note: notes[notes.length - 1], mode }
}

/** "D♭ MAJ" for compact labels. */
export function shortKey(key?: string) {
  const k = parseKey(key)
  return k ? `${k.note} ${k.mode === 'major' ? 'MAJ' : 'MIN'}` : undefined
}

/** "D♭ major" for prose. */
export function longKey(key?: string) {
  const k = parseKey(key)
  return k ? `${k.note} ${k.mode}` : undefined
}

/** Covers show who it's by: "Experience — Einaudi". */
export function trackTitle(r: Recording) {
  return r.kind === 'cover' && r.originalArtist ? `${r.title} — ${r.originalArtist}` : r.title
}

export const tapeLabel = (r: Recording) => `Tape ${pad2(r.tapeNumber)}`
export const kindLabel = (r: Recording) => (r.kind === 'cover' ? 'Cover' : 'Original')
