import { describe, expect, it } from "vitest";

import { validateMode } from "../src/index.js";

describe("validateMode", () => {
  it("returns the same mode for currently supported values", () => {
    expect(validateMode("free_for_all")).toBe("free_for_all");
    expect(validateMode("2v2")).toBe("2v2");
    expect(validateMode("3v3")).toBe("3v3");
    expect(validateMode("2v2v2")).toBe("2v2v2");
    expect(validateMode("4v4")).toBe("4v4");
  });
});
