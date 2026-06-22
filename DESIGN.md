# DESIGN.md — Precedent

> Visual contract for the Precedent BRD Generator.
> This document locks every design decision before code is written.

---

## 1. Product Context

Precedent is a two-agent AI tool for Business Analysts in regulated/enterprise environments. It turns a structured project brief into a 12-section Business Requirements Document. The UX must feel **credible, calm, precise, and expensive** — the opposite of a noisy marketing site. This is a professional instrument, not a consumer app.

---

## 2. Brand World

| Token | Value | Rationale |
| --- | --- | --- |
| **Theme** | Deep Dark Mode | BAs work in long focused sessions; dark reduces eye strain and signals "serious tool" |
| **Base Background** | `#050505` (near-black, OLED depth) | Deepest possible black; content floats in space |
| **Surface Elevations** | `#0A0A0A` to `#111111` | Subtle stepped depth for cards and panels |
| **Primary Accent** | Emerald `#10B981` (desaturated, low chroma) | Professional, alive, NOT "AI purple/blue". Used at ≤10% surface area |
| **Text Primary** | `#FDFBF7` (warm off-white) | Easier on the eyes than pure white in dark mode |
| **Text Secondary** | `#A1A1AA` (zinc-400) | Muted but readable; never fight the primary text |
| **Hairline Borders** | `rgba(255,255,255,0.06)` | Barely visible structural lines |
| **Typography Family** | `Geist` (Sans) + `Geist Mono` (Data/Tables) | Modern, engineered, precise. Tight tracking on headers |
| **Radius Language** | `2rem` (32px) for major cards, `9999px` for pills | Generous, friendly but authoritative |
| **Shadow System** | Diffused ambient shadows only | No harsh dark drop shadows. Use `0 20px 40px -15px rgba(0,0,0,0.05)` for subtle lift |

---

## 3. Global Component Language

### The "Double-Bezel" Card (Mandatory for all major containers)

Every card, panel, or input group must look like machined hardware — a glass plate in an aluminum tray:

- **Outer Shell**: `bg-white/5`, `ring-1 ring-white/10`, `p-1.5`, `rounded-[2rem]`
- **Inner Core**: `bg-[#0A0A0A]`, `shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]`, `rounded-[calc(2rem-0.375rem)]`
- Inner core holds the actual content with generous padding (`p-8` or `p-10`)

### Primary CTA (Pill Button)

- `rounded-full`, `px-6 py-3`, `bg-emerald-600`, `text-white`
- **Trailing Icon**: NEVER naked. Nest inside its own circular wrapper (`w-8 h-8 rounded-full bg-white/10`) flush with the button's right inner padding
- Hover state: subtle scale down (`scale-[0.98]`), inner icon translates diagonally (`translate-x-1 -translate-y-[1px]`)

### Inputs / Form Fields

- Background: `#111111` with `border border-white/10`
- Focus state: `ring-1 ring-emerald-500/50`
- Labels sit **above** the input, `text-xs uppercase tracking-wider text-zinc-400`
- Generous vertical spacing between fields (`gap-6`)

### Severity Badges (Critic Feedback)

- **High**: `bg-rose-500/10 text-rose-400 border border-rose-500/20`
- **Medium**: `bg-amber-500/10 text-amber-400 border border-amber-500/20`
- **Low**: `bg-zinc-500/10 text-zinc-400 border border-zinc-500/20`
- All are pill-shaped (`rounded-full px-3 py-1 text-[11px]`)

---

## 4. Screen 1: Brief Intake Page (`/`)

**Aspect Ratio:** 16:9 horizontal
**Composition Anchor:** Stacked center, ultra-minimalist
**Background Mode:** Pure solid `#050505` with a **single soft radial vignette** — a very subtle, low-chroma emerald glow (almost invisible) centered behind the form to create ambient depth. NO full-bleed image.

### Layout

- **Top**: Floating glass pill navbar (`mt-6 mx-auto w-max rounded-full backdrop-blur-2xl bg-white/5 border border-white/10 px-6 py-3`). Inside: tiny wordmark "Precedent" (left), nav links "Intake" / "Review" / "Export" (right, muted).
- **Hero Area**: Mini-minimalist. NOT a giant statement. Small, confident.
  - Eyebrow tag: `rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500` reading "Business Requirements Document Generator"
  - H1: `text-4xl md:text-5xl tracking-tight text-[#FDFBF7]` reading "From brief to BRD."
  - Subline: `text-lg text-zinc-400 max-w-[55ch]` reading "Enter what only you know. We'll handle the structure."
- **Form**: Centered, max-width `640px`. ONE large double-bezel card containing all fields.
  - Fields visible:
    - Project Objective (textarea, 4 rows)
    - Stakeholders (dynamic row with name + role + add button)
    - Scope In / Scope Out (side-by-side inside the card, each a textarea)
    - Target Users (text input)
    - Regulatory Context (textarea)
  - Floating "Generate BRD" CTA pill at the bottom of the card, full-width inside the inner core.
- **Footer**: Minimal. `text-zinc-600 text-sm` reading "Precedent v1 · 2026"

### Mood

Confident restraint. Expensive quiet. Like a Linear or Vercel dark-mode tool. No clutter, no gradients except the single radial vignette.

---

## 5. Screen 2: BRD Review Page (`/review`)

**Aspect Ratio:** 16:9 horizontal
**Composition Anchor:** Asymmetrical split — left sidebar (25%) + right content (75%)
**Background Mode:** Solid `#050505`. The right content area sits on a slightly elevated surface `#0A0A0A` with a `rounded-[2rem]` frame, creating the impression of a focused workspace.

### Layout

- **Left Sidebar (25% width)**: Sticky, dark, narrow.
  - Top: Project name (e.g., "Project: Meridian Banking API") in `text-sm font-medium text-[#FDFBF7]`
  - Section: "BRD Sections" with a vertical list of 12 items:
    1. Executive Summary
    2. Business Objective
    3. Scope
    4. Stakeholders
    5. Functional Requirements
    6. Non-Functional Requirements
    7. Assumptions
    8. Constraints
    9. Acceptance Criteria
    10. User Access Management
    11. Security Controls
    12. Benefits Realization
  - Active section (e.g., "Scope") highlighted with `text-emerald-400` and a tiny emerald dot indicator.
  - Bottom of sidebar: Progress bar — "8 of 12 sections reviewed" with a thin emerald fill.
  - Bottom-most: "Export to Word" CTA pill, full width of sidebar.

- **Right Content Area (75% width)**:
  - **Header**: Section title (e.g., "Scope") in `text-3xl tracking-tight`, with a count badge to the right: "2 issues found (1 medium, 1 low)" in the severity badge style.
  - **Double-bezel Card 1 — Drafted Content**:
    - Inner core shows the drafted content.
    - For "Scope": two columns inside the card — "In Scope" (bullet list) and "Out of Scope" (bullet list).
    - Bullets are small emerald dots.
    - Text is `text-sm text-zinc-300 leading-relaxed`.
  - **Double-bezel Card 2 — Critic Feedback** (sits below Card 1, slightly smaller):
    - Header: "Critic Review" with a small shield/check icon.
    - Feedback item 1 (Medium): Amber badge "Medium" + text "Consider clarifying the regulatory boundary for cross-border data."
    - Feedback item 2 (Low): Hidden behind a "Show low-severity feedback" link in `text-zinc-500 text-sm`.
    - Each feedback item has a "Mark as addressed" micro-button (ghost, `rounded-full`, tiny).

- **Floating Export Button**: Fixed bottom-right of the viewport. A large circular button (`w-14 h-14 rounded-full bg-emerald-600`) with a download icon. Subtle diffused shadow.

### Mood

Workspace. Power tool. The BA is reviewing a document that feels like it was written by a senior colleague. The critic feedback is visible but not intrusive — like inline comments in a premium document editor. The asymmetry creates focus.

---

## 6. Motion & Micro-Interaction (Implied in static mocks)

Even though these are static images, the design must **imply** motion:

- Cards should feel like they float — achieved through diffused shadows and slight elevation steps.
- Buttons should look tactile — achieved through inner highlights and nested icon architecture.
- The critic badges should feel like live status indicators — achieved through bright, intentional color against the dark ground.
- The left sidebar progress bar should feel like it is actively filling — achieved through a clean, high-contrast emerald fill against a dark track.

---

## 7. Anti-Patterns (Strictly Avoid)

- NO purple, blue, or neon glows
- NO generic "AI" gradients (rainbow mesh, blob gradients)
- NO centered dark hero with floating spheres
- NO 3-column equal card grids
- NO fake dashboards with pointless charts
- NO generic stock photos of people shaking hands
- NO "Seamless" / "Elevate" / "Next-Gen" copy
- NO pure white `#FFFFFF` backgrounds anywhere
- NO Inter, Roboto, or Arial typography
- NO sharp 90° corners on major containers
- NO harsh drop shadows (`rgba(0,0,0,0.3)`)

---

## 8. Output Requirements

Reference images (if generated externally) must cover:

1. **Screen 1**: Brief Intake Page (`/`) — Mini-minimalist hero, centered double-bezel form, floating glass nav, dark solid background with subtle radial vignette.
2. **Screen 2**: BRD Review Page (`/review`) — Asymmetrical split layout, left sidebar with 12 sections, right content with double-bezel drafted content card + critic feedback card, floating export button.

Both must feel like the same product. Same palette, same typography, same radius language, same shadow philosophy.
