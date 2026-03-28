import { ScrollView, View } from "react-native";

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
  matchingError?: string | null;
  onRetryMatchingError?: () => void | Promise<void>;
};

export function MatchingView({
  recommendations,
  cupidates,
  requestByPair,
  requests,
  onSendRequest,
  onUpdateRequestStatus,
  isMatchingLoading,
  isMutatingMatching,
  matchingError,
  onRetryMatchingError
}: MatchingViewProps) {
  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      {isMatchingLoading ? (
        <StateCard
          tone="loading"
          title="SYNCING MATCH STATUS"
          description="Refreshing recommendation and request lifecycle data."
        />
      ) : null}
      {matchingError ? (
        <StateCard
          tone="error"
          title="MATCH BOARD ERROR"
          description={matchingError}
          actionLabel="Retry Match Sync"
          actionVariant="warning"
          onAction={onRetryMatchingError}
        />
      ) : null}

      <PixelText variant="sectionTitle" style={styles.sectionTitle}>
        Recommendation Board
      </PixelText>
      {recommendations.length === 0 ? (
        <StateCard
          tone="empty"
          title="NO RECOMMENDATIONS YET"
          description="Register my and connected cupidates first in Network."
        />
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
            <PixelBox
              key={key}
              style={styles.listCard}
              contentStyle={[styles.listCardContent, { backgroundColor: designTokens.color.surfaceAlt }]}
            >
              <PixelText variant="sectionTitle" style={styles.listName}>
                {`${sourceName} x ${targetName}`}
              </PixelText>
              <PixelText variant="body" style={styles.listMeta}>
                {`Match Rate: ${item.matchScore}%`}
              </PixelText>
              <PixelText variant="body" style={styles.listMeta}>
                {`Breakdown: AGE ${item.reason.breakdown.age} / HOBBY ${item.reason.breakdown.hobbies} / LIFE ${item.reason.breakdown.lifestyle} / LOC ${item.reason.breakdown.location} / PROFILE ${item.reason.breakdown.profile}`}
              </PixelText>
              <PixelText variant="body" style={styles.listMeta}>
                {`Shared Hobbies: ${item.reason.matchedHobbies.length ? item.reason.matchedHobbies.join(", ") : "-"}`}
              </PixelText>
              <PixelText variant="body" style={styles.listMeta}>
                {`Status: ${request?.status ?? "none"}`}
              </PixelText>

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
            </PixelBox>
          );
        })
      )}

      <PixelText variant="sectionTitle" style={styles.sectionTitle}>
        Match Request History
      </PixelText>
      {requests.length === 0 ? (
        <StateCard tone="empty" title="NO MATCH HISTORY" description="Requested matches will appear in this board." />
      ) : (
        requests.map((request) => (
          <PixelBox key={request.id} style={styles.listCard} contentStyle={styles.listCardContent}>
            <PixelText variant="body" style={styles.listMeta}>
              {`${request.sourceCupidateId} -> ${request.targetCupidateId}`}
            </PixelText>
            <PixelText variant="body" style={styles.listMeta}>
              {`Status: ${request.status}`}
            </PixelText>
            <PixelText variant="body" style={styles.listMeta}>
              {`Created: ${request.createdAt.slice(0, 10)}`}
            </PixelText>
          </PixelBox>
        ))
      )}
    </ScrollView>
  );
}
