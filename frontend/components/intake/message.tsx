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
      <div className="rounded-2xl rounded-tl-sm bg-surface-2 border border-border px-4 py-3 text-body text-ink">
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
      <div className="rounded-2xl rounded-br-sm bg-surface border border-border-strong px-4 py-3 text-body text-ink">
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
