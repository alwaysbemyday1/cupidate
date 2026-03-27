import type { IdealPreferenceInput, UserProfileInput } from "../profileInput";
import { validateIdealPreferenceInput, validateUserProfileInput } from "../profileValidation";

const validProfile: UserProfileInput = {
  basic: {
    nickname: "mira",
    birthDate: "1998-03-12",
    gender: "female",
    residenceRegion: "seoul",
    phone: "010-1234-5678",
    email: "mira@example.com"
  },
  appearance: {
    heightCm: 165,
    bodyType: "average",
    profilePhotos: ["main-photo.jpg"]
  },
  personal: {},
  lifestyle: {
    smoking: "none",
    drinking: "social"
  },
  personality: {
    mbti: "ENFP",
    hobbyTags: ["hiking", "music"]
  },
  social: {
    blockedContactsEnabled: true,
    privacyScope: "connected_only"
  }
};

const validPreference: IdealPreferenceInput = {
  basic: {
    ageRange: { min: 25, max: 35 },
    preferredRegions: ["seoul"],
    heightRange: { min: 165, max: 185 }
  },
  relationship: {
    marriageIntent: "preferred",
    childrenPlan: "open",
    meetingPurpose: "serious"
  }
};

describe("validateUserProfileInput", () => {
  it("accepts a valid profile payload", () => {
    const result = validateUserProfileInput(validProfile);
    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("returns issues for missing required fields", () => {
    const result = validateUserProfileInput({
      ...validProfile,
      basic: {
        ...validProfile.basic,
        nickname: "",
        phone: "abc",
        email: "wrong-email"
      },
      appearance: {
        ...validProfile.appearance,
        profilePhotos: []
      }
    });

    expect(result.isValid).toBe(false);
    expect(result.issues.map((item) => item.path)).toEqual(
      expect.arrayContaining(["basic.nickname", "basic.phone", "basic.email", "appearance.profilePhotos"])
    );
  });
});

describe("validateIdealPreferenceInput", () => {
  it("accepts a valid preference payload", () => {
    const result = validateIdealPreferenceInput(validPreference);
    expect(result.isValid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it("returns issues for invalid ranges", () => {
    const result = validateIdealPreferenceInput({
      ...validPreference,
      basic: {
        ...validPreference.basic,
        ageRange: { min: 40, max: 30 },
        preferredRegions: []
      },
      extra: {
        maxDistanceKm: 700
      }
    });

    expect(result.isValid).toBe(false);
    expect(result.issues.map((item) => item.path)).toEqual(
      expect.arrayContaining(["basic.ageRange", "basic.preferredRegions", "extra.maxDistanceKm"])
    );
  });
});
