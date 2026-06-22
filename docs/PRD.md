# PRD — Precedent Full Redesign & Revamp

> Product Requirements Document for the complete visual and experiential redesign of Precedent.

---

## 1. Goal

Transform Precedent from a minimal launcher-and-form tool into a credible, immersive, buyer-facing product experience that converts Business Analysts in regulated/enterprise environments.

The redesign must:

- Articulate the BA's problem and Precedent's solution clearly on the landing page.
- Build trust through validation, sample output, and regulated-environment positioning.
- Deliver a mobile-first, motion-rich interface using Three.js and GSAP where appropriate.
- Preserve the core BRD generation, critique, and export functionality.

---

## 2. Target Audience

**Primary**: Business Analysts working in regulated industries — banking, insurance, healthcare, public sector, enterprise IT.

**Characteristics**:

- BRDs are non-optional and format-governed.
- Need first-class sections: Security Controls, User Access Management, Acceptance Criteria, Benefits Realization.
- Skeptical of generic AI writing tools; respond to proof, precision, and peer validation.

**Secondary**: IT consulting firm leaders evaluating team tools, independent BAs.

---

## 3. Success Metrics

| Metric | Target |
|---|---|
| Landing page → intake form conversion | +50% vs. current launcher |
| Time to first BRD generation | Under 90 seconds on mobile |
| Mobile session completion rate | >60% through export |
| First Contentful Paint (landing) | <1.8s on 4G |
| Time to Interactive (landing) | <3.5s on mid-tier mobile |
| Reduced-motion fallback coverage | 100% of motion paths |

---

## 4. Scope

### 4.1 Pages to Redesign

| Route | Purpose |
|---|---|
| `/` | Conversion-focused landing page (replaces current launcher) |
| `/intake` | Structured brief capture form |
| `/review` | 12-section BRD workspace with critic feedback |
| `/export` | Download confirmation and next steps |

### 4.2 Motion & Immersion

- **Three.js**: used for ambient, non-interactive hero background on the landing page (e.g., subtle particle field, glass-like distortion, or depth map). Must degrade gracefully on low-power devices.
- **GSAP**: used for scroll-triggered section reveals, page transitions, staggered content entrance, and micro-interactions on CTAs.
- **Cross-app**: intake → review → export transitions should feel continuous; review section navigation should animate state changes.

### 4.3 Visual Rebrand

- Clean slate. The existing DoubleBezel card language, PillCTA shape, and current color tokens are not constraints.
- New design system must still feel calm, credible, and expensive — not generic AI purple/blue gradients.
- Mobile-first: all layouts, type, and motion start from mobile viewport constraints and scale up.

---

## 5. Three.js / GSAP Usage Rules

### 5.1 Three.js

- **Where**: landing page hero background only.
- **What**: ambient, low-complexity scene (e.g., soft depth particles, refractive glass plane, or procedural mesh). No gameplay, no camera controls required.
- **Performance**: target 60fps on mid-tier mobile; cap draw calls; use a simple shader; pause when off-screen; disable on `prefers-reduced-motion`.
- **Fallback**: static gradient/image fallback for low-power mode, reduced motion, or WebGL failure.

### 5.2 GSAP

- **Where**: landing page scroll reveals, page transitions, intake form step transitions, review section switching, export success animation.
- **What**: `gsap.from` / `ScrollTrigger` / `Flip` for entrance, layout, and state-change animations.
- **Performance**: use `will-change` sparingly; batch animations; respect `prefers-reduced-motion` by disabling or substituting simple fades.
- **Accessibility**: no auto-playing motion that cannot be paused; provide reduced-motion alternatives.

---

## 6. Landing Page Content Strategy

Derived from `Precedence-brand-strategy-playbook-1.docx`.

### 6.1 Sections (in order)

1. **Hero**: problem-led headline, sub-headline with regulated-environment proof, primary CTA "Generate my BRD — free to try", secondary CTA "Download a sample BRD".
2. **The Problem**: articulate the BA's structural-writing burden before judgment work begins.
3. **How It Works**: 3 steps — fill brief, draft 12 sections, export Word.
4. **The 12 Sections**: explicit list of generated BRD sections as a trust/feature signal.
5. **Sample Output**: downloadable sample BRD + screenshot/preview of Word export.
6. **Who It's For**: regulated-environment BA audience qualification.
7. **Validation Quote**: pull quote from a practising BA.
8. **CTA Footer**: repeat primary and secondary CTAs.

### 6.2 Key Copy Anchors

- **Differentiator**: "regulated environments" must be visible above the fold.
- **Primary CTA**: specific, active ("Generate my BRD — free to try").
- **Secondary CTA**: risk reversal ("Download a sample BRD").
- **Tone**: calm, confident, instrument-grade. No hype.

### 6.3 Monetization Signals

Even before building a payment system, the landing page may include:

- "Free to try. No account required for your first document."
- "Team and enterprise pricing available — contact hello@nsikak.dev" (or equivalent).

A full pricing page is out of scope for this redesign unless explicitly requested.

---

## 7. Design System Principles

- **Base**: deep dark (near-black) foundation.
- **Accent**: emerald or desaturated green, used sparingly (≤10% surface area).
- **Typography**: geometric sans + monospace for data. Avoid Inter/Roboto/Arial.
- **Radius language**: generous but consistent.
- **Containers**: clear hierarchy through elevation, not heavy shadows.
- **Mobile-first**: touch targets ≥44px; readable type scale at 320px; no horizontal scroll.

Detailed tokens, components, and motion specs live in `docs/DESIGN-SPEC.md` (UX Designer deliverable).

---

## 8. Out of Scope

- Payment/subscription system implementation.
- User accounts, auth, saved history.
- Custom template upload.
- SSO, compliance documentation.
- Changes to the 12-section BRD schema or agent models.
- Backend API changes beyond route/response adjustments needed by the frontend.

---

## 9. Acceptance Criteria (PRD Level)

- [ ] All four routes (`/`, `/intake`, `/review`, `/export`) have new designs implemented.
- [ ] Landing page includes all 8 content sections from the brand playbook.
- [ ] Three.js hero exists on landing page with a static fallback.
- [ ] GSAP scroll/page animations exist and respect `prefers-reduced-motion`.
- [ ] Mobile-first layouts work from 320px to 1440px+ without horizontal scroll.
- [ ] Core BRD generation, critique, regeneration, apply-critique, and export flows remain functional.
- [ ] Playwright tests pass or are updated to match new UI.
- [ ] Lighthouse mobile performance score ≥80 on landing page.
