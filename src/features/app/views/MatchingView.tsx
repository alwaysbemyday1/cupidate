import { ScrollView, Text, View } from "react-native";

import { PixelButton } from "../components/PixelButton";
import { pairKey } from "../model/useCupidateAppState";
import type { CupidateRecord, MatchRequest, MatchRequestStatus, RecommendationItem } from "../model/types";
import { styles } from "../styles";

type MatchingViewProps = {
  recommendations: RecommendationItem[];
  cupidates: CupidateRecord[];
  requestByPair: Map<string, MatchRequest>;
  requests: MatchRequest[];
  onSendRequest: (sourceCupidateId: string, targetCupidateId: string) => void | Promise<void>;
  onUpdateRequestStatus: (
    sourceCupidateId: string,
    targetCupidateId: string,
    status: MatchRequestStatus
  ) => void | Promise<void>;
  isMatchingLoading?: boolean;
  isMutatingMatching?: boolean;
};

export function MatchingView({
  recommendations,
  cupidates,
  requestByPair,
  requests,
  onSendRequest,
  onUpdateRequestStatus,
  isMatchingLoading,
  isMutatingMatching
}: MatchingViewProps) {
  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      {isMatchingLoading && <Text style={styles.listMeta}>Syncing matching requests...</Text>}

      <Text style={styles.sectionTitle}>Recommendation Board</Text>
      {recommendations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No recommendations yet.</Text>
          <Text style={styles.emptySubText}>Register my and connected cupidates first in Network.</Text>
        </View>
      ) : (
        recommendations.map((item) => {
          const key = pairKey(item.sourceCupidateId, item.targetCupidateId);
          const request = requestByPair.get(key);
          const sourceName =
            cupidates.find((profile) => profile.cupidateId === item.sourceCupidateId)?.displayName ||
            item.sourceCupidateId;
          const targetName =
            cupidates.find((profile) => profile.cupidateId === item.targetCupidateId)?.displayName ||
            item.targetCupidateId;

          return (
            <View key={key} style={styles.listCard}>
              <Text style={styles.listName}>
                {sourceName} x {targetName}
              </Text>
              <Text style={styles.listMeta}>Match Rate: {item.matchScore}%</Text>
              <Text style={styles.listMeta}>
                Shared Hobbies: {item.reason.matchedHobbies.length ? item.reason.matchedHobbies.join(", ") : "-"}
              </Text>
              <Text style={styles.listMeta}>Status: {request?.status ?? "none"}</Text>

              <View style={styles.buttonRow}>
                {!request && (
                  <PixelButton
                    label={isMutatingMatching ? "Processing..." : "Request Match"}
                    variant="warning"
                    onPress={() => onSendRequest(item.sourceCupidateId, item.targetCupidateId)}
                  />
                )}
                {request?.status === "requested" && (
                  <>
                    <PixelButton
                      label="Accept"
                      variant="success"
                      onPress={() =>
                        onUpdateRequestStatus(item.sourceCupidateId, item.targetCupidateId, "accepted")
                      }
                    />
                    <PixelButton
                      label="Reject"
                      variant="danger"
                      onPress={() =>
                        onUpdateRequestStatus(item.sourceCupidateId, item.targetCupidateId, "rejected")
                      }
                    />
                  </>
                )}
                {request?.status === "accepted" && (
                  <PixelButton
                    label="Mark Contact Shared"
                    variant="primary"
                    onPress={() =>
                      onUpdateRequestStatus(item.sourceCupidateId, item.targetCupidateId, "completed")
                    }
                  />
                )}
              </View>
            </View>
          );
        })
      )}

      <Text style={styles.sectionTitle}>Match Request History</Text>
      {requests.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No history yet.</Text>
        </View>
      ) : (
        requests.map((request) => (
          <View key={request.id} style={styles.listCard}>
            <Text style={styles.listMeta}>
              {request.sourceCupidateId}
              {" -> "}
              {request.targetCupidateId}
            </Text>
            <Text style={styles.listMeta}>Status: {request.status}</Text>
            <Text style={styles.listMeta}>Created: {request.createdAt.slice(0, 10)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
