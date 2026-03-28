import { useState } from "react";
import { Text, TextInput, View } from "react-native";

import { PixelButton } from "../components/PixelButton";
import { styles } from "../styles";

type AuthRequiredViewProps = {
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onSignInWithPassword: (email: string, password: string) => Promise<string>;
  onSignUpWithPassword: (email: string, password: string) => Promise<string>;
};

const emailPattern = /^\S+@\S+\.\S+$/;

export function AuthRequiredView({
  isLoading,
  error,
  onRefresh,
  onSignInWithPassword,
  onSignUpWithPassword
}: AuthRequiredViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const runAuthAction = async (action: "signin" | "signup") => {
    if (isSubmitting || isLoading) {
      return;
    }

    const nextEmail = email.trim().toLowerCase();

    setActionMessage(null);
    setActionError(null);

    if (!emailPattern.test(nextEmail)) {
      setActionError("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setActionError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const message =
        action === "signin"
          ? await onSignInWithPassword(nextEmail, password)
          : await onSignUpWithPassword(nextEmail, password);

      setActionMessage(message);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : "Authentication request failed.";
      setActionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.centerPanel}>
      <View style={styles.gateCard}>
        <Text style={styles.gateTitle}>AUTH REQUIRED</Text>
        <Text style={styles.gateText}>
          This app is connected to Supabase. Sign in here to unlock Network and Matching data.
        </Text>

        <View style={styles.gateForm}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#7f8ca8"
            style={styles.input}
            editable={!isSubmitting}
          />

          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder="at least 6 chars"
            placeholderTextColor="#7f8ca8"
            style={styles.input}
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.buttonRow}>
          <PixelButton
            label={isSubmitting ? "Signing..." : "Sign In"}
            variant="primary"
            onPress={() => void runAuthAction("signin")}
          />
          <PixelButton
            label={isSubmitting ? "Working..." : "Create Account"}
            variant="success"
            onPress={() => void runAuthAction("signup")}
          />
        </View>

        <View style={styles.buttonRow}>
          <PixelButton label="Refresh Session" variant="neutral" onPress={() => void onRefresh()} />
        </View>

        {isLoading ? <Text style={styles.listMeta}>Checking session...</Text> : null}
        {actionMessage ? <Text style={styles.gateHint}>{actionMessage}</Text> : null}
        {error ? <Text style={styles.errorText}>Error: {error}</Text> : null}
        {actionError ? <Text style={styles.errorText}>Auth: {actionError}</Text> : null}
      </View>
    </View>
  );
}
