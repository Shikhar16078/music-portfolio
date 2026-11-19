import { applyRecordingOrder } from '../../studio/lib/recordingOrder'
import { useQuery } from '@tanstack/react-query'
import {
  chaptersQuery,
  recordingsQuery,
  sanity,
  siteSettingsQuery,
  type Chapter,
  type Recording,
  type SiteSettings,
} from '@/lib/sanity'

/** Page text, links and hero photos, edited in Sanity Studio ("Site text & links"). */
export function useSiteSettings() {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: async () => {
      const data = await sanity.fetch<SiteSettings | null>(siteSettingsQuery)
      // Trim stray whitespace typed into the Studio
      return Object.fromEntries(
        Object.entries(data ?? {}).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
      ) as SiteSettings
    },
    staleTime: 5 * 60 * 1000,
  })
}

/** Journey chapters, ordered by chapter number. */
export function useChapters() {
  return useQuery({
    queryKey: ['chapters'],
    queryFn: () => sanity.fetch<Chapter[]>(chaptersQuery),
    staleTime: 5 * 60 * 1000,
  })
}

/** Practice tapes, ordered by tape number. */
export function useRecordings() {
  const preview = import.meta.env.DEV
    ? new URLSearchParams(window.location.search).get('tapeOrder')
    : null
  return useQuery({
    queryKey: ['recordings', preview],
    queryFn: async () => {
      const { recordings, order } = await sanity.fetch<{
        recordings: Omit<Recording, 'tapeNumber'>[]
        order: string[]
      }>(recordingsQuery)
      const ids = preview ? preview.split(',') : order
      return applyRecordingOrder(recordings, ids).map((recording, index) => ({
        ...recording,
        tapeNumber: index + 1,
      }))
    },
    staleTime: import.meta.env.DEV ? 0 : 5 * 60 * 1000,
  })
}

/** Length of an audio file, read from its metadata only (no full download). Cached forever. */
export function useAudioDuration(url?: string) {
  return useQuery({
    queryKey: ['duration', url],
    enabled: Boolean(url),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    queryFn: () =>
      new Promise<number>((resolve, reject) => {
        const audio = new Audio()
        audio.preload = 'metadata'
        audio.onloadedmetadata = () => resolve(audio.duration)
        audio.onerror = () => reject(new Error('Could not read audio length'))
        audio.src = url!
      }),
  })
}
