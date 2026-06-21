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
