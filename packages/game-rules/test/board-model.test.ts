import { describe, expect, it } from "vitest";

import {
  createInitialGameState,
  createInitialPieces,
  getEntryIndexForSeat,
  getTrackLength
} from "../src/index.js";

describe("board model", () => {
  it("computes track length from player count and board spacing", () => {
    expect(getTrackLength("free_for_all")).toBe(64);
    expect(getTrackLength("3v3")).toBe(96);
    expect(getTrackLength("4v4")).toBe(128);
  });

  it("maps seat entry indexes with fixed spacing", () => {
    expect(getEntryIndexForSeat("2v2", 0)).toBe(0);
    expect(getEntryIndexForSeat("2v2", 1)).toBe(16);
    expect(getEntryIndexForSeat("2v2", 2)).toBe(32);
    expect(getEntryIndexForSeat("2v2", 3)).toBe(48);
  });

  it("throws when seat index is outside mode bounds", () => {
    expect(() => getEntryIndexForSeat("3v3", 6)).toThrowError(/outside mode 3v3/);
  });

  it("creates the expected initial piece state with explicit booleans", () => {
    const pieces = createInitialPieces("2v2v2");

    expect(pieces).toHaveLength(24);
    expect(pieces[0]).toMatchObject({
      id: "seat-0-piece-0",
      ownerSeatIndex: 0,
      boardIndex: null,
      homeIndex: null,
      isInStart: true,
      isOnBoard: false,
      isInHome: false,
      isImmune: false,
      hasCompletedLap: false
    });

    expect(pieces.at(-1)).toMatchObject({
      id: "seat-5-piece-3",
      ownerSeatIndex: 5,
      isInStart: true
    });
  });

  it("creates the initial game state with round and hand cycle start", () => {
    const state = createInitialGameState("free_for_all");

    expect(state.mode).toBe("free_for_all");
    expect(state.turnSeatIndex).toBe(0);
    expect(state.roundNumber).toBe(1);
    expect(state.handSize).toBe(6);
    expect(state.pieces).toHaveLength(16);
  });
});
