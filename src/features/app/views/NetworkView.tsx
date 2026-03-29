import { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View, useWindowDimensions } from "react-native";

import {
  MAX_MUST_HAVE_CONDITIONS,
  PREFERENCE_CONDITION_KEYS,
  type PreferenceConditionKey
} from "../../../domain/matching/types";
import { useI18n } from "../../i18n/context";
import { PixelBox } from "../components/PixelBox";
import { PixelButton } from "../components/PixelButton";
import { PixelSegmentTabs } from "../components/PixelSegmentTabs";
import { PixelText } from "../components/PixelText";
import { StateCard } from "../components/StateCard";
import type {
  CupidConnection,
  CupidateRecord,
  MatchRequest,
  NetworkSegment,
  ValidationErrors
} from "../model/types";
import { styles } from "../styles";
import { designTokens } from "../theme/tokens";

type ConnectionSearchResult = {
  cupidId: string;
  nickname: string;
};

type DetailSubview = "list" | "register";

type NetworkViewProps = {
  networkSegment: NetworkSegment;
  onChangeNetworkSegment: (segment: NetworkSegment) => void;
  cupidates: CupidateRecord[];
  connections: CupidConnection[];
  requests: MatchRequest[];
  recommendationCount: number;
  masterCupidName: string;
  displayName: string;
  onChangeDisplayName: (value: string) => void;
  birthYearInput: string;
  onChangeBirthYearInput: (value: string) => void;
  gender: string;
  onChangeGender: (value: string) => void;
  profileVisibility: "private" | "basic" | "public";
  onChangeProfileVisibility: (value: "private" | "basic" | "public") => void;
  hobbiesInput: string;
  onChangeHobbiesInput: (value: string) => void;
  locationInput: string;
  onChangeLocationInput: (value: string) => void;
  jobTitleInput: string;
  onChangeJobTitleInput: (value: string) => void;
  heightInput: string;
  onChangeHeightInput: (value: string) => void;
  smokingHabit: "none" | "sometimes" | "often";
  onChangeSmokingHabit: (value: "none" | "sometimes" | "often") => void;
  drinkingHabit: "never" | "social" | "often";
  onChangeDrinkingHabit: (value: "never" | "social" | "often") => void;
  preferredAgeMinInput: string;
  onChangePreferredAgeMinInput: (value: string) => void;
  preferredAgeMaxInput: string;
  onChangePreferredAgeMaxInput: (value: string) => void;
  preferredRegionsInput: string;
  onChangePreferredRegionsInput: (value: string) => void;
  preferredJobGroupsInput: string;
  onChangePreferredJobGroupsInput: (value: string) => void;
  preferredSmoking: "none_only" | "ok" | "any";
  onChangePreferredSmoking: (value: "none_only" | "ok" | "any") => void;
  preferredDrinking: "never" | "social" | "often" | "any";
  onChangePreferredDrinking: (value: "never" | "social" | "often" | "any") => void;
  preferredGender: "any" | "male" | "female" | "other";
  onChangePreferredGender: (value: "any" | "male" | "female" | "other") => void;
  preferredHeightMinInput: string;
  onChangePreferredHeightMinInput: (value: string) => void;
  preferredHeightMaxInput: string;
  onChangePreferredHeightMaxInput: (value: string) => void;
  mustHaveConditionKeys: PreferenceConditionKey[];
  onChangeMustHaveConditionKeys: (value: PreferenceConditionKey[]) => void;
  bio: string;
  onChangeBio: (value: string) => void;
  errors: ValidationErrors;
  onSaveCupidate: () => void | Promise<void>;
  currentCupidId: string;
  connectionSearchQuery: string;
  onChangeConnectionSearchQuery: (value: string) => void;
  connectionSearchResults: ConnectionSearchResult[];
  selectedConnectionCupidId: string | null;
  onSelectConnectionCupid: (cupidId: string) => void;
  onAddConnection: () => void | Promise<void>;
  onOpenCupidProfile: (cupidId: string) => void;
  onOpenCupidateProfile: (cupidateId: string) => void;
  isNetworkLoading?: boolean;
  isSearchingCupids?: boolean;
  isMutatingNetwork?: boolean;
  networkError?: string | null;
  onRetryNetworkError?: () => void | Promise<void>;
};

type BoardTone = "matched" | "wait" | "reject" | "neutral";
type BoardNodeRole = "master" | "cupidate" | "cupid";

type BoardNode = {
  id: string;
  name: string;
  subtitle: string;
  tone: BoardTone;
  role: BoardNodeRole;
};

const placeholderTextColor = designTokens.color.inkMuted;

function buildAvatarSeed(label: string) {
  const trimmed = label.trim();

  if (!trimmed) {
    return "CU";
  }

  return Array.from(trimmed.replace(/\s+/g, "")).slice(0, 2).join("").toUpperCase();
}

function chunkItems<T>(items: T[], size: number) {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }

  return rows;
}

function resolveCupidateTone(cupidateId: string, requests: MatchRequest[]): BoardTone {
  const related = requests.filter(
    (request) => request.sourceCupidateId === cupidateId || request.targetCupidateId === cupidateId
  );

  if (related.some((request) => request.status === "completed" || request.status === "accepted")) {
    return "matched";
  }

  if (related.some((request) => request.status === "requested")) {
    return "wait";
  }

  if (related.some((request) => request.status === "rejected")) {
    return "reject";
  }

  return "neutral";
}

function resolveConnectionTone(status: CupidConnection["status"]): BoardTone {
  if (status === "connected") {
    return "matched";
  }

  if (status === "pending") {
    return "wait";
  }

  if (status === "blocked") {
    return "reject";
  }

  return "neutral";
}

function boardBadgeKey(tone: Exclude<BoardTone, "neutral">) {
  return `network.badge.${tone}`;
}

function boardLegendKey(tone: Exclude<BoardTone, "neutral">) {
  return `network.legend.${tone}`;
}

function connectionStatusKey(status: CupidConnection["status"]) {
  return `network.connection.status.${status}`;
}

function cupidateStatusKey(tone: BoardTone) {
  return `network.cupidate.status.${tone}`;
}

function cupidateActivationKey(isActive: boolean) {
  return isActive ? "network.cupidate.activation.active" : "network.cupidate.activation.inactive";
}

function genderKey(gender: string) {
  switch (gender) {
    case "male":
      return "network.option.gender.male";
    case "female":
      return "network.option.gender.female";
    case "other":
      return "network.option.gender.other";
    default:
      return "network.option.unspecified";
  }
}

function ageLabel(birthYear: number | null | undefined) {
  if (!birthYear) {
    return "--";
  }

  return String(new Date().getFullYear() - birthYear);
}

function joinMeta(parts: Array<string | undefined | null>) {
  return parts.filter(Boolean).join(" / ");
}

export function NetworkView({
  networkSegment,
  onChangeNetworkSegment,
  cupidates,
  connections,
  requests,
  recommendationCount,
  masterCupidName,
  displayName,
  onChangeDisplayName,
  birthYearInput,
  onChangeBirthYearInput,
  gender,
  onChangeGender,
  profileVisibility,
  onChangeProfileVisibility,
  hobbiesInput,
  onChangeHobbiesInput,
  locationInput,
  onChangeLocationInput,
  jobTitleInput,
  onChangeJobTitleInput,
  heightInput,
  onChangeHeightInput,
  smokingHabit,
  onChangeSmokingHabit,
  drinkingHabit,
  onChangeDrinkingHabit,
  preferredAgeMinInput,
  onChangePreferredAgeMinInput,
  preferredAgeMaxInput,
  onChangePreferredAgeMaxInput,
  preferredRegionsInput,
  onChangePreferredRegionsInput,
  preferredJobGroupsInput,
  onChangePreferredJobGroupsInput,
  preferredSmoking,
  onChangePreferredSmoking,
  preferredDrinking,
  onChangePreferredDrinking,
  preferredGender,
  onChangePreferredGender,
  preferredHeightMinInput,
  onChangePreferredHeightMinInput,
  preferredHeightMaxInput,
  onChangePreferredHeightMaxInput,
  mustHaveConditionKeys,
  onChangeMustHaveConditionKeys,
  bio,
  onChangeBio,
  errors,
  onSaveCupidate,
  currentCupidId,
  connectionSearchQuery,
  onChangeConnectionSearchQuery,
  connectionSearchResults,
  selectedConnectionCupidId,
  onSelectConnectionCupid,
  onAddConnection,
  onOpenCupidProfile,
  onOpenCupidateProfile,
  isNetworkLoading,
  isSearchingCupids,
  isMutatingNetwork,
  networkError,
  onRetryNetworkError
}: NetworkViewProps) {
  const { t } = useI18n();
  const { width } = useWindowDimensions();
  const [cupidateSubview, setCupidateSubview] = useState<DetailSubview>("list");
  const [cupidSubview, setCupidSubview] = useState<DetailSubview>("register");
  const isWideHero = width >= 410;
  const boardColumns = width < 360 ? 3 : 4;
  const mustHaveItems = useMemo(
    () =>
      PREFERENCE_CONDITION_KEYS.map((key) => ({
        key,
        label: t(`network.option.mustHave.${key}`)
      })),
    [t]
  );
  const isMustHaveLimitReached = mustHaveConditionKeys.length >= MAX_MUST_HAVE_CONDITIONS;

  const myCupidates = useMemo(
    () => cupidates.filter((item) => item.ownerCupidId === currentCupidId),
    [cupidates, currentCupidId]
  );

  const cupidateNodes = useMemo<BoardNode[]>(
    () =>
      myCupidates.map((item) => ({
        id: item.cupidateId,
        name: item.displayName,
        subtitle: joinMeta([
          ageLabel(item.birthYear),
          item.region ?? item.preferences.location ?? item.preferences.region ?? "--"
        ]),
        tone: resolveCupidateTone(item.cupidateId, requests),
        role: "cupidate"
      })),
    [myCupidates, requests]
  );

  const connectionNodes = useMemo<BoardNode[]>(
    () =>
      connections.map((item) => ({
        id: item.cupidId,
        name: item.name,
        subtitle: item.region === "-" ? t("network.meta.cupid") : item.region,
        tone: resolveConnectionTone(item.status),
        role: "cupid"
      })),
    [connections, t]
  );

  const featuredNodes = useMemo(
    () => [...cupidateNodes.slice(0, 2), ...connectionNodes.slice(0, 2)].slice(0, 4),
    [connectionNodes, cupidateNodes]
  );

  const remainingNodes = useMemo(
    () => [...cupidateNodes.slice(2), ...connectionNodes.slice(2)],
    [connectionNodes, cupidateNodes]
  );

  const remainingRows = useMemo(() => chunkItems(remainingNodes, boardColumns), [boardColumns, remainingNodes]);

  const connectedCount = connections.filter((item) => item.status === "connected").length;
  const successfulCount = requests.filter((item) => item.status === "completed").length;
  const activeCount = requests.filter((item) => item.status === "requested" || item.status === "accepted").length;
  const showSearchEmptyState =
    networkSegment === "cupids" &&
    cupidSubview === "register" &&
    connectionSearchQuery.trim().length > 0 &&
    !isSearchingCupids &&
    connectionSearchResults.length === 0;

  async function handleAddConnection() {
    await onAddConnection();
    setCupidSubview("list");
  }

  function boardBadgeStyle(tone: Exclude<BoardTone, "neutral">) {
    if (tone === "matched") {
      return styles.networkNodeBadgeMatched;
    }

    if (tone === "wait") {
      return styles.networkNodeBadgeWait;
    }

    return styles.networkNodeBadgeReject;
  }

  function avatarToneStyle(role: BoardNodeRole) {
    if (role === "master") {
      return styles.networkAvatarMaster;
    }

    if (role === "cupid") {
      return styles.networkAvatarCupid;
    }

    return styles.networkAvatarCupidate;
  }

  function rosterStatusStyle(tone: BoardTone) {
    if (tone === "matched") {
      return styles.networkStatusMatched;
    }

    if (tone === "wait") {
      return styles.networkStatusPending;
    }

    if (tone === "reject") {
      return styles.networkStatusBlocked;
    }

    return styles.networkStatusNeutral;
  }

  function renderBoardNode(node: BoardNode, compact = false) {
    const onPress = () => {
      if (node.role === "cupid") {
        onOpenCupidProfile(node.id);
        return;
      }

      onOpenCupidateProfile(node.id);
    };

    return (
      <Pressable key={node.id} onPress={onPress} testID={`profile-open-${node.role}-${node.id}`}>
        <PixelBox
          style={compact ? styles.networkMiniNode : styles.networkFeaturedNode}
          contentStyle={compact ? styles.networkMiniNodeContent : styles.networkNodeContent}
          backgroundColor={compact ? designTokens.color.surfaceAlt : designTokens.color.surface}
        >
          <View style={styles.networkNodeHeader}>
            <View style={[compact ? styles.networkMiniAvatar : styles.networkNodeAvatar, avatarToneStyle(node.role)]}>
              <PixelText variant={compact ? "label" : "body"} style={styles.networkAvatarText}>
                {buildAvatarSeed(node.name)}
              </PixelText>
            </View>
            {node.tone !== "neutral" ? (
              <View style={[styles.networkNodeBadge, boardBadgeStyle(node.tone)]}>
                <PixelText variant="caption" style={styles.networkNodeBadgeText}>
                  {t(boardBadgeKey(node.tone))}
                </PixelText>
              </View>
            ) : null}
          </View>
          <PixelText variant={compact ? "caption" : "body"} style={styles.networkNodeName} numberOfLines={1}>
            {node.name}
          </PixelText>
          {!compact ? (
            <PixelText variant="caption" style={styles.networkNodeMeta} numberOfLines={1}>
              {node.subtitle}
            </PixelText>
          ) : null}
        </PixelBox>
      </Pressable>
    );
  }

  function toggleMustHaveCondition(key: PreferenceConditionKey) {
    if (mustHaveConditionKeys.includes(key)) {
      onChangeMustHaveConditionKeys(mustHaveConditionKeys.filter((item) => item !== key));
      return;
    }

    if (isMustHaveLimitReached) {
      return;
    }

    onChangeMustHaveConditionKeys([...mustHaveConditionKeys, key]);
  }

  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      {isNetworkLoading ? (
        <StateCard tone="loading" title={t("network.loading.title")} description={t("network.loading.description")} />
      ) : null}
      {networkError ? (
        <StateCard
          tone="error"
          title={t("network.error.title")}
          description={networkError}
          actionLabel={t("network.error.retry")}
          actionVariant="warning"
          onAction={onRetryNetworkError}
        />
      ) : null}

      <PixelSegmentTabs
        activeKey={networkSegment}
        items={[
          { key: "board", label: t("network.segment.board"), testID: "network-segment-board" },
          { key: "cupidates", label: t("network.segment.cupidates"), testID: "network-segment-cupidates" },
          { key: "cupids", label: t("network.segment.cupids"), testID: "network-segment-cupids" }
        ]}
        onSelect={onChangeNetworkSegment}
      />

      {networkSegment === "board" ? (
        <View style={[styles.networkHeroRow, isWideHero ? styles.networkHeroRowWide : null]}>
          <PixelBox style={styles.networkBoardCard} contentStyle={styles.networkBoardContent}>
            <View style={styles.networkBoardHeader}>
              <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
                {t("network.sections.board")}
              </PixelText>
              <PixelText variant="caption" style={styles.networkBoardCaption}>
                {t("network.board.caption")}
              </PixelText>
            </View>

            <View style={styles.networkBoardCanvas}>
              <View style={styles.networkMasterBlock}>
                <PixelText variant="label" style={styles.networkMasterLabel}>
                  {t("network.master.title")}
                </PixelText>
                <PixelBox
                  style={styles.networkMasterCard}
                  contentStyle={styles.networkMasterCardContent}
                  backgroundColor={designTokens.color.surfaceRaised}
                >
                  <View style={[styles.networkNodeAvatar, styles.networkAvatarMaster]}>
                    <PixelText variant="body" style={styles.networkAvatarText}>
                      {buildAvatarSeed(masterCupidName || currentCupidId)}
                    </PixelText>
                  </View>
                  <View style={styles.networkMasterInfo}>
                    <PixelText variant="body" style={styles.networkMasterName}>
                      {(masterCupidName || currentCupidId).toUpperCase()}
                    </PixelText>
                    <PixelText variant="caption" style={styles.networkNodeMeta}>
                      {t("network.master.subtitle")}
                    </PixelText>
                  </View>
                </PixelBox>
              </View>

              {featuredNodes.length === 0 && remainingNodes.length === 0 ? (
                <StateCard
                  tone="empty"
                  title={t("network.empty.boardTitle")}
                  description={t("network.empty.boardDescription")}
                />
              ) : (
                <>
                  <View style={styles.networkConnectorVertical} />
                  <View style={styles.networkConnectorHorizontal} />
                  <View style={styles.networkFeaturedRow}>{featuredNodes.map((node) => renderBoardNode(node))}</View>

                  {remainingRows.length > 0 ? (
                    <>
                      <View style={styles.networkConnectorVertical} />
                      <View style={styles.networkMiniGrid}>
                        {remainingRows.map((row, rowIndex) => (
                          <View key={`row-${rowIndex}`} style={styles.networkMiniRow}>
                            {row.map((node) => renderBoardNode(node, true))}
                          </View>
                        ))}
                      </View>
                    </>
                  ) : null}
                </>
              )}
            </View>
          </PixelBox>

          <View style={[styles.networkSideStack, isWideHero ? styles.networkSideStackWide : null]}>
            <PixelBox style={styles.networkInfoCard} contentStyle={styles.networkInfoCardContent}>
              <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
                {t("network.sections.stats")}
              </PixelText>
              <View style={styles.networkStatItem}>
                <PixelText variant="body" style={styles.metricValue}>
                  {recommendationCount}
                </PixelText>
                <PixelText variant="caption" style={styles.metricLabel}>
                  {t("network.metrics.proposals")}
                </PixelText>
              </View>
              <View style={styles.networkStatItem}>
                <PixelText variant="body" style={styles.metricValue}>
                  {connectedCount}
                </PixelText>
                <PixelText variant="caption" style={styles.metricLabel}>
                  {t("network.metrics.connected")}
                </PixelText>
              </View>
              <View style={styles.networkStatItem}>
                <PixelText variant="body" style={styles.metricValue}>
                  {successfulCount}
                </PixelText>
                <PixelText variant="caption" style={styles.metricLabel}>
                  {t("network.metrics.success")}
                </PixelText>
              </View>
              <View style={styles.networkStatItem}>
                <PixelText variant="body" style={styles.metricValue}>
                  {activeCount}
                </PixelText>
                <PixelText variant="caption" style={styles.metricLabel}>
                  {t("network.metrics.active")}
                </PixelText>
              </View>
            </PixelBox>

            <PixelBox style={styles.networkInfoCard} contentStyle={styles.networkInfoCardContent}>
              <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
                {t("network.sections.legend")}
              </PixelText>
              {(["matched", "wait", "reject"] as const).map((tone) => (
                <View key={tone} style={styles.networkLegendItem}>
                  <View style={[styles.networkLegendSwatch, boardBadgeStyle(tone)]} />
                  <PixelText variant="body" style={styles.textBody}>
                    {t(boardLegendKey(tone))}
                  </PixelText>
                </View>
              ))}
            </PixelBox>
          </View>
        </View>
      ) : null}

      {networkSegment === "cupidates" ? (
        <>
          <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
            {t("network.sections.cupidatesHub")}
          </PixelText>
          <PixelSegmentTabs
            compact
            activeKey={cupidateSubview}
            items={[
              { key: "list", label: t("network.subsegment.cupidateList"), testID: "network-subsegment-cupidates-list" },
              {
                key: "register",
                label: t("network.subsegment.cupidateRegister"),
                testID: "network-subsegment-cupidates-register"
              }
            ]}
            onSelect={setCupidateSubview}
          />
          {cupidateSubview === "list" ? (
            <>
              <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
                {t("network.sections.roster")}
              </PixelText>
              {myCupidates.length === 0 ? (
            <StateCard
              tone="empty"
              title={t("network.empty.cupidatesTitle")}
              description={t("network.empty.cupidatesDescription")}
            />
              ) : (
            <PixelBox style={styles.networkRosterCard} contentStyle={styles.networkRosterContent}>
              {myCupidates.map((item) => {
                const tone = resolveCupidateTone(item.cupidateId, requests);

                return (
                  <Pressable
                    key={item.cupidateId}
                    onPress={() => onOpenCupidateProfile(item.cupidateId)}
                    testID={`profile-open-cupidate-${item.cupidateId}`}
                    style={styles.networkProfilePressable}
                  >
                  <View style={styles.networkRosterItem}>
                    <View style={styles.networkRosterItemHeader}>
                      <View style={styles.networkRosterMain}>
                        <PixelText variant="body" style={styles.listName}>
                          {item.displayName}
                        </PixelText>
                        <PixelText variant="caption" style={styles.networkRosterMeta}>
                          {joinMeta([
                            t(genderKey(item.gender)),
                            ageLabel(item.birthYear),
                            item.region ?? item.preferences.location ?? item.preferences.region ?? "--"
                          ])}
                        </PixelText>
                        <PixelText variant="caption" style={styles.networkRosterMeta}>
                          {item.jobTitle ?? item.preferences.jobTitle ?? t("network.meta.awaitingProfile")}
                        </PixelText>
                      </View>
                      <View style={styles.networkStatusColumn}>
                        <View
                          style={[
                            styles.networkStatusChip,
                            item.isActive ? styles.networkStatusMatched : styles.networkStatusNeutral
                          ]}
                        >
                          <PixelText variant="caption" style={styles.networkStatusText}>
                            {t(cupidateActivationKey(item.isActive))}
                          </PixelText>
                        </View>
                        <View style={[styles.networkStatusChip, rosterStatusStyle(tone)]}>
                          <PixelText variant="caption" style={styles.networkStatusText}>
                            {t(cupidateStatusKey(tone))}
                          </PixelText>
                        </View>
                      </View>
                    </View>
                  </View>
                  </Pressable>
                );
              })}
            </PixelBox>
              )}
            </>
          ) : null}

          {cupidateSubview === "register" ? (
            <>
          <PixelBox style={styles.networkFormCard} contentStyle={styles.networkFormContent}>
            <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
              {t("network.form.profileTitle")}
            </PixelText>
            <PixelText variant="caption" style={styles.fieldHint}>
              {t("network.form.caption")}
            </PixelText>
            <PixelText variant="caption" style={styles.fieldHint}>
              {t("network.form.registerHint")}
            </PixelText>

            <PixelText variant="label" style={styles.fieldLabel}>
              {t("network.fields.name")}
            </PixelText>
            <TextInput
              value={displayName}
              onChangeText={onChangeDisplayName}
              placeholder={t("network.placeholders.name")}
              placeholderTextColor={placeholderTextColor}
              style={styles.input}
            />
            {!!errors.displayName ? (
              <PixelText variant="body" style={styles.errorText}>
                {t(errors.displayName)}
              </PixelText>
            ) : null}

            <View style={styles.buttonRow}>
              <View style={styles.halfInput}>
                <PixelText variant="label" style={styles.fieldLabel}>
                  {t("network.fields.birthYear")}
                </PixelText>
                <TextInput
                  value={birthYearInput}
                  onChangeText={onChangeBirthYearInput}
                  keyboardType="numeric"
                  placeholder={t("network.placeholders.birthYear")}
                  placeholderTextColor={placeholderTextColor}
                  style={styles.input}
                />
                {!!errors.birthYear ? (
                  <PixelText variant="body" style={styles.errorText}>
                    {t(errors.birthYear)}
                  </PixelText>
                ) : null}
              </View>

              <View style={styles.halfInput}>
                <PixelText variant="label" style={styles.fieldLabel}>
                  {t("network.fields.height")}
                </PixelText>
                <TextInput
                  value={heightInput}
                  onChangeText={onChangeHeightInput}
                  keyboardType="numeric"
                  placeholder={t("network.placeholders.height")}
                  placeholderTextColor={placeholderTextColor}
                  style={styles.input}
                />
                {!!errors.height ? (
                  <PixelText variant="body" style={styles.errorText}>
                    {t(errors.height)}
                  </PixelText>
                ) : null}
              </View>
            </View>

            <PixelText variant="label" style={styles.fieldLabel}>
              {t("network.fields.gender")}
            </PixelText>
            <View style={styles.buttonRow}>
              <PixelButton label={t("network.option.gender.male")} active={gender === "male"} onPress={() => onChangeGender("male")} />
              <PixelButton
                label={t("network.option.gender.female")}
                active={gender === "female"}
                onPress={() => onChangeGender("female")}
              />
              <PixelButton label={t("network.option.gender.other")} active={gender === "other"} onPress={() => onChangeGender("other")} />
            </View>
            {!!errors.gender ? (
              <PixelText variant="body" style={styles.errorText}>
                {t(errors.gender)}
              </PixelText>
            ) : null}

            <PixelText variant="label" style={styles.fieldLabel}>
              {t("network.fields.profileVisibility")}
            </PixelText>
            <PixelText variant="caption" style={styles.fieldHint}>
              {t("network.fields.profileVisibilityHint")}
            </PixelText>
            <View style={styles.buttonRow}>
              <PixelButton
                label={t("network.option.visibility.private")}
                variant={profileVisibility === "private" ? "primary" : "secondary"}
                active={profileVisibility === "private"}
                onPress={() => onChangeProfileVisibility("private")}
              />
              <PixelButton
                label={t("network.option.visibility.basic")}
                variant={profileVisibility === "basic" ? "primary" : "secondary"}
                active={profileVisibility === "basic"}
                onPress={() => onChangeProfileVisibility("basic")}
              />
              <PixelButton
                label={t("network.option.visibility.public")}
                variant={profileVisibility === "public" ? "primary" : "secondary"}
                active={profileVisibility === "public"}
                onPress={() => onChangeProfileVisibility("public")}
              />
            </View>

            <View style={styles.buttonRow}>
              <View style={styles.halfInput}>
                <PixelText variant="label" style={styles.fieldLabel}>
                  {t("network.fields.region")}
                </PixelText>
                <TextInput
                  value={locationInput}
                  onChangeText={onChangeLocationInput}
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
                  value={jobTitleInput}
                  onChangeText={onChangeJobTitleInput}
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
              value={hobbiesInput}
              onChangeText={onChangeHobbiesInput}
              placeholder={t("network.placeholders.hobbies")}
              placeholderTextColor={placeholderTextColor}
              style={styles.input}
            />

            <PixelText variant="label" style={styles.fieldLabel}>
              {t("network.fields.bio")}
            </PixelText>
            <TextInput
              value={bio}
              onChangeText={onChangeBio}
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
                active={smokingHabit === "none"}
                onPress={() => onChangeSmokingHabit("none")}
              />
              <PixelButton
                label={t("network.option.smoking.sometimes")}
                active={smokingHabit === "sometimes"}
                onPress={() => onChangeSmokingHabit("sometimes")}
              />
              <PixelButton
                label={t("network.option.smoking.often")}
                active={smokingHabit === "often"}
                onPress={() => onChangeSmokingHabit("often")}
              />
            </View>

            <PixelText variant="label" style={styles.fieldLabel}>
              {t("network.fields.drinking")}
            </PixelText>
            <View style={styles.buttonRow}>
              <PixelButton
                label={t("network.option.drinking.never")}
                active={drinkingHabit === "never"}
                onPress={() => onChangeDrinkingHabit("never")}
              />
              <PixelButton
                label={t("network.option.drinking.social")}
                active={drinkingHabit === "social"}
                onPress={() => onChangeDrinkingHabit("social")}
              />
              <PixelButton
                label={t("network.option.drinking.often")}
                active={drinkingHabit === "often"}
                onPress={() => onChangeDrinkingHabit("often")}
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
                  value={preferredAgeMinInput}
                  onChangeText={onChangePreferredAgeMinInput}
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
                  value={preferredAgeMaxInput}
                  onChangeText={onChangePreferredAgeMaxInput}
                  keyboardType="numeric"
                  placeholder={t("network.placeholders.rangeMax")}
                  placeholderTextColor={placeholderTextColor}
                  style={styles.input}
                />
              </View>
            </View>
            {!!errors.preferredAgeRange ? (
              <PixelText variant="body" style={styles.errorText}>
                {t(errors.preferredAgeRange)}
              </PixelText>
            ) : null}

            <PixelText variant="label" style={styles.fieldLabel}>
              {t("network.fields.preferredRegions")}
            </PixelText>
            <TextInput
              value={preferredRegionsInput}
              onChangeText={onChangePreferredRegionsInput}
              placeholder={t("network.placeholders.preferredRegions")}
              placeholderTextColor={placeholderTextColor}
              style={styles.input}
            />

            <PixelText variant="label" style={styles.fieldLabel}>
              {t("network.fields.preferredJobGroups")}
            </PixelText>
            <TextInput
              value={preferredJobGroupsInput}
              onChangeText={onChangePreferredJobGroupsInput}
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
                active={preferredGender === "any"}
                onPress={() => onChangePreferredGender("any")}
              />
              <PixelButton
                label={t("network.option.preferredGender.male")}
                active={preferredGender === "male"}
                onPress={() => onChangePreferredGender("male")}
              />
              <PixelButton
                label={t("network.option.preferredGender.female")}
                active={preferredGender === "female"}
                onPress={() => onChangePreferredGender("female")}
              />
              <PixelButton
                label={t("network.option.preferredGender.other")}
                active={preferredGender === "other"}
                onPress={() => onChangePreferredGender("other")}
              />
            </View>

            <View style={styles.buttonRow}>
              <View style={styles.halfInput}>
                <PixelText variant="label" style={styles.fieldLabel}>
                  {t("network.fields.preferredHeight")}
                </PixelText>
                <TextInput
                  value={preferredHeightMinInput}
                  onChangeText={onChangePreferredHeightMinInput}
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
                  value={preferredHeightMaxInput}
                  onChangeText={onChangePreferredHeightMaxInput}
                  keyboardType="numeric"
                  placeholder={t("network.placeholders.rangeMax")}
                  placeholderTextColor={placeholderTextColor}
                  style={styles.input}
                />
              </View>
            </View>
            {!!errors.preferredHeightRange ? (
              <PixelText variant="body" style={styles.errorText}>
                {t(errors.preferredHeightRange)}
              </PixelText>
            ) : null}

            <PixelText variant="label" style={styles.fieldLabel}>
              {t("network.fields.preferredSmoking")}
            </PixelText>
            <View style={styles.buttonRow}>
              <PixelButton
                label={t("network.option.preferredSmoking.none_only")}
                active={preferredSmoking === "none_only"}
                onPress={() => onChangePreferredSmoking("none_only")}
              />
              <PixelButton
                label={t("network.option.preferredSmoking.ok")}
                active={preferredSmoking === "ok"}
                onPress={() => onChangePreferredSmoking("ok")}
              />
              <PixelButton
                label={t("network.option.preferredSmoking.any")}
                active={preferredSmoking === "any"}
                onPress={() => onChangePreferredSmoking("any")}
              />
            </View>

            <PixelText variant="label" style={styles.fieldLabel}>
              {t("network.fields.preferredDrinking")}
            </PixelText>
            <View style={styles.buttonRow}>
              <PixelButton
                label={t("network.option.preferredDrinking.never")}
                active={preferredDrinking === "never"}
                onPress={() => onChangePreferredDrinking("never")}
              />
              <PixelButton
                label={t("network.option.preferredDrinking.social")}
                active={preferredDrinking === "social"}
                onPress={() => onChangePreferredDrinking("social")}
              />
              <PixelButton
                label={t("network.option.preferredDrinking.often")}
                active={preferredDrinking === "often"}
                onPress={() => onChangePreferredDrinking("often")}
              />
              <PixelButton
                label={t("network.option.preferredDrinking.any")}
                active={preferredDrinking === "any"}
                onPress={() => onChangePreferredDrinking("any")}
              />
            </View>

            <PixelText variant="label" style={styles.fieldLabel}>
              {t("network.fields.mustHave")}
            </PixelText>
            <PixelText variant="caption" style={styles.fieldHint}>
              {t("network.fields.mustHaveHint", { count: MAX_MUST_HAVE_CONDITIONS })}
            </PixelText>
            {isMustHaveLimitReached ? (
              <PixelText variant="caption" style={styles.errorText}>
                {t("network.fields.mustHaveLimit")}
              </PixelText>
            ) : null}
            <View style={styles.buttonRow}>
              {mustHaveItems.map((item) => {
                const selected = mustHaveConditionKeys.includes(item.key);

                return (
                  <PixelButton
                    key={item.key}
                    label={item.label}
                    variant={selected ? "primary" : "secondary"}
                    active={selected}
                    disabled={!selected && isMustHaveLimitReached}
                    testID={`network-must-have-${item.key}`}
                    onPress={() => toggleMustHaveCondition(item.key)}
                  />
                );
              })}
            </View>

            <View style={styles.buttonRow}>
              <PixelButton
                label={isMutatingNetwork ? t("network.actions.saving") : t("network.actions.saveCupidate")}
                variant="primary"
                disabled={!!isMutatingNetwork}
                onPress={() => {
                  void onSaveCupidate();
                }}
              />
            </View>
          </PixelBox>
            </>
          ) : null}
        </>
      ) : null}

      {networkSegment === "cupids" ? (
        <>
          <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
            {t("network.sections.cupidsHub")}
          </PixelText>
          <PixelSegmentTabs
            compact
            activeKey={cupidSubview}
            items={[
              { key: "list", label: t("network.subsegment.cupidList"), testID: "network-subsegment-cupids-list" },
              { key: "register", label: t("network.subsegment.cupidRegister"), testID: "network-subsegment-cupids-register" }
            ]}
            onSelect={setCupidSubview}
          />

          {cupidSubview === "list" ? (
            <>
          <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
            {t("network.sections.connectedRoster")}
          </PixelText>
          {connections.length === 0 ? (
            <StateCard
              tone="empty"
              title={t("network.empty.connectionsTitle")}
              description={t("network.empty.connectionsDescription")}
            />
          ) : (
            <PixelBox style={styles.networkRosterCard} contentStyle={styles.networkRosterContent}>
              {connections.map((item) => (
                <Pressable
                  key={item.cupidId}
                  onPress={() => onOpenCupidProfile(item.cupidId)}
                  testID={`profile-open-cupid-${item.cupidId}`}
                  style={styles.networkProfilePressable}
                >
                <View style={styles.networkRosterItem}>
                  <View style={styles.networkRosterItemHeader}>
                    <View style={styles.networkRosterMain}>
                      <PixelText variant="body" style={styles.listName}>
                        {item.name}
                      </PixelText>
                      <PixelText variant="caption" style={styles.networkRosterMeta}>
                        {t("network.connection.id", { id: item.cupidId })}
                      </PixelText>
                      <PixelText variant="caption" style={styles.networkRosterMeta}>
                        {item.region === "-" ? t("network.meta.cupid") : item.region}
                      </PixelText>
                    </View>
                    <View style={[styles.networkStatusChip, rosterStatusStyle(resolveConnectionTone(item.status))]}>
                      <PixelText variant="caption" style={styles.networkStatusText}>
                        {t(connectionStatusKey(item.status))}
                      </PixelText>
                    </View>
                  </View>
                </View>
                </Pressable>
              ))}
            </PixelBox>
          )}
            </>
          ) : null}

          {cupidSubview === "register" ? (
            <>
          <PixelBox style={styles.networkFormCard} contentStyle={styles.networkFormContent}>
            <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
              {t("network.sections.discovery")}
            </PixelText>
            <PixelText variant="caption" style={styles.fieldHint}>
              {t("network.discovery.caption")}
            </PixelText>
            <PixelText variant="caption" style={styles.fieldHint}>
              {t("network.form.cupidHint")}
            </PixelText>

            <PixelText variant="label" style={styles.fieldLabel}>
              {t("network.fields.searchCupid")}
            </PixelText>
            <TextInput
              value={connectionSearchQuery}
              onChangeText={onChangeConnectionSearchQuery}
              placeholder={t("network.placeholders.searchCupid")}
              placeholderTextColor={placeholderTextColor}
              style={styles.input}
            />

            {isSearchingCupids ? (
              <StateCard
                tone="loading"
                title={t("network.discovery.loadingTitle")}
                description={t("network.discovery.loadingDescription")}
              />
            ) : null}

            {showSearchEmptyState ? (
              <StateCard
                tone="empty"
                title={t("network.empty.searchTitle")}
                description={t("network.empty.searchDescription")}
              />
            ) : null}

            {connectionSearchResults.length > 0 ? (
              <View style={styles.networkSearchResults}>
                {connectionSearchResults.map((item) => {
                  const isSelected = selectedConnectionCupidId === item.cupidId;

                  return (
                    <Pressable
                      key={item.cupidId}
                      onPress={() => onOpenCupidProfile(item.cupidId)}
                      testID={`profile-open-cupid-${item.cupidId}`}
                      style={styles.networkProfilePressable}
                    >
                      <PixelBox style={styles.networkRosterCard} contentStyle={styles.networkRosterContent}>
                        <View style={styles.networkRosterItemHeader}>
                          <View style={styles.networkRosterMain}>
                            <PixelText variant="body" style={styles.listName}>
                              {item.nickname}
                            </PixelText>
                            <PixelText variant="caption" style={styles.networkRosterMeta}>
                              {t("network.connection.id", { id: item.cupidId })}
                            </PixelText>
                          </View>
                          <PixelButton
                            label={isSelected ? t("network.actions.selected") : t("network.actions.select")}
                            variant={isSelected ? "success" : "secondary"}
                            onPress={() => onSelectConnectionCupid(item.cupidId)}
                          />
                        </View>
                      </PixelBox>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.buttonRow}>
              <PixelButton
                label={t("network.actions.addConnection")}
                variant="primary"
                disabled={!selectedConnectionCupidId || !!isMutatingNetwork}
                onPress={() => {
                  void handleAddConnection();
                }}
              />
            </View>
          </PixelBox>
            </>
          ) : null}
        </>
      ) : null}
    </ScrollView>
  );
}

