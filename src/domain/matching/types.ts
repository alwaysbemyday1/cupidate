export type SmokingPreference = "yes" | "no" | "any";
export type DrinkingPreference = "never" | "social" | "often" | "any";

export type PreferenceData = {
  ageRange?: [number, number] | null;
  hobbies?: string[];
  smoking?: SmokingPreference;
  drinking?: DrinkingPreference;
  location?: string;
};

export type CupidateProfile = {
  cupidateId: string;
  ownerCupidId: string;
  birthYear: number | null;
  preferences: PreferenceData;
};

export type ScoreBreakdown = {
  age: number;
  hobbies: number;
  lifestyle: number;
  location: number;
};

export type MatchScoreResult = {
  score: number;
  breakdown: ScoreBreakdown;
  matchedHobbies: string[];
};

export type MatchCandidate = {
  sourceCupidateId: string;
  targetCupidateId: string;
  matchScore: number;
  reason: {
    breakdown: ScoreBreakdown;
    matchedHobbies: string[];
  };
};
