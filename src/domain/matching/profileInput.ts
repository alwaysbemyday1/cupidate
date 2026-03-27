export type Gender = "female" | "male" | "other";
export type BodyType = "slim" | "average" | "chubby" | "athletic";
export type Religion = "none" | "protestant" | "catholic" | "buddhist" | "other";
export type SmokingHabit = "none" | "sometimes" | "often";
export type DrinkingHabit = "never" | "social" | "often";
export type HousingType = "own" | "lease" | "monthly_rent" | "with_parents" | "other";
export type MarriageHistory = "single" | "divorced" | "widowed" | "other";
export type MeetingPurpose = "serious" | "casual" | "marriage";
export type PrivacyScope = "network_only" | "connected_only" | "private";

export type NumericRange = {
  min: number;
  max: number;
};

export type UserBasicInfo = {
  nickname: string;
  birthDate: string;
  gender: Gender;
  residenceRegion: string;
  originRegion?: string;
  phone: string;
  email: string;
};

export type UserAppearanceInfo = {
  heightCm?: number;
  bodyType?: BodyType;
  profilePhotos: string[];
  styleTags?: string[];
};

export type UserPersonalInfo = {
  jobTitle?: string;
  company?: string;
  educationLevel?: string;
  schoolName?: string;
  incomeRange?: string;
  marriageHistory?: MarriageHistory;
  hasChildren?: boolean;
  wantsChildren?: boolean;
  familyDescription?: string;
};

export type UserLifestyleInfo = {
  religion?: Religion;
  smoking?: SmokingHabit;
  drinking?: DrinkingHabit;
  exerciseTags?: string[];
  pets?: string[];
  housingType?: HousingType;
};

export type UserPersonalityInfo = {
  mbti?: string;
  personalityTags?: string[];
  hobbyTags: string[];
  relationshipStyle?: string;
  marriageIntent?: string;
  idealTypeNotes?: string;
};

export type UserVerificationInfo = {
  schoolVerified?: boolean;
  companyVerified?: boolean;
  incomeVerified?: boolean;
  identityVerified?: boolean;
  snsConnected?: boolean;
  referrerVerified?: boolean;
};

export type UserSocialInfo = {
  blockedContactsEnabled: boolean;
  privacyScope: PrivacyScope;
  matchingPreferenceNotes?: string;
};

export type UserProfileInput = {
  basic: UserBasicInfo;
  appearance: UserAppearanceInfo;
  personal: UserPersonalInfo;
  lifestyle: UserLifestyleInfo;
  personality: UserPersonalityInfo;
  verification?: UserVerificationInfo;
  social: UserSocialInfo;
};

export type PreferenceBasicConditions = {
  ageRange: NumericRange;
  preferredRegions: string[];
  heightRange?: NumericRange;
  preferredBodyTypes?: BodyType[];
};

export type PreferenceAppearanceConditions = {
  styleTags?: string[];
  hairStyles?: string[];
  fashionStyles?: string[];
};

export type PreferenceSocialConditions = {
  preferredJobCategories?: string[];
  minimumEducation?: string;
  incomeRange?: string;
  socialStatusNotes?: string;
};

export type PreferenceLifestyleConditions = {
  smokingPreference?: "none_only" | "ok" | "any";
  drinkingPreference?: "never" | "social" | "any";
  religionPreference?: Religion | "any";
  activityTags?: string[];
};

export type PreferencePersonalityConditions = {
  preferredMbti?: string[];
  valueKeywords?: string[];
  datingStyles?: string[];
};

export type PreferenceRelationshipConditions = {
  marriageIntent: "required" | "preferred" | "not_required";
  childrenPlan: "want" | "dont_want" | "open";
  meetingPurpose: MeetingPurpose;
};

export type PreferenceExtraConditions = {
  maxDistanceKm?: number;
  customConditions?: string[];
};

export type IdealPreferenceInput = {
  basic: PreferenceBasicConditions;
  appearance?: PreferenceAppearanceConditions;
  social?: PreferenceSocialConditions;
  lifestyle?: PreferenceLifestyleConditions;
  personality?: PreferencePersonalityConditions;
  relationship: PreferenceRelationshipConditions;
  extra?: PreferenceExtraConditions;
};
