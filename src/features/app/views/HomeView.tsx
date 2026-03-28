import { useEffect, useState } from "react";
import { Image, ScrollView, View, type ImageStyle } from "react-native";

import { PixelBox } from "../components/PixelBox";
import { PixelButton } from "../components/PixelButton";
import { PixelText } from "../components/PixelText";
import { StateCard } from "../components/StateCard";
import { SummaryCard } from "../components/SummaryCard";
import type { HomeSummary } from "../model/types";
import { styles } from "../styles";
import { cupidHeroSprites } from "../theme/sprites";
import { designTokens } from "../theme/tokens";

const SPRITE_FRAME_INTERVAL_MS = 180;

type HomeViewProps = {
  homeSummary: HomeSummary;
  notifications: string[];
  onGoNetwork: () => void;
  onGoMatching: () => void;
  isHomeLoading?: boolean;
  homeError?: string | null;
  onRetryHomeError?: () => void | Promise<void>;
};

export function HomeView({
  homeSummary,
  notifications,
  onGoNetwork,
  onGoMatching,
  isHomeLoading,
  homeError,
  onRetryHomeError
}: HomeViewProps) {
  const [activeFrameIndex, setActiveFrameIndex] = useState(0);

  useEffect(() => {
    if (process.env.NODE_ENV === "test") {
      return;
    }

    const timerId = setInterval(() => {
      setActiveFrameIndex((previous) => (previous + 1) % cupidHeroSprites.length);
    }, SPRITE_FRAME_INTERVAL_MS);

    return () => clearInterval(timerId);
  }, []);

  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      <PixelBox style={styles.heroCard} contentStyle={styles.heroCardContent}>
        <PixelText variant="screenTitle" style={styles.heroTitle}>
          {"CUPID "}
          <PixelText variant="screenTitle" style={styles.heroTitleAccent}>
            MODE
          </PixelText>
        </PixelText>
        <PixelText variant="body" style={styles.heroSubtitle}>
          PRESS START TO MATCH
        </PixelText>
        <PixelText variant="caption" style={styles.heroFrameMeta}>
          {`FRAME ${activeFrameIndex + 1}/${cupidHeroSprites.length}`}
        </PixelText>
        <View style={styles.spriteRow}>
          {cupidHeroSprites.map((source, index) => (
            <View
              key={`cupid-sprite-${index}`}
              style={[styles.spriteFrame, activeFrameIndex === index ? styles.spriteFrameActive : null]}
            >
              <Image
                source={source}
                style={[
                  styles.spriteImage as ImageStyle,
                  activeFrameIndex === index ? (styles.spriteImageActive as ImageStyle) : null
                ]}
                resizeMode="contain"
              />
            </View>
          ))}
        </View>
      </PixelBox>

      <View style={styles.summaryGrid}>
        <SummaryCard label="My Cupidates" value={homeSummary.myCupidates} />
        <SummaryCard label="Connected Cupids" value={homeSummary.connectedCupids} />
        <SummaryCard label="Recommendations" value={homeSummary.recommendations} />
        <SummaryCard label="Pending Requests" value={homeSummary.pendingRequests} />
      </View>

      {isHomeLoading ? (
        <StateCard
          tone="loading"
          title="SYNCING HOME FEED"
          description="Refreshing network counters and matching activity."
        />
      ) : null}
      {homeError ? (
        <StateCard
          tone="error"
          title="HOME FEED ERROR"
          description={homeError}
          actionLabel="Retry Home Sync"
          actionVariant="warning"
          onAction={onRetryHomeError}
        />
      ) : null}

      <PixelText variant="sectionTitle" style={styles.sectionTitle}>
        Notification Feed
      </PixelText>
      {notifications.length === 0 ? (
        <StateCard
          tone="empty"
          title="NO NOTIFICATIONS YET"
          description="Actions in Network and Matching will appear here."
        />
      ) : (
        notifications.map((item) => (
          <PixelBox
            key={item}
            style={styles.listCard}
            contentStyle={[styles.listCardContent, { backgroundColor: designTokens.color.surfaceAlt }]}
          >
            <PixelText variant="body" style={styles.listMeta}>
              {item}
            </PixelText>
          </PixelBox>
        ))
      )}

      <PixelText variant="sectionTitle" style={styles.sectionTitle}>
        Quick Actions
      </PixelText>
      <View style={styles.buttonRow}>
        <PixelButton label="Go to Network" variant="secondary" onPress={onGoNetwork} />
        <PixelButton label="Go to Matching" variant="primary" onPress={onGoMatching} />
      </View>
    </ScrollView>
  );
}
