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
