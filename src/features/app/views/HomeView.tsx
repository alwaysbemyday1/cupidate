import { ScrollView, Text, View } from "react-native";

import { PixelButton } from "../components/PixelButton";
import { SummaryCard } from "../components/SummaryCard";
import { styles } from "../styles";
import type { HomeSummary } from "../model/types";

type HomeViewProps = {
  homeSummary: HomeSummary;
  notifications: string[];
  onGoNetwork: () => void;
  onGoMatching: () => void;
};

export function HomeView({ homeSummary, notifications, onGoNetwork, onGoMatching }: HomeViewProps) {
  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      <View style={styles.summaryGrid}>
        <SummaryCard label="My Cupidates" value={homeSummary.myCupidates} />
        <SummaryCard label="Connected Cupids" value={homeSummary.connectedCupids} />
        <SummaryCard label="Recommendations" value={homeSummary.recommendations} />
        <SummaryCard label="Pending Requests" value={homeSummary.pendingRequests} />
      </View>

      <Text style={styles.sectionTitle}>Notification Feed</Text>
      {notifications.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No notifications yet.</Text>
          <Text style={styles.emptySubText}>Actions in Network and Matching will appear here.</Text>
        </View>
      ) : (
        notifications.map((item) => (
          <View key={item} style={styles.listCard}>
            <Text style={styles.listMeta}>{item}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.buttonRow}>
        <PixelButton label="Go to Network" onPress={onGoNetwork} />
        <PixelButton label="Go to Matching" onPress={onGoMatching} />
      </View>
    </ScrollView>
  );
}
