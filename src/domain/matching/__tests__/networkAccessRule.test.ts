import { canCalculateMatch } from "../networkAccessRule";

describe("canCalculateMatch", () => {
  it("returns false when source and target belong to the same cupid", () => {
    const result = canCalculateMatch({
      sourceOwnerCupidId: "cupid-a",
      targetOwnerCupidId: "cupid-a",
      isConnected: true
    });

    expect(result).toBe(false);
  });

  it("returns false when cupids are not connected", () => {
    const result = canCalculateMatch({
      sourceOwnerCupidId: "cupid-a",
      targetOwnerCupidId: "cupid-b",
      isConnected: false
    });

    expect(result).toBe(false);
  });

  it("returns true when cupids are different and connected", () => {
    const result = canCalculateMatch({
      sourceOwnerCupidId: "cupid-a",
      targetOwnerCupidId: "cupid-b",
      isConnected: true
    });

    expect(result).toBe(true);
  });
});
