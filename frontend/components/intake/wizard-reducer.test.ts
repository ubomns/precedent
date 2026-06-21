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
