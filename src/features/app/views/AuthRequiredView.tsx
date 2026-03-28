import { Text, View } from "react-native";

import { PixelButton } from "../components/PixelButton";
import { styles } from "../styles";

type AuthRequiredViewProps = {
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
};

export function AuthRequiredView({ isLoading, error, onRefresh }: AuthRequiredViewProps) {
  return (
    <View style={styles.centerPanel}>
      <View style={styles.gateCard}>
        <Text style={styles.gateTitle}>AUTH REQUIRED</Text>
        <Text style={styles.gateText}>
          This app is connected to Supabase. Please sign in to access Network and Matching data.
        </Text>
        <Text style={styles.gateHint}>Sign-in can be completed through your configured auth flow.</Text>
        {error ? <Text style={styles.errorText}>Error: {error}</Text> : null}
        {isLoading ? (
          <Text style={styles.listMeta}>Checking session...</Text>
        ) : (
          <PixelButton label="Refresh Session" variant="primary" onPress={onRefresh} />
        )}
      </View>
    </View>
  );
}
