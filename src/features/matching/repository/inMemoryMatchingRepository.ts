import type {
  MarkContactSharedInput,
  MatchingCandidate,
  MatchingRepository,
  UpdateMatchingStatusInput,
  UpsertMatchingCandidateInput
} from "./types";

const NOW = () => new Date().toISOString();

function randomId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

type InMemoryMatchingRepositoryOptions = {
  candidates?: MatchingCandidate[];
};

export class InMemoryMatchingRepository implements MatchingRepository {
  private candidates: MatchingCandidate[];

  constructor(options?: InMemoryMatchingRepositoryOptions) {
    this.candidates = options?.candidates ?? [];
  }

  async listCandidates(): Promise<MatchingCandidate[]> {
    return [...this.candidates].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async upsertCandidate(input: UpsertMatchingCandidateInput): Promise<MatchingCandidate> {
    const existing = this.candidates.find(
      (item) =>
        item.sourceCupidateId === input.sourceCupidateId && item.targetCupidateId === input.targetCupidateId
    );

    const now = NOW();

    if (existing) {
      const updated: MatchingCandidate = {
        ...existing,
        matchScore: input.matchScore,
        status: "proposed",
        reason: {
          ...existing.reason,
          ...input.reason
        },
        updatedAt: now
      };

      this.candidates = this.candidates.map((item) => (item.id === existing.id ? updated : item));
      return updated;
    }

    const created: MatchingCandidate = {
      id: randomId("match"),
      sourceCupidateId: input.sourceCupidateId,
      targetCupidateId: input.targetCupidateId,
      matchScore: input.matchScore,
      status: "proposed",
      reason: input.reason,
      createdAt: now,
      updatedAt: now
    };

    this.candidates = [created, ...this.candidates];
    return created;
  }

  async updateCandidateStatus(input: UpdateMatchingStatusInput): Promise<MatchingCandidate> {
    const found = this.candidates.find((item) => item.id === input.candidateId);
    if (!found) {
      throw new Error(`Match candidate not found: ${input.candidateId}`);
    }

    const updated: MatchingCandidate = {
      ...found,
      status: input.status,
      updatedAt: NOW()
    };

    this.candidates = this.candidates.map((item) => (item.id === found.id ? updated : item));
    return updated;
  }

  async markContactShared(input: MarkContactSharedInput): Promise<MatchingCandidate> {
    const found = this.candidates.find((item) => item.id === input.candidateId);
    if (!found) {
      throw new Error(`Match candidate not found: ${input.candidateId}`);
    }

    const sharedAt = input.sharedAt ?? NOW();
    const updated: MatchingCandidate = {
      ...found,
      status: "accepted",
      reason: {
        ...found.reason,
        contactSharedAt: sharedAt
      },
      updatedAt: NOW()
    };

    this.candidates = this.candidates.map((item) => (item.id === found.id ? updated : item));
    return updated;
  }
}

export function createInMemoryMatchingRepository(options?: InMemoryMatchingRepositoryOptions): MatchingRepository {
  return new InMemoryMatchingRepository(options);
}
