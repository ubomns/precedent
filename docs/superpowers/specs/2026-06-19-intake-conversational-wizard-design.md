# Intake Conversational Wizard — Design Spec

> Date: 2026-06-19
> Status: Approved (design); pending implementation plan
> Scope: Replace the single-page intake form at `/intake` with a chat-style
> conversational wizard. Presentation-only change over the existing `Brief`
> contract and `POST /api/generate` flow.
> Source context: `docs/DESIGN-SPEC.md`, `CLAUDE.md`, current
> `frontend/app/intake/page.tsx`, `frontend/lib/store.ts`.

---

## 1. Goal & Constraints

Replace the existing 4-section intake **form** with a **chat-style conversational
wizard**: the assistant asks one question at a time, the user answers via a
structured input, and the answer renders as a reply bubble in a transcript.

**Hard constraints (do not change):**

- The wizard must produce the exact same `Brief` payload as today
  (`frontend/lib/store.ts`):
  `project_objective` (string), `stakeholders` (`{name, role}[]`),
  `scope_in` (string[]), `scope_out` (string[]), `target_users` (string),
  `regulatory_context` (string).
- The submit path is unchanged: `setBrief` -> `setGenerating(true)` ->
  `POST /api/generate` (with `apiHeaders()`) -> `setBRD(resp.brd)` ->
  `router.push("/review")`.
- No new backend route. Intake stays fully deterministic — **no LLM parsing.**
- No new persistence. Per-conversation state is ephemeral, consistent with the
  app's existing no-persistence Zustand model. Only the final `Brief` touches
  the global store.
- Validation rules are identical to the current form: every field required;
  stakeholders need >=1 row with both name and role.
- Visual language follows `DESIGN.md` / `DESIGN-SPEC.md`: dark only, Geist type,
  emerald accent <=10% surface area, no gradients/glows. The chat must read as a
  precise instrument, not a toy chatbot.

**Decisions locked during brainstorming:**

1. Feel: **chat-style conversation** (message bubbles), not typeform-style prompts.
2. Answer capture: **structured input per question** (deterministic), not free text.
3. Granularity: **6 turns, one field each.**
4. Editing: **edit-in-place on answer bubbles** + a **Back** control.
5. Final step: **dedicated review card** before Generate.
6. Architecture: **config-driven step engine.**

---

## 2. Architecture & File Structure

Config-driven engine under the existing `/intake` route. One `STEPS` config is
the single source of truth (mirrors how the backend treats `SECTION_SCHEMAS`).

```
app/intake/page.tsx              # thin: page shell, Nav, vignette, footer; mounts <IntakeWizard/>
components/intake/
  intake-wizard.tsx              # orchestrator: transcript + active composer + review card
  use-wizard.ts                  # state machine hook (answers, currentStep, edit mode, status)
  steps.ts                       # STEPS config — the 6 questions
  message.tsx                    # AssistantBubble / UserBubble transcript primitives
  inputs/
    objective-input.tsx          # textarea renderer (used by objective + regulatory)
    stakeholders-input.tsx       # name+role rows (logic lifted from today's page.tsx)
    scope-input.tsx              # multi-line list renderer (used by scope in + scope out)
    text-input.tsx               # single-line renderer (target users)
  review-card.tsx                # review/summary card with per-field edit + Generate CTA
  brief.ts                       # createBrief() + per-field validators (moved from page.tsx)
```

**Unit responsibilities:**

- `brief.ts` — pure functions: `createBrief(answers): Brief` and field validators.
  Imported by both the wizard and tests so the deterministic mapping has one home.
- `use-wizard.ts` — all conversation state + transitions; no JSX.
- `steps.ts` — declarative list; reordering/rewording a question is a data edit.
- `intake-wizard.tsx` — composes the above; renders transcript, active composer,
  and (at review) the review card. Owns auto-scroll and animation gating.
- input renderers — each is a small focused component behind one interface.

**STEPS entry shape:**

```ts
type StepKey = "objective" | "stakeholders" | "scopeIn" | "scopeOut" | "users" | "regulatory";

interface Step {
  key: StepKey;
  prompt: string;                       // assistant question text
  input: "objective" | "stakeholders" | "scope" | "text";
  validate: (value: AnswerValue) => string | null;   // null = valid
  toAnswerSummary: (value: AnswerValue) => ReactNode; // how the user bubble renders
}
```

---

## 3. State Machine & Flow

`use-wizard.ts` owns:

```ts
answers: {
  objective: string;
  stakeholders: { id: number; name: string; role: string }[];
  scopeIn: string;
  scopeOut: string;
  users: string;
  regulatory: string;
};
currentStep: number;            // 0..5 while answering, 6 = review
editingKey: StepKey | null;     // when set, an earlier bubble is editing inline
status: "answering" | "review" | "submitting" | "error";
submitError: string;
```

**Flow:**

1. **Mount** -> opening assistant line ("Let's build your brief. First —"), then
   step 0's question bubble + its input. Progress shows `01 / 06`.
2. **Answer + Send** -> validate active value. Invalid -> inline error under the
   input, no advance. Valid -> answer renders as user bubble, next question's
   assistant bubble animates in, `currentStep++`, composer morphs to next
   renderer, focus moves to it.
3. **Back** -> `currentStep - 1`, re-opening that step pre-filled. Later answers
   are preserved (not discarded). Disabled on step 0.
4. **Edit-in-place** -> edit affordance on an answered bubble sets `editingKey`;
   that bubble swaps to its input inline. Save validates and writes back to
   `answers` without changing `currentStep`. Independent of Back. If editing
   while on the review card, saving returns to the review card.
5. **After step 5 answered** -> `status: "review"`; transcript scrolls up and the
   dedicated review card mounts.
6. **Generate** (review card only) -> `status: "submitting"`; build `Brief` via
   `createBrief`; `setBrief`; `setGenerating(true)`; `POST /api/generate`.
   - Success -> `setBRD(resp.brd)` -> `router.push("/review")`.
   - Failure -> `status: "error"`, `submitError` set, banner on card,
     `setGenerating(false)`, CTA returns to idle.

**Edge cases:** can't Send empty/invalid; Back disabled on step 0; reload loses
progress (matches existing app behavior — no persistence added); editing a bubble
from the review card returns to the review card after save.

---

## 4. Steps, Input Renderers & Review Card

### 4.1 The six steps

| # | key | Prompt | Renderer | Brief field | Mapping |
|---|---|---|---|---|---|
| 01 | objective | "What are you building, and why now?" | objective (textarea) | `project_objective` | trimmed string |
| 02 | stakeholders | "Who are the key stakeholders?" | stakeholders (rows) | `stakeholders[]` | rows with both name+role, trimmed |
| 03 | scopeIn | "What's in scope?" | scope (multi-line) | `scope_in[]` | split on newline, trim, drop empties |
| 04 | scopeOut | "And what's explicitly out of scope?" | scope (multi-line) | `scope_out[]` | split on newline, trim, drop empties |
| 05 | users | "Who are the target users?" | text (single-line) | `target_users` | trimmed string |
| 06 | regulatory | "Any regulatory or compliance context?" | objective (textarea) | `regulatory_context` | trimmed string |

### 4.2 Input renderer contract

Each renderer: `(value, onChange, onSubmit, error, autoFocus) => JSX`, built from
existing design-system primitives (`TextArea`, `Input`, `Button`, `FieldWrapper`).
Renders inside a stable "composer" area below the transcript.

- **objective / text inputs** — reuse `TextArea` / `Input`.
  - Single-line `text-input`: Enter sends.
  - Multi-line textarea: Cmd/Ctrl+Enter sends; plain Enter = newline.
- **stakeholders-input** — lifts the exact add/remove-row logic from today's
  `page.tsx` (GSAP row mount 250ms / unmount 200ms, 44px remove buttons with
  indexed `aria-label`s, >=1 row). Sent answer summarizes as "N people".
- **scope-input** — one `TextArea`, one item per line; user bubble renders the
  lines as a tidy list.

### 4.3 User-bubble summaries

`toAnswerSummary` per step controls transcript rendering of the sent answer:

- objective / regulatory / users -> the text.
- stakeholders -> "Jane Doe (Sponsor), Sam Lee (Eng Lead)".
- scope -> bulleted lines.

Every answered bubble carries an edit affordance (real `<button>`).

### 4.4 Review card

`review-card.tsx` mounts at `status: "review"`. A single `Card` titled
"Review your brief" listing all six fields with their values and a per-field
**Edit** button (named per field, e.g. "Edit project objective") that jumps to
that step's input. Below the list:

- `submitError` banner — reused styling, `role="alert"`.
- Primary **Generate BRD** CTA — `size="lg"`, `fullWidth`, loading state ->
  "Drafting your BRD…".
- Helper text — "Drafter agent · ~30 seconds".

Generate lives **only** here.

---

## 5. Visual, Motion & Accessibility

### 5.1 Layout & visual

- Keeps the page shell from today's page: decorative vignette, shared `Nav`
  (fixed top), footer ("Precedent v1 · 2026").
- Centered column, `sm:max-w-[720px]`, gutters `px-4 -> sm:px-6 -> lg:px-8`, top
  padding clears the nav (`pt-24 sm:pt-28`).
- Transcript scrolls within the page; the composer sits in a stable area beneath
  it so the input doesn't jump as the transcript grows. Auto-scroll to newest on
  advance.
- Assistant bubbles: `bg-surface-2`, hairline border, small emerald marker dot,
  left-aligned. User bubbles: `bg-surface`, right-aligned, with edit affordance.
  No avatars, no gradients. Emerald appears only on the active marker, Send icon
  well, and Generate CTA (<=10% surface).
- Progress `01 / 06` in mono at the top of the column.

### 5.2 Motion (all gated on `useReducedMotion()`)

| Element | Property | Duration | Easing |
|---|---|---|---|
| New bubble enter | opacity 0,y8 -> 1,0 | 250ms | power2.out |
| Stakeholder row add | opacity 0,y-12,scale .98 -> 1 | 250ms | power2.out |
| Stakeholder row remove | opacity/height/margin -> 0 | 200ms | power2.in |
| Review card mount | fade + scale in | ~300ms | power2.out |

Reduced motion -> instant final state everywhere.

### 5.3 Accessibility (WCAG 2.2 AA)

- Transcript is an `aria-live="polite"` log region; each new question is announced.
- Composer input receives focus on each advance.
- Every input has a real `<label>` or `aria-label`; stakeholder remove buttons
  keep indexed `aria-label`s.
- Touch targets >=44px (Send, Back, edit, remove).
- Edit affordances and review edit buttons are real `<button>`s with descriptive
  labels.
- `submitError` banner is `role="alert"`.
- All animations honor `prefers-reduced-motion`.

---

## 6. Testing

Playwright. The existing 4 intake tests assume the form and **will be rewritten**;
selectors become role/label-based on the new chat controls.

1. **Full conversation** — answer all 6 steps via the composer, reach review,
   mock `/api/generate` (preserve the existing `Authorization: Bearer` header
   assertion), click Generate, assert redirect to `/review`.
2. **Validation** — Send empty on a step -> inline error, no advance.
3. **Stakeholders** — add/remove rows within step 02.
4. **Edit-in-place** — edit an answered bubble; verify the new value flows into
   the submitted brief.
5. **Review edit** — from the review card, edit a field and confirm it persists
   into the submitted brief.

Plus direct coverage of `brief.ts` (`createBrief` + validators) now that the
mapping is isolated.

---

## 7. Out of Scope

- Any change to the `Brief` contract, the 12-section schema, or backend routes.
- LLM-based natural-language intake parsing.
- Persistence / resume of an in-progress conversation across reloads.
- Light mode.
- Changes to `/review` or `/export`.
- Reworking the shared `Nav` (its hamburger touch-target note from DESIGN-SPEC
  remains a separate concern).

---

## 8. Open Questions

None outstanding. All interaction decisions were resolved during brainstorming
(see section 1 decisions list). Minor visual defaults (progress style, bubble
tones, keyboard shortcuts) are specified above and may be tuned during
implementation without re-approval.
