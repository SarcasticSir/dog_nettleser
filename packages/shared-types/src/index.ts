export type GameMode = "free_for_all" | "2v2" | "3v3" | "2v2v2" | "4v4";

export interface PlayerIdentity {
  id: string;
  displayName: string;
}

export interface RoomSeat {
  seatIndex: number;
  playerId: string;
  teamIndex: number | null;
}

export interface ModeConfig {
  mode: GameMode;
  playerCount: number;
  teamCount: number;
  seatsPerTeam: number;
}

export interface PieceState {
  id: string;
  ownerSeatIndex: number;
  boardIndex: number | null;
  homeIndex: number | null;
  isInStart: boolean;
  isOnBoard: boolean;
  isInHome: boolean;
  isImmune: boolean;
  hasCompletedLap: boolean;
}

export interface GameState {
  mode: GameMode;
  turnSeatIndex: number;
  roundNumber: number;
  handSize: number;
  pieces: PieceState[];
}
