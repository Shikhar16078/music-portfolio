/** Page sections in order. The nav and the footer both read from this. */
export const SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'journey', label: 'Journey' },
  { id: 'videos', label: 'Videos' },
  { id: 'listen', label: 'Listen' },
  { id: 'connect', label: 'Connect' },
] as const

export type SectionId = (typeof SECTIONS)[number]['id']

/** YouTube's "subscribe" confirmation link for a channel URL. */
export function subscribeUrl(channelUrl?: string) {
  if (!channelUrl) return undefined
  const url = new URL(channelUrl)
  url.searchParams.set('sub_confirmation', '1')
  return url.toString()
}
