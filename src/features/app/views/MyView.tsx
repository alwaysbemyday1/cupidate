import { ScrollView, Switch, Text, TextInput, View } from "react-native";

import { PixelButton } from "../components/PixelButton";
import { StateCard } from "../components/StateCard";
import { styles } from "../styles";

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
  isMyLoading?: boolean;
  myError?: string | null;
  onRetryMyError?: () => void | Promise<void>;
};

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
  isMyLoading,
  myError,
  onRetryMyError
}: MyViewProps) {
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

      <Text style={styles.fieldLabel}>Nickname</Text>
      <TextInput value={myNickname} onChangeText={onChangeMyNickname} style={styles.input} />
      <PixelButton
        label={isSavingNickname ? "Saving..." : "Save Nickname"}
        variant="primary"
        onPress={onSaveMyNickname}
      />

      <View style={styles.settingRow}>
        <Text style={styles.fieldLabel}>Network-only profile visibility</Text>
        <Switch value={privacyNetworkOnly} onValueChange={onChangePrivacyNetworkOnly} />
      </View>
      <Text style={styles.listMeta}>Visibility: {privacyNetworkOnly ? "Network only" : "Private"}</Text>

      <View style={styles.settingRow}>
        <Text style={styles.fieldLabel}>Notifications</Text>
        <Switch value={notificationEnabled} onValueChange={onChangeNotificationEnabled} />
      </View>
      <Text style={styles.listMeta}>Notification status: {notificationEnabled ? "ON" : "OFF"}</Text>

      <Text style={styles.sectionTitle}>Account Summary</Text>
      {connectionCount === 0 && cupidateCount === 0 && requestCount === 0 ? (
        <StateCard
          tone="empty"
          title="NO ACTIVITY YET"
          description="Start by registering cupidates and sending your first match request."
        />
      ) : (
        <View style={styles.listCard}>
          <Text style={styles.listMeta}>Connected Cupids: {connectionCount}</Text>
          <Text style={styles.listMeta}>Registered Cupidates: {cupidateCount}</Text>
          <Text style={styles.listMeta}>Match Requests: {requestCount}</Text>
        </View>
      )}
    </ScrollView>
  );
}
