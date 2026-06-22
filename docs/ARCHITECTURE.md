# Architecture — Precedent Full Redesign & Revamp

> Solution architecture for the G1 frontend redesign: landing, intake, review, and export routes.
> Backend API contracts remain unchanged.

---

## 1. Executive Summary

This redesign transforms Precedent from a minimal launcher-and-form tool into a
conversion-focused, motion-rich buyer experience. The architecture introduces
three new technical capabilities:

1. **Three.js** — an ambient, non-interactive WebGL hero background on the
   landing page, gated by performance and `prefers-reduced-motion`.
2. **GSAP** — a unified animation system replacing Framer Motion, covering
   scroll-triggered reveals, page transitions, staggered entrances, and layout
   flips.
3. **Clean-slate design system** — new CSS token strategy, component primitives,
   and mobile-first layouts that replace DoubleBezel, PillCTA, and existing color
   tokens.

The backend (`/api/generate`, `/api/critique`, `/api/regenerate-section`,
`/api/apply-critique`, `/api/export`) is untouched. State management stays in
Zustand with the existing schema. The work is scoped to `frontend/` only.

---

## 2. Tech Stack Additions

| Package | Purpose | Status | Requirement Served |
|---|---|---|---|
| `three` | WebGL scene for landing hero | To be added — verify on install | LP-10, NF-03 |
| `@types/three` | TypeScript types for `three` | To be added — verify on install | LP-10 |
| `gsap` | Core animation engine + plugins | To be added — verify on install | LP-11, IN-06, RV-08, EX-04 |

**Removed:**

| Package | Reason |
|---|---|
| `framer-motion` | Superseded by GSAP to unify animation system and control bundle size (NF-08) |

**Retained (existing):**

- `next` 15.5.18, `react` 19.2.6, `react-dom` 19.2.6
- `zustand` 4.5.2
- `@phosphor-icons/react` 2.1.5
- `tailwindcss` 3.4.3, `autoprefixer`, `postcss`
- `typescript` 5.4.5

---

## 3. Component Architecture

### 3.1 Directory Structure

```text
frontend/
├── app/
│   ├── page.tsx                    # Landing page (8 sections + Three.js hero)
│   ├── intake/
│   │   └── page.tsx                # Brief form
│   ├── review/
│   │   └── page.tsx                # BRD workspace
│   ├── export/
│   │   └── page.tsx                # Download confirmation
│   ├── layout.tsx                  # Root layout (fonts, dark mode, no-flash script)
│   └── globals.css                 # Design tokens, CSS variables, utilities
├── components/
│   ├── design-system/              # NEW: primitives, tokens, theme
│   │   ├── index.ts                # Barrel export
│   │   ├── button.tsx              # Primary/secondary CTAs (replaces PillCTA)
│   │   ├── card.tsx                # Surface containers (replaces DoubleBezel)
│   │   ├── input.tsx               # TextField, TextArea
│   │   ├── badge.tsx               # SeverityBadge
│   │   ├── nav.tsx                 # Navigation primitives (replaces GlassNav)
│   │   └── typography.tsx          # Eyebrow, headings, body styles
│   ├── landing/                    # NEW: landing page sections
│   │   ├── hero.tsx                # Hero copy + Three.js canvas wrapper
│   │   ├── problem.tsx             # The Problem section
│   │   ├── how-it-works.tsx        # 3-step process
│   │   ├── sections-list.tsx       # The 12 BRD sections
│   │   ├── sample-output.tsx       # Downloadable sample + preview
│   │   ├── who-its-for.tsx         # Audience qualification
│   │   ├── validation.tsx          # Pull quote
│   │   └── cta-footer.tsx          # Final CTAs
│   ├── three/                      # NEW: Three.js scene
│   │   ├── hero-scene.tsx          # React wrapper (dynamic import, ssr: false)
│   │   ├── scene.ts                # Scene logic: renderer, camera, mesh, rAF loop
│   │   └── fallback.tsx            # Static gradient/image fallback
│   ├── motion/                     # NEW: GSAP hooks and utilities
│   │   ├── use-scroll-reveal.ts    # ScrollTrigger entrance animations
│   │   ├── use-page-transition.ts  # Cross-page transition orchestration
│   │   ├── use-reduced-motion.ts   # Global reduced-motion detection
│   │   └── transition-layout.tsx   # Layout wrapper for page transitions
│   └── icons.tsx                   # Existing icon set (retained)
├── lib/
│   ├── store.ts                    # Zustand (unchanged schema)
│   └── utils.ts                    # Helpers (sanitizeFilename, etc.)
```

### 3.2 Component Responsibilities

| Component / Module | Responsibility |
|---|---|
| `design-system/*` | Presentational primitives. No business logic. Single source of truth for radius, color, spacing, and elevation tokens. |
| `landing/*` | Page-level sections. Each section owns its copy, layout, and scroll-triggered entrance. Compose design-system primitives only. |
| `three/hero-scene.tsx` | Mounts a `<canvas>` and delegates to `scene.ts`. Handles visibility gating (IntersectionObserver) and reduced-motion fallback. |
| `three/scene.ts` | Pure Three.js: scene graph, shader material, animation loop, resize handler, disposal. No React dependencies. |
| `three/fallback.tsx` | Static CSS gradient or image. Rendered when WebGL fails, `prefers-reduced-motion` is true, or device is low-power. |
| `motion/*` | GSAP orchestration hooks. Encapsulate timeline creation, cleanup, and reduced-motion branching. No JSX except `transition-layout.tsx`. |

---

## 4. Design-System Architecture

### 4.1 Token Strategy

Tokens live in **CSS custom properties** inside `globals.css` under the `.dark`
selector (dark mode is the only theme). Tailwind config maps these properties
to utility classes.

**Rationale:** CSS variables are runtime-switchable, work outside React's render
cycle, and are inspectable in DevTools. Tailwind utilities keep the authoring
experience consistent with the existing stack.

```css
.dark {
  --bg: #050505;
  --fg: #FDFBF7;
  --surface: #0A0A0A;
  --surface-2: #111111;
  --accent: #10B981;
  --accent-dim: rgba(16, 185, 129, 0.5);
  --text-body: #d4d4d8;
  --text-secondary: #a1a1aa;
  --text-tertiary: #71717a;
  --radius-card: 1.5rem;
  --radius-pill: 9999px;
}
```

Tailwind extension:

```js
colors: {
  ink: 'var(--fg)',
  ground: 'var(--bg)',
  surface: 'var(--surface)',
  'surface-2': 'var(--surface-2)',
  body: 'var(--text-body)',
  secondary: 'var(--text-secondary)',
  tertiary: 'var(--text-tertiary)',
  accent: 'var(--accent)',
}
```

### 4.2 Component Primitives Plan

| Primitive | Replaces | Key Properties |
|---|---|---|
| `Button` | `PillCTA` | Variants: `primary` (emerald), `secondary` (ghost). Sizes: `sm`, `md`, `lg`. Minimum touch target 44×44px. |
| `Card` | `DoubleBezel` | Elevation via subtle border + background lift, not heavy shadow. No nested "tray + plate" metaphor. |
| `Input` | `TextField`, `TextArea` | Unified `field` variant. Base font size 16px to prevent iOS zoom. |
| `Badge` | `SeverityBadge` | Rose / amber / zinc severity map retained. Slightly larger padding for touch. |
| `Nav` | `GlassNav` | Floating pill navbar. Simplified from current implementation. |
| `Eyebrow` | `Eyebrow` | Small-caps tag. Retained with updated spacing tokens. |

---

## 5. Animation Architecture

### 5.1 Three.js Integration

**Loading:**

```tsx
import dynamic from 'next/dynamic';

const HeroScene = dynamic(() => import('@/components/three/hero-scene'), {
  ssr: false,
  loading: () => <HeroFallback />,
});
```

**Lifecycle:**

1. `hero-scene.tsx` mounts a `<canvas>` ref.
2. `scene.ts` initializes `WebGLRenderer`, `PerspectiveCamera`, and a simple
   scene (e.g., soft particle field or refractive plane).
3. Animation loop runs via `requestAnimationFrame`.
4. `IntersectionObserver` pauses the loop when the canvas is off-screen.
5. `ResizeObserver` updates camera aspect and renderer size.

**Cleanup:**

- On unmount: cancel `rAF`, dispose `renderer`, `geometry`, `material`,
  `texture`, and `scene`.
- On `visibilitychange` to hidden: pause loop.

**Fallback Chain:**

1. `prefers-reduced-motion: reduce` → render `<HeroFallback />` immediately.
2. WebGL context creation fails → catch error, render `<HeroFallback />`.
3. Low-power heuristic (`navigator.hardwareConcurrency <= 4` or
   `navigator.deviceMemory <= 4`) → render `<HeroFallback />`.

**Performance Rules:**

- Cap `devicePixelRatio` at `Math.min(window.devicePixelRatio, 2)` (use `1` on low-power devices).
- Single draw call or very low vertex count (< 500).
- Simple custom shader; no post-processing passes.
- Target 60fps on mid-tier mobile (Mali-G57 / Adreno 610 class).

**Bundle Optimization:**

- Import Three.js classes from `three/src/` paths (e.g., `three/src/math/Vector3.js`) so webpack can tree-shake, or use the new `three/webgpu` / `three/tsl` tree-shakeable entry points if available in the installed version.
- Do **not** use `import * as THREE from 'three'` in production code.
- Wrap the entire `<HeroScene />` import in `next/dynamic` with `ssr: false` so Three.js is never in the main `_app` bundle.
- Keep the landing page initial JS (excluding the dynamic Three.js chunk) under 200kB gzipped.

### 5.2 GSAP Integration

**Global Setup:**

```ts
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, Flip);
```

`@gsap/react` is the official React integration and provides `useGSAP`, which automatically handles cleanup on unmount.

**Page Transitions:**

- A `TransitionLayout` wrapper in `app/layout.tsx` (or a higher-order
  component) captures route changes.
- On navigation: outgoing page animates out (fade / slide), incoming page
  animates in.
- Uses Next.js `usePathname` and `useRouter` events to trigger GSAP timelines.
- Reduced motion: skip timeline, render next page instantly.

**Scroll-Triggered Reveals (Landing):**

- Each `landing/*` section registers a `ScrollTrigger` in a `useGSAP` hook.
- Default entrance: `opacity: 0, y: 24` → `opacity: 1, y: 0` over 0.6s.
- Stagger children by 0.08s.
- Batch triggers where possible (one `ScrollTrigger` per section, not per
  element).

**Flip Plugin Usage:**

- **Review section switching:** when `activeKey` changes, GSAP Flip captures
  the layout state of the content area and animates the swap.
- **Intake step transitions:** if intake is broken into visible steps, Flip
  animates layout changes.

**Cleanup Rules (Hard Requirement):**

- Every GSAP timeline, tween, and `ScrollTrigger` must be created inside `useGSAP` from `@gsap/react`.
- `useGSAP` kills tweens/timelines automatically on unmount; manually destroy any `ScrollTrigger` instances created outside `useGSAP`.
- Never create GSAP timelines during render — only inside `useEffect` / `useGSAP` / event handlers.
- Use React refs (`useRef`) for all GSAP targets; never select DOM elements by string selectors.
- On route change, `TransitionLayout` must kill any global page-transition timeline before creating a new one.

**Reduced Motion:**

- A `useReducedMotion()` hook reads `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- All GSAP timelines check this hook before playing.
- If reduced: set `gsap.set(target, { opacity: 1, y: 0 })` and skip animation.
- No auto-playing motion that cannot be paused.

---

## 6. Mobile-First Strategy

### 6.1 Responsive Breakpoints

Tailwind defaults are mobile-first. The design starts at 320px and scales up.

| Breakpoint | Usage |
|---|---|
| Base (320px–639px) | Single column, stacked sections, full-width CTAs, hamburger or simplified nav. |
| `sm` (640px) | Two-column grids where appropriate (e.g., scope in/out). |
| `md` (768px) | Sidebar appears on review page. Larger type scale. |
| `lg` (1024px) | Full landing layout. Three.js hero at full resolution. |
| `xl` (1280px) | Max content width (`max-w-[1200px]`) centered. |

### 6.2 Touch & Accessibility

- All interactive elements: `min-h-[44px] min-w-[44px]`.
- Inputs: `text-base` (16px) minimum to prevent iOS zoom.
- No horizontal scroll: `overflow-x-hidden` on `html` and `body`.
- Focus rings: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent`.

### 6.3 Performance on Mobile

- Three.js hero is disabled on low-power devices (see 5.1).
- GSAP `ScrollTrigger` uses `fastScrollEnd: true` to prevent animation backlog
  during fast scrolling.
- Images (sample output preview) use `loading="lazy"` and `decoding="async"`.

---

## 7. State Management

**Zustand (`lib/store.ts`) — retained unchanged:**

| State | Owner | Persistence |
|---|---|---|
| `brief` | Zustand | Ephemeral (lost on reload) |
| `brd` | Zustand | Ephemeral |
| `isGenerating` | Zustand | Ephemeral |
| `hasCritique` | Zustand | Ephemeral |
| `visitedSections` | Zustand | Ephemeral |

**Local Component State:**

- Intake form field values (before submit).
- Review `activeKey` (current section).
- UI toggles: `showLowSeverity`, `regeneratePromptOpen`, etc.

**No URL State:**

- Review active section is not synced to URL hash. This avoids complexity in
  animation orchestration and keeps the existing behavior.

---

## 8. API Contract Summary

The backend is unchanged. Frontend routes and payloads:

| Route | Method | Payload | Response |
|---|---|---|---|
| `/api/generate` | POST | `BriefInput` | `{ brd: BRD }` |
| `/api/critique` | POST | `{ brd, brief }` | `{ brd: BRD }` |
| `/api/regenerate-section` | POST | `{ section_name, brief, prompt? }` | `SectionOutput` |
| `/api/apply-critique` | POST | `{ section_name, brief, current_content, critique_issue, critique_suggestion }` | `{ content: Record<string,any> }` |
| `/api/export` | POST | `{ brd, project_name? }` | `.docx` blob |

**Error Handling:**

- Non-2xx responses: parse JSON if possible, fallback to generic message.
- Network errors: retry once, then surface user-friendly alert.

---

## 9. Performance Plan

### 9.1 Code Splitting & Lazy Loading

| Chunk | Strategy |
|---|---|
| Three.js + scene code | `next/dynamic`, `ssr: false`, loaded only on `/` |
| GSAP ScrollTrigger | `next/dynamic` on landing; core GSAP is small enough to include in main bundle |
| Sample output preview image | `loading="lazy"`, below-the-fold |
| Landing sections below fold | `IntersectionObserver` to defer non-critical JS initialization |

### 9.2 Bundle Control

- Remove `framer-motion` (~40kB gzipped) to offset `gsap` (~35kB gzipped) and
  `three` (~150kB gzipped, code-split).
- Target landing page initial JS < 200kB gzipped (excluding Three.js chunk).
- Use `webpack-bundle-analyzer` in CI to enforce budget.

### 9.3 WebGL Optimization

- Renderer: `antialias: false`, `alpha: true`.
- Geometry: `BufferGeometry`, reused where possible.
- Materials: single `ShaderMaterial`, no lights.
- Texture: none, or one small data texture.

### 9.4 Animation Performance

- `will-change: transform, opacity` applied only during active animation;
  removed via GSAP `onComplete`.
- Use `transform` and `opacity` only (compositor-friendly properties).
- Avoid animating `blur` filters on scroll (GPU-intensive); use fade + translate
  instead.

---

## 10. Testing Strategy

### 10.1 Playwright Configuration

- Emulate `prefers-reduced-motion: reduce` in all tests to disable animations
  and eliminate flakiness.
- Add a dedicated `chromium-reduced-motion` project for animation-specific
  assertions.

```ts
// playwright.config.ts addition
{
  name: 'chromium-reduced-motion',
  use: {
    ...devices['Desktop Chrome'],
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },
}
```

### 10.2 Test Coverage

| Page | Test |
|---|---|
| `/` | Three.js canvas mounts; fallback visible when WebGL disabled; all 8 sections render; CTAs navigate. |
| `/intake` | Form validation blocks submit; stakeholder add/remove works; submit calls `/api/generate`; loading state shown; routes to `/review` on success. |
| `/review` | All 12 sections navigable; critic feedback renders; accept/reject updates state; regenerate calls API; section switching updates content. |
| `/export` | Download triggers `/api/export`; return-to-review works; success state shown. |

### 10.3 Animation Testing

- Visual regression tests for landing page at `prefers-reduced-motion: reduce`
  (stable snapshots).
- Manual QA checklist for motion paths at normal speed.
- Lighthouse CI for performance budget enforcement.

---

## 11. Risk List and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Three.js bundle bloat pushes landing page over budget | Medium | High | Code-split `three` via `next/dynamic` with `ssr: false`; remove `framer-motion`; use tree-shakeable `three/src/` imports; keep dynamic chunk <350kB gzipped; cap scene complexity. |
| Three.js performs poorly on mid-tier mobile | Medium | High | Simple shader, <500 vertices, DPR cap at 2 (1 on low-power), off-screen pause via IntersectionObserver, `visibilitychange` pause, low-power heuristic fallback, target Mali-G57/Adreno 610 at 60fps. |
| GSAP page transitions conflict with Next.js App Router | Medium | Medium | Use layout-level transition wrapper, not route interception; kill old timeline before creating new; test all navigation paths. |
| Accessibility regressions in motion-heavy UI | Medium | High | 100% reduced-motion coverage via `useReducedMotion`; focus rings; logical tab order; WCAG AA contrast audit; Three.js scene is purely decorative. |
| Playwright flakiness from animations | High | Medium | Force `reducedMotion: 'reduce'` in test context; avoid time-based assertions; test animated paths separately with explicit waits only on completion callbacks. |
| Clean-slate rebrand breaks existing user mental model | Low | Low | Preserve core flow (intake → review → export); navigation patterns remain familiar; user-facing URLs unchanged. |
| GSAP + React 19 compatibility issues or timeline leaks | Low | High | Install `@gsap/react` and use `useGSAP` everywhere; verify latest `gsap` on install; kill timelines on unmount; audit detached nodes in DevTools Memory panel; run a 5-minute navigation stress test. |
| Single frontend-dev bottleneck stalls delivery | Medium | High | Front-load the Three.js spike and design-system foundation; keep Sprint 3 light as overflow buffer; surface blockers within 4 hours; escalate to pair/contractor if any Sprint 1 item slips >1 day. |

---

## 12. Deliberately Out of Scope

| Item | Reason |
|---|---|
| Payment/subscription system | PRD Section 8: out of scope. |
| User accounts, auth, saved history | PRD Section 8: out of scope. |
| Custom template upload | PRD Section 8: out of scope. |
| SSO, compliance documentation | PRD Section 8: out of scope. |
| Backend API changes | Requirement: existing API unchanged. |
| Light mode / theme toggle | NF-07: dark mode is the only theme. |
| Multi-language i18n | No requirement. |
| Service workers / offline mode | No requirement. |

---

## 13. Requirement Traceability

| Architecture Section | Requirements Addressed |
|---|---|
| 3, 4 (Component & Design System) | LP-01–LP-09, IN-01–IN-03, RV-01–RV-03, EX-01, NF-01, NF-05–NF-07, A11Y-01, A11Y-03–A11Y-04 |
| 5.1 (Three.js) | LP-10, NF-03, A11Y-05 |
| 5.2 (GSAP) | LP-11, IN-06, RV-08, EX-04, NF-04, A11Y-02 |
| 6 (Mobile-first) | NF-01, NF-05, NF-06 |
| 7 (State) | IN-05, RV-05–RV-06 |
| 8 (API) | IN-04, RV-04–RV-05, EX-02, NF-09 |
| 9 (Performance) | NF-02, NF-08 |
| 10 (Testing) | NF-02, A11Y-01–A11Y-05 |
| 11 (Risks) | NF-02, NF-03, NF-04, NF-08 |
