import { describe, expect, it } from "vitest";

import { getModeConfig, validateMode } from "../src/index.js";

describe("validateMode", () => {
  it("returns the same mode for currently supported values", () => {
    expect(validateMode("free_for_all")).toBe("free_for_all");
    expect(validateMode("2v2")).toBe("2v2");
    expect(validateMode("3v3")).toBe("3v3");
    expect(validateMode("2v2v2")).toBe("2v2v2");
    expect(validateMode("4v4")).toBe("4v4");
  });
});

describe("getModeConfig", () => {
  it("maps each mode to the expected team/player shape", () => {
    expect(getModeConfig("free_for_all")).toEqual({
      mode: "free_for_all",
      playerCount: 4,
      teamCount: 4,
      seatsPerTeam: 1
    });

    expect(getModeConfig("2v2")).toEqual({
      mode: "2v2",
      playerCount: 4,
      teamCount: 2,
      seatsPerTeam: 2
    });

    expect(getModeConfig("3v3")).toEqual({
      mode: "3v3",
      playerCount: 6,
      teamCount: 2,
      seatsPerTeam: 3
    });

    expect(getModeConfig("2v2v2")).toEqual({
      mode: "2v2v2",
      playerCount: 6,
      teamCount: 3,
      seatsPerTeam: 2
    });

    expect(getModeConfig("4v4")).toEqual({
      mode: "4v4",
      playerCount: 8,
      teamCount: 2,
      seatsPerTeam: 4
    });
  });
});
