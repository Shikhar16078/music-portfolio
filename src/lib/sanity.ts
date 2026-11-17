import { createClient } from '@sanity/client'

/** Read-only client for the public `production` dataset (no token needed). */
export const sanity = createClient({
  projectId: 't1hamr9e',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: true,
})

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
}

export const siteSettingsQuery = `*[_id == "siteSettings"][0]{
  heroIntro, journeyIntro, videosIntro, listenIntro, connectIntro,
  youtubeChannelUrl, youtubePlaylistId, instagramUrl, email
}`
