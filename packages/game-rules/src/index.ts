import type { GameMode, GameState, ModeConfig, PieceState } from "@dog/shared-types";

export interface BoardLayout {
  readonly spacesBetweenEntries: number;
  readonly piecesPerPlayer: number;
  readonly homeLaneLength: number;
}

export const DEFAULT_BOARD_LAYOUT: BoardLayout = {
  spacesBetweenEntries: 16,
  piecesPerPlayer: 4,
  homeLaneLength: 4
};

const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  free_for_all: {
    mode: "free_for_all",
    playerCount: 4,
    teamCount: 4,
    seatsPerTeam: 1
  },
  "2v2": {
    mode: "2v2",
    playerCount: 4,
    teamCount: 2,
    seatsPerTeam: 2
  },
  "3v3": {
    mode: "3v3",
    playerCount: 6,
    teamCount: 2,
    seatsPerTeam: 3
  },
  "2v2v2": {
    mode: "2v2v2",
    playerCount: 6,
    teamCount: 3,
    seatsPerTeam: 2
  },
  "4v4": {
    mode: "4v4",
    playerCount: 8,
    teamCount: 2,
    seatsPerTeam: 4
  }
};

export function validateMode(mode: GameMode): GameMode {
  return mode;
}

export function getModeConfig(mode: GameMode): ModeConfig {
  return MODE_CONFIGS[mode];
}

export function getTrackLength(mode: GameMode, layout: BoardLayout = DEFAULT_BOARD_LAYOUT): number {
  return getModeConfig(mode).playerCount * layout.spacesBetweenEntries;
}

export function getEntryIndexForSeat(
  mode: GameMode,
  seatIndex: number,
  layout: BoardLayout = DEFAULT_BOARD_LAYOUT
): number {
  const { playerCount } = getModeConfig(mode);

  if (seatIndex < 0 || seatIndex >= playerCount) {
    throw new Error(`Seat index ${seatIndex} is outside mode ${mode} player range 0-${playerCount - 1}`);
  }

  return seatIndex * layout.spacesBetweenEntries;
}

export function createInitialPieces(
  mode: GameMode,
  layout: BoardLayout = DEFAULT_BOARD_LAYOUT
): PieceState[] {
  const { playerCount } = getModeConfig(mode);

  return Array.from({ length: playerCount }, (_, seatIndex) => {
    return Array.from({ length: layout.piecesPerPlayer }, (_, pieceNumber) => {
      return {
        id: `seat-${seatIndex}-piece-${pieceNumber}`,
        ownerSeatIndex: seatIndex,
        boardIndex: null,
        homeIndex: null,
        isInStart: true,
        isOnBoard: false,
        isInHome: false,
        isImmune: false,
        hasCompletedLap: false
      };
    });
  }).flat();
}

export function createInitialGameState(mode: GameMode): GameState {
  return {
    mode,
    turnSeatIndex: 0,
    roundNumber: 1,
    handSize: 6,
    pieces: createInitialPieces(mode)
  };
}
