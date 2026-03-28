export type SmokingHabit = "none" | "sometimes" | "often";
export type DrinkingHabit = "never" | "social" | "often";
export type SmokingPreference = "none_only" | "ok" | "any";
export type DrinkingPreference = "never" | "social" | "often" | "any";
export type GenderPreference = "female" | "male" | "other";

export type PreferenceData = {
  ageRange?: [number, number] | null;
  hobbies?: string[];
  location?: string;
  smoking?: "yes" | "no" | "any";
  drinking?: "never" | "social" | "often" | "any";
  region?: string;
  preferredRegions?: string[];
  smokingHabit?: SmokingHabit;
  drinkingHabit?: DrinkingHabit;
  preferredSmoking?: SmokingPreference;
  preferredDrinking?: DrinkingPreference;
  jobTitle?: string;
  heightCm?: number;
  preferredHeightRange?: [number, number] | null;
  preferredGenders?: GenderPreference[];
  mbti?: string;
};

export type CupidateProfile = {
  cupidateId: string;
  ownerCupidId: string;
  birthYear: number | null;
  gender?: string | null;
  preferences: PreferenceData;
};

export type ScoreBreakdown = {
  age: number;
  hobbies: number;
  lifestyle: number;
  location: number;
  profile: number;
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
