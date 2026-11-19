import { ArrowDownUpIcon, ChevronDownIcon, ListFilterIcon, SearchIcon } from 'lucide-react'
import type { useRecordingBrowser } from '@/lib/use-recording-browser'
import { cn } from '@/lib/utils'

const sortOptions = [
  { value: 'default', label: 'Default order' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'key', label: 'Key A–Z' },
]

export function RecordingToolbar({
  browser,
  onChange,
  className,
}: {
  browser: ReturnType<typeof useRecordingBrowser>
  onChange: () => void
  className?: string
}) {
  const control =
    'flex h-12 min-w-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 text-fg-muted focus-within:border-accent lg:h-10'
  return (
    <div
      className={cn('grid grid-cols-2 gap-2 md:grid-cols-[minmax(0,1fr)_144px_126px]', className)}
    >
      <label className={cn(control, 'col-span-2 md:col-span-1')}>
        <SearchIcon aria-hidden="true" className="size-4 shrink-0" />
        <span className="sr-only">Search recordings</span>
        <input
          type="search"
          value={browser.search}
          onChange={(event) => {
            browser.setSearch(event.target.value)
            onChange()
          }}
          placeholder="Search recordings"
          className="h-full min-w-0 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg-muted lg:text-sm"
        />
      </label>
      <label className={cn(control, 'relative focus-within:outline-1 focus-within:outline-accent')}>
        <ListFilterIcon aria-hidden="true" className="pointer-events-none absolute left-3 size-4" />
        <span className="sr-only">Recording category</span>
        <select
          value={browser.category}
          onChange={(event) => {
            browser.setCategory(event.target.value)
            onChange()
          }}
          className="absolute inset-0 size-full appearance-none rounded-xl bg-transparent pr-8 pl-9 text-base outline-none lg:text-sm [&>option]:bg-surface [&>option]:text-fg"
        >
          <option value="">Category</option>
          {browser.categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-3 size-4"
        />
      </label>
      <label className={cn(control, 'relative focus-within:outline-1 focus-within:outline-accent')}>
        <ArrowDownUpIcon
          aria-hidden="true"
          className="pointer-events-none absolute left-3 size-4"
        />
        <span className="sr-only">Sort recordings</span>
        <select
          value={browser.sort}
          onChange={(event) => {
            browser.setSort(event.target.value)
            onChange()
          }}
          className="absolute inset-0 size-full appearance-none rounded-xl bg-transparent pr-8 pl-9 text-base outline-none lg:text-sm [&>option]:bg-surface [&>option]:text-fg"
        >
          {sortOptions.map(({ value, label }) => (
            <option key={value} value={value}>
              {value === 'default' ? 'Sort' : label}
            </option>
          ))}
        </select>
        <ChevronDownIcon
          aria-hidden="true"
          className="pointer-events-none absolute right-3 size-4"
        />
      </label>
    </div>
  )
}
