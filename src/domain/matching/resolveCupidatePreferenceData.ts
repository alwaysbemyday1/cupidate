import { normalizePreferenceData } from "./normalizePreferences";
import type { CupidateProfile, PreferenceData, StructuredCupidateFields } from "./types";

function withFallbackArray<T>(primary: T[] | undefined, fallback: T[] | undefined) {
  if (primary !== undefined) {
    return primary;
  }

  return fallback;
}

export function resolveCupidatePreferenceData(
  preferences: PreferenceData,
  structured?: StructuredCupidateFields
): PreferenceData {
  return normalizePreferenceData({
    ...preferences,
    location: structured?.region ?? preferences.location ?? preferences.region,
    region: structured?.region ?? preferences.region ?? preferences.location,
    jobTitle: structured?.jobTitle ?? preferences.jobTitle,
    heightCm: structured?.heightCm ?? preferences.heightCm,
    smokingHabit: structured?.smokingHabit ?? preferences.smokingHabit,
    drinkingHabit: structured?.drinkingHabit ?? preferences.drinkingHabit,
    ageRange: structured?.preferredAgeRange ?? preferences.ageRange,
    preferredRegions: withFallbackArray(structured?.preferredRegions, preferences.preferredRegions),
    preferredJobGroups: withFallbackArray(structured?.preferredJobGroups, preferences.preferredJobGroups),
    preferredSmoking: structured?.preferredSmoking ?? preferences.preferredSmoking,
    preferredDrinking: structured?.preferredDrinking ?? preferences.preferredDrinking,
    preferredGenders: withFallbackArray(structured?.preferredGenders, preferences.preferredGenders),
    preferredHeightRange: structured?.preferredHeightRange ?? preferences.preferredHeightRange,
    mustHaveConditionKeys: withFallbackArray(structured?.mustHaveConditionKeys, preferences.mustHaveConditionKeys)
  });
}

export function resolveCupidateProfilePreferences(profile: CupidateProfile): PreferenceData {
  return resolveCupidatePreferenceData(profile.preferences, {
    region: profile.region,
    jobTitle: profile.jobTitle,
    heightCm: profile.heightCm,
    smokingHabit: profile.smokingHabit,
    drinkingHabit: profile.drinkingHabit,
    preferredAgeRange: profile.preferredAgeRange,
    preferredRegions: profile.preferredRegions,
    preferredJobGroups: profile.preferredJobGroups,
    preferredSmoking: profile.preferredSmoking,
    preferredDrinking: profile.preferredDrinking,
    preferredGenders: profile.preferredGenders,
    preferredHeightRange: profile.preferredHeightRange,
    mustHaveConditionKeys: profile.mustHaveConditionKeys
  });
}
