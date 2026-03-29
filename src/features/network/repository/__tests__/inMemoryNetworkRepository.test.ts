import { InMemoryNetworkRepository } from "../inMemoryNetworkRepository";

describe("InMemoryNetworkRepository", () => {
  it("creates and lists cupidates", async () => {
    const repository = new InMemoryNetworkRepository();

    await repository.createCupidate({
      displayName: "Mina",
      birthYear: 1998,
      gender: "female",
      bio: "coffee and books",
      preferences: {
        ageRange: [26, 34],
        hobbies: ["coffee", "travel"],
        location: "seoul"
      }
    });

    const cupidates = await repository.listCupidates();

    expect(cupidates).toHaveLength(1);
    expect(cupidates[0].displayName).toBe("Mina");
    expect(cupidates[0].isActive).toBe(true);
    expect(cupidates[0].preferences.hobbies).toEqual(["coffee", "travel"]);
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
