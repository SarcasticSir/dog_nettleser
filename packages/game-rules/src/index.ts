import type { GameMode } from "@dog/shared-types";

export interface BoardLayout {
  readonly spacesBetweenEntries: number;
  readonly piecesPerPlayer: number;
}

export const DEFAULT_BOARD_LAYOUT: BoardLayout = {
  spacesBetweenEntries: 16,
  piecesPerPlayer: 4
};

export function validateMode(mode: GameMode): GameMode {
  return mode;
}
