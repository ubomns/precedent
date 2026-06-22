# ADR-001: Clean-Slate Visual Rebrand

**Date:** 2026-06-13
**Status:** Proposed

## Context

The existing Precedent frontend uses a specific visual language — `DoubleBezel`
cards, `PillCTA` buttons, and a set of CSS color tokens — that was designed for
a minimal launcher-and-form tool. The approved PRD and brand strategy playbook
require a conversion-focused landing experience that feels "calm, credible,
instrument-grade, and expensive quiet" for Business Analysts in regulated
industries. The existing visual language is not a constraint; the redesign is
explicitly a clean slate.

## Decision

Replace the existing `DoubleBezel`, `PillCTA`, `GlassNav`, and associated color
/ radius tokens with a new design system built from CSS custom properties and a
fresh set of React primitives under `components/design-system/`.

The new system retains only:

- The dark-mode-only constraint (`html className="dark"`).
- The emerald accent color (`#10B981`) as the primary action color.
- The `Geist` + `Geist Mono` font stack.

Everything else — card elevation language, button shape, spacing scale, and
surface hierarchy — is redesigned.

## Alternatives considered

| Option | Pros | Cons |
|---|---|---|
| **A. Evolve existing primitives** | Faster implementation; less code churn. | DoubleBezel "tray + plate" metaphor and PillCTA shape are tightly coupled to the old launcher aesthetic; hard to make them feel premium and conversion-focused. |
| **B. Adopt a third-party UI kit** (e.g., Radix + shadcn) | Battle-tested accessibility, rapid development. | Generic appearance; hard to achieve the "expensive quiet" brand feel; adds dependency surface area. |
| **C. Clean-slate custom system** (chosen) | Full brand alignment; no legacy visual debt; optimized for mobile-first, motion-rich layouts. | Higher initial implementation cost; requires rewriting all page components. |

## Consequences

- **Positive:** The UI can precisely match the brand playbook's tone and
  conversion principles. No legacy token conflicts.
- **Positive:** Mobile-first spacing and touch-target sizing can be baked in
  from day one.
- **Negative:** All four pages (`/`, `/intake`, `/review`, `/export`) must be
  rebuilt. This is a large, coordinated change.
- **Negative:** Playwright tests that depend on specific class names or DOM
  structure will break and must be rewritten.

## Requirement traceability

- **PRD Section 4.3:** "Clean slate. The existing DoubleBezel card language,
  PillCTA shape, and current color tokens are not constraints."
- **PRD Section 7:** Design system principles (deep dark, emerald accent,
  geometric sans + mono, generous radius, elevation hierarchy).
- **BRD NF-01, NF-05, NF-06, NF-07:** Mobile-first, touch targets, readable type,
  dark mode only.
