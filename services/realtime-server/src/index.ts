import type { GameMode, RoomSeat } from "@dog/shared-types";
import { validateMode } from "@dog/game-rules";

export interface RoomConfig {
  roomId: string;
  mode: GameMode;
  seats: RoomSeat[];
}

export function createRoomConfig(config: RoomConfig): RoomConfig {
  return {
    ...config,
    mode: validateMode(config.mode)
  };
}
