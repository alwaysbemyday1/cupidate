import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import {
  MAX_MUST_HAVE_CONDITIONS,
  PREFERENCE_CONDITION_KEYS,
  type PreferenceConditionKey
} from "../../../domain/matching/types";
import { useI18n } from "../../i18n/context";
import { PixelBox } from "../components/PixelBox";
import { PixelButton } from "../components/PixelButton";
import { PixelText } from "../components/PixelText";
import type {
  CupidProfileSummary,
  CupidateProfileDraft,
  CupidateProfileSummary,
  SelectedProfileSummary
} from "../model/types";
import { styles } from "../styles";
import { designTokens } from "../theme/tokens";

type ProfileViewProps = {
  profile: SelectedProfileSummary;
  onClose: () => void;
  onSaveCupidateProfile?: (draft: CupidateProfileDraft) => void | Promise<void>;
  isSavingCupidateProfile?: boolean;
};

type CupidateEditState = {
  displayName: string;
  birthYearInput: string;
  gender: string;
  bio: string;
  locationInput: string;
  jobTitleInput: string;
  heightInput: string;
  hobbiesInput: string;
  smokingHabit: "none" | "sometimes" | "often";
  drinkingHabit: "never" | "social" | "often";
  preferredAgeMinInput: string;
  preferredAgeMaxInput: string;
  preferredRegionsInput: string;
  preferredJobGroupsInput: string;
  preferredSmoking: "none_only" | "ok" | "any";
  preferredDrinking: "never" | "social" | "often" | "any";
  preferredGender: "any" | "male" | "female" | "other";
  preferredHeightMinInput: string;
  preferredHeightMaxInput: string;
  mustHaveConditionKeys: PreferenceConditionKey[];
  isActive: boolean;
};

const placeholderTextColor = designTokens.color.inkMuted;

function ageLabel(birthYear: number | null) {
  if (!birthYear) {
    return "--";
  }

  return `${new Date().getFullYear() - birthYear}`;
}

function buildAvatarSeed(label: string) {
  const trimmed = label.trim();

  if (!trimmed) {
    return "CP";
  }

  return Array.from(trimmed.replace(/\s+/g, "")).slice(0, 2).join("").toUpperCase();
}

function genderText(gender: string, t: ReturnType<typeof useI18n>["t"]) {
  if (gender === "male") {
    return t("network.option.gender.male");
  }

  if (gender === "female") {
    return t("network.option.gender.female");
  }

  if (gender === "other") {
    return t("network.option.gender.other");
  }

  return t("network.option.unspecified");
}

function smokingText(smokingHabit: string | null | undefined, t: ReturnType<typeof useI18n>["t"]) {
  if (smokingHabit === "none") {
    return t("network.option.smoking.none");
  }

  if (smokingHabit === "sometimes") {
    return t("network.option.smoking.sometimes");
  }

  if (smokingHabit === "often") {
    return t("network.option.smoking.often");
  }

  return t("network.option.unspecified");
}

function drinkingText(drinkingHabit: string | null | undefined, t: ReturnType<typeof useI18n>["t"]) {
  if (drinkingHabit === "never") {
    return t("network.option.drinking.never");
  }

  if (drinkingHabit === "social") {
    return t("network.option.drinking.social");
  }

  if (drinkingHabit === "often") {
    return t("network.option.drinking.often");
  }

  return t("network.option.unspecified");
}

function preferredSmokingText(
  preferredSmoking: string | null | undefined,
  t: ReturnType<typeof useI18n>["t"]
) {
  if (preferredSmoking === "none_only") {
    return t("network.option.preferredSmoking.none_only");
  }

  if (preferredSmoking === "ok") {
    return t("network.option.preferredSmoking.ok");
  }

  if (preferredSmoking === "any") {
    return t("network.option.preferredSmoking.any");
  }

  return t("network.option.unspecified");
}

function preferredDrinkingText(
  preferredDrinking: string | null | undefined,
  t: ReturnType<typeof useI18n>["t"]
) {
  if (preferredDrinking === "never") {
    return t("network.option.preferredDrinking.never");
  }

  if (preferredDrinking === "social") {
    return t("network.option.preferredDrinking.social");
  }

  if (preferredDrinking === "often") {
    return t("network.option.preferredDrinking.often");
  }

  if (preferredDrinking === "any") {
    return t("network.option.preferredDrinking.any");
  }

  return t("network.option.unspecified");
}

function relationKey(relationship: CupidProfileSummary["relationship"]) {
  return `profile.relationship.${relationship}`;
}

function renderMetaLine(label: string, value: string) {
  return (
    <View style={styles.profileSheetMetaRow}>
      <PixelText variant="caption" style={styles.profileSheetMetaLabel}>
        {label}
      </PixelText>
      <PixelText variant="body" style={styles.profileSheetMetaValue}>
        {value}
      </PixelText>
    </View>
  );
}

function renderStatPill(label: string, value: string | number) {
  return (
    <View style={styles.profileSheetStatPill}>
      <PixelText variant="caption" style={styles.metricLabel}>
        {label}
      </PixelText>
      <PixelText variant="body" style={styles.metricValue}>
        {value}
      </PixelText>
    </View>
  );
}

function parseOptionalNumber(input: string): number | undefined {
  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseRange(minInput: string, maxInput: string): [number, number] | undefined {
  const min = parseOptionalNumber(minInput);
  const max = parseOptionalNumber(maxInput);

  if (min === undefined || max === undefined) {
    return undefined;
  }

  return [Math.min(min, max), Math.max(min, max)];
}

function parseTags(input: string) {
  return input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildEditState(profile: CupidateProfileSummary): CupidateEditState {
  return {
    displayName: profile.displayName,
    birthYearInput: profile.birthYear ? String(profile.birthYear) : "",
    gender: profile.gender,
    bio: profile.bio,
    locationInput: profile.region ?? profile.preferences.location ?? profile.preferences.region ?? "",
    jobTitleInput: profile.jobTitle ?? profile.preferences.jobTitle ?? "",
    heightInput: profile.heightCm ? String(profile.heightCm) : profile.preferences.heightCm ? String(profile.preferences.heightCm) : "",
    hobbiesInput: profile.preferences.hobbies?.join(", ") ?? "",
    smokingHabit: profile.smokingHabit ?? profile.preferences.smokingHabit ?? "none",
    drinkingHabit: profile.drinkingHabit ?? profile.preferences.drinkingHabit ?? "social",
    preferredAgeMinInput: profile.preferredAgeRange
      ? String(profile.preferredAgeRange[0])
      : profile.preferences.ageRange
        ? String(profile.preferences.ageRange[0])
        : "",
    preferredAgeMaxInput: profile.preferredAgeRange
      ? String(profile.preferredAgeRange[1])
      : profile.preferences.ageRange
        ? String(profile.preferences.ageRange[1])
        : "",
    preferredRegionsInput: profile.preferredRegions?.join(", ") ?? profile.preferences.preferredRegions?.join(", ") ?? "",
    preferredJobGroupsInput:
      profile.preferredJobGroups?.join(", ") ?? profile.preferences.preferredJobGroups?.join(", ") ?? "",
    preferredSmoking: profile.preferredSmoking ?? profile.preferences.preferredSmoking ?? "any",
    preferredDrinking: profile.preferredDrinking ?? profile.preferences.preferredDrinking ?? "any",
    preferredGender:
      profile.preferredGenders && profile.preferredGenders.length > 0
        ? profile.preferredGenders[0]
        : profile.preferences.preferredGenders && profile.preferences.preferredGenders.length > 0
          ? profile.preferences.preferredGenders[0]
        : "any",
    preferredHeightMinInput: profile.preferredHeightRange
      ? String(profile.preferredHeightRange[0])
      : profile.preferences.preferredHeightRange
        ? String(profile.preferences.preferredHeightRange[0])
      : "",
    preferredHeightMaxInput: profile.preferredHeightRange
      ? String(profile.preferredHeightRange[1])
      : profile.preferences.preferredHeightRange
        ? String(profile.preferences.preferredHeightRange[1])
      : "",
    mustHaveConditionKeys: profile.mustHaveConditionKeys ?? profile.preferences.mustHaveConditionKeys ?? [],
    isActive: profile.isActive
  };
}

function CupidProfilePanel({
  profile,
  t
}: {
  profile: CupidProfileSummary;
  t: ReturnType<typeof useI18n>["t"];
}) {
  return (
    <>
      <PixelBox style={styles.profileSheetCard} contentStyle={styles.profileSheetCardContent}>
        <View style={styles.profileSheetHeaderRow}>
          <View style={styles.profileSheetAvatar}>
            <PixelText variant="screenTitle" style={styles.avatarText}>
              {buildAvatarSeed(profile.nickname)}
            </PixelText>
          </View>
          <View style={styles.profileSheetHeaderInfo}>
            <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
              {profile.nickname}
            </PixelText>
            <PixelText variant="body" style={styles.textBody}>
              {t("profile.cupid.id", { id: profile.cupidId })}
            </PixelText>
            <View style={styles.profileSheetStatusChip}>
              <PixelText variant="caption" style={styles.networkStatusText}>
                {t(relationKey(profile.relationship))}
              </PixelText>
            </View>
          </View>
        </View>
      </PixelBox>

      <PixelBox style={styles.profileSheetCard} contentStyle={styles.profileSheetCardContent}>
        <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
          {t("profile.sections.matchmaking")}
        </PixelText>
        <PixelText variant="body" style={styles.textBody}>
          {t("profile.cupid.summary")}
        </PixelText>
        <View style={styles.summaryGrid}>
          {renderStatPill(t("profile.stats.managedCupidates"), profile.stats.cupidateCount)}
          {renderStatPill(t("profile.stats.activeCupidates"), profile.stats.activeCupidateCount)}
          {renderStatPill(t("profile.stats.matchmakingRequests"), profile.stats.introductions)}
          {renderStatPill(t("profile.stats.ongoing"), profile.stats.ongoingMatches)}
          {renderStatPill(t("profile.stats.romanceConversions"), profile.stats.completedMatches)}
        </View>
      </PixelBox>
    </>
  );
}

function CupidateProfilePanel({
  profile,
  isSaving,
  onSave,
  t
}: {
  profile: CupidateProfileSummary;
  isSaving?: boolean;
  onSave?: (draft: CupidateProfileDraft) => void | Promise<void>;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const [editState, setEditState] = useState<CupidateEditState>(() => buildEditState(profile));

  useEffect(() => {
    setEditState(buildEditState(profile));
  }, [profile]);

  const hobbies = useMemo(() => parseTags(editState.hobbiesInput).join(", ") || "-", [editState.hobbiesInput]);
  const regions = useMemo(
    () => parseTags(editState.preferredRegionsInput).join(", ") || "-",
    [editState.preferredRegionsInput]
  );
  const jobGroups = useMemo(
    () => parseTags(editState.preferredJobGroupsInput).join(", ") || "-",
    [editState.preferredJobGroupsInput]
  );

  const preferredGenderLabel =
    editState.preferredGender === "any"
      ? t("network.option.preferredGender.any")
      : genderText(editState.preferredGender, t);
  const mustHaveLabels = useMemo(
    () =>
      (editState.mustHaveConditionKeys ?? [])
        .map((key) => t(`network.option.mustHave.${key}`))
        .join(", ") || "-",
    [editState.mustHaveConditionKeys, t]
  );
  const mustHaveItems = useMemo(
    () =>
      PREFERENCE_CONDITION_KEYS.map((key) => ({
        key,
        label: t(`network.option.mustHave.${key}`)
      })),
    [t]
  );
  const isMustHaveLimitReached = editState.mustHaveConditionKeys.length >= MAX_MUST_HAVE_CONDITIONS;
  const lifestyleLabel = `${smokingText(profile.smokingHabit ?? profile.preferences.smokingHabit, t)} / ${drinkingText(
    profile.drinkingHabit ?? profile.preferences.drinkingHabit,
    t
  )}`;
  const preferredLifestyleLabel = `${preferredSmokingText(editState.preferredSmoking, t)} / ${preferredDrinkingText(
    editState.preferredDrinking,
    t
  )}`;
  const preferredAgeRange = parseRange(editState.preferredAgeMinInput, editState.preferredAgeMaxInput);
  const preferredHeightRange = parseRange(
    editState.preferredHeightMinInput,
    editState.preferredHeightMaxInput
  );

  function toggleMustHaveCondition(key: PreferenceConditionKey) {
    setEditState((current) => {
      if (current.mustHaveConditionKeys.includes(key)) {
        return {
          ...current,
          mustHaveConditionKeys: current.mustHaveConditionKeys.filter((item) => item !== key)
        };
      }

      if (current.mustHaveConditionKeys.length >= MAX_MUST_HAVE_CONDITIONS) {
        return current;
      }

      return {
        ...current,
        mustHaveConditionKeys: [...current.mustHaveConditionKeys, key]
      };
    });
  }

  async function handleSave() {
    if (!onSave) {
      return;
    }

    const birthYear = parseOptionalNumber(editState.birthYearInput) ?? null;
    const heightCm = parseOptionalNumber(editState.heightInput);
    const location = editState.locationInput.trim().toLowerCase();
    const preferredRegions = parseTags(editState.preferredRegionsInput);
    const preferredJobGroups = parseTags(editState.preferredJobGroupsInput);

    await onSave({
      cupidateId: profile.cupidateId,
      displayName: editState.displayName,
      birthYear,
      gender: editState.gender,
      bio: editState.bio,
      isActive: editState.isActive,
      region: location || null,
      jobTitle: editState.jobTitleInput.trim() || null,
      heightCm: heightCm ?? null,
      smokingHabit: editState.smokingHabit,
      drinkingHabit: editState.drinkingHabit,
      preferredAgeRange,
      preferredRegions,
      preferredJobGroups,
      preferredSmoking: editState.preferredSmoking,
      preferredDrinking: editState.preferredDrinking,
      preferredGenders: editState.preferredGender === "any" ? [] : [editState.preferredGender],
      preferredHeightRange,
      mustHaveConditionKeys: editState.mustHaveConditionKeys,
      preferences: {
        ...profile.preferences,
        location: location || undefined,
        region: location || undefined,
        jobTitle: editState.jobTitleInput.trim() || undefined,
        heightCm,
        hobbies: parseTags(editState.hobbiesInput),
        smokingHabit: editState.smokingHabit,
        drinkingHabit: editState.drinkingHabit,
        ageRange: preferredAgeRange,
        preferredRegions,
        preferredJobGroups,
        preferredSmoking: editState.preferredSmoking,
        preferredDrinking: editState.preferredDrinking,
        preferredGenders: editState.preferredGender === "any" ? [] : [editState.preferredGender],
        preferredHeightRange,
        mustHaveConditionKeys: editState.mustHaveConditionKeys
      }
    });
  }

  return (
    <>
      <PixelBox style={styles.profileSheetCard} contentStyle={styles.profileSheetCardContent}>
        <View style={styles.profileSheetHeaderRow}>
          <View style={styles.profileSheetAvatar}>
            <PixelText variant="screenTitle" style={styles.avatarText}>
              {buildAvatarSeed(profile.displayName)}
            </PixelText>
          </View>
          <View style={styles.profileSheetHeaderInfo}>
            <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
              {profile.displayName}
            </PixelText>
            <PixelText variant="body" style={styles.textBody}>
              {t("profile.cupidate.owner", { owner: profile.ownerNickname })}
            </PixelText>
            <View style={styles.profileSheetStatusChip}>
              <PixelText variant="caption" style={styles.networkStatusText}>
                {editState.isActive ? t("profile.cupidate.active") : t("profile.cupidate.inactive")}
              </PixelText>
            </View>
          </View>
        </View>

        <View style={styles.profileSheetMetaList}>
          {renderMetaLine(t("profile.meta.age"), ageLabel(profile.birthYear))}
          {renderMetaLine(t("profile.meta.gender"), genderText(profile.gender, t))}
          {renderMetaLine(t("profile.meta.region"), profile.region ?? profile.preferences.location ?? profile.preferences.region ?? "-")}
          {renderMetaLine(t("profile.meta.job"), profile.jobTitle ?? profile.preferences.jobTitle ?? "-")}
          {renderMetaLine(
            t("profile.meta.height"),
            profile.heightCm ?? profile.preferences.heightCm ? `${profile.heightCm ?? profile.preferences.heightCm} cm` : "-"
          )}
        </View>
      </PixelBox>

      <PixelBox style={styles.profileSheetCard} contentStyle={styles.profileSheetCardContent}>
        <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
          {t("profile.sections.publicProfile")}
        </PixelText>
        <PixelText variant="caption" style={styles.profileMetaText}>
          {t("profile.cupidate.snapshotHint")}
        </PixelText>
        <PixelText variant="body" style={styles.textBody}>
          {editState.bio || t("profile.cupidate.noBio")}
        </PixelText>
        <View style={styles.profileDivider} />
        {renderMetaLine(t("profile.meta.hobbies"), hobbies)}
        {renderMetaLine(t("profile.meta.lifestyle"), lifestyleLabel)}
      </PixelBox>

      <PixelBox style={styles.profileSheetCard} contentStyle={styles.profileSheetCardContent}>
        <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
          {t("profile.sections.preferences")}
        </PixelText>
        {renderMetaLine(
          t("profile.meta.preferredAge"),
          preferredAgeRange ? `${preferredAgeRange[0]} - ${preferredAgeRange[1]}` : "-"
        )}
        {renderMetaLine(t("profile.meta.preferredGender"), preferredGenderLabel)}
        {renderMetaLine(t("profile.meta.preferredRegions"), regions)}
        {renderMetaLine(t("profile.meta.preferredJobs"), jobGroups)}
        {renderMetaLine(t("profile.meta.preferredLifestyle"), preferredLifestyleLabel)}
        {renderMetaLine(
          t("profile.meta.preferredHeight"),
          preferredHeightRange ? `${preferredHeightRange[0]} - ${preferredHeightRange[1]} cm` : "-"
        )}
        {renderMetaLine(t("profile.meta.mustHave"), mustHaveLabels)}
      </PixelBox>

      <PixelBox style={styles.profileSheetCard} contentStyle={styles.profileSheetCardContent}>
        <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
          {t("profile.sections.activity")}
        </PixelText>
        <View style={styles.summaryGrid}>
          {renderStatPill(t("profile.stats.requests"), profile.stats.totalRequests)}
          {renderStatPill(t("profile.stats.ongoing"), profile.stats.ongoingMatches)}
          {renderStatPill(t("profile.stats.completed"), profile.stats.completedMatches)}
          {renderStatPill(
            t("profile.stats.editable"),
            profile.canEdit ? t("profile.cupidate.editableYes") : t("profile.cupidate.editableNo")
          )}
        </View>
      </PixelBox>

      {profile.canEdit ? (
        <PixelBox style={styles.profileSheetCard} contentStyle={styles.profileSheetCardContent}>
          <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
            {t("profile.sections.manage")}
          </PixelText>
          <PixelText variant="caption" style={styles.profileMetaText}>
            {t("profile.manage.caption")}
          </PixelText>

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("network.fields.name")}
          </PixelText>
          <TextInput
            value={editState.displayName}
            onChangeText={(value) => setEditState((current) => ({ ...current, displayName: value }))}
            placeholder={t("network.placeholders.name")}
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
          />

          <View style={styles.buttonRow}>
            <View style={styles.halfInput}>
              <PixelText variant="label" style={styles.fieldLabel}>
                {t("network.fields.birthYear")}
              </PixelText>
              <TextInput
                value={editState.birthYearInput}
                onChangeText={(value) => setEditState((current) => ({ ...current, birthYearInput: value }))}
                keyboardType="numeric"
                placeholder={t("network.placeholders.birthYear")}
                placeholderTextColor={placeholderTextColor}
                style={styles.input}
              />
            </View>

            <View style={styles.halfInput}>
              <PixelText variant="label" style={styles.fieldLabel}>
                {t("network.fields.height")}
              </PixelText>
              <TextInput
                value={editState.heightInput}
                onChangeText={(value) => setEditState((current) => ({ ...current, heightInput: value }))}
                keyboardType="numeric"
                placeholder={t("network.placeholders.height")}
                placeholderTextColor={placeholderTextColor}
                style={styles.input}
              />
            </View>
          </View>

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("network.fields.gender")}
          </PixelText>
          <View style={styles.buttonRow}>
            <PixelButton
              label={t("network.option.gender.male")}
              active={editState.gender === "male"}
              onPress={() => setEditState((current) => ({ ...current, gender: "male" }))}
            />
            <PixelButton
              label={t("network.option.gender.female")}
              active={editState.gender === "female"}
              onPress={() => setEditState((current) => ({ ...current, gender: "female" }))}
            />
            <PixelButton
              label={t("network.option.gender.other")}
              active={editState.gender === "other"}
              onPress={() => setEditState((current) => ({ ...current, gender: "other" }))}
            />
          </View>

          <View style={styles.buttonRow}>
            <View style={styles.halfInput}>
              <PixelText variant="label" style={styles.fieldLabel}>
                {t("network.fields.region")}
              </PixelText>
              <TextInput
                testID="profile-edit-region"
                value={editState.locationInput}
                onChangeText={(value) => setEditState((current) => ({ ...current, locationInput: value }))}
                placeholder={t("network.placeholders.region")}
                placeholderTextColor={placeholderTextColor}
                style={styles.input}
              />
            </View>

            <View style={styles.halfInput}>
              <PixelText variant="label" style={styles.fieldLabel}>
                {t("network.fields.jobTitle")}
              </PixelText>
              <TextInput
                testID="profile-edit-job-title"
                value={editState.jobTitleInput}
                onChangeText={(value) => setEditState((current) => ({ ...current, jobTitleInput: value }))}
                placeholder={t("network.placeholders.jobTitle")}
                placeholderTextColor={placeholderTextColor}
                style={styles.input}
              />
            </View>
          </View>

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("network.fields.hobbies")}
          </PixelText>
          <TextInput
            value={editState.hobbiesInput}
            onChangeText={(value) => setEditState((current) => ({ ...current, hobbiesInput: value }))}
            placeholder={t("network.placeholders.hobbies")}
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
          />

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("network.fields.bio")}
          </PixelText>
          <TextInput
            value={editState.bio}
            onChangeText={(value) => setEditState((current) => ({ ...current, bio: value }))}
            multiline
            placeholder={t("network.placeholders.bio")}
            placeholderTextColor={placeholderTextColor}
            style={[styles.input, styles.multilineInput]}
          />

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("network.fields.smoking")}
          </PixelText>
          <View style={styles.buttonRow}>
            <PixelButton
              label={t("network.option.smoking.none")}
              active={editState.smokingHabit === "none"}
              onPress={() => setEditState((current) => ({ ...current, smokingHabit: "none" }))}
            />
            <PixelButton
              label={t("network.option.smoking.sometimes")}
              active={editState.smokingHabit === "sometimes"}
              onPress={() => setEditState((current) => ({ ...current, smokingHabit: "sometimes" }))}
            />
            <PixelButton
              label={t("network.option.smoking.often")}
              active={editState.smokingHabit === "often"}
              onPress={() => setEditState((current) => ({ ...current, smokingHabit: "often" }))}
            />
          </View>

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("network.fields.drinking")}
          </PixelText>
          <View style={styles.buttonRow}>
            <PixelButton
              label={t("network.option.drinking.never")}
              active={editState.drinkingHabit === "never"}
              onPress={() => setEditState((current) => ({ ...current, drinkingHabit: "never" }))}
            />
            <PixelButton
              label={t("network.option.drinking.social")}
              active={editState.drinkingHabit === "social"}
              onPress={() => setEditState((current) => ({ ...current, drinkingHabit: "social" }))}
            />
            <PixelButton
              label={t("network.option.drinking.often")}
              active={editState.drinkingHabit === "often"}
              onPress={() => setEditState((current) => ({ ...current, drinkingHabit: "often" }))}
            />
          </View>

          <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
            {t("network.form.preferenceTitle")}
          </PixelText>

          <View style={styles.buttonRow}>
            <View style={styles.halfInput}>
              <PixelText variant="label" style={styles.fieldLabel}>
                {t("network.fields.preferredAge")}
              </PixelText>
              <TextInput
                value={editState.preferredAgeMinInput}
                onChangeText={(value) =>
                  setEditState((current) => ({ ...current, preferredAgeMinInput: value }))
                }
                keyboardType="numeric"
                placeholder={t("network.placeholders.rangeMin")}
                placeholderTextColor={placeholderTextColor}
                style={styles.input}
              />
            </View>
            <View style={styles.halfInput}>
              <PixelText variant="label" style={styles.fieldLabel}>
                {t("network.fields.preferredAgeMax")}
              </PixelText>
              <TextInput
                value={editState.preferredAgeMaxInput}
                onChangeText={(value) =>
                  setEditState((current) => ({ ...current, preferredAgeMaxInput: value }))
                }
                keyboardType="numeric"
                placeholder={t("network.placeholders.rangeMax")}
                placeholderTextColor={placeholderTextColor}
                style={styles.input}
              />
            </View>
          </View>

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("network.fields.preferredRegions")}
          </PixelText>
          <TextInput
            value={editState.preferredRegionsInput}
            onChangeText={(value) => setEditState((current) => ({ ...current, preferredRegionsInput: value }))}
            placeholder={t("network.placeholders.preferredRegions")}
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
          />

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("network.fields.preferredJobGroups")}
          </PixelText>
          <TextInput
            testID="profile-edit-preferred-job-groups"
            value={editState.preferredJobGroupsInput}
            onChangeText={(value) => setEditState((current) => ({ ...current, preferredJobGroupsInput: value }))}
            placeholder={t("network.placeholders.preferredJobGroups")}
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
          />

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("network.fields.preferredGender")}
          </PixelText>
          <View style={styles.buttonRow}>
            <PixelButton
              label={t("network.option.preferredGender.any")}
              active={editState.preferredGender === "any"}
              onPress={() => setEditState((current) => ({ ...current, preferredGender: "any" }))}
            />
            <PixelButton
              label={t("network.option.preferredGender.male")}
              active={editState.preferredGender === "male"}
              onPress={() => setEditState((current) => ({ ...current, preferredGender: "male" }))}
            />
            <PixelButton
              label={t("network.option.preferredGender.female")}
              active={editState.preferredGender === "female"}
              onPress={() => setEditState((current) => ({ ...current, preferredGender: "female" }))}
            />
            <PixelButton
              label={t("network.option.preferredGender.other")}
              active={editState.preferredGender === "other"}
              onPress={() => setEditState((current) => ({ ...current, preferredGender: "other" }))}
            />
          </View>

          <View style={styles.buttonRow}>
            <View style={styles.halfInput}>
              <PixelText variant="label" style={styles.fieldLabel}>
                {t("network.fields.preferredHeight")}
              </PixelText>
              <TextInput
                value={editState.preferredHeightMinInput}
                onChangeText={(value) =>
                  setEditState((current) => ({ ...current, preferredHeightMinInput: value }))
                }
                keyboardType="numeric"
                placeholder={t("network.placeholders.rangeMin")}
                placeholderTextColor={placeholderTextColor}
                style={styles.input}
              />
            </View>
            <View style={styles.halfInput}>
              <PixelText variant="label" style={styles.fieldLabel}>
                {t("network.fields.preferredHeightMax")}
              </PixelText>
              <TextInput
                value={editState.preferredHeightMaxInput}
                onChangeText={(value) =>
                  setEditState((current) => ({ ...current, preferredHeightMaxInput: value }))
                }
                keyboardType="numeric"
                placeholder={t("network.placeholders.rangeMax")}
                placeholderTextColor={placeholderTextColor}
                style={styles.input}
              />
            </View>
          </View>

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("network.fields.preferredSmoking")}
          </PixelText>
          <View style={styles.buttonRow}>
            <PixelButton
              label={t("network.option.preferredSmoking.none_only")}
              active={editState.preferredSmoking === "none_only"}
              onPress={() => setEditState((current) => ({ ...current, preferredSmoking: "none_only" }))}
            />
            <PixelButton
              label={t("network.option.preferredSmoking.ok")}
              active={editState.preferredSmoking === "ok"}
              onPress={() => setEditState((current) => ({ ...current, preferredSmoking: "ok" }))}
            />
            <PixelButton
              label={t("network.option.preferredSmoking.any")}
              active={editState.preferredSmoking === "any"}
              onPress={() => setEditState((current) => ({ ...current, preferredSmoking: "any" }))}
            />
          </View>

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("network.fields.preferredDrinking")}
          </PixelText>
          <View style={styles.buttonRow}>
            <PixelButton
              label={t("network.option.preferredDrinking.never")}
              active={editState.preferredDrinking === "never"}
              onPress={() => setEditState((current) => ({ ...current, preferredDrinking: "never" }))}
            />
            <PixelButton
              label={t("network.option.preferredDrinking.social")}
              active={editState.preferredDrinking === "social"}
              onPress={() => setEditState((current) => ({ ...current, preferredDrinking: "social" }))}
            />
            <PixelButton
              label={t("network.option.preferredDrinking.often")}
              active={editState.preferredDrinking === "often"}
              onPress={() => setEditState((current) => ({ ...current, preferredDrinking: "often" }))}
            />
            <PixelButton
              label={t("network.option.preferredDrinking.any")}
              active={editState.preferredDrinking === "any"}
              onPress={() => setEditState((current) => ({ ...current, preferredDrinking: "any" }))}
            />
          </View>

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("network.fields.mustHave")}
          </PixelText>
          <PixelText variant="caption" style={styles.profileMetaText}>
            {t("profile.manage.mustHaveHint")}
          </PixelText>
          {isMustHaveLimitReached ? (
            <PixelText variant="caption" style={styles.errorText}>
              {t("network.fields.mustHaveLimit")}
            </PixelText>
          ) : null}
          <View style={styles.buttonRow}>
            {mustHaveItems.map((item) => {
              const selected = editState.mustHaveConditionKeys.includes(item.key);

              return (
                <PixelButton
                  key={item.key}
                  label={item.label}
                  variant={selected ? "primary" : "secondary"}
                  active={selected}
                  disabled={!selected && isMustHaveLimitReached}
                  testID={`profile-must-have-${item.key}`}
                  onPress={() => toggleMustHaveCondition(item.key)}
                />
              );
            })}
          </View>

          <PixelText variant="label" style={styles.fieldLabel}>
            {t("profile.manage.activation")}
          </PixelText>
          <View style={styles.buttonRow}>
            <PixelButton
              label={t("profile.manage.activate")}
              variant="success"
              active={editState.isActive}
              onPress={() => setEditState((current) => ({ ...current, isActive: true }))}
            />
            <PixelButton
              label={t("profile.manage.deactivate")}
              variant="neutral"
              active={!editState.isActive}
              onPress={() => setEditState((current) => ({ ...current, isActive: false }))}
            />
          </View>
          <PixelText variant="caption" style={styles.profileMetaText}>
            {t("profile.manage.activationHint")}
          </PixelText>

          <View style={styles.buttonRow}>
            <PixelButton
              label={isSaving ? t("profile.actions.saving") : t("profile.actions.save")}
              variant="primary"
              testID="profile-sheet-save"
              disabled={!!isSaving || !editState.displayName.trim()}
              onPress={() => {
                void handleSave();
              }}
            />
          </View>
        </PixelBox>
      ) : null}
    </>
  );
}

export function ProfileView({
  profile,
  onClose,
  onSaveCupidateProfile,
  isSavingCupidateProfile
}: ProfileViewProps) {
  const { t } = useI18n();

  if (!profile) {
    return null;
  }

  return (
    <View style={styles.profileSheetOverlay} testID="profile-sheet">
      <Pressable style={styles.profileSheetScrim} onPress={onClose} />
      <View style={styles.profileSheetWrapper}>
        <PixelBox style={styles.profileSheetFrame} contentStyle={styles.profileSheetFrameContent}>
          <View style={styles.profileSheetTopBar}>
            <PixelText testID="profile-sheet-title" variant="screenTitle" style={styles.profileSheetTitle}>
              {profile.kind === "cupid" ? t("profile.title.cupid") : t("profile.title.cupidate")}
            </PixelText>
            <PixelButton
              label={t("profile.actions.close")}
              variant="secondary"
              testID="profile-sheet-close"
              onPress={onClose}
            />
          </View>

          <ScrollView style={styles.profileSheetScroll} contentContainerStyle={styles.profileSheetScrollContent}>
            {profile.kind === "cupid" ? (
              <CupidProfilePanel profile={profile} t={t} />
            ) : (
              <CupidateProfilePanel
                profile={profile}
                isSaving={isSavingCupidateProfile}
                onSave={onSaveCupidateProfile}
                t={t}
              />
            )}
          </ScrollView>
        </PixelBox>
      </View>
    </View>
  );
}
