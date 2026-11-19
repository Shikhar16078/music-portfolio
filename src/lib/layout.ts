/**
 * The Paper desktop sections use a 900 px minimum with a 104 px top inset.
 * Tablet sections leave 32 px below the 88 px fixed nav. Touch layouts track browser chrome.
 */
export const screenSection =
  'site-section py-16 md:min-h-svh md:pt-[120px] md:pb-20 lg:min-h-[900px] lg:pt-[104px] lg:pb-[max(120px,calc(var(--player-space)+2rem))]'

export const desktopMediaQuery = '(min-width: 72rem)'
