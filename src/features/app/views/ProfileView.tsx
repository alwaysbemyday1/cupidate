import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

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
  preferredAgeMinInput: string;
  preferredAgeMaxInput: string;
  preferredRegionsInput: string;
  preferredGender: "any" | "male" | "female" | "other";
  preferredHeightMinInput: string;
  preferredHeightMaxInput: string;
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
    locationInput: profile.preferences.location ?? profile.preferences.region ?? "",
    jobTitleInput: profile.preferences.jobTitle ?? "",
    heightInput: profile.preferences.heightCm ? String(profile.preferences.heightCm) : "",
    hobbiesInput: profile.preferences.hobbies?.join(", ") ?? "",
    preferredAgeMinInput: profile.preferences.ageRange ? String(profile.preferences.ageRange[0]) : "",
    preferredAgeMaxInput: profile.preferences.ageRange ? String(profile.preferences.ageRange[1]) : "",
    preferredRegionsInput: profile.preferences.preferredRegions?.join(", ") ?? "",
    preferredGender:
      profile.preferences.preferredGenders && profile.preferences.preferredGenders.length > 0
        ? profile.preferences.preferredGenders[0]
        : "any",
    preferredHeightMinInput: profile.preferences.preferredHeightRange
      ? String(profile.preferences.preferredHeightRange[0])
      : "",
    preferredHeightMaxInput: profile.preferences.preferredHeightRange
      ? String(profile.preferences.preferredHeightRange[1])
      : "",
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
        <View style={styles.summaryGrid}>
          {renderStatPill(t("profile.stats.cupidates"), profile.stats.cupidateCount)}
          {renderStatPill(t("profile.stats.activeCupidates"), profile.stats.activeCupidateCount)}
          {renderStatPill(t("profile.stats.introductions"), profile.stats.introductions)}
          {renderStatPill(t("profile.stats.ongoing"), profile.stats.ongoingMatches)}
          {renderStatPill(t("profile.stats.completed"), profile.stats.completedMatches)}
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

  const preferredGenderLabel =
    editState.preferredGender === "any"
      ? t("network.option.preferredGender.any")
      : genderText(editState.preferredGender, t);

  async function handleSave() {
    if (!onSave) {
      return;
    }

    const birthYear = parseOptionalNumber(editState.birthYearInput) ?? null;
    const heightCm = parseOptionalNumber(editState.heightInput);
    const preferredAgeRange = parseRange(editState.preferredAgeMinInput, editState.preferredAgeMaxInput);
    const preferredHeightRange = parseRange(
      editState.preferredHeightMinInput,
      editState.preferredHeightMaxInput
    );
    const location = editState.locationInput.trim().toLowerCase();

    await onSave({
      cupidateId: profile.cupidateId,
      displayName: editState.displayName,
      birthYear,
      gender: editState.gender,
      bio: editState.bio,
      isActive: editState.isActive,
      preferences: {
        ...profile.preferences,
        location: location || undefined,
        region: location || undefined,
        jobTitle: editState.jobTitleInput.trim() || undefined,
        heightCm,
        hobbies: parseTags(editState.hobbiesInput),
        ageRange: preferredAgeRange,
        preferredRegions: parseTags(editState.preferredRegionsInput),
        preferredGenders: editState.preferredGender === "any" ? [] : [editState.preferredGender],
        preferredHeightRange
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
          {renderMetaLine(t("profile.meta.region"), profile.preferences.location ?? profile.preferences.region ?? "-")}
          {renderMetaLine(t("profile.meta.job"), profile.preferences.jobTitle ?? "-")}
          {renderMetaLine(
            t("profile.meta.height"),
            profile.preferences.heightCm ? `${profile.preferences.heightCm} cm` : "-"
          )}
        </View>
      </PixelBox>

      <PixelBox style={styles.profileSheetCard} contentStyle={styles.profileSheetCardContent}>
        <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
          {t("profile.sections.publicProfile")}
        </PixelText>
        <PixelText variant="body" style={styles.textBody}>
          {editState.bio || t("profile.cupidate.noBio")}
        </PixelText>
        <View style={styles.profileDivider} />
        {renderMetaLine(t("profile.meta.hobbies"), hobbies)}
        {renderMetaLine(
          t("profile.meta.lifestyle"),
          `${profile.preferences.smokingHabit ?? "-"} / ${profile.preferences.drinkingHabit ?? "-"}`
        )}
      </PixelBox>

      <PixelBox style={styles.profileSheetCard} contentStyle={styles.profileSheetCardContent}>
        <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
          {t("profile.sections.preferences")}
        </PixelText>
        {renderMetaLine(
          t("profile.meta.preferredAge"),
          parseRange(editState.preferredAgeMinInput, editState.preferredAgeMaxInput)
            ? `${parseRange(editState.preferredAgeMinInput, editState.preferredAgeMaxInput)?.[0]} - ${
                parseRange(editState.preferredAgeMinInput, editState.preferredAgeMaxInput)?.[1]
              }`
            : "-"
        )}
        {renderMetaLine(t("profile.meta.preferredGender"), preferredGenderLabel)}
        {renderMetaLine(t("profile.meta.preferredRegions"), regions)}
        {renderMetaLine(
          t("profile.meta.preferredHeight"),
          parseRange(editState.preferredHeightMinInput, editState.preferredHeightMaxInput)
            ? `${parseRange(editState.preferredHeightMinInput, editState.preferredHeightMaxInput)?.[0]} - ${
                parseRange(editState.preferredHeightMinInput, editState.preferredHeightMaxInput)?.[1]
              } cm`
            : "-"
        )}
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
            <PixelText testID="profile-sheet-title" variant="screenTitle" style={styles.title}>
              {profile.kind === "cupid" ? t("profile.title.cupid") : t("profile.title.cupidate")}
            </PixelText>
            <PixelButton label={t("profile.actions.close")} variant="secondary" onPress={onClose} />
          </View>

          <ScrollView style={styles.panel} contentContainerStyle={styles.profileSheetScrollContent}>
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
