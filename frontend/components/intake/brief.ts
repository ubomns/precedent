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
