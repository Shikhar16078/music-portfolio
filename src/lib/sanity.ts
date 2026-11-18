import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'
import type { PortableTextBlock } from '@portabletext/react'

/** Read-only client for the public `production` dataset (no token needed). */
export const sanity = createClient({
  projectId: 't1hamr9e',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
})

const builder = createImageUrlBuilder(sanity)

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
