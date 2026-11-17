import { useQuery } from '@tanstack/react-query'
import { sanity, siteSettingsQuery, type SiteSettings } from '@/lib/sanity'

/** Page text and links, edited in Sanity Studio ("Site text & links"). */
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
