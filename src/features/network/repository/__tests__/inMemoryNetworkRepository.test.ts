import { InMemoryNetworkRepository } from "../inMemoryNetworkRepository";

describe("InMemoryNetworkRepository", () => {
  it("creates and lists cupidates", async () => {
    const repository = new InMemoryNetworkRepository();

    await repository.createCupidate({
      displayName: "Mina",
      birthYear: 1998,
      gender: "female",
      bio: "coffee and books",
      profileVisibility: "public",
      region: "seoul",
      jobTitle: "Product Designer",
      heightCm: 164,
      smokingHabit: "none",
      drinkingHabit: "social",
      preferredAgeRange: [26, 34],
      preferredRegions: ["seoul", "bundang"],
      preferredJobGroups: ["engineer", "pm"],
      preferredSmoking: "none_only",
      preferredDrinking: "social",
      preferredGenders: ["male"],
      mustHaveConditionKeys: ["preferred_regions", "preferred_job_groups"],
      preferences: {
        hobbies: ["coffee", "travel"],
        mbti: "INFJ"
      }
    });

    const cupidates = await repository.listCupidates();

    expect(cupidates).toHaveLength(1);
    expect(cupidates[0].displayName).toBe("Mina");
    expect(cupidates[0].isActive).toBe(false);
    expect(cupidates[0].profileVisibility).toBe("public");
    expect(cupidates[0].region).toBe("seoul");
    expect(cupidates[0].jobTitle).toBe("Product Designer");
    expect(cupidates[0].preferredJobGroups).toEqual(["engineer", "pm"]);
    expect(cupidates[0].mustHaveConditionKeys).toEqual(["preferred_regions", "preferred_job_groups"]);
    expect(cupidates[0].preferences.mbti).toBe("INFJ");
    expect(cupidates[0].preferences.hobbies).toEqual(["coffee", "travel"]);
  });

  it("updates cupidate activation and profile fields", async () => {
    const repository = new InMemoryNetworkRepository();

    const created = await repository.createCupidate({
      displayName: "Mina",
      birthYear: 1998,
      gender: "female",
      bio: "coffee and books",
      preferences: {
        location: "seoul"
      }
    });

    const updated = await repository.updateCupidate({
      cupidateId: created.id,
      displayName: "Mina Kim",
      isActive: true,
      profileVisibility: "private",
      preferences: {
        location: "busan"
      }
    });

    expect(updated.displayName).toBe("Mina Kim");
    expect(updated.isActive).toBe(true);
    expect(updated.profileVisibility).toBe("private");
    expect(updated.region).toBe("busan");
    expect(updated.preferences.region).toBe("busan");
  });

  it("treats cupidate creation as a single self-profile upsert", async () => {
    const repository = new InMemoryNetworkRepository();

    const first = await repository.createCupidate({
      displayName: "Mina",
      birthYear: 1998,
      gender: "female",
      bio: "first profile"
    });

    const second = await repository.createCupidate({
      displayName: "Mina Updated",
      birthYear: 1997,
      gender: "female",
      bio: "updated profile",
      isActive: true
    });

    const cupidates = await repository.listCupidates();

    expect(cupidates).toHaveLength(1);
    expect(second.id).toBe(first.id);
    expect(cupidates[0].displayName).toBe("Mina Updated");
    expect(cupidates[0].isActive).toBe(true);
  });

  it("creates outbound connection with counterpart metadata", async () => {
    const repository = new InMemoryNetworkRepository();

    const connection = await repository.createConnection({
      addresseeCupidId: "local-cupid-a"
    });

    expect(connection.direction).toBe("outbound");
    expect(connection.counterpartCupidId).toBe("local-cupid-a");
    expect(connection.counterpartNickname).toBe("connected_a");

    const all = await repository.listConnections();
    expect(all).toHaveLength(1);
  });

  it("updates connection status", async () => {
    const repository = new InMemoryNetworkRepository();
    const created = await repository.createConnection({
      addresseeCupidId: "local-cupid-b"
    });

    const updated = await repository.updateConnectionStatus({
      connectionId: created.id,
      status: "accepted"
    });

    expect(updated.status).toBe("accepted");
    expect(updated.respondedAt).toBeTruthy();
  });

  it("searches discoverable cupids by nickname", async () => {
    const repository = new InMemoryNetworkRepository({
      cupids: [
        { id: "local-cupid-c", nickname: "jupiter" },
        { id: "local-cupid-d", nickname: "juno" }
      ],
      connections: [
        {
          id: "conn-existing",
          requesterCupidId: "local-cupid-me",
          addresseeCupidId: "local-cupid-a",
          status: "accepted",
          respondedAt: null,
          createdAt: "2026-03-28T00:00:00.000Z",
          updatedAt: "2026-03-28T00:00:00.000Z"
        }
      ]
    });

    const results = await repository.searchCupids("ju");

    expect(results.map((item) => item.nickname)).toEqual(["juno", "jupiter"]);
    expect(results.some((item) => item.id === "local-cupid-a")).toBe(false);
  });
});
