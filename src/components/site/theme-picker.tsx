import { CheckIcon, ChevronDownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { THEMES, useTheme, type ThemeId } from '@/lib/theme-config'

function Swatch({ colors, className }: { colors: [string, string]; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('size-4 shrink-0 rounded-full ring-1 ring-fg/15', className)}
      style={{ background: `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)` }}
    />
  )
}

/** Desktop/tablet theme picker. `compact` shows only the swatch (tablet). */
export function ThemePicker({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme()
  const current = THEMES.find((t) => t.id === theme) ?? THEMES[0]

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          aria-label={`Theme: ${current.label}. Change theme`}
          className={cn(
            'h-10 rounded-full border-border-strong bg-transparent',
            compact ? 'w-10 px-0' : 'w-36 justify-between gap-3 px-4',
          )}
        >
          <Swatch colors={current.swatch} />
          {!compact && (
            <>
              <span className="text-sm">{current.label}</span>
              <ChevronDownIcon className="text-fg-subtle" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-[60] w-56 rounded-2xl p-2">
        <DropdownMenuLabel className="font-mono text-xs tracking-wide text-fg-subtle uppercase">
          Theme
        </DropdownMenuLabel>
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            disabled={!t.available}
            onSelect={() => setTheme(t.id as ThemeId)}
            className="h-10 gap-3 rounded-lg px-3"
          >
            <Swatch colors={t.swatch} />
            <span className="flex-1">{t.label}</span>
            {!t.available && (
              <span className="font-mono text-xs tracking-wide text-fg-subtle uppercase">Soon</span>
            )}
            {t.id === theme && <CheckIcon className="text-accent" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Phone menu: theme as a row of chips. */
export function ThemeChips() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Theme">
      {THEMES.map((t) => (
        <Button
          key={t.id}
          variant="outline"
          role="radio"
          aria-checked={t.id === theme}
          disabled={!t.available}
          onClick={() => setTheme(t.id)}
          className={cn(
            'h-12 gap-2 rounded-full border-border-strong bg-transparent px-4 text-sm',
            t.id === theme && 'border-accent bg-accent-soft text-fg',
          )}
        >
          <Swatch colors={t.swatch} />
          {t.label}
          {!t.available && <span className="text-fg-subtle">· soon</span>}
        </Button>
      ))}
    </div>
  )
}
