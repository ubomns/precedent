# DESIGN-SPEC — Precedent Full Redesign & Revamp

> UX and visual design specification for the clean-slate rebrand of Precedent.
> Source: docs/PRD.md · docs/BRD.md · docs/LANDING-PAGE-PLAYBOOK.md · docs/ARCHITECTURE.md

---

## 1. Design Principles

1. **Calm instrument, not consumer app.** Every element should feel precise, expensive, and quiet.
2. **Regulated-world credibility.** The UI must look like it belongs in a bank, insurer, or hospital IT review — never a generic AI tool.
3. **Motion with purpose.** Animations guide attention and confirm state changes; they never decorate for decoration's sake.
4. **Mobile-first, never mobile-last.** Layouts, type, and interactions start at 320px and gain complexity on larger screens.
5. **Structure over noise.** The 12-section BRD is the product; the interface gets out of the way so the document is the hero.

---

## 2. Color System

Dark mode only. Apply `.dark` to `<html>` and use CSS custom properties.

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#050505` | Page background |
| `--surface` | `#0A0A0A` | Cards, panels, main workspace surface |
| `--surface-2` | `#111111` | Elevated inputs, hovered rows, secondary panels |
| `--surface-3` | `#171717` | Tertiary elevation, code/pre blocks |
| `--fg` | `#FDFBF7` | Primary text, headings |
| `--text-body` | `#D4D4D8` | Body copy |
| `--text-secondary` | `#A1A1AA` | Subheadings, meta text |
| `--text-tertiary` | `#71717A` | Placeholders, disabled text, footers |
| `--accent` | `#10B981` | Primary accent, CTAs, active states |
| `--accent-dim` | `rgba(16, 185, 129, 0.5)` | Focus rings, subtle accent glows |
| `--accent-hover` | `#34D399` | Hover state for accent elements |
| `--border` | `rgba(255, 255, 255, 0.06)` | Hairline borders |
| `--border-strong` | `rgba(255, 255, 255, 0.10)` | Active borders, dividers |
| `--shadow-color` | `rgba(0, 0, 0, 0.24)` | Shadows for elevation |
| `--badge-high-bg` | `rgba(244, 63, 94, 0.10)` | High severity background |
| `--badge-high-text` | `#FB7185` | High severity text |
| `--badge-high-border` | `rgba(244, 63, 94, 0.20)` | High severity border |
| `--badge-medium-bg` | `rgba(245, 158, 11, 0.10)` | Medium severity background |
| `--badge-medium-text` | `#FBBF24` | Medium severity text |
| `--badge-medium-border` | `rgba(245, 158, 11, 0.20)` | Medium severity border |
| `--badge-low-bg` | `rgba(113, 113, 122, 0.10)` | Low severity background |
| `--badge-low-text` | `#A1A1AA` | Low severity text |
| `--badge-low-border` | `rgba(113, 113, 122, 0.20)` | Low severity border |

**Rules:**

- Accent color covers ≤10% of any viewport.
- No purple, blue, or generic AI gradients.
- Subtle emerald vignette allowed on landing hero only (`radial-gradient(circle at 50% 0%, rgba(16,185,129,0.06), transparent 50%)`).

---

## 3. Typography System

**Font families**:

- Sans: `Geist, ui-sans-serif, system-ui, sans-serif`
- Mono: `Geist Mono, ui-monospace, monospace`

**Type scale**:

| Token | Mobile (320px–639px) | Desktop (1024px+) | Line Height | Letter Spacing | Weight |
|---|---|---|---|---|---|
| `display` | 2.25rem / 36px | 4rem / 64px | 1.05 | -0.03em | 600 |
| `h1` | 1.75rem / 28px | 2.5rem / 40px | 1.1 | -0.02em | 600 |
| `h2` | 1.5rem / 24px | 2rem / 32px | 1.15 | -0.015em | 600 |
| `h3` | 1.25rem / 20px | 1.5rem / 24px | 1.25 | -0.01em | 500 |
| `body-lg` | 1.125rem / 18px | 1.25rem / 20px | 1.6 | 0 | 400 |
| `body` | 1rem / 16px | 1rem / 16px | 1.6 | 0 | 400 |
| `body-sm` | 0.875rem / 14px | 0.875rem / 14px | 1.5 | 0 | 400 |
| `caption` | 0.75rem / 12px | 0.75rem / 12px | 1.4 | 0.02em | 500 |
| `eyebrow` | 0.625rem / 10px | 0.75rem / 12px | 1.2 | 0.18em | 600 |
| `mono` | 0.875rem / 14px | 0.875rem / 14px | 1.5 | 0 | 400 |

**Rules:**

- Inputs use `text-base` (16px) minimum to prevent iOS zoom.
- Body text max-width: `65ch` for readability.
- IDs and section numbers use mono.

---

## 4. Spacing & Layout Grid

**Base unit**: 4px (`--space-1` = 0.25rem).

| Token | Value |
|---|---|
| `--space-1` | 0.25rem / 4px |
| `--space-2` | 0.5rem / 8px |
| `--space-3` | 0.75rem / 12px |
| `--space-4` | 1rem / 16px |
| `--space-5` | 1.25rem / 20px |
| `--space-6` | 1.5rem / 24px |
| `--space-8` | 2rem / 32px |
| `--space-10` | 2.5rem / 40px |
| `--space-12` | 3rem / 48px |
| `--space-16` | 4rem / 64px |
| `--space-20` | 5rem / 80px |
| `--space-24` | 6rem / 96px |

**Layout grid**:

- Mobile: single column, 16px gutters, 100% width.
- Tablet (768px+): 12-column grid, 24px gutters.
- Desktop (1024px+): 12-column grid, 32px gutters, max content width `1200px`, centered.

**Section spacing**:

- Mobile: `py-16` (64px) between major landing sections.
- Desktop: `py-24` (96px).

**Page gutters**:

- Mobile: `px-4` (16px).
- Tablet+: `px-6` (24px).
- Desktop+: `px-8` (32px).

---

## 5. Component Primitives

### 5.1 Button

**Primary**:

- Background: `--accent` (#10B981).
- Text: `--bg` (#050505) for maximum contrast; or white if preferred by dev.
- Padding: `px-5 py-3` mobile, `px-6 py-3.5` desktop.
- Radius: `rounded-full`.
- Hover: background `--accent-hover`, scale `0.98`.
- Focus: `ring-2 ring-offset-2 ring-offset-bg ring-accent`.
- Trailing icon nested in a circular well (w-8 h-8, bg white/15).

**Secondary / Ghost**:

- Background: transparent.
- Border: 1px `--border-strong`.
- Text: `--fg`.
- Hover: background `--surface-2`.

**Sizes**: `sm`, `md`, `lg`. Touch target always ≥44px.

### 5.2 Card / Surface

- Background: `--surface`.
- Border: 1px `--border`.
- Radius: `1rem` (16px) mobile, `1.5rem` (24px) desktop.
- Shadow: `0 8px 32px -12px var(--shadow-color)`.
- Padding: `p-6` mobile, `p-8` desktop.
- No double-bezel shell. A single clean container with subtle border and shadow.

### 5.3 Input / TextArea

- Background: `--surface-2`.
- Border: 1px `--border`.
- Radius: `0.75rem` (12px).
- Padding: `px-4 py-3`.
- Text: `--fg`; placeholder `--text-tertiary`.
- Focus: border `--accent-dim`, ring `0 0 0 3px rgba(16,185,129,0.15)`.
- Error: border `--badge-high-text`, text `--badge-high-text`.
- Label: `caption` style, uppercase tracking, `--text-secondary`, above input, `mb-2`.

### 5.4 Badge

- Pill shape, `rounded-full px-3 py-1`.
- Text: `caption` size.
- Severity colors map to badge tokens in §2.

### 5.5 Navigation

**Desktop**: horizontal pill bar, `backdrop-blur-xl`, `--surface` background at 70% opacity, border `--border`, radius `9999px`.

**Mobile**: hamburger triggers a full-screen overlay or bottom sheet. Links stack vertically, `h1` size, with active accent indicator.

### 5.6 Typography Components

- `Eyebrow`: uppercase, letter-spacing 0.18em, `--text-secondary`, `caption` size.
- `Display`: `display` token, used only in landing hero.
- `Heading1`, `Heading2`, `Heading3`: map to `h1`, `h2`, `h3` tokens.
- `Body`, `BodySmall`, `Caption`: map to body, body-sm, caption tokens.
- `Mono`: used for IDs, section numbers, and data labels.

---

## 6. Page-by-Page UX Spec

### 6.1 Landing Page (`/`)

**Structure** (single column, stacked sections):

1. **Floating nav** (fixed top, pill bar, blur background).
2. **Hero**
   - Full viewport height on desktop, min-height `100dvh` on mobile.
   - Three.js ambient canvas behind content (z-index below text).
   - Centered text block, max-width `800px`.
   - Eyebrow: "Business Requirements Document Generator"
   - Display headline: "The BRD shouldn't be the hardest part of your job."
   - Body-lg sub-headline with regulated-environment proof.
   - Primary CTA: "Generate my BRD — free to try →"
   - Secondary CTA: "Download a sample BRD →"
   - Scroll hint: subtle chevron bounce at bottom (respects reduced motion).
3. **Problem**
   - Section heading: "You handle the thinking. We handle the structure."
   - Body copy from playbook, max-width `65ch`.
   - Optional: large pull quote styling for the key line.
4. **How It Works**
   - 3-step horizontal layout on desktop; stacked cards on mobile.
   - Each step: large mono number, h3 title, body copy.
5. **The 12 Sections**
   - Two-column grid on desktop; single column on mobile.
   - Mono-numbered list, each item a `Card` with subtle hover lift.
6. **Sample Output**
   - Left: copy + download CTA. Right: preview card showing a styled Word export screenshot.
   - On mobile, stacked with preview above copy.
7. **Who It's For**
   - Regulated industry list (banking, insurance, healthcare, public sector, enterprise IT) as icon + label chips.
   - Body copy from playbook.
8. **Validation Quote**
   - Large quote text, attribution below.
   - Styled as a `Card` with left accent border (4px `--accent`).
9. **CTA Footer**
   - Darker surface (`--surface`), centered copy, primary + secondary CTAs.
10. **Footer**
    - Minimal: "Precedent v1 · 2026" and a v2 pricing contact teaser if desired.

**Motion**:

- Three.js hero: slow, ambient particle drift or soft refractive plane. Loop duration ≥20s. No camera interaction required.
- Sections reveal on scroll: `opacity: 0, y: 32px` → `opacity: 1, y: 0`, duration 0.7s, ease `power2.out`, stagger 0.1s.
- CTA hover: scale 0.98, icon translate-x 4px.

---

## Screen: Intake Page (`/intake`)

### User flow

**Entry condition**: User clicks "Generate my BRD" CTA from landing page, or navigates directly to `/intake`.

**Steps**:
1. Page loads with staggered section entrance animation (respects `prefers-reduced-motion`).
2. User fills Section 01 — Project Objective (TextArea).
3. User fills Section 02 — Stakeholders (dynamic rows: name + role). At least one row required.
4. User fills Section 03 — Scope In / Scope Out (paired TextAreas).
5. User fills Section 04 — Target Users (Input) + Regulatory Context (TextArea).
6. User clicks "Generate BRD" primary CTA.
7. Frontend validates all fields. If invalid, inline errors appear and focus moves to the first invalid field.
8. If valid, form submits to `/api/generate`. UI shows loading state on CTA.
9. On success, BRD is stored in Zustand and user is routed to `/review`.

**Success exit**: Redirect to `/review` with `setBRD` called and `isGenerating` reset.

**Error exits**:
- **Validation error**: Inline field errors + submit-blocked state. No page transition.
- **API error**: Submit error banner appears above CTA. CTA returns to idle state.
- **Network error**: Same as API error with generic fallback message.

---

### Layout

**Page shell**:
- `min-h-[100dvh]` flex column, `bg-ground`, `overflow-x-hidden`.
- Decorative vignette: absolute, centered, `900×900`, `pointer-events-none`, z-index below content.
- `Nav` component fixed at top (existing shared component).

**Main content area**:
- `flex-1 flex flex-col items-center`.
- Page gutters: `px-4` mobile, `px-6` sm+.
- Top padding: `pt-24` (96px) mobile to clear nav, `pt-28` (112px) sm+.
- Bottom padding: `pb-20` (80px) mobile, `pb-24` (96px) sm+.

**Header block**:
- `w-full` mobile, `sm:max-w-[720px] sm:mx-auto`.
- Bottom margin: `mb-6` (24px) mobile, `sm:mb-8` (32px) sm+.
- Contains Eyebrow → Heading1 → BodyLarge → Meta row (stacked on mobile, horizontal on sm+).

**Form card**:
- `w-full` mobile, `sm:max-w-[720px] sm:mx-auto`.
- Card padding: `p-4` (16px) mobile, `sm:p-6` (24px) sm+, `lg:p-8` (32px) lg+.
- Card radius: `rounded-lg` (16px) mobile, `lg:rounded-xl` (24px) desktop.
- Card tone: `default` (`bg-surface`).

**Form internal structure**:
- `flex flex-col` with section gaps: `gap-6` (24px) mobile, `sm:gap-8` (32px) sm+, `lg:gap-10` (40px) lg+.
- Sections 02–04 are preceded by a hairline divider: `border-t border-white/[0.06] pt-6` mobile, `sm:pt-8` sm+.

---

### Component hierarchy

- IntakePage
  - Nav (shared, fixed top)
  - Vignette (decorative, absolute)
  - `<main>` (flex column, centered)
    - HeaderBlock
      - Eyebrow ("Business Requirements Document Generator")
      - Heading1 ("Start your BRD")
      - BodyLarge (subtitle copy)
      - MetaRow (required hint + drafter status dot)
    - Card (form container)
      - `<form>` (flex column, gap scale)
        - Section01_Context `[data-intake-section]`
          - SectionHeader (badge "01" + title "Context")
          - FieldWrapper (label "Project Objective", error state)
            - TextArea (objective, adaptive height)
        - Section02_Stakeholders `[data-intake-section]`
          - SectionHeader (badge "02" + title "Stakeholders")
          - FieldWrapper (label "Stakeholders", hint showing count, error state)
            - StakeholderList (flex column, row gap)
              - StakeholderRow (keyed by id, GSAP-animated mount/unmount)
                - Input (name, flex-1, aria-label)
                - Input (role, flex-1, aria-label)
                - RemoveButton (icon-only, 44×44px, ghost style)
              - AddStakeholderButton (secondary, md size, icon + text)
        - Section03_Scope `[data-intake-section]`
          - SectionHeader (badge "03" + title "Scope")
          - ScopeGrid (`grid-cols-1 sm:grid-cols-2`, gap-4)
            - FieldWrapper ("Scope In", error state)
              - TextArea (adaptive height)
            - FieldWrapper ("Scope Out", error state)
              - TextArea (adaptive height)
        - Section04_AudienceConstraints `[data-intake-section]`
          - SectionHeader (badge "04" + title "Audience & Constraints")
          - AudienceGrid (`grid-cols-1 sm:grid-cols-2`, gap-4)
            - FieldWrapper ("Target Users", error state)
              - Input
            - FieldWrapper ("Regulatory Context", error state)
              - TextArea (adaptive height)
        - SubmitArea `[data-intake-section]`
          - ErrorBanner (conditional, `role="alert"`)
          - SubmitDivider (`border-t border-white/[0.06] pt-6 sm:pt-8`)
          - GenerateButton (primary, lg, fullWidth, loading state)
          - HelperText ("Drafter agent · ~30 seconds", mono caption)

---

### State table

| Element | Default | Hover | Focus | Active | Loading | Empty | Error | Disabled |
|---|---|---|---|---|---|---|---|---|
| **TextArea / Input** | `bg-surface-2`, `border-border`, `text-ink`, placeholder `--text-tertiary` | same as default | `border-accent-dim`, `ring-accent-dim/15` | same as focus | — | — | `border-badge-high-text`, error caption below | `opacity-50`, `cursor-not-allowed` |
| **StakeholderRow** | `bg-surface-2`, `border border-white/[0.06]`, `rounded-xl`, `p-3 sm:p-4` | `border-white/[0.10]` | — | — | — | inputs empty | row-level error from FieldWrapper | — |
| **RemoveButton** | `w-11 h-11` (44px), `rounded-lg`, `bg-white/[0.02]`, `border-white/10`, `text-tertiary` | `text-rose-400`, `bg-rose-500/10`, `border-rose-500/20` | `ring-2 ring-accent` | `scale-0.96` | — | — | — | `opacity-40`, `cursor-not-allowed` (when ≤1 row) |
| **AddStakeholderButton** | secondary variant, `size="md"`, `min-h-[44px]` | `bg-surface-2` | `ring-2 ring-accent` | `scale-0.96` | — | — | — | — |
| **GenerateButton** | primary variant, `size="lg"`, `fullWidth`, `min-h-[48px]` | `bg-accent-hover`, `scale-0.98` | `ring-2 ring-accent ring-offset-2` | `scale-0.96` | spinner replaces icon, text changes to "Drafting your BRD…" | — | — | `opacity-40` when `submitting` |
| **ErrorBanner** | `rounded-lg`, `bg-rose-500/10`, `border-rose-500/20`, `px-4 py-3`, `text-sm text-badge-high-text`, `role="alert"` | same as default | — | — | — | hidden (display:none) | visible when `submitError` present | — |
| **SectionHeader badge** | `w-7 h-7 sm:w-8 sm:h-8`, `rounded-lg`, `bg-surface-2`, `border-white/[0.08]`, `text-caption font-mono text-secondary` | — | — | — | — | — | — | — |
| **SectionHeader title** | `text-body-lg sm:text-h3 font-medium text-ink tracking-tight` | — | — | — | — | — | — | — |

---

### Motion spec

| Element | Trigger | Property | From | To | Duration | Easing |
|---|---|---|---|---|---|---|
| Form sections (page load) | mount | opacity + translateY | `opacity: 0, y: 20` | `opacity: 1, y: 0` | 350ms | `power2.out` |
| Form sections stagger | mount | — | — | — | 80ms stagger | — |
| Stakeholder row (add) | row mounts | opacity + translateY + scale | `opacity: 0, y: -12, scale: 0.98` | `opacity: 1, y: 0, scale: 1` | 250ms | `power2.out` |
| Stakeholder row (remove) | remove clicked | opacity + height + margin | current | `opacity: 0, height: 0, marginBottom: 0` | 200ms | `power2.in` |
| GenerateButton (focus) | keyboard focus | scale | `scale: 1` | `scale: 1.015` | 120ms | `power2.out` |
| CTA hover | mouseenter | scale | `scale: 1` | `scale: 0.98` | 180ms | `cubic-bezier(0.2, 0.7, 0.2, 1)` |
| CTA active | mousedown | scale | `scale: 0.98` | `scale: 0.96` | 180ms | `cubic-bezier(0.2, 0.7, 0.2, 1)` |
| CTA icon | hover | translate | `0,0` | `2px,-2px` | 220ms | `cubic-bezier(0.2, 0.7, 0.2, 1)` |
| Error text | blur + invalid | opacity | `opacity: 0` | `opacity: 1` | 150ms | `ease-out` |
| Error banner | submitError set | opacity + translateY | `opacity: 0, y: -8` | `opacity: 1, y: 0` | 200ms | `power2.out` |
| Field focus ring | focus | box-shadow + border-color | `border-border` | `border-accent-dim, ring-accent-dim/15` | 150ms | `ease-out` |

**Reduced motion**: All GSAP animations are gated by `prefersReducedMotion` hook. When true, animations are skipped (elements render in final state instantly). CSS transitions in `@layer utilities` are also suppressed by the global `prefers-reduced-motion: reduce` media query.

---

### Responsive rules

| Breakpoint | Layout change |
|---|---|
| **Base (320px–639px)** | Single column throughout. Page gutters `px-4`. Card padding `p-4`. Form section gap `gap-6`. Scope and Audience grids are 1 column. Stakeholder rows stay side-by-side with `gap-2`. TextAreas use `min-h-[96px]`. Section titles are `text-body-lg` (18px). Submit button is `fullWidth`. Meta row stacks vertically. |
| **sm (640px–767px)** | Container gains `max-w-[720px] mx-auto`. Page gutters `px-6`. Card padding `sm:p-6`. Form section gap `sm:gap-8`. Scope and Audience grids switch to `sm:grid-cols-2`. Stakeholder row gap increases to `sm:gap-3`. TextAreas use `sm:min-h-[128px]`. Meta row becomes horizontal (`sm:flex-row`). |
| **md (768px–1023px)** | Same as `sm` with more breathing room. No additional layout changes. |
| **lg (1024px+)** | Card padding `lg:p-8`. Card radius `lg:rounded-xl` (24px). Section titles switch to `lg:text-h3` (24px). Form section gap `lg:gap-10`. |
| **xl (1280px+)** | No layout changes; spacing remains generous. |

**Container behavior**:
- Mobile: `w-full` (no max-width). Content is bounded only by page gutters (`px-4`).
- sm+: `sm:max-w-[720px] sm:mx-auto`. The form card and header block share the same max-width.

**Padding scale**:
- Page horizontal: `px-4` → `sm:px-6` → `lg:px-8`.
- Card internal: `p-4` → `sm:p-6` → `lg:p-8`.
- Section vertical gap: `gap-6` → `sm:gap-8` → `lg:gap-10`.
- Section header to fields: `mb-3` → `sm:mb-4`.

---

### Token usage

**Color tokens**:
- `--bg`: page background
- `--surface`: card background
- `--surface-2`: stakeholder row backgrounds, input backgrounds
- `--fg`: headings, primary text
- `--text-secondary`: section numbers, meta text
- `--text-tertiary`: placeholders, helper text
- `--accent`: focus rings, active nav indicator
- `--accent-hover`: primary button hover
- `--border`: card border, input border (default)
- `--border-strong`: remove button border, secondary button border
- `--badge-high-text`: error borders, error text, error banner text
- `--badge-high-bg` / `--badge-high-border`: error banner background and border

**Spacing tokens**:
- `--space-4` (16px): page gutters mobile, grid gaps, card padding mobile
- `--space-6` (24px): form section gap mobile, card padding sm, section divider padding
- `--space-8` (32px): form section gap sm, card padding lg
- `--space-10` (40px): form section gap lg

**Typography tokens**:
- `eyebrow`: header eyebrow
- `h1`: page title
- `body-lg`: page subtitle, section titles mobile
- `h3`: section titles desktop
- `body`: input text
- `caption`: field labels, error text, meta text, section numbers
- `mono`: meta text, section numbers, helper text

**Radius tokens**:
- `rounded-lg` (16px): card mobile, stakeholder rows, inputs
- `rounded-xl` (24px): card desktop
- `rounded-lg` (12px from Tailwind default? No, in this project `rounded-lg` = `1rem` = 16px per tailwind.config.js): inputs, remove button

---

### Proposed new tokens

| Name | Value | Rationale |
|---|---|---|
| `--radius-card` | `1rem` (16px) | Current value is `0.5rem` (8px), which feels too tight for the primary form container. Aligns with §5.2 Card spec. |
| `--radius-card-lg` | `1.5rem` (24px) | Current value is `0.5rem` (8px). Desktop cards need more generous radius to match the calm, expensive aesthetic. |

> **Note to frontend dev**: Updating these two tokens will affect all cards globally. This is intentional — the current 8px radius was a holdover from the old utilitarian design. If a global token change is too risky for this sprint, override the intake Card locally with `className="rounded-lg lg:rounded-xl"`.

---

### Dark mode notes

- Dark mode is the only theme. No light-mode variants required.
- All colors are already specified for dark mode in the token system.
- The intake page uses `--surface` for the card and `--surface-2` for inputs/rows. Ensure these have sufficient contrast against `--bg` (#050505) so the card is perceptible as a distinct surface.
- `--surface` (#0A0A0A) on `--bg` (#050505) is subtle but visible (ΔL ≈ 3%). This is intentional — the card should feel like a slightly elevated plane, not a floating box.

---

### Accessibility notes

**WCAG 2.2 AA checklist**:

| Criterion | Status | Implementation notes |
|---|---|---|
| 1.1.1 Non-text Content | Pass | All icons have `aria-hidden="true"`. Logo is decorative. |
| 1.3.1 Info and Relationships | Pass | Form labels are real `<label>` elements with `htmlFor`. Sections are grouped visually and structurally. |
| 1.4.3 Contrast (Minimum) | Pass | Body text `#D4D4D8` on `#0A0A0A` ≈ 6.5:1. Labels `#A1A1AA` on `#0A0A0A` ≈ 5.9:1. Both exceed 4.5:1. |
| 1.4.10 Reflow | Pass | Single column at 320px. No horizontal scroll. Content reflows correctly. |
| 1.4.11 Non-text Contrast | Attention | Default input borders (`rgba(255,255,255,0.06)`) are very subtle. They are not the sole identifier — labels and focus states provide additional identification. Frontend dev must ensure focus state is highly visible. |
| 2.1.1 Keyboard | Pass | All inputs, buttons, and links are natively keyboard operable. |
| 2.4.7 Focus Visible | Pass | `.field:focus` uses `box-shadow: 0 0 0 3px rgba(16,185,129,0.15)` + `border-color: var(--accent-dim)`. Buttons use `focus-visible:ring-2 ring-accent ring-offset-2`. |
| 2.5.5 Target Size (Enhanced) | Attention | Most targets meet 44×44px. **Two fixes required**: (1) Add Stakeholder button must use `size="md"` (`min-h-[44px]`), not `size="sm"`. (2) Nav hamburger is `w-9 h-9` (36px) — must increase to `w-11 h-11` (44px) or add padding to hit area. |
| 3.3.1 Error Identification | Pass | Errors are identified in text below each field and in the submit error banner. |
| 3.3.3 Error Suggestion | Pass | Error messages state what is required (e.g., "Project objective is required."). |

**What the frontend dev must implement**:
1. All inputs must have an associated `<label>` or `aria-label`.
2. Stakeholder remove buttons must have `aria-label` including the row index.
3. Error banner must have `role="alert"` so screen readers announce it immediately.
4. Add Stakeholder button must use `size="md"` to meet 44px touch target.
5. Nav hamburger touch target must be increased to ≥44px.
6. All GSAP animations must check `prefersReducedMotion` before executing.
7. Placeholder text must not be the sole source of field instructions (labels are present above every field).

---

### Copy and content

**Header block**:
- Eyebrow: `Business Requirements Document Generator`
- Heading1: `Start your BRD`
- BodyLarge: `Enter the project context, stakeholders, scope, and regulatory constraints. Precedent structures the output into a 12-section BRD.`
- Meta row left: `All fields required unless marked optional.`
- Meta row right: `● Drafter agent ready` (dot is `w-1.5 h-1.5 rounded-full bg-accent`)

**Section 01 — Context**:
- Section title: `Context`
- Field label: `Project Objective`
- Placeholder: `What is being built, for whom, and why now?`

**Section 02 — Stakeholders**:
- Section title: `Stakeholders`
- Field label: `Stakeholders`
- Hint: `[N] people` (dynamic count)
- Name placeholder: `Name`
- Role placeholder: `Role`
- Add button: `Add stakeholder`
- Remove button `aria-label`: `Remove stakeholder [N]`

**Section 03 — Scope**:
- Section title: `Scope`
- Scope In label: `Scope In`
- Scope In placeholder: `What's in scope`
- Scope Out label: `Scope Out`
- Scope Out placeholder: `What's out of scope`

**Section 04 — Audience & Constraints**:
- Section title: `Audience & Constraints`
- Target Users label: `Target Users`
- Target Users placeholder: `Who will use what's built?`
- Regulatory Context label: `Regulatory Context`
- Regulatory Context placeholder: `Standards, jurisdictions, internal policies`

**Submit area**:
- Button idle: `Generate BRD`
- Button loading: `Drafting your BRD…`
- Helper text: `Drafter agent · ~30 seconds`
- Error banner (generic): `Failed to generate BRD. Please try again.`
- Error banner (validation): `Please fill in all required fields.`

---

### Open questions

1. **Nav hamburger touch target**: The shared `Nav` component uses `w-9 h-9` (36px) for the mobile menu button. Should the intake page redesign include a global Nav fix, or should the Nav be updated in a separate pass?
2. **Card radius tokens**: The current `--radius-card` and `--radius-card-lg` are both `0.5rem` (8px), which contradicts the design system spec (§5.2). Should we update the global tokens, or apply a local override on the intake Card only?
3. **Placeholder contrast**: `--text-tertiary` (`#71717A`) on `--surface-2` (`#111111`) is ~3.5:1. This is acceptable for decorative placeholders but borderline for accessibility. Should we lighten placeholders to `#A1A1AA` (5.9:1) or keep the current subtle treatment?
4. **Stakeholder row stacking**: At 320px, two side-by-side inputs + a 44px button in one row leaves ~114px per input. This is usable but tight. Should we stack name/role vertically below a certain breakpoint (e.g., <400px), or keep the horizontal layout universally?

---

### 6.3 Review Page (`/review`)

**Layout**:

- Desktop: left sidebar (280px fixed), right main area (fluid).
- Mobile: bottom sheet or collapsible drawer for section nav; main area full-width.
- Sidebar: section list, progress indicator, "Export to Word" CTA at bottom.

**Sidebar items**:

- Each section name with mono index (01–12).
- Active item: `--accent` text, left accent border.
- Section with critic feedback: severity dot (high = rose, medium = amber, low = zinc).

**Main area**:

- Section title (h1) + count badge ("3 issues").
- Section content rendered according to schema (text, lists, tables).
- Critic feedback cards below content.
- Each feedback card: severity badge, issue, suggestion, Accept / Apply / Reject actions.

**Interactions**:

- Click sidebar item → active section changes.
- Regenerate section button opens a small inline prompt input.
- Apply critique button calls API and updates content.

**Motion**:

- Section switch: GSAP Flip animates content area layout swap; reduced motion instant.
- Feedback cards stagger in when critique loads.

### 6.4 Export Page (`/export`)

**Layout**:

- Centered card, max-width `560px`.
- Large checkmark/confirm icon.
- Heading: "Your BRD is ready."
- Body: filename, section count, word count if available.
- Primary CTA: "Download .docx".
- Secondary CTA: "Back to review".

**Motion**:

- Page enters with scale + fade.
- On download: icon pulse + checkmark draw animation; reduced motion instant.

---

## 7. Motion & Animation Spec

### 7.1 Three.js Hero (Landing only)

**Visual description**:

- A sparse field of soft, luminous particles drifting upward and outward from center.
- Particles are desaturated emerald-white, low opacity (0.3–0.6), with subtle size variation.
- Very slow vertical drift; mouse movement has no effect (non-interactive).
- Background remains `--bg`; particles provide ambient depth only.

**Performance**:

- Max 200 particles.
- Single draw call via `THREE.Points`.
- DPR cap: 1 on mobile, 2 on desktop.
- Pause when canvas is off-screen or tab hidden.

**Fallback**:

- Reduced motion, low-power device, or WebGL failure: static radial gradient vignette (`--vignette`) on `--bg`.

### 7.2 GSAP Scroll Reveals (Landing)

- Trigger: section top hits 80% viewport height.
- From: `opacity: 0, y: 32px`.
- To: `opacity: 1, y: 0`.
- Duration: 0.7s.
- Ease: `power2.out`.
- Stagger children: 0.1s.
- Reduced motion: instant final state.

### 7.3 Page Transitions

- Outgoing page: `opacity: 1` → `opacity: 0`, duration 0.2s.
- Incoming page: `opacity: 0, y: 16px` → `opacity: 1, y: 0`, duration 0.4s, ease `power2.out`.
- Reduced motion: no animation, instant route render.

### 7.4 Review Section Switch

- `Flip.getState()` before active key changes.
- After state change: `Flip.from(state, { duration: 0.4, ease: 'power2.inOut' })`.
- Reduced motion: instant swap.

### 7.5 Export Success Micro-Animation

- Checkmark icon scales from 0.8 to 1 + opacity fade.
- Duration: 0.4s, ease `back.out(1.7)`.
- Reduced motion: icon visible immediately.

---

## 8. Accessibility Spec

- **Focus indicators**: `focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-bg` on all interactive elements.
- **Touch targets**: all clickable elements ≥44×44px.
- **Color contrast**: body text ≥4.5:1; large text/UI ≥3:1.
- **Reduced motion**: every animation honors `prefers-reduced-motion: reduce`.
- **Landmarks**: each page has one `<main>`; landing sections use `<section>` with aria-labels; review uses `<nav>` for sidebar.
- **Buttons**: CTA text is descriptive (not "Click here").
- **Three.js**: purely decorative; no critical info in the canvas.

---

## 9. Responsive Behavior Summary

| Breakpoint | Changes |
|---|---|
| Base (320px–639px) | Single column; hamburger nav; stacked landing sections; intake form full-width; review uses bottom sheet for sections; Three.js DPR capped at 1. |
| `sm` (640px–767px) | Two-column grids for scope in/out and 12-sections list. |
| `md` (768px–1023px) | Review sidebar appears as collapsible panel; landing how-it-works becomes 3-column. |
| `lg` (1024px+) | Full desktop layout; fixed review sidebar; Three.js DPR up to 2; max content width 1200px centered. |
| `xl` (1280px+) | More generous section spacing; larger hero type scale. |

---

## 10. Assets & Copy Checklist

| Asset | Source | Owner | Status |
|---|---|---|---|
| Sample BRD .docx | Generate from fictional insurance-portal brief | frontend-dev / PM | Needed |
| Word export screenshot/preview | Screenshot of sample .docx | frontend-dev | Needed |
| Validation quote | Obtain from practising BA, or use placeholder | PM / stakeholder | Needed |
| Regulated industry icons | Use `@phosphor-icons/react` | frontend-dev | Available |
| Logo/wordmark | Reuse existing `LogoIcon` or create new | frontend-dev | Existing |

---

## 11. Out of Scope for Design

- Light mode / theme toggle.
- Payment/pricing page UI (landing may mention "contact" only).
- User account dashboards.
- Custom template upload UI.
- Multi-language layouts.
