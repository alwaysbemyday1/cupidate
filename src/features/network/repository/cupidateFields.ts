import { normalizePreferenceData } from "../../../domain/matching/normalizePreferences";
import { resolveCupidatePreferenceData } from "../../../domain/matching/resolveCupidatePreferenceData";
import {
  MAX_MUST_HAVE_CONDITIONS,
  PREFERENCE_CONDITION_KEYS,
  type PreferenceConditionKey
} from "../../../domain/matching/types";
import type {
  DrinkingHabit,
  DrinkingPreference,
  GenderPreference,
  PreferenceData,
  SmokingHabit,
  SmokingPreference,
  StructuredCupidateFields
} from "../../../domain/matching/types";

type CupidateFieldInput = {
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
  preferences?: PreferenceData;
};

type ArrayFieldInput = string[] | undefined;
const MUST_HAVE_CONDITION_SET = new Set<PreferenceConditionKey>(PREFERENCE_CONDITION_KEYS);

function normalizeOptionalText(value: string | null | undefined, lowercase = false) {
  if (value === undefined) {
    return undefined;
  }

  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    return null;
  }

  return lowercase ? trimmed.toLowerCase() : trimmed;
}

function normalizeOptionalNumber(
  value: number | null | undefined,
  min: number,
  max: number
): number | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || Number.isNaN(value)) {
    return null;
  }

  if (value < min || value > max) {
    return null;
  }

  return Math.round(value);
}

function normalizeStringArray(values: ArrayFieldInput, lowercase = true): string[] | undefined {
  if (values === undefined) {
    return undefined;
  }

  const normalized = values
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => (lowercase ? value.toLowerCase() : value));

  return Array.from(new Set(normalized));
}

function normalizeRange(
  value: [number, number] | null | undefined,
  min: number,
  max: number
): [number, number] | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const left = Math.min(value[0], value[1]);
  const right = Math.max(value[0], value[1]);
  if (left < min || right > max) {
    return null;
  }

  return [left, right];
}

function normalizeSmokingHabitValue(value: SmokingHabit | null | undefined): SmokingHabit | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return value === "none" || value === "sometimes" || value === "often" ? value : null;
}

function normalizeDrinkingHabitValue(value: DrinkingHabit | null | undefined): DrinkingHabit | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return value === "never" || value === "social" || value === "often" ? value : null;
}

function normalizeSmokingPreferenceValue(
  value: SmokingPreference | null | undefined
): SmokingPreference | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return value === "none_only" || value === "ok" || value === "any" ? value : null;
}

function normalizeDrinkingPreferenceValue(
  value: DrinkingPreference | null | undefined
): DrinkingPreference | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  return value === "never" || value === "social" || value === "often" || value === "any" ? value : null;
}

function normalizeGenderPreferenceValues(
  value: GenderPreference[] | undefined
): GenderPreference[] | undefined {
  const normalized = normalizeStringArray(value, true);
  if (normalized === undefined) {
    return undefined;
  }

  return normalized.filter(
    (item): item is GenderPreference => item === "male" || item === "female" || item === "other"
  );
}

function normalizeMustHaveConditionKeys(
  value: PreferenceConditionKey[] | undefined
): PreferenceConditionKey[] | undefined {
  const normalized = normalizeStringArray(value, true);
  if (normalized === undefined) {
    return undefined;
  }

  return normalized
    .filter((item): item is PreferenceConditionKey => MUST_HAVE_CONDITION_SET.has(item as PreferenceConditionKey))
    .slice(0, MAX_MUST_HAVE_CONDITIONS);
}

function normalizeFlexiblePreferencePayload(preferences?: PreferenceData): PreferenceData {
  if (!preferences) {
    return {};
  }

  const {
    ageRange,
    location,
    smoking,
    drinking,
    region,
    preferredRegions,
    preferredJobGroups,
    smokingHabit,
    drinkingHabit,
    preferredSmoking,
    preferredDrinking,
    jobTitle,
    heightCm,
    preferredHeightRange,
    preferredGenders,
    mustHaveConditionKeys,
    ...rest
  } = preferences;

  const next: Record<string, unknown> = { ...rest };

  if (Array.isArray(preferences.hobbies) && preferences.hobbies.length > 0) {
    next.hobbies = Array.from(
      new Set(
        preferences.hobbies
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean)
      )
    );
  }

  if (typeof preferences.mbti === "string" && preferences.mbti.trim()) {
    next.mbti = preferences.mbti.trim().toUpperCase();
  }

  delete next.preferredGender;
  delete next.preferredAgeRange;
  delete next.mustHaveConditionKeys;

  return next as PreferenceData;
}

export function extractStructuredCupidateFields(input: CupidateFieldInput): Required<StructuredCupidateFields> {
  const normalizedFromPreferences = normalizePreferenceData(input.preferences ?? {});

  return {
    region:
      input.region !== undefined
        ? (normalizeOptionalText(input.region, true) ?? null)
        : (normalizedFromPreferences.region ?? null),
    jobTitle:
      input.jobTitle !== undefined
        ? (normalizeOptionalText(input.jobTitle) ?? null)
        : (normalizedFromPreferences.jobTitle ?? null),
    heightCm:
      input.heightCm !== undefined
        ? (normalizeOptionalNumber(input.heightCm, 120, 230) ?? null)
        : (normalizedFromPreferences.heightCm ?? null),
    smokingHabit:
      input.smokingHabit !== undefined
        ? (normalizeSmokingHabitValue(input.smokingHabit) ?? null)
        : (normalizedFromPreferences.smokingHabit ?? null),
    drinkingHabit:
      input.drinkingHabit !== undefined
        ? (normalizeDrinkingHabitValue(input.drinkingHabit) ?? null)
        : (normalizedFromPreferences.drinkingHabit ?? null),
    preferredAgeRange:
      input.preferredAgeRange !== undefined
        ? (normalizeRange(input.preferredAgeRange, 19, 100) ?? null)
        : (normalizedFromPreferences.ageRange ?? null),
    preferredRegions:
      input.preferredRegions !== undefined
        ? (normalizeStringArray(input.preferredRegions, true) ?? [])
        : (normalizedFromPreferences.preferredRegions ?? []),
    preferredJobGroups:
      input.preferredJobGroups !== undefined
        ? (normalizeStringArray(input.preferredJobGroups, true) ?? [])
        : (normalizedFromPreferences.preferredJobGroups ?? []),
    preferredSmoking:
      input.preferredSmoking !== undefined
        ? (normalizeSmokingPreferenceValue(input.preferredSmoking) ?? null)
        : (normalizedFromPreferences.preferredSmoking ?? null),
    preferredDrinking:
      input.preferredDrinking !== undefined
        ? (normalizeDrinkingPreferenceValue(input.preferredDrinking) ?? null)
        : (normalizedFromPreferences.preferredDrinking ?? null),
    preferredGenders:
      input.preferredGenders !== undefined
        ? (normalizeGenderPreferenceValues(input.preferredGenders) ?? [])
        : (normalizedFromPreferences.preferredGenders ?? []),
    preferredHeightRange:
      input.preferredHeightRange !== undefined
        ? (normalizeRange(input.preferredHeightRange, 120, 230) ?? null)
        : (normalizedFromPreferences.preferredHeightRange ?? null),
    mustHaveConditionKeys:
      input.mustHaveConditionKeys !== undefined
        ? (normalizeMustHaveConditionKeys(input.mustHaveConditionKeys) ?? [])
        : (normalizedFromPreferences.mustHaveConditionKeys ?? [])
  };
}

export function createFlexiblePreferencePayload(
  preferences: PreferenceData | undefined,
  structured: StructuredCupidateFields
): PreferenceData {
  return normalizeFlexiblePreferencePayload(
    resolveCupidatePreferenceData(preferences ?? {}, structured)
  );
}

export function hydrateCupidatePreferences(
  preferences: PreferenceData | undefined,
  structured: StructuredCupidateFields
): PreferenceData {
  return resolveCupidatePreferenceData(preferences ?? {}, structured);
}
