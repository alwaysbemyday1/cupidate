import { Pressable, ScrollView, View } from "react-native";

import { PixelBox } from "../components/PixelBox";
import { PixelButton } from "../components/PixelButton";
import { PixelText } from "../components/PixelText";
import { StateCard } from "../components/StateCard";
import type { CupidateRecord, HomeNotification, HomeSummary, RecommendationItem } from "../model/types";
import { styles } from "../styles";
import { useI18n } from "../../i18n/context";

type HomeViewProps = {
  homeSummary: HomeSummary;
  activeCupidateCount: number;
  inactiveCupidateCount: number;
  notifications: HomeNotification[];
  recommendations: RecommendationItem[];
  cupidates: CupidateRecord[];
  onGoNetwork: () => void;
  onGoMy: () => void;
  onGoMatching: () => void;
  isHomeLoading?: boolean;
  homeError?: string | null;
  onRetryHomeError?: () => void | Promise<void>;
};

function notificationBadgeStyle(status: HomeNotification["status"]) {
  if (status === "accepted") {
    return styles.feedBadgeAccepted;
  }

  if (status === "rejected") {
    return styles.feedBadgeRejected;
  }

  if (status === "completed") {
    return styles.feedBadgeCompleted;
  }

  return null;
}

function notificationTextKey(status: HomeNotification["status"]) {
  return `home.notification.${status}`;
}

function notificationBadgeKey(status: HomeNotification["status"]) {
  return `home.notification.badge.${status}`;
}

function buildRecommendationMeta(cupidate: CupidateRecord | undefined) {
  if (!cupidate) {
    return undefined;
  }

  const parts = [cupidate.region, cupidate.jobTitle].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : undefined;
}

export function HomeView({
  homeSummary,
  activeCupidateCount,
  inactiveCupidateCount,
  notifications,
  recommendations,
  cupidates,
  onGoNetwork,
  onGoMy,
  onGoMatching,
  isHomeLoading,
  homeError,
  onRetryHomeError
}: HomeViewProps) {
  const { t } = useI18n();
  const cupidateMap = new Map(cupidates.map((item) => [item.cupidateId, item]));
  const topRecommendations = recommendations.slice(0, 2);
  const readinessState =
    homeSummary.myCupidates === 0
      ? {
          title: t("home.readiness.noCupidatesTitle"),
          description: t("home.readiness.noCupidatesDescription")
        }
      : activeCupidateCount === 0
        ? {
            title: t("home.readiness.noActiveTitle"),
            description: t("home.readiness.noActiveDescription", {
              count: inactiveCupidateCount
            })
          }
        : homeSummary.connectedCupids === 0
          ? {
              title: t("home.readiness.noConnectionsTitle"),
              description: t("home.readiness.noConnectionsDescription")
            }
          : null;
  const networkButtonVariant = readinessState ? "primary" : "secondary";
  const matchingButtonVariant = readinessState ? "secondary" : "primary";

  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      {isHomeLoading ? (
        <StateCard title={t("home.loading.title")} description={t("home.loading.description")} tone="loading" />
      ) : null}
      {homeError ? (
        <StateCard
          tone="error"
          title={t("home.error.title")}
          description={homeError}
          actionLabel={t("home.error.retry")}
          actionVariant="warning"
          onAction={onRetryHomeError}
        />
      ) : null}

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("home.sections.alarmFeed")}
      </PixelText>
      <PixelBox style={styles.sectionCard} contentStyle={styles.sectionCardContent}>
        {notifications.length === 0 ? (
          <StateCard
            tone="empty"
            title={t("home.empty.feedTitle")}
            description={t("home.empty.feedDescription")}
          />
        ) : (
          notifications.map((item) => (
            <View key={item.id} style={styles.feedRow}>
              <View style={[styles.feedBadge, notificationBadgeStyle(item.status)]}>
                <PixelText variant="caption" style={styles.feedBadgeText}>
                  {t(notificationBadgeKey(item.status))}
                </PixelText>
              </View>
              <View style={styles.feedBody}>
                <PixelText variant="body" style={styles.textBody}>
                  {t(notificationTextKey(item.status), {
                    source: item.sourceLabel,
                    target: item.targetLabel
                  })}
                </PixelText>
              </View>
            </View>
          ))
        )}
      </PixelBox>

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("home.sections.todaysRecs")}
      </PixelText>
      {topRecommendations.length === 0 ? (
        <StateCard
          tone="empty"
          title={t("home.empty.recommendationTitle")}
          description={t("home.empty.recommendationDescription")}
        />
      ) : (
        <View style={styles.recommendationRow}>
          {topRecommendations.map((item) => {
            const source = cupidateMap.get(item.sourceCupidateId);
            const target = cupidateMap.get(item.targetCupidateId);

            return (
              <Pressable
                key={`${item.sourceCupidateId}-${item.targetCupidateId}`}
                onPress={onGoMatching}
                style={styles.recommendationPressable}
              >
                <PixelBox style={styles.recommendationCard} contentStyle={styles.recommendationCardContent}>
                  <View style={styles.recommendationHeader}>
                    <View style={styles.recommendationMiniCard}>
                      <PixelText variant="body" style={styles.recommendationMiniName} numberOfLines={2}>
                        {source?.displayName ?? item.sourceCupidateId}
                      </PixelText>
                      {buildRecommendationMeta(source) ? (
                        <PixelText variant="caption" style={styles.listMeta} numberOfLines={2}>
                          {buildRecommendationMeta(source)}
                        </PixelText>
                      ) : null}
                    </View>
                    <PixelText variant="screenTitle" style={styles.recommendationHeart}>
                      {"<3"}
                    </PixelText>
                    <View style={styles.recommendationMiniCard}>
                      <PixelText variant="body" style={styles.recommendationMiniName} numberOfLines={2}>
                        {target?.displayName ?? item.targetCupidateId}
                      </PixelText>
                      {buildRecommendationMeta(target) ? (
                        <PixelText variant="caption" style={styles.listMeta} numberOfLines={2}>
                          {buildRecommendationMeta(target)}
                        </PixelText>
                      ) : null}
                    </View>
                  </View>
                  <View style={styles.recommendationRateChip}>
                    <PixelText variant="caption" style={styles.recommendationRateText}>
                      {t("home.recommendation.score", { rate: item.matchScore })}
                    </PixelText>
                  </View>
                </PixelBox>
              </Pressable>
            );
          })}
        </View>
      )}

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("home.sections.recentSummary")}
      </PixelText>
      <PixelBox style={styles.sectionCard} contentStyle={styles.sectionCardContent}>
        <View style={styles.metricRow}>
          <View style={styles.metricPill}>
            <PixelText variant="screenTitle" style={styles.metricValue}>
              {activeCupidateCount}
            </PixelText>
            <PixelText variant="caption" style={styles.metricLabel}>
              {t("home.metrics.active")}
            </PixelText>
          </View>
          <View style={styles.metricPill}>
            <PixelText variant="screenTitle" style={styles.metricValue}>
              {inactiveCupidateCount}
            </PixelText>
            <PixelText variant="caption" style={styles.metricLabel}>
              {t("home.metrics.inactive")}
            </PixelText>
          </View>
          <View style={styles.metricPill}>
            <PixelText variant="screenTitle" style={styles.metricValue}>
              {homeSummary.connectedCupids}
            </PixelText>
            <PixelText variant="caption" style={styles.metricLabel}>
              {t("home.metrics.connected")}
            </PixelText>
          </View>
          <View style={styles.metricPill}>
            <PixelText variant="screenTitle" style={styles.metricValue}>
              {homeSummary.pendingRequests}
            </PixelText>
            <PixelText variant="caption" style={styles.metricLabel}>
              {t("home.metrics.requests")}
            </PixelText>
          </View>
        </View>
      </PixelBox>

      {readinessState ? (
        <>
          <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
            {t("home.sections.readiness")}
          </PixelText>
          <StateCard
            tone="empty"
            title={readinessState.title}
            description={readinessState.description}
            actionLabel={t("home.actions.addNetwork")}
            onAction={onGoNetwork}
          />
        </>
      ) : null}

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("home.sections.quickActions")}
      </PixelText>
      <View style={styles.buttonRow}>
        <PixelButton label={t("home.actions.addNetwork")} variant={networkButtonVariant} onPress={onGoNetwork} />
        <PixelButton label={t("home.actions.reviewMatches")} variant={matchingButtonVariant} onPress={onGoMatching} />
        <PixelButton label={t("home.actions.updateProfile")} variant="secondary" onPress={onGoMy} />
      </View>
    </ScrollView>
  );
}
