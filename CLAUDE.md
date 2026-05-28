# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Editing & Building

**Edit `source.jsx`** — this is the human-readable JSX source. `index.html` is the compiled artifact served by GitHub Pages; never edit it directly.

To rebuild after changes:

```bash
npm install        # first time only
npm run build      # runs node build.js → writes index.html
```

To preview locally:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

There is no test suite and no linter configured.

## Architecture

`source.jsx` contains the full React application as JSX. `build.js` compiles it with `@babel/core` + `@babel/preset-react` and injects the output into an HTML shell, writing `index.html`. The deployed file loads:

- **React 18** and **ReactDOM 18** via unpkg CDN (UMD builds)
- **Tailwind CSS** via CDN play script
- **Cormorant Garamond** via Google Fonts

No Babel runtime is shipped to the browser — JSX is pre-compiled at build time.

## Component Structure

All components are defined inside `AmericanMahjongGuide` in `source.jsx`. The root component owns `progress` (scroll %) and `activeSection` state.

Presentational components used throughout:

- `Tile` — emoji tile face (accepts `color`: `ink`/`red`/`green`/`blue`)
- `HeroTile` — CSS-only tile for the hero row, props `top`/`bottom`/`color`; no emoji dependency
- `SectionTag` — small monospace uppercase label (e.g. "01 — Overview")
- `SectionHeader` — combines `SectionTag` + `<h2>`
- `SubHead` — amber `<h3>` subheading
- `P` — styled body paragraph
- `Callout` — left-bordered callout; `variant="warning"` renders orange with ⚠ icon, default renders amber with ✦ icon
- `InfoCard` — titled bullet list card
- `Step` — numbered step with circle badge
- `HandCard` — card showing a hand name, point value, and description

## Content Sections

Eight named anchor sections in order: `overview`, `tiles`, `setup`, `gameplay`, `card`, `winning`, `etiquette`, `strategy`. The sticky nav (visible at all viewport sizes) highlights the active section based on scroll position via the `useEffect` scroll listener.

## Design Conventions

- **Color theme**: dark forest green background (`#1b4332`) with amber/gold accents (`#c9a84c`, Tailwind `amber-500`/`amber-300`) and light stone text (`stone-100`/`stone-200/80`)
- **Typography**: Cormorant Garamond (loaded via Google Fonts) with Georgia fallback for headings and body; monospace for labels, codes, and nav buttons
- All styling is Tailwind utility classes on JSX elements — no separate CSS file
- Tile visuals: `Tile` uses emoji; `HeroTile` uses plain text (`top`/`bottom` props) for cross-platform consistency. Both use `bg-amber-50` with `border-amber-200` and fixed `w-9 h-12` sizing
- Responsive breakpoints use `sm:` and `md:` Tailwind prefixes
