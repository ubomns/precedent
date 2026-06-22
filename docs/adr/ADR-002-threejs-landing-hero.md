# ADR-002: Three.js Ambient Landing Hero

**Date:** 2026-06-13
**Status:** Proposed

## Context

The landing page redesign requires an immersive, non-interactive background in
the hero section to differentiate Precedent from generic AI tools and reinforce
the "expensive quiet" brand feel. The scene must be ambient (no camera controls,
no gameplay), performance-gated, and degrade gracefully on low-power devices or
when the user prefers reduced motion.

## Decision

Use the `three` npm package (raw WebGL, not `@react-three/fiber`) to render a
low-complexity ambient scene inside a dynamically imported, client-only
component on the landing page.

**Key constraints:**

- Scene complexity is capped at <500 vertices and a single custom shader.
- No post-processing passes.
- `devicePixelRatio` is capped at 2.
- The animation loop pauses when the canvas is off-screen via
  `IntersectionObserver`.
- A static CSS gradient fallback is shown when:
  - `prefers-reduced-motion: reduce` is active,
  - WebGL context creation fails, or
  - a low-power device heuristic fires (`hardwareConcurrency <= 4` or
    `deviceMemory <= 4`).

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. CSS-only animated gradient** | Zero bundle cost; no WebGL fallback needed. | Cannot achieve the depth, subtle distortion, or particle-field quality that distinguishes a premium product. |
| **B. Canvas 2D particle field** | Lighter than WebGL; no Three.js dependency. | Harder to achieve refractive/glass-like effects; performance drops sharply with >200 particles on mobile. |
| **C. Three.js via `@react-three/fiber`** | React-friendly lifecycle; declarative scene graph. | Adds ~30kB gzipped overhead for a scene simple enough to manage imperatively; R3F's abstraction is unnecessary for a single non-interactive background. |
| **D. Raw Three.js** (chosen) | Direct control over renderer, loop, and disposal; minimal overhead; easy to gate and pause. | Manual cleanup required; slightly more boilerplate than R3F. |

## Consequences

- **Positive:** Landing page hero achieves the desired immersive quality without
  the abstraction tax of R3F.
- **Positive:** Bundle impact is isolated to the `/` route via `next/dynamic`.
- **Negative:** `three` is a large dependency (~150kB gzipped). It must be
  strictly code-split and the removal of `framer-motion` helps offset the
  increase.
- **Negative:** Manual memory management (geometry/material disposal) is
  required to prevent leaks on route changes.

## Requirement traceability

- **PRD Section 4.2:** "Three.js: used for ambient, non-interactive hero
  background on the landing page."
- **PRD Section 5.1:** Performance rules (60fps mid-tier mobile, cap draw calls,
  simple shader, pause off-screen, disable on reduced motion).
- **BRD LP-10:** "Three.js ambient hero background renders on capable devices.
  WebGL scene loads; static fallback displays on failure or reduced motion."
- **BRD NF-03:** "Three.js scene is performance-gated. Scene pauses off-screen;
  disabled on low-power devices or WebGL failure."
- **BRD A11Y-05:** "Three.js scene is decorative. No critical information is
  conveyed only through the WebGL scene."
