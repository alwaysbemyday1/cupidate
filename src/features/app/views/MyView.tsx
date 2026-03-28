import { ScrollView, Switch, TextInput, View } from "react-native";

import { PixelBox } from "../components/PixelBox";
import { PixelButton } from "../components/PixelButton";
import { PixelText } from "../components/PixelText";
import { StateCard } from "../components/StateCard";
import { SummaryCard } from "../components/SummaryCard";
import { styles } from "../styles";
import { designTokens } from "../theme/tokens";

type MyViewProps = {
  myNickname: string;
  onChangeMyNickname: (value: string) => void;
  onSaveMyNickname: () => void | Promise<void>;
  isSavingNickname?: boolean;
  privacyNetworkOnly: boolean;
  onChangePrivacyNetworkOnly: (value: boolean) => void;
  notificationEnabled: boolean;
  onChangeNotificationEnabled: (value: boolean) => void;
  connectionCount: number;
  cupidateCount: number;
  requestCount: number;
  currentCupidId: string;
  accountEmail?: string | null;
  joinedAt?: string | null;
  accountMode: "local" | "supabase";
  onRefreshAccount?: () => void | Promise<void>;
  isMyLoading?: boolean;
  myError?: string | null;
  onRetryMyError?: () => void | Promise<void>;
};

function buildAvatarSeed(nickname: string) {
  const compact = nickname.replace(/[^a-zA-Z0-9가-힣]/g, "").trim();

  if (!compact) {
    return "CU";
  }

  return compact.slice(0, 2).toUpperCase();
}

function formatJoinedAt(joinedAt?: string | null) {
  if (!joinedAt) {
    return "Local Build";
  }

  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function MyView({
  myNickname,
  onChangeMyNickname,
  onSaveMyNickname,
  isSavingNickname,
  privacyNetworkOnly,
  onChangePrivacyNetworkOnly,
  notificationEnabled,
  onChangeNotificationEnabled,
  connectionCount,
  cupidateCount,
  requestCount,
  currentCupidId,
  accountEmail,
  joinedAt,
  accountMode,
  onRefreshAccount,
  isMyLoading,
  myError,
  onRetryMyError
}: MyViewProps) {
  const avatarSeed = buildAvatarSeed(myNickname);
  const profileStatus = accountMode === "supabase" ? "Supabase Connected" : "Local Sandbox";

  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      {isMyLoading ? (
        <StateCard tone="loading" title="SYNCING PROFILE TERMINAL" description="Loading my account and settings snapshot." />
      ) : null}
      {myError ? (
        <StateCard
          tone="error"
          title="PROFILE SYNC ERROR"
          description={myError}
          actionLabel="Retry Profile Sync"
          actionVariant="warning"
          onAction={onRetryMyError}
        />
      ) : null}

      <PixelText variant="sectionTitle" style={styles.sectionTitle}>
        Profile Overview
      </PixelText>
      <PixelBox style={styles.listCard} contentStyle={styles.listCardContent}>
        <View style={styles.profileRow}>
          <View style={styles.avatarBox}>
            <PixelText variant="screenTitle" style={styles.avatarText}>
              {avatarSeed}
            </PixelText>
          </View>
          <View style={styles.profileInfo}>
            <PixelText variant="label" style={styles.fieldLabel}>
              Nickname
            </PixelText>
            <TextInput value={myNickname} onChangeText={onChangeMyNickname} style={styles.input} />
            <PixelText variant="body" style={styles.textBody}>
              {`Cupid ID: ${currentCupidId}`}
            </PixelText>
            <PixelText variant="caption" style={styles.profileMetaText}>
              {profileStatus}
            </PixelText>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <PixelButton
            label={isSavingNickname ? "Saving..." : "Save Nickname"}
            variant="primary"
            onPress={onSaveMyNickname}
          />
          <PixelButton
            label="Refresh Session"
            variant="secondary"
            onPress={() => {
              void onRefreshAccount?.();
            }}
            disabled={!onRefreshAccount}
          />
        </View>
      </PixelBox>

      <PixelText variant="sectionTitle" style={styles.sectionTitle}>
        Account Details
      </PixelText>
      <PixelBox style={styles.listCard} contentStyle={styles.listCardContent}>
        <PixelText variant="body" style={styles.textBody}>
          {`Email: ${accountEmail ?? "Local mode account"}`}
        </PixelText>
        <View style={styles.profileDivider} />
        <PixelText variant="body" style={styles.textBody}>
          {`Join Date: ${formatJoinedAt(joinedAt)}`}
        </PixelText>
        <View style={styles.profileDivider} />
        <PixelText variant="body" style={styles.textBody}>
          {`Status: ${notificationEnabled ? "Alerts Active" : "Alerts Paused"}`}
        </PixelText>
      </PixelBox>

      <PixelText variant="sectionTitle" style={styles.sectionTitle}>
        Matching Preferences
      </PixelText>
      <PixelBox style={styles.listCard} contentStyle={styles.listCardContent}>
        <View style={styles.settingRow}>
          <PixelText variant="label" style={styles.fieldLabel}>
            Network-only profile visibility
          </PixelText>
          <Switch
            value={privacyNetworkOnly}
            onValueChange={onChangePrivacyNetworkOnly}
            trackColor={{ false: designTokens.color.switchTrack, true: designTokens.color.pink }}
          />
        </View>
        <PixelText variant="body" style={styles.listMeta}>
          {`Visibility: ${privacyNetworkOnly ? "Network only" : "Private"}`}
        </PixelText>

        <View style={styles.settingRow}>
          <PixelText variant="label" style={styles.fieldLabel}>
            Notifications
          </PixelText>
          <Switch
            value={notificationEnabled}
            onValueChange={onChangeNotificationEnabled}
            trackColor={{ false: designTokens.color.switchTrack, true: designTokens.color.pink }}
          />
        </View>
        <PixelText variant="body" style={styles.listMeta}>
          {`Notification status: ${notificationEnabled ? "ON" : "OFF"}`}
        </PixelText>
      </PixelBox>

      <PixelText variant="sectionTitle" style={styles.sectionTitle}>
        Account Summary
      </PixelText>
      {connectionCount === 0 && cupidateCount === 0 && requestCount === 0 ? (
        <StateCard
          tone="empty"
          title="NO ACTIVITY YET"
          description="Start by registering cupidates and sending your first match request."
        />
      ) : (
        <View style={styles.summaryGrid}>
          <SummaryCard label="Connections" value={connectionCount} />
          <SummaryCard label="Cupidates" value={cupidateCount} />
          <SummaryCard label="Requests" value={requestCount} />
          <SummaryCard label="Visibility" value={privacyNetworkOnly ? "NET" : "PRIVATE"} />
        </View>
      )}
    </ScrollView>
  );
}
