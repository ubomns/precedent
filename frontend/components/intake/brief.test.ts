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
