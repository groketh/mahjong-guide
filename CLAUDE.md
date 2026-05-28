# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

No build step or package installation required. Open `index.html` directly in a browser, or serve it with any static file server:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

There is no test suite and no linter configured.

## Architecture

The entire application is a single file: `index.html`. It uses:

- **React 18** and **ReactDOM 18** via unpkg CDN (UMD builds)
- **Babel Standalone** via CDN — JSX is transpiled in-browser at runtime inside `<script type="text/babel" data-presets="react">`
- **Tailwind CSS** via CDN play script

There is no bundler, no `package.json`, and no node_modules. All dependencies are CDN-loaded. Changes to the script block take effect on browser reload.

## Component Structure

All components are defined inline inside the single `<script type="text/babel">` block. The component hierarchy is:

- `AmericanMahjongGuide` — root component; owns `progress` (scroll %) and `activeSection` state; renders the full page
  - Small presentational components used throughout:
    - `Tile` — renders a styled tile face (accepts `color`: `ink`/`red`/`green`/`blue`)
    - `SectionTag` — small monospace uppercase label (e.g. "01 — Overview")
    - `SectionHeader` — combines `SectionTag` + `<h2>`
    - `SubHead` — amber `<h3>` subheading
    - `P` — styled body paragraph
    - `Callout` — left-bordered callout box; `variant="warning"` renders orange, default renders gold/amber
    - `InfoCard` — titled bullet list card
    - `Step` — numbered step with circle badge
    - `HandCard` — card showing a hand name, point value, and description

## Content Sections

Eight named anchor sections in order: `overview`, `tiles`, `setup`, `gameplay`, `card`, `winning`, `etiquette`, `strategy`. The sticky nav highlights the active section based on scroll position (tracked in the `useEffect`).

## Design Conventions

- **Color theme**: dark forest green background (`#1b4332`) with amber/gold accents (`#c9a84c`, Tailwind `amber-500`/`amber-300`) and light stone text (`stone-100`/`stone-200/80`)
- **Typography**: Georgia/serif for headings and body; monospace for labels, codes, and nav buttons
- All styling is done with Tailwind utility classes directly on JSX elements — no separate CSS file
- Tile visuals use emoji characters styled with the `Tile` component or inline `div`s with fixed `w-8 h-11` / `w-9 h-12` sizing and `bg-amber-50` backgrounds
- Responsive breakpoints use `sm:` and `md:` Tailwind prefixes; the nav is scrollable on mobile and sticky on `md+`
