import { buildMatchCandidates } from "../buildMatchCandidates";
import type { CupidateProfile } from "../types";

const source: CupidateProfile = {
  cupidateId: "source",
  ownerCupidId: "cupid-a",
  birthYear: 1998,
  jobTitle: "Brand Strategist",
  preferredJobGroups: ["engineer", "product"],
  preferences: {
    ageRange: [25, 33],
    hobbies: ["hiking", "music"],
    smoking: "no",
    drinking: "social",
    location: "seoul"
  }
};

const targets: CupidateProfile[] = [
  {
    cupidateId: "target-1",
    ownerCupidId: "cupid-b",
    birthYear: 1997,
    jobTitle: "Product Engineer",
    preferredJobGroups: ["brand"],
    preferences: {
      ageRange: [24, 32],
      hobbies: ["music", "hiking"],
      smoking: "no",
      drinking: "social",
      location: "seoul"
    }
  },
  {
    cupidateId: "target-2",
    ownerCupidId: "cupid-c",
    birthYear: 1992,
    jobTitle: "Chef",
    preferredJobGroups: ["medical"],
    preferences: {
      ageRange: [28, 36],
      hobbies: ["travel"],
      smoking: "no",
      drinking: "social",
      location: "seoul"
    }
  },
  {
    cupidateId: "target-3",
    ownerCupidId: "cupid-x",
    birthYear: 1996,
    jobTitle: "Product Designer",
    preferredJobGroups: ["brand"],
    preferences: {
      ageRange: [24, 31],
      hobbies: ["music"],
      smoking: "no",
      drinking: "social",
      location: "seoul"
    }
  }
];

describe("buildMatchCandidates", () => {
  it("excludes unconnected owners and sorts by score desc", () => {
    const connectedPairs = new Set(["cupid-a:cupid-b", "cupid-a:cupid-c"]);

    const result = buildMatchCandidates({
      source,
      targets,
      currentYear: 2026,
      isConnected: (sourceOwnerCupidId, targetOwnerCupidId) =>
        connectedPairs.has(`${sourceOwnerCupidId}:${targetOwnerCupidId}`)
    });

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.targetCupidateId)).toEqual(["target-1", "target-2"]);
    expect(result[0].matchScore).toBeGreaterThanOrEqual(result[1].matchScore);
  });

  it("never includes self cupidate id", () => {
    const result = buildMatchCandidates({
      source,
      targets: [source],
      isConnected: () => true
    });

    expect(result).toHaveLength(0);
  });
});
