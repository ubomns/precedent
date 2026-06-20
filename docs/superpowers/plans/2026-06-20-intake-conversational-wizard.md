# Intake Conversational Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-page intake form at `/intake` with a chat-style conversational wizard that collects the same six-field `Brief` and submits it unchanged to `POST /api/generate`.

**Architecture:** A config-driven step engine. A pure `wizard-reducer` holds conversation state (answers, current step, edit mode, status); a thin `use-wizard` hook wraps it with `useReducer` and the async submit side effect. A `STEPS` config drives which question and input renderer is active. Pure logic (`brief.ts` mapping + validators, the reducer) is unit-tested with Vitest; the full conversation is covered by Playwright E2E. Presentation-only change — the `Brief` contract, the 12-section schema, and the submit flow are untouched.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Zustand (existing global store), GSAP (existing motion), Tailwind (existing design system), Playwright (E2E), Vitest (new, unit tests only).

## Global Constraints

- Output `Brief` shape is exactly (`frontend/lib/store.ts`): `project_objective: string`, `stakeholders: {name: string; role: string}[]`, `scope_in: string[]`, `scope_out: string[]`, `target_users: string`, `regulatory_context: string`.
- Submit path is unchanged: `setBrief(brief)` -> `setGenerating(true)` -> `fetch(apiUrl("/api/generate"), { method:"POST", headers: apiHeaders(), body: JSON.stringify(brief) })` -> on ok `setBRD(json.brd)` + `router.push("/review")`; on failure show error + `setGenerating(false)`.
- No new backend route. Intake is fully deterministic; no LLM parsing.
- No persistence: conversation state is in-component only; only the final `Brief` reaches the global store.
- Validation: every field required; stakeholders need at least one row with both name and role. Exact messages: "Project objective is required.", "At least one stakeholder with a name and role is required.", "Scope in is required.", "Scope out is required.", "Target users are required.", "Regulatory context is required."
- Visual: dark only, Geist type, emerald accent <=10% surface, no gradients/glows. Reuse design-system primitives (`Button`, `Card`, `Input`, `TextArea`, `FieldWrapper`, typography, `Nav`). Motion gated on `useReducedMotion()`.
- Accessibility: transcript is `aria-live="polite"`; every input has a real label or `aria-label`; touch targets >=44px; `submitError` banner has `role="alert"`.
- All commands run from `frontend/`.

---

## File Structure

| Path | Responsibility |
|---|---|
| `frontend/vitest.config.ts` | Vitest config (node env, pure-logic unit tests) — NEW |
| `frontend/package.json` | add `vitest` devDep + `test:unit` script — MODIFY |
| `frontend/components/intake/brief.ts` | `WizardAnswers` type, `emptyAnswers`, `createBrief`, `validateStep` — NEW |
| `frontend/components/intake/steps.ts` | `StepKey`, `StepConfig`, `STEPS` (the 6 questions) — NEW |
| `frontend/components/intake/wizard-reducer.ts` | pure `WizardState`, `WizardAction`, `initialState`, `reduce` — NEW |
| `frontend/components/intake/use-wizard.ts` | hook: `useReducer(reduce)` + async submit side effect — NEW |
| `frontend/components/intake/message.tsx` | `AssistantBubble`, `UserBubble`, `renderAnswer` — NEW |
| `frontend/components/intake/inputs/text-input.tsx` | single-line renderer (target users) — NEW |
| `frontend/components/intake/inputs/objective-input.tsx` | textarea renderer (objective, regulatory) — NEW |
| `frontend/components/intake/inputs/scope-input.tsx` | multi-line list renderer (scope in/out) — NEW |
| `frontend/components/intake/inputs/stakeholders-input.tsx` | name+role rows (lifted from old page) — NEW |
| `frontend/components/intake/review-card.tsx` | review summary + per-field edit + Generate CTA — NEW |
| `frontend/components/intake/intake-wizard.tsx` | orchestrator: transcript + composer + review — NEW |
| `frontend/app/intake/page.tsx` | thin shell mounting `<IntakeWizard/>` — REWRITE |
| `frontend/components/intake/brief.test.ts` | Vitest unit tests for brief.ts — NEW |
| `frontend/components/intake/wizard-reducer.test.ts` | Vitest unit tests for the reducer — NEW |
| `frontend/tests/intake.spec.ts` | Playwright E2E for the wizard — REWRITE |

---

## Task 1: Vitest setup + brief.ts (mapping & validators)

**Files:**
- Create: `frontend/vitest.config.ts`
- Modify: `frontend/package.json` (devDependencies + scripts)
- Create: `frontend/components/intake/brief.ts`
- Test: `frontend/components/intake/brief.test.ts`

**Interfaces:**
- Consumes: `Brief` from `frontend/lib/store.ts`.
- Produces:
  - `interface StakeholderRow { id: number; name: string; role: string }`
  - `interface WizardAnswers { objective: string; stakeholders: StakeholderRow[]; scopeIn: string; scopeOut: string; users: string; regulatory: string }`
  - `const emptyAnswers: WizardAnswers`
  - `type StepKey = "objective" | "stakeholders" | "scopeIn" | "scopeOut" | "users" | "regulatory"`
  - `function createBrief(a: WizardAnswers): Brief`
  - `function validateStep(key: StepKey, a: WizardAnswers): string | null`

- [ ] **Step 1: Install Vitest**

Run: `npm install -D vitest@^2.1.0`
Expected: vitest added to devDependencies.

- [ ] **Step 2: Add the unit-test script to package.json**

Add to the `scripts` block in `frontend/package.json`:

```json
    "test:unit": "vitest run",
    "test:unit:watch": "vitest",
```

- [ ] **Step 3: Create vitest.config.ts**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["components/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 4: Write the failing tests (`brief.test.ts`)**

```ts
import { describe, it, expect } from "vitest";
import { createBrief, validateStep, emptyAnswers, type WizardAnswers } from "./brief";

const full: WizardAnswers = {
  objective: "  Expose core banking API  ",
  stakeholders: [
    { id: 1, name: " Priya ", role: " Compliance " },
    { id: 2, name: "", role: "Lead" },
  ],
  scopeIn: "Account read\nPayment init\n",
  scopeOut: "Retail UI\n\nFX",
  users: "  Partner engineers ",
  regulatory: " PSD2, GDPR ",
};

describe("createBrief", () => {
  it("trims strings and drops incomplete stakeholders and empty scope lines", () => {
    expect(createBrief(full)).toEqual({
      project_objective: "Expose core banking API",
      stakeholders: [{ name: "Priya", role: "Compliance" }],
      scope_in: ["Account read", "Payment init"],
      scope_out: ["Retail UI", "FX"],
      target_users: "Partner engineers",
      regulatory_context: "PSD2, GDPR",
    });
  });
});

describe("validateStep", () => {
  it("returns null for a valid step", () => {
    expect(validateStep("objective", full)).toBeNull();
    expect(validateStep("stakeholders", full)).toBeNull();
  });

  it("returns the exact error message for each empty field", () => {
    expect(validateStep("objective", emptyAnswers)).toBe("Project objective is required.");
    expect(validateStep("stakeholders", emptyAnswers)).toBe(
      "At least one stakeholder with a name and role is required."
    );
    expect(validateStep("scopeIn", emptyAnswers)).toBe("Scope in is required.");
    expect(validateStep("scopeOut", emptyAnswers)).toBe("Scope out is required.");
    expect(validateStep("users", emptyAnswers)).toBe("Target users are required.");
    expect(validateStep("regulatory", emptyAnswers)).toBe("Regulatory context is required.");
  });
});
```

- [ ] **Step 5: Run the tests to verify they fail**

Run: `npm run test:unit`
Expected: FAIL — cannot resolve `./brief`.

- [ ] **Step 6: Implement brief.ts**

```ts
import type { Brief } from "@/lib/store";

export interface StakeholderRow {
  id: number;
  name: string;
  role: string;
}

export interface WizardAnswers {
  objective: string;
  stakeholders: StakeholderRow[];
  scopeIn: string;
  scopeOut: string;
  users: string;
  regulatory: string;
}

export type StepKey =
  | "objective"
  | "stakeholders"
  | "scopeIn"
  | "scopeOut"
  | "users"
  | "regulatory";

export const emptyAnswers: WizardAnswers = {
  objective: "",
  stakeholders: [{ id: 1, name: "", role: "" }],
  scopeIn: "",
  scopeOut: "",
  users: "",
  regulatory: "",
};

const toLines = (value: string): string[] =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export function createBrief(a: WizardAnswers): Brief {
  return {
    project_objective: a.objective.trim(),
    stakeholders: a.stakeholders
      .filter((s) => s.name.trim() && s.role.trim())
      .map((s) => ({ name: s.name.trim(), role: s.role.trim() })),
    scope_in: toLines(a.scopeIn),
    scope_out: toLines(a.scopeOut),
    target_users: a.users.trim(),
    regulatory_context: a.regulatory.trim(),
  };
}

export function validateStep(key: StepKey, a: WizardAnswers): string | null {
  switch (key) {
    case "objective":
      return a.objective.trim() ? null : "Project objective is required.";
    case "stakeholders":
      return a.stakeholders.some((s) => s.name.trim() && s.role.trim())
        ? null
        : "At least one stakeholder with a name and role is required.";
    case "scopeIn":
      return a.scopeIn.trim() ? null : "Scope in is required.";
    case "scopeOut":
      return a.scopeOut.trim() ? null : "Scope out is required.";
    case "users":
      return a.users.trim() ? null : "Target users are required.";
    case "regulatory":
      return a.regulatory.trim() ? null : "Regulatory context is required.";
  }
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm run test:unit`
Expected: PASS (2 files? no — 1 file, 3 tests).

- [ ] **Step 8: Commit**

```bash
git add frontend/vitest.config.ts frontend/package.json frontend/package-lock.json frontend/components/intake/brief.ts frontend/components/intake/brief.test.ts
git commit -m "feat(intake): add brief mapping + validators with vitest"
```

---

## Task 2: steps.ts (the six-question config)

**Files:**
- Create: `frontend/components/intake/steps.ts`
- Test: `frontend/components/intake/steps.test.ts`

**Interfaces:**
- Consumes: `StepKey` from `./brief`.
- Produces:
  - `type InputKind = "objective" | "stakeholders" | "scope" | "text"`
  - `interface StepConfig { key: StepKey; index: number; prompt: string; input: InputKind; label: string }`
  - `const STEPS: StepConfig[]` (length 6, indices 0..5)

- [ ] **Step 1: Write the failing test (`steps.test.ts`)**

```ts
import { describe, it, expect } from "vitest";
import { STEPS } from "./steps";

describe("STEPS", () => {
  it("defines six steps in order with unique keys and 0-based indices", () => {
    expect(STEPS).toHaveLength(6);
    expect(STEPS.map((s) => s.key)).toEqual([
      "objective",
      "stakeholders",
      "scopeIn",
      "scopeOut",
      "users",
      "regulatory",
    ]);
    STEPS.forEach((s, i) => expect(s.index).toBe(i));
    expect(STEPS.every((s) => s.prompt.length > 0 && s.label.length > 0)).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test:unit`
Expected: FAIL — cannot resolve `./steps`.

- [ ] **Step 3: Implement steps.ts**

```ts
import type { StepKey } from "./brief";

export type InputKind = "objective" | "stakeholders" | "scope" | "text";

export interface StepConfig {
  key: StepKey;
  index: number;
  prompt: string;
  input: InputKind;
  label: string;
}

export const STEPS: StepConfig[] = [
  {
    key: "objective",
    index: 0,
    prompt: "What are you building, and why now?",
    input: "objective",
    label: "Project objective",
  },
  {
    key: "stakeholders",
    index: 1,
    prompt: "Who are the key stakeholders?",
    input: "stakeholders",
    label: "Stakeholders",
  },
  {
    key: "scopeIn",
    index: 2,
    prompt: "What's in scope?",
    input: "scope",
    label: "Scope in",
  },
  {
    key: "scopeOut",
    index: 3,
    prompt: "And what's explicitly out of scope?",
    input: "scope",
    label: "Scope out",
  },
  {
    key: "users",
    index: 4,
    prompt: "Who are the target users?",
    input: "text",
    label: "Target users",
  },
  {
    key: "regulatory",
    index: 5,
    prompt: "Any regulatory or compliance context?",
    input: "objective",
    label: "Regulatory context",
  },
];

export const REVIEW_STEP = STEPS.length; // 6
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:unit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/intake/steps.ts frontend/components/intake/steps.test.ts
git commit -m "feat(intake): add wizard step config"
```

---

## Task 3: wizard-reducer.ts (pure state machine)

**Files:**
- Create: `frontend/components/intake/wizard-reducer.ts`
- Test: `frontend/components/intake/wizard-reducer.test.ts`

**Interfaces:**
- Consumes: `WizardAnswers`, `StepKey`, `validateStep`, `emptyAnswers` from `./brief`; `STEPS`, `REVIEW_STEP` from `./steps`.
- Produces:
  - `type WizardStatus = "answering" | "review" | "submitting" | "error"`
  - `interface WizardState { answers: WizardAnswers; currentStep: number; editingKey: StepKey | null; status: WizardStatus; stepError: string | null; submitError: string; nextStakeholderId: number }`
  - `type WizardAction` (see implementation)
  - `const initialState: WizardState`
  - `function reduce(state: WizardState, action: WizardAction): WizardState`

- [ ] **Step 1: Write the failing tests (`wizard-reducer.test.ts`)**

```ts
import { describe, it, expect } from "vitest";
import { reduce, initialState, type WizardState } from "./wizard-reducer";
import { type WizardAnswers } from "./brief";

const filled: WizardAnswers = {
  objective: "Build it",
  stakeholders: [{ id: 1, name: "Priya", role: "Compliance" }],
  scopeIn: "A",
  scopeOut: "B",
  users: "Engineers",
  regulatory: "PSD2",
};

const at = (over: Partial<WizardState>): WizardState => ({ ...initialState, ...over });

describe("reduce", () => {
  it("SET_TEXT updates the field and clears errors", () => {
    const s = reduce(at({ stepError: "x", submitError: "y" }), {
      type: "SET_TEXT",
      key: "objective",
      value: "Hello",
    });
    expect(s.answers.objective).toBe("Hello");
    expect(s.stepError).toBeNull();
    expect(s.submitError).toBe("");
  });

  it("SUBMIT_STEP with an invalid step sets stepError and does not advance", () => {
    const s = reduce(initialState, { type: "SUBMIT_STEP" });
    expect(s.currentStep).toBe(0);
    expect(s.stepError).toBe("Project objective is required.");
  });

  it("SUBMIT_STEP with a valid step advances and clears stepError", () => {
    const s = reduce(at({ answers: filled, stepError: "old" }), { type: "SUBMIT_STEP" });
    expect(s.currentStep).toBe(1);
    expect(s.stepError).toBeNull();
  });

  it("SUBMIT_STEP on the last step transitions to review", () => {
    const s = reduce(at({ answers: filled, currentStep: 5 }), { type: "SUBMIT_STEP" });
    expect(s.currentStep).toBe(6);
    expect(s.status).toBe("review");
  });

  it("BACK decrements the step and preserves answers", () => {
    const s = reduce(at({ answers: filled, currentStep: 3 }), { type: "BACK" });
    expect(s.currentStep).toBe(2);
    expect(s.answers).toEqual(filled);
  });

  it("BACK on step 0 is a no-op", () => {
    expect(reduce(initialState, { type: "BACK" }).currentStep).toBe(0);
  });

  it("ADD_STAKEHOLDER appends a row with a fresh id", () => {
    const s = reduce(initialState, { type: "ADD_STAKEHOLDER" });
    expect(s.answers.stakeholders).toHaveLength(2);
    expect(s.answers.stakeholders[1].id).toBe(2);
    expect(s.nextStakeholderId).toBe(3);
  });

  it("REMOVE_STAKEHOLDER will not remove the last remaining row", () => {
    const s = reduce(initialState, { type: "REMOVE_STAKEHOLDER", id: 1 });
    expect(s.answers.stakeholders).toHaveLength(1);
  });

  it("UPDATE_STAKEHOLDER edits a single field by id", () => {
    const s = reduce(initialState, {
      type: "UPDATE_STAKEHOLDER",
      id: 1,
      field: "name",
      value: "Sam",
    });
    expect(s.answers.stakeholders[0].name).toBe("Sam");
  });

  it("EDIT then valid SAVE_EDIT clears editingKey", () => {
    const editing = reduce(at({ answers: filled, currentStep: 6, status: "review" }), {
      type: "EDIT",
      key: "objective",
    });
    expect(editing.editingKey).toBe("objective");
    const saved = reduce(editing, { type: "SAVE_EDIT" });
    expect(saved.editingKey).toBeNull();
    expect(saved.status).toBe("review");
  });

  it("invalid SAVE_EDIT keeps editingKey and sets stepError", () => {
    const editing = reduce(at({ currentStep: 6, status: "review", editingKey: "objective" }), {
      type: "SAVE_EDIT",
    });
    expect(editing.editingKey).toBe("objective");
    expect(editing.stepError).toBe("Project objective is required.");
  });

  it("BEGIN_SUBMIT then SUBMIT_FAILURE surfaces the error", () => {
    const submitting = reduce(at({ status: "review" }), { type: "BEGIN_SUBMIT" });
    expect(submitting.status).toBe("submitting");
    const failed = reduce(submitting, { type: "SUBMIT_FAILURE", message: "Boom" });
    expect(failed.status).toBe("error");
    expect(failed.submitError).toBe("Boom");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm run test:unit`
Expected: FAIL — cannot resolve `./wizard-reducer`.

- [ ] **Step 3: Implement wizard-reducer.ts**

```ts
import {
  emptyAnswers,
  validateStep,
  type StepKey,
  type WizardAnswers,
} from "./brief";
import { STEPS, REVIEW_STEP } from "./steps";

export type WizardStatus = "answering" | "review" | "submitting" | "error";

export interface WizardState {
  answers: WizardAnswers;
  currentStep: number; // 0..5 answering; REVIEW_STEP (6) = review
  editingKey: StepKey | null;
  status: WizardStatus;
  stepError: string | null;
  submitError: string;
  nextStakeholderId: number;
}

export type WizardAction =
  | { type: "SET_TEXT"; key: "objective" | "scopeIn" | "scopeOut" | "users" | "regulatory"; value: string }
  | { type: "ADD_STAKEHOLDER" }
  | { type: "REMOVE_STAKEHOLDER"; id: number }
  | { type: "UPDATE_STAKEHOLDER"; id: number; field: "name" | "role"; value: string }
  | { type: "SUBMIT_STEP" }
  | { type: "BACK" }
  | { type: "EDIT"; key: StepKey }
  | { type: "SAVE_EDIT" }
  | { type: "BEGIN_SUBMIT" }
  | { type: "SUBMIT_FAILURE"; message: string };

export const initialState: WizardState = {
  answers: emptyAnswers,
  currentStep: 0,
  editingKey: null,
  status: "answering",
  stepError: null,
  submitError: "",
  nextStakeholderId: emptyAnswers.stakeholders.length + 1,
};

const clearErrors = { stepError: null, submitError: "" } as const;

export function reduce(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case "SET_TEXT":
      return {
        ...state,
        answers: { ...state.answers, [action.key]: action.value },
        ...clearErrors,
      };

    case "ADD_STAKEHOLDER":
      return {
        ...state,
        answers: {
          ...state.answers,
          stakeholders: [
            ...state.answers.stakeholders,
            { id: state.nextStakeholderId, name: "", role: "" },
          ],
        },
        nextStakeholderId: state.nextStakeholderId + 1,
      };

    case "REMOVE_STAKEHOLDER":
      if (state.answers.stakeholders.length <= 1) return state;
      return {
        ...state,
        answers: {
          ...state.answers,
          stakeholders: state.answers.stakeholders.filter((s) => s.id !== action.id),
        },
      };

    case "UPDATE_STAKEHOLDER":
      return {
        ...state,
        answers: {
          ...state.answers,
          stakeholders: state.answers.stakeholders.map((s) =>
            s.id === action.id ? { ...s, [action.field]: action.value } : s
          ),
        },
        ...clearErrors,
      };

    case "SUBMIT_STEP": {
      if (state.editingKey !== null || state.status !== "answering") return state;
      const step = STEPS[state.currentStep];
      const error = validateStep(step.key, state.answers);
      if (error) return { ...state, stepError: error };
      if (state.currentStep >= STEPS.length - 1) {
        return { ...state, currentStep: REVIEW_STEP, status: "review", stepError: null };
      }
      return { ...state, currentStep: state.currentStep + 1, stepError: null };
    }

    case "BACK":
      if (state.status !== "answering" || state.currentStep <= 0) return state;
      return { ...state, currentStep: state.currentStep - 1, stepError: null };

    case "EDIT":
      return { ...state, editingKey: action.key, stepError: null };

    case "SAVE_EDIT": {
      if (state.editingKey === null) return state;
      const error = validateStep(state.editingKey, state.answers);
      if (error) return { ...state, stepError: error };
      return { ...state, editingKey: null, stepError: null };
    }

    case "BEGIN_SUBMIT":
      return { ...state, status: "submitting", submitError: "" };

    case "SUBMIT_FAILURE":
      return { ...state, status: "error", submitError: action.message };

    default:
      return state;
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npm run test:unit`
Expected: PASS (all reducer + brief + steps tests green).

- [ ] **Step 5: Commit**

```bash
git add frontend/components/intake/wizard-reducer.ts frontend/components/intake/wizard-reducer.test.ts
git commit -m "feat(intake): add pure wizard reducer with unit tests"
```

---

## Task 4: use-wizard.ts (hook = reducer + async submit)

**Files:**
- Create: `frontend/components/intake/use-wizard.ts`

**Interfaces:**
- Consumes: `reduce`, `initialState`, `WizardState`, `WizardAction` from `./wizard-reducer`; `createBrief` from `./brief`; `useAppStore` from `@/lib/store`; `apiUrl`, `apiHeaders` from `@/lib/api`.
- Produces: `function useWizard(): { state: WizardState; dispatch: Dispatch<WizardAction>; generate: () => Promise<void> }`

> No unit test: this hook is a thin `useReducer` + side-effect wrapper that needs a React/DOM runtime. Its behavior (successful submit -> `/review`, failure -> error banner) is covered by the Playwright E2E in Task 10. Keep all branching logic in the reducer (already unit-tested) so this file stays trivial.

- [ ] **Step 1: Implement use-wizard.ts**

```ts
"use client";

import { useCallback, useReducer, type Dispatch } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { apiUrl, apiHeaders } from "@/lib/api";
import {
  reduce,
  initialState,
  type WizardState,
  type WizardAction,
} from "./wizard-reducer";
import { createBrief } from "./brief";

export interface UseWizard {
  state: WizardState;
  dispatch: Dispatch<WizardAction>;
  generate: () => Promise<void>;
}

export function useWizard(): UseWizard {
  const [state, dispatch] = useReducer(reduce, initialState);
  const router = useRouter();
  const { setBrief, setBRD, setGenerating } = useAppStore();

  const generate = useCallback(async () => {
    if (state.status === "submitting") return;

    dispatch({ type: "BEGIN_SUBMIT" });
    setGenerating(true);

    const brief = createBrief(state.answers);
    setBrief(brief);

    try {
      const res = await fetch(apiUrl("/api/generate"), {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify(brief),
      });

      if (!res.ok) {
        const body = await res.text();
        let message = `Server error (${res.status})`;
        try {
          const parsed = JSON.parse(body);
          if (parsed.detail) message = parsed.detail;
          else if (parsed.message) message = parsed.message;
        } catch {
          // keep generic message
        }
        throw new Error(message);
      }

      const data = await res.json();
      setBRD(data.brd);
      router.push("/review");
    } catch (err: any) {
      dispatch({
        type: "SUBMIT_FAILURE",
        message: err?.message || "Failed to generate BRD. Please try again.",
      });
      setGenerating(false);
    }
  }, [state.status, state.answers, router, setBrief, setBRD, setGenerating]);

  return { state, dispatch, generate };
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors in `components/intake/use-wizard.ts`.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/intake/use-wizard.ts
git commit -m "feat(intake): add use-wizard hook"
```

---

## Task 5: message.tsx (transcript bubbles + answer rendering)

**Files:**
- Create: `frontend/components/intake/message.tsx`

**Interfaces:**
- Consumes: `WizardAnswers`, `StepKey` from `./brief`.
- Produces:
  - `function AssistantBubble({ children }: { children: ReactNode }): JSX.Element`
  - `function UserBubble({ onEdit, editLabel, children }: { onEdit?: () => void; editLabel?: string; children: ReactNode }): JSX.Element`
  - `function renderAnswer(key: StepKey, a: WizardAnswers): ReactNode`

- [ ] **Step 1: Implement message.tsx**

```tsx
"use client";

import { type ReactNode } from "react";
import type { StepKey, WizardAnswers } from "./brief";

export function AssistantBubble({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 max-w-[85%]" data-bubble="assistant">
      <span
        aria-hidden="true"
        className="mt-2.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0"
      />
      <div className="rounded-2xl rounded-tl-sm bg-surface-2 border border-white/[0.06] px-4 py-3 text-body text-ink">
        {children}
      </div>
    </div>
  );
}

export function UserBubble({
  onEdit,
  editLabel,
  children,
}: {
  onEdit?: () => void;
  editLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-end gap-1 self-end max-w-[85%]" data-bubble="user">
      <div className="rounded-2xl rounded-br-sm bg-surface border border-white/[0.08] px-4 py-3 text-body text-ink">
        {children}
      </div>
      {onEdit ? (
        <button
          type="button"
          onClick={onEdit}
          aria-label={editLabel}
          className="rounded px-1 text-caption text-tertiary hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Edit
        </button>
      ) : null}
    </div>
  );
}

export function renderAnswer(key: StepKey, a: WizardAnswers): ReactNode {
  switch (key) {
    case "objective":
      return a.objective;
    case "regulatory":
      return a.regulatory;
    case "users":
      return a.users;
    case "stakeholders": {
      const valid = a.stakeholders.filter((s) => s.name.trim() && s.role.trim());
      return (
        <ul className="flex flex-col gap-0.5">
          {valid.map((s, i) => (
            <li key={i}>
              {s.name.trim()} · {s.role.trim()}
            </li>
          ))}
        </ul>
      );
    }
    case "scopeIn":
    case "scopeOut": {
      const source = key === "scopeIn" ? a.scopeIn : a.scopeOut;
      const lines = source
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      return (
        <ul className="list-disc pl-4 flex flex-col gap-0.5">
          {lines.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
      );
    }
  }
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/intake/message.tsx
git commit -m "feat(intake): add transcript bubble components"
```

---

## Task 6: text + textarea input renderers

> Consolidation note: the spec listed `objective-input.tsx` and `scope-input.tsx` separately, but both are textareas differing only in placeholder/hint. This plan ships one generic `textarea-input.tsx` (used for objective, scopeIn, scopeOut, regulatory) plus `text-input.tsx` (single-line, target users). Per-step placeholders/hints live in the composer (Task 9). This is a DRY improvement, not a behavior change.

**Files:**
- Create: `frontend/components/intake/inputs/text-input.tsx`
- Create: `frontend/components/intake/inputs/textarea-input.tsx`

**Interfaces:**
- Consumes: `Input`, `TextArea`, `FieldWrapper` from `@/components/design-system`.
- Produces:
  - `function TextInput(props: TextInputProps): JSX.Element`
  - `function TextareaInput(props: TextareaInputProps): JSX.Element`
  - Shared prop shape: `{ id: string; label: string; value: string; onChange: (v: string) => void; onSubmit: () => void; error?: string | null; autoFocus?: boolean; placeholder?: string }`; `TextareaInputProps` additionally has `hint?: string`.

- [ ] **Step 1: Implement text-input.tsx (Enter submits)**

```tsx
"use client";

import { Input, FieldWrapper } from "@/components/design-system";

export interface TextInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: string | null;
  autoFocus?: boolean;
  placeholder?: string;
}

export function TextInput({
  id,
  label,
  value,
  onChange,
  onSubmit,
  error,
  autoFocus,
  placeholder,
}: TextInputProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} error={error ?? undefined}>
      <Input
        id={id}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        error={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
    </FieldWrapper>
  );
}
```

- [ ] **Step 2: Implement textarea-input.tsx (Cmd/Ctrl+Enter submits, Enter = newline)**

```tsx
"use client";

import { TextArea, FieldWrapper } from "@/components/design-system";

export interface TextareaInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  error?: string | null;
  autoFocus?: boolean;
  placeholder?: string;
  hint?: string;
}

export function TextareaInput({
  id,
  label,
  value,
  onChange,
  onSubmit,
  error,
  autoFocus,
  placeholder,
  hint,
}: TextareaInputProps) {
  return (
    <FieldWrapper label={label} htmlFor={id} hint={hint} error={error ?? undefined}>
      <TextArea
        id={id}
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        error={Boolean(error)}
        className="min-h-[96px] sm:min-h-[120px]"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
    </FieldWrapper>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/components/intake/inputs/text-input.tsx frontend/components/intake/inputs/textarea-input.tsx
git commit -m "feat(intake): add text and textarea input renderers"
```

---

## Task 7: stakeholders-input.tsx (name+role rows)

**Files:**
- Create: `frontend/components/intake/inputs/stakeholders-input.tsx`

**Interfaces:**
- Consumes: `StakeholderRow` from `../brief`; `Button`, `Input`, `FieldWrapper` from `@/components/design-system`; `IconX`, `IconPlus` from `@/components/icons`; `gsap`, `useGSAP`.
- Produces: `function StakeholdersInput(props: StakeholdersInputProps): JSX.Element`
  - `interface StakeholdersInputProps { rows: StakeholderRow[]; error?: string | null; prefersReducedMotion: boolean; onAdd: () => void; onRemove: (id: number) => void; onUpdate: (id: number, field: "name" | "role", value: string) => void }`

> Behavior is lifted from the existing `app/intake/page.tsx` stakeholder block: a fresh row animates in on add; a removed row animates out then calls `onRemove`; the remove button is disabled (and dimmed) when only one row remains; remove buttons keep indexed `aria-label`s. Animations are gated on `prefersReducedMotion`.

- [ ] **Step 1: Implement stakeholders-input.tsx**

```tsx
"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Button, Input, FieldWrapper } from "@/components/design-system";
import { IconX, IconPlus } from "@/components/icons";
import type { StakeholderRow } from "../brief";

export interface StakeholdersInputProps {
  rows: StakeholderRow[];
  error?: string | null;
  prefersReducedMotion: boolean;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: "name" | "role", value: string) => void;
}

export function StakeholdersInput({
  rows,
  error,
  prefersReducedMotion,
  onAdd,
  onRemove,
  onUpdate,
}: StakeholdersInputProps) {
  const rowRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const prevIds = useRef<number[]>(rows.map((r) => r.id));

  // Animate any newly-added row.
  useGSAP(() => {
    if (prefersReducedMotion) {
      prevIds.current = rows.map((r) => r.id);
      return;
    }
    const added = rows.map((r) => r.id).filter((id) => !prevIds.current.includes(id));
    added.forEach((id) => {
      const el = rowRefs.current.get(id);
      if (el) {
        gsap.from(el, { opacity: 0, y: -12, scale: 0.98, duration: 0.25, ease: "power2.out" });
      }
    });
    prevIds.current = rows.map((r) => r.id);
  }, [rows, prefersReducedMotion]);

  const handleRemove = (id: number) => {
    if (rows.length <= 1) return;
    const el = rowRefs.current.get(id);
    if (el && !prefersReducedMotion) {
      gsap.to(el, {
        opacity: 0,
        height: 0,
        marginTop: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          rowRefs.current.delete(id);
          onRemove(id);
        },
      });
    } else {
      rowRefs.current.delete(id);
      onRemove(id);
    }
  };

  return (
    <FieldWrapper label="Stakeholders" hint={`${rows.length} people`} error={error ?? undefined}>
      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <div
            key={row.id}
            ref={(el) => {
              if (el) rowRefs.current.set(row.id, el);
            }}
            className="flex gap-2 sm:gap-3 items-start bg-surface-2 rounded-xl border border-white/[0.06] p-3 sm:p-4 transition-colors hover:border-white/[0.10]"
          >
            <div className="flex-1 min-w-0">
              <Input
                value={row.name}
                onChange={(e) => onUpdate(row.id, "name", e.target.value)}
                placeholder="Name"
                aria-label={`Stakeholder ${index + 1} name`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <Input
                value={row.role}
                onChange={(e) => onUpdate(row.id, "role", e.target.value)}
                placeholder="Role"
                aria-label={`Stakeholder ${index + 1} role`}
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemove(row.id)}
              disabled={rows.length <= 1}
              className={[
                "flex items-center justify-center w-11 h-11 rounded-lg shrink-0",
                "border border-white/10 bg-white/[0.02] text-tertiary",
                "hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                rows.length <= 1 ? "opacity-40 cursor-not-allowed" : "",
              ].join(" ")}
              aria-label={`Remove stakeholder ${index + 1}`}
            >
              <IconX size={14} />
            </button>
          </div>
        ))}

        <Button type="button" variant="secondary" size="md" onClick={onAdd} trailingIcon={<IconPlus size={14} />}>
          Add stakeholder
        </Button>
      </div>
    </FieldWrapper>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/intake/inputs/stakeholders-input.tsx
git commit -m "feat(intake): add stakeholders input renderer"
```

---

## Task 8: review-card.tsx (summary + per-field edit + Generate)

**Files:**
- Create: `frontend/components/intake/review-card.tsx`

**Interfaces:**
- Consumes: `Card`, `Button` from `@/components/design-system`; `IconArrowRight` from `@/components/icons`; `STEPS` from `./steps`; `renderAnswer` from `./message`; `WizardState` from `./wizard-reducer`; `StepKey` from `./brief`.
- Produces: `function ReviewCard({ state, onEdit, onGenerate }: { state: WizardState; onEdit: (key: StepKey) => void; onGenerate: () => void }): JSX.Element`

- [ ] **Step 1: Implement review-card.tsx**

```tsx
"use client";

import { Card, Button } from "@/components/design-system";
import { IconArrowRight } from "@/components/icons";
import { STEPS } from "./steps";
import { renderAnswer } from "./message";
import type { WizardState } from "./wizard-reducer";
import type { StepKey } from "./brief";

export function ReviewCard({
  state,
  onEdit,
  onGenerate,
}: {
  state: WizardState;
  onEdit: (key: StepKey) => void;
  onGenerate: () => void;
}) {
  const submitting = state.status === "submitting";

  return (
    <Card padding="md" className="w-full mt-6" data-testid="review-card">
      <h2 className="text-h3 font-medium text-ink tracking-tight">Review your brief</h2>
      <p className="mt-1 text-body-sm text-secondary">Edit anything before generating.</p>

      <dl className="mt-5 flex flex-col divide-y divide-white/[0.06]">
        {STEPS.map((step) => (
          <div key={step.key} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <dt className="text-caption uppercase tracking-[0.1em] text-secondary font-medium">
                {step.label}
              </dt>
              <dd className="mt-1 text-body text-ink break-words">
                {renderAnswer(step.key, state.answers)}
              </dd>
            </div>
            <button
              type="button"
              onClick={() => onEdit(step.key)}
              aria-label={`Edit ${step.label.toLowerCase()}`}
              className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-caption text-secondary hover:bg-surface-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Edit
            </button>
          </div>
        ))}
      </dl>

      {state.submitError ? (
        <div
          role="alert"
          className="mt-4 rounded-lg bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-sm text-[var(--badge-high-text)]"
        >
          {state.submitError}
        </div>
      ) : null}

      <div className="mt-5">
        <Button
          type="button"
          variant="primary"
          size="lg"
          fullWidth
          loading={submitting}
          onClick={onGenerate}
          trailingIcon={submitting ? undefined : <IconArrowRight size={16} />}
        >
          {submitting ? "Drafting your BRD…" : "Generate BRD"}
        </Button>
        <p className="mt-3 text-center text-caption text-tertiary font-mono tracking-tight">
          Drafter agent · ~30 seconds
        </p>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/intake/review-card.tsx
git commit -m "feat(intake): add review card"
```

---

## Task 9: intake-wizard.tsx (orchestrator)

**Files:**
- Create: `frontend/components/intake/intake-wizard.tsx`

**Interfaces:**
- Consumes: `useWizard` from `./use-wizard`; `useReducedMotion` from `@/hooks/use-reduced-motion`; `STEPS`, `REVIEW_STEP` from `./steps`; `AssistantBubble`, `UserBubble`, `renderAnswer` from `./message`; `ReviewCard` from `./review-card`; `TextInput`, `TextareaInput`, `StakeholdersInput` from `./inputs/*`; `Button` from `@/components/design-system`; `IconArrowRight` from `@/components/icons`; `StepKey` from `./brief`.
- Produces: `function IntakeWizard(): JSX.Element` (default export).

> Rendering rules:
> - Opening assistant line, then for each step with `index < currentStep` an assistant prompt bubble + the user's answer bubble (with an Edit affordance). If a bubble's step is being edited (`editingKey === step.key`), it renders the step's input inline with a Save control instead of the answer bubble.
> - While `status === "answering"` and not editing, the active step renders its prompt bubble plus a composer (the step input + Back/Send).
> - At `status` review/submitting/error, the `ReviewCard` mounts below the transcript. Editing a field from the card sets `editingKey`, so its inline editor appears in the transcript above the card.
> - Transcript is `aria-live="polite"`. Auto-scrolls to newest content. The active input is keyed by `currentStep` so it remounts and `autoFocus` fires each advance.

- [ ] **Step 1: Implement intake-wizard.tsx**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/design-system";
import { IconArrowRight } from "@/components/icons";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { useWizard } from "./use-wizard";
import { STEPS, REVIEW_STEP } from "./steps";
import { AssistantBubble, UserBubble, renderAnswer } from "./message";
import { ReviewCard } from "./review-card";
import { TextInput } from "./inputs/text-input";
import { TextareaInput } from "./inputs/textarea-input";
import { StakeholdersInput } from "./inputs/stakeholders-input";
import type { StepKey } from "./brief";
import type { UseWizard } from "./use-wizard";

const PLACEHOLDERS: Record<StepKey, string> = {
  objective: "What is being built, for whom, and why now?",
  stakeholders: "",
  scopeIn: "What's in scope",
  scopeOut: "What's out of scope",
  users: "Who will use what's built?",
  regulatory: "Standards, jurisdictions, internal policies",
};

const HINTS: Partial<Record<StepKey, string>> = {
  scopeIn: "One item per line",
  scopeOut: "One item per line",
};

function StepInput({
  stepKey,
  wizard,
  prefersReducedMotion,
  onSubmit,
  autoFocus,
}: {
  stepKey: StepKey;
  wizard: UseWizard;
  prefersReducedMotion: boolean;
  onSubmit: () => void;
  autoFocus: boolean;
}) {
  const { state, dispatch } = wizard;
  const step = STEPS.find((s) => s.key === stepKey)!;
  const id = `intake-${stepKey}`;
  const error = state.stepError;

  if (step.input === "stakeholders") {
    return (
      <StakeholdersInput
        rows={state.answers.stakeholders}
        error={error}
        prefersReducedMotion={prefersReducedMotion}
        onAdd={() => dispatch({ type: "ADD_STAKEHOLDER" })}
        onRemove={(rowId) => dispatch({ type: "REMOVE_STAKEHOLDER", id: rowId })}
        onUpdate={(rowId, field, value) =>
          dispatch({ type: "UPDATE_STAKEHOLDER", id: rowId, field, value })
        }
      />
    );
  }

  if (step.input === "text") {
    return (
      <TextInput
        id={id}
        label={step.label}
        value={state.answers.users}
        onChange={(value) => dispatch({ type: "SET_TEXT", key: "users", value })}
        onSubmit={onSubmit}
        error={error}
        autoFocus={autoFocus}
        placeholder={PLACEHOLDERS[stepKey]}
      />
    );
  }

  // step.input === "objective" (objective | regulatory) OR "scope" (scopeIn | scopeOut)
  const textKey = stepKey as "objective" | "regulatory" | "scopeIn" | "scopeOut";
  return (
    <TextareaInput
      id={id}
      label={step.label}
      value={state.answers[textKey]}
      onChange={(value) => dispatch({ type: "SET_TEXT", key: textKey, value })}
      onSubmit={onSubmit}
      error={error}
      autoFocus={autoFocus}
      placeholder={PLACEHOLDERS[stepKey]}
      hint={HINTS[stepKey]}
    />
  );
}

export default function IntakeWizard() {
  const wizard = useWizard();
  const { state, dispatch, generate } = wizard;
  const prefersReducedMotion = useReducedMotion();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [state.currentStep, state.editingKey, state.status, prefersReducedMotion]);

  const answering = state.status === "answering" && state.editingKey === null;
  const atReview = state.currentStep >= REVIEW_STEP;
  const progressLabel = atReview
    ? "Review"
    : `${String(state.currentStep + 1).padStart(2, "0")} / 06`;

  return (
    <div className="w-full sm:max-w-[720px] sm:mx-auto flex flex-col">
      <div className="mb-4 text-caption font-mono text-tertiary tracking-[0.1em]">
        {progressLabel}
      </div>

      <div
        ref={scrollRef}
        aria-live="polite"
        className="flex flex-col gap-4 max-h-[60dvh] overflow-y-auto pr-1"
      >
        <AssistantBubble>Let&apos;s build your brief. First —</AssistantBubble>

        {STEPS.filter((step) => step.index < state.currentStep).map((step) => (
          <div key={step.key} className="flex flex-col gap-2">
            <AssistantBubble>{step.prompt}</AssistantBubble>
            {state.editingKey === step.key ? (
              <div className="flex flex-col gap-2">
                <StepInput
                  stepKey={step.key}
                  wizard={wizard}
                  prefersReducedMotion={prefersReducedMotion}
                  onSubmit={() => dispatch({ type: "SAVE_EDIT" })}
                  autoFocus
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => dispatch({ type: "SAVE_EDIT" })}
                    trailingIcon={<IconArrowRight size={14} />}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <UserBubble
                onEdit={() => dispatch({ type: "EDIT", key: step.key })}
                editLabel={`Edit ${step.label.toLowerCase()}`}
              >
                {renderAnswer(step.key, state.answers)}
              </UserBubble>
            )}
          </div>
        ))}

        {answering ? (
          <AssistantBubble>{STEPS[state.currentStep].prompt}</AssistantBubble>
        ) : null}
      </div>

      {answering ? (
        <div className="mt-4 flex flex-col gap-3">
          <StepInput
            key={state.currentStep}
            stepKey={STEPS[state.currentStep].key}
            wizard={wizard}
            prefersReducedMotion={prefersReducedMotion}
            onSubmit={() => dispatch({ type: "SUBMIT_STEP" })}
            autoFocus
          />
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => dispatch({ type: "BACK" })}
              disabled={state.currentStep === 0}
            >
              Back
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => dispatch({ type: "SUBMIT_STEP" })}
              trailingIcon={<IconArrowRight size={14} />}
            >
              Send
            </Button>
          </div>
        </div>
      ) : null}

      {atReview ? (
        <ReviewCard
          state={state}
          onEdit={(key) => dispatch({ type: "EDIT", key })}
          onGenerate={generate}
        />
      ) : null}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/components/intake/intake-wizard.tsx
git commit -m "feat(intake): add wizard orchestrator"
```

---


## Task 10: rewrite app/intake/page.tsx (thin shell)

**Files:**
- Modify (rewrite): `frontend/app/intake/page.tsx`

**Interfaces:**
- Consumes: `Nav` from `@/components/design-system/nav`; `Eyebrow`, `Heading1`, `BodyLarge` from `@/components/design-system`; default export `IntakeWizard` from `@/components/intake/intake-wizard`.

> The page becomes a server component (no hooks): it renders the existing page shell (vignette, `Nav`, header block, footer) and mounts the client `IntakeWizard`. All form logic that used to live here now lives in the wizard modules.

- [ ] **Step 1: Replace the entire file contents**

```tsx
import { Nav } from "@/components/design-system/nav";
import { Eyebrow, Heading1, BodyLarge } from "@/components/design-system";
import IntakeWizard from "@/components/intake/intake-wizard";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Intake", href: "/intake" },
  { label: "Review", href: "/review" },
  { label: "Export", href: "/export" },
];

export default function IntakePage() {
  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-x-hidden">
      <div
        className="vignette absolute pointer-events-none"
        style={{
          width: 900,
          height: 900,
          top: "35%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <Nav items={NAV_ITEMS} />

      <main className="relative z-0 flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 sm:pb-24">
        <div className="w-full sm:max-w-[720px] sm:mx-auto mb-6 sm:mb-8">
          <Eyebrow>Business Requirements Document Generator</Eyebrow>
          <Heading1 className="mt-4">Start your BRD</Heading1>
          <BodyLarge className="mt-3 text-secondary max-w-[55ch]">
            Answer a few questions and Precedent structures the output into a
            12-section BRD.
          </BodyLarge>
        </div>

        <IntakeWizard />
      </main>

      <footer className="relative z-10 pb-6 pt-2 text-center text-sm text-tertiary">
        Precedent v1 · 2026
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + lint + build**

Run: `npx tsc --noEmit && npm run lint && npm run build`
Expected: all pass; `/intake` builds with no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/app/intake/page.tsx
git commit -m "feat(intake): mount conversational wizard on intake page"
```

---

## Task 11: rewrite Playwright E2E (tests/intake.spec.ts)

**Files:**
- Modify (rewrite): `frontend/tests/intake.spec.ts`

**Interfaces:**
- Consumes: the running app at `/intake`; mocks `**/api/generate`.

> The old tests asserted form labels and a single Generate button; they are replaced by tests that walk the conversation. Selectors are role/label-based on the chat controls. Playwright runs with `reducedMotion: "reduce"`, so no animation waits are needed.

- [ ] **Step 1: Replace the entire file contents**

```ts
import { test, expect, type Page } from "@playwright/test";

const okBrd = {
  brd: {
    executive_summary: { content: { narrative: "Test executive summary." }, feedback: [] },
  },
};

async function mockGenerate(page: Page, onRequest?: (body: any) => void) {
  await page.route("**/api/generate", async (route) => {
    onRequest?.(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(okBrd),
    });
  });
}

// Walk all six steps with valid answers, leaving the wizard on the review card.
async function answerAll(page: Page) {
  await page.getByLabel("Project objective").fill("Expose core banking API to partners");
  await page.getByRole("button", { name: "Send" }).click();

  await page.getByRole("textbox", { name: /Stakeholder 1 name/i }).fill("Priya Anand");
  await page.getByRole("textbox", { name: /Stakeholder 1 role/i }).fill("Head of Compliance");
  await page.getByRole("button", { name: "Send" }).click();

  await page.getByLabel("Scope in").fill("Account read/write\nPayment initiation");
  await page.getByRole("button", { name: "Send" }).click();

  await page.getByLabel("Scope out").fill("Retail UI\nFX execution");
  await page.getByRole("button", { name: "Send" }).click();

  await page.getByLabel("Target users").fill("Engineering teams at fintech partners");
  await page.getByRole("button", { name: "Send" }).click();

  await page.getByLabel("Regulatory context").fill("PSD2, GDPR, FCA");
  await page.getByRole("button", { name: "Send" }).click();

  await expect(page.getByRole("heading", { name: "Review your brief" })).toBeVisible();
}

test.describe("Intake Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/intake");
  });

  test("opens on the first question", async ({ page }) => {
    await expect(page.getByText("What are you building, and why now?")).toBeVisible();
    await expect(page.getByLabel("Project objective")).toBeVisible();
    await expect(page.getByText("01 / 06")).toBeVisible();
  });

  test("blocks advancing past an empty required step", async ({ page }) => {
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByText("Project objective is required.")).toBeVisible();
    // Still on step 1: the stakeholders question has not appeared.
    await expect(page.getByText("Who are the key stakeholders?")).toHaveCount(0);
  });

  test("adds and removes stakeholder rows", async ({ page }) => {
    await page.getByLabel("Project objective").fill("Anything");
    await page.getByRole("button", { name: "Send" }).click();

    await expect(page.getByRole("textbox", { name: /Stakeholder 1 name/i })).toBeVisible();
    await page.getByRole("button", { name: "Add stakeholder" }).click();
    await expect(page.getByRole("textbox", { name: /Stakeholder 2 name/i })).toBeVisible();
    await page.getByRole("button", { name: /Remove stakeholder 2/i }).click();
    await expect(page.getByRole("textbox", { name: /Stakeholder 2 name/i })).toHaveCount(0);
  });

  test("walks the full conversation and generates", async ({ page }) => {
    let authHeader: string | null = null;
    await page.route("**/api/generate", async (route) => {
      authHeader = await route.request().headerValue("authorization");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(okBrd),
      });
    });

    await answerAll(page);
    await page.getByRole("button", { name: "Generate BRD" }).click();

    await expect(page).toHaveURL(/\/review/, { timeout: 15000 });
    expect(authHeader).toBe(`Bearer ${process.env.NEXT_PUBLIC_API_SECRET_KEY}`);
  });

  test("edits an earlier answer in place", async ({ page }) => {
    await page.getByLabel("Project objective").fill("First version");
    await page.getByRole("button", { name: "Send" }).click();

    // The objective bubble now shows; edit it.
    await page.getByRole("button", { name: "Edit project objective" }).click();
    await page.getByLabel("Project objective").fill("Second version");
    await page.getByRole("button", { name: "Save" }).click();

    await expect(page.getByText("Second version")).toBeVisible();
    await expect(page.getByText("First version")).toHaveCount(0);
  });

  test("edits a field from the review card and submits the new value", async ({ page }) => {
    let body: any = null;
    await mockGenerate(page, (b) => {
      body = b;
    });

    await answerAll(page);

    const card = page.getByTestId("review-card");
    await card.getByRole("button", { name: "Edit target users" }).click();
    await page.getByLabel("Target users").fill("Updated user group");
    await page.getByRole("button", { name: "Save" }).click();

    await page.getByRole("button", { name: "Generate BRD" }).click();
    await expect(page).toHaveURL(/\/review/, { timeout: 15000 });
    expect(body.target_users).toBe("Updated user group");
  });
});
```

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: all 6 wizard specs PASS. (The dev server auto-starts on 3001 per `playwright.config.ts`.)

- [ ] **Step 3: Run unit tests + lint + build once more**

Run: `npm run test:unit && npm run lint && npm run build`
Expected: all green.

- [ ] **Step 4: Commit**

```bash
git add frontend/tests/intake.spec.ts
git commit -m "test(intake): rewrite intake E2E for conversational wizard"
```

---

## Self-Review

**Spec coverage:**

- Chat-style, structured-input-per-question, 6 turns -> Tasks 2, 5, 6, 7, 9.
- Edit-in-place + Back -> reducer `EDIT`/`SAVE_EDIT`/`BACK` (Task 3), rendered in Task 9; E2E in Task 11.
- Dedicated review card -> Task 8; reached via reducer review transition (Task 3); E2E in Task 11.
- Config-driven engine -> `steps.ts` (Task 2) + reducer (Task 3).
- Same `Brief` + submit flow -> `brief.ts` (Task 1) + `use-wizard.ts` (Task 4).
- Visual/motion/a11y -> bubbles (Task 5), inputs (Tasks 6, 7), `aria-live`, labels, `role="alert"`, reduced-motion gating (Tasks 7, 9).
- Test rewrite + unit coverage -> Tasks 1, 3, 11.

**Type consistency:** `WizardAnswers`/`StakeholderRow`/`StepKey` defined in `brief.ts` and reused everywhere; `WizardState`/`WizardAction` from `wizard-reducer.ts`; `SET_TEXT` key union (`objective|scopeIn|scopeOut|users|regulatory`) matches the `textKey`/`users` dispatches in Task 9; `STEPS`/`REVIEW_STEP` consistent between `steps.ts`, reducer, and orchestrator. `IntakeWizard` is a default export (Task 9) and imported as default (Task 10).

**Placeholder scan:** No TBD/TODO; every code step contains complete content. Error messages and copy are literal.

**Known follow-ups (out of scope, not blockers):** opening-line/bubble GSAP entrance is intentionally minimal (auto-scroll only) to keep tests deterministic; richer per-bubble entrance animation can be layered on later behind `useReducedMotion()` without changing structure.

---

## Execution Handoff

Plan complete. Two execution options:

1. **Subagent-Driven (recommended)** — dispatch a fresh subagent per task, review between tasks.
2. **Inline Execution** — execute tasks in this session with checkpoints.

> Blocker: implementation writes `.ts`/`.tsx` files, which the Semgrep Guardian hook currently blocks. Resolve the Guardian login before execution.
