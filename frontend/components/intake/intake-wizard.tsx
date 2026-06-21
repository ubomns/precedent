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
