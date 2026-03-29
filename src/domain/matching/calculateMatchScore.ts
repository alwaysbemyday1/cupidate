import { resolveCupidateProfilePreferences } from "./resolveCupidatePreferenceData";
import type {
  CupidateProfile,
  DrinkingHabit,
  DrinkingPreference,
  GenderPreference,
  MatchScoreResult,
  PreferenceConditionKey,
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

function clampFit(value: number): number {
  return Math.max(0, Math.min(1, value));
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

function hasPriorityCondition(
  mustHaveConditionKeys: PreferenceConditionKey[] | undefined,
  key: PreferenceConditionKey
): boolean {
  return mustHaveConditionKeys?.includes(key) ?? false;
}

function applyPriorityWeight(fit: number, isPriority: boolean): number {
  const normalized = clampFit(fit);

  if (!isPriority) {
    return normalized;
  }

  if (normalized >= 0.9) {
    return 1;
  }

  if (normalized >= 0.75) {
    return Math.min(1, normalized + 0.12);
  }

  if (normalized >= 0.4) {
    return Math.min(1, normalized + 0.06);
  }

  return normalized * 0.45;
}

function isPrioritySatisfied(
  key: PreferenceConditionKey,
  fit: number,
  context?: { matchedHobbies?: string[] }
): boolean {
  if (key === "shared_hobbies") {
    return (context?.matchedHobbies?.length ?? 0) > 0;
  }

  if (key === "preferred_smoking") {
    return fit >= 0.8;
  }

  if (key === "preferred_drinking") {
    return fit >= 0.75;
  }

  return fit >= 0.99;
}

function collectPriorityMatch(
  matches: Set<PreferenceConditionKey>,
  key: PreferenceConditionKey,
  fit: number,
  isPriority: boolean,
  context?: { matchedHobbies?: string[] }
) {
  if (!isPriority) {
    return;
  }

  if (isPrioritySatisfied(key, fit, context)) {
    matches.add(key);
  }
}

type WeightedCondition = {
  fit: number;
};

function averageWeightedFit(conditions: WeightedCondition[]): number {
  if (conditions.length === 0) {
    return 0;
  }

  return conditions.reduce((sum, item) => sum + clampFit(item.fit), 0) / conditions.length;
}

export function calculateMatchScore(
  source: CupidateProfile,
  target: CupidateProfile,
  currentYear = new Date().getFullYear()
): MatchScoreResult {
  const sourcePref = resolveCupidateProfilePreferences(source);
  const targetPref = resolveCupidateProfilePreferences(target);
  const priorityMatches = new Set<PreferenceConditionKey>();

  const sourceAge = computeAgeFromBirthYear(source.birthYear, currentYear);
  const targetAge = computeAgeFromBirthYear(target.birthYear, currentYear);

  const sourceAgeFitRaw = computeRangeSatisfaction(targetAge, sourcePref.ageRange);
  const targetAgeFitRaw = computeRangeSatisfaction(sourceAge, targetPref.ageRange);
  collectPriorityMatch(
    priorityMatches,
    "age_range",
    sourceAgeFitRaw,
    hasPriorityCondition(sourcePref.mustHaveConditionKeys, "age_range")
  );
  collectPriorityMatch(
    priorityMatches,
    "age_range",
    targetAgeFitRaw,
    hasPriorityCondition(targetPref.mustHaveConditionKeys, "age_range")
  );
  const ageScore =
    averageWeightedFit([
      {
        fit: applyPriorityWeight(
          sourceAgeFitRaw,
          hasPriorityCondition(sourcePref.mustHaveConditionKeys, "age_range")
        )
      },
      {
        fit: applyPriorityWeight(
          targetAgeFitRaw,
          hasPriorityCondition(targetPref.mustHaveConditionKeys, "age_range")
        )
      }
    ]) * WEIGHTS.age;

  const hobbyResult = computeHobbyScore(sourcePref.hobbies || [], targetPref.hobbies || []);
  const hobbyPriority =
    hasPriorityCondition(sourcePref.mustHaveConditionKeys, "shared_hobbies") ||
    hasPriorityCondition(targetPref.mustHaveConditionKeys, "shared_hobbies");
  collectPriorityMatch(priorityMatches, "shared_hobbies", hobbyResult.score, hobbyPriority, {
    matchedHobbies: hobbyResult.matched
  });
  const hobbyScore = applyPriorityWeight(hobbyResult.score, hobbyPriority) * WEIGHTS.hobbies;

  const sourceToTargetSmokingRaw = smokingPreferenceFit(sourcePref.preferredSmoking ?? "any", targetPref.smokingHabit);
  const targetToSourceSmokingRaw = smokingPreferenceFit(targetPref.preferredSmoking ?? "any", sourcePref.smokingHabit);
  collectPriorityMatch(
    priorityMatches,
    "preferred_smoking",
    sourceToTargetSmokingRaw,
    hasPriorityCondition(sourcePref.mustHaveConditionKeys, "preferred_smoking")
  );
  collectPriorityMatch(
    priorityMatches,
    "preferred_smoking",
    targetToSourceSmokingRaw,
    hasPriorityCondition(targetPref.mustHaveConditionKeys, "preferred_smoking")
  );

  const sourceToTargetDrinkingRaw = drinkingPreferenceFit(sourcePref.preferredDrinking ?? "any", targetPref.drinkingHabit);
  const targetToSourceDrinkingRaw = drinkingPreferenceFit(targetPref.preferredDrinking ?? "any", sourcePref.drinkingHabit);
  collectPriorityMatch(
    priorityMatches,
    "preferred_drinking",
    sourceToTargetDrinkingRaw,
    hasPriorityCondition(sourcePref.mustHaveConditionKeys, "preferred_drinking")
  );
  collectPriorityMatch(
    priorityMatches,
    "preferred_drinking",
    targetToSourceDrinkingRaw,
    hasPriorityCondition(targetPref.mustHaveConditionKeys, "preferred_drinking")
  );

  const lifestyleScore =
    averageWeightedFit([
      {
        fit: applyPriorityWeight(
          sourceToTargetSmokingRaw,
          hasPriorityCondition(sourcePref.mustHaveConditionKeys, "preferred_smoking")
        )
      },
      {
        fit: applyPriorityWeight(
          targetToSourceSmokingRaw,
          hasPriorityCondition(targetPref.mustHaveConditionKeys, "preferred_smoking")
        )
      },
      {
        fit: applyPriorityWeight(
          sourceToTargetDrinkingRaw,
          hasPriorityCondition(sourcePref.mustHaveConditionKeys, "preferred_drinking")
        )
      },
      {
        fit: applyPriorityWeight(
          targetToSourceDrinkingRaw,
          hasPriorityCondition(targetPref.mustHaveConditionKeys, "preferred_drinking")
        )
      }
    ]) * WEIGHTS.lifestyle;

  const sourceToTargetLocationRaw = locationFit(sourcePref.preferredRegions || [], targetPref.region);
  const targetToSourceLocationRaw = locationFit(targetPref.preferredRegions || [], sourcePref.region);
  collectPriorityMatch(
    priorityMatches,
    "preferred_regions",
    sourceToTargetLocationRaw,
    hasPriorityCondition(sourcePref.mustHaveConditionKeys, "preferred_regions")
  );
  collectPriorityMatch(
    priorityMatches,
    "preferred_regions",
    targetToSourceLocationRaw,
    hasPriorityCondition(targetPref.mustHaveConditionKeys, "preferred_regions")
  );
  const locationScore =
    averageWeightedFit([
      {
        fit: applyPriorityWeight(
          sourceToTargetLocationRaw,
          hasPriorityCondition(sourcePref.mustHaveConditionKeys, "preferred_regions")
        )
      },
      {
        fit: applyPriorityWeight(
          targetToSourceLocationRaw,
          hasPriorityCondition(targetPref.mustHaveConditionKeys, "preferred_regions")
        )
      }
    ]) * WEIGHTS.location;

  const sourceToTargetGenderRaw = genderFit(sourcePref.preferredGenders || [], normalizeGender(target.gender));
  const targetToSourceGenderRaw = genderFit(targetPref.preferredGenders || [], normalizeGender(source.gender));
  collectPriorityMatch(
    priorityMatches,
    "preferred_gender",
    sourceToTargetGenderRaw,
    hasPriorityCondition(sourcePref.mustHaveConditionKeys, "preferred_gender")
  );
  collectPriorityMatch(
    priorityMatches,
    "preferred_gender",
    targetToSourceGenderRaw,
    hasPriorityCondition(targetPref.mustHaveConditionKeys, "preferred_gender")
  );

  const sourceToTargetHeightRaw = heightFit(sourcePref.preferredHeightRange, target.heightCm ?? undefined);
  const targetToSourceHeightRaw = heightFit(targetPref.preferredHeightRange, source.heightCm ?? undefined);
  collectPriorityMatch(
    priorityMatches,
    "preferred_height_range",
    sourceToTargetHeightRaw,
    hasPriorityCondition(sourcePref.mustHaveConditionKeys, "preferred_height_range")
  );
  collectPriorityMatch(
    priorityMatches,
    "preferred_height_range",
    targetToSourceHeightRaw,
    hasPriorityCondition(targetPref.mustHaveConditionKeys, "preferred_height_range")
  );

  const sourceToTargetJobRaw = jobGroupFit(sourcePref.preferredJobGroups || [], target.jobTitle ?? undefined);
  const targetToSourceJobRaw = jobGroupFit(targetPref.preferredJobGroups || [], source.jobTitle ?? undefined);
  collectPriorityMatch(
    priorityMatches,
    "preferred_job_groups",
    sourceToTargetJobRaw,
    hasPriorityCondition(sourcePref.mustHaveConditionKeys, "preferred_job_groups")
  );
  collectPriorityMatch(
    priorityMatches,
    "preferred_job_groups",
    targetToSourceJobRaw,
    hasPriorityCondition(targetPref.mustHaveConditionKeys, "preferred_job_groups")
  );

  const profileScore =
    averageWeightedFit([
      {
        fit: applyPriorityWeight(
          sourceToTargetGenderRaw,
          hasPriorityCondition(sourcePref.mustHaveConditionKeys, "preferred_gender")
        )
      },
      {
        fit: applyPriorityWeight(
          targetToSourceGenderRaw,
          hasPriorityCondition(targetPref.mustHaveConditionKeys, "preferred_gender")
        )
      },
      {
        fit: applyPriorityWeight(
          sourceToTargetHeightRaw,
          hasPriorityCondition(sourcePref.mustHaveConditionKeys, "preferred_height_range")
        )
      },
      {
        fit: applyPriorityWeight(
          targetToSourceHeightRaw,
          hasPriorityCondition(targetPref.mustHaveConditionKeys, "preferred_height_range")
        )
      },
      {
        fit: applyPriorityWeight(
          sourceToTargetJobRaw,
          hasPriorityCondition(sourcePref.mustHaveConditionKeys, "preferred_job_groups")
        )
      },
      {
        fit: applyPriorityWeight(
          targetToSourceJobRaw,
          hasPriorityCondition(targetPref.mustHaveConditionKeys, "preferred_job_groups")
        )
      }
    ]) * WEIGHTS.profile;

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
    matchedHobbies: hobbyResult.matched,
    priorityMatches: Array.from(priorityMatches)
  };
}
