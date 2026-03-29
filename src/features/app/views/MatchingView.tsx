import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { useI18n } from "../../i18n/context";
import type { ScoreBreakdown } from "../../../domain/matching/types";
import { PixelBox } from "../components/PixelBox";
import { PixelButton } from "../components/PixelButton";
import { PixelText } from "../components/PixelText";
import { StateCard } from "../components/StateCard";
import { pairKey } from "../model/useCupidateAppState";
import type { CupidateRecord, MatchRequest, MatchRequestStatus, RecommendationItem } from "../model/types";
import { styles } from "../styles";
import { designTokens } from "../theme/tokens";

type MatchingViewProps = {
  recommendations: RecommendationItem[];
  cupidates: CupidateRecord[];
  currentCupidId: string;
  requestByPair: Map<string, MatchRequest>;
  requests: MatchRequest[];
  onSendRequest: (sourceCupidateId: string, targetCupidateId: string) => void | Promise<void>;
  onUpdateRequestStatus: (
    sourceCupidateId: string,
    targetCupidateId: string,
    status: MatchRequestStatus
  ) => void | Promise<void>;
  onOpenCupidateProfile: (cupidateId: string) => void;
  isMatchingLoading?: boolean;
  isMutatingMatching?: boolean;
  matchingError?: string | null;
  onRetryMatchingError?: () => void | Promise<void>;
};

type MatchingCardItem = {
  key: string;
  sourceCupidateId: string;
  targetCupidateId: string;
  sourceName: string;
  targetName: string;
  matchScore: number;
  breakdown: ScoreBreakdown;
  matchedHobbies: string[];
  priorityMatches: string[];
  request?: MatchRequest;
  createdAt: string;
};

const EMPTY_BREAKDOWN: ScoreBreakdown = {
  age: 0,
  hobbies: 0,
  lifestyle: 0,
  location: 0,
  profile: 0
};

const BREAKDOWN_META = [
  { key: "age", max: 30, color: "#D88995", feedbackKey: "matching.feedback.age" },
  { key: "hobbies", max: 25, color: "#E0B04F", feedbackKey: "matching.feedback.hobbies" },
  { key: "lifestyle", max: 20, color: "#83BE73", feedbackKey: "matching.feedback.lifestyle" },
  { key: "location", max: 15, color: "#6E9FD0", feedbackKey: "matching.feedback.location" },
  { key: "profile", max: 10, color: "#8D76C4", feedbackKey: "matching.feedback.profile" }
] as const;

function buildAvatarSeed(label: string) {
  const trimmed = label.trim();

  if (!trimmed) {
    return "CP";
  }

  return Array.from(trimmed.replace(/\s+/g, "")).slice(0, 2).join("").toUpperCase();
}

function buildCupidateSubtitle(cupidate: CupidateRecord | undefined, currentCupidId: string) {
  if (!cupidate) {
    return undefined;
  }

  if (cupidate.ownerCupidId !== currentCupidId && cupidate.profileVisibility === "private") {
    return undefined;
  }

  const parts = [cupidate.region, cupidate.jobTitle].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : undefined;
}

function canRevealDetailedMatchingContext(cupidate: CupidateRecord | undefined, currentCupidId: string) {
  if (!cupidate) {
    return false;
  }

  return cupidate.ownerCupidId === currentCupidId || cupidate.profileVisibility === "public";
}

function formatDateLabel(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10);
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(
    2,
    "0"
  )}`;
}

function statusDisplayKey(status: MatchRequestStatus | "none") {
  switch (status) {
    case "requested":
      return "matching.status.awaitingApproval";
    case "accepted":
      return "matching.status.reviewing";
    case "completed":
      return "matching.status.contactsShared";
    case "rejected":
      return "matching.status.rejected";
    case "none":
    default:
      return "matching.status.newSuggestion";
  }
}

function timelineIndex(status?: MatchRequestStatus) {
  if (status === "completed") {
    return 2;
  }

  if (status === "accepted") {
    return 1;
  }

  if (status === "requested") {
    return 0;
  }

  return -1;
}

export function MatchingView({
  recommendations,
  cupidates,
  currentCupidId,
  requestByPair,
  requests,
  onSendRequest,
  onUpdateRequestStatus,
  onOpenCupidateProfile,
  isMatchingLoading,
  isMutatingMatching,
  matchingError,
  onRetryMatchingError
}: MatchingViewProps) {
  const { t } = useI18n();

  const cupidateMap = useMemo(() => new Map(cupidates.map((item) => [item.cupidateId, item])), [cupidates]);
  const recommendationMap = useMemo(
    () =>
      new Map(
        recommendations.map((item) => [
          pairKey(item.sourceCupidateId, item.targetCupidateId),
          item
        ])
      ),
    [recommendations]
  );

  const suggestionCards = useMemo<MatchingCardItem[]>(
    () =>
      recommendations
        .filter((item) => !requestByPair.get(pairKey(item.sourceCupidateId, item.targetCupidateId)))
        .map((item) => ({
          key: pairKey(item.sourceCupidateId, item.targetCupidateId),
          sourceCupidateId: item.sourceCupidateId,
          targetCupidateId: item.targetCupidateId,
          sourceName: cupidateMap.get(item.sourceCupidateId)?.displayName ?? item.sourceCupidateId,
          targetName: cupidateMap.get(item.targetCupidateId)?.displayName ?? item.targetCupidateId,
          matchScore: item.matchScore,
          breakdown: item.reason.breakdown,
          matchedHobbies: item.reason.matchedHobbies,
          priorityMatches: item.reason.priorityMatches,
          createdAt: new Date().toISOString()
        })),
    [cupidateMap, recommendations, requestByPair]
  );

  const requestCards = useMemo<MatchingCardItem[]>(
    () =>
      requests
        .map((request) => {
          const key = pairKey(request.sourceCupidateId, request.targetCupidateId);
          const recommendation = recommendationMap.get(key);

          return {
            key,
            sourceCupidateId: request.sourceCupidateId,
            targetCupidateId: request.targetCupidateId,
            sourceName: cupidateMap.get(request.sourceCupidateId)?.displayName ?? request.sourceCupidateId,
            targetName: cupidateMap.get(request.targetCupidateId)?.displayName ?? request.targetCupidateId,
            matchScore: recommendation?.matchScore ?? 0,
            breakdown: recommendation?.reason.breakdown ?? EMPTY_BREAKDOWN,
            matchedHobbies: recommendation?.reason.matchedHobbies ?? [],
            priorityMatches: recommendation?.reason.priorityMatches ?? [],
            request,
            createdAt: request.createdAt
          };
        }),
    [cupidateMap, recommendationMap, requests]
  );

  const activeRequestCards = useMemo(
    () => requestCards.filter((request) => request.request?.status === "requested" || request.request?.status === "accepted"),
    [requestCards]
  );

  const focusCard = activeRequestCards[0] ?? requestCards[0] ?? suggestionCards[0] ?? null;
  const focusSourceCupidate = focusCard ? cupidateMap.get(focusCard.sourceCupidateId) : undefined;
  const focusTargetCupidate = focusCard ? cupidateMap.get(focusCard.targetCupidateId) : undefined;
  const canRevealFocusDetails =
    canRevealDetailedMatchingContext(focusSourceCupidate, currentCupidId) &&
    canRevealDetailedMatchingContext(focusTargetCupidate, currentCupidId);

  const focusBreakdown = useMemo(
    () =>
      BREAKDOWN_META.map((item) => ({
        ...item,
        value: focusCard ? focusCard.breakdown[item.key] : 0
      })),
    [focusCard]
  );

  const feedbackItems = useMemo(() => {
    if (!focusCard) {
      return [];
    }

    const items: string[] = [];

    if (canRevealFocusDetails && focusCard.matchedHobbies.length > 0) {
      items.push(
        t("matching.feedback.hobbies", {
          value: focusCard.matchedHobbies.join(", ")
        })
      );
    }

    if (canRevealFocusDetails && focusCard.priorityMatches.length > 0) {
      items.push(
        t("matching.feedback.priority", {
          value: focusCard.priorityMatches.map((key) => t(`network.option.mustHave.${key}`)).join(", ")
        })
      );
    }

    const rankedBreakdown = [...focusBreakdown]
      .filter((item) => item.value > 0)
      .sort((left, right) => right.value - left.value);

    rankedBreakdown.forEach((item) => {
      if (items.length >= 3) {
        return;
      }

      if (item.key === "hobbies" && focusCard.matchedHobbies.length > 0) {
        return;
      }

      const threshold = item.max * 0.45;
      if (item.value >= threshold) {
        items.push(t(item.feedbackKey));
      }
    });

    if (items.length === 0) {
      items.push(t("matching.feedback.pending"));
    }

    return items.slice(0, 3);
    }, [canRevealFocusDetails, focusBreakdown, focusCard, t]);

  function statusChipStyle(status?: MatchRequestStatus) {
    if (status === "completed") {
      return styles.matchingStatusCompleted;
    }

    if (status === "accepted") {
      return styles.matchingStatusAccepted;
    }

    if (status === "rejected") {
      return styles.matchingStatusRejected;
    }

    if (status === "requested") {
      return styles.matchingStatusRequested;
    }

    return styles.matchingStatusNeutral;
  }

  function renderMiniProfile(cupidateId: string, name: string, subtitle?: string) {
    return (
      <Pressable onPress={() => onOpenCupidateProfile(cupidateId)} testID={`profile-open-cupidate-${cupidateId}`}>
        <View style={styles.matchingMiniProfile}>
          <View style={styles.matchingMiniAvatar}>
            <PixelText variant="body" style={styles.networkAvatarText}>
              {buildAvatarSeed(name)}
            </PixelText>
          </View>
          <View style={styles.matchingMiniInfo}>
            <PixelText variant="body" style={styles.matchingMiniName} numberOfLines={1}>
              {name}
            </PixelText>
            {subtitle ? (
              <PixelText variant="caption" style={styles.matchingMiniMeta} numberOfLines={1}>
                {subtitle}
              </PixelText>
            ) : null}
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      {isMatchingLoading ? (
        <StateCard
          tone="loading"
          title={t("matching.loading.title")}
          description={t("matching.loading.description")}
        />
      ) : null}
      {matchingError ? (
        <StateCard
          tone="error"
          title={t("matching.error.title")}
          description={matchingError}
          actionLabel={t("matching.error.retry")}
          actionVariant="warning"
          onAction={onRetryMatchingError}
        />
      ) : null}

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("matching.sections.pending")}
      </PixelText>
      {activeRequestCards.length === 0 ? (
        <StateCard
          tone="empty"
          title={t("matching.empty.pendingTitle")}
          description={t("matching.empty.pendingDescription")}
        />
      ) : (
        <PixelBox style={styles.matchingPanelCard} contentStyle={styles.matchingPanelContent}>
          {activeRequestCards.map((item) => (
            <PixelBox
              key={item.key}
              style={styles.matchingRequestCard}
              contentStyle={styles.matchingRequestContent}
              backgroundColor={designTokens.color.surface}
            >
              <View style={styles.matchingCardTopRow}>
                {renderMiniProfile(
                  item.sourceCupidateId,
                  item.sourceName,
                  buildCupidateSubtitle(cupidateMap.get(item.sourceCupidateId), currentCupidId)
                )}
                <PixelText variant="screenTitle" style={styles.recommendationHeart}>
                  {"<3"}
                </PixelText>
                {renderMiniProfile(
                  item.targetCupidateId,
                  item.targetName,
                  buildCupidateSubtitle(cupidateMap.get(item.targetCupidateId), currentCupidId)
                )}
              </View>

              <View style={styles.matchingCardMetaBlock}>
                <PixelText variant="body" style={styles.listName}>
                  {t("matching.card.requestTitle", {
                    source: item.sourceName,
                    target: item.targetName
                  })}
                </PixelText>
                <View style={styles.matchingMetaRow}>
                  <View style={styles.matchingScoreChip}>
                    <PixelText variant="caption" style={styles.matchingScoreText}>
                      {t("matching.card.score", { rate: item.matchScore })}
                    </PixelText>
                  </View>
                  <View style={[styles.matchingStatusChip, statusChipStyle(item.request?.status)]}>
                    <PixelText variant="caption" style={styles.matchingStatusText}>
                      {t(statusDisplayKey(item.request?.status ?? "none"))}
                    </PixelText>
                  </View>
                </View>
                <PixelText variant="caption" style={styles.listMeta}>
                  {t("matching.card.status", { value: t(statusDisplayKey(item.request?.status ?? "none")) })}
                </PixelText>
                  <PixelText variant="caption" style={styles.listMeta}>
                    {t("matching.card.sharedHobbies", {
                      value:
                        canRevealDetailedMatchingContext(cupidateMap.get(item.sourceCupidateId), currentCupidId) &&
                        canRevealDetailedMatchingContext(cupidateMap.get(item.targetCupidateId), currentCupidId) &&
                        item.matchedHobbies.length > 0
                          ? item.matchedHobbies.join(", ")
                          : "-"
                    })}
                  </PixelText>
              </View>

              <View style={styles.buttonRow}>
                {item.request?.status === "requested" ? (
                  <>
                    <PixelButton
                      label={t("matching.actions.approve")}
                      variant="success"
                      onPress={() =>
                        onUpdateRequestStatus(item.sourceCupidateId, item.targetCupidateId, "accepted")
                      }
                    />
                    <PixelButton
                      label={t("matching.actions.reject")}
                      variant="danger"
                      onPress={() =>
                        onUpdateRequestStatus(item.sourceCupidateId, item.targetCupidateId, "rejected")
                      }
                    />
                  </>
                ) : (
                  <PixelButton
                    label={item.request?.status === "completed" ? t("matching.actions.completed") : t("matching.actions.share")}
                    variant={item.request?.status === "completed" ? "neutral" : "primary"}
                    disabled={item.request?.status === "completed"}
                    onPress={() =>
                      onUpdateRequestStatus(item.sourceCupidateId, item.targetCupidateId, "completed")
                    }
                  />
                )}
              </View>
            </PixelBox>
          ))}
        </PixelBox>
      )}

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("matching.sections.suggestions")}
      </PixelText>
      {suggestionCards.length === 0 ? (
        <StateCard
          tone="empty"
          title={t("matching.empty.suggestionTitle")}
          description={t("matching.empty.suggestionDescription")}
        />
      ) : (
        <PixelBox style={styles.matchingPanelCard} contentStyle={styles.matchingPanelContent}>
          {suggestionCards.slice(0, 4).map((item) => (
            <View key={item.key} style={styles.matchingSuggestionRow}>
              <View style={styles.matchingSuggestionProfiles}>
                {renderMiniProfile(
                  item.sourceCupidateId,
                  item.sourceName,
                  buildCupidateSubtitle(cupidateMap.get(item.sourceCupidateId), currentCupidId)
                )}
                <PixelText variant="screenTitle" style={styles.recommendationHeart}>
                  {"<3"}
                </PixelText>
                {renderMiniProfile(
                  item.targetCupidateId,
                  item.targetName,
                  buildCupidateSubtitle(cupidateMap.get(item.targetCupidateId), currentCupidId)
                )}
              </View>
              <View style={styles.matchingSuggestionFooter}>
                <View style={styles.matchingSuggestionInfo}>
                  <PixelText variant="body" style={styles.listName}>
                    {t("matching.card.suggestionTitle", {
                      source: item.sourceName,
                      target: item.targetName
                    })}
                  </PixelText>
                  <PixelText variant="caption" style={styles.listMeta}>
                    {t("matching.card.score", { rate: item.matchScore })}
                  </PixelText>
                  <PixelText variant="caption" style={styles.listMeta}>
                    {t("matching.card.status", { value: t(statusDisplayKey("none")) })}
                  </PixelText>
                </View>

                <View style={styles.matchingSuggestionActions}>
                  <PixelButton
                    label={isMutatingMatching ? t("matching.actions.processing") : t("matching.actions.request")}
                    variant="primary"
                    onPress={() => onSendRequest(item.sourceCupidateId, item.targetCupidateId)}
                  />
                </View>
              </View>
            </View>
          ))}
        </PixelBox>
      )}

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("matching.sections.insights")}
      </PixelText>
      {!focusCard ? (
        <StateCard
          tone="empty"
          title={t("matching.empty.insightTitle")}
          description={t("matching.empty.insightDescription")}
        />
      ) : (
        <PixelBox style={styles.matchingInsightCard} contentStyle={styles.matchingInsightContent}>
          <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
            {t("matching.sections.breakdown")}
          </PixelText>

          <View style={styles.matchingInsightHeader}>
            <Pressable
              onPress={() => onOpenCupidateProfile(focusCard.sourceCupidateId)}
              testID={`profile-open-cupidate-${focusCard.sourceCupidateId}`}
            >
            <View style={styles.matchingInsightProfileCard}>
              <View style={styles.matchingInsightAvatar}>
                <PixelText variant="body" style={styles.networkAvatarText}>
                  {buildAvatarSeed(focusCard.sourceName)}
                </PixelText>
              </View>
              <PixelText variant="body" style={styles.matchingMiniName}>
                {focusCard.sourceName}
              </PixelText>
            </View>
            </Pressable>

            <View style={styles.matchingBreakdownChart}>
              {focusBreakdown.map((item) => {
                const barHeight = Math.max(8, Math.round((item.value / item.max) * 72));

                return (
                  <View key={item.key} style={styles.matchingBreakdownItem}>
                    <View style={styles.matchingBreakdownTrack}>
                      <View style={[styles.matchingBreakdownFill, { height: barHeight, backgroundColor: item.color }]} />
                    </View>
                    <PixelText variant="caption" style={styles.matchingBreakdownValue}>
                      {Math.round(item.value)}
                    </PixelText>
                    <PixelText variant="caption" style={styles.matchingBreakdownLabel}>
                      {t(`matching.breakdown.${item.key}`)}
                    </PixelText>
                  </View>
                );
              })}
            </View>

            <Pressable
              onPress={() => onOpenCupidateProfile(focusCard.targetCupidateId)}
              testID={`profile-open-cupidate-${focusCard.targetCupidateId}`}
            >
            <View style={styles.matchingInsightProfileCard}>
              <View style={styles.matchingInsightAvatar}>
                <PixelText variant="body" style={styles.networkAvatarText}>
                  {buildAvatarSeed(focusCard.targetName)}
                </PixelText>
              </View>
              <PixelText variant="body" style={styles.matchingMiniName}>
                {focusCard.targetName}
              </PixelText>
            </View>
            </Pressable>
          </View>

          <View style={styles.matchingInsightScoreRow}>
            <View style={styles.matchingScoreChip}>
              <PixelText variant="caption" style={styles.matchingScoreText}>
                {t("matching.card.score", { rate: focusCard.matchScore })}
              </PixelText>
            </View>
            <PixelText variant="caption" style={styles.listMeta}>
              {t("matching.card.created", { value: formatDateLabel(focusCard.createdAt) })}
            </PixelText>
          </View>
          <PixelText variant="caption" style={styles.listMeta}>
            {t("matching.card.status", { value: t(statusDisplayKey(focusCard.request?.status ?? "none")) })}
          </PixelText>

          <View style={styles.profileDivider} />

          <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
            {t("matching.sections.timeline")}
          </PixelText>
          <View style={styles.matchingTimelineRow}>
            {[0, 1, 2].map((index) => {
              const currentIndex = timelineIndex(focusCard.request?.status);
              const state =
                currentIndex < 0 ? "wait" : index < currentIndex ? "done" : index === currentIndex ? "live" : "wait";

              const labelKey =
                index === 0 ? "matching.timeline.request" : index === 1 ? "matching.timeline.approval" : "matching.timeline.contact";

              return (
                <View key={labelKey} style={styles.matchingTimelineStep}>
                  <View
                    style={[
                      styles.matchingTimelineMarker,
                      state === "done"
                        ? styles.matchingTimelineMarkerDone
                        : state === "live"
                          ? styles.matchingTimelineMarkerLive
                          : styles.matchingTimelineMarkerWait
                    ]}
                  >
                    <PixelText variant="caption" style={styles.matchingTimelineMarkerText}>
                      {index + 1}
                    </PixelText>
                  </View>
                  <PixelText variant="caption" style={styles.matchingTimelineLabel}>
                    {t(labelKey)}
                  </PixelText>
                  <PixelText variant="caption" style={styles.matchingTimelineState}>
                    {t(`matching.timeline.state.${state}`)}
                  </PixelText>
                  {index < 2 ? (
                    <View
                      style={[
                        styles.matchingTimelineConnector,
                        state === "done" ? styles.matchingTimelineConnectorDone : null
                      ]}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>

          <View style={styles.profileDivider} />

          <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
            {t("matching.sections.feedback")}
          </PixelText>
          <View style={styles.matchingFeedbackList}>
            {feedbackItems.map((item, index) => {
              const ownerName = index % 2 === 0 ? focusCard.sourceName : focusCard.targetName;

              return (
                <View key={`${ownerName}-${index}`} style={styles.matchingFeedbackItem}>
                  <View style={styles.matchingFeedbackAvatar}>
                    <PixelText variant="caption" style={styles.networkAvatarText}>
                      {buildAvatarSeed(ownerName)}
                    </PixelText>
                  </View>
                  <View style={styles.matchingFeedbackBody}>
                    <PixelText variant="caption" style={styles.matchingFeedbackName}>
                      {ownerName}
                    </PixelText>
                    <PixelText variant="body" style={styles.textBody}>
                      {item}
                    </PixelText>
                  </View>
                </View>
              );
            })}
          </View>
        </PixelBox>
      )}
    </ScrollView>
  );
}
