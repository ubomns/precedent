# WBS — Precedent Full Redesign & Revamp

## Metadata

| Field | Value |
|-------|-------|
| Project | Precedent |
| Version | v1.0 |
| Sources | docs/PRD.md · docs/BRD.md · docs/ARCHITECTURE.md · docs/LANDING-PAGE-PLAYBOOK.md · docs/adr/ADR-001-visual-rebrand.md · docs/adr/ADR-002-threejs-landing-hero.md · docs/adr/ADR-003-gsap-motion-system.md |
| Standard | PMI WBS Practice Standard · PMBOK 7 Hybrid |
| Sprint length | 2 weeks |
| Team | frontend-dev · ux-designer · qa-tester |
| Created | 2026-06-13 |

---

## WBS Hierarchy

### 0.0 Risk Mitigation & Spikes (Sprint 0)

> Run before Sprint 1 to de-risk the three flagged top risks. If any spike fails, escalate to Engineering Lead before committing the full sprint plan.

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-000A | Three.js hero proof-of-concept — validate bundle size, mobile FPS, and fallback chain | frontend-dev | — | M (est. 1 day) | Working PoC renders on `/test-three`; `@next/bundle-analyzer` shows dynamic Three.js chunk <350kB gzipped; Mali-G57-class device or emulator holds 60fps; reduced-motion and WebGL-failure fallbacks render | ARCH §5.1, ADR-002 |
| WBS-000B | GSAP + React 19 proof-of-concept — validate `useGSAP`, cleanup, and Flip behavior | frontend-dev | — | S (est. 0.5 day) | PoC uses `@gsap/react` `useGSAP`; route transitions and a simple Flip layout swap work without errors; DevTools Memory shows no detached nodes after 10 mount/unmount cycles | ARCH §5.2, ADR-003 |
| WBS-000C | Capacity & sequencing check — confirm single-dev feasibility or trigger escalation | scrum-master | WBS-000A, WBS-000B | S (est. 0.5 day) | If either spike slips >1 day, recommend scope cut or additional resource; update sprint plan before G4 approval | WBS §Delivery Risks |

### 1.0 Design System & Specification

#### 1.1 UX Specification

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-001 | DESIGN-SPEC.md — visual tokens, component primitives, motion specs, and mobile-first layout rules | ux-designer | — | L (est. 2–3 days) | Document approved by Engineering Lead; covers color, type, spacing, radius, elevation, touch-target, and animation tokens | PRD §7, ADR-001, ADR-003 |

#### 1.2 Design System Implementation

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-002 | CSS custom properties + Tailwind config mapping | frontend-dev | WBS-001 | S (est. 0.5 day) | `globals.css` contains all tokens under `.dark`; Tailwind config exposes `ink`, `ground`, `surface`, `surface-2`, `body`, `secondary`, `tertiary`, `accent` | BRD NF-07, ADR-001 |
| WBS-003 | Primitive components — Button, Card, Input, Badge, Nav, Typography | frontend-dev | WBS-001, WBS-002 | M (est. 1 day) | All primitives render in Storybook-like isolation page; touch targets ≥44 px; base input font-size 16 px; focus rings visible | BRD NF-01, NF-05, NF-06, NF-07, A11Y-03, A11Y-04, ADR-001 |

### 2.0 Motion & Animation Infrastructure

#### 2.1 GSAP Foundation

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-004 | GSAP core + plugins setup, `useReducedMotion` hook | frontend-dev | WBS-003 | S (est. 0.5 day) | `gsap` and `ScrollTrigger` / `Flip` registered; hook returns boolean from `matchMedia`; all timelines check hook before play | BRD NF-04, A11Y-02, ADR-003 |
| WBS-005 | Page transition wrapper — outgoing/incoming timeline orchestration | frontend-dev | WBS-004 | M (est. 1 day) | `TransitionLayout` wraps `app/layout.tsx`; route changes trigger fade/slide; reduced motion skips to instant render | BRD IN-06, ADR-003 |

#### 2.2 Three.js Foundation

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-006 | Three.js hero scene + static fallback + performance gating | frontend-dev | WBS-003 | L (est. 2–3 days) | Scene loads via `next/dynamic` `ssr: false`; fallback renders on `prefers-reduced-motion`, WebGL failure, or low-power heuristic; DPR capped at 2; <500 vertices; single shader; pauses off-screen | BRD LP-10, NF-03, A11Y-05, ADR-002 |

### 3.0 Landing Page

#### 3.1 Structure & Content

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-007 | Landing page shell + floating pill navbar | frontend-dev | WBS-003 | S (est. 0.5 day) | Shell renders at `/`; nav links to `/intake`; no horizontal scroll at 320 px | BRD LP-01, LP-09, NF-01 |
| WBS-008 | Hero section — headline, sub-headline, primary/secondary CTAs, Three.js canvas | frontend-dev | WBS-006, WBS-007 | M (est. 1 day) | All copy from playbook renders; CTAs navigate; hero visible above fold on 375 px and 1440 px | BRD LP-01, LP-09, LP-10 |
| WBS-009 | Problem section — BA structural-writing burden copy | frontend-dev | WBS-007 | S (est. 0.5 day) | Approved playbook copy renders; readable at 320 px | BRD LP-02 |
| WBS-010 | How-it-works section — 3-step numbered layout | frontend-dev | WBS-007 | S (est. 0.5 day) | Steps 1–3 scannable; body copy present | BRD LP-03 |
| WBS-011 | The 12 Sections list — zero-padded numbered output | frontend-dev | WBS-007 | S (est. 0.5 day) | All 12 sections listed in order; structured-not-prose signal visible | BRD LP-04 |
| WBS-012 | Sample output — generate sample BRD, download CTA, inline preview | frontend-dev | WBS-007 | M (est. 1 day) | Sample `.docx` generated from fictional brief; download CTA works; preview image/screenshot visible | BRD LP-05 |
| WBS-013 | Who-it's-for section — regulated-environment audience qualification | frontend-dev | WBS-007 | S (est. 0.5 day) | Copy mentions banking, insurance, healthcare, public sector, enterprise IT | BRD LP-06 |
| WBS-014 | Validation quote — pull quote layout | frontend-dev | WBS-007 | S (est. 0.5 day) | Placeholder or real quote renders with attribution block | BRD LP-07 |
| WBS-015 | CTA footer — repeat primary and secondary CTAs | frontend-dev | WBS-007 | S (est. 0.5 day) | Both CTAs present; copy matches playbook | BRD LP-08 |

#### 3.2 Landing Motion

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-016 | GSAP scroll-triggered reveals for all 8 landing sections | frontend-dev | WBS-004, WBS-008–WBS-015 | M (est. 1 day) | Each section registers `ScrollTrigger`; default entrance `opacity:0, y:24` → visible; stagger 0.08 s; disabled when `prefers-reduced-motion` | BRD LP-11, NF-04, A11Y-02, ADR-003 |

### 4.0 Intake Page

#### 4.1 Structure & Functionality

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-017 | Intake page rebuild with new design system | frontend-dev | WBS-003, WBS-005 | M (est. 1 day) | All fields from `BriefInput` schema present; layout mobile-first; uses new `Input`, `Button`, `Card` primitives | BRD IN-01, NF-01, NF-06 |
| WBS-018 | Form validation + stakeholder add/remove | frontend-dev | WBS-017 | S (est. 0.5 day) | Empty required fields block submit; at least one stakeholder required; add/remove rows without reload | BRD IN-02, IN-03 |
| WBS-019 | Intake → review page transition animation | frontend-dev | WBS-005, WBS-017 | S (est. 0.5 day) | GSAP animates incoming page; reduced motion instant | BRD IN-06, ADR-003 |

### 5.0 Review Page

#### 5.1 Structure & Functionality

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-020 | Review shell + sidebar navigation with active highlight | frontend-dev | WBS-003, WBS-005 | M (est. 1 day) | Sidebar lists all 12 sections; active section highlighted; main area scrollable; mobile collapses sidebar | BRD RV-01, NF-01 |
| WBS-021 | Section content rendering per schema type | frontend-dev | WBS-020 | M (est. 1 day) | Each section renders according to its schema; tables, lists, and text blocks styled with new tokens | BRD RV-02 |
| WBS-022 | Critic feedback display + accept/reject state | frontend-dev | WBS-020 | S (est. 0.5 day) | Feedback shows severity, issue, suggestion; accept/reject updates Zustand; UI reflects decision | BRD RV-03, RV-06 |
| WBS-023 | Regenerate + apply-critique API integration | frontend-dev | WBS-020 | S (est. 0.5 day) | Regenerate calls `/api/regenerate-section`; apply calls `/api/apply-critique`; loading states shown | BRD RV-04, RV-05 |
| WBS-024 | Section switching animation with GSAP Flip | frontend-dev | WBS-004, WBS-020 | M (est. 1 day) | `Flip` captures layout state on `activeKey` change; reduced motion instant swap | BRD RV-08, NF-04, A11Y-02, ADR-003 |

### 6.0 Export Page

#### 6.1 Structure & Functionality

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-025 | Export page rebuild with new design system | frontend-dev | WBS-003, WBS-005 | S (est. 0.5 day) | BRD presence confirmed; success/download state visible; return-to-review link works | BRD EX-01, EX-03 |
| WBS-026 | Download success micro-animation | frontend-dev | WBS-004, WBS-025 | S (est. 0.5 day) | GSAP micro-animation plays on download trigger; disabled for reduced motion | BRD EX-04, NF-04, A11Y-02, ADR-003 |

### 7.0 Motion Integration & Polish

#### 7.1 Cross-Cutting Animation & Performance

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-033 | Remove `framer-motion`, add `three`/`gsap`, verify bundle budget | frontend-dev | WBS-006, WBS-004 | S (est. 0.5 day) | `framer-motion` uninstalled; `three` + `@types/three` + `gsap` installed; landing initial JS <200 kB gzipped (excluding Three.js chunk) | BRD NF-08, ADR-002, ADR-003 |
| WBS-036 | Cross-route motion polish + reduced-motion audit | frontend-dev | WBS-005, WBS-016, WBS-019, WBS-024, WBS-026 | M (est. 1 day) | All routes have consistent entrance/exit; `prefers-reduced-motion` honored on every path; no auto-playing unpausable motion | BRD NF-04, A11Y-02, ADR-003 |
| WBS-037 | Three.js performance tuning — DPR cap, off-screen pause, disposal | frontend-dev | WBS-006 | S (est. 0.5 day) | `IntersectionObserver` pauses rAF; `visibilitychange` pauses; unmount disposes renderer, geometry, material; target 60 fps on Mali-G57 class | BRD NF-03, ADR-002 |
| WBS-038 | GSAP timeline cleanup + memory leak audit | frontend-dev | WBS-004 | S (est. 0.5 day) | All `useGSAP` hooks kill timelines on unmount; `ScrollTrigger` instances refreshed/destroyed; no detached DOM nodes in DevTools Memory | BRD NF-04, ADR-003 |

### 8.0 QA & Test Suite

#### 8.1 Playwright Tests

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-027 | Landing page tests — canvas mount, fallback, 8 sections, CTAs | qa-tester | WBS-008, WBS-016 | M (est. 1 day) | Tests pass in `chromium-reduced-motion` project; canvas or fallback visible; all sections assertable; CTA navigation verified | BRD LP-01–LP-11, NF-02, A11Y-01 |
| WBS-028 | Intake page tests — validation, stakeholders, API, routing | qa-tester | WBS-017, WBS-018, WBS-019 | M (est. 1 day) | Submit blocked on empty fields; add/remove stakeholders work; `/api/generate` mocked and called; routes to `/review` on success | BRD IN-01–IN-06 |
| WBS-029 | Review page tests — navigation, feedback, regenerate, export | qa-tester | WBS-020–WBS-024 | M (est. 1 day) | All 12 sections navigable; critic feedback renders; accept/reject state updates; regenerate/apply API mocked; export CTA routes to `/export` | BRD RV-01–RV-08 |
| WBS-030 | Export page tests — download, return-to-review | qa-tester | WBS-025, WBS-026 | S (est. 0.5 day) | Download triggers `/api/export`; return-to-review routes to `/review`; success state visible | BRD EX-01–EX-04 |
| WBS-031 | Reduced-motion test project + animation assertions | qa-tester | WBS-036 | S (est. 0.5 day) | `playwright.config.ts` includes `chromium-reduced-motion` project; no time-based assertions; stable snapshots | BRD NF-04, A11Y-02, ADR-003 |

#### 8.2 Performance & Accessibility

| ID | Work Package | Assignee | Depends On | Size | DOD | Req. Ref |
|----|-------------|----------|------------|------|-----|----------|
| WBS-032 | Lighthouse CI performance audit | qa-tester | WBS-033, WBS-037 | S (est. 0.5 day) | Mobile performance score ≥80; FCP <1.8 s; TTI <3.5 s on simulated 4G | BRD NF-02 |
| WBS-034 | Accessibility audit — WCAG AA contrast, focus, keyboard | qa-tester | All page WBS items | M (est. 1 day) | Contrast ≥4.5:1 body, ≥3:1 large text; logical tab order; visible focus rings; no critical a11y findings | BRD A11Y-01–A11Y-05 |
| WBS-035 | Mobile responsive audit 320 px–1440 px | qa-tester | All page WBS items | M (est. 1 day) | No horizontal scroll at 320 px; readable type; touch targets ≥44 px; layouts scale to 1440 px+ | BRD NF-01, NF-05, NF-06 |

---

## Sprint Plan

### Sprint 1 — Design System & Motion Foundation

**Goal:** Deliver the approved design specification and build the foundational token system, component primitives, and animation infrastructure so that page work can begin without blocking on visual decisions.

**Includes WBS IDs:** WBS-001, WBS-002, WBS-003, WBS-004, WBS-005, WBS-006

| ID | Work Package | Assignee |
|----|-------------|----------|
| WBS-001 | DESIGN-SPEC.md | ux-designer |
| WBS-002 | CSS custom properties + Tailwind mapping | frontend-dev |
| WBS-003 | Primitive components | frontend-dev |
| WBS-004 | GSAP setup + `useReducedMotion` | frontend-dev |
| WBS-005 | Page transition wrapper | frontend-dev |
| WBS-006 | Three.js hero scene + fallback | frontend-dev |

**Capacity & risk flags:**
- WBS-006 is **XL-class complexity** (estimated L, 2–3 days). It carries technical risk: WebGL context failure, mobile performance, and manual memory management. If it slips, Sprint 2 landing hero is blocked.
- UX designer deliverable (WBS-001) is on the critical path for all frontend-dev work in this sprint.

---

### Sprint 2 — Landing Page

**Goal:** Ship the complete conversion-focused landing page with immersive hero, all 8 content sections, and scroll-triggered animations.

**Includes WBS IDs:** WBS-007, WBS-008, WBS-009, WBS-010, WBS-011, WBS-012, WBS-013, WBS-014, WBS-015, WBS-016

| ID | Work Package | Assignee |
|----|-------------|----------|
| WBS-007 | Landing page shell + nav | frontend-dev |
| WBS-008 | Hero section | frontend-dev |
| WBS-009 | Problem section | frontend-dev |
| WBS-010 | How-it-works section | frontend-dev |
| WBS-011 | 12-sections list | frontend-dev |
| WBS-012 | Sample output + sample BRD generation | frontend-dev |
| WBS-013 | Who-it's-for section | frontend-dev |
| WBS-014 | Validation quote | frontend-dev |
| WBS-015 | CTA footer | frontend-dev |
| WBS-016 | GSAP scroll reveals | frontend-dev |

**Capacity & risk flags:**
- **High capacity risk.** Frontend dev load is ~6.5 estimated days in a 10-day sprint. If WBS-006 from Sprint 1 required rework, this sprint will overload.
- WBS-012 requires generating a realistic sample BRD via the existing `/api/generate` endpoint — API availability is a dependency.
- Single frontend dev bottleneck: any blocker (Three.js bug, design spec ambiguity) stops all landing page progress.

---

### Sprint 3 — Intake & Export

**Goal:** Rebuild the brief capture and download confirmation flows with the new design system and continuous page transitions.

**Includes WBS IDs:** WBS-017, WBS-018, WBS-019, WBS-025, WBS-026

| ID | Work Package | Assignee |
|----|-------------|----------|
| WBS-017 | Intake page rebuild | frontend-dev |
| WBS-018 | Form validation + stakeholders | frontend-dev |
| WBS-019 | Intake → review transition | frontend-dev |
| WBS-025 | Export page rebuild | frontend-dev |
| WBS-026 | Download success animation | frontend-dev |

**Capacity & risk flags:**
- Light load (~3 estimated days). Frontend dev can pull forward review-page work or support Sprint 2 landing-page closure if needed.
- No new API contracts — relies on existing `/api/generate` and `/api/export`.

---

### Sprint 4 — Review Workspace

**Goal:** Rebuild the 12-section BRD review workspace with critic feedback, regeneration actions, and animated section switching.

**Includes WBS IDs:** WBS-020, WBS-021, WBS-022, WBS-023, WBS-024

| ID | Work Package | Assignee |
|----|-------------|----------|
| WBS-020 | Review shell + sidebar | frontend-dev |
| WBS-021 | Section content rendering | frontend-dev |
| WBS-022 | Critic feedback display | frontend-dev |
| WBS-023 | Regenerate + apply-critique | frontend-dev |
| WBS-024 | Section switching animation | frontend-dev |

**Capacity & risk flags:**
- Moderate load (~4 estimated days). GSAP Flip integration with React 19 carries compatibility risk — verify `gsap` version on install.
- The 12-section contract (`drafter.py::SECTION_SCHEMAS`) is load-bearing; any frontend rendering change must stay in sync with backend schemas.

---

### Sprint 5 — Motion Integration & Polish

**Goal:** Integrate and polish all animations, optimize bundles, and audit reduced-motion coverage across every route.

**Includes WBS IDs:** WBS-033, WBS-036, WBS-037, WBS-038

| ID | Work Package | Assignee |
|----|-------------|----------|
| WBS-033 | Remove framer-motion, verify bundle | frontend-dev |
| WBS-036 | Cross-route motion polish + reduced-motion audit | frontend-dev |
| WBS-037 | Three.js performance tuning | frontend-dev |
| WBS-038 | GSAP timeline cleanup + leak audit | frontend-dev |

**Capacity & risk flags:**
- Light explicit load (~2.5 estimated days) but this is a **polish and bug-fix buffer**. Expect emergent work from prior sprints.
- Bundle budget enforcement (NF-08) may require additional splitting if `webpack-bundle-analyzer` flags overshoot.

---

### Sprint 6 — QA, Tests & Audit

**Goal:** Verify all acceptance criteria, update Playwright tests, and validate performance, accessibility, and mobile responsiveness.

**Includes WBS IDs:** WBS-027, WBS-028, WBS-029, WBS-030, WBS-031, WBS-032, WBS-034, WBS-035

| ID | Work Package | Assignee |
|----|-------------|----------|
| WBS-027 | Landing page tests | qa-tester |
| WBS-028 | Intake page tests | qa-tester |
| WBS-029 | Review page tests | qa-tester |
| WBS-030 | Export page tests | qa-tester |
| WBS-031 | Reduced-motion tests | qa-tester |
| WBS-032 | Lighthouse CI audit | qa-tester |
| WBS-034 | Accessibility audit | qa-tester |
| WBS-035 | Mobile responsive audit | qa-tester |

**Capacity & risk flags:**
- QA tester load is ~6.5 estimated days in a 10-day sprint, leaving buffer for bug-fix verification.
- Frontend dev on-call for bug fixes discovered during test runs.
- Lighthouse performance ≥80 is a hard target; if missed, root cause may trace back to Sprint 1 (Three.js) or Sprint 5 (bundle optimization).

---

## Definition of Done

### Project-level (applies to the final increment)

- [ ] All acceptance criteria in docs/BRD.md pass (qa-tester evidence).
- [ ] All WBS work packages delivered and verified.
- [ ] Code review passed (no open blockers or majors).
- [ ] No unresolved High/Critical security findings.
- [ ] docs/ARCHITECTURE.md reflects what was actually built.
- [ ] Lighthouse mobile performance score ≥80 on landing page.
- [ ] `prefers-reduced-motion` honored on 100% of motion paths.
- [ ] Playwright full suite passes in `chromium-reduced-motion` project.

### Sprint-level (applies to each sprint increment)

- [ ] All sprint WBS items completed and independently verified.
- [ ] Tests written or updated for all items in this sprint.
- [ ] No regression in prior sprint items.
- [ ] Sprint review conducted; outcomes documented.
- [ ] Blockers surfaced to Engineering Lead within 4 hours of discovery.

---

## Delivery Risks

| # | Risk | Probability | Impact | Owner | Mitigation |
|---|---|------|-------------|--------|-------|-----------|
| R1 | Three.js bundle bloat pushes landing page over 200 kB initial JS budget, or scene performs poorly on mid-tier mobile | Medium | High | frontend-dev | **Pre-build PoC (WBS-000A)** validates chunk size and FPS before full commitment; use tree-shakeable `three/src/` imports; `next/dynamic` `ssr: false`; DPR cap at 2 (1 on low-power); <500 vertices; single shader; low-power heuristic + reduced-motion fallback; pause off-screen |
| R2 | GSAP + React 19 compatibility issues or timeline memory leaks cause animation flakiness or crashes | Medium | High | frontend-dev | **Pre-build PoC (WBS-000B)** validates `@gsap/react` `useGSAP`; install latest `gsap` and `@gsap/react`; use `useGSAP` everywhere; kill timelines on unmount; no selectors — refs only; 5-minute navigation stress test; audit detached nodes |
| R3 | Single frontend dev bottleneck — illness, blocker, or underestimated Three.js work stalls all feature delivery | Medium | High | scrum-master | **Sprint 0 go/no-go gate (WBS-000C)**; front-load design system + Three.js foundation; keep Sprint 3 light as overflow buffer; surface blockers within 4 hours; escalate to pair/contractor if any Sprint 0/1 item slips >1 day; identify scope cuts (sample BRD preview, validation quote) that preserve MVP |

---

## v2 Backlog (Out of Scope)

The following items are explicitly out of scope per PRD §8 and ARCHITECTURE §12. They are tracked here for roadmap planning and must **not** be scheduled in this sprint.

| ID | Feature | Reason | Estimated Complexity |
|----|---------|--------|-------------------|
| V2-001 | Payment / subscription system implementation | No monetization infrastructure required for v1 | XL |
| V2-002 | User accounts, authentication, saved history | BRD generation is ephemeral by design in v1 | XL |
| V2-003 | Custom template upload (team house templates) | Roadmap item; default Word output is sufficient for v1 | L |
| V2-004 | SSO integration | No enterprise auth requirement in v1 | XL |
| V2-005 | Compliance documentation (SOC 2, ISO 27001 pages) | Copy targets regulated industries but product is not itself certified | L |
| V2-006 | Light mode / theme toggle | NF-07: dark mode is the only theme | S |
| V2-007 | Multi-language i18n | No requirement | L |
| V2-008 | Service workers / offline mode | No requirement | M |

---

## Jira Ticket Mapping

> Jira MCP is not yet enabled. The table below is the ready-to-create mapping for when it is.

| WBS ID | Suggested Jira Summary | Type | Priority | Sprint | Labels |
|--------|------------------------|------|----------|--------|--------|
| WBS-001 | [WBS-001] Produce DESIGN-SPEC.md with tokens, primitives, and motion specs | Task | High | Sprint 1 | ux-designer |
| WBS-002 | [WBS-002] Implement CSS custom properties and Tailwind token mapping | Task | High | Sprint 1 | frontend-dev |
| WBS-003 | [WBS-003] Build design system primitives — Button, Card, Input, Badge, Nav, Typography | Story | High | Sprint 1 | frontend-dev |
| WBS-004 | [WBS-004] Set up GSAP core, plugins, and useReducedMotion hook | Task | High | Sprint 1 | frontend-dev |
| WBS-005 | [WBS-005] Create page transition wrapper with GSAP timeline orchestration | Story | High | Sprint 1 | frontend-dev |
| WBS-006 | [WBS-006] Build Three.js ambient hero scene with fallback and performance gating | Story | High | Sprint 1 | frontend-dev |
| WBS-007 | [WBS-007] Construct landing page shell and floating pill navbar | Task | Medium | Sprint 2 | frontend-dev |
| WBS-008 | [WBS-008] Implement hero section with headline, CTAs, and Three.js canvas | Story | High | Sprint 2 | frontend-dev |
| WBS-009 | [WBS-009] Implement Problem section with approved playbook copy | Task | Medium | Sprint 2 | frontend-dev |
| WBS-010 | [WBS-010] Implement How-it-works 3-step section | Task | Medium | Sprint 2 | frontend-dev |
| WBS-011 | [WBS-011] Implement The 12 Sections list | Task | Medium | Sprint 2 | frontend-dev |
| WBS-012 | [WBS-012] Generate sample BRD and build Sample Output download/preview section | Story | High | Sprint 2 | frontend-dev |
| WBS-013 | [WBS-013] Implement Who-it's-for regulated-environment section | Task | Medium | Sprint 2 | frontend-dev |
| WBS-014 | [WBS-014] Implement Validation quote pull-quote layout | Task | Low | Sprint 2 | frontend-dev |
| WBS-015 | [WBS-015] Implement CTA footer with repeated conversion actions | Task | Medium | Sprint 2 | frontend-dev |
| WBS-016 | [WBS-016] Add GSAP scroll-triggered reveals to all 8 landing sections | Story | Medium | Sprint 2 | frontend-dev |
| WBS-017 | [WBS-017] Rebuild intake page with new design system primitives | Story | High | Sprint 3 | frontend-dev |
| WBS-018 | [WBS-018] Wire form validation and stakeholder add/remove logic | Task | High | Sprint 3 | frontend-dev |
| WBS-019 | [WBS-019] Add GSAP page transition from landing to intake | Task | Medium | Sprint 3 | frontend-dev |
| WBS-020 | [WBS-020] Rebuild review page shell and sidebar navigation | Story | High | Sprint 4 | frontend-dev |
| WBS-021 | [WBS-021] Render all 12 BRD section types per schema | Story | High | Sprint 4 | frontend-dev |
| WBS-022 | [WBS-022] Display critic feedback with accept/reject state | Task | High | Sprint 4 | frontend-dev |
| WBS-023 | [WBS-023] Integrate regenerate-section and apply-critique API calls | Task | High | Sprint 4 | frontend-dev |
| WBS-024 | [WBS-024] Add GSAP Flip animation for review section switching | Story | Medium | Sprint 4 | frontend-dev |
| WBS-025 | [WBS-025] Rebuild export page with new design system | Task | High | Sprint 3 | frontend-dev |
| WBS-026 | [WBS-026] Add download success micro-animation | Task | Low | Sprint 3 | frontend-dev |
| WBS-033 | [WBS-033] Remove framer-motion and verify bundle budget | Task | Medium | Sprint 5 | frontend-dev |
| WBS-036 | [WBS-036] Polish cross-route motion and audit reduced-motion coverage | Task | Medium | Sprint 5 | frontend-dev |
| WBS-037 | [WBS-037] Tune Three.js performance — DPR cap, pause, disposal | Task | Medium | Sprint 5 | frontend-dev |
| WBS-038 | [WBS-038] Audit GSAP timeline cleanup and memory leaks | Task | Medium | Sprint 5 | frontend-dev |
| WBS-027 | [WBS-027] Update Playwright tests for landing page | Task | High | Sprint 6 | qa-tester |
| WBS-028 | [WBS-028] Update Playwright tests for intake page | Task | High | Sprint 6 | qa-tester |
| WBS-029 | [WBS-029] Update Playwright tests for review page | Task | High | Sprint 6 | qa-tester |
| WBS-030 | [WBS-030] Update Playwright tests for export page | Task | Medium | Sprint 6 | qa-tester |
| WBS-031 | [WBS-031] Add reduced-motion Playwright project and animation assertions | Task | Medium | Sprint 6 | qa-tester |
| WBS-032 | [WBS-032] Run Lighthouse CI performance audit | Task | High | Sprint 6 | qa-tester |
| WBS-034 | [WBS-034] Conduct accessibility audit — WCAG AA, focus, keyboard | Task | High | Sprint 6 | qa-tester |
| WBS-035 | [WBS-035] Conduct mobile responsive audit 320 px–1440 px | Task | High | Sprint 6 | qa-tester |
