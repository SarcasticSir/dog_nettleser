import type { PlayerIdentity } from "@dog/shared-types";

export interface PersistedUser extends PlayerIdentity {
  createdAtIso: string;
}
