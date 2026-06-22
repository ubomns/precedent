import { describe, it, expect } from "vitest";
import { sanitizeNext } from "./next-param";

describe("sanitizeNext", () => {
  it("defaults to /intake when missing", () => {
    expect(sanitizeNext(null)).toBe("/intake");
    expect(sanitizeNext(undefined)).toBe("/intake");
    expect(sanitizeNext("")).toBe("/intake");
  });

  it("allows same-origin relative paths", () => {
    expect(sanitizeNext("/review")).toBe("/review");
    expect(sanitizeNext("/export?x=1")).toBe("/export?x=1");
  });

  it("rejects protocol-relative and absolute URLs", () => {
    expect(sanitizeNext("//evil.com")).toBe("/intake");
    expect(sanitizeNext("https://evil.com")).toBe("/intake");
    expect(sanitizeNext("http://evil.com")).toBe("/intake");
  });

  it("rejects backslash and non-leading-slash inputs", () => {
    expect(sanitizeNext("/\\evil.com")).toBe("/intake");
    expect(sanitizeNext("evil")).toBe("/intake");
  });
});
