import type { IdealPreferenceInput, NumericRange, UserProfileInput } from "./profileInput";

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  issues: ValidationIssue[];
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+][0-9-]{7,19}$/;
const MBTI_REGEX = /^(INTJ|INTP|ENTJ|ENTP|INFJ|INFP|ENFJ|ENFP|ISTJ|ISFJ|ESTJ|ESFJ|ISTP|ISFP|ESTP|ESFP)$/i;

function issue(path: string, message: string): ValidationIssue {
  return { path, message };
}

function validateRange(
  value: NumericRange | undefined,
  path: string,
  minBoundary: number,
  maxBoundary: number
): ValidationIssue[] {
  if (!value) {
    return [];
  }

  const issues: ValidationIssue[] = [];
  if (value.min > value.max) {
    issues.push(issue(path, "min must be less than or equal to max"));
  }
  if (value.min < minBoundary || value.max > maxBoundary) {
    issues.push(issue(path, `range must be within ${minBoundary}-${maxBoundary}`));
  }
  return issues;
}

export function validateUserProfileInput(input: UserProfileInput): ValidationResult {
  const issues: ValidationIssue[] = [];
  const currentYear = new Date().getFullYear();

  if (!input.basic.nickname.trim()) {
    issues.push(issue("basic.nickname", "nickname is required"));
  }
  if (!input.basic.birthDate) {
    issues.push(issue("basic.birthDate", "birthDate is required"));
  } else {
    const date = new Date(input.basic.birthDate);
    if (Number.isNaN(date.getTime())) {
      issues.push(issue("basic.birthDate", "birthDate must be a valid date string"));
    } else {
      const age = currentYear - date.getUTCFullYear();
      if (age < 19 || age > 100) {
        issues.push(issue("basic.birthDate", "derived age must be between 19 and 100"));
      }
    }
  }

  if (!input.basic.residenceRegion.trim()) {
    issues.push(issue("basic.residenceRegion", "residenceRegion is required"));
  }
  if (!PHONE_REGEX.test(input.basic.phone)) {
    issues.push(issue("basic.phone", "phone must be a valid phone format"));
  }
  if (!EMAIL_REGEX.test(input.basic.email)) {
    issues.push(issue("basic.email", "email must be a valid email format"));
  }

  if (!input.appearance.profilePhotos.length) {
    issues.push(issue("appearance.profilePhotos", "at least one profile photo is required"));
  }
  if (input.appearance.profilePhotos.length > 6) {
    issues.push(issue("appearance.profilePhotos", "maximum profile photos is 6"));
  }
  if (input.appearance.heightCm && (input.appearance.heightCm < 120 || input.appearance.heightCm > 230)) {
    issues.push(issue("appearance.heightCm", "heightCm must be within 120-230"));
  }

  if (!input.personality.hobbyTags.length) {
    issues.push(issue("personality.hobbyTags", "at least one hobby tag is required"));
  }

  if (input.personality.mbti && !MBTI_REGEX.test(input.personality.mbti)) {
    issues.push(issue("personality.mbti", "mbti must be one of 16 MBTI types"));
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

export function validateIdealPreferenceInput(input: IdealPreferenceInput): ValidationResult {
  const issues: ValidationIssue[] = [];

  issues.push(...validateRange(input.basic.ageRange, "basic.ageRange", 19, 100));
  issues.push(...validateRange(input.basic.heightRange, "basic.heightRange", 120, 230));

  if (!input.basic.preferredRegions.length) {
    issues.push(issue("basic.preferredRegions", "at least one preferred region is required"));
  }

  if (input.extra?.maxDistanceKm !== undefined && (input.extra.maxDistanceKm < 1 || input.extra.maxDistanceKm > 500)) {
    issues.push(issue("extra.maxDistanceKm", "maxDistanceKm must be within 1-500"));
  }

  if (input.personality?.preferredMbti) {
    const invalid = input.personality.preferredMbti.find((mbti) => !MBTI_REGEX.test(mbti));
    if (invalid) {
      issues.push(issue("personality.preferredMbti", `invalid MBTI: ${invalid}`));
    }
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}
