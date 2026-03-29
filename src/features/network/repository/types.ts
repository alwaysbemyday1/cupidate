import type { PreferenceData } from "../../../domain/matching/types";

export type ConnectionStatus = "pending" | "accepted" | "rejected" | "blocked";

export type CurrentCupid = {
  id: string;
  nickname: string;
};

export type DiscoverableCupid = {
  id: string;
  nickname: string;
};

export type NetworkCupidate = {
  id: string;
  ownerCupidId: string;
  displayName: string;
  birthYear: number | null;
  gender: string | null;
  bio: string | null;
  isActive: boolean;
  preferences: PreferenceData;
  createdAt: string;
  updatedAt: string;
};

export type NetworkConnection = {
  id: string;
  requesterCupidId: string;
  addresseeCupidId: string;
  status: ConnectionStatus;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
  direction: "outbound" | "inbound";
  counterpartCupidId: string;
  counterpartNickname: string | null;
};

export type CreateCupidateInput = {
  displayName: string;
  birthYear?: number | null;
  gender?: string | null;
  bio?: string | null;
  isActive?: boolean;
  preferences?: PreferenceData;
};

export type CreateConnectionInput = {
  addresseeCupidId: string;
};

export type UpdateConnectionStatusInput = {
  connectionId: string;
  status: Exclude<ConnectionStatus, "pending">;
};

export interface NetworkRepository {
  getCurrentCupid(): Promise<CurrentCupid | null>;
  searchCupids(query: string): Promise<DiscoverableCupid[]>;
  upsertCurrentCupidNickname(nickname: string): Promise<CurrentCupid>;
  listCupidates(): Promise<NetworkCupidate[]>;
  createCupidate(input: CreateCupidateInput): Promise<NetworkCupidate>;
  listConnections(): Promise<NetworkConnection[]>;
  createConnection(input: CreateConnectionInput): Promise<NetworkConnection>;
  updateConnectionStatus(input: UpdateConnectionStatusInput): Promise<NetworkConnection>;
}
