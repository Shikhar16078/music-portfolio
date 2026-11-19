import { useState } from 'react'
import { kindLabel, longKey, tapeLabel, trackTitle } from '@/lib/format'
import type { Recording } from '@/lib/sanity'

function compareMetadata(a?: string, b?: string, descending = false) {
  if (!a || !b) return Number(!a) - Number(!b)
  return descending ? b.localeCompare(a) : a.localeCompare(b)
}

export function useRecordingBrowser(recordings: readonly Recording[]) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('default')
  const categories = [
    ...new Set(recordings.flatMap((recording) => (recording.category ? [recording.category] : []))),
  ].sort((a, b) => a.localeCompare(b))
  const activeCategory = categories.includes(category) ? category : ''
  const query = search.trim().toLocaleLowerCase()
  const results = recordings.filter((recording) => {
    if (activeCategory && recording.category !== activeCategory) return false
    return (
      !query ||
      [
        trackTitle(recording),
        tapeLabel(recording),
        kindLabel(recording),
        longKey(recording.key),
        recording.category,
      ].some((value) => value?.toLocaleLowerCase().includes(query))
    )
  })
  if (sort === 'key') results.sort((a, b) => compareMetadata(a.key, b.key))
  if (sort === 'newest' || sort === 'oldest') {
    results.sort((a, b) => compareMetadata(a.recordedOn, b.recordedOn, sort === 'newest'))
  }

  return {
    search,
    setSearch,
    category: activeCategory,
    setCategory,
    categories,
    sort,
    setSort,
    results,
    active: Boolean(query || activeCategory || sort !== 'default'),
  }
}
