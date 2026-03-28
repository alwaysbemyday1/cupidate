import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

import { PixelButton } from "../components/PixelButton";
import { StateCard } from "../components/StateCard";
import { SummaryCard } from "../components/SummaryCard";
import type { HomeSummary } from "../model/types";
import { styles } from "../styles";
import { cupidHeroSprites } from "../theme/sprites";

const SPRITE_FRAME_INTERVAL_MS = 180;

type HomeViewProps = {
  homeSummary: HomeSummary;
  notifications: string[];
  onGoNetwork: () => void;
  onGoMatching: () => void;
  isHomeLoading?: boolean;
  homeError?: string | null;
};

export function HomeView({
  homeSummary,
  notifications,
  onGoNetwork,
  onGoMatching,
  isHomeLoading,
  homeError
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
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>
          CUPID <Text style={styles.heroTitleAccent}>MODE</Text>
        </Text>
        <Text style={styles.heroSubtitle}>PRESS START TO MATCH</Text>
        <Text style={styles.heroFrameMeta}>
          FRAME {activeFrameIndex + 1}/{cupidHeroSprites.length}
        </Text>
        <View style={styles.spriteRow}>
          {cupidHeroSprites.map((source, index) => (
            <View
              key={`cupid-sprite-${index}`}
              style={[styles.spriteFrame, activeFrameIndex === index ? styles.spriteFrameActive : null]}
            >
              <Image
                source={source}
                style={[styles.spriteImage, activeFrameIndex === index ? styles.spriteImageActive : null]}
                resizeMode="contain"
              />
            </View>
          ))}
        </View>
      </View>

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
      {homeError ? <StateCard tone="error" title="HOME FEED ERROR" description={homeError} /> : null}

      <Text style={styles.sectionTitle}>Notification Feed</Text>
      {notifications.length === 0 ? (
        <StateCard
          tone="empty"
          title="NO NOTIFICATIONS YET"
          description="Actions in Network and Matching will appear here."
        />
      ) : (
        notifications.map((item) => (
          <View key={item} style={styles.listCard}>
            <Text style={styles.listMeta}>{item}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.buttonRow}>
        <PixelButton label="Go to Network" variant="primary" onPress={onGoNetwork} />
        <PixelButton label="Go to Matching" variant="warning" onPress={onGoMatching} />
      </View>
    </ScrollView>
  );
}
