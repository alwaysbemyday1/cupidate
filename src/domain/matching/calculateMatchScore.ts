import { normalizePreferenceData } from "./normalizePreferences";
import type { CupidateProfile, MatchScoreResult } from "./types";

const WEIGHTS = {
  age: 35,
  hobbies: 30,
  lifestyle: 25,
  location: 10
} as const;

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
    return 0.5;
  }

  const [min, max] = preferredRange;
  if (targetAge >= min && targetAge <= max) {
    return 1;
  }

  const distance = targetAge < min ? min - targetAge : targetAge - max;
  return Math.max(0, 1 - distance / 10);
}

function computeHobbyScore(sourceHobbies: string[], targetHobbies: string[]): { score: number; matched: string[] } {
  if (!sourceHobbies.length || !targetHobbies.length) {
    return { score: 0.5, matched: [] };
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

function computeChoiceCompatibility(left: string | undefined, right: string | undefined): number {
  const a = left ?? "any";
  const b = right ?? "any";

  if (a === "any" || b === "any") {
    return 1;
  }

  return a === b ? 1 : 0;
}

function roundToTwo(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateMatchScore(
  source: CupidateProfile,
  target: CupidateProfile,
  currentYear = new Date().getFullYear()
): MatchScoreResult {
  const sourcePref = normalizePreferenceData(source.preferences);
  const targetPref = normalizePreferenceData(target.preferences);

  const sourceAge = computeAgeFromBirthYear(source.birthYear, currentYear);
  const targetAge = computeAgeFromBirthYear(target.birthYear, currentYear);

  const ageFitSource = computeRangeSatisfaction(targetAge, sourcePref.ageRange);
  const ageFitTarget = computeRangeSatisfaction(sourceAge, targetPref.ageRange);
  const ageScore = ((ageFitSource + ageFitTarget) / 2) * WEIGHTS.age;

  const hobbyResult = computeHobbyScore(sourcePref.hobbies || [], targetPref.hobbies || []);
  const hobbyScore = hobbyResult.score * WEIGHTS.hobbies;

  const smokingScore = computeChoiceCompatibility(sourcePref.smoking, targetPref.smoking);
  const drinkingScore = computeChoiceCompatibility(sourcePref.drinking, targetPref.drinking);
  const lifestyleScore = ((smokingScore + drinkingScore) / 2) * WEIGHTS.lifestyle;

  let locationScore = WEIGHTS.location * 0.5;
  if (sourcePref.location && targetPref.location) {
    locationScore = sourcePref.location === targetPref.location ? WEIGHTS.location : WEIGHTS.location * 0.3;
  }

  const rawScore = ageScore + hobbyScore + lifestyleScore + locationScore;
  const score = roundToTwo(rawScore);

  return {
    score,
    breakdown: {
      age: roundToTwo(ageScore),
      hobbies: roundToTwo(hobbyScore),
      lifestyle: roundToTwo(lifestyleScore),
      location: roundToTwo(locationScore)
    },
    matchedHobbies: hobbyResult.matched
  };
}
