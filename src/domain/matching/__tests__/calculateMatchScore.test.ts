import { calculateMatchScore } from "../calculateMatchScore";
import type { CupidateProfile } from "../types";

const source: CupidateProfile = {
  cupidateId: "s1",
  ownerCupidId: "cupid-a",
  birthYear: 1998,
  jobTitle: "Brand Strategist",
  preferredJobGroups: ["engineer", "product"],
  preferredGenders: ["male"],
  preferredRegions: ["seoul"],
  region: "seoul",
  preferences: {
    ageRange: [25, 33],
    hobbies: ["hiking", "music", "Coffee"],
    smoking: "no",
    drinking: "social",
    location: "seoul",
    mustHaveConditionKeys: []
  }
};

const targetHighFit: CupidateProfile = {
  cupidateId: "t1",
  ownerCupidId: "cupid-b",
  birthYear: 1997,
  gender: "male",
  region: "seoul",
  jobTitle: "Frontend Engineer",
  preferredJobGroups: ["brand"],
  preferences: {
    ageRange: [24, 32],
    hobbies: ["music", "hiking", "travel"],
    smoking: "no",
    drinking: "social",
    location: "seoul"
  }
};

const targetLowFit: CupidateProfile = {
  cupidateId: "t2",
  ownerCupidId: "cupid-c",
  birthYear: 1980,
  gender: "female",
  region: "busan",
  jobTitle: "Chef",
  preferredJobGroups: ["medical"],
  preferences: {
    ageRange: [40, 45],
    hobbies: ["gaming"],
    smoking: "yes",
    drinking: "often",
    location: "busan"
  }
};

describe("calculateMatchScore", () => {
  it("returns a higher score for the better compatibility profile", () => {
    const high = calculateMatchScore(source, targetHighFit, 2026);
    const low = calculateMatchScore(source, targetLowFit, 2026);

    expect(high.score).toBeGreaterThan(low.score);
  });

  it("returns matched hobbies in normalized format", () => {
    const result = calculateMatchScore(source, targetHighFit, 2026);

    expect(result.matchedHobbies).toEqual(expect.arrayContaining(["hiking", "music"]));
  });

  it("uses preferred job groups as part of the profile score", () => {
    const high = calculateMatchScore(source, targetHighFit, 2026);
    const low = calculateMatchScore(source, targetLowFit, 2026);

    expect(high.breakdown.profile).toBeGreaterThan(low.breakdown.profile);
  });

  it("increases the impact of must-have conditions on score direction", () => {
    const sourceWithMustHaves: CupidateProfile = {
      ...source,
      preferences: {
        ...source.preferences,
        mustHaveConditionKeys: ["preferred_job_groups", "preferred_regions", "shared_hobbies"]
      }
    };

    const highBase = calculateMatchScore(source, targetHighFit, 2026);
    const lowBase = calculateMatchScore(source, targetLowFit, 2026);
    const highPriority = calculateMatchScore(sourceWithMustHaves, targetHighFit, 2026);
    const lowPriority = calculateMatchScore(sourceWithMustHaves, targetLowFit, 2026);

    expect(highPriority.score).toBeGreaterThan(highBase.score);
    expect(lowPriority.score).toBeLessThan(lowBase.score);
  });

  it("returns must-have hits that matched successfully", () => {
    const sourceWithMustHaves: CupidateProfile = {
      ...source,
      preferences: {
        ...source.preferences,
        mustHaveConditionKeys: ["preferred_job_groups", "shared_hobbies", "preferred_regions"]
      }
    };

    const result = calculateMatchScore(sourceWithMustHaves, targetHighFit, 2026);

    expect(result.priorityMatches).toEqual(
      expect.arrayContaining(["preferred_job_groups", "shared_hobbies", "preferred_regions"])
    );
  });
});
