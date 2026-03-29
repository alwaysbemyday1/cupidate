import { resolveCupidateProfilePreferences } from "./resolveCupidatePreferenceData";
import type {
  CupidateProfile,
  DrinkingHabit,
  DrinkingPreference,
  GenderPreference,
  MatchScoreResult,
  SmokingHabit,
  SmokingPreference
} from "./types";

const WEIGHTS = {
  age: 30,
  hobbies: 25,
  lifestyle: 20,
  location: 15,
  profile: 10
} as const;

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

function computeAgeFromBirthYear(birthYear: number | null, currentYear: number): number | null {
  if (!birthYear) {
    return null;
  }

  const age = currentYear - birthYear;
  if (age < 18 || age > 100) {
    return null;
  }

  return age;
}

function computeRangeSatisfaction(targetAge: number | null, preferredRange?: [number, number] | null): number {
  if (!preferredRange || targetAge === null) {
    return 0.6;
  }

  const [min, max] = preferredRange;
  if (targetAge >= min && targetAge <= max) {
    return 1;
  }

  const distance = targetAge < min ? min - targetAge : targetAge - max;
  return Math.max(0, 1 - distance / 12);
}

function computeHobbyScore(sourceHobbies: string[], targetHobbies: string[]): { score: number; matched: string[] } {
  if (!sourceHobbies.length || !targetHobbies.length) {
    return { score: 0.6, matched: [] };
  }

  const sourceSet = new Set(sourceHobbies);
  const targetSet = new Set(targetHobbies);
  const matched = sourceHobbies.filter((hobby) => targetSet.has(hobby));
  const union = new Set([...sourceSet, ...targetSet]).size;

  return {
    score: union === 0 ? 0 : matched.length / union,
    matched
  };
}

function smokingPreferenceFit(preference: SmokingPreference, habit?: SmokingHabit): number {
  if (!habit) {
    return 0.6;
  }

  if (preference === "any") {
    return 1;
  }

  if (preference === "none_only") {
    return habit === "none" ? 1 : 0;
  }

  if (preference === "ok") {
    return habit === "none" ? 0.8 : 1;
  }

  return 0.6;
}

function drinkingToScale(value: DrinkingHabit | DrinkingPreference): number {
  switch (value) {
    case "never":
      return 0;
    case "social":
      return 1;
    case "often":
      return 2;
    default:
      return 1;
  }
}

function drinkingPreferenceFit(preference: DrinkingPreference, habit?: DrinkingHabit): number {
  if (!habit) {
    return 0.6;
  }

  if (preference === "any") {
    return 1;
  }

  const distance = Math.abs(drinkingToScale(preference) - drinkingToScale(habit));
  return Math.max(0, 1 - distance * 0.5);
}

function locationFit(preferredRegions: string[], targetRegion?: string): number {
  if (!preferredRegions.length || !targetRegion) {
    return 0.6;
  }

  return preferredRegions.includes(targetRegion) ? 1 : 0.2;
}

function normalizeGender(value: string | null | undefined): GenderPreference | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "male" || normalized === "female" || normalized === "other") {
    return normalized;
  }

  return undefined;
}

function genderFit(preferredGenders: GenderPreference[], targetGender?: GenderPreference): number {
  if (!preferredGenders.length) {
    return 0.6;
  }

  if (!targetGender) {
    return 0.5;
  }

  return preferredGenders.includes(targetGender) ? 1 : 0;
}

function heightFit(preferredHeightRange?: [number, number] | null, targetHeight?: number): number {
  if (!preferredHeightRange || !targetHeight) {
    return 0.6;
  }

  const [min, max] = preferredHeightRange;
  if (targetHeight >= min && targetHeight <= max) {
    return 1;
  }

  const distance = targetHeight < min ? min - targetHeight : targetHeight - max;
  return Math.max(0, 1 - distance / 25);
}

function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u3131-\uD79D\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function jobGroupFit(preferredJobGroups: string[], targetJobTitle?: string): number {
  if (!preferredJobGroups.length) {
    return 0.6;
  }

  if (!targetJobTitle) {
    return 0.5;
  }

  const normalizedTarget = normalizeSearchText(targetJobTitle);
  if (!normalizedTarget) {
    return 0.5;
  }

  const targetTokens = new Set(normalizedTarget.split(" "));
  const matched = preferredJobGroups.some((jobGroup) => {
    const normalizedGroup = normalizeSearchText(jobGroup);
    if (!normalizedGroup) {
      return false;
    }

    if (normalizedTarget.includes(normalizedGroup) || normalizedGroup.includes(normalizedTarget)) {
      return true;
    }

    return normalizedGroup.split(" ").some((token) => targetTokens.has(token));
  });

  return matched ? 1 : 0.2;
}

export function calculateMatchScore(
  source: CupidateProfile,
  target: CupidateProfile,
  currentYear = new Date().getFullYear()
): MatchScoreResult {
  const sourcePref = resolveCupidateProfilePreferences(source);
  const targetPref = resolveCupidateProfilePreferences(target);

  const sourceAge = computeAgeFromBirthYear(source.birthYear, currentYear);
  const targetAge = computeAgeFromBirthYear(target.birthYear, currentYear);

  const ageFitSource = computeRangeSatisfaction(targetAge, sourcePref.ageRange);
  const ageFitTarget = computeRangeSatisfaction(sourceAge, targetPref.ageRange);
  const ageScore = ((ageFitSource + ageFitTarget) / 2) * WEIGHTS.age;

  const hobbyResult = computeHobbyScore(sourcePref.hobbies || [], targetPref.hobbies || []);
  const hobbyScore = hobbyResult.score * WEIGHTS.hobbies;

  const sourceToTargetSmoking = smokingPreferenceFit(sourcePref.preferredSmoking ?? "any", targetPref.smokingHabit);
  const targetToSourceSmoking = smokingPreferenceFit(targetPref.preferredSmoking ?? "any", sourcePref.smokingHabit);
  const sourceToTargetDrinking = drinkingPreferenceFit(sourcePref.preferredDrinking ?? "any", targetPref.drinkingHabit);
  const targetToSourceDrinking = drinkingPreferenceFit(targetPref.preferredDrinking ?? "any", sourcePref.drinkingHabit);
  const lifestyleScore =
    ((sourceToTargetSmoking + targetToSourceSmoking + sourceToTargetDrinking + targetToSourceDrinking) / 4) *
    WEIGHTS.lifestyle;

  const sourceToTargetLocation = locationFit(sourcePref.preferredRegions || [], targetPref.region);
  const targetToSourceLocation = locationFit(targetPref.preferredRegions || [], sourcePref.region);
  const locationScore = ((sourceToTargetLocation + targetToSourceLocation) / 2) * WEIGHTS.location;

  const sourceToTargetGender = genderFit(sourcePref.preferredGenders || [], normalizeGender(target.gender));
  const targetToSourceGender = genderFit(targetPref.preferredGenders || [], normalizeGender(source.gender));
  const sourceToTargetHeight = heightFit(sourcePref.preferredHeightRange, targetPref.heightCm);
  const targetToSourceHeight = heightFit(targetPref.preferredHeightRange, sourcePref.heightCm);
  const sourceToTargetJob = jobGroupFit(sourcePref.preferredJobGroups || [], targetPref.jobTitle);
  const targetToSourceJob = jobGroupFit(targetPref.preferredJobGroups || [], sourcePref.jobTitle);
  const profileScore =
    (
      sourceToTargetGender +
      targetToSourceGender +
      sourceToTargetHeight +
      targetToSourceHeight +
      sourceToTargetJob +
      targetToSourceJob
    ) /
    6 *
    WEIGHTS.profile;

  const rawScore = ageScore + hobbyScore + lifestyleScore + locationScore + profileScore;
  const score = roundToTwo(rawScore);

  return {
    score,
    breakdown: {
      age: roundToTwo(ageScore),
      hobbies: roundToTwo(hobbyScore),
      lifestyle: roundToTwo(lifestyleScore),
      location: roundToTwo(locationScore),
      profile: roundToTwo(profileScore)
    },
    matchedHobbies: hobbyResult.matched
  };
}
