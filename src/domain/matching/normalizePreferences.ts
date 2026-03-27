import type { PreferenceData } from "./types";

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

function normalizeHobbies(hobbies?: string[]): string[] {
  if (!hobbies?.length) {
    return [];
  }

  const normalized = hobbies
    .map((hobby) => hobby.trim().toLowerCase())
    .filter(Boolean);

  return Array.from(new Set(normalized));
}

export function normalizePreferenceData(input: PreferenceData): PreferenceData {
  return {
    ageRange: clampAgeRange(input.ageRange),
    hobbies: normalizeHobbies(input.hobbies),
    smoking: input.smoking ?? "any",
    drinking: input.drinking ?? "any",
    location: input.location?.trim().toLowerCase() || undefined
  };
}
