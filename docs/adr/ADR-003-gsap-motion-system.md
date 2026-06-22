# ADR-003: GSAP as Unified Motion System

**Date:** 2026-06-13
**Status:** Proposed

## Context

The redesign requires motion across four dimensions:

1. **Landing page:** scroll-triggered section reveals and staggered content
   entrance.
2. **Page transitions:** continuous feel between `/` → `/intake` → `/review` →
   `/export`.
3. **Intake / Review:** step transitions and section-switching layout animations.
4. **Export:** success micro-animation.

The existing codebase uses `framer-motion` for simple enter/exit animations. The
PRD mandates GSAP for scroll and page motion. Running two animation libraries
simultaneously increases bundle size, complicates reduced-motion handling, and
splits the team's animation mental model.

## Decision

Adopt `gsap` as the single animation library for the entire frontend,
replacing `framer-motion`. Use three GSAP plugins:

- **ScrollTrigger** — for landing page scroll reveals and batch-triggered
  entrances.
- **Flip** — for review section content swaps and intake step layout changes.
- **Core timelines** — for page transitions and export success micro-animations.

All GSAP code is wrapped by a `useReducedMotion()` hook. When
`prefers-reduced-motion: reduce` is active, timelines are skipped and elements
are set to their final visible state instantly (or with a minimal fade).

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. Keep Framer Motion + add GSAP only where needed** | Lower migration risk; FM is already installed and working. | Two animation libraries (~75kB gzipped combined); inconsistent API patterns; harder to enforce uniform reduced-motion policy. |
| **B. Use CSS animations + IntersectionObserver** | Zero JS animation library; native performance. | Cannot orchestrate complex, timeline-based sequences (page transitions, staggered reveals with dynamic delays); Flip-like layout animations are extremely difficult. |
| **C. Use GSAP alongside Framer Motion** | Gradual migration; no big-bang rewrite. | Same bundle and consistency problems as Option A; "clean slate" mandate favors a single system. |
| **D. Replace Framer Motion with GSAP** (chosen) | One animation API for all use cases; ScrollTrigger and Flip are purpose-built for the required effects; smaller total bundle than A or C. | Requires rewriting all existing Framer Motion usage in `/intake`, `/review`, `/export`, and `/`. |

## Consequences

- **Positive:** Unified animation mental model. All motion — scroll, page,
  layout, micro — is expressed through GSAP timelines.
- **Positive:** ScrollTrigger and Flip are industry-standard plugins that
  exactly match the PRD's motion requirements.
- **Positive:** Removing `framer-motion` frees ~40kB gzipped, partially offsetting
  the addition of `gsap` (~35kB gzipped) and keeping the main bundle lean.
- **Negative:** Every page component that currently uses `motion.div`,
  `AnimatePresence`, or `useAnimation` must be refactored to GSAP hooks.
- **Negative:** GSAP's imperative timeline API is less declarative than Framer
  Motion's React-centric API; developers must be careful to clean up timelines
  on unmount to avoid memory leaks.

## Requirement traceability

- **PRD Section 4.2:** "GSAP: used for scroll-triggered section reveals, page
  transitions, staggered content entrance, and micro-interactions on CTAs."
- **PRD Section 5.2:** GSAP usage rules (`gsap.from`, `ScrollTrigger`, `Flip`,
  `will-change` sparingly, batch animations, respect `prefers-reduced-motion`).
- **BRD LP-11:** "GSAP scroll-triggered animations reveal sections. Disabled when
  `prefers-reduced-motion` is true."
- **BRD IN-06:** "Page transition from landing to intake is animated."
- **BRD RV-08:** "Section switching is animated."
- **BRD EX-04:** "Success animation plays on download."
- **BRD NF-04:** "Animation respects reduced motion. All GSAP/Three.js motion is
  suppressed when `prefers-reduced-motion: reduce`."
- **BRD NF-08:** "Bundle size is controlled. Three.js and GSAP are code-split per
  route where possible."
- **BRD A11Y-02:** "Motion can be disabled. `prefers-reduced-motion` is honored
  globally."
