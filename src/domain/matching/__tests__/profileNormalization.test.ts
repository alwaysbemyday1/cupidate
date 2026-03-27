import type { IdealPreferenceInput, UserProfileInput } from "../profileInput";
import { normalizeIdealPreferenceInput, normalizeUserProfileInput } from "../profileNormalization";

describe("normalizeUserProfileInput", () => {
  it("normalizes case, trimming and tag duplicates", () => {
    const payload: UserProfileInput = {
      basic: {
        nickname: "  mira  ",
        birthDate: "1998-03-12",
        gender: "female",
        residenceRegion: "  SEOUL ",
        originRegion: "  Busan ",
        phone: "010 1234 5678",
        email: " MIRA@EXAMPLE.COM "
      },
      appearance: {
        profilePhotos: [" img1 ", "img1", "  "],
        styleTags: ["Cute", "cute", "clean"]
      },
      personal: {},
      lifestyle: {},
      personality: {
        mbti: "enfp",
        hobbyTags: ["Music", "music", " travel "]
      },
      social: {
        blockedContactsEnabled: false,
        privacyScope: "network_only"
      }
    };

    const normalized = normalizeUserProfileInput(payload);

    expect(normalized.basic.nickname).toBe("mira");
    expect(normalized.basic.residenceRegion).toBe("seoul");
    expect(normalized.basic.originRegion).toBe("busan");
    expect(normalized.basic.email).toBe("mira@example.com");
    expect(normalized.personality.mbti).toBe("ENFP");
    expect(normalized.personality.hobbyTags).toEqual(["music", "travel"]);
  });
});

describe("normalizeIdealPreferenceInput", () => {
  it("normalizes ranges and list values", () => {
    const payload: IdealPreferenceInput = {
      basic: {
        ageRange: { min: 35, max: 25 },
        preferredRegions: [" Seoul ", "seoul", "Busan"],
        heightRange: { min: 185, max: 165 }
      },
      relationship: {
        marriageIntent: "preferred",
        childrenPlan: "open",
        meetingPurpose: "serious"
      },
      personality: {
        preferredMbti: ["enfp", "ENFP", "infj"]
      }
    };

    const normalized = normalizeIdealPreferenceInput(payload);

    expect(normalized.basic.ageRange).toEqual({ min: 25, max: 35 });
    expect(normalized.basic.heightRange).toEqual({ min: 165, max: 185 });
    expect(normalized.basic.preferredRegions).toEqual(["seoul", "busan"]);
    expect(normalized.personality?.preferredMbti).toEqual(["ENFP", "INFJ"]);
  });
});
