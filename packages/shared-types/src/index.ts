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
