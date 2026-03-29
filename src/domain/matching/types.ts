export type SmokingHabit = "none" | "sometimes" | "often";
export type DrinkingHabit = "never" | "social" | "often";
export type SmokingPreference = "none_only" | "ok" | "any";
export type DrinkingPreference = "never" | "social" | "often" | "any";
export type GenderPreference = "female" | "male" | "other";
export type PreferenceConditionKey =
  | "age_range"
  | "shared_hobbies"
  | "preferred_regions"
  | "preferred_job_groups"
  | "preferred_smoking"
  | "preferred_drinking"
  | "preferred_gender"
  | "preferred_height_range";

export const PREFERENCE_CONDITION_KEYS: PreferenceConditionKey[] = [
  "age_range",
  "shared_hobbies",
  "preferred_regions",
  "preferred_job_groups",
  "preferred_smoking",
  "preferred_drinking",
  "preferred_gender",
  "preferred_height_range"
];

export const MAX_MUST_HAVE_CONDITIONS = 5;

export type PreferenceData = {
  ageRange?: [number, number] | null;
  hobbies?: string[];
  location?: string;
  smoking?: "yes" | "no" | "any";
  drinking?: "never" | "social" | "often" | "any";
  region?: string;
  preferredRegions?: string[];
  preferredJobGroups?: string[];
  smokingHabit?: SmokingHabit;
  drinkingHabit?: DrinkingHabit;
  preferredSmoking?: SmokingPreference;
  preferredDrinking?: DrinkingPreference;
  jobTitle?: string;
  heightCm?: number;
  preferredHeightRange?: [number, number] | null;
  preferredGenders?: GenderPreference[];
  mbti?: string;
  mustHaveConditionKeys?: PreferenceConditionKey[];
};

export type StructuredCupidateFields = {
  region?: string | null;
  jobTitle?: string | null;
  heightCm?: number | null;
  smokingHabit?: SmokingHabit | null;
  drinkingHabit?: DrinkingHabit | null;
  preferredAgeRange?: [number, number] | null;
  preferredRegions?: string[];
  preferredJobGroups?: string[];
  preferredSmoking?: SmokingPreference | null;
  preferredDrinking?: DrinkingPreference | null;
  preferredGenders?: GenderPreference[];
  preferredHeightRange?: [number, number] | null;
  mustHaveConditionKeys?: PreferenceConditionKey[];
};

export type CupidateProfile = {
  cupidateId: string;
  ownerCupidId: string;
  birthYear: number | null;
  gender?: string | null;
  region?: string | null;
  jobTitle?: string | null;
  heightCm?: number | null;
  smokingHabit?: SmokingHabit | null;
  drinkingHabit?: DrinkingHabit | null;
  preferredAgeRange?: [number, number] | null;
  preferredRegions?: string[];
  preferredJobGroups?: string[];
  preferredSmoking?: SmokingPreference | null;
  preferredDrinking?: DrinkingPreference | null;
  preferredGenders?: GenderPreference[];
  preferredHeightRange?: [number, number] | null;
  mustHaveConditionKeys?: PreferenceConditionKey[];
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
  priorityMatches: PreferenceConditionKey[];
};

export type MatchCandidate = {
  sourceCupidateId: string;
  targetCupidateId: string;
  matchScore: number;
  reason: {
    breakdown: ScoreBreakdown;
    matchedHobbies: string[];
    priorityMatches: PreferenceConditionKey[];
  };
};
