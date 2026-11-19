import { createContext, useContext, useId } from 'react'

export const InlineVideoContext = createContext<{
  active: string | null
  open: (id: string) => void
  close: () => void
} | null>(null)

export function useInlineVideo() {
  const id = useId()
  const context = useContext(InlineVideoContext)
  if (!context) throw new Error('useInlineVideo must be used inside <InlineVideoProvider>')
  return { playing: context.active === id, open: () => context.open(id), close: context.close }
}
