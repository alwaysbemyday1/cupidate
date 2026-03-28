import { useState } from "react";
import { TextInput, View } from "react-native";

import { PixelBox } from "../components/PixelBox";
import { PixelButton } from "../components/PixelButton";
import { PixelText } from "../components/PixelText";
import { styles } from "../styles";
import { designTokens } from "../theme/tokens";

type AuthRequiredViewProps = {
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onSignInWithPassword: (email: string, password: string) => Promise<string>;
  onSignUpWithPassword: (email: string, password: string) => Promise<string>;
};

const emailPattern = /^\S+@\S+\.\S+$/;
const placeholderTextColor = designTokens.color.inkMuted;

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
      <PixelBox style={styles.gateCard} contentStyle={styles.gateCardContent}>
        <PixelText variant="screenTitle" style={styles.gateTitle}>
          AUTH REQUIRED
        </PixelText>
        <PixelText variant="body" style={styles.gateText}>
          This app is connected to Supabase. Sign in here to unlock Network and Matching data.
        </PixelText>

        <View style={styles.gateForm}>
          <PixelText variant="label" style={styles.fieldLabel}>
            Email
          </PixelText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
            editable={!isSubmitting}
          />

          <PixelText variant="label" style={styles.fieldLabel}>
            Password
          </PixelText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
            placeholder="at least 6 chars"
            placeholderTextColor={placeholderTextColor}
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
          <PixelButton label="Refresh Session" variant="secondary" onPress={() => void onRefresh()} />
        </View>

        {isLoading ? (
          <PixelText variant="body" style={styles.listMeta}>
            Checking session...
          </PixelText>
        ) : null}
        {actionMessage ? (
          <PixelText variant="body" style={styles.gateHint}>
            {actionMessage}
          </PixelText>
        ) : null}
        {error ? (
          <PixelText variant="body" style={styles.errorText}>
            {`Error: ${error}`}
          </PixelText>
        ) : null}
        {actionError ? (
          <PixelText variant="body" style={styles.errorText}>
            {`Auth: ${actionError}`}
          </PixelText>
        ) : null}
      </PixelBox>
    </View>
  );
}
