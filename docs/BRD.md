# BRD — Precedent Full Redesign & Revamp

> Business Requirements Document for the redesigned Precedent experience.

---

## 1. Functional Requirements

### 1.1 Landing Page (`/`)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| LP-01 | Hero section renders above the fold on mobile and desktop. | Headline, sub-headline, and both CTAs visible without scrolling on 375px and 1440px viewports. |
| LP-02 | Problem section articulates the BA's structural-writing burden. | Section includes the approved copy from `docs/LANDING-PAGE-PLAYBOOK.md`. |
| LP-03 | How-it-works section displays 3 steps. | Steps are numbered, scannable, and include brief body copy. |
| LP-04 | The 12 BRD sections are listed explicitly. | All 12 sections appear in order with zero-padded numbering. |
| LP-05 | Sample output is downloadable. | A sample `.docx` file can be downloaded via a visible CTA. |
| LP-06 | Who-it's-for section qualifies the regulated-environment audience. | Copy mentions banking, insurance, healthcare, public sector, and enterprise IT. |
| LP-07 | Validation quote section supports social proof. | Pull quote layout is present; placeholder or real quote renders correctly. |
| LP-08 | Footer CTA repeats primary conversion actions. | Both "Generate my BRD" and "Download a sample BRD" CTAs appear. |
| LP-09 | Navigation allows entry to intake form. | Clicking "Generate my BRD" navigates to `/intake`. |
| LP-10 | Three.js ambient hero background renders on capable devices. | WebGL scene loads; static fallback displays on failure or reduced motion. |
| LP-11 | GSAP scroll-triggered animations reveal sections. | Sections animate into view on scroll; disabled when `prefers-reduced-motion` is true. |

### 1.2 Intake Page (`/intake`)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| IN-01 | Brief form captures all required fields. | Fields: project objective, stakeholders (name + role), scope in, scope out, target users, regulatory context. |
| IN-02 | Stakeholder rows can be added and removed. | User can add/remove stakeholder entries without page reload. |
| IN-03 | Form validation prevents empty required fields. | Submit is blocked and errors shown until required fields are valid. |
| IN-04 | Submitting the form calls `/api/generate`. | Request payload matches `BriefInput` schema; UI shows loading state. |
| IN-05 | Generated BRD is stored in Zustand and user is routed to `/review`. | `setBRD` is called; navigation happens after successful response. |
| IN-06 | Page transition from landing to intake is animated. | GSAP or route transition animates the incoming page. |

### 1.3 Review Page (`/review`)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| RV-01 | All 12 BRD sections are navigable. | Sidebar or equivalent navigation lists all sections and highlights active section. |
| RV-02 | Active section content renders in the main area. | Section content displays according to its schema type. |
| RV-03 | Critic feedback is displayed per section. | Feedback items show severity, issue, and suggestion. |
| RV-04 | User can regenerate a single section. | "Regenerate" action calls `/api/regenerate-section` and updates the section. |
| RV-05 | User can apply a critic suggestion. | "Apply" action calls `/api/apply-critique` and updates the section. |
| RV-06 | User can accept/reject feedback without applying. | Feedback state updates in Zustand; UI reflects decision. |
| RV-07 | Export CTA navigates to `/export`. | Clicking export routes to export page. |
| RV-08 | Section switching is animated. | GSAP animates content swap; reduced-motion users get instant swap. |

### 1.4 Export Page (`/export`)

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| EX-01 | Page confirms export readiness. | BRD data is present; page shows success/download state. |
| EX-02 | Download triggers `/api/export`. | `.docx` file downloads to the user's device. |
| EX-03 | Return-to-review action works. | User can navigate back to `/review`. |
| EX-04 | Success animation plays on download. | GSAP micro-animation plays; disabled for reduced motion. |

---

## 2. Non-Functional Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| NF-01 | Mobile-first responsive design. | Layouts are designed for 320px first and scale up; no horizontal scroll on mobile. |
| NF-02 | Performance budget for landing page. | Lighthouse mobile performance ≥80; FCP <1.8s; TTI <3.5s on simulated 4G. |
| NF-03 | Three.js scene is performance-gated. | Scene pauses off-screen; disabled on low-power devices or WebGL failure. |
| NF-04 | Animation respects reduced motion. | All GSAP/Three.js motion is suppressed when `prefers-reduced-motion: reduce`. |
| NF-05 | Touch targets are accessible. | All interactive elements ≥44×44px on mobile. |
| NF-06 | Type remains readable on small screens. | Base font size ≥16px for inputs to prevent zoom; body text readable at 320px. |
| NF-07 | Dark mode is the only theme. | No light-mode toggle required; dark palette is default and consistent. |
| NF-08 | Bundle size is controlled. | Three.js and GSAP are code-split per route where possible; landing page is the only required Three.js route. |
| NF-09 | Existing API contracts remain unchanged. | `/api/generate`, `/api/critique`, `/api/regenerate-section`, `/api/apply-critique`, `/api/export` accept and return the same shapes. |

---

## 3. Accessibility Requirements

| ID | Requirement | Acceptance Criteria |
|---|---|---|
| A11Y-01 | Focus order is logical. | Keyboard navigation follows visual order on all pages. |
| A11Y-02 | Motion can be disabled. | `prefers-reduced-motion` is honored globally. |
| A11Y-03 | Color contrast meets WCAG AA. | Text contrast ≥4.5:1 for body, ≥3:1 for large text and UI components. |
| A11Y-04 | Interactive elements have visible focus. | Focus rings or equivalent indicators are present. |
| A11Y-05 | Three.js scene is decorative. | No critical information is conveyed only through the WebGL scene. |

---

## 4. Data & Validation Rules

The intake form continues to use the existing `BriefInput` schema:

```text
project_objective: string, required
stakeholders: array of { name: string, role: string }, at least one required
scope_in: array of string, required
scope_out: array of string, required
target_users: string, required
regulatory_context: string, required
```

Validation rules:

- All top-level fields must be non-empty.
- At least one stakeholder must be present.
- Stakeholder `name` and `role` must each be non-empty.

---

## 5. Regulatory / Compliance Constraints

- The product targets regulated industries; copy and UX must project reliability and precision.
- Security Controls, User Access Management, Acceptance Criteria, and Benefits Realization must remain first-class BRD sections.
- No PII is collected beyond project brief text; existing data handling remains unchanged.

---

## 6. Traceability

| Business Goal (from playbook) | Requirements |
|---|---|
| Convert builder-facing copy to buyer-facing copy | LP-02, LP-06, LP-09 |
| Lead with regulated-environment differentiator | LP-06, LP-10/NF-03 |
| Provide sample output to remove trust friction | LP-05 |
| Make primary CTA specific and active | LP-01, LP-08, IN-04 |
| Support mobile-first evaluation | NF-01, NF-02, NF-05, NF-06 |
| Maintain credible, calm, instrument-grade feel | All visual requirements; NF-07 |
