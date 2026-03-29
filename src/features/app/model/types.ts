import type { CupidateProfile, MatchCandidate } from "../../../domain/matching/types";

export const MY_CUPID_ID = "cupid-me";
export const CONNECTED_CUPID_ID = "cupid-connected-1";

export type AppView = "home" | "network" | "matching" | "my";
export type NetworkSegment = "board" | "cupidates" | "cupids";
export type MatchRequestStatus = "requested" | "accepted" | "rejected" | "completed";

export type CupidateRecord = CupidateProfile & {
  displayName: string;
  gender: string;
  bio: string;
  isActive: boolean;
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

export type HomeNotification = {
  id: string;
  sourceLabel: string;
  targetLabel: string;
  status: MatchRequestStatus;
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

export type SelectedProfileTarget =
  | {
      kind: "cupid";
      cupidId: string;
    }
  | {
      kind: "cupidate";
      cupidateId: string;
    };

export type CupidProfileSummary = {
  kind: "cupid";
  cupidId: string;
  nickname: string;
  relationship: "self" | "connected" | "pending" | "blocked" | "discoverable";
  stats: {
    cupidateCount: number;
    activeCupidateCount: number;
    introductions: number;
    ongoingMatches: number;
    completedMatches: number;
  };
};

export type CupidateProfileSummary = {
  kind: "cupidate";
  cupidateId: string;
  ownerCupidId: string;
  ownerNickname: string;
  displayName: string;
  birthYear: number | null;
  gender: string;
  bio: string;
  isActive: boolean;
  region: CupidateRecord["region"];
  jobTitle: CupidateRecord["jobTitle"];
  heightCm: CupidateRecord["heightCm"];
  smokingHabit: CupidateRecord["smokingHabit"];
  drinkingHabit: CupidateRecord["drinkingHabit"];
  preferredAgeRange: CupidateRecord["preferredAgeRange"];
  preferredRegions: CupidateRecord["preferredRegions"];
  preferredJobGroups: CupidateRecord["preferredJobGroups"];
  preferredSmoking: CupidateRecord["preferredSmoking"];
  preferredDrinking: CupidateRecord["preferredDrinking"];
  preferredGenders: CupidateRecord["preferredGenders"];
  preferredHeightRange: CupidateRecord["preferredHeightRange"];
  preferences: CupidateRecord["preferences"];
  canEdit: boolean;
  stats: {
    totalRequests: number;
    ongoingMatches: number;
    completedMatches: number;
  };
};

export type SelectedProfileSummary = CupidProfileSummary | CupidateProfileSummary | null;

export type CupidateProfileDraft = {
  cupidateId: string;
  displayName: string;
  birthYear: number | null;
  gender: string;
  bio: string;
  isActive: boolean;
  region?: CupidateRecord["region"];
  jobTitle?: CupidateRecord["jobTitle"];
  heightCm?: CupidateRecord["heightCm"];
  smokingHabit?: CupidateRecord["smokingHabit"];
  drinkingHabit?: CupidateRecord["drinkingHabit"];
  preferredAgeRange?: CupidateRecord["preferredAgeRange"];
  preferredRegions?: CupidateRecord["preferredRegions"];
  preferredJobGroups?: CupidateRecord["preferredJobGroups"];
  preferredSmoking?: CupidateRecord["preferredSmoking"];
  preferredDrinking?: CupidateRecord["preferredDrinking"];
  preferredGenders?: CupidateRecord["preferredGenders"];
  preferredHeightRange?: CupidateRecord["preferredHeightRange"];
  preferences: CupidateRecord["preferences"];
};
