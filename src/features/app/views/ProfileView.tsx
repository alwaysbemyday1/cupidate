import { Pressable, ScrollView, View } from "react-native";

import { useI18n } from "../../i18n/context";
import { PixelBox } from "../components/PixelBox";
import { PixelButton } from "../components/PixelButton";
import { PixelText } from "../components/PixelText";
import type { CupidProfileSummary, CupidateProfileSummary, SelectedProfileSummary } from "../model/types";
import { styles } from "../styles";

type ProfileViewProps = {
  profile: SelectedProfileSummary;
  onClose: () => void;
};

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
  t
}: {
  profile: CupidateProfileSummary;
  t: ReturnType<typeof useI18n>["t"];
}) {
  const hobbies = profile.preferences.hobbies?.join(", ") ?? "-";
  const regions = profile.preferences.preferredRegions?.join(", ") ?? "-";
  const preferredGender =
    profile.preferences.preferredGenders && profile.preferences.preferredGenders.length > 0
      ? profile.preferences.preferredGenders.map((value) => genderText(value, t)).join(", ")
      : t("network.option.preferredGender.any");

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
                {profile.isActive ? t("profile.cupidate.active") : t("profile.cupidate.inactive")}
              </PixelText>
            </View>
          </View>
        </View>

        <View style={styles.profileSheetMetaList}>
          {renderMetaLine(t("profile.meta.age"), ageLabel(profile.birthYear))}
          {renderMetaLine(t("profile.meta.gender"), genderText(profile.gender, t))}
          {renderMetaLine(
            t("profile.meta.region"),
            profile.preferences.location ?? profile.preferences.region ?? "-"
          )}
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
          {profile.bio || t("profile.cupidate.noBio")}
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
          profile.preferences.ageRange ? `${profile.preferences.ageRange[0]} - ${profile.preferences.ageRange[1]}` : "-"
        )}
        {renderMetaLine(t("profile.meta.preferredGender"), preferredGender)}
        {renderMetaLine(t("profile.meta.preferredRegions"), regions)}
        {renderMetaLine(
          t("profile.meta.preferredHeight"),
          profile.preferences.preferredHeightRange
            ? `${profile.preferences.preferredHeightRange[0]} - ${profile.preferences.preferredHeightRange[1]} cm`
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
    </>
  );
}

export function ProfileView({ profile, onClose }: ProfileViewProps) {
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
              <CupidateProfilePanel profile={profile} t={t} />
            )}
          </ScrollView>
        </PixelBox>
      </View>
    </View>
  );
}
