# CLAUDE.md

Personal piano-first music site for **music.shikharkumar.in**: YouTube piano covers, audio-only practice recordings, and a short "journey" story. Content is mostly piano; guitar is only mentioned in the Journey section.

## Stack

- Vite 8 + React 19 + TypeScript 7 (SPA, static build)
- Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first config in `src/index.css`, no `tailwind.config`)
- shadcn/ui (`radix-nova` preset, Radix primitives) — components land in `src/components/ui`
- Motion (`motion/react`) for animation; shared presets in `src/lib/motion.ts`
- Self-hosted fonts via Fontsource; lint with oxlint; format with Prettier (+ Tailwind class sorting)

## Commands

```bash
npm run dev           # local dev server
npm run build         # typecheck + production build to dist/
npm run lint          # oxlint
npm run typecheck     # tsc -b
npm run format        # prettier --write
npx shadcn@latest add <component>
```

Run `npm run build && npm run lint && npm run format:check` before committing.

## Git workflow

- All work happens on **`development`** (or feature branches off it).
- Releases: **squash-merge `development` → `main`**. Never commit directly to `main`.

## Design system (source of truth: Paper file "Music App - Design System")

- **Themes** via `data-theme` on `<html>`: `dusk` (dark, default) and `daylight`. A theme picker (not a toggle) chooses them. Planned themes Moonlight (dark, cool) and Sepia (light, aged paper) have full palettes on the Paper **Themes** page and show as “soon” in the picker. To add a theme, add one `[data-theme="…"]` block in `src/index.css` that overrides all 11 semantic variables, and follow the checklist on the Themes page. Never hardcode hex colors in components; use semantic utilities (`bg-bg`, `bg-surface`, `text-fg-muted`, `border-border-strong`, `text-accent`, …) or `color-mix()` on the variables for translucency.
- **Spacing**: 8px grid. Tailwind's default 4px unit is intentionally kept (so shadcn primitives render at their designed sizes), so use **even steps only**: `p-2` = 8, `gap-4` = 16, `h-18` = 72 (nav), `h-22` = 88 (player). Odd steps only for icon↔label gaps.
- **Type**: `font-display` (Instrument Serif) only for 112px+ display lines and italic accent phrases; `font-heading` (Bricolage Grotesque, weight 500, `tracking-h1`/`tracking-h3`) for H1–H3; `font-sans` (Geist) for body/UI; `font-mono` (Geist Mono, `tracking-wide`, uppercase) for small labels. All line-heights are on the 8px grid (defined in the `--text-*` tokens).
- **Accent**: honey cream (`--accent`). Use it for one thing per screen.
- **Motion**: attack/breath easings and the `key` spring from `src/lib/motion.ts`; entrance = `rise` + `stagger`. Respect `prefers-reduced-motion` (use Motion's `useReducedMotion` / `MotionConfig reducedMotion="user"`).
- **Don'ts** (rejected in review): wavy "string" separators/underlines/progress bars, the owner's name in the nav, promising an upload schedule ("every week"), giant footer wordmarks, generic serif headings.

## Content model (planned)

- **Videos**: YouTube IDs. Cards are facades (thumbnail from `i.ytimg.com`); clicking opens a "Video theater" modal that mounts the `youtube-nocookie.com` iframe and pauses the audio player.
- **Recordings**: audio files (from Google Drive) with generated cover art drawn from each file's waveform peaks, key and tape number. Paginated list + docked player.
- **Journey**: chapter list + fixed-height, scrollable reader panel (accordion on mobile). Comes right after the hero.
- **Page order**: Hero → Journey → Videos → Listen → Connect/footer (nav follows this order).
- **No user tracking**: no likes/hearts or anything that needs accounts or analytics of individual users.
- **Expanded player waveform** reacts live to playback (Web Audio `AnalyserNode`).
- **Hero**: C1 defines the compact layout. D6A and D6B define the Dusk and Daylight treatments. Use the bundled piano photographs, full bleed with one 6px blur on the photo layer, and place sharp copy and controls directly over the image.
- **Videos**: only a curated featured set (8–10). Home shows the top 3 (top 2 on tablet, carousel on mobile); "Show more videos" expands the grid in place, and "Show less" collapses it and scrolls back to the section heading. No separate /videos page. Hero secondary CTA "Watch the videos" scrolls to the section.
- **On-media colors**: anything drawn on artwork (covers, thumbnails, the expanded-player art) uses `media-fg` / `media-bg` / `media-accent` / `media-accent-fg`. Artwork stays dark in every theme.
- **Recordings list**: 6 per page on every screen size; the URL keeps `?tapes=N`.
- **Journey reader ends**: Prev is `aria-disabled` on chapter 1. On chapter 4, "Next chapter" becomes "Hear where it led", which scrolls to Videos. No wrap-around.
- **Footer**: same on every screen size: Explore (Journey, Videos, Listen, Connect) and Elsewhere (YouTube, Instagram, Email).
- **Breakpoints** (Paper rows: Desktop D1–D6, Tablet T1–T2, Phone P1–P3, each in Dusk + Daylight):
  - phone < 768: single column, accordion Journey, video carousel.
  - tablet 768–1151: 48px gutters, chapter tabs, a 2×2 video grid, featured strip above the track list.
  - desktop 1152–1599: content 1248 (96px gutters).
  - wide 1600–2559: content max 1280, centered.
  - ultra-wide ≥ 2560: content max 1600, centered. The docked player caps at the content width.
  - Section backgrounds and the hero photo are always full-bleed.
- **Desktop scale (≥1152, compact; Paper C1–C6 are 1440×900 screens with nav + player)**: hero display 88/88 (600px wide), section H2 56/64 across Journey, Videos, Listen and Connect, reader title 36/40, card titles 24/32, small card titles + footer name 20/28, lead/intro text 16/28, buttons 40px with 14px labels, nav 56px tall 16px from the top (40px pills), docked player 72px tall 16px from the bottom, track rows 64 with 48px art, featured tape card 352, latest-upload card 88, Instagram tiles 176. Ultra-wide keeps the 144px hero line. Phone and tablet keep their larger touch sizes.
- **Desktop section layout**: Journey, Videos, Listen and Connect are at least 900px tall, with a 104px top inset and at least 120px bottom clearance. Journey and Videos use tighter spacing below 820px viewport height so controls clear the dock. Keep the centered width at 1248px for Compact, 1280px for Wide, and 1600px for Ultra-wide.
- **Nav active item**: liquid-glass pill (`--glass` / `--glass-edge` theme tokens, blur + lit top edge) that glides between items with a shared `layoutId`. No dots or underlines.
- **Player space**: the docked player sets --player-space to 80px plus the bottom safe-area inset on phone, 96px on tablet and 88px on desktop. Hero and footer reserve space for the dock. Listen shows up to five track rows per page.
- **Responsive sections**: tablet sections fill at least one visible viewport and grow with content, with 120px above the content (88px nav plus 32px clearance) and 80px below. Phone sections follow content with 64px gutters. The hero is at least one viewport tall. On tablet-sized touch viewports, the hero and main sections track the visible browser height even when the desktop columns are active.
- **Video meta**: views and age come from YouTube. The cards show YouTube thumbnails when available and use theme-specific fallback colors, play buttons and duration chips.
- **Videos data**: `api/videos.ts` (Vercel function, env `YOUTUBE_API_KEY`) reads the featured playlist and channel from Sanity Site settings, returns `{ featured, latest }`, cached at the edge for 1h. Locally, a Vite plugin serves `api/*` and reads `.env.local`. Videos with embedding disabled show "This video can't play here · Open on YouTube" in the theater.
- **Footer** (every breakpoint): full-bleed `surface` band; "SK" monogram tile (serif italic on `accent-soft`) before the wordmark "Shikhar Kumar" (no dot after the name), a short description, Explore + Elsewhere columns, and a bottom row with "© 2026 Shikhar Kumar · Recorded at home" and a "Back to top" button. No extra social buttons.
- **Docked player width**: exactly the nav's width (same gutters and content limit), 16px from the bottom, plus the phone safe-area inset (phone: mini player, 24px gutters like the top bar). Controls end with **Hide** (shrinks to a round bottom-right button with playing bars + progress ring; music keeps playing) and **Close** (stops the music, removes the player). Tablet bar: no shuffle/repeat, mute button only; desktop adds shuffle/repeat and the volume slider.
- **Ultra-wide (≥ 2560, `2xl`)**: content `max-w-(--container-ultra)` (1600). The hero display line steps up to 144px (144/144).
- **Touch targets**: 48px on phone and tablet (pagination, player and row play buttons).
- **Layering**: nav 40 · player 50 · mobile sheet 55 · popovers (queue, theme) 60 · video theater 70.
- **Accessible names**: icon-only buttons need an `aria-label`. See the Paper board "09 · Handoff states" for the full list.
- **Instagram card**: ship the static brand-tile fallback first (no API). Optional later: Instagram Graph API at build time (Creator/Business account + token), falling back to the static tiles on any failure.
