/**
 * GET /api/videos — featured videos (from the playlist set in Sanity) and the channel's latest upload.
 *
 * Runs on Vercel so the YouTube API key (env YOUTUBE_API_KEY) never reaches the browser.
 * Responses are cached at Vercel's edge for an hour, so YouTube is asked at most ~24× a day
 * per region, far inside the free daily quota.
 */

export type Video = {
  id: string
  title: string
  /** Seconds. */
  duration: number
  views: number
  publishedAt: string
  /** False when the owner disabled embedding: the site links out instead. */
  embeddable: boolean
  thumbnails: { url: string; width: number }[]
}

export type VideosResponse = { featured: Video[]; latest: Video | null }

const SANITY_QUERY =
  'https://t1hamr9e.apicdn.sanity.io/v2025-01-01/data/query/production?query=' +
  encodeURIComponent('*[_id == "siteSettings"][0]{youtubePlaylistId, youtubeChannelUrl}')
const YT = 'https://www.googleapis.com/youtube/v3'
const FEATURED_MAX = 10

type YtThumb = { url: string; width: number }
type YtVideo = {
  id: string
  snippet: { title: string; publishedAt: string; thumbnails: Record<string, YtThumb> }
  contentDetails: { duration: string }
  statistics: { viewCount?: string }
  status: { embeddable: boolean; privacyStatus: string }
}

async function yt<T>(path: string, params: Record<string, string>, key: string): Promise<T> {
  const url = new URL(`${YT}/${path}`)
  Object.entries({ ...params, key }).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url)
  if (!res.ok) {
    const detail = ((await res.json().catch(() => null)) as { error?: { message?: string } } | null)
      ?.error?.message
    throw new Error(`YouTube ${path} ${res.status}${detail ? `: ${detail}` : ''}`)
  }
  return res.json() as Promise<T>
}

/** "PT1H2M3S" → 3723 */
export function parseDuration(iso: string) {
  const m = /^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso)
  if (!m) return 0
  const [, d, h, min, s] = m.map((x) => Number(x ?? 0))
  return d * 86400 + h * 3600 + min * 60 + s
}

/**
 * Accepts whatever gets pasted into the Studio: a playlist id, a full playlist URL, or an id
 * with share junk attached ("PLxyz&si=…").
 */
export function playlistIdFrom(value?: string) {
  if (!value) return undefined
  const fromUrl = /[?&]list=([\w-]+)/.exec(value)?.[1]
  return fromUrl ?? /^[\w-]+/.exec(value.trim())?.[0]
}

/** youtube.com/@handle or youtube.com/channel/UC… → the lookup params for channels.list. */
export function channelLookup(url?: string): Record<string, string> | undefined {
  if (!url) return undefined
  const handle = /youtube\.com\/(@[\w.-]+)/.exec(url)?.[1]
  if (handle) return { forHandle: handle }
  const id = /youtube\.com\/channel\/(UC[\w-]+)/.exec(url)?.[1]
  return id ? { id } : undefined
}

function toVideo(v: YtVideo): Video {
  return {
    id: v.id,
    title: v.snippet.title,
    duration: parseDuration(v.contentDetails.duration),
    views: Number(v.statistics.viewCount ?? 0),
    publishedAt: v.snippet.publishedAt,
    embeddable: v.status.embeddable,
    thumbnails: Object.values(v.snippet.thumbnails)
      .map(({ url, width }) => ({ url, width }))
      .sort((a, b) => a.width - b.width),
  }
}

async function videosById(ids: string[], key: string) {
  if (!ids.length) return []
  const data = await yt<{ items: YtVideo[] }>(
    'videos',
    { part: 'snippet,contentDetails,statistics,status', id: ids.join(','), maxResults: '50' },
    key,
  )
  const byId = new Map(data.items.map((v) => [v.id, v]))
  // Keep playlist order; drop private/deleted videos
  return ids
    .map((id) => byId.get(id))
    .filter((v): v is YtVideo => Boolean(v) && v!.status.privacyStatus === 'public')
    .map(toVideo)
}

async function playlistVideoIds(playlistId: string, max: number, key: string) {
  const data = await yt<{ items: { contentDetails: { videoId: string } }[] }>(
    'playlistItems',
    { part: 'contentDetails', playlistId, maxResults: String(max) },
    key,
  )
  return data.items.map((i) => i.contentDetails.videoId)
}

export async function GET(): Promise<Response> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) return Response.json({ error: 'YOUTUBE_API_KEY is not set' }, { status: 503 })

  try {
    const settings = (await (await fetch(SANITY_QUERY)).json()) as {
      result?: { youtubePlaylistId?: string; youtubeChannelUrl?: string }
    }
    const playlistId = playlistIdFrom(settings.result?.youtubePlaylistId)
    const lookup = channelLookup(settings.result?.youtubeChannelUrl)

    const [featured, latest] = await Promise.all([
      playlistId
        ? playlistVideoIds(playlistId, FEATURED_MAX, key).then((ids) => videosById(ids, key))
        : Promise.resolve([]),
      lookup
        ? yt<{ items?: { contentDetails: { relatedPlaylists: { uploads: string } } }[] }>(
            'channels',
            { part: 'contentDetails', ...lookup },
            key,
          ).then(async (ch) => {
            const uploads = ch.items?.[0]?.contentDetails.relatedPlaylists.uploads
            if (!uploads) return null
            const ids = await playlistVideoIds(uploads, 1, key)
            return (await videosById(ids, key))[0] ?? null
          })
        : Promise.resolve(null),
    ])

    const body: VideosResponse = { featured, latest }
    return Response.json(body, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
  } catch (error) {
    console.error(error)
    return Response.json({ error: 'Could not load videos from YouTube' }, { status: 502 })
  }
}
