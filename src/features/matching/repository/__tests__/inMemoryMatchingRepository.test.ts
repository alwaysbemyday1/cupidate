import { InMemoryMatchingRepository } from "../inMemoryMatchingRepository";

describe("InMemoryMatchingRepository", () => {
  it("upserts by source-target pair", async () => {
    const repository = new InMemoryMatchingRepository();

    const first = await repository.upsertCandidate({
      sourceCupidateId: "a",
      targetCupidateId: "b",
      matchScore: 72,
      reason: { seed: true }
    });

    const second = await repository.upsertCandidate({
      sourceCupidateId: "a",
      targetCupidateId: "b",
      matchScore: 81,
      reason: { refreshed: true }
    });

    expect(second.id).toBe(first.id);
    expect(second.matchScore).toBe(81);
    expect(second.status).toBe("proposed");

    const rows = await repository.listCandidates();
    expect(rows).toHaveLength(1);
  });

  it("marks contact shared on accepted candidate", async () => {
    const repository = new InMemoryMatchingRepository();

    const created = await repository.upsertCandidate({
      sourceCupidateId: "x",
      targetCupidateId: "y",
      matchScore: 66,
      reason: {}
    });

    const accepted = await repository.updateCandidateStatus({
      candidateId: created.id,
      status: "accepted"
    });

    expect(accepted.status).toBe("accepted");

    const shared = await repository.markContactShared({
      candidateId: created.id,
      sharedAt: "2026-03-28T00:00:00.000Z"
    });

    expect(shared.status).toBe("accepted");
    expect(shared.reason.contactSharedAt).toBe("2026-03-28T00:00:00.000Z");
  });
});
