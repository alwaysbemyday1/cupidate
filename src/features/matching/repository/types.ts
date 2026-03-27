export type MatchingStatus = "proposed" | "accepted" | "dismissed";

export type MatchingCandidate = {
  id: string;
  sourceCupidateId: string;
  targetCupidateId: string;
  matchScore: number;
  status: MatchingStatus;
  reason: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type UpsertMatchingCandidateInput = {
  sourceCupidateId: string;
  targetCupidateId: string;
  matchScore: number;
  reason: Record<string, unknown>;
};

export type UpdateMatchingStatusInput = {
  candidateId: string;
  status: MatchingStatus;
};

export type MarkContactSharedInput = {
  candidateId: string;
  sharedAt?: string;
};

export interface MatchingRepository {
  listCandidates(): Promise<MatchingCandidate[]>;
  upsertCandidate(input: UpsertMatchingCandidateInput): Promise<MatchingCandidate>;
  updateCandidateStatus(input: UpdateMatchingStatusInput): Promise<MatchingCandidate>;
  markContactShared(input: MarkContactSharedInput): Promise<MatchingCandidate>;
}
