import { useQuery } from '@tanstack/react-query'

/** Mirrors the shape returned by api/videos.ts. */
export type Video = {
  id: string
  title: string
  /** Seconds. */
  duration: number
  views: number
  publishedAt: string
  embeddable: boolean
  /** Smallest to largest. */
  thumbnails: { url: string; width: number }[]
}

export type VideosResponse = { featured: Video[]; latest: Video | null }

/** Featured playlist + latest upload, from our Vercel function (which holds the YouTube key). */
export function useVideos() {
  return useQuery({
    queryKey: ['videos'],
    queryFn: async () => {
      const res = await fetch('/api/videos')
      if (!res.ok) throw new Error(`Videos request failed (${res.status})`)
      const data = (await res.json()) as VideosResponse
      const tidy = (v: Video): Video => ({ ...v, title: cleanTitle(v.title) })
      return { featured: data.featured.map(tidy), latest: data.latest && tidy(data.latest) }
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}

/**
 * Drops the channel's own branding from titles for display:
 * "Zara Zara from RHTDM - A Piano Cover By Shikhar Kumar" → "Zara Zara from RHTDM".
 */
export function cleanTitle(title: string) {
  return (
    title
      .replace(/\s*[-–—|]\s*(a\s+)?piano\s+cover\s+by\s+shikhar\s+kumar\s*$/i, '')
      .replace(/\s*[-–—|]\s*shikhar[’']?s\s+piano\s*$/i, '')
      .trim() || title
  )
}

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })

/** 85213 → "85K views", 1 → "1 view". */
export function formatViews(views: number) {
  return `${compact.format(views)} ${views === 1 ? 'view' : 'views'}`
}

const relative = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
const DAY = 86_400_000

/** "2 years ago", "3 weeks ago", "yesterday". */
export function formatAge(iso: string, now = Date.now()) {
  const days = Math.round((now - new Date(iso).getTime()) / DAY)
  if (days >= 365) return relative.format(-Math.floor(days / 365), 'year')
  if (days >= 30) return relative.format(-Math.floor(days / 30), 'month')
  if (days >= 7) return relative.format(-Math.floor(days / 7), 'week')
  return relative.format(-days, 'day')
}

/** Uploaded in the last two weeks. */
export function isNew(iso: string, now = Date.now()) {
  return now - new Date(iso).getTime() < 14 * DAY
}

/** "85K views · 2 years ago" — the meta line on every card. */
export function videoMeta(video: Video) {
  return `${formatViews(video.views)} · ${formatAge(video.publishedAt)}`
}

export function thumbnailSrcSet(video: Video) {
  return video.thumbnails.map((t) => `${t.url} ${t.width}w`).join(', ')
}

export function largestThumbnail(video: Video) {
  return video.thumbnails[video.thumbnails.length - 1]?.url
}

export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`

/** Privacy-enhanced embed (no cookies until the visitor presses play). */
export const embedUrl = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
