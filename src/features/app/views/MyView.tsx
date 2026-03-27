import { ScrollView, Switch, Text, TextInput, View } from "react-native";

import { styles } from "../styles";

type MyViewProps = {
  myNickname: string;
  onChangeMyNickname: (value: string) => void;
  privacyNetworkOnly: boolean;
  onChangePrivacyNetworkOnly: (value: boolean) => void;
  notificationEnabled: boolean;
  onChangeNotificationEnabled: (value: boolean) => void;
  connectionCount: number;
  cupidateCount: number;
  requestCount: number;
};

export function MyView({
  myNickname,
  onChangeMyNickname,
  privacyNetworkOnly,
  onChangePrivacyNetworkOnly,
  notificationEnabled,
  onChangeNotificationEnabled,
  connectionCount,
  cupidateCount,
  requestCount
}: MyViewProps) {
  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      <Text style={styles.fieldLabel}>Nickname</Text>
      <TextInput value={myNickname} onChangeText={onChangeMyNickname} style={styles.input} />

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
      <View style={styles.listCard}>
        <Text style={styles.listMeta}>Connected Cupids: {connectionCount}</Text>
        <Text style={styles.listMeta}>Registered Cupidates: {cupidateCount}</Text>
        <Text style={styles.listMeta}>Match Requests: {requestCount}</Text>
      </View>
    </ScrollView>
  );
}
