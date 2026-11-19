import { createImageUrlBuilder } from '@sanity/image-url'
import type { PortableTextBlock } from '@portabletext/react'

const projectId = 't1hamr9e'
const dataset = 'production'
const apiVersion = '2025-01-01'
/** Public, cached query endpoint for the `production` dataset (read-only, no token). */
const QUERY_URL = `https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`

/**
 * Minimal read-only Sanity client: one GET per GROQ query.
 * (The official client adds ~500 kB for features this site never uses.)
 */
export const sanity = {
  async fetch<T>(query: string): Promise<T> {
    const res = await fetch(`${QUERY_URL}?query=${encodeURIComponent(query)}`)
    if (!res.ok) throw new Error(`Sanity query failed (${res.status})`)
    return ((await res.json()) as { result: T }).result
  },
}

const builder = createImageUrlBuilder({ projectId, dataset })

export type SanityImage = {
  asset?: { _ref: string }
  hotspot?: { x: number; y: number }
}

/** Sized, auto-format URL for a Sanity image. */
export function imageUrl(image: SanityImage, width: number) {
  return builder.image(image).width(width).auto('format').quality(75).url()
}

/** CSS object-position from the hotspot chosen in the Studio. */
export function hotspotPosition(image?: SanityImage) {
  const h = image?.hotspot
  return h ? `${Math.round(h.x * 100)}% ${Math.round(h.y * 100)}%` : undefined
}

export type SiteSettings = {
  heroIntro?: string
  journeyIntro?: string
  videosIntro?: string
  listenIntro?: string
  connectIntro?: string
  youtubeChannelUrl?: string
  youtubePlaylistId?: string
  instagramUrl?: string
  email?: string
  heroPhotoDusk?: SanityImage
  heroPhotoDaylight?: SanityImage
}

export const siteSettingsQuery = `*[_id == "siteSettings"][0]{
  heroIntro, journeyIntro, videosIntro, listenIntro, connectIntro,
  youtubeChannelUrl, youtubePlaylistId, instagramUrl, email,
  heroPhotoDusk, heroPhotoDaylight
}`

export type Chapter = {
  _id: string
  number: number
  title: string
  instrument?: 'piano' | 'guitar'
  body: PortableTextBlock[]
}

export const chaptersQuery = `*[_type == "chapter" && defined(number)] | order(number asc){
  _id, number, title, instrument, body
}`

export type Recording = {
  _id: string
  title: string
  tapeNumber: number
  kind: 'original' | 'cover'
  originalArtist?: string
  key?: string
  note?: string
  recordedOn?: string
  featured?: boolean
  cover?: SanityImage
  audioUrl: string
}

export const recordingsQuery = `*[_type == "recording" && defined(audio.asset) && defined(tapeNumber)] | order(tapeNumber asc){
  _id, title, tapeNumber, kind, originalArtist, key, note, recordedOn, featured, cover,
  "audioUrl": audio.asset->url
}`
