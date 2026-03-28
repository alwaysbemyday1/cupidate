import type { CupidateProfile, MatchCandidate } from "../../../domain/matching/types";

export const MY_CUPID_ID = "cupid-me";
export const CONNECTED_CUPID_ID = "cupid-connected-1";

export type AppView = "home" | "network" | "matching" | "my";
export type NetworkSegment = "cupidates" | "cupids";
export type MatchRequestStatus = "requested" | "accepted" | "rejected" | "completed";

export type CupidateRecord = CupidateProfile & {
  displayName: string;
  gender: string;
  bio: string;
};

export type CupidConnection = {
  cupidId: string;
  name: string;
  region: string;
  status: "connected" | "pending" | "blocked";
};

export type MatchRequest = {
  id: string;
  sourceCupidateId: string;
  targetCupidateId: string;
  status: MatchRequestStatus;
  createdAt: string;
};

export type ValidationErrors = {
  displayName?: string;
  birthYear?: string;
  gender?: string;
  preferredAgeRange?: string;
  height?: string;
  preferredHeightRange?: string;
};

export type HomeSummary = {
  myCupidates: number;
  connectedCupids: number;
  recommendations: number;
  pendingRequests: number;
};

export type RecommendationItem = MatchCandidate;
