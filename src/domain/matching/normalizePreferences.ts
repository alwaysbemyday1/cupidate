import type {
  DrinkingHabit,
  DrinkingPreference,
  GenderPreference,
  PreferenceData,
  SmokingHabit,
  SmokingPreference
} from "./types";

function clampAgeRange(range?: [number, number] | null): [number, number] | null {
  if (!range) {
    return null;
  }

  const min = Math.max(18, Math.min(range[0], range[1]));
  const max = Math.min(100, Math.max(range[0], range[1]));

  if (min > max) {
    return null;
  }

  return [min, max];
}

function clampHeightRange(range?: [number, number] | null): [number, number] | null {
  if (!range) {
    return null;
  }

  const min = Math.max(120, Math.min(range[0], range[1]));
  const max = Math.min(230, Math.max(range[0], range[1]));

  if (min > max) {
    return null;
  }

  return [min, max];
}

function normalizeTags(tags?: string[]): string[] {
  if (!tags?.length) {
    return [];
  }

  const normalized = tags
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(normalized));
}

function normalizeRegions(regions?: string[]): string[] {
  if (!regions?.length) {
    return [];
  }

  const normalized = regions
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(normalized));
}

function normalizeGenderPreferences(values?: string[]): GenderPreference[] {
  if (!values?.length) {
    return [];
  }

  const allowed = new Set<GenderPreference>(["female", "male", "other"]);
  return Array.from(
    new Set(
      values
        .map((value) => value.trim().toLowerCase())
        .filter((value): value is GenderPreference => allowed.has(value as GenderPreference))
    )
  );
}

function normalizeSmokingHabit(value: unknown): SmokingHabit | undefined {
  switch (value) {
    case "none":
      return "none";
    case "sometimes":
      return "sometimes";
    case "often":
      return "often";
    case "no":
      return "none";
    case "yes":
      return "often";
    default:
      return undefined;
  }
}

function normalizeSmokingPreference(value: unknown): SmokingPreference {
  switch (value) {
    case "none_only":
      return "none_only";
    case "ok":
      return "ok";
    case "no":
      return "none_only";
    case "yes":
      return "ok";
    default:
      return "any";
  }
}

function normalizeDrinkingHabit(value: unknown): DrinkingHabit | undefined {
  switch (value) {
    case "never":
      return "never";
    case "social":
      return "social";
    case "often":
      return "often";
    default:
      return undefined;
  }
}

function normalizeDrinkingPreference(value: unknown): DrinkingPreference {
  switch (value) {
    case "never":
      return "never";
    case "social":
      return "social";
    case "often":
      return "often";
    default:
      return "any";
  }
}

function normalizeHeight(value: number | null | undefined): number | undefined {
  if (!value || Number.isNaN(value)) {
    return undefined;
  }

  if (value < 120 || value > 230) {
    return undefined;
  }

  return Math.round(value);
}

export function normalizePreferenceData(input: PreferenceData): PreferenceData {
  const region = (input.region ?? input.location)?.trim().toLowerCase() || undefined;
  const preferredRegions = normalizeRegions(input.preferredRegions);

  return {
    ageRange: clampAgeRange(input.ageRange),
    preferredHeightRange: clampHeightRange(input.preferredHeightRange),
    hobbies: normalizeTags(input.hobbies),
    region,
    preferredRegions: preferredRegions.length > 0 ? preferredRegions : region ? [region] : [],
    smokingHabit: normalizeSmokingHabit(input.smokingHabit ?? input.smoking),
    drinkingHabit: normalizeDrinkingHabit(input.drinkingHabit ?? input.drinking),
    preferredSmoking: normalizeSmokingPreference(input.preferredSmoking ?? input.smoking),
    preferredDrinking: normalizeDrinkingPreference(input.preferredDrinking ?? input.drinking),
    preferredGenders: normalizeGenderPreferences(input.preferredGenders),
    jobTitle: input.jobTitle?.trim(),
    heightCm: normalizeHeight(input.heightCm),
    mbti: input.mbti?.trim().toUpperCase()
  };
}
