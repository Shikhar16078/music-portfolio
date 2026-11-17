# music.shikharkumar.in

Piano covers, practice tapes and the journey in between — the personal music site of Shikhar Kumar.

Film scores, Bollywood and pop, rearranged for solo piano and recorded at home.

## Tech stack

| Area      | Choice                                                                                |
| --------- | ------------------------------------------------------------------------------------- |
| Framework | [React 19](https://react.dev) + TypeScript, built with [Vite](https://vite.dev)       |
| Styling   | [Tailwind CSS v4](https://tailwindcss.com)                                            |
| UI        | [shadcn/ui](https://ui.shadcn.com) (Radix primitives)                                 |
| Animation | [Motion](https://motion.dev)                                                          |
| Fonts     | Instrument Serif, Bricolage Grotesque, Geist, Geist Mono (self-hosted via Fontsource) |
| Tooling   | oxlint, Prettier                                                                      |

## Getting started

Requires Node 22+.

```bash
npm install
npm run dev
```

| Script              | What it does                       |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Start the dev server               |
| `npm run build`     | Typecheck and build to `dist/`     |
| `npm run preview`   | Serve the production build locally |
| `npm run lint`      | Lint with oxlint                   |
| `npm run typecheck` | Run the TypeScript compiler        |
| `npm run format`    | Format with Prettier               |

## Project structure

```
src/
  components/ui/   shadcn/ui primitives
  lib/motion.ts    shared Motion easings, springs and variants
  lib/utils.ts     cn() class helper
  index.css        Tailwind config, design tokens and themes
  App.tsx          app entry
```

## Design system

Designed in Paper ("Music App - Design System"). Highlights:

- **Themes:** `dusk` (dark, default) and `daylight`, switched via `data-theme` on `<html>`; more can be added as token blocks in `src/index.css`.
- **8px spacing grid**, type scale with grid-aligned line heights.
- **Accent:** honey cream, used sparingly.
- **Motion:** quick "attack" entrances, soft "breath" crossfades; reduced motion respected.

## Branching & releases

- Day-to-day work happens on `development`.
- Releases are **squash-merged** from `development` into `main`.
