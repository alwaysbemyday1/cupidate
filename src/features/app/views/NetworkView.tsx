import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import { useI18n } from "../../i18n/context";
import { PixelBox } from "../components/PixelBox";
import { PixelButton } from "../components/PixelButton";
import { PixelSegmentTabs } from "../components/PixelSegmentTabs";
import { PixelText } from "../components/PixelText";
import { StateCard } from "../components/StateCard";
import type { CupidConnection, CupidateRecord, NetworkSegment } from "../model/types";
import { styles } from "../styles";
import { designTokens } from "../theme/tokens";

type ConnectionSearchResult = {
  cupidId: string;
  nickname: string;
  datingProfileStatus: "active" | "inactive" | "none";
  cupidateId: string | null;
  cupidateName: string | null;
  profileVisibility: "private" | "basic" | "public" | null;
};

type NetworkViewProps = {
  networkSegment: NetworkSegment;
  onChangeNetworkSegment: (segment: NetworkSegment) => void;
  myCupidate: CupidateRecord | null;
  networkCupidates: CupidateRecord[];
  connections: CupidConnection[];
  currentCupidId: string;
  connectionSearchQuery: string;
  onChangeConnectionSearchQuery: (value: string) => void;
  connectionSearchResults: ConnectionSearchResult[];
  selectedConnectionCupidId: string | null;
  onSelectConnectionCupid: (cupidId: string) => void;
  onAddConnection: () => void | Promise<void>;
  onRespondToConnection: (connectionId: string, action: "accept" | "decline") => void | Promise<void>;
  onOpenCupidProfile: (cupidId: string) => void;
  onOpenCupidateProfile: (cupidateId: string) => void;
  isNetworkLoading?: boolean;
  isSearchingCupids?: boolean;
  isMutatingNetwork?: boolean;
  networkError?: string | null;
  onRetryNetworkError?: () => void | Promise<void>;
};

const placeholderTextColor = designTokens.color.inkMuted;

function ageLabel(birthYear: number | null | undefined) {
  if (!birthYear) {
    return "--";
  }

  return String(new Date().getFullYear() - birthYear);
}

function joinMeta(parts: Array<string | undefined | null>) {
  return parts.filter(Boolean).join(" / ");
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

function connectionStatusKey(status: CupidConnection["status"]) {
  return `network.connection.status.${status}`;
}

function connectionStatusStyle(status: CupidConnection["status"]) {
  if (status === "connected") {
    return styles.networkStatusMatched;
  }

  if (status === "pending") {
    return styles.networkStatusPending;
  }

  return styles.networkStatusBlocked;
}

function datingStatusKey(status: CupidConnection["datingProfileStatus"]) {
  return `network.connection.profile.${status}`;
}

function datingStatusStyle(status: CupidConnection["datingProfileStatus"]) {
  if (status === "active") {
    return styles.networkStatusMatched;
  }

  if (status === "inactive") {
    return styles.networkStatusPending;
  }

  return styles.networkStatusNeutral;
}

function visibilityKey(visibility: "private" | "basic" | "public") {
  return `network.option.visibility.${visibility}`;
}

function renderCupidateMeta(item: CupidateRecord, currentCupidId: string, t: ReturnType<typeof useI18n>["t"]) {
  if (item.ownerCupidId !== currentCupidId && item.profileVisibility === "private") {
    return t("network.cupidate.privateLine");
  }

  return joinMeta([
    t(genderKey(item.gender)),
    ageLabel(item.birthYear),
    item.region ?? item.preferences.location ?? item.preferences.region ?? "--"
  ]);
}

export function NetworkView({
  networkSegment,
  onChangeNetworkSegment,
  myCupidate,
  networkCupidates,
  connections,
  currentCupidId,
  connectionSearchQuery,
  onChangeConnectionSearchQuery,
  connectionSearchResults,
  selectedConnectionCupidId,
  onSelectConnectionCupid,
  onAddConnection,
  onRespondToConnection,
  onOpenCupidProfile,
  onOpenCupidateProfile,
  isNetworkLoading,
  isSearchingCupids,
  isMutatingNetwork,
  networkError,
  onRetryNetworkError
}: NetworkViewProps) {
  const { t } = useI18n();
  const [isAddCupidComposerOpen, setIsAddCupidComposerOpen] = useState(false);

  const connectedCupidNameById = useMemo(
    () => new Map(connections.map((item) => [item.cupidId, item.name])),
    [connections]
  );

  useEffect(() => {
    if (networkSegment !== "cupids") {
      setIsAddCupidComposerOpen(false);
    }
  }, [networkSegment]);

  const showSearchEmptyState =
    networkSegment === "cupids" &&
    isAddCupidComposerOpen &&
    connectionSearchQuery.trim().length > 0 &&
    !isSearchingCupids &&
    connectionSearchResults.length === 0;

  async function handleAddConnection() {
    await onAddConnection();
    setIsAddCupidComposerOpen(false);
  }

  return (
    <View style={styles.panel}>
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
            { key: "cupids", label: t("network.segment.cupids"), testID: "network-segment-cupids" },
            { key: "cupidates", label: t("network.segment.cupidates"), testID: "network-segment-cupidates" }
          ]}
          onSelect={onChangeNetworkSegment}
        />

        {networkSegment === "cupids" ? (
          <>
            <PixelBox style={styles.networkGuideCard} contentStyle={styles.networkGuideContent}>
              <PixelText variant="body" style={styles.textBody}>
                {t("network.guide.cupids.primary")}
              </PixelText>
              <PixelText variant="caption" style={styles.profileMetaText}>
                {t("network.guide.cupids.secondary")}
              </PixelText>
            </PixelBox>

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
                    key={item.connectionId}
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
                            {t(`network.connection.direction.${item.direction}`)}
                          </PixelText>
                          <PixelText variant="caption" style={styles.networkRosterMeta}>
                            {item.datingProfileStatus === "active" && item.activeCupidateName
                              ? t("network.connection.profile.activeWithName", {
                                  value: item.activeCupidateName
                                })
                              : t(datingStatusKey(item.datingProfileStatus))}
                          </PixelText>
                        </View>
                        <View style={styles.networkStatusColumn}>
                          <View style={[styles.networkStatusChip, connectionStatusStyle(item.status)]}>
                            <PixelText variant="caption" style={styles.networkStatusText}>
                              {t(connectionStatusKey(item.status))}
                            </PixelText>
                          </View>
                          <View style={[styles.networkStatusChip, datingStatusStyle(item.datingProfileStatus)]}>
                            <PixelText variant="caption" style={styles.networkStatusText}>
                              {t(datingStatusKey(item.datingProfileStatus))}
                            </PixelText>
                          </View>
                        </View>
                      </View>
                      {item.status === "pending" && item.direction === "inbound" ? (
                        <View style={styles.buttonRow}>
                          <PixelButton
                            label={t("network.actions.acceptConnection")}
                            variant="success"
                            onPress={() => {
                              void onRespondToConnection(item.connectionId, "accept");
                            }}
                          />
                          <PixelButton
                            label={t("network.actions.declineConnection")}
                            variant="danger"
                            onPress={() => {
                              void onRespondToConnection(item.connectionId, "decline");
                            }}
                          />
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                ))}
              </PixelBox>
            )}
          </>
        ) : null}

        {networkSegment === "cupidates" ? (
          <>
            <PixelBox style={styles.networkGuideCard} contentStyle={styles.networkGuideContent}>
              <PixelText variant="body" style={styles.textBody}>
                {t("network.guide.cupidates.primary")}
              </PixelText>
              <PixelText variant="caption" style={styles.profileMetaText}>
                {t("network.guide.cupidates.secondary")}
              </PixelText>
            </PixelBox>

            <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
              {t("network.sections.myCupidate")}
            </PixelText>
            {myCupidate ? (
              <PixelBox style={styles.networkRosterCard} contentStyle={styles.networkRosterContent}>
                <Pressable
                  onPress={() => onOpenCupidateProfile(myCupidate.cupidateId)}
                  testID={`profile-open-cupidate-${myCupidate.cupidateId}`}
                  style={styles.networkProfilePressable}
                >
                  <View style={styles.networkRosterItem}>
                    <View style={styles.networkRosterItemHeader}>
                      <View style={styles.networkRosterMain}>
                        <PixelText variant="body" style={styles.listName}>
                          {myCupidate.displayName}
                        </PixelText>
                        <PixelText variant="caption" style={styles.networkRosterMeta}>
                          {renderCupidateMeta(myCupidate, currentCupidId, t)}
                        </PixelText>
                        <PixelText variant="caption" style={styles.networkRosterMeta}>
                          {t("network.cupidate.visibility", {
                            value: t(visibilityKey(myCupidate.profileVisibility ?? "basic"))
                          })}
                        </PixelText>
                      </View>
                      <View style={styles.networkStatusColumn}>
                        <View
                          style={[
                            styles.networkStatusChip,
                            myCupidate.isActive ? styles.networkStatusMatched : styles.networkStatusPending
                          ]}
                        >
                          <PixelText variant="caption" style={styles.networkStatusText}>
                            {myCupidate.isActive
                              ? t("network.cupidate.activation.active")
                              : t("network.cupidate.activation.inactive")}
                          </PixelText>
                        </View>
                      </View>
                    </View>
                  </View>
                </Pressable>
              </PixelBox>
            ) : (
              <StateCard
                tone="empty"
                title={t("network.empty.myCupidateTitle")}
                description={t("network.empty.myCupidateDescription")}
              />
            )}

            <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
              {t("network.sections.networkCupidates")}
            </PixelText>
            {networkCupidates.length === 0 ? (
              <StateCard
                tone="empty"
                title={t("network.empty.networkCupidatesTitle")}
                description={t("network.empty.networkCupidatesDescription")}
              />
            ) : (
              <PixelBox style={styles.networkRosterCard} contentStyle={styles.networkRosterContent}>
                {networkCupidates.map((item) => (
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
                            {t("network.cupidate.owner", {
                              value: connectedCupidNameById.get(item.ownerCupidId) ?? item.ownerCupidId
                            })}
                          </PixelText>
                          <PixelText variant="caption" style={styles.networkRosterMeta}>
                            {renderCupidateMeta(item, currentCupidId, t)}
                          </PixelText>
                          <PixelText variant="caption" style={styles.networkRosterMeta}>
                            {t("network.cupidate.visibility", {
                              value: t(visibilityKey(item.profileVisibility ?? "basic"))
                            })}
                          </PixelText>
                        </View>
                        <View style={styles.networkStatusColumn}>
                          <View style={[styles.networkStatusChip, styles.networkStatusMatched]}>
                            <PixelText variant="caption" style={styles.networkStatusText}>
                              {t("network.cupidate.activation.active")}
                            </PixelText>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </PixelBox>
            )}
          </>
        ) : null}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        testID="network-add-cupid-fab"
        style={styles.networkFab}
        onPress={() => setIsAddCupidComposerOpen(true)}
      >
        <View style={styles.networkFabInner}>
          <PixelText variant="screenTitle" style={styles.networkFabPlus}>
            +
          </PixelText>
          <PixelText variant="caption" style={styles.networkFabLabel}>
            {t("network.actions.openAddCupid")}
          </PixelText>
        </View>
      </Pressable>

      {isAddCupidComposerOpen ? (
        <View style={styles.networkComposerOverlay} testID="network-add-cupid-sheet">
          <Pressable style={styles.networkComposerScrim} onPress={() => setIsAddCupidComposerOpen(false)} />
          <View style={styles.networkComposerWrapper}>
            <PixelBox style={styles.networkComposerFrame} contentStyle={styles.networkComposerContent}>
              <View style={styles.networkComposerTopRow}>
                <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
                  {t("network.sections.discovery")}
                </PixelText>
                <PixelButton
                  label={t("network.actions.closeComposer")}
                  variant="secondary"
                  onPress={() => setIsAddCupidComposerOpen(false)}
                />
              </View>

              <PixelText variant="caption" style={styles.fieldHint}>
                {t("network.discovery.caption")}
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
                              <PixelText variant="caption" style={styles.networkRosterMeta}>
                                {item.datingProfileStatus === "active" && item.cupidateName
                                  ? t("network.connection.profile.activeWithName", {
                                      value: item.cupidateName
                                    })
                                  : t(`network.connection.profile.${item.datingProfileStatus}`)}
                              </PixelText>
                              {item.profileVisibility ? (
                                <PixelText variant="caption" style={styles.networkRosterMeta}>
                                  {t("network.cupidate.visibility", {
                                    value: t(visibilityKey(item.profileVisibility))
                                  })}
                                </PixelText>
                              ) : null}
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
                  label={isMutatingNetwork ? t("network.actions.connecting") : t("network.actions.addConnection")}
                  variant="primary"
                  disabled={!selectedConnectionCupidId || !!isMutatingNetwork}
                  onPress={() => {
                    void handleAddConnection();
                  }}
                />
              </View>
            </PixelBox>
          </View>
        </View>
      ) : null}
    </View>
  );
}
