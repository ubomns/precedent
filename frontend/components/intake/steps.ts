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
