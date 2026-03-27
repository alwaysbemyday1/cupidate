import type { IdealPreferenceInput, NumericRange, UserProfileInput } from "./profileInput";

function normalizeString(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length ? normalized : undefined;
}

function normalizeStringList(values?: string[]): string[] | undefined {
  if (!values?.length) {
    return undefined;
  }

  const normalized = values
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!normalized.length) {
    return undefined;
  }

  return Array.from(new Set(normalized));
}

function normalizeRange(range?: NumericRange): NumericRange | undefined {
  if (!range) {
    return undefined;
  }

  const min = Math.min(range.min, range.max);
  const max = Math.max(range.min, range.max);
  return { min, max };
}

function normalizeDateString(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.trim();
  }
  return date.toISOString().slice(0, 10);
}

export function normalizeUserProfileInput(input: UserProfileInput): UserProfileInput {
  return {
    ...input,
    basic: {
      ...input.basic,
      nickname: input.basic.nickname.trim(),
      birthDate: normalizeDateString(input.basic.birthDate),
      residenceRegion: input.basic.residenceRegion.trim().toLowerCase(),
      originRegion: normalizeString(input.basic.originRegion)?.toLowerCase(),
      phone: input.basic.phone.replace(/\s+/g, ""),
      email: input.basic.email.trim().toLowerCase()
    },
    appearance: {
      ...input.appearance,
      profilePhotos: input.appearance.profilePhotos.map((photo) => photo.trim()).filter(Boolean),
      styleTags: normalizeStringList(input.appearance.styleTags)
    },
    personal: {
      ...input.personal,
      jobTitle: normalizeString(input.personal.jobTitle),
      company: normalizeString(input.personal.company),
      educationLevel: normalizeString(input.personal.educationLevel),
      schoolName: normalizeString(input.personal.schoolName),
      incomeRange: normalizeString(input.personal.incomeRange),
      familyDescription: normalizeString(input.personal.familyDescription)
    },
    lifestyle: {
      ...input.lifestyle,
      exerciseTags: normalizeStringList(input.lifestyle.exerciseTags),
      pets: normalizeStringList(input.lifestyle.pets)
    },
    personality: {
      ...input.personality,
      mbti: normalizeString(input.personality.mbti)?.toUpperCase(),
      personalityTags: normalizeStringList(input.personality.personalityTags),
      hobbyTags: normalizeStringList(input.personality.hobbyTags) || [],
      relationshipStyle: normalizeString(input.personality.relationshipStyle),
      marriageIntent: normalizeString(input.personality.marriageIntent),
      idealTypeNotes: normalizeString(input.personality.idealTypeNotes)
    },
    social: {
      ...input.social,
      matchingPreferenceNotes: normalizeString(input.social.matchingPreferenceNotes)
    }
  };
}

export function normalizeIdealPreferenceInput(input: IdealPreferenceInput): IdealPreferenceInput {
  return {
    ...input,
    basic: {
      ...input.basic,
      ageRange: normalizeRange(input.basic.ageRange) || input.basic.ageRange,
      preferredRegions: normalizeStringList(input.basic.preferredRegions) || [],
      heightRange: normalizeRange(input.basic.heightRange),
      preferredBodyTypes: input.basic.preferredBodyTypes
    },
    appearance: input.appearance
      ? {
          ...input.appearance,
          styleTags: normalizeStringList(input.appearance.styleTags),
          hairStyles: normalizeStringList(input.appearance.hairStyles),
          fashionStyles: normalizeStringList(input.appearance.fashionStyles)
        }
      : undefined,
    social: input.social
      ? {
          ...input.social,
          preferredJobCategories: normalizeStringList(input.social.preferredJobCategories),
          minimumEducation: normalizeString(input.social.minimumEducation),
          incomeRange: normalizeString(input.social.incomeRange),
          socialStatusNotes: normalizeString(input.social.socialStatusNotes)
        }
      : undefined,
    lifestyle: input.lifestyle
      ? {
          ...input.lifestyle,
          activityTags: normalizeStringList(input.lifestyle.activityTags)
        }
      : undefined,
    personality: input.personality
      ? {
          ...input.personality,
          preferredMbti: normalizeStringList(input.personality.preferredMbti)?.map((value) => value.toUpperCase()),
          valueKeywords: normalizeStringList(input.personality.valueKeywords),
          datingStyles: normalizeStringList(input.personality.datingStyles)
        }
      : undefined,
    extra: input.extra
      ? {
          ...input.extra,
          customConditions: normalizeStringList(input.extra.customConditions)
        }
      : undefined
  };
}
