# Light/Dark Theme Toggle — Design

**Date:** 2026-06-22
**Status:** Approved (design); pending spec review
**Branch:** feature/wbs-007-016-landing-page

## Problem

The app ships strict dark mode. A `ThemeToggle` component and a no-flash
`theme.js` already exist, but:

1. The toggle is mounted only in the legacy `GlassNav` (`components/primitives.tsx`),
   which **no live page renders** — all four pages (`/`, `/intake`, `/review`,
   `/export`) use the design-system `Nav` (`components/design-system/nav.tsx`).
   So the toggle is effectively invisible.
2. **Light mode has no palette.** `.light` has no token overrides, so it falls
   back to the dark `:root` — light mode currently renders identical to dark.
3. The design system mixes adaptive semantic tokens (`bg-ground`, `text-ink`,
   `border-border`) with **non-adaptive raw white-overlay utilities**
   (`bg-white/[0.08]`, `border-white/[0.06]`, `ring-white/10`). On a light
   background these wash out, so a naive palette swap looks broken.
4. The live `Nav` renders inline links with **no responsive hiding** alongside a
   `md:hidden` hamburger, so on mobile both appear at once — redundant and
   overflow-prone.

## Goals

- A visible, accessible light/dark toggle on every page, on desktop and mobile.
- A genuinely crisp warm-paper light theme (not washed out).
- No layout distortion or horizontal overflow on mobile in either theme.

## Non-Goals

- Per-component theme overrides beyond the load-bearing set listed below.
- Reworking the legacy `primitives.tsx`/`GlassNav` (unused by live pages) beyond
  removing the relocated toggle.
- Changing the emerald brand accent (constant across themes).

## Decisions (from brainstorming)

- **Scope:** crisp, full-quality — author a light palette AND convert the
  load-bearing white-overlay utilities to adaptive tokens.
- **Palette:** warm paper (soft warm off-whites, warm near-black ink), matching
  the existing warm cast (`#fdfbf7`) and emerald accent.
- **Mobile toggle:** always visible in the top bar (next to the hamburger on
  mobile), ~40px tap target.

## Design

### 1. Light palette — `app/globals.css`

Add a `.light { … }` block overriding every color token. `:root` and `.dark`
stay as-is (dark remains the default; `<html class="dark">` + `theme.js`).
Warm-paper values (final hexes tuned during implementation):

- `--bg: #faf8f4`; `--surface: #ffffff`-adjacent but never pure white
  (`#fbf9f5` / `--surface-2: #f3efe7` / `--surface-3: #ece7dd`).
- `--fg: #1a1714` (warm near-black); `--text-body: #3a3531`;
  `--text-secondary: #6b645c`; `--text-tertiary: #8c857b`.
- **Translucent tokens flip white→black:** `--border: rgba(0,0,0,0.08)`;
  `--border-strong: rgba(0,0,0,0.12)`; `--hairline` likewise;
  `--shadow-color: rgba(0,0,0,0.10)`; `--vignette: rgba(16,185,129,0.05)`;
  `--scrollbar: rgba(0,0,0,0.18)` / `--scrollbar-hover: rgba(0,0,0,0.28)`.
- Badges retuned for a light background (same hues, adjusted bg/border alpha so
  they remain legible); `--bezel-bg`/`--bezel-ring` flipped to black-translucent.
- `--accent`, `--accent-hover`, `--caret`, selection: unchanged emerald.

### 2. Overlay tokens — `globals.css` + `tailwind.config.js`

Add a translucent-fill token pair that flips by theme:

- `:root`/`.dark`: `--overlay-weak: rgba(255,255,255,0.04)`,
  `--overlay-strong: rgba(255,255,255,0.08)`.
- `.light`: `--overlay-weak: rgba(0,0,0,0.04)`,
  `--overlay-strong: rgba(0,0,0,0.06)`.

Map in `tailwind.config.js` colors: `overlay: "var(--overlay-weak)"`,
`"overlay-strong": "var(--overlay-strong)"` → enables `bg-overlay`,
`bg-overlay-strong`, `hover:bg-overlay`, etc.

### 3. Component conversion (load-bearing set)

Replace raw `white/[x]` utilities with adaptive tokens:

- `border-white/[0.06]` → `border-border`
- `border-white/[0.08]`, `border-white/10`, `ring-white/10` → `border-border-strong` / `ring-border-strong`
- `bg-white/[0.04]` (hover) → `bg-overlay`
- `bg-white/[0.08]`, `bg-white/[0.05]` (active/raised) → `bg-overlay-strong`
- `divide-white/[0.06]` → `divide-border`

Files: `design-system/nav.tsx`, `design-system/button.tsx` (icon wells handled
per-variant — primary's well over the emerald fill stays light; secondary/ghost
wells become `bg-overlay`), `design-system/card.tsx`, `design-system/badge.tsx`,
`components/intake/message.tsx`, `components/intake/review-card.tsx`,
`components/intake/inputs/stakeholders-input.tsx`,
`components/intake/intake-wizard.tsx`. `design-system/input.tsx` already uses
tokens (verify only). Rose/amber hover tints (stakeholder remove) are intentional
and kept.

### 4. Toggle relocation + hardening — `nav.tsx`, `theme-toggle.tsx`

- Bake `<ThemeToggle />` directly into `design-system/Nav` (not via the page
  `actions` slot) so all four pages get it without per-page wiring. The `actions`
  slot remains for page-specific actions (the review page uses it).
- The toggle renders in the bar on **both** desktop and mobile, positioned with
  the hamburger on mobile. Tap target ≥ 40px (bump from `w-8 h-8` to `w-10 h-10`
  hit area; icon stays 14–16px). Uses adaptive tokens (already does via
  `--bezel-bg`/`--bezel-ring`/`--muted`, which now flip in light).
- Harden `ThemeToggle`: initialize `isDark` from the `<html>` class set by
  `theme.js` (already does); on toggle, set/remove both `dark`/`light` classes and
  persist (already does). Keep the mounted-guard placeholder to avoid hydration
  mismatch.
- Remove `<ThemeToggle />` from legacy `GlassNav` in `primitives.tsx`.

### 5. Mobile nav fix — `nav.tsx`

Wrap the inline links container in `hidden md:flex`. On mobile the bar becomes
logo + toggle + hamburger; links are reached via the existing hamburger menu.
This removes the redundant inline-links-plus-hamburger overflow.

### 6. No-flash + system preference — `public/theme.js`

Order of precedence: stored `localStorage.theme` wins; else
`window.matchMedia('(prefers-color-scheme: light)')` → light; else dark. Stays
`beforeInteractive` so there is no flash. Default remains dark when no signal.

## Testing

New `frontend/tests/theme.spec.ts` (Playwright):

- Toggle flips `<html>` class `dark` ↔ `light`.
- Choice persists across `page.reload()`.
- Runs at **desktop (default)** and **mobile (375×812)** viewports.
- **No horizontal overflow** in both themes and both viewports:
  `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.
- Toggle button is visible and has a ≥40px tap target on mobile.

Regression gate: full Playwright suite serial (`npm test`, workers=1), `tsc`,
`npm run lint`, `npm run build`. Manual/automated mobile screenshot in both
themes to confirm no distortion.

## Risks / Notes

- The toggle baked into `Nav` must not collide with the `actions` slot used by
  `/review`; place toggle and actions side by side with a divider.
- Run Playwright via `npm test` / local binary, NOT `npx playwright` (npx binds a
  mismatched playwright instance — see project gotchas).
- Reduced-motion: toggle uses a `transition-colors` only; fine under
  `prefers-reduced-motion`.
